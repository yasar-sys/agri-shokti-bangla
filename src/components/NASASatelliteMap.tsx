import { useEffect, useState, useMemo, useCallback } from 'react';
import { Loader2, Satellite, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NASASatelliteMapProps {
  latitude?: number;
  longitude?: number;
  zones?: Array<{
    id: string;
    name_bn: string;
    health_score: number;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  onZoneClick?: (zoneId: string) => void;
}

type TileProvider = 'satellite' | 'terrain' | 'osm';

// Get the Supabase URL for edge function calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Build proxied tile URL through our edge function (solves CORS issues)
function buildProxiedTileUrl(provider: TileProvider, z: number, x: number, y: number): string {
  return `${SUPABASE_URL}/functions/v1/satellite-tiles?provider=${provider}&z=${z}&x=${x}&y=${y}`;
}

// Calculate tile coordinates from lat/lng
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

export function NASASatelliteMap({ latitude = 23.8103, longitude = 90.4125, zones = [], onZoneClick }: NASASatelliteMapProps) {
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<TileProvider>('satellite');
  const [zoom, setZoom] = useState(8);
  const [tileError, setTileError] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(0);

  // Generate tile grid for the view (3x3 grid centered on location)
  const tileGrid = useMemo(() => {
    const centerTile = latLngToTile(latitude, longitude, zoom);
    const tiles: Array<{ x: number; y: number; z: number; key: string }> = [];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = centerTile.x + dx;
        const y = centerTile.y + dy;
        tiles.push({ x, y, z: zoom, key: `${zoom}-${x}-${y}` });
      }
    }
    
    return tiles;
  }, [latitude, longitude, zoom]);

  // Build tile URLs through our proxy edge function
  const tileUrls = useMemo(() => {
    return tileGrid.map(tile => ({
      ...tile,
      url: buildProxiedTileUrl(activeLayer, tile.z, tile.x, tile.y)
    }));
  }, [tileGrid, activeLayer]);

  // Handle tile load error with automatic fallback
  const handleTileError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, tile: { z: number; x: number; y: number }) => {
    const target = e.target as HTMLImageElement;
    
    // Try fallback providers in order: satellite -> terrain -> osm
    if (!target.dataset.fallback1 && activeLayer === 'satellite') {
      target.dataset.fallback1 = 'true';
      target.src = buildProxiedTileUrl('terrain', tile.z, tile.x, tile.y);
      console.log('[SatelliteMap] Falling back to terrain tiles');
    } else if (!target.dataset.fallback2) {
      target.dataset.fallback2 = 'true';
      target.src = buildProxiedTileUrl('osm', tile.z, tile.x, tile.y);
      console.log('[SatelliteMap] Falling back to OSM tiles');
    } else if (!target.dataset.failed) {
      target.dataset.failed = 'true';
      target.style.opacity = '0.3';
      target.style.background = 'hsl(var(--muted))';
      setTilesLoaded(prev => prev + 1);
      setTileError(true);
    }
  }, [activeLayer]);

  useEffect(() => {
    fetchAnalysis();
    // Reset loading state when tiles change
    setLoading(true);
    setTilesLoaded(0);
    setTileError(false);
  }, [latitude, longitude, activeLayer, zoom]);

  useEffect(() => {
    // Consider loaded when most tiles are ready
    if (tilesLoaded >= 5) {
      setLoading(false);
    }
  }, [tilesLoaded]);

  const fetchAnalysis = async () => {
    try {
      const response = await supabase.functions.invoke('nasa-ndvi', {
        body: { action: 'analyze_imagery', latitude, longitude }
      });

      if (response.data?.success) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTileError(false);
    setTilesLoaded(0);
    await fetchAnalysis();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 12));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 4));

  if (loading) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">স্যাটেলাইট ডেটা লোড হচ্ছে...</p>
          <p className="text-xs text-muted-foreground mt-1">Esri World Imagery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
      {/* Layer Toggle */}
      <div className="absolute top-2 left-2 z-20 flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
        <Button
          size="sm"
          variant={activeLayer === 'satellite' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('satellite')}
          className="h-7 text-xs"
        >
          🛰️ স্যাটেলাইট
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'terrain' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('terrain')}
          className="h-7 text-xs"
        >
          🗺️ ম্যাপ
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'osm' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('osm')}
          className="h-7 text-xs"
        >
          🌍 OSM
        </Button>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg flex items-center gap-1">
          <Satellite className="w-3 h-3 text-chart-4 ml-1" />
          <span className="text-xs text-muted-foreground pr-1">
            {activeLayer === 'satellite' ? 'Esri Imagery' : activeLayer === 'terrain' ? 'Topo Map' : 'OpenStreetMap'}
          </span>
        </div>
        <div className="bg-background/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col">
          <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-7 w-7 p-0">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-7 w-7 p-0">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleRefresh} className="h-7 w-7 p-0" disabled={refreshing}>
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Satellite Tile Grid */}
      <div className="aspect-video relative overflow-hidden">
        <div 
          className="absolute inset-0 grid grid-cols-3 grid-rows-3"
          style={{ 
            transform: 'scale(1.1)', 
            transformOrigin: 'center',
          }}
        >
          {tileUrls.map((tile, idx) => (
            <div key={tile.key} className="relative overflow-hidden bg-muted">
              <img
                src={tile.url}
                alt={`Satellite tile ${idx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = '1';
                  setTilesLoaded(prev => prev + 1);
                }}
                onError={(e) => handleTileError(e, tile)}
                loading="eager"
                style={{ opacity: 0 }}
                crossOrigin="anonymous"
              />
            </div>
          ))}
        </div>

        {/* NDVI Color Overlay for field zones */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-3">
            {zones.slice(0, 4).map((zone) => {
              const health = zone.health_score;
              const overlayColor = health >= 0.7 
                ? 'hsla(142, 70%, 40%, 0.35)' 
                : health >= 0.4 
                  ? 'hsla(55, 80%, 45%, 0.35)' 
                  : 'hsla(0, 70%, 45%, 0.4)';
              
              return (
                <div 
                  key={zone.id}
                  className="relative rounded-lg overflow-hidden pointer-events-auto cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ 
                    background: overlayColor,
                    boxShadow: `inset 0 0 20px ${overlayColor}`,
                  }}
                  onClick={() => onZoneClick?.(zone.id)}
                >
                  {/* Stress indicators for unhealthy zones */}
                  {health < 0.5 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-16 h-16 rounded-full bg-destructive/30 animate-ping" />
                    </div>
                  )}
                  
                  {/* Zone label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/85 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/60">
                      <p className="text-xs font-medium text-foreground text-center">{zone.name_bn}</p>
                      <p className={cn(
                        "text-xl font-bold text-center",
                        health >= 0.7 ? "text-secondary" :
                        health >= 0.4 ? "text-chart-2" : "text-destructive"
                      )}>
                        {(health * 100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground text-center">
                        স্বাস্থ্য স্কোর
                      </p>
                    </div>
                  </div>

                  {/* Alert icon for stressed zones */}
                  {health < 0.5 && (
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="w-5 h-5 text-destructive drop-shadow-lg animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drone flight path animation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dronePath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 100%, 60%)" />
              <stop offset="100%" stopColor="hsl(45, 100%, 40%)" />
            </linearGradient>
          </defs>
          
          <path
            d="M10 15 L48 12 L90 20 L85 50 L50 55 L15 48 L10 80 L50 88 L90 82"
            stroke="url(#dronePath)"
            strokeWidth="0.6"
            strokeDasharray="2,2"
            fill="none"
            opacity="0.7"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="16"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Animated drone */}
          <g>
            <circle r="2" fill="hsl(45, 100%, 55%)">
              <animateMotion
                dur="12s"
                repeatCount="indefinite"
                path="M10 15 L48 12 L90 20 L85 50 L50 55 L15 48 L10 80 L50 88 L90 82"
              />
            </circle>
            <circle r="4" fill="none" stroke="hsl(45, 100%, 60%)" strokeWidth="0.3" opacity="0.5">
              <animateMotion
                dur="12s"
                repeatCount="indefinite"
                path="M10 15 L48 12 L90 20 L85 50 L50 55 L15 48 L10 80 L50 88 L90 82"
              />
              <animate attributeName="r" values="2;5;2" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.6s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {/* Anomaly Alerts */}
      {analysis?.detected_anomalies?.length > 0 && (
        <div className="absolute bottom-12 left-2 right-2 z-20">
          <div className="bg-destructive/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-xs text-destructive-foreground font-medium">
              {analysis.detected_anomalies.length}টি সমস্যা সনাক্ত হয়েছে
            </span>
          </div>
        </div>
      )}

      {/* Date and source info */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-between items-center">
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {activeLayer === 'satellite' ? 'Esri World Imagery' : 
             activeLayer === 'terrain' ? 'World Topo Map' : 
             'OpenStreetMap'}
          </span>
        </div>
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-[10px] text-muted-foreground">📍 {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E</span>
        </div>
      </div>

      {/* Tile error notification - non-blocking */}
      {tileError && tilesLoaded < 3 && (
        <div className="absolute bottom-16 left-2 right-2 z-30">
          <div className="bg-destructive/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-destructive-foreground" />
              <span className="text-xs text-destructive-foreground">কিছু টাইল লোড হয়নি</span>
            </div>
            <Button size="sm" variant="ghost" onClick={handleRefresh} className="h-6 text-xs text-destructive-foreground hover:bg-destructive-foreground/20">
              রিফ্রেশ
            </Button>
          </div>
        </div>
      )}

      {/* Scanning animation */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden z-5"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsla(200, 100%, 70%, 0.06) 50%, transparent 100%)',
          animation: 'scanLine 5s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
