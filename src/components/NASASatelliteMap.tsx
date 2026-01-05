import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, Radio, Leaf, Satellite, Map as MapIcon, Navigation, Droplets, Thermometer, CloudRain, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

// Extended layer types with NASA data products
type TileLayer = 'satellite' | 'terrain' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation' | 'flood' | 'true_color';

// Layer metadata for UI
const LAYER_INFO: Record<TileLayer, { name: string; nameBn: string; icon: string; description: string }> = {
  satellite: { name: 'Satellite', nameBn: 'স্যাটেলাইট', icon: 'satellite', description: 'Esri World Imagery' },
  terrain: { name: 'Map', nameBn: 'ম্যাপ', icon: 'map', description: 'Dark terrain map' },
  ndvi: { name: 'NDVI', nameBn: 'NDVI', icon: 'leaf', description: 'NASA MODIS Vegetation Index' },
  soil_moisture: { name: 'Soil Moisture', nameBn: 'মাটির আর্দ্রতা', icon: 'droplets', description: 'NASA SMAP Soil Moisture' },
  lst: { name: 'Temperature', nameBn: 'তাপমাত্রা', icon: 'thermometer', description: 'MODIS Land Surface Temperature' },
  precipitation: { name: 'Rainfall', nameBn: 'বৃষ্টিপাত', icon: 'cloud-rain', description: 'NASA GPM Precipitation' },
  flood: { name: 'Flood', nameBn: 'বন্যা', icon: 'alert', description: 'MODIS Flood Detection' },
  true_color: { name: 'True Color', nameBn: 'প্রকৃত রঙ', icon: 'image', description: 'VIIRS True Color Imagery' }
};

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
  const overlayLayerRef = useRef<L.TileLayer | null>(null);
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
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showAppEEARS, setShowAppEEARS] = useState(false);

  // Get dynamic dates for NASA GIBS tiles
  const gibsDate = getGIBSDate(10); // 10 days back for reliability
  const gibsDateRecent = getGIBSDate(3); // 3 days back for true color

  // Tile layer configurations with all NASA GIBS products
  const tileLayers: Record<TileLayer, { url: string; attribution: string; maxZoom: number; opacity?: number }> = {
    satellite: {
      ...TILE_LAYERS.satellite,
      maxZoom: TILE_LAYERS.satellite.maxZoom || 18
    },
    terrain: {
      ...TILE_LAYERS.terrain,
      maxZoom: TILE_LAYERS.terrain.maxZoom || 18
    },
    ndvi: {
      ...TILE_LAYERS.getNDVILayer(gibsDate),
      maxZoom: 9,
      opacity: 0.85
    },
    soil_moisture: {
      ...TILE_LAYERS.getSoilMoistureLayer(gibsDate),
      maxZoom: 7,
      opacity: 0.8
    },
    lst: {
      ...TILE_LAYERS.getLSTLayer(gibsDate),
      maxZoom: 7,
      opacity: 0.8
    },
    precipitation: {
      ...TILE_LAYERS.getPrecipitationLayer(gibsDate),
      maxZoom: 6,
      opacity: 0.7
    },
    flood: {
      ...TILE_LAYERS.getFloodLayer(gibsDate),
      maxZoom: 8,
      opacity: 0.8
    },
    true_color: {
      ...TILE_LAYERS.getTrueColorLayer(gibsDateRecent),
      maxZoom: 9,
      opacity: 1
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

      // Add base layer first
      const baseLayer = L.tileLayer(TILE_LAYERS.light.url, {
        maxZoom: 18,
        attribution: TILE_LAYERS.light.attribution
      }).addTo(map.current);

      // Add initial overlay layer
      const initialLayerConfig = tileLayers[activeLayer];
      if (needsBaseMap.includes(activeLayer)) {
        // NASA overlay on top of base
        overlayLayerRef.current = L.tileLayer(initialLayerConfig.url, {
          maxZoom: initialLayerConfig.maxZoom || 18,
          attribution: initialLayerConfig.attribution,
          opacity: initialLayerConfig.opacity || 0.85,
          errorTileUrl: '',
        }).addTo(map.current);
      } else {
        // Replace base with this layer
        map.current.removeLayer(baseLayer);
        tileLayerRef.current = L.tileLayer(initialLayerConfig.url, {
          maxZoom: initialLayerConfig.maxZoom || 18,
          attribution: initialLayerConfig.attribution,
          errorTileUrl: '',
        }).addTo(map.current);
      }

      // Add markers layer
      markersLayer.current = L.layerGroup().addTo(map.current);
      
      // Add routes layer
      routesLayer.current = L.layerGroup().addTo(map.current);

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map.current);

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
        tileLayerRef.current = null;
        overlayLayerRef.current = null;
      }
    };
  }, []);

  // NASA GIBS layers that need a base map underneath
  const needsBaseMap = ['ndvi', 'soil_moisture', 'lst', 'precipitation', 'flood'];

  // Switch tile layers - handles all NASA data products
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    console.log('[NASASatelliteMap] Switching to layer:', activeLayer);
    console.log('[NASASatelliteMap] Using NASA GIBS date:', gibsDate);

    // Remove existing tile layers but keep markers and routes
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.current!.removeLayer(layer);
      }
    });

    // Reset refs
    tileLayerRef.current = null;
    overlayLayerRef.current = null;

    const layerConfig = tileLayers[activeLayer];
    
    console.log('[NASASatelliteMap] Layer URL:', layerConfig.url);
    console.log('[NASASatelliteMap] Layer attribution:', layerConfig.attribution);
    
    // For NASA GIBS layers, add a base map first for context
    if (needsBaseMap.includes(activeLayer)) {
      // Add light base map
      tileLayerRef.current = L.tileLayer(TILE_LAYERS.light.url, {
        maxZoom: 18,
        attribution: TILE_LAYERS.light.attribution
      }).addTo(map.current);
      
      // Add NASA overlay on top
      overlayLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        attribution: layerConfig.attribution,
        errorTileUrl: '',
        opacity: layerConfig.opacity || 0.85,
      });
      
      overlayLayerRef.current.on('tileerror', (error) => {
        console.warn('[NASASatelliteMap] NASA GIBS tile error on', activeLayer, '- this is normal for dates without data');
      });
      
      overlayLayerRef.current.on('loading', () => {
        console.log('[NASASatelliteMap] Loading NASA GIBS tiles for', activeLayer);
      });
      
      overlayLayerRef.current.on('load', () => {
        console.log('[NASASatelliteMap] NASA GIBS tiles loaded for', activeLayer);
      });

      overlayLayerRef.current.addTo(map.current);
      console.log(`[NASASatelliteMap] ✓ Added ${activeLayer} NASA layer with base map`);
    } else {
      // Regular layer (satellite, terrain, true_color) - no base needed
      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        attribution: layerConfig.attribution,
        errorTileUrl: '',
        opacity: layerConfig.opacity || 1,
      });

      tileLayerRef.current.on('tileerror', (error) => {
        console.warn('[NASASatelliteMap] Tile error on', activeLayer);
      });

      tileLayerRef.current.addTo(map.current);
      console.log(`[NASASatelliteMap] ✓ Added ${activeLayer} layer`);
    }

    setLastUpdate(new Date());

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
                if (map.current) {
                  map.current.remove();
                  map.current = null;
                }
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
            <p className="text-xs text-muted-foreground mt-1">NASA GIBS থেকে ডেটা আনা হচ্ছে</p>
          </div>
        </div>
      )}

      {/* Map Controls - only show when map is ready */}
      {!loading && !mapError && (
        <>
      {/* Layer Toggle - Mobile Responsive */}
      <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-1 max-w-[calc(100%-60px)] sm:max-w-none">
        {/* Primary layer controls - scrollable on mobile */}
        <div className="flex gap-1 bg-background/95 backdrop-blur-md rounded-lg p-1 shadow-lg overflow-x-auto">
          <Button
            size="sm"
            variant={activeLayer === 'satellite' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('satellite')}
            className="h-7 text-[10px] sm:text-xs shrink-0 px-2 sm:px-3"
          >
            <Satellite className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">স্যাটেলাইট</span>
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'ndvi' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('ndvi')}
            className="h-7 text-[10px] sm:text-xs shrink-0 px-2 sm:px-3"
          >
            <Leaf className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">NDVI</span>
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'soil_moisture' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('soil_moisture')}
            className="h-7 text-[10px] sm:text-xs shrink-0 px-2 sm:px-3"
          >
            <Droplets className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">আর্দ্রতা</span>
          </Button>
          <Button
            size="sm"
            variant={showLayerMenu ? 'secondary' : 'ghost'}
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="h-7 text-[10px] sm:text-xs shrink-0 px-2"
          >
            +{Object.keys(tileLayers).length - 3}
          </Button>
        </div>

        {/* Extended NASA layers menu - Mobile optimized */}
        {showLayerMenu && (
          <div className="bg-background/95 backdrop-blur-md rounded-lg p-2 shadow-lg border border-border max-w-[200px] sm:max-w-none">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">NASA ডেটা লেয়ার</p>
              <span className="text-[8px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant={activeLayer === 'lst' ? 'default' : 'ghost'}
                onClick={() => { setActiveLayer('lst'); setShowLayerMenu(false); }}
                className="h-6 sm:h-7 text-[9px] sm:text-xs justify-start px-1.5 sm:px-2"
              >
                <Thermometer className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                তাপমাত্রা
              </Button>
              <Button
                size="sm"
                variant={activeLayer === 'precipitation' ? 'default' : 'ghost'}
                onClick={() => { setActiveLayer('precipitation'); setShowLayerMenu(false); }}
                className="h-6 sm:h-7 text-[9px] sm:text-xs justify-start px-1.5 sm:px-2"
              >
                <CloudRain className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                বৃষ্টিপাত
              </Button>
              <Button
                size="sm"
                variant={activeLayer === 'flood' ? 'default' : 'ghost'}
                onClick={() => { setActiveLayer('flood'); setShowLayerMenu(false); }}
                className="h-6 sm:h-7 text-[9px] sm:text-xs justify-start px-1.5 sm:px-2"
              >
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                বন্যা
              </Button>
              <Button
                size="sm"
                variant={activeLayer === 'true_color' ? 'default' : 'ghost'}
                onClick={() => { setActiveLayer('true_color'); setShowLayerMenu(false); }}
                className="h-6 sm:h-7 text-[9px] sm:text-xs justify-start px-1.5 sm:px-2"
              >
                <Satellite className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                VIIRS
              </Button>
              <Button
                size="sm"
                variant={activeLayer === 'terrain' ? 'default' : 'ghost'}
                onClick={() => { setActiveLayer('terrain'); setShowLayerMenu(false); }}
                className="h-6 sm:h-7 text-[9px] sm:text-xs justify-start px-1.5 sm:px-2 col-span-2"
              >
                <MapIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                ম্যাপ ভিউ
              </Button>
            </div>
            <p className="text-[7px] sm:text-[8px] text-muted-foreground mt-1.5">NASA GIBS: {gibsDate}</p>
          </div>
        )}
        
        {/* Overlay toggles - Compact on mobile */}
        <div className="flex gap-1 bg-background/95 backdrop-blur-md rounded-lg p-1 shadow-lg">
          <Button
            size="sm"
            variant={heatmapVisible ? 'default' : 'ghost'}
            onClick={() => setHeatmapVisible(!heatmapVisible)}
            className="h-6 text-[9px] sm:text-[10px] px-1.5 sm:px-2"
          >
            <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
            <span className="hidden sm:inline">জোন</span>
          </Button>
          <Button
            size="sm"
            variant={routesVisible ? 'default' : 'ghost'}
            onClick={() => setRoutesVisible(!routesVisible)}
            className="h-6 text-[9px] sm:text-[10px] px-1.5 sm:px-2"
          >
            <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
            <span className="hidden sm:inline">ড্রোন</span>
          </Button>
          <Button
            size="sm"
            variant={showAppEEARS ? 'secondary' : 'ghost'}
            onClick={() => setShowAppEEARS(!showAppEEARS)}
            className="h-6 text-[9px] sm:text-[10px] px-1.5 sm:px-2"
          >
            <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
            <span className="hidden sm:inline">চার্ট</span>
          </Button>
        </div>
      </div>

      {/* AppEEARS Panel - Mobile responsive positioning */}
      {showAppEEARS && (
        <div className="absolute bottom-16 sm:bottom-14 left-2 sm:left-3 z-[1001] w-[calc(100%-16px)] sm:w-72 md:w-80">
          <AppEEARSPanel 
            latitude={latitude} 
            longitude={longitude} 
            onClose={() => setShowAppEEARS(false)}
          />
        </div>
      )}

      {/* Real-time indicator & Controls - Top right, compact */}
      <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1">
        <div className="bg-background/95 backdrop-blur-md rounded-lg px-1.5 py-1 shadow-lg flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500 animate-pulse" />
          <span className="text-[8px] sm:text-[10px] text-green-500">NASA</span>
        </div>
        <div className="bg-background/95 backdrop-blur-md rounded-lg shadow-lg flex flex-col">
          <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-6 w-6 sm:h-7 sm:w-7 p-0">
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-6 w-6 sm:h-7 sm:w-7 p-0">
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleRefresh} className="h-6 w-6 sm:h-7 sm:w-7 p-0" disabled={refreshing}>
            <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats Panels Container - Positioned to avoid overlap */}
      <div className="absolute top-14 sm:top-16 left-2 right-2 z-[999] flex flex-wrap gap-1.5 sm:gap-2 pointer-events-none">
        {/* NDVI Stats Panel */}
        {ndviStats && heatmapVisible && (
          <div className="bg-background/95 backdrop-blur-md rounded-lg px-2 py-1.5 sm:p-2 shadow-lg pointer-events-auto">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-1">NDVI</p>
            <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs">
              <div className="text-center">
                <p className={cn("font-bold text-sm sm:text-base", ndviStats.avg >= 0.6 ? "text-green-500" : ndviStats.avg >= 0.4 ? "text-yellow-500" : "text-red-500")}>
                  {(ndviStats.avg * 100).toFixed(0)}%
                </p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground">গড়</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-bold text-sm sm:text-base text-red-500">{ndviStats.stressed}</p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground">ঝুঁকি</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-bold text-sm sm:text-base text-foreground">{ndviStats.total}</p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground">জোন</p>
              </div>
            </div>
          </div>
        )}

        {/* Drone Route Stats Panel */}
        {routeStats && routesVisible && (
          <div className="bg-background/95 backdrop-blur-md rounded-lg px-2 py-1.5 sm:p-2 shadow-lg pointer-events-auto">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-1">ড্রোন</p>
            <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs">
              <div className="text-center">
                <p className="font-bold text-sm sm:text-base text-amber-500">{routeStats.inProgress}</p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground">চলমান</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-bold text-sm sm:text-base text-green-500">{routeStats.completed}</p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground">সম্পন্ন</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-bold text-sm sm:text-base text-blue-500">{routeStats.pending}</p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground">অপেক্ষায়</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legends - Bottom left, Mobile responsive */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-[1000] flex flex-col sm:flex-row gap-1.5 sm:gap-2 max-w-[calc(100%-60px)] sm:max-w-none">
        {/* Active Layer Legend */}
        <div className="bg-background/95 backdrop-blur-md rounded-lg px-2 py-1.5 sm:p-2 shadow-lg">
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            {activeLayer === 'ndvi' && <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {activeLayer === 'soil_moisture' && <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {activeLayer === 'lst' && <Thermometer className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {activeLayer === 'precipitation' && <CloudRain className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {activeLayer === 'flood' && <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            <span className="truncate">{LAYER_INFO[activeLayer]?.nameBn || activeLayer}</span>
          </p>
          <div className="flex items-center gap-1">
            <div className="h-1.5 sm:h-2 w-16 sm:w-20 rounded-full" style={{
              background: activeLayer === 'ndvi' 
                ? 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)'
                : activeLayer === 'soil_moisture'
                ? 'linear-gradient(to right, #f97316, #eab308, #22d3ee, #3b82f6, #1e3a8a)'
                : activeLayer === 'lst'
                ? 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                : activeLayer === 'precipitation'
                ? 'linear-gradient(to right, #f0f9ff, #93c5fd, #3b82f6, #1e40af, #581c87)'
                : activeLayer === 'flood'
                ? 'linear-gradient(to right, #fef9c3, #3b82f6, #1e3a8a)'
                : 'linear-gradient(to right, #525252, #a3a3a3)'
            }} />
          </div>
          <div className="flex justify-between text-[7px] sm:text-[8px] text-muted-foreground mt-0.5">
            {activeLayer === 'ndvi' && <><span>০%</span><span>১০০%</span></>}
            {activeLayer === 'soil_moisture' && <><span>শুষ্ক</span><span>ভেজা</span></>}
            {activeLayer === 'lst' && <><span>ঠাণ্ডা</span><span>গরম</span></>}
            {activeLayer === 'precipitation' && <><span>কম</span><span>বেশি</span></>}
            {activeLayer === 'flood' && <><span>স্বাভাবিক</span><span>বন্যা</span></>}
            {(activeLayer === 'satellite' || activeLayer === 'terrain' || activeLayer === 'true_color') && (
              <span className="text-[7px] sm:text-[8px] truncate">{LAYER_INFO[activeLayer]?.description}</span>
            )}
          </div>
        </div>
        
        {/* Drone Route Legend - Show on larger screens or when routes are few */}
        {routesVisible && (
          <div className="hidden sm:block bg-background/95 backdrop-blur-md rounded-lg p-2 shadow-lg">
            <p className="text-[10px] text-muted-foreground mb-1">ড্রোন রুট</p>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-3 sm:w-4 h-0.5 bg-blue-500 border-dashed border-t" />
                <span className="text-[7px] sm:text-[8px] text-muted-foreground">অপেক্ষায়</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 sm:w-4 h-0.5 bg-amber-500" />
                <span className="text-[7px] sm:text-[8px] text-muted-foreground">চলমান</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 sm:w-4 h-0.5 bg-green-500" />
                <span className="text-[7px] sm:text-[8px] text-muted-foreground">সম্পন্ন</span>
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
