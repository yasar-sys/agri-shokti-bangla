import { useEffect, useState, useMemo } from 'react';
import { Loader2, Satellite, AlertTriangle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
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

type LayerType = 'ndvi' | 'truecolor' | 'modis';

// NASA GIBS WMTS Configuration
const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
const LAYERS = {
  ndvi: 'MODIS_Terra_NDVI_8Day',
  truecolor: 'MODIS_Terra_CorrectedReflectance_TrueColor',
  modis: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor'
};

// Calculate tile coordinates from lat/lng
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

// Get date string for NASA GIBS (format: YYYY-MM-DD)
function getGIBSDate(daysAgo: number = 1): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Build NASA GIBS tile URL
function buildGIBSTileUrl(layer: string, date: string, z: number, x: number, y: number): string {
  return `${GIBS_BASE}/${layer}/default/${date}/GoogleMapsCompatible_Level${z}/${z}/${y}/${x}.png`;
}

export function NASASatelliteMap({ latitude = 23.8103, longitude = 90.4125, zones = [], onZoneClick }: NASASatelliteMapProps) {
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<LayerType>('truecolor');
  const [zoom, setZoom] = useState(6);
  const [tileError, setTileError] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(getGIBSDate(1));
  const [refreshing, setRefreshing] = useState(false);

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

  // Build tile URLs for current layer
  const tileUrls = useMemo(() => {
    const layerName = LAYERS[activeLayer];
    return tileGrid.map(tile => ({
      ...tile,
      url: buildGIBSTileUrl(layerName, currentDate, tile.z, tile.x, tile.y)
    }));
  }, [tileGrid, activeLayer, currentDate]);

  useEffect(() => {
    fetchAnalysis();
    // Simulate loading delay for tiles
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [latitude, longitude]);

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
    setCurrentDate(getGIBSDate(1));
    await fetchAnalysis();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 9));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 3));

  if (loading) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">NASA স্যাটেলাইট ডেটা লোড হচ্ছে...</p>
          <p className="text-xs text-muted-foreground mt-1">MODIS/VIIRS Imagery</p>
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
          variant={activeLayer === 'truecolor' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('truecolor')}
          className="h-7 text-xs"
        >
          🛰️ রঙিন
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'ndvi' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('ndvi')}
          className="h-7 text-xs"
        >
          🌿 NDVI
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'modis' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('modis')}
          className="h-7 text-xs"
        >
          🌍 VIIRS
        </Button>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg flex items-center gap-1">
          <Satellite className="w-3 h-3 text-chart-4 ml-1" />
          <span className="text-xs text-muted-foreground pr-1">NASA GIBS</span>
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

      {/* NASA GIBS Satellite Tile Grid */}
      <div className="aspect-video relative overflow-hidden">
        <div 
          className="absolute inset-0 grid grid-cols-3 grid-rows-3"
          style={{ 
            transform: 'scale(1.1)', 
            transformOrigin: 'center',
          }}
        >
          {tileUrls.map((tile, idx) => (
            <div key={tile.key} className="relative overflow-hidden">
              <img
                src={tile.url}
                alt={`Satellite tile ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to previous date if current fails
                  const target = e.target as HTMLImageElement;
                  const fallbackDate = getGIBSDate(3);
                  if (!target.src.includes(fallbackDate)) {
                    target.src = buildGIBSTileUrl(LAYERS[activeLayer], fallbackDate, tile.z, tile.x, tile.y);
                  } else {
                    setTileError(true);
                  }
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* NDVI Color Overlay for field zones */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-3">
            {zones.slice(0, 4).map((zone, idx) => {
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
                        {activeLayer === 'ndvi' ? 'NDVI স্কোর' : 'স্বাস্থ্য স্কোর'}
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
            {activeLayer === 'ndvi' ? 'MODIS Terra NDVI 8-Day' : 
             activeLayer === 'truecolor' ? 'MODIS Terra True Color' : 
             'VIIRS NOAA-20'}
          </span>
        </div>
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-[10px] text-muted-foreground">📅 {currentDate}</span>
        </div>
      </div>

      {/* Tile error fallback */}
      {tileError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm z-30">
          <div className="text-center p-4">
            <Satellite className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">স্যাটেলাইট টাইল লোড হয়নি</p>
            <Button size="sm" variant="outline" onClick={handleRefresh} className="mt-2">
              আবার চেষ্টা করুন
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
