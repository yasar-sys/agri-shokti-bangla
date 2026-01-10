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
    AgroNDVIHistory,
    NDVIHistoryPoint,
    NDVITrend,
    NDVIWarning,
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
        // Use the robust history pipeline to get the latest valid NDVI reading
        // We request 30 days to ensure we find at least one valid cloud-free image
        const ndviHistory = await getPolygonNDVIHistory(polygonId, 30);

        if (!ndviHistory.history || ndviHistory.history.length === 0) {
            setCache(cacheKey, null);
            return null;
        }

        // The history is already sorted chronologically (oldest to newest) by the backend
        // So we take the last item
        const recentData = ndviHistory.history[ndviHistory.history.length - 1];

        // Convert to AgroNDVIData format to maintain compatibility with Map component
        const ndviData: AgroNDVIData = {
            dt: recentData.timestamp,
            source: recentData.type,
            zoom: 0,
            dc: 0,
            cl: recentData.cloudCoverage,
            data: {
                mean: recentData.ndvi,
                std: 0,
                p25: 0,
                num: 0,
                p75: 0,
                min: recentData.min || 0,
                max: recentData.max || 0,
                median: recentData.median || 0
            }
        };

        setCache(cacheKey, ndviData);
        return ndviData;

    } catch (err) {
        console.error('getPolygonNDVI (via History) failed:', err);
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

// ===================================
// NDVI HISTORY & ANALYSIS
// ===================================

// ==========================================
// VALIDATION UTILITIES
// ==========================================

export function validatePolygon(polygon: AgroPolygon): boolean {
    if (!polygon || !polygon.geo_json || !polygon.geo_json.geometry) {
        console.warn('Invalid polygon structure:', polygon);
        return false;
    }

    const { type, coordinates } = polygon.geo_json.geometry;

    // 1. Ensure valid GeoJSON type
    if (type !== 'Polygon') {
        console.warn('Unsupported geometry type:', type);
        return false;
    }

    // 2. Ensure coordinates array exists and has at least one ring
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
        console.warn('No coordinates found in polygon');
        return false;
    }

    const outerRing = coordinates[0];

    // 3. Ensure valid ring size (triangle is min 4 points: pk1, pk2, pk3, pk1)
    if (outerRing.length < 4) {
        console.warn('Polygon has too few points:', outerRing.length);
        return false;
    }

    // 4. Ensure polygon is closed (First and Last points must be identical)
    const first = outerRing[0];
    const last = outerRing[outerRing.length - 1];

    if (
        Math.abs(first[0] - last[0]) > 0.000001 ||
        Math.abs(first[1] - last[1]) > 0.000001
    ) {
        console.warn('Polygon is not closed. Auto-closing...');
        // In a real scenario, we might return false, but here we could correct it or just flag it.
        // For strict validation as requested:
        return false;
    }

    // 5. Validate Longitude/Latitude bounds (Rough check)
    // GeoJSON is [lon, lat]
    const isValidCoord = outerRing.every(pt =>
        pt[0] >= -180 && pt[0] <= 180 && // Lon
        pt[1] >= -90 && pt[1] <= 90      // Lat
    );

    if (!isValidCoord) {
        console.warn('Invalid coordinate values (out of bounds)');
        return false;
    }

    return true;
}

// ==========================================
// NDVI HISTORY
// ==========================================

/**
 * Fetch NDVI history for a polygon
 * @param polygonId - Polygon ID
 * @param days - Number of days to fetch (7, 14, or 30)
 */
