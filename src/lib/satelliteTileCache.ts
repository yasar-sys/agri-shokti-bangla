import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TileCacheDB extends DBSchema {
  tiles: {
    key: string;
    value: {
      url: string;
      blob: Blob;
      timestamp: number;
      layer: string;
      date: string;
    };
  };
  metadata: {
    key: string;
    value: {
      totalSize: number;
      lastCleanup: number;
    };
  };
}

const DB_NAME = 'satellite-tile-cache';
const DB_VERSION = 1;
const MAX_CACHE_SIZE_MB = 100;
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

class SatelliteTileCache {
  private db: IDBPDatabase<TileCacheDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    
    if (!this.initPromise) {
      this.initPromise = this.initDB();
    }
    
    return this.initPromise;
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB<TileCacheDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('tiles')) {
            const tileStore = db.createObjectStore('tiles', { keyPath: 'url' });
            tileStore.createIndex('timestamp', 'timestamp');
            tileStore.createIndex('layer', 'layer');
          }
          
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata');
          }
        },
      });

      await this.cleanupIfNeeded();
    } catch (error) {
      console.error('Failed to initialize tile cache:', error);
    }
  }

  private async cleanupIfNeeded(): Promise<void> {
    if (!this.db) return;

    try {
      const metadata = await this.db.get('metadata', 'info');
      const now = Date.now();

      if (!metadata || now - metadata.lastCleanup > CLEANUP_INTERVAL_MS) {
        await this.cleanup();
        await this.db.put('metadata', { totalSize: 0, lastCleanup: now }, 'info');
      }
    } catch (error) {
      console.error('Cleanup check failed:', error);
    }
  }

  private async cleanup(): Promise<void> {
    if (!this.db) return;

    const now = Date.now();
    const cutoffTime = now - MAX_CACHE_AGE_MS;

    try {
      const tx = this.db.transaction('tiles', 'readwrite');
      const index = tx.store.index('timestamp');
      
      let cursor = await index.openCursor();
      
      while (cursor) {
        if (cursor.value.timestamp < cutoffTime) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }

      await tx.done;
      
      await this.enforceSizeLimit();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  private async enforceSizeLimit(): Promise<void> {
    if (!this.db) return;

    try {
      const allTiles = await this.db.getAll('tiles');
      let totalSize = allTiles.reduce((sum, tile) => sum + tile.blob.size, 0);
      
      const maxSizeBytes = MAX_CACHE_SIZE_MB * 1024 * 1024;
      
      if (totalSize > maxSizeBytes) {
        allTiles.sort((a, b) => a.timestamp - b.timestamp);
        
        const tx = this.db.transaction('tiles', 'readwrite');
        
        for (const tile of allTiles) {
          if (totalSize <= maxSizeBytes * 0.8) break;
          
          await tx.store.delete(tile.url);
          totalSize -= tile.blob.size;
        }
        
        await tx.done;
      }

      await this.db.put('metadata', { totalSize, lastCleanup: Date.now() }, 'info');
    } catch (error) {
      console.error('Size limit enforcement failed:', error);
    }
  }

  async getTile(url: string): Promise<Blob | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const cached = await this.db.get('tiles', url);
      
      if (!cached) return null;

      if (Date.now() - cached.timestamp > MAX_CACHE_AGE_MS) {
        await this.db.delete('tiles', url);
        return null;
      }

      return cached.blob;
    } catch (error) {
      console.error('Failed to get tile from cache:', error);
      return null;
    }
  }

  async cacheTile(url: string, blob: Blob, layer: string, date: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.put('tiles', {
        url,
        blob,
        timestamp: Date.now(),
        layer,
        date,
      });

      await this.enforceSizeLimit();
    } catch (error) {
      console.error('Failed to cache tile:', error);
    }
  }

  async prefetchTiles(urls: string[], layer: string, date: string): Promise<void> {
    await this.init();
    
    const fetchPromises = urls.map(async (url) => {
      const cached = await this.getTile(url);
      if (cached) return;

      try {
        const response = await fetch(url);
        if (!response.ok) return;

        const blob = await response.blob();
        await this.cacheTile(url, blob, layer, date);
      } catch (error) {
        console.error(`Failed to prefetch tile ${url}:`, error);
      }
    });

    await Promise.allSettled(fetchPromises);
  }

  async clearCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.clear('tiles');
      await this.db.put('metadata', { totalSize: 0, lastCleanup: Date.now() }, 'info');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheStats(): Promise<{ count: number; size: number; sizeMB: number }> {
    await this.init();
    if (!this.db) return { count: 0, size: 0, sizeMB: 0 };

    try {
      const allTiles = await this.db.getAll('tiles');
      const size = allTiles.reduce((sum, tile) => sum + tile.blob.size, 0);
      
      return {
        count: allTiles.length,
        size,
        sizeMB: Number((size / (1024 * 1024)).toFixed(2)),
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { count: 0, size: 0, sizeMB: 0 };
    }
  }
}

export const satelliteTileCache = new SatelliteTileCache();

export async function fetchTileWithCache(
  url: string,
  layer: string,
  date: string,
  options: RequestInit = {}
): Promise<Blob | null> {
  const cached = await satelliteTileCache.getTile(url);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(url, options);
    if (!response.ok) return null;

    const blob = await response.blob();
    
    satelliteTileCache.cacheTile(url, blob, layer, date);
    
    return blob;
  } catch (error) {
    console.error(`Failed to fetch tile ${url}:`, error);
    return null;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok || response.status === 404) {
        return response;
      }

      if (response.status >= 500 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export function getAdjacentTileCoords(
  z: number,
  x: number,
  y: number,
  radius: number = 1
): Array<{ z: number; x: number; y: number }> {
  const coords: Array<{ z: number; x: number; y: number }> = [];
  
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;
      coords.push({ z, x: x + dx, y: y + dy });
    }
  }
  
  return coords;
}
