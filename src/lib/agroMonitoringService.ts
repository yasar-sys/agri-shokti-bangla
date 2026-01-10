/**
 * AgroMonitoring API Service
 * Production-ready service for fetching agricultural data from AgroMonitoring API
 * 
 * Features:
 * - Real-time polygon, weather, soil, NDVI, and satellite data
 * - Automatic retry on failure (1 retry)
 * - Short-term caching (5 minutes)
 * - User-friendly error messages in Bengali
 * - Rate limit handling
 */

import type {
    AgroPolygon,
    AgroWeather,
    AgroNDVIData,
    AgroSoilData,
    AgroSatelliteImage,
    CachedData,
} from '@/types/agroMonitoringTypes';

// ===================================
// CONFIGURATION (Hardcoded as requested)
// ===================================
const AGRO_API_KEY = '883142b44374ecc8a4db77ea67276305';
const AGRO_BASE_URL = 'https://api.agromonitoring.com/agro/1.0';

export const POLYGON_IDS = [
    '69614b3ae8a5760009397260',
    '696151c05a63918df3b2b0df',
    '6961521a2a38995f0d73aa47',
] as const;

// ===================================
// CACHING
// ===================================
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CachedData<any>>();

function getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (isExpired) {
        cache.delete(key);
        return null;
    }

    return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// ===================================
// ERROR HANDLING
// ===================================
export class AgroMonitoringError extends Error {
    constructor(
        message: string,
        public messageBn: string,
        public statusCode?: number,
        public originalError?: any
    ) {
        super(message);
        this.name = 'AgroMonitoringError';
    }
}

function handleError(error: any, context: string): never {
    console.error(`[AgroMonitoring] ${context}:`, error);

    if (error instanceof AgroMonitoringError) {
        throw error;
    }

    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
        throw new AgroMonitoringError(
            'Network error',
            'ইন্টারনেট সংযোগ ব্যর্থ। পরে আবার চেষ্টা করুন।',
            0,
            error
        );
    }

    // API errors
    if (error.cod || error.message) {
        throw new AgroMonitoringError(
            error.message || 'API error',
            'ডেটা লোড করতে ব্যর্থ। পরে আবার চেষ্টা করুন।',
            parseInt(error.cod) || 500,
            error
        );
    }

    // Unknown errors
    throw new AgroMonitoringError(
        'Unknown error',
        'একটি সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।',
        500,
        error
    );
}

// ===================================
// HTTP CLIENT WITH RETRY
// ===================================
async function fetchWithRetry<T>(
    url: string,
    retries = 1
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    cod: response.status.toString(),
                    message: errorData.message || response.statusText,
                };
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            lastError = error;

            // Don't retry on 4xx errors (client errors)
            if (error.cod && error.cod.startsWith('4')) {
                break;
            }

            // Wait before retry (exponential backoff)
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    throw lastError;
}

// ===================================
// POLYGON API
// ===================================

/**
 * Fetch polygon metadata by ID
 */
export async function getPolygonById(polygonId: string): Promise<AgroPolygon> {
    const cacheKey = `polygon_${polygonId}`;
    const cached = getCached<AgroPolygon>(cacheKey);
    if (cached) return cached;

    try {
        const url = `${AGRO_BASE_URL}/polygons/${polygonId}?appid=${AGRO_API_KEY}`;
        const data = await fetchWithRetry<AgroPolygon>(url);

        setCache(cacheKey, data);
        return data;
    } catch (error) {
        handleError(error, `getPolygonById(${polygonId})`);
    }
}

/**
 * Fetch all configured polygons
 */
export async function getAllPolygons(): Promise<AgroPolygon[]> {
    const cacheKey = 'all_polygons';
    const cached = getCached<AgroPolygon[]>(cacheKey);
    if (cached) return cached;

    try {
        // Fetch all polygons in parallel
        const promises = POLYGON_IDS.map(id => getPolygonById(id));
        const results = await Promise.allSettled(promises);

        // Extract successful results
        const polygons = results
            .filter((result): result is PromiseFulfilledResult<AgroPolygon> =>
                result.status === 'fulfilled'
            )
            .map(result => result.value);

        // Log failures but don't throw (graceful degradation)
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`[AgroMonitoring] Failed to load polygon ${POLYGON_IDS[index]}:`, result.reason);
            }
        });

        if (polygons.length === 0) {
            throw new AgroMonitoringError(
                'No polygons loaded',
                'কোনো পলিগন লোড করা যায়নি। পরে আবার চেষ্টা করুন।',
                500
            );
        }

        setCache(cacheKey, polygons);
        return polygons;
    } catch (error) {
        handleError(error, 'getAllPolygons');
    }
}

// ===================================
// WEATHER API
// ===================================

/**
 * Fetch current weather for a polygon
 */
