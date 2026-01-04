// NASA Farm Navigators Map Component
// Comprehensive spatial visualization of NASA agricultural data

import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Satellite, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  AlertTriangle, 
  Leaf, 
  Activity,
  MapPin,
  Layers,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface MapLayer {
  id: string;
  name: string;
  nameBn: string;
  type: 'openet' | 'soil_moisture' | 'ndvi' | 'weather' | 'drought' | 'temperature';
  icon: any;
  color: string;
  opacity: number;
  visible: boolean;
  data?: any[];
}

interface FieldData {
  id?: string;
  field_id?: string;
  name?: string;
  field_name?: string;
  nameBn?: string;
  field_name_bn?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  area_acres?: number;
  [key: string]: any;
}

interface NASAFarmMapProps {
  openETData?: any[];
  soilData?: any[];
  satelliteData?: any[];
  weatherData?: any;
  centerLat?: number;
  centerLng?: number;
  onFieldClick?: (field: any) => void;
}

export function NASAFarmMap({ 
  openETData = [], 
  soilData = [], 
  satelliteData = [], 
  weatherData,
  centerLat = 23.8103,
  centerLng = 90.4125,
  onFieldClick 
}: NASAFarmMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const heatmapLayer = useRef<L.LayerGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<string>('overview');
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'overview',
      name: 'Overview',
      nameBn: 'ওভারভিউ',
      type: 'ndvi',
      icon: Satellite,
      color: '#22c55e',
      opacity: 0.8,
      visible: true
    },
    {
      id: 'openet',
      name: 'OpenET Water',
      nameBn: 'OpenET জল',
      type: 'openet',
      icon: Droplets,
      color: '#3b82f6',
      opacity: 0.7,
      visible: false
    },
    {
      id: 'soil',
      name: 'Soil Moisture',
      nameBn: 'মাটির আর্দ্রতা',
      type: 'soil_moisture',
      icon: Activity,
      color: '#f97316',
      opacity: 0.7,
      visible: false
    },
    {
      id: 'ndvi',
      name: 'NDVI Health',
      nameBn: 'NDVI স্বাস্থ্য',
      type: 'ndvi',
      icon: Leaf,
      color: '#10b981',
      opacity: 0.8,
      visible: false
    },
    {
      id: 'drought',
      name: 'Drought Risk',
      nameBn: 'খরা ঝুঁকি',
      type: 'drought',
      icon: AlertTriangle,
      color: '#ef4444',
      opacity: 0.7,
      visible: false
    },
    {
      id: 'temperature',
      name: 'Temperature',
      nameBn: 'তাপমাত্রা',
      type: 'temperature',
      icon: Thermometer,
      color: '#eab308',
      opacity: 0.6,
      visible: false
    }
  ]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    setLoading(true);
    try {
      // Create map instance
      map.current = L.map(mapContainer.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Add base tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Create layers
      markersLayer.current = L.layerGroup().addTo(map.current);
      heatmapLayer.current = L.layerGroup().addTo(map.current);

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map.current);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [centerLat, centerLng]);

  // Update map data when layers change
  useEffect(() => {
    if (!map.current || !markersLayer.current || !heatmapLayer.current) return;

    // Clear existing layers
    markersLayer.current.clearLayers();
    heatmapLayer.current.clearLayers();

    const activeLayer = layers.find(l => l.id === selectedLayer);
    if (!activeLayer || !activeLayer.visible) return;

    // Get data based on selected layer
    let data: FieldData[] = [];
    switch (activeLayer.type) {
      case 'openet':
        data = openETData;
        break;
      case 'soil_moisture':
        data = soilData;
        break;
      case 'ndvi':
        data = satelliteData;
        break;
      default:
        data = [...openETData, ...soilData, ...satelliteData];
    }

    // Add markers for each field
    data.forEach((field, index) => {
      const lat = field.latitude || centerLat + (Math.random() - 0.5) * 0.1;
      const lng = field.longitude || centerLng + (Math.random() - 0.5) * 0.1;

      // Get field names with fallbacks
      const fieldName = field.name || field.field_name || `Field ${index + 1}`;
      const fieldNameBn = field.nameBn || field.field_name_bn || fieldName;

      // Calculate marker properties based on layer type
      let markerColor = activeLayer.color;
      let markerSize = 40;
      let value = 0;
      let status = 'normal';

      switch (activeLayer.type) {
        case 'openet':
          value = field.current_et?.et_value || Math.random() * 8;
          markerColor = value > 6 ? '#ef4444' : value > 4 ? '#f97316' : '#3b82f6';
          break;
        case 'soil_moisture':
          value = (field.current_data?.surface_moisture || Math.random()) * 100;
          markerColor = value < 30 ? '#ef4444' : value < 60 ? '#f97316' : '#10b981';
          break;
        case 'ndvi':
          value = (field.vegetation_indices?.ndvi || Math.random()) * 100;
          markerColor = value < 40 ? '#ef4444' : value < 70 ? '#f97316' : '#10b981';
          break;
        case 'drought':
          value = field.current_data?.drought_index || Math.random();
          markerColor = value > 0.7 ? '#ef4444' : value > 0.5 ? '#f97316' : '#10b981';
          break;
        case 'temperature':
          value = field.current_conditions?.temperature_avg || 25 + Math.random() * 15;
          markerColor = value > 35 ? '#ef4444' : value > 30 ? '#f97316' : '#3b82f6';
          break;
      }

      // Create custom marker
      const iconHtml = `
        <div class="nasa-field-marker" style="
          position: relative;
          width: ${markerSize}px;
          height: ${markerSize}px;
        ">
          <div style="
            position: absolute;
            width: ${markerSize}px;
            height: ${markerSize}px;
            background: ${markerColor}cc;
            border: 3px solid ${markerColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${markerSize/4}px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            ${Math.round(value)}
          </div>
          ${value > 70 ? `
            <div style="
              position: absolute;
              inset: -5px;
              border-radius: 50%;
              background: ${markerColor}40;
              animation: pulse 2s infinite ease-in-out;
            "></div>
          ` : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'nasa-custom-marker',
        html: iconHtml,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(markersLayer.current);

      // Create popup
      const popupContent = `
        <div style="min-width: 200px; padding: 8px; font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
            ${fieldNameBn}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
            <div><strong>স্তর:</strong> ${activeLayer.nameBn}</div>
            <div><strong>মান:</strong> ${value.toFixed(1)}</div>
            <div><strong>এলাকা:</strong> ${field.area || field.area_acres || 1} একর</div>
            <div><strong>অবস্থা:</strong> <span style="color: ${markerColor}">${status}</span></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onFieldClick?.(field));
    });

    // Add heatmap overlay for overview
    if (selectedLayer === 'overview') {
      // Create a simple heatmap visualization
      const heatPoints = data.map(field => ({
        lat: field.latitude || centerLat + (Math.random() - 0.5) * 0.1,
        lng: field.longitude || centerLng + (Math.random() - 0.5) * 0.1,
        intensity: Math.random()
      }));

      heatPoints.forEach(point => {
        const circle = L.circle([point.lat, point.lng], {
          radius: 500,
          fillColor: '#10b981',
          fillOpacity: point.intensity * 0.3,
          stroke: false,
        }).addTo(heatmapLayer.current);
      });
    }

  }, [selectedLayer, layers, openETData, soilData, satelliteData, centerLat, centerLng, onFieldClick]);

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  // Get statistics for current layer
  const getLayerStats = () => {
    const activeLayer = layers.find(l => l.id === selectedLayer);
    if (!activeLayer) return null;

    let data: FieldData[] = [];
    switch (activeLayer.type) {
      case 'openet':
        data = openETData;
        break;
      case 'soil_moisture':
        data = soilData;
        break;
      case 'ndvi':
        data = satelliteData;
        break;
      default:
        data = [...openETData, ...soilData, ...satelliteData];
    }

    return {
      totalFields: data.length,
      avgValue: data.length > 0 ? data.reduce((sum, field) => {
        let value = 0;
        switch (activeLayer.type) {
          case 'openet':
            value = field.current_et?.et_value || 0;
            break;
          case 'soil_moisture':
            value = (field.current_data?.surface_moisture || 0) * 100;
            break;
          case 'ndvi':
            value = (field.vegetation_indices?.ndvi || 0) * 100;
            break;
        }
        return sum + value;
      }, 0) / data.length : 0,
      highRisk: data.filter(field => {
        let value = 0;
        switch (activeLayer.type) {
          case 'openet':
            value = field.current_et?.et_value || 0;
            return value > 6;
          case 'soil_moisture':
            value = field.current_data?.surface_moisture || 0;
            return value < 0.3;
          case 'ndvi':
            value = field.vegetation_indices?.ndvi || 0;
            return value < 0.4;
        }
        return false;
      }).length
    };
  };

  const stats = getLayerStats();

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 z-0"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">NASA মানচিত্র লোড হচ্ছে...</p>
          </div>
        </div>
      )}

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              NASA ডেটা স্তর
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.id} className="flex items-center justify-between">
                  <Button
                    variant={selectedLayer === layer.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedLayer(layer.id)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Icon className="w-3 h-3" style={{ color: layer.color }} />
                    {layer.nameBn}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer(layer.id)}
                    className="p-1"
                  >
                    {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Statistics Panel */}
      {stats && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">সারসংক্ষেপ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>মোট ফিল্ড:</span>
                <span className="font-semibold">{stats.totalFields}</span>
              </div>
              <div className="flex justify-between">
                <span>গড় মান:</span>
                <span className="font-semibold">{stats.avgValue.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>ঝুঁকিপূর্ণ:</span>
                <span className="font-semibold text-red-600">{stats.highRisk}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
          <CardContent className="p-3">
            <div className="text-xs font-semibold mb-2">লিজেন্ড</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>স্বাভাবিক</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>মাঝারি</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>ঝুঁকিপূর্ণ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
          <Download className="w-3 h-3 mr-1" />
          রপ্ট
        </Button>
        <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
          <Filter className="w-3 h-3 mr-1" />
          ফিল্টার
        </Button>
      </div>

      {/* Add custom styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.3;
          }
        }
        
        .nasa-field-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
