import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Loader2, Satellite, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, WifiOff, Radio, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FieldZone {
  id: string;
  name_bn: string;
  health_score: number;
  latitude?: number | null;
  longitude?: number | null;
  ndvi_data?: {
    vegetation_index?: number;
    moisture_level?: number;
    stress_level?: number;
  } | null;
  last_scan_at?: string | null;
}

interface NASASatelliteMapProps {
  latitude?: number;
  longitude?: number;
  zones?: FieldZone[];
  onZoneClick?: (zoneId: string) => void;
  showHeatmap?: boolean;
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

// Generate NDVI color based on value (0-1 scale)
function getNDVIColor(value: number, opacity: number = 0.6): string {
  // NDVI color scale: red (stressed) -> yellow -> green (healthy)
  if (value >= 0.8) return `hsla(120, 80%, 35%, ${opacity})`; // Dark green - excellent
  if (value >= 0.6) return `hsla(100, 70%, 40%, ${opacity})`; // Light green - good
  if (value >= 0.4) return `hsla(60, 80%, 45%, ${opacity})`;  // Yellow - moderate
  if (value >= 0.2) return `hsla(30, 80%, 45%, ${opacity})`;  // Orange - poor
  return `hsla(0, 70%, 45%, ${opacity})`;                      // Red - stressed/bare
}

// Generate heatmap gradient stops
function generateHeatmapGradient(zones: FieldZone[]): string {
  if (zones.length === 0) return 'transparent';
  
  const avgHealth = zones.reduce((sum, z) => sum + z.health_score, 0) / zones.length;
  const baseColor = getNDVIColor(avgHealth, 0.3);
  
  return `radial-gradient(ellipse at center, ${baseColor} 0%, transparent 70%)`;
}

export function NASASatelliteMap({ 
  latitude = 23.8103, 
  longitude = 90.4125, 
  zones = [], 
  onZoneClick,
  showHeatmap = true 
}: NASASatelliteMapProps) {
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<TileProvider>('satellite');
  const [zoom, setZoom] = useState(8);
  const [tileError, setTileError] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(0);
  const tilesLoadedRef = useRef(0);
  const [liveZones, setLiveZones] = useState<FieldZone[]>(zones);
  const [heatmapVisible, setHeatmapVisible] = useState(showHeatmap);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Sync zones prop with local state
  useEffect(() => {
    setLiveZones(zones);
  }, [zones]);

  // Real-time subscription to field_zones table
  useEffect(() => {
    const channel = supabase
      .channel('ndvi-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'field_zones'
        },
        (payload) => {
          console.log('[NASASatelliteMap] Real-time update:', payload);
          setLastUpdate(new Date());
          
          if (payload.eventType === 'UPDATE') {
            const updatedZone = payload.new as FieldZone;
            setLiveZones(prev => prev.map(zone => 
              zone.id === updatedZone.id ? { ...zone, ...updatedZone } : zone
            ));
          } else if (payload.eventType === 'INSERT') {
            const newZone = payload.new as FieldZone;
            setLiveZones(prev => [...prev, newZone]);
          } else if (payload.eventType === 'DELETE') {
            const deletedZone = payload.old as { id: string };
            setLiveZones(prev => prev.filter(zone => zone.id !== deletedZone.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  // Calculate average NDVI statistics
  const ndviStats = useMemo(() => {
    if (liveZones.length === 0) return null;
    
    const healthScores = liveZones.map(z => z.health_score);
    const avg = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    const min = Math.min(...healthScores);
    const max = Math.max(...healthScores);
    const stressed = liveZones.filter(z => z.health_score < 0.5).length;
    
    return { avg, min, max, stressed, total: liveZones.length };
  }, [liveZones]);

  // Handle tile load error with automatic fallback
  const handleTileError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, tile: { z: number; x: number; y: number }) => {
    const target = e.target as HTMLImageElement;
    
    if (!target.dataset.fallback1 && activeLayer === 'satellite') {
      target.dataset.fallback1 = 'true';
      target.src = buildProxiedTileUrl('terrain', tile.z, tile.x, tile.y);
    } else if (!target.dataset.fallback2) {
      target.dataset.fallback2 = 'true';
      target.src = buildProxiedTileUrl('osm', tile.z, tile.x, tile.y);
    } else if (!target.dataset.failed) {
      target.dataset.failed = 'true';
      target.style.opacity = '0.3';
      setTilesLoaded(prev => {
        const next = prev + 1;
        tilesLoadedRef.current = next;
        return next;
      });
      setTileError(true);
    }
  }, [activeLayer]);

  useEffect(() => {
    fetchAnalysis();
    setLoading(true);
    setTilesLoaded(0);
    tilesLoadedRef.current = 0;
    setTileError(false);

    // Production-safety: never stay stuck in loading forever
    const t = window.setTimeout(() => {
      const loadedNow = tilesLoadedRef.current;
      setLoading(false);
      // If nothing loaded, switch layer and show error banner
      if (loadedNow === 0) {
        setTileError(true);
        setActiveLayer((prev) => (prev === 'satellite' ? 'terrain' : prev));
      }
    }, 6500);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, activeLayer, zoom]);

  useEffect(() => {
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
          <p className="text-xs text-muted-foreground mt-1">NDVI হিটম্যাপ প্রস্তুত হচ্ছে</p>
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
          variant={heatmapVisible ? 'default' : 'ghost'}
          onClick={() => setHeatmapVisible(!heatmapVisible)}
          className="h-7 text-xs"
        >
          <Leaf className="w-3 h-3 mr-1" />
          NDVI
        </Button>
      </div>

      {/* Real-time indicator & Controls */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg flex items-center gap-1">
          <Radio className="w-3 h-3 text-secondary animate-pulse ml-1" />
          <span className="text-[10px] text-secondary pr-1">লাইভ</span>
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

      {/* NDVI Stats Panel */}
      {ndviStats && heatmapVisible && (
        <div className="absolute top-12 left-2 z-20 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <p className="text-[10px] text-muted-foreground mb-1">NDVI পরিসংখ্যান</p>
          <div className="flex gap-2 text-xs">
            <div className="text-center">
              <p className={cn("font-bold", ndviStats.avg >= 0.6 ? "text-secondary" : ndviStats.avg >= 0.4 ? "text-chart-2" : "text-destructive")}>
                {(ndviStats.avg * 100).toFixed(0)}%
              </p>
              <p className="text-[9px] text-muted-foreground">গড়</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-destructive">{ndviStats.stressed}</p>
              <p className="text-[9px] text-muted-foreground">ঝুঁকিপূর্ণ</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-foreground">{ndviStats.total}</p>
              <p className="text-[9px] text-muted-foreground">মোট জোন</p>
            </div>
          </div>
        </div>
      )}

      {/* Satellite Tile Grid */}
      <div className="aspect-video relative overflow-hidden">
        <div 
          className="absolute inset-0 grid grid-cols-3 grid-rows-3"
          style={{ transform: 'scale(1.1)', transformOrigin: 'center' }}
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
      setTilesLoaded(prev => {
        const next = prev + 1;
        tilesLoadedRef.current = next;
        return next;
      });
                }}
                onError={(e) => handleTileError(e, tile)}
                loading="eager"
                style={{ opacity: 0 }}
                crossOrigin="anonymous"
              />
            </div>
          ))}
        </div>

        {/* NDVI Heatmap Overlay */}
        {heatmapVisible && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ opacity: heatmapVisible ? 1 : 0 }}>
            {/* Grid-based heatmap for zones */}
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-3">
              {liveZones.slice(0, 4).map((zone, idx) => {
                const health = zone.health_score;
                const ndviColor = getNDVIColor(health, 0.45);
                const vegetationIndex = zone.ndvi_data?.vegetation_index ?? health;
                const moistureLevel = zone.ndvi_data?.moisture_level ?? 0.5;
                const stressLevel = zone.ndvi_data?.stress_level ?? (1 - health);
                
                return (
                  <div 
                    key={zone.id}
                    className="relative rounded-lg overflow-hidden pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    style={{ 
                      background: `
                        radial-gradient(ellipse at ${30 + idx * 15}% ${40 + idx * 10}%, ${getNDVIColor(vegetationIndex, 0.5)} 0%, transparent 50%),
                        radial-gradient(ellipse at ${70 - idx * 10}% ${60 - idx * 5}%, ${getNDVIColor(moistureLevel, 0.4)} 0%, transparent 40%),
                        ${ndviColor}
                      `,
                      boxShadow: `inset 0 0 30px ${ndviColor}`,
                    }}
                    onClick={() => onZoneClick?.(zone.id)}
                  >
                    {/* Animated stress pulse for unhealthy zones */}
                    {health < 0.5 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="absolute rounded-full animate-ping"
                          style={{
                            width: `${(1 - health) * 100}px`,
                            height: `${(1 - health) * 100}px`,
                            background: `radial-gradient(circle, ${getNDVIColor(health, 0.5)} 0%, transparent 70%)`
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Zone info card */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/60">
                        <p className="text-xs font-medium text-foreground text-center">{zone.name_bn}</p>
                        <p className={cn(
                          "text-xl font-bold text-center transition-colors",
                          health >= 0.7 ? "text-secondary" :
                          health >= 0.4 ? "text-chart-2" : "text-destructive"
                        )}>
                          {(health * 100).toFixed(0)}%
                        </p>
                        <div className="flex gap-2 justify-center mt-1">
                          <span className="text-[9px] text-muted-foreground">🌱 {(vegetationIndex * 100).toFixed(0)}%</span>
                          <span className="text-[9px] text-muted-foreground">💧 {(moistureLevel * 100).toFixed(0)}%</span>
                        </div>
                        {zone.last_scan_at && (
                          <p className="text-[8px] text-muted-foreground text-center mt-1">
                            {new Date(zone.last_scan_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Alert icon for stressed zones */}
                    {health < 0.5 && (
                      <div className="absolute top-2 right-2">
                        <AlertTriangle className="w-5 h-5 text-destructive drop-shadow-lg animate-pulse" />
                      </div>
                    )}

                    {/* Stress level indicator bar */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-1 bg-background/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${stressLevel * 100}%`,
                            background: `linear-gradient(90deg, ${getNDVIColor(1 - stressLevel, 1)}, ${getNDVIColor(0.2, 1)})`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global heatmap overlay gradient */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{ background: generateHeatmapGradient(liveZones) }}
            />
          </div>
        )}

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
            </circle>
          </g>
        </svg>
      </div>

      {/* NDVI Color Legend */}
      {heatmapVisible && (
        <div className="absolute bottom-12 right-2 z-20 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <p className="text-[9px] text-muted-foreground mb-1 text-center">NDVI স্কেল</p>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((val) => (
              <div key={val} className="flex flex-col items-center">
                <div 
                  className="w-4 h-3 rounded-sm"
                  style={{ background: getNDVIColor(val, 1) }}
                />
                <span className="text-[7px] text-muted-foreground">{(val * 100).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Alerts */}
      {analysis?.detected_anomalies?.length > 0 && (
        <div className="absolute bottom-12 left-2 z-20">
          <div className="bg-destructive/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-xs text-destructive-foreground font-medium">
              {analysis.detected_anomalies.length}টি সমস্যা
            </span>
          </div>
        </div>
      )}

      {/* Date and source info */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-between items-center">
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {activeLayer === 'satellite' ? 'Esri Imagery' : 'Topo Map'} + NDVI
          </span>
        </div>
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">
            আপডেট: {lastUpdate.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Tile error notification */}
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
          background: 'linear-gradient(180deg, transparent 0%, hsla(120, 80%, 50%, 0.04) 50%, transparent 100%)',
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
