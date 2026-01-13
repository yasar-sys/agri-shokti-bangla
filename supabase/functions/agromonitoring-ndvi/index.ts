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

// নতুন ছোট পলিগন (ভালো NDVI ডেটার জন্য)
const POLYGON_IDS = {
  'iowa-demo': '69614b3ae8a5760009397260',        // Iowa Demo Field (202.98 ha)
  'maloti-port': '6965e9e35a63914783b2b110',      // Maloti Port Colony (7.47 ha)
  'mec': '6965ea2a3502733c8442f7fe',              // Mymensingh Engineering College (6.00 ha)
  'bau': '6965ea5c6f78d821dd84aeb1',              // BAU (78.92 ha)
  'bagharpara': '6965eac4a049de7f3a4b4081',       // Bagharpara (51.64 ha)
  'rangpur': '6965eafbd1895d6355badd8c',          // Rangpur (128.34 ha)
} as const;

// পলিগন মেটাডেটা
const POLYGON_METADATA: Record<string, { name: string; nameBn: string; center: [number, number]; area: number }> = {
  '69614b3ae8a5760009397260': { name: 'Iowa Demo Field', nameBn: 'আইওয়া ডেমো ফিল্ড', center: [-93.2617, 42.0715], area: 202.98 },
  '6965e9e35a63914783b2b110': { name: 'Maloti Port Colony', nameBn: 'মালতি পোর্ট কলোনি', center: [89.5914, 22.5148], area: 7.47 },
  '6965ea2a3502733c8442f7fe': { name: 'Mymensingh Engineering College', nameBn: 'ময়মনসিংহ ইঞ্জিনিয়ারিং কলেজ', center: [90.3448, 24.7816], area: 6.00 },
  '6965ea5c6f78d821dd84aeb1': { name: 'BAU', nameBn: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয়', center: [90.4314, 24.7208], area: 78.92 },
  '6965eac4a049de7f3a4b4081': { name: 'Bagharpara', nameBn: 'বাঘারপাড়া', center: [89.3432, 23.2201], area: 51.64 },
  '6965eafbd1895d6355badd8c': { name: 'Rangpur', nameBn: 'রংপুর', center: [88.8630, 25.9399], area: 128.34 },
};

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
    const action = body.action || url.searchParams.get('action') || 'ndvi';
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
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        // Read params from body (Supported: days)
        const days = body.days ? parseInt(body.days) : 365;

        if (!polygonId) {
          throw new Error('Polygon ID is required');
        }

        // Use extended time range for better data availability
        // From Nov 2023 (when satellite data starts) to now
        const end = Math.floor(Date.now() / 1000);
        const start = 1700000000; // Nov 14, 2023 - ensures we get all available historical data

        const cacheKey = `ndvi-history-v6-${polygonId}-${end}`;
        const cached = getCachedData(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // ======== DIRECT NDVI HISTORY API (User's working endpoint) ========
        // Using: https://api.agromonitoring.com/agro/1.0/ndvi/history?polyid=...&start=...&end=...&appid=...
        const ndviHistoryUrl = `${AGRO_API.BASE_URL}/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`;
        console.log(`Fetching NDVI history from direct API: ${ndviHistoryUrl.replace(AGRO_API_KEY, 'HIDDEN')}`);
        console.log(`Time range: ${new Date(start * 1000).toISOString()} to ${new Date(end * 1000).toISOString()}`);

        const response = await fetch(ndviHistoryUrl);
        
        // If direct NDVI history works, use it
        if (response.ok) {
          const ndviHistoryRaw = await response.json();
          console.log(`Got ${Array.isArray(ndviHistoryRaw) ? ndviHistoryRaw.length : 0} NDVI history points from direct API`);
          
          if (!Array.isArray(ndviHistoryRaw) || ndviHistoryRaw.length === 0) {
            return new Response(
              JSON.stringify({
                error: 'no_data',
                message: 'No NDVI history data available',
                messageBn: 'NDVI ইতিহাস ডেটা পাওয়া যায়নি',
                polygonId,
                days
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Transform direct NDVI history response
          // Expected format: [{dt, source, zoom, dc, cl, data: {std, p75, min, max, median, p25, num, mean}}]
          const processedHistory = ndviHistoryRaw.map((item: any) => ({
            date: new Date(item.dt * 1000).toISOString().split('T')[0],
            timestamp: item.dt,
            ndvi: item.data?.mean ?? 0,
            min: item.data?.min ?? 0,
            max: item.data?.max ?? 0,
            median: item.data?.median ?? 0,
            std: item.data?.std ?? 0,
            cloudCoverage: item.cl ?? 0,
            type: item.source || 'Sentinel-2'
          })).sort((a: any, b: any) => a.timestamp - b.timestamp);

          // Calculate aggregate statistics
          const ndviValues = processedHistory.map((h: any) => h.ndvi);
          const currentNDVI = ndviValues[ndviValues.length - 1];
          const avgNDVI = ndviValues.reduce((a: number, b: number) => a + b, 0) / ndviValues.length;
          const minNDVI = Math.min(...ndviValues);
          const maxNDVI = Math.max(...ndviValues);

          // Trend Analysis
          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          let trendBn = 'স্থিতিশীল';

          if (processedHistory.length >= 2) {
            const midpoint = Math.floor(processedHistory.length / 2);
            const recentAvg = ndviValues.slice(midpoint).reduce((a: number, b: number) => a + b, 0) / (ndviValues.length - midpoint);
            const olderAvg = ndviValues.slice(0, midpoint).reduce((a: number, b: number) => a + b, 0) / midpoint;

            if (recentAvg > olderAvg + 0.05) {
              trend = 'improving';
              trendBn = 'উন্নতি হচ্ছে';
            } else if (recentAvg < olderAvg - 0.05) {
              trend = 'declining';
              trendBn = 'অবনতি হচ্ছে';
            }
          }

          // Drop Detection
          const warnings: any[] = [];
          for (let i = 1; i < processedHistory.length; i++) {
            const prev = processedHistory[i - 1].ndvi;
            const curr = processedHistory[i].ndvi;
            if (prev > 0) {
              const dropPercent = ((prev - curr) / prev) * 100;
              if (dropPercent > 10) {
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
            dataPoints: processedHistory.length,
            source: 'AgroMonitoring NDVI History API',
            sourceInfo: {
              provider: 'AgroMonitoring.com',
              satellite: 'Sentinel-2 / Landsat 8',
              dataType: 'NDVI (Normalized Difference Vegetation Index)',
              updateFrequency: '5-10 দিন (আবহাওয়া ভিত্তিক)'
            }
          };

          setCachedData(cacheKey, result);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // ======== FALLBACK: Use image/search + stats if direct NDVI history fails ========
        console.log('Direct NDVI history API failed, falling back to image/search...');
        const searchUrl = `${AGRO_API.BASE_URL}/image/search?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`;
        
        const imageResponse = await fetch(searchUrl);

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error(`Image search failed: ${imageResponse.status}`, errorText);
          throw new Error(`AgroMonitoring API Error (${imageResponse.status}): ${errorText}`);
        }

        const images: SatelliteImage[] = await imageResponse.json();

        if (!images || images.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'no_data',
              message: 'No satellite images available for this period',
              messageBn: 'এই সময়ের জন্য কোনো স্যাটেলাইট ছবি পাওয়া যায়নি',
              polygonId,
              days
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Filter and process images
        const goodImages = images
          .filter(img => img.cl < 80)
          .sort((a, b) => a.dt - b.dt);

        const processedHistoryFallback: any[] = [];
        const imagesToProcess = goodImages.slice(-20);

        for (const img of imagesToProcess) {
          let ndviMean = 0;
          let ndviMin = 0;
          let ndviMax = 0;

          if (img.stats?.ndvi) {
            try {
              const statsResponse = await fetch(img.stats.ndvi);
              if (statsResponse.ok) {
                const stats: NDVIStats = await statsResponse.json();
                ndviMean = stats.mean;
                ndviMin = stats.min;
                ndviMax = stats.max;
              }
            } catch (e) {
              console.warn(`Failed to fetch stats for image ${img.dt}:`, e);
            }
          }

          processedHistoryFallback.push({
            date: new Date(img.dt * 1000).toISOString().split('T')[0],
            timestamp: img.dt,
            ndvi: ndviMean,
            min: ndviMin,
            max: ndviMax,
            median: (ndviMin + ndviMax) / 2,
            cloudCoverage: img.cl,
            type: img.type || 'Sentinel-2'
          });
        }

        if (processedHistoryFallback.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'no_clear_data',
              message: 'No clear satellite images available (too cloudy)',
              messageBn: 'পরিষ্কার স্যাটেলাইট ছবি পাওয়া যায়নি (মেঘলা আবহাওয়া)',
              polygonId,
              days
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const ndviValuesFallback = processedHistoryFallback.map(h => h.ndvi);
        const currentNDVIFallback = ndviValuesFallback[ndviValuesFallback.length - 1];
        const avgNDVIFallback = ndviValuesFallback.reduce((a, b) => a + b, 0) / ndviValuesFallback.length;

        const resultFallback = {
          polygonId,
          days,
          history: processedHistoryFallback,
          statistics: {
            current: currentNDVIFallback,
            average: avgNDVIFallback,
            min: Math.min(...ndviValuesFallback),
            max: Math.max(...ndviValuesFallback)
          },
          trend: 'stable' as const,
          trendBn: 'স্থিতিশীল',
          warnings: [],
          dataPoints: processedHistoryFallback.length,
          source: 'Satellite Image Stats (Fallback)',
          sourceInfo: {
            provider: 'AgroMonitoring.com',
            satellite: 'Sentinel-2',
            dataType: 'NDVI from Satellite Stats',
            updateFrequency: '5-10 দিন'
          }
        };

        setCachedData(cacheKey, resultFallback);
        return new Response(JSON.stringify(resultFallback), {
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
