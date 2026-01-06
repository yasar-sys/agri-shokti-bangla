import { useEffect, useState, useMemo, useRef, memo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertTriangle, RefreshCw, ChevronDown, Leaf, Satellite, Droplets, Thermometer, CloudRain, AlertCircle, Map as MapIcon, Navigation, BarChart3, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { TILE_LAYERS, getGIBSDate, getNDVIColor, getSoilMoistureColor } from '@/lib/nasaDataSources';
import { AppEEARSPanel } from './AppEEARSPanel';

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
    vegetationIndex?: number;
    moistureLevel?: number;
    stressLevel?: number;
  } | null;
  last_scan_at?: string | null;
}

interface DroneRoute {
  id: string;
  task_bn: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  status_bn: string;
  area_acres: number;
  estimated_time_mins: number;
  coverage_percentage: number;
  waypoints: Array<{ lat: number; lng: number; type: string }>;
  optimized_path: Array<{ lat: number; lng: number; type: string }>;
}

interface NASASatelliteMapProps {
  latitude?: number;
  longitude?: number;
  zones?: FieldZone[];
  droneRoutes?: DroneRoute[];
  onZoneClick?: (zoneId: string) => void;
  showHeatmap?: boolean;
  showDroneRoutes?: boolean;
}

type TileLayer = 'satellite' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation';

const LAYER_INFO: Record<TileLayer, { name: string; nameBn: string; icon: typeof Satellite; color: string }> = {
  satellite: { name: 'Satellite', nameBn: 'স্যাটেলাইট', icon: Satellite, color: '#6b7280' },
  ndvi: { name: 'NDVI', nameBn: 'উদ্ভিদ সূচক', icon: Leaf, color: '#22c55e' },
  soil_moisture: { name: 'Soil Moisture', nameBn: 'মাটির আর্দ্রতা', icon: Droplets, color: '#3b82f6' },
  lst: { name: 'Temperature', nameBn: 'তাপমাত্রা', icon: Thermometer, color: '#f97316' },
  precipitation: { name: 'Rainfall', nameBn: 'বৃষ্টিপাত', icon: CloudRain, color: '#8b5cf6' },
};

