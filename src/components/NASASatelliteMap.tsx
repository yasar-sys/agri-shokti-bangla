import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, Radio, Leaf, Satellite, Map as MapIcon } from 'lucide-react';
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

type TileLayer = 'satellite' | 'terrain' | 'ndvi';

// Generate NDVI color based on value (0-1 scale)
function getNDVIColor(value: number, opacity: number = 0.6): string {
  if (value >= 0.8) return `hsla(120, 80%, 35%, ${opacity})`;
  if (value >= 0.6) return `hsla(100, 70%, 40%, ${opacity})`;
  if (value >= 0.4) return `hsla(60, 80%, 45%, ${opacity})`;
  if (value >= 0.2) return `hsla(30, 80%, 45%, ${opacity})`;
  return `hsla(0, 70%, 45%, ${opacity})`;
}

export function NASASatelliteMap({ 
  latitude = 23.8103, 
  longitude = 90.4125, 
  zones = [], 
  onZoneClick,
  showHeatmap = true 
}: NASASatelliteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<TileLayer>('satellite');
  const [refreshing, setRefreshing] = useState(false);
  const [liveZones, setLiveZones] = useState<FieldZone[]>(zones);
  const [heatmapVisible, setHeatmapVisible] = useState(showHeatmap);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMapReady, setIsMapReady] = useState(false);

  // Tile layer configurations
  const tileLayers: Record<TileLayer, { url: string; attribution: string }> = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    },
    terrain: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
    },
    ndvi: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
    }
  };

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [latitude, longitude],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Add initial tile layer
    tileLayerRef.current = L.tileLayer(tileLayers[activeLayer].url, {
      maxZoom: 18,
      attribution: tileLayers[activeLayer].attribution,
    }).addTo(map.current);

    // Add markers layer
    markersLayer.current = L.layerGroup().addTo(map.current);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Map load complete
    map.current.on('load', () => {
      setLoading(false);
      setIsMapReady(true);
    });

    // Fallback in case 'load' doesn't fire
    setTimeout(() => {
      setLoading(false);
      setIsMapReady(true);
    }, 1500);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Switch tile layers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    if (tileLayerRef.current) {
      map.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(tileLayers[activeLayer].url, {
      maxZoom: 18,
      attribution: tileLayers[activeLayer].attribution,
    }).addTo(map.current);

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
      const vegetationIndex = zone.ndvi_data?.vegetation_index ?? health;
      const moistureLevel = zone.ndvi_data?.moisture_level ?? 0.5;

      // Determine marker color based on health
      let bgColor = '#22c55e';
      let riskText = 'সুস্থ';
      if (health < 0.4) {
        bgColor = '#ef4444';
        riskText = 'ঝুঁকিপূর্ণ';
      } else if (health < 0.6) {
        bgColor = '#f97316';
        riskText = 'মাঝারি';
      } else if (health < 0.8) {
        bgColor = '#eab308';
        riskText = 'ভালো';
      }

      const isStressed = health < 0.5;
      const size = 60 + (health * 20);

      // Create custom icon
      const iconHtml = `
        <div class="ndvi-zone-marker" style="position: relative; width: ${size}px; height: ${size}px;">
          ${isStressed ? `
            <div style="
              position: absolute;
              inset: -10px;
              border-radius: 50%;
              background: ${bgColor}40;
              animation: ndviPulse 2s infinite ease-in-out;
            "></div>
          ` : ''}
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, ${bgColor}cc, ${bgColor}90);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            border: 3px solid rgba(255,255,255,0.5);
            box-shadow: 0 4px 20px ${bgColor}60;
            cursor: pointer;
            transition: all 0.3s ease;
          " class="ndvi-marker-inner">
            <span style="font-size: ${size / 3}px; font-weight: bold;">${Math.round(health * 100)}%</span>
            <span style="font-size: 8px; opacity: 0.9;">NDVI</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'ndvi-custom-marker',
        html: iconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([zoneLat, zoneLng], { icon })
        .addTo(markersLayer.current!);

      // Create detailed popup
      const popupContent = `
        <div style="min-width: 200px; padding: 12px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
            <div style="
              width: 40px;
              height: 40px;
              background: ${bgColor}20;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${bgColor}" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <h3 style="font-weight: 600; color: #1f2937; font-size: 15px; margin: 0;">${zone.name_bn}</h3>
              <span style="
                display: inline-block;
                font-size: 11px;
                color: ${bgColor};
                background: ${bgColor}15;
                padding: 2px 10px;
                border-radius: 12px;
                margin-top: 3px;
              ">${riskText}</span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div style="text-align: center; padding: 8px; background: #f9fafb; border-radius: 10px;">
              <p style="font-size: 20px; font-weight: bold; color: ${bgColor}; margin: 0;">${Math.round(health * 100)}%</p>
              <p style="font-size: 10px; color: #6b7280; margin: 0;">স্বাস্থ্য স্কোর</p>
            </div>
            <div style="text-align: center; padding: 8px; background: #f9fafb; border-radius: 10px;">
              <p style="font-size: 20px; font-weight: bold; color: #22c55e; margin: 0;">${Math.round(vegetationIndex * 100)}%</p>
              <p style="font-size: 10px; color: #6b7280; margin: 0;">ভেজিটেশন</p>
            </div>
            <div style="text-align: center; padding: 8px; background: #f9fafb; border-radius: 10px;">
              <p style="font-size: 20px; font-weight: bold; color: #3b82f6; margin: 0;">${Math.round(moistureLevel * 100)}%</p>
              <p style="font-size: 10px; color: #6b7280; margin: 0;">আর্দ্রতা</p>
            </div>
            <div style="text-align: center; padding: 8px; background: ${isStressed ? '#fef2f2' : '#f0fdf4'}; border-radius: 10px;">
              <p style="font-size: 14px; font-weight: bold; color: ${isStressed ? '#dc2626' : '#16a34a'}; margin: 0;">
                ${isStressed ? '⚠️ সতর্কতা' : '✅ স্বাভাবিক'}
              </p>
              <p style="font-size: 10px; color: #6b7280; margin: 0;">অবস্থা</p>
            </div>
          </div>

          ${zone.last_scan_at ? `
            <p style="font-size: 10px; color: #9ca3af; text-align: center; margin-top: 10px;">
              সর্বশেষ স্ক্যান: ${new Date(zone.last_scan_at).toLocaleString('bn-BD')}
            </p>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'ndvi-leaflet-popup',
        maxWidth: 280,
      });

      marker.on('click', () => {
        onZoneClick?.(zone.id);
      });

      marker.on('mouseover', () => {
        marker.openPopup();
      });
    });

  }, [liveZones, heatmapVisible, isMapReady, latitude, longitude, onZoneClick]);

  // NDVI stats
  const ndviStats = useMemo(() => {
    if (liveZones.length === 0) return null;
    
    const healthScores = liveZones.map(z => z.health_score);
    const avg = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    const min = Math.min(...healthScores);
    const max = Math.max(...healthScores);
    const stressed = liveZones.filter(z => z.health_score < 0.5).length;
    
    return { avg, min, max, stressed, total: liveZones.length };
  }, [liveZones]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLastUpdate(new Date());
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  // Add custom CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'ndvi-map-styles';
    style.textContent = `
      @keyframes ndviPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.3;
        }
      }
      
      .ndvi-custom-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .ndvi-marker-inner:hover {
        transform: scale(1.1) !important;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        border: none;
        padding: 0;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-content {
        margin: 0;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-tip {
        background: white;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-close-button {
        color: #9ca3af !important;
        font-size: 20px !important;
        padding: 8px 10px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('ndvi-map-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

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
    <div className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-video">
      {/* Layer Toggle */}
      <div className="absolute top-2 left-2 z-[1000] flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
        <Button
          size="sm"
          variant={activeLayer === 'satellite' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('satellite')}
          className="h-7 text-xs"
        >
          <Satellite className="w-3 h-3 mr-1" />
          স্যাটেলাইট
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'terrain' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('terrain')}
          className="h-7 text-xs"
        >
          <MapIcon className="w-3 h-3 mr-1" />
          ম্যাপ
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
      <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg flex items-center gap-1">
          <Radio className="w-3 h-3 text-green-500 animate-pulse ml-1" />
          <span className="text-[10px] text-green-500 pr-1">লাইভ</span>
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
        <div className="absolute top-12 left-2 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <p className="text-[10px] text-muted-foreground mb-1">NDVI পরিসংখ্যান</p>
          <div className="flex gap-2 text-xs">
            <div className="text-center">
              <p className={cn("font-bold", ndviStats.avg >= 0.6 ? "text-green-500" : ndviStats.avg >= 0.4 ? "text-yellow-500" : "text-red-500")}>
                {(ndviStats.avg * 100).toFixed(0)}%
              </p>
              <p className="text-[9px] text-muted-foreground">গড়</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-red-500">{ndviStats.stressed}</p>
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

      {/* NDVI Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <p className="text-[10px] text-muted-foreground mb-1.5">NDVI স্কেল</p>
        <div className="flex items-center gap-1">
          <div className="h-2 w-16 rounded-full" style={{
            background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)'
          }} />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
          <span>০%</span>
          <span>১০০%</span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 z-0" />
    </div>
  );
}

export default NASASatelliteMap;
