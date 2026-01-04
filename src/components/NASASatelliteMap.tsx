import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, Radio, Leaf, Satellite, Map as MapIcon, Navigation } from 'lucide-react';
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
  droneRoutes = [],
  onZoneClick,
  showHeatmap = true,
  showDroneRoutes = true
}: NASASatelliteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const routesLayer = useRef<L.LayerGroup | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<TileLayer>('ndvi'); // Default to NDVI
  const [refreshing, setRefreshing] = useState(false);
  const [liveZones, setLiveZones] = useState<FieldZone[]>(zones);
  const [liveRoutes, setLiveRoutes] = useState<DroneRoute[]>(droneRoutes);
  const [heatmapVisible, setHeatmapVisible] = useState(showHeatmap);
  const [routesVisible, setRoutesVisible] = useState(showDroneRoutes);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMapReady, setIsMapReady] = useState(false);

  // Get recent date for NASA GIBS tiles (MODIS updates ~8 days, use 10 days back for reliability)
  const getGIBSDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    return date.toISOString().split('T')[0];
  };

  const gibsDate = getGIBSDate();

  // Tile layer configurations with NASA GIBS NDVI
  const tileLayers: Record<TileLayer, { url: string; attribution: string; maxZoom?: number }> = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18
    },
    terrain: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18
    },
    ndvi: {
      // NASA GIBS MODIS Terra NDVI 8-Day - Real vegetation index data
      url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`,
      attribution: 'NDVI &copy; NASA GIBS MODIS',
      maxZoom: 9 // GIBS NDVI max zoom is 9
    }
  };

  // Sync zones and routes props with local state
  useEffect(() => {
    setLiveZones(zones);
  }, [zones]);

  useEffect(() => {
    setLiveRoutes(droneRoutes);
  }, [droneRoutes]);

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

    console.log('[NASASatelliteMap] Initializing map...');
    setMapError(null);

    try {
      map.current = L.map(mapContainer.current, {
        center: [latitude, longitude],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      console.log('[NASASatelliteMap] Map instance created');

      // Add initial tile layer with error handling
      const initialLayerConfig = tileLayers[activeLayer];
      tileLayerRef.current = L.tileLayer(initialLayerConfig.url, {
        maxZoom: initialLayerConfig.maxZoom || 18,
        attribution: initialLayerConfig.attribution,
        errorTileUrl: '', // Prevent broken tile images
      });
      
      // For NDVI, add a base map underneath for context at higher zooms
      if (activeLayer === 'ndvi') {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 18,
          attribution: '&copy; OSM &copy; CARTO'
        }).addTo(map.current);
      }

      // Listen for tile load errors
      tileLayerRef.current.on('tileerror', (error) => {
        console.warn('[NASASatelliteMap] Tile load error:', error);
      });

      tileLayerRef.current.on('load', () => {
        console.log('[NASASatelliteMap] Initial tiles loaded successfully');
      });

      tileLayerRef.current.addTo(map.current);

      // Add markers layer
      markersLayer.current = L.layerGroup().addTo(map.current);
      
      // Add routes layer
      routesLayer.current = L.layerGroup().addTo(map.current);

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map.current);

      // Leaflet maps are ready immediately after initialization
      // The 'load' event doesn't exist on Leaflet Map, so we mark ready immediately
      console.log('[NASASatelliteMap] Map is ready');
      setLoading(false);
      setIsMapReady(true);

    } catch (error) {
      console.error('[NASASatelliteMap] Failed to initialize map:', error);
      setMapError(error instanceof Error ? error.message : 'ম্যাপ লোড করতে ব্যর্থ হয়েছে');
      setLoading(false);
    }

    return () => {
      if (map.current) {
        console.log('[NASASatelliteMap] Cleaning up map');
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Switch tile layers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    console.log('[NASASatelliteMap] Switching to layer:', activeLayer);

    if (tileLayerRef.current) {
      map.current.removeLayer(tileLayerRef.current);
    }

    const layerConfig = tileLayers[activeLayer];
    
    // For NDVI mode, add a light base map first for context (GIBS max zoom is 9)
    if (activeLayer === 'ndvi') {
      // Clear all layers first
      map.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.current!.removeLayer(layer);
        }
      });
      
      // Add base map for context
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; OSM &copy; CARTO'
      }).addTo(map.current);
      
      // Add NDVI overlay on top
      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom || 9,
        attribution: layerConfig.attribution,
        errorTileUrl: '',
        opacity: 0.85, // Slight transparency to see base map
      });
    } else {
      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom || 18,
        attribution: layerConfig.attribution,
        errorTileUrl: '',
      });
    }

    tileLayerRef.current.on('tileerror', (error) => {
      console.warn('[NASASatelliteMap] Tile error on', activeLayer, ':', error);
    });

    tileLayerRef.current.addTo(map.current);
    console.log('[NASASatelliteMap] Layer switched successfully');

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

  // Render drone routes on map
  useEffect(() => {
    if (!map.current || !routesLayer.current || !isMapReady) return;

    routesLayer.current.clearLayers();

    if (!routesVisible || liveRoutes.length === 0) return;

    liveRoutes.forEach((route) => {
      const path = route.optimized_path?.length > 0 ? route.optimized_path : route.waypoints;
      if (!path || path.length < 2) return;

      // Determine route color based on status
      let routeColor = '#3b82f6'; // blue - pending
      let dashArray = '10, 10';
      let weight = 3;
      let opacity = 0.8;

      if (route.status === 'in_progress') {
        routeColor = '#f59e0b'; // amber
        dashArray = '5, 5';
        weight = 4;
        opacity = 1;
      } else if (route.status === 'completed') {
        routeColor = '#22c55e'; // green
        dashArray = '';
        weight = 2;
        opacity = 0.6;
      } else if (route.status === 'cancelled') {
        routeColor = '#ef4444'; // red
        dashArray = '15, 10';
        weight = 2;
        opacity = 0.4;
      }

      // Create polyline for the route
      const latLngs = path.map(p => [p.lat, p.lng] as [number, number]);
      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight,
        opacity,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routesLayer.current!);

      // Add start marker (drone icon)
      const startPoint = path[0];
      const startIcon = L.divIcon({
        className: 'drone-start-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${routeColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ${route.status === 'in_progress' ? 'animation: dronePulse 1.5s infinite;' : ''}
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
              <path d="M3 12h6m6 0h6"/>
              <path d="M12 3v6m0 6v6"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
        .addTo(routesLayer.current!);

      // Add end marker (flag)
      const endPoint = path[path.length - 1];
      const endIcon = L.divIcon({
        className: 'drone-end-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: ${routeColor}40;
            border: 2px solid ${routeColor};
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${routeColor}" stroke="none">
              <path d="M4 21V4h12l-3 4 3 4H6v9z"/>
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
        .addTo(routesLayer.current!);

      // Add waypoint markers for intermediate points
      path.slice(1, -1).forEach((point, idx) => {
        const waypointIcon = L.divIcon({
          className: 'drone-waypoint-marker',
          html: `
            <div style="
              width: 12px;
              height: 12px;
              background: ${routeColor};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            "></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        L.marker([point.lat, point.lng], { icon: waypointIcon })
          .addTo(routesLayer.current!);
      });

      // Route popup
      const popupContent = `
        <div style="min-width: 180px; padding: 10px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <div style="
              width: 32px;
              height: 32px;
              background: ${routeColor}20;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${routeColor}" stroke-width="2">
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                <path d="M3 12h6m6 0h6"/>
                <path d="M12 3v6m0 6v6"/>
              </svg>
            </div>
            <div>
              <h3 style="font-weight: 600; color: #1f2937; font-size: 14px; margin: 0;">${route.task_bn}</h3>
              <span style="
                display: inline-block;
                font-size: 10px;
                color: ${routeColor};
                background: ${routeColor}15;
                padding: 2px 8px;
                border-radius: 10px;
                margin-top: 2px;
              ">${route.status_bn}</span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <div style="text-align: center; padding: 6px; background: #f9fafb; border-radius: 8px;">
              <p style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">${route.area_acres.toFixed(1)}</p>
              <p style="font-size: 9px; color: #6b7280; margin: 0;">একর</p>
            </div>
            <div style="text-align: center; padding: 6px; background: #f9fafb; border-radius: 8px;">
              <p style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">${route.estimated_time_mins}</p>
              <p style="font-size: 9px; color: #6b7280; margin: 0;">মিনিট</p>
            </div>
          </div>
          
          ${route.status === 'in_progress' ? `
            <div style="margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 10px; color: #6b7280;">অগ্রগতি</span>
                <span style="font-size: 10px; font-weight: 600; color: ${routeColor};">${route.coverage_percentage}%</span>
              </div>
              <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                <div style="height: 100%; width: ${route.coverage_percentage}%; background: ${routeColor}; border-radius: 2px;"></div>
              </div>
            </div>
          ` : ''}
        </div>
      `;

      polyline.bindPopup(popupContent, {
        className: 'drone-route-popup',
        maxWidth: 250,
      });
    });

  }, [liveRoutes, routesVisible, isMapReady]);

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

  // Drone route stats
  const routeStats = useMemo(() => {
    if (liveRoutes.length === 0) return null;
    
    const inProgress = liveRoutes.filter(r => r.status === 'in_progress').length;
    const completed = liveRoutes.filter(r => r.status === 'completed').length;
    const pending = liveRoutes.filter(r => r.status === 'pending').length;
    
    return { total: liveRoutes.length, inProgress, completed, pending };
  }, [liveRoutes]);

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
      
      @keyframes dronePulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
        }
        50% {
          box-shadow: 0 0 0 12px rgba(245, 158, 11, 0);
        }
      }
      
      .ndvi-custom-marker,
      .drone-start-marker,
      .drone-end-marker,
      .drone-waypoint-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .ndvi-marker-inner:hover {
        transform: scale(1.1) !important;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-content-wrapper,
      .drone-route-popup .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        border: none;
        padding: 0;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-content,
      .drone-route-popup .leaflet-popup-content {
        margin: 0;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-tip,
      .drone-route-popup .leaflet-popup-tip {
        background: white;
      }
      
      .ndvi-leaflet-popup .leaflet-popup-close-button,
      .drone-route-popup .leaflet-popup-close-button {
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

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-video">
      {/* Map Container - Always rendered for Leaflet to initialize */}
      <div 
        ref={mapContainer} 
        className={cn(
          "absolute inset-0 z-0",
          (loading || mapError) && "invisible"
        )} 
      />
      
      {/* Error State Overlay */}
      {mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive font-medium">ম্যাপ লোড করতে সমস্যা হয়েছে</p>
            <p className="text-xs text-muted-foreground mt-1">{mapError}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => {
                setMapError(null);
                setLoading(true);
                // Force re-mount by clearing refs
                if (map.current) {
                  map.current.remove();
                  map.current = null;
                }
                // Trigger re-initialization
                setTimeout(() => {
                  if (mapContainer.current && !map.current) {
                    try {
                      map.current = L.map(mapContainer.current, {
                        center: [latitude, longitude],
                        zoom: 10,
                        zoomControl: false,
                        attributionControl: false,
                      });
                      
                      const layerConfig = tileLayers[activeLayer];
                      tileLayerRef.current = L.tileLayer(layerConfig.url, {
                        maxZoom: 18,
                        attribution: layerConfig.attribution,
                      }).addTo(map.current);
                      
                      markersLayer.current = L.layerGroup().addTo(map.current);
                      routesLayer.current = L.layerGroup().addTo(map.current);
                      L.control.zoom({ position: 'topright' }).addTo(map.current);
                      
                      setLoading(false);
                      setIsMapReady(true);
                    } catch (err) {
                      setMapError(err instanceof Error ? err.message : 'পুনরায় লোড ব্যর্থ');
                      setLoading(false);
                    }
                  }
                }, 100);
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </div>
      )}

      {/* Loading State Overlay */}
      {loading && !mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">স্যাটেলাইট ডেটা লোড হচ্ছে...</p>
            <p className="text-xs text-muted-foreground mt-1">NDVI হিটম্যাপ প্রস্তুত হচ্ছে</p>
          </div>
        </div>
      )}

      {/* Map Controls - only show when map is ready */}
      {!loading && !mapError && (
        <>
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
        <Button
          size="sm"
          variant={routesVisible ? 'default' : 'ghost'}
          onClick={() => setRoutesVisible(!routesVisible)}
          className="h-7 text-xs"
        >
          <Navigation className="w-3 h-3 mr-1" />
          ড্রোন
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

      {/* Drone Route Stats Panel */}
      {routeStats && routesVisible && (
        <div className="absolute top-12 right-12 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <p className="text-[10px] text-muted-foreground mb-1">ড্রোন রুট</p>
          <div className="flex gap-2 text-xs">
            <div className="text-center">
              <p className="font-bold text-amber-500">{routeStats.inProgress}</p>
              <p className="text-[9px] text-muted-foreground">চলমান</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-green-500">{routeStats.completed}</p>
              <p className="text-[9px] text-muted-foreground">সম্পন্ন</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-blue-500">{routeStats.pending}</p>
              <p className="text-[9px] text-muted-foreground">অপেক্ষায়</p>
            </div>
          </div>
        </div>
      )}

      {/* Legends */}
      <div className="absolute bottom-3 left-3 z-[1000] flex gap-2">
        {/* NDVI Legend */}
        {heatmapVisible && (
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
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
        )}
        
        {/* Drone Route Legend */}
        {routesVisible && (
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <p className="text-[10px] text-muted-foreground mb-1.5">ড্রোন রুট</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 bg-blue-500" style={{ borderStyle: 'dashed' }} />
                <span className="text-[8px] text-muted-foreground">অপেক্ষায়</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 bg-amber-500" />
                <span className="text-[8px] text-muted-foreground">চলমান</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 bg-green-500" />
                <span className="text-[8px] text-muted-foreground">সম্পন্ন</span>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

export default NASASatelliteMap;
