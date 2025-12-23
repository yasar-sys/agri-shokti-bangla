import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Layers, 
  Plus, 
  RefreshCw, 
  MapPin,
  Loader2,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Note: We use custom divIcon markers everywhere, so we don't rely on Leaflet's default PNG assets
// (this avoids bundler issues with marker-icon.png in some Vite builds).

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

const tileLayerOptions = [
  { 
    id: 'streets', 
    name: 'রাস্তা', 
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  { 
    id: 'satellite', 
    name: 'স্যাটেলাইট', 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  { 
    id: 'topo', 
    name: 'টপোগ্রাফি', 
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap'
  },
];

// Custom marker icons based on status
const createCustomIcon = (status: "healthy" | "warning" | "disease") => {
  const color = status === "healthy" ? "#10b981" : status === "warning" ? "#f59e0b" : "#ef4444";
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Component to handle map center updates
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  
  return null;
}

// Component to handle locate control
function LocateButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      size="icon"
      className="w-12 h-12 rounded-full glass-strong border border-border/30 shadow-elevated"
      onClick={onClick}
    >
      <Navigation className="w-5 h-5" />
    </Button>
  );
}

export default function MapPage() {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTileLayer, setCurrentTileLayer] = useState(0);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]);
  const location = useLocation();

  // Update center when location is available
  useEffect(() => {
    if (location.latitude && location.longitude && !location.loading) {
      setMapCenter([location.latitude, location.longitude]);
    }
  }, [location.latitude, location.longitude, location.loading]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCenterOnLocation = () => {
    if (location.latitude && location.longitude) {
      setMapCenter([location.latitude, location.longitude]);
      toast.success("আপনার অবস্থানে ফোকাস করা হয়েছে");
    } else {
      toast.error("অবস্থান পাওয়া যায়নি");
    }
  };

  const handleRefresh = () => {
    toast.success("ম্যাপ রিফ্রেশ হয়েছে");
  };

  const getStatusText = (status: "healthy" | "warning" | "disease") => {
    switch(status) {
      case "healthy": return "সুস্থ";
      case "warning": return "সতর্কতা";
      case "disease": return "রোগাক্রান্ত";
    }
  };

  const getStatusColor = (status: "healthy" | "warning" | "disease") => {
    switch(status) {
      case "healthy": return "bg-emerald-500/20 text-emerald-400";
      case "warning": return "bg-amber-500/20 text-amber-400";
      case "disease": return "bg-red-500/20 text-red-400";
    }
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
      ) : (
        <div className="absolute inset-0">
          <MapContainer 
            center={mapCenter} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution={tileLayerOptions[currentTileLayer].attribution}
              url={tileLayerOptions[currentTileLayer].url}
            />
            <MapController center={mapCenter} />
            
            {fieldsData.map((field) => (
              <Marker 
                key={field.id}
                position={[field.position.lat, field.position.lng]}
                icon={createCustomIcon(field.status)}
                eventHandlers={{
                  click: () => setSelectedField(field)
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <h3 className="font-bold text-sm">{field.name}</h3>
                    <p className="text-xs text-gray-600">স্বাস্থ্য: {field.healthScore}%</p>
                    <p className="text-xs text-gray-500">{field.lastScan}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-6 pb-4">
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
              <span>{location.loading ? 'খুঁজছি...' : location.city || 'ঢাকা'}</span>
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
                  {tileLayerOptions.map((layer, idx) => (
                    <button
                      key={layer.id}
                      onClick={() => {
                        setCurrentTileLayer(idx);
                        setShowStylePicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentTileLayer === idx ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{layer.name}</span>
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
      <div className="absolute bottom-32 right-4 z-[1000] flex flex-col gap-2">
        <LocateButton onClick={handleCenterOnLocation} />
        <Button 
          size="icon"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 left-4 right-20 z-[1000]">
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
        <div className="fixed inset-0 z-[1001] flex items-end" onClick={() => setSelectedField(null)}>
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
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedField.status)}`}>
                {getStatusText(selectedField.status)}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">স্বাস্থ্য স্কোর</span>
                <span className="text-lg font-bold text-foreground">{selectedField.healthScore}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedField.status === "healthy" 
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                      : selectedField.status === "warning"
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                  style={{ width: `${selectedField.healthScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/camera">
                <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80">
                  নতুন স্ক্যান
                </Button>
              </Link>
              <Link to="/diagnosis">
                <Button variant="outline" className="w-full rounded-xl border-border/50">
                  বিস্তারিত দেখুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
