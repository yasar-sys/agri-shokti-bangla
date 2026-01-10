/**
 * AgroMonitoring NDVI Edge Function
 * 
 * Fetches real-time NDVI satellite data from AgroMonitoring API
 * for pre-defined polygon field boundaries.
 * 
 * NDVI (Normalized Difference Vegetation Index) ranges:
 * - 0.8 to 1.0: Dense healthy vegetation (dark green)
 * - 0.5 to 0.8: Healthy vegetation (green)
 * - 0.2 to 0.5: Moderate vegetation (yellow-green)
 * - 0.0 to 0.2: Sparse vegetation (brown/tan)
 * - -1.0 to 0.0: Water, snow, clouds, bare soil (blue/gray)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-defined polygon IDs from AgroMonitoring account
const POLYGON_IDS = {
  'iowa-demo': '69614b3ae8a5760009397260',
  'samin-sunny': '696151c05a63918df3b2b0df',
  'samin-yasar': '6961521a2a38995f0d73aa47',
} as const;

// AgroMonitoring API endpoints
const AGRO_API = {
  BASE_URL: 'https://api.agromonitoring.com/agro/1.0',
  TILE_URL: 'https://api.agromonitoring.com/tile/1.0',
};

interface PolygonInfo {
  id: string;
  name: string;
  geo_json: {
    type: string;
    coordinates: number[][][];
  };
  center: [number, number];
  area: number;
  user_id: string;
  created_at: number;
}

interface NDVIStats {
  std: number;
  p75: number;
  min: number;
  max: number;
  median: number;
  p25: number;
  num: number;
  mean: number;
}

interface SatelliteImage {
  dt: number;
  type: string;
  dc: number;
  cl: number;
  sun: { azimuth: number; elevation: number };
  image: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
  };
  tile: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
  };
  stats: {
    ndvi: string;
    evi: string;
  };
  data: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
  };
}

// In-memory cache with TTL (5 minutes)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    console.log(`[Cache HIT] ${key}`);
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  console.log(`[Cache SET] ${key}`);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AGRO_API_KEY = Deno.env.get('AGROMONITORING_API_KEY');

    if (!AGRO_API_KEY) {
      console.error('AGROMONITORING_API_KEY not configured');
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          message: 'AgroMonitoring API key is missing',
          polygons: Object.entries(POLYGON_IDS).map(([key, id]) => ({ key, id }))
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'ndvi';

    // Parse body for POST requests
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch (e) {
        // Ignore empty body or json parse error
      }
    }

    // Priority: Body > URL Params > Default
    const polygonKey = body.polygonId || url.searchParams.get('polygon') || 'iowa-demo';
    const polygonId = POLYGON_IDS[polygonKey as keyof typeof POLYGON_IDS] || polygonKey;

    console.log(`[AgroMonitoring] Action: ${action}, Polygon: ${polygonKey} (${polygonId})`);

    switch (action) {
      case 'polygons': {
        // Return list of available polygons
        return new Response(
          JSON.stringify({
            polygons: Object.entries(POLYGON_IDS).map(([key, id]) => ({
              key,
              id,
              name: key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            }))
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'polygon-info': {
        // Get polygon geometry and info
        const cacheKey = `polygon-info-${polygonId}`;
        const cached = getCachedData(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const response = await fetch(
          `${AGRO_API.BASE_URL}/polygons/${polygonId}?appid=${AGRO_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Polygon fetch failed: ${response.status}`);
        }

        const polygonInfo: PolygonInfo = await response.json();

        const result = {
          id: polygonInfo.id,
          name: polygonInfo.name,
          geoJson: polygonInfo.geo_json,
          center: polygonInfo.center,
          area: polygonInfo.area,
          createdAt: new Date(polygonInfo.created_at * 1000).toISOString()
        };

        setCachedData(cacheKey, result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'ndvi': {
        // Get latest NDVI satellite imagery for polygon
        const cacheKey = `ndvi-${polygonId}`;
        const cached = getCachedData(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get satellite images for the last 30 days
        const end = Math.floor(Date.now() / 1000);
        const start = end - (30 * 24 * 60 * 60); // 30 days ago

        const response = await fetch(
          `${AGRO_API.BASE_URL}/image/search?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Satellite image search failed: ${response.status}`, errorText);
          throw new Error(`Satellite image search failed: ${response.status}`);
        }

        const images: SatelliteImage[] = await response.json();

        if (!images || images.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'no_images',
              message: 'No satellite images available for this period',
              messageBn: 'এই সময়ের জন্য কোনো স্যাটেলাইট ছবি পাওয়া যায়নি',
              polygonId,
              period: { start: new Date(start * 1000).toISOString(), end: new Date(end * 1000).toISOString() }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          );
        }

        // Get the most recent image with good cloud coverage (<50%)
        const goodImages = images.filter(img => img.cl < 50).sort((a, b) => b.dt - a.dt);
        const latestImage = goodImages[0] || images[images.length - 1];

        // Fetch NDVI statistics for the latest image
        let ndviStats: NDVIStats | null = null;
        if (latestImage.stats?.ndvi) {
          try {
            const statsResponse = await fetch(latestImage.stats.ndvi);
            if (statsResponse.ok) {
              ndviStats = await statsResponse.json();
            }
          } catch (e) {
            console.warn('Failed to fetch NDVI stats:', e);
          }
        }

        const result = {
          polygonId,
          latestImage: {
            date: new Date(latestImage.dt * 1000).toISOString(),
            cloudCoverage: latestImage.cl,
            type: latestImage.type,
            sun: latestImage.sun,
            images: {
              trueColor: latestImage.image.truecolor,
              falseColor: latestImage.image.falsecolor,
              ndvi: latestImage.image.ndvi,
              evi: latestImage.image.evi
            },
            tiles: {
              trueColor: latestImage.tile.truecolor,
              falseColor: latestImage.tile.falsecolor,
              ndvi: latestImage.tile.ndvi,
              evi: latestImage.tile.evi
            }
          },
          ndviStats: ndviStats ? {
            mean: ndviStats.mean,
            min: ndviStats.min,
            max: ndviStats.max,
            median: ndviStats.median,
            std: ndviStats.std
          } : null,
          history: images.slice(0, 10).map(img => ({
            date: new Date(img.dt * 1000).toISOString(),
            cloudCoverage: img.cl,
            ndviTile: img.tile.ndvi
          })),
          totalImages: images.length
        };

        setCachedData(cacheKey, result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'ndvi-history': {
        // Read params from body (Supported: days OR strict start/end)
        const days = body.days ? parseInt(body.days) : 30;

        if (!polygonId) {
          throw new Error('Polygon ID is required');
        }

        // User explicit request: support start/end timestamps from body
        let end = body.end ? parseInt(body.end) : Math.floor(Date.now() / 1000);
        let start = body.start ? parseInt(body.start) : end - (days * 24 * 60 * 60);

        // Basic sanity check: ensure start < end
        if (start >= end) {
          start = end - (30 * 24 * 60 * 60);
        }

        const cacheKey = `ndvi-history-v3-${polygonId}-${days}-${start}-${end}`; // v3 cache key with range
        const cached = getCachedData(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const statsUrl = `${AGRO_API.BASE_URL}/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`;
        console.log(`Fetching NDVI stats: ${statsUrl.replace(AGRO_API_KEY, 'HIDDEN')}`);

        // Use the direct statistics endpoint - much faster and more accurate
        const response = await fetch(statsUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`NDVI history fetch failed: ${response.status}`, errorText);
          // Forward the specific error from AgroMonitoring
          throw new Error(`AgroMonitoring API Error (${response.status}): ${errorText}`);
        }

        const historyData: any[] = await response.json();

        if (!historyData || historyData.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'no_data',
              message: 'No NDVI data available for this period',
              messageBn: 'এই সময়ের জন্য কোনো NDVI ডেটা পাওয়া যায়নি',
              polygonId,
              days
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          );
        }

        // Process history data
        const processedHistory = historyData
          .sort((a, b) => a.dt - b.dt)
          .map(item => ({
            date: new Date(item.dt * 1000).toISOString().split('T')[0],
            timestamp: item.dt,
            ndvi: item.data.mean, // Use mean NDVI
            min: item.data.min,
            max: item.data.max,
            median: item.data.median,
            cloudCoverage: item.cl || 0, // Sometimes omitted in stats
            type: 'Sentinel-2' // Default assumption for stats
          }));

        // Calculate aggregate statistics
        const ndviValues = processedHistory.map(h => h.ndvi);
        const currentNDVI = ndviValues[ndviValues.length - 1];
        const avgNDVI = ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length;
        const minNDVI = Math.min(...ndviValues);
        const maxNDVI = Math.max(...ndviValues);

        // Trend Analysis
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        let trendBn = 'স্থিতিশীল';

        if (processedHistory.length >= 2) {
          const midpoint = Math.floor(processedHistory.length / 2);
          const recentAvg = ndviValues.slice(midpoint).reduce((a, b) => a + b, 0) / (ndviValues.length - midpoint);
          const olderAvg = ndviValues.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;

          if (recentAvg > olderAvg + 0.05) {
            trend = 'improving';
            trendBn = 'উন্নতি হচ্ছে';
          } else if (recentAvg < olderAvg - 0.05) {
            trend = 'declining';
            trendBn = 'অবনতি হচ্ছে';
          }
        }

        // Drop Detection
        const warnings = [];
        for (let i = 1; i < processedHistory.length; i++) {
          const prev = processedHistory[i - 1].ndvi;
          const curr = processedHistory[i].ndvi;
          const dropPercent = ((prev - curr) / prev) * 100;

          if (dropPercent > 10) { // Lowered threshold slightly
            warnings.push({
              date: processedHistory[i].date,
              previousNDVI: prev,
              currentNDVI: curr,
              dropPercent: Math.round(dropPercent),
              severity: dropPercent > 25 ? 'critical' : 'warning',
              message: `NDVI dropped by ${Math.round(dropPercent)}%`,
              messageBn: `NDVI ${Math.round(dropPercent)}% কমেছে`
            });
          }
        }

        const result = {
          polygonId,
          days,
          history: processedHistory,
          statistics: {
            current: currentNDVI,
            average: avgNDVI,
            min: minNDVI,
            max: maxNDVI
          },
          trend,
          trendBn,
          warnings,
          dataPoints: processedHistory.length
        };

        setCachedData(cacheKey, result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'tile': {
        // Proxy NDVI tile request to avoid CORS
        const z = url.searchParams.get('z');
        const x = url.searchParams.get('x');
        const y = url.searchParams.get('y');
        const tileUrl = url.searchParams.get('url');

        if (tileUrl) {
          // Proxy existing tile URL
          const tileResponse = await fetch(tileUrl);
          if (!tileResponse.ok) {
            return new Response('Tile not found', { status: 404, headers: corsHeaders });
          }

          const tileData = await tileResponse.arrayBuffer();
          return new Response(tileData, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }

        return new Response(
          JSON.stringify({ error: 'Missing tile parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: 'Unknown action',
            availableActions: ['polygons', 'polygon-info', 'ndvi', 'ndvi-history', 'tile']
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('[AgroMonitoring Error]:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch data from AgroMonitoring API'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