export async function getPolygonWeather(polygonId: string): Promise<AgroWeather> {
    const cacheKey = `weather_${polygonId}`;
    const cached = getCached<AgroWeather>(cacheKey);
    if (cached) return cached;

    try {
        const url = `${AGRO_BASE_URL}/weather?polyid=${polygonId}&appid=${AGRO_API_KEY}`;
        const data = await fetchWithRetry<AgroWeather>(url);

        setCache(cacheKey, data);
        return data;
    } catch (error) {
        handleError(error, `getPolygonWeather(${polygonId})`);
    }
}

// ===================================
// SOIL API
// ===================================

/**
 * Fetch soil data for a polygon
 */
export async function getPolygonSoil(polygonId: string): Promise<AgroSoilData> {
    const cacheKey = `soil_${polygonId}`;
    const cached = getCached<AgroSoilData>(cacheKey);
    if (cached) return cached;

    try {
        const url = `${AGRO_BASE_URL}/soil?polyid=${polygonId}&appid=${AGRO_API_KEY}`;
        const data = await fetchWithRetry<AgroSoilData>(url);

        setCache(cacheKey, data);
        return data;
    } catch (error) {
        handleError(error, `getPolygonSoil(${polygonId})`);
    }
}

// ===================================
// NDVI API
// ===================================

/**
 * Fetch NDVI data for a polygon
 * Returns the most recent NDVI data
 */
export async function getPolygonNDVI(polygonId: string): Promise<AgroNDVIData | null> {
    const cacheKey = `ndvi_${polygonId}`;
    const cached = getCached<AgroNDVIData | null>(cacheKey);
    if (cached !== null) return cached;

    try {
        // Get NDVI history and return the most recent
        const url = `${AGRO_BASE_URL}/image/search?start=${Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60}&end=${Math.floor(Date.now() / 1000)}&polyid=${polygonId}&appid=${AGRO_API_KEY}`;
        const images = await fetchWithRetry<AgroSatelliteImage[]>(url);

        if (!images || images.length === 0) {
            setCache(cacheKey, null);
            return null;
        }

        // Get the most recent image with NDVI data
        const recentImage = images
            .filter(img => img.stats?.ndvi !== undefined)
            .sort((a, b) => b.dt - a.dt)[0];

        if (!recentImage) {
            setCache(cacheKey, null);
            return null;
        }

        // Convert to NDVI data format
        const ndviData: AgroNDVIData = {
            dt: recentImage.dt,
            source: recentImage.type,
            zoom: 0,
            dc: recentImage.dc,
            cl: recentImage.cl,
            data: {
                mean: recentImage.stats.ndvi || 0,
                std: 0,
                p25: 0,
                num: 0,
                p75: 0,
                min: 0,
                max: 0,
                median: recentImage.stats.ndvi || 0,
            },
            image: recentImage.image?.ndvi,
        };

        setCache(cacheKey, ndviData);
        return ndviData;
    } catch (error) {
        // NDVI might not be available for all polygons - return null instead of throwing
        console.warn(`[AgroMonitoring] NDVI not available for polygon ${polygonId}:`, error);
        setCache(cacheKey, null);
        return null;
    }
}

// ===================================
// SATELLITE IMAGERY API
// ===================================

/**
 * Fetch satellite imagery for a polygon
 * Returns the most recent satellite image
 */
export async function getPolygonSatellite(
    polygonId: string,
    startDate?: Date,
    endDate?: Date
): Promise<AgroSatelliteImage[]> {
    const start = startDate ? Math.floor(startDate.getTime() / 1000) : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const end = endDate ? Math.floor(endDate.getTime() / 1000) : Math.floor(Date.now() / 1000);

    const cacheKey = `satellite_${polygonId}_${start}_${end}`;
    const cached = getCached<AgroSatelliteImage[]>(cacheKey);
    if (cached) return cached;

    try {
        const url = `${AGRO_BASE_URL}/image/search?start=${start}&end=${end}&polyid=${polygonId}&appid=${AGRO_API_KEY}`;
        const data = await fetchWithRetry<AgroSatelliteImage[]>(url);

        setCache(cacheKey, data || []);
        return data || [];
    } catch (error) {
        handleError(error, `getPolygonSatellite(${polygonId})`);
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Convert Kelvin to Celsius
 */
export function kelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
}

/**
 * Get polygon center in [lat, lng] format (Leaflet format)
 */
export function getPolygonCenter(polygon: AgroPolygon): [number, number] {
    // AgroMonitoring returns center as [lng, lat], we need [lat, lng]
    return [polygon.center[1], polygon.center[0]];
}

/**
 * Calculate bounds for all polygons
 */
export function calculateBounds(polygons: AgroPolygon[]): [[number, number], [number, number]] | null {
    if (polygons.length === 0) return null;

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    polygons.forEach(polygon => {
        const coords = polygon.geo_json.geometry.coordinates[0];
        coords.forEach(([lng, lat]) => {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        });
    });

    return [[minLat, minLng], [maxLat, maxLng]];
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
    cache.clear();
}
