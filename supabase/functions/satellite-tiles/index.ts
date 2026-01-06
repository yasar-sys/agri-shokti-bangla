/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tileCache = new Map<string, { data: ArrayBuffer; timestamp: number; contentType: string }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

function cleanCache() {
  if (tileCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(tileCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.3));
    toRemove.forEach(([key]) => tileCache.delete(key));
  }
}

// Reliable tile providers with proper attribution
const TILE_PROVIDERS: Record<string, { url: string; headers?: Record<string, string>; maxAge?: number }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxAge: 7 * 24 * 60 * 60,
  },
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    maxAge: 7 * 24 * 60 * 60,
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    headers: {
      'User-Agent': 'AgriShokti/1.0 (Agricultural Monitoring App for Bangladesh Farmers)'
    },
    maxAge: 7 * 24 * 60 * 60,
  },
  ndvi: {
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
    maxAge: 8 * 24 * 60 * 60,
  }
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Support both query params and path-based routing
    // Path format: /satellite-tiles/{provider}/{z}/{x}/{y}
    // Query format: ?provider=satellite&z=8&x=100&y=50
    
    let provider: string;
    let z: number, x: number, y: number;

    if (pathParts.length >= 5) {
      // Path-based: /satellite-tiles/satellite/8/100/50
      provider = pathParts[pathParts.length - 4];
      z = parseInt(pathParts[pathParts.length - 3]);
      y = parseInt(pathParts[pathParts.length - 2]);
      x = parseInt(pathParts[pathParts.length - 1].replace('.png', ''));
    } else {
      // Query-based
      provider = url.searchParams.get('provider') || 'satellite';
      z = parseInt(url.searchParams.get('z') || '8');
      x = parseInt(url.searchParams.get('x') || '0');
      y = parseInt(url.searchParams.get('y') || '0');
    }

    console.log(`[satellite-tiles] Request: provider=${provider}, z=${z}, x=${x}, y=${y}`);

    const cacheKey = `${provider}_${z}_${x}_${y}`;
    const cached = tileCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[satellite-tiles] Cache hit: ${cacheKey}`);
      return new Response(cached.data, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': cached.contentType,
          'Cache-Control': `public, max-age=${Math.floor((CACHE_TTL_MS - (Date.now() - cached.timestamp)) / 1000)}`,
          'X-Cache': 'HIT',
          'X-Tile-Source': provider
        }
      });
    }

    // Validate provider
    if (!TILE_PROVIDERS[provider]) {
      console.error(`[satellite-tiles] Invalid provider: ${provider}`);
      return new Response(
        JSON.stringify({ error: 'Invalid tile provider', validProviders: Object.keys(TILE_PROVIDERS) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate tile coordinates
    if (isNaN(z) || isNaN(x) || isNaN(y) || z < 0 || z > 20) {
      console.error(`[satellite-tiles] Invalid coordinates: z=${z}, x=${x}, y=${y}`);
      return new Response(
        JSON.stringify({ error: 'Invalid tile coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tileConfig = TILE_PROVIDERS[provider];
    const tileUrl = tileConfig.url
      .replace('{z}', z.toString())
      .replace('{x}', x.toString())
      .replace('{y}', y.toString());

    console.log(`[satellite-tiles] Fetching: ${tileUrl}`);

    // Fetch tile from upstream provider
    const fetchHeaders: Record<string, string> = {
      'Accept': 'image/png,image/jpeg,image/*',
      ...tileConfig.headers
    };

    const response = await fetch(tileUrl, {
      headers: fetchHeaders,
      redirect: 'follow'
    });

    if (!response.ok) {
      console.error(`[satellite-tiles] Upstream error: ${response.status} ${response.statusText}`);
      
      // Try fallback provider
      if (provider === 'satellite') {
        console.log('[satellite-tiles] Trying terrain fallback...');
        const fallbackUrl = TILE_PROVIDERS.terrain.url
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString());
        
        const fallbackResponse = await fetch(fallbackUrl);
        if (fallbackResponse.ok) {
          const body = await fallbackResponse.arrayBuffer();
          return new Response(body, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': fallbackResponse.headers.get('Content-Type') || 'image/png',
              'Cache-Control': 'public, max-age=86400',
              'X-Tile-Source': 'terrain-fallback'
            }
          });
        }
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch tile', status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('Content-Type') || 'image/png';
    const body = await response.arrayBuffer();

    console.log(`[satellite-tiles] Success: ${body.byteLength} bytes`);

    tileCache.set(cacheKey, {
      data: body,
      timestamp: Date.now(),
      contentType
    });
    
    cleanCache();

    const maxAge = tileConfig.maxAge || 86400;

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=3600`,
        'X-Cache': 'MISS',
        'X-Tile-Source': provider,
        'ETag': `"${provider}-${z}-${x}-${y}"`,
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[satellite-tiles] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