export const NASASatelliteMap = memo(function NASASatelliteMap({ 
  latitude = 23.8103, 
  longitude = 90.4125, 
  zones = [], 
  droneRoutes = [],
  onZoneClick,
  showHeatmap = true,
  showDroneRoutes = true
}: NASASatelliteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const routesLayer = useRef<L.LayerGroup | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<TileLayer>('ndvi');
  const [refreshing, setRefreshing] = useState(false);
  const [liveZones, setLiveZones] = useState<FieldZone[]>(zones);
  const [liveRoutes, setLiveRoutes] = useState<DroneRoute[]>(droneRoutes);
  const [heatmapVisible, setHeatmapVisible] = useState(showHeatmap);
  const [routesVisible, setRoutesVisible] = useState(showDroneRoutes);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showAppEEARS, setShowAppEEARS] = useState(false);

  const gibsDate = getGIBSDate(10);

  const tileLayers: Record<TileLayer, { url: string; attribution: string; maxZoom: number; opacity?: number }> = {
    satellite: { ...TILE_LAYERS.satellite, maxZoom: 18 },
    ndvi: { ...TILE_LAYERS.getNDVILayer(gibsDate), maxZoom: 9, opacity: 0.85 },
    soil_moisture: { ...TILE_LAYERS.getSoilMoistureLayer(gibsDate), maxZoom: 7, opacity: 0.8 },
    lst: { ...TILE_LAYERS.getLSTLayer(gibsDate), maxZoom: 7, opacity: 0.8 },
    precipitation: { ...TILE_LAYERS.getPrecipitationLayer(gibsDate), maxZoom: 6, opacity: 0.7 },
  };

  useEffect(() => { setLiveZones(zones); }, [zones]);
  useEffect(() => { setLiveRoutes(droneRoutes); }, [droneRoutes]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('ndvi-realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'field_zones' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setLiveZones(prev => prev.map(zone => zone.id === (payload.new as FieldZone).id ? { ...zone, ...payload.new } : zone));
        } else if (payload.eventType === 'INSERT') {
          setLiveZones(prev => [...prev, payload.new as FieldZone]);
        } else if (payload.eventType === 'DELETE') {
          setLiveZones(prev => prev.filter(zone => zone.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = L.map(mapContainer.current, {
        center: [latitude, longitude],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      const baseLayer = L.tileLayer(TILE_LAYERS.light.url, { maxZoom: 18 }).addTo(map.current);
      
      const initialLayerConfig = tileLayers[activeLayer];
      if (activeLayer !== 'satellite') {
        overlayLayerRef.current = L.tileLayer(initialLayerConfig.url, {
          maxZoom: initialLayerConfig.maxZoom || 18,
          opacity: initialLayerConfig.opacity || 0.85,
        }).addTo(map.current);
      } else {
        map.current.removeLayer(baseLayer);
        tileLayerRef.current = L.tileLayer(initialLayerConfig.url, { maxZoom: 18 }).addTo(map.current);
      }

      markersLayer.current = L.layerGroup().addTo(map.current);
      routesLayer.current = L.layerGroup().addTo(map.current);
      L.control.zoom({ position: 'bottomright' }).addTo(map.current);

      setLoading(false);
      setIsMapReady(true);
    } catch (error) {
      setMapError(error instanceof Error ? error.message : 'ম্যাপ লোড ব্যর্থ');
      setLoading(false);
    }

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []);

  const needsBaseMap = ['ndvi', 'soil_moisture', 'lst', 'precipitation'];

  // Switch layers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.current!.removeLayer(layer);
    });

    tileLayerRef.current = null;
    overlayLayerRef.current = null;

    const layerConfig = tileLayers[activeLayer];
    
    if (needsBaseMap.includes(activeLayer)) {
      tileLayerRef.current = L.tileLayer(TILE_LAYERS.light.url, { maxZoom: 18 }).addTo(map.current);
      overlayLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        opacity: layerConfig.opacity || 0.85,
      }).addTo(map.current);
    } else {
      tileLayerRef.current = L.tileLayer(layerConfig.url, { maxZoom: layerConfig.maxZoom }).addTo(map.current);
    }
  }, [activeLayer, isMapReady]);

  // Update zone markers
  useEffect(() => {
    if (!map.current || !markersLayer.current || !isMapReady) return;
    markersLayer.current.clearLayers();
    if (!heatmapVisible) return;

    liveZones.forEach((zone, idx) => {
      const zoneLat = zone.latitude ?? latitude + (idx * 0.02 - 0.03);
      const zoneLng = zone.longitude ?? longitude + (idx * 0.02 - 0.03);
      const health = zone.health_score;

      let bgColor = '#22c55e';
      if (health < 0.4) bgColor = '#ef4444';
      else if (health < 0.6) bgColor = '#f97316';
      else if (health < 0.8) bgColor = '#eab308';

      const size = 48;
      const iconHtml = `
        <div style="
          width: ${size}px; height: ${size}px;
          background: linear-gradient(135deg, ${bgColor}, ${bgColor}90);
          border-radius: 50%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: white; border: 2px solid white; box-shadow: 0 2px 12px ${bgColor}50;
          font-family: system-ui, sans-serif;
        ">
          <span style="font-size: 14px; font-weight: 700;">${Math.round(health * 100)}%</span>
        </div>
      `;

      const icon = L.divIcon({ className: 'ndvi-marker', html: iconHtml, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      const marker = L.marker([zoneLat, zoneLng], { icon }).addTo(markersLayer.current!);

      marker.bindPopup(`
        <div style="padding: 12px; font-family: system-ui, sans-serif; min-width: 160px;">
          <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${zone.name_bn}</h4>
          <div style="display: flex; gap: 12px;">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: ${bgColor};">${Math.round(health * 100)}%</div>
              <div style="font-size: 10px; color: #6b7280;">স্বাস্থ্য</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #3b82f6;">${Math.round((zone.ndvi_data?.moisture_level ?? zone.ndvi_data?.moistureLevel ?? 0.5) * 100)}%</div>
              <div style="font-size: 10px; color: #6b7280;">আর্দ্রতা</div>
            </div>
          </div>
        </div>
      `, { className: 'minimal-popup', maxWidth: 200 });

      marker.on('click', () => onZoneClick?.(zone.id));
    });
  }, [liveZones, heatmapVisible, isMapReady, latitude, longitude, onZoneClick]);

  // Render drone routes
  useEffect(() => {
    if (!map.current || !routesLayer.current || !isMapReady) return;
    routesLayer.current.clearLayers();
    if (!routesVisible || liveRoutes.length === 0) return;

    liveRoutes.forEach((route) => {
      const path = route.optimized_path?.length > 0 ? route.optimized_path : route.waypoints;
      if (!path || path.length < 2) return;

      let routeColor = '#3b82f6';
      if (route.status === 'in_progress') routeColor = '#f59e0b';
      else if (route.status === 'completed') routeColor = '#22c55e';

      const latLngs = path.map(p => [p.lat, p.lng] as [number, number]);
      L.polyline(latLngs, { color: routeColor, weight: 3, opacity: 0.8 }).addTo(routesLayer.current!);

      const startIcon = L.divIcon({
        className: 'drone-marker',
        html: `<div style="width: 24px; height: 24px; background: ${routeColor}; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h6m6 0h6M12 3v6m0 6v6"/></svg>
        </div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      });
      L.marker([path[0].lat, path[0].lng], { icon: startIcon }).addTo(routesLayer.current!);
    });
  }, [liveRoutes, routesVisible, isMapReady]);

  const ndviStats = useMemo(() => {
    if (liveZones.length === 0) return null;
    const healthScores = liveZones.map(z => z.health_score);
    const avg = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    const stressed = liveZones.filter(z => z.health_score < 0.5).length;
    return { avg, stressed, total: liveZones.length };
  }, [liveZones]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const ActiveLayerIcon = LAYER_INFO[activeLayer].icon;

  // Add popup styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'satellite-map-styles';
    style.textContent = `
      .minimal-popup .leaflet-popup-content-wrapper { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
      .minimal-popup .leaflet-popup-content { margin: 0; }
      .minimal-popup .leaflet-popup-tip { background: white; }
      .ndvi-marker, .drone-marker { background: transparent !important; border: none !important; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('satellite-map-styles')?.remove(); };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-background h-full min-h-[250px] sm:min-h-[400px]">
      <div ref={mapContainer} className={cn("absolute inset-0 z-0", (loading || mapError) && "invisible")} />
      
      {mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <div className="text-center p-6">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-sm text-destructive font-medium mb-2">ম্যাপ লোড ব্যর্থ</p>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> পুনরায় চেষ্টা
            </Button>
          </div>
        </div>
      )}

      {loading && !mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">NASA ডেটা লোড হচ্ছে...</p>
          </div>
        </div>
      )}

      {!loading && !mapError && (
        <>
          {/* Main Controls - Clean Dropdown Menu */}
          <div className="absolute top-3 left-3 z-[1000] flex gap-2">
            {/* Layer Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-9 gap-2 bg-background/95 backdrop-blur-md shadow-lg border border-border hover:bg-accent">
                  <ActiveLayerIcon className="w-4 h-4" style={{ color: LAYER_INFO[activeLayer].color }} />
                  <span className="hidden sm:inline">{LAYER_INFO[activeLayer].nameBn}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur-md border-border">
                <DropdownMenuLabel className="text-xs text-muted-foreground">NASA লেয়ার</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(LAYER_INFO) as TileLayer[]).map((layer) => {
                  const info = LAYER_INFO[layer];
                  const Icon = info.icon;
                  return (
                    <DropdownMenuItem
                      key={layer}
                      onClick={() => setActiveLayer(layer)}
                      className={cn("gap-3 cursor-pointer", activeLayer === layer && "bg-accent")}
                    >
                      <Icon className="w-4 h-4" style={{ color: info.color }} />
                      <span>{info.nameBn}</span>
                      {activeLayer === layer && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-9 gap-2 bg-background/95 backdrop-blur-md shadow-lg border border-border hover:bg-accent">
                  <MapIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">ভিউ</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 bg-background/95 backdrop-blur-md border-border">
                <DropdownMenuItem onClick={() => setHeatmapVisible(!heatmapVisible)} className="gap-3 cursor-pointer">
                  <Leaf className="w-4 h-4" />
                  <span>ফিল্ড জোন</span>
                  <span className={cn("ml-auto text-xs", heatmapVisible ? "text-green-500" : "text-muted-foreground")}>
                    {heatmapVisible ? "ON" : "OFF"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoutesVisible(!routesVisible)} className="gap-3 cursor-pointer">
                  <Navigation className="w-4 h-4" />
                  <span>ড্রোন রুট</span>
                  <span className={cn("ml-auto text-xs", routesVisible ? "text-green-500" : "text-muted-foreground")}>
                    {routesVisible ? "ON" : "OFF"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowAppEEARS(!showAppEEARS)} className="gap-3 cursor-pointer">
                  <BarChart3 className="w-4 h-4" />
                  <span>NDVI চার্ট</span>
                  <span className={cn("ml-auto text-xs", showAppEEARS ? "text-green-500" : "text-muted-foreground")}>
                    {showAppEEARS ? "ON" : "OFF"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* NASA Live Indicator & Refresh */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background/95 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-lg border border-border">
              <Radio className="w-3 h-3 text-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-green-500">NASA LIVE</span>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/95 backdrop-blur-md shadow-lg border border-border"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>

          {/* Stats Summary - Bottom Left */}
          {ndviStats && heatmapVisible && (
            <div className="absolute bottom-3 left-3 z-[1000] bg-background/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-border">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    ndviStats.avg >= 0.6 ? "bg-green-500" : ndviStats.avg >= 0.4 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  <span className="font-semibold">{(ndviStats.avg * 100).toFixed(0)}%</span>
                  <span className="text-muted-foreground text-xs">গড়</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  {ndviStats.stressed > 0 && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                  <span className={cn("font-semibold", ndviStats.stressed > 0 ? "text-red-500" : "text-green-500")}>
                    {ndviStats.stressed}
                  </span>
                  <span className="text-muted-foreground text-xs">ঝুঁকি</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{ndviStats.total}</span>
                  <span className="text-muted-foreground text-xs">জোন</span>
                </div>
              </div>
            </div>
          )}

          {/* Layer Legend - Bottom Right */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-background/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-border">
            <div className="flex items-center gap-2 text-xs">
              <ActiveLayerIcon className="w-3.5 h-3.5" style={{ color: LAYER_INFO[activeLayer].color }} />
              <span className="text-muted-foreground">{LAYER_INFO[activeLayer].nameBn}</span>
              <div className="h-2 w-16 rounded-full" style={{
                background: activeLayer === 'ndvi' 
                  ? 'linear-gradient(to right, #ef4444, #eab308, #22c55e)'
                  : activeLayer === 'soil_moisture'
                  ? 'linear-gradient(to right, #f97316, #3b82f6)'
                  : activeLayer === 'lst'
                  ? 'linear-gradient(to right, #3b82f6, #ef4444)'
                  : activeLayer === 'precipitation'
                  ? 'linear-gradient(to right, #f0f9ff, #3b82f6)'
                  : '#6b7280'
              }} />
            </div>
          </div>

          {/* AppEEARS Panel */}
          {showAppEEARS && (
            <div className="absolute bottom-16 left-3 z-[1001] w-[calc(100%-24px)] sm:w-80">
              <AppEEARSPanel 
                latitude={latitude} 
                longitude={longitude} 
                onClose={() => setShowAppEEARS(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default NASASatelliteMap;
