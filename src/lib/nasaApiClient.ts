import { supabase } from '@/integrations/supabase/client';

interface APIHealthStatus {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastCheck: number;
  errorRate: number;
  consecutiveFailures: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeout: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeout: 15000,
};

class NASAAPIClient {
  private healthStatus: Map<string, APIHealthStatus> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();
  private circuitBreaker: Map<string, { isOpen: boolean; openedAt: number }> = new Map();
  
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000;
  private readonly HEALTH_CHECK_INTERVAL = 30000;

  constructor() {
    this.startHealthMonitoring();
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.checkCircuitBreakers();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private checkCircuitBreakers(): void {
    const now = Date.now();
    
    this.circuitBreaker.forEach((breaker, endpoint) => {
      if (breaker.isOpen && now - breaker.openedAt > this.CIRCUIT_BREAKER_TIMEOUT) {
        console.log(`Circuit breaker reset for ${endpoint}`);
        breaker.isOpen = false;
        
        const health = this.healthStatus.get(endpoint);
        if (health) {
          health.consecutiveFailures = 0;
          health.status = 'degraded';
        }
      }
    });
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    endpoint: string,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    const breaker = this.circuitBreaker.get(endpoint);
    if (breaker?.isOpen) {
      throw new Error(`Circuit breaker open for ${endpoint}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), config.timeout)
          ),
        ]);

        const latency = Date.now() - startTime;
        this.recordSuccess(endpoint, latency);
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        this.recordFailure(endpoint);

        if (attempt < config.maxRetries - 1) {
          const delay = Math.min(
            config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
            config.maxDelay
          );
          
          console.log(`Retry attempt ${attempt + 1} for ${endpoint} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private recordSuccess(endpoint: string, latency: number): void {
    const health = this.healthStatus.get(endpoint) || this.createHealthStatus(endpoint);
    
    health.latency = latency;
    health.lastCheck = Date.now();
    health.consecutiveFailures = 0;
    health.errorRate = Math.max(0, health.errorRate - 0.1);
    health.status = latency < 2000 ? 'healthy' : 'degraded';
    
    this.healthStatus.set(endpoint, health);
  }

  private recordFailure(endpoint: string): void {
    const health = this.healthStatus.get(endpoint) || this.createHealthStatus(endpoint);
    
    health.consecutiveFailures++;
    health.errorRate = Math.min(1, health.errorRate + 0.2);
    health.lastCheck = Date.now();
    
    if (health.consecutiveFailures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      console.warn(`Opening circuit breaker for ${endpoint}`);
      this.circuitBreaker.set(endpoint, {
        isOpen: true,
        openedAt: Date.now(),
      });
      health.status = 'down';
    } else {
      health.status = health.errorRate > 0.5 ? 'degraded' : 'healthy';
    }
    
    this.healthStatus.set(endpoint, health);
  }

  private createHealthStatus(endpoint: string): APIHealthStatus {
    return {
      endpoint,
      status: 'healthy',
      latency: 0,
      lastCheck: Date.now(),
      errorRate: 0,
      consecutiveFailures: 0,
    };
  }

  private deduplicateRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.requestQueue.get(key);
    if (existing) {
      return existing;
    }

    const promise = fn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  async getNDVIHistory(
    fieldZoneId?: string,
    days: number = 90
  ): Promise<any> {
    const cacheKey = `ndvi_history_${fieldZoneId}_${days}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      const cached = this.getCachedData(cacheKey, 5 * 60 * 1000);
      if (cached) return cached;

      const data = await this.executeWithRetry(
        async () => {
          const { data, error } = await supabase.functions.invoke('nasa-ndvi', {
            body: {
              action: 'get_ndvi_history',
              fieldZoneId,
              days,
            },
          });

          if (error) throw error;
          if (!data.success) throw new Error(data.error);

          return data;
        },
        'nasa-ndvi',
        DEFAULT_RETRY_CONFIG
      );

      this.setCachedData(cacheKey, data, 5 * 60 * 1000);
      return data;
    });
  }

  async getAllZonesHistory(
    userId: string,
    days: number = 60
  ): Promise<any> {
    const cacheKey = `all_zones_history_${userId}_${days}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      const cached = this.getCachedData(cacheKey, 3 * 60 * 1000);
      if (cached) return cached;

      const data = await this.executeWithRetry(
        async () => {
          const { data, error } = await supabase.functions.invoke('nasa-ndvi', {
            body: {
              action: 'get_all_zones_history',
              userId,
              days,
            },
          });

          if (error) throw error;
          if (!data.success) throw new Error(data.error);

          return data;
        },
        'nasa-ndvi',
        { ...DEFAULT_RETRY_CONFIG, timeout: 30000 }
      );

      this.setCachedData(cacheKey, data, 3 * 60 * 1000);
      return data;
    });
  }

  async analyzeImagery(
    latitude: number,
    longitude: number
  ): Promise<any> {
    const cacheKey = `imagery_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      const cached = this.getCachedData(cacheKey, 10 * 60 * 1000);
      if (cached) return cached;

      const data = await this.executeWithRetry(
        async () => {
          const { data, error } = await supabase.functions.invoke('nasa-ndvi', {
            body: {
              action: 'analyze_imagery',
              latitude,
              longitude,
            },
          });

          if (error) throw error;
          if (!data.success) throw new Error(data.error);

          return data;
        },
        'nasa-ndvi',
        { ...DEFAULT_RETRY_CONFIG, timeout: 20000 }
      );

      this.setCachedData(cacheKey, data, 10 * 60 * 1000);
      return data;
    });
  }

  async getSatelliteTiles(
    latitude: number,
    longitude: number
  ): Promise<any> {
    const cacheKey = `tiles_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      const cached = this.getCachedData(cacheKey, 24 * 60 * 60 * 1000);
      if (cached) return cached;

      const data = await this.executeWithRetry(
        async () => {
          const { data, error } = await supabase.functions.invoke('nasa-ndvi', {
            body: {
              action: 'get_satellite_tiles',
              latitude,
              longitude,
            },
          });

          if (error) throw error;
          if (!data.success) throw new Error(data.error);

          return data;
        },
        'nasa-ndvi',
        DEFAULT_RETRY_CONFIG
      );

      this.setCachedData(cacheKey, data, 24 * 60 * 60 * 1000);
      return data;
    });
  }

  private getCachedData(key: string, maxAge: number): any | null {
    try {
      const cached = sessionStorage.getItem(`nasa_cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp > maxAge) {
        sessionStorage.removeItem(`nasa_cache_${key}`);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private setCachedData(key: string, data: any, maxAge: number): void {
    try {
      sessionStorage.setItem(
        `nasa_cache_${key}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  getHealthStatus(): Map<string, APIHealthStatus> {
    return this.healthStatus;
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'down' {
    if (this.healthStatus.size === 0) return 'healthy';

    const statuses = Array.from(this.healthStatus.values());
    const downCount = statuses.filter(s => s.status === 'down').length;
    const degradedCount = statuses.filter(s => s.status === 'degraded').length;

    if (downCount > statuses.length / 2) return 'down';
    if (degradedCount > 0 || downCount > 0) return 'degraded';
    return 'healthy';
  }

  clearCache(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('nasa_cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

export const nasaApiClient = new NASAAPIClient();