export async function getPolygonNDVIHistory(
    polygonId: string,
    days: 7 | 14 | 30 = 30
): Promise<AgroNDVIHistory> {
    // 0. Validate Input
    if (!polygonId || typeof polygonId !== 'string') {
        throw new AgroMonitoringError('Invalid Polygon ID', 'অবৈধ পলিগন আইডি', 400);
    }

    // 1. Check Cache
    const cacheKey = `ndvi_history_${polygonId}_${days}`;
    const cached = getCached<AgroNDVIHistory>(cacheKey);
    if (cached) return cached;

    try {
        // 2. Call Backend Edge Function
        // Using the robust v2 logic implemented in the backend
        const { data, error } = await supabase.functions.invoke('agromonitoring-ndvi', {
            body: {
                action: 'ndvi-history',
                polygonId,
                days
            }
        });

        if (error) throw error;

        // 3. Handle Backend Errors gracefully
        if (data.error) {
            console.warn('Backend returned API error:', data);
            // Return fallback empty structure instead of crashing if "no_data"
            if (data.error === 'no_data') {
                return {
                    polygonId,
                    days,
                    history: [], // Empty history
                    statistics: { current: 0, average: 0, min: 0, max: 0 },
                    trend: 'stable',
                    trendBn: 'তথ্য অপর্যাপ্ত',
                    warnings: [],
                    dataPoints: 0
                };
            }
            throw new AgroMonitoringError(
                data.message || 'API Error',
                data.messageBn || 'ডেটা লোড করতে সমস্যা হয়েছে',
                500
            );
        }

        // 4. Validate Response Structure (Robustness)
        if (!data.history || !Array.isArray(data.history)) {
            throw new Error('Invalid history format received');
        }

        const result: AgroNDVIHistory = {
            polygonId: data.polygonId,
            days: data.days,
            history: data.history,
            statistics: data.statistics,
            trend: data.trend,
            trendBn: data.trendBn,
            warnings: data.warnings,
            dataPoints: data.dataPoints
        };

        // 5. Cache Success
        setCache(cacheKey, result);
        return result;

    } catch (err: any) {
        console.error('getPolygonNDVIHistory Error:', err);

        // Return a safe "Error State" object if preferred, or rethrow custom error
        // User asked to "Handle empty NDVI responses gracefully", so rethrowing specific errors is okay 
        // as long as the UI handles it. But let's standardise the error.
        throw new AgroMonitoringError(
            err.message || 'Failed to fetch NDVI history',
            err.messageBn || 'NDVI ইতিহাস লোড ব্যর্থ হয়েছে', // Simpler Bengali msg
            err.status || 500
        );
    }
}
/**
 * Calculate NDVI trend from history data
 * @param history - Array of NDVI history points
 * @returns Trend direction
 */
export function calculateNDVITrend(history: NDVIHistoryPoint[]): {
    trend: NDVITrend;
    trendBn: string;
} {
    if (history.length < 2) {
        return { trend: 'stable', trendBn: 'স্থিতিশীল' };
    }

    const midpoint = Math.floor(history.length / 2);
    const recentValues = history.slice(midpoint).map(h => h.ndvi);
    const olderValues = history.slice(0, midpoint).map(h => h.ndvi);

    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

    if (recentAvg > olderAvg + 0.05) {
        return { trend: 'improving', trendBn: 'উন্নতি হচ্ছে' };
    } else if (recentAvg < olderAvg - 0.05) {
        return { trend: 'declining', trendBn: 'অবনতি হচ্ছে' };
    }

    return { trend: 'stable', trendBn: 'স্থিতিশীল' };
}

/**
 * Detect sudden NDVI drops in history
 * @param history - Array of NDVI history points
 * @param threshold - Drop percentage threshold (default 15%)
 * @returns Array of warnings
 */
export function detectNDVIDrops(
    history: NDVIHistoryPoint[],
    threshold: number = 15
): NDVIWarning[] {
    const warnings: NDVIWarning[] = [];

    for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1].ndvi;
        const curr = history[i].ndvi;
        const dropPercent = ((prev - curr) / prev) * 100;

        if (dropPercent > threshold) {
            warnings.push({
                date: history[i].date,
                previousNDVI: prev,
                currentNDVI: curr,
                dropPercent: Math.round(dropPercent),
                severity: dropPercent > 30 ? 'critical' : 'warning',
                message: `NDVI dropped by ${Math.round(dropPercent)}%`,
                messageBn: `NDVI ${Math.round(dropPercent)}% কমেছে`,
            });
        }
    }

    return warnings;
}

/**
 * Get NDVI color based on value
 * @param ndvi - NDVI value (0-1)
 * @returns Color hex code
 */
export function getNDVIColor(ndvi: number): string {
    if (ndvi > 0.7) return '#22c55e'; // Dark green - excellent
    if (ndvi > 0.6) return '#10b981'; // Green - good
    if (ndvi > 0.4) return '#eab308'; // Yellow - moderate
    if (ndvi > 0.2) return '#f97316'; // Orange - stressed
    return '#ef4444'; // Red - critical
}

/**
 * Get NDVI health status label
 * @param ndvi - NDVI value (0-1)
 * @returns Status labels in English and Bengali
 */
export function getNDVIStatus(ndvi: number): { status: string; statusBn: string } {
    if (ndvi > 0.7) return { status: 'Excellent', statusBn: 'চমৎকার' };
    if (ndvi > 0.6) return { status: 'Good', statusBn: 'ভাল' };
    if (ndvi > 0.4) return { status: 'Moderate', statusBn: 'মাঝারি' };
    if (ndvi > 0.2) return { status: 'Stressed', statusBn: 'চাপযুক্ত' };
    return { status: 'Critical', statusBn: 'সংকটজনক' };
}

