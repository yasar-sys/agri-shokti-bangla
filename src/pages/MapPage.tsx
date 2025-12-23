import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Layers, 
  Plus, 
  RefreshCw, 
  MapPin, 
  Satellite,
  Mountain,
  Map as MapIcon,
  Loader2,
  Navigation,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapMarker } from "@/components/ui/MapMarker";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Field {
  id: string;
  name: string;
  status: "healthy" | "warning" | "disease";
  healthScore: number;
  lastScan: string;
  position: { lat: number; lng: number };
}

const fieldsData: Field[] = [
  { id: "1", name: "উত্তর জমি", status: "healthy", healthScore: 92, lastScan: "২ ঘণ্টা আগে", position: { lat: 23.8103, lng: 90.4125 } },
  { id: "2", name: "দক্ষিণ জমি", status: "warning", healthScore: 68, lastScan: "১ দিন আগে", position: { lat: 23.8050, lng: 90.4180 } },
  { id: "3", name: "পশ্চিম জমি", status: "disease", healthScore: 35, lastScan: "৩ ঘণ্টা আগে", position: { lat: 23.8000, lng: 90.4050 } },
  { id: "4", name: "পূর্ব জমি", status: "healthy", healthScore: 88, lastScan: "৫ ঘণ্টা আগে", position: { lat: 23.8150, lng: 90.4250 } },
];

const mapStyles = [
  { id: 'streets', name: 'রাস্তা', icon: MapIcon, style: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite', name: 'স্যাটেলাইট', icon: Satellite, style: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'outdoors', name: 'ভূপ্রকৃতি', icon: Mountain, style: 'mapbox://styles/mapbox/outdoors-v12' },
];

export default function MapPage() {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStyle, setCurrentStyle] = useState(0);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const location = useLocation();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Failed to get Mapbox token:', error);
        toast.error("ম্যাপ লোড করতে সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    const centerLat = location.latitude || 23.8103;
    const centerLng = location.longitude || 90.4125;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[currentStyle].style,
      center: [centerLng, centerLat],
      zoom: 14,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add markers for fields
    fieldsData.forEach((field) => {
      const el = document.createElement('div');
      el.className = 'field-marker';
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${
          field.status === 'healthy' ? 'bg-emerald-500' :
          field.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
        }">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      `;

      el.addEventListener('click', () => setSelectedField(field));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([field.position.lng, field.position.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, location.latitude, location.longitude]);

  // Update map style
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyles[currentStyle].style);
    }
  }, [currentStyle]);

  const handleCenterOnLocation = () => {
    if (map.current && location.latitude && location.longitude) {
      map.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 15,
        pitch: 45
      });
    }
  };

  const handleRefresh = () => {
    toast.success("ম্যাপ রিফ্রেশ হয়েছে");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Map Container */}
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">ম্যাপ লোড হচ্ছে...</p>
          </div>
        </div>
      ) : mapboxToken ? (
        <div ref={mapContainer} className="absolute inset-0" />
      ) : (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${villageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/80" />
          {/* Fallback grid pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(123, 242, 160, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(123, 242, 160, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          {/* Fallback markers */}
          {fieldsData.map((field, idx) => (
            <div
              key={field.id}
              className="absolute"
              style={{ 
                top: `${25 + idx * 12}%`, 
                left: `${30 + idx * 10}%` 
              }}
            >
              <MapMarker
                status={field.status}
                fieldName={field.name}
                healthScore={field.healthScore}
                lastScan={field.lastScan}
                onClick={() => setSelectedField(field)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="glass-strong border border-border/30 shadow-elevated">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="glass-strong rounded-2xl px-4 py-2 border border-border/30 shadow-elevated">
            <h1 className="text-lg font-bold text-foreground">জমির মানচিত্র</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>{location.loading ? 'খুঁজছি...' : location.city}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="glass-strong border border-border/30 shadow-elevated"
                onClick={() => setShowStylePicker(!showStylePicker)}
              >
                <Layers className="w-5 h-5" />
              </Button>
              {showStylePicker && (
                <div className="absolute right-0 top-12 glass-strong rounded-xl border border-border/30 p-2 shadow-elevated min-w-[120px]">
                  {mapStyles.map((style, idx) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setCurrentStyle(idx);
                        setShowStylePicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentStyle === idx ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <style.icon className="w-4 h-4" />
                      <span>{style.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="glass-strong border border-border/30 shadow-elevated"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom Controls */}
      <div className="absolute bottom-32 right-4 z-20 flex flex-col gap-2">
        <Button 
          size="icon"
          className="w-12 h-12 rounded-full glass-strong border border-border/30 shadow-elevated"
          onClick={handleCenterOnLocation}
        >
          <Navigation className="w-5 h-5" />
        </Button>
        <Button 
          size="icon"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 left-4 right-20 z-20">
        <div className="glass-strong rounded-2xl p-4 border border-border/30 shadow-elevated">
          <h3 className="font-medium text-foreground mb-3">জমির স্বাস্থ্য</h3>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">সুস্থ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-sm text-muted-foreground">সতর্কতা</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">রোগাক্রান্ত</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Field Detail */}
      {selectedField && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setSelectedField(null)}>
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
          <div 
            className="relative w-full p-6 rounded-t-3xl glass-strong border-t border-border/30 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedField.name}</h2>
                <p className="text-sm text-muted-foreground">শেষ স্ক্যান: {selectedField.lastScan}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedField.status === "healthy" 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : selectedField.status === "warning"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {selectedField.status === "healthy" ? "সুস্থ" : selectedField.status === "warning" ? "সতর্কতা" : "রোগাক্রান্ত"}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">স্বাস্থ্য স্কোর</p>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    selectedField.healthScore >= 80 
                      ? "bg-emerald-500" 
                      : selectedField.healthScore >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${selectedField.healthScore}%` }}
                />
              </div>
              <p className="text-right text-sm text-foreground mt-1">{selectedField.healthScore}%</p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                বিস্তারিত দেখুন
              </Button>
              <Button variant="outline" className="flex-1 border-border/50">
                স্ক্যান করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
