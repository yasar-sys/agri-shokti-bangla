import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Layers,
  Loader2,
  Navigation,
  Plus,
  RefreshCw,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocation";

interface Field {
  id: string;
  name: string;
  status: "healthy" | "warning" | "disease";
  healthScore: number;
  lastScan: string;
  position: { lat: number; lng: number };
}

const fieldsData: Field[] = [
  {
    id: "1",
    name: "উত্তর জমি",
    status: "healthy",
    healthScore: 92,
    lastScan: "২ ঘণ্টা আগে",
    position: { lat: 23.8103, lng: 90.4125 },
  },
  {
    id: "2",
    name: "দক্ষিণ জমি",
    status: "warning",
    healthScore: 68,
    lastScan: "১ দিন আগে",
    position: { lat: 23.805, lng: 90.418 },
  },
  {
    id: "3",
    name: "পশ্চিম জমি",
    status: "disease",
    healthScore: 35,
    lastScan: "৩ ঘণ্টা আগে",
    position: { lat: 23.8, lng: 90.405 },
  },
  {
    id: "4",
    name: "পূর্ব জমি",
    status: "healthy",
    healthScore: 88,
    lastScan: "৫ ঘণ্টা আগে",
    position: { lat: 23.815, lng: 90.425 },
  },
];

const tileLayerOptions = [
  {
    id: "streets",
    name: "রাস্তা",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: "satellite",
    name: "স্যাটেলাইট",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
  {
    id: "topo",
    name: "টপোগ্রাফি",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap",
  },
] as const;

function getStatusText(status: Field["status"]) {
  if (status === "healthy") return "সুস্থ";
  if (status === "warning") return "সতর্কতা";
  return "রোগাক্রান্ত";
}

function getStatusPill(status: Field["status"]) {
  if (status === "healthy") return "bg-emerald-500/20 text-emerald-400";
  if (status === "warning") return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
}

function createFieldIcon(status: Field["status"]) {
  const color =
    status === "healthy" ? "#10b981" : status === "warning" ? "#f59e0b" : "#ef4444";

  return L.divIcon({
    className: "agri-field-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 24px rgba(0,0,0,0.35);
        border: 3px solid rgba(255,255,255,0.9);
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

export default function MapPage() {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTileLayer, setCurrentTileLayer] = useState(0);
  const [showStylePicker, setShowStylePicker] = useState(false);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const location = useLocation();

  const defaultCenter = useMemo(() => {
    const lat = location.latitude ?? 23.8103;
    const lng = location.longitude ?? 90.4125;
    return { lat, lng };
  }, [location.latitude, location.longitude]);

  // Init map (pure Leaflet, no react-leaflet) — avoids Context errors like `render2 is not a function`
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([defaultCenter.lat, defaultCenter.lng], 14);

    mapRef.current = map;

    // attribution
    L.control
      .attribution({ position: "bottomleft" })
      .addTo(map);

    // zoom controls
    L.control
      .zoom({ position: "topright" })
      .addTo(map);

    // initial tiles
    const layer = tileLayerOptions[currentTileLayer];
    const tiles = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: 20,
    });
    tiles.addTo(map);
    tileLayerRef.current = tiles;

    // markers
    markersRef.current = fieldsData.map((field) => {
      const marker = L.marker([field.position.lat, field.position.lng], {
        icon: createFieldIcon(field.status),
      }).addTo(map);

      marker.on("click", () => setSelectedField(field));
      return marker;
    });

    // done
    setIsLoading(false);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      tileLayerRef.current?.remove();
      tileLayerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [currentTileLayer, defaultCenter.lat, defaultCenter.lng]);

  // Update tiles when style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    tileLayerRef.current?.remove();

    const layer = tileLayerOptions[currentTileLayer];
    const tiles = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: 20,
    });
    tiles.addTo(map);
    tileLayerRef.current = tiles;
  }, [currentTileLayer]);

  // Fly to location when it becomes available
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!location.latitude || !location.longitude || location.loading) return;

    map.flyTo([location.latitude, location.longitude], 14, { duration: 1 });
  }, [location.latitude, location.longitude, location.loading]);

  const handleCenterOnLocation = () => {
    const map = mapRef.current;
    if (!map) return;

    if (location.latitude && location.longitude) {
      map.flyTo([location.latitude, location.longitude], 15, { duration: 1 });
      toast.success("আপনার অবস্থানে ফোকাস করা হয়েছে");
    } else {
      toast.error("অবস্থান পাওয়া যায়নি");
    }
  };

  const handleRefresh = () => {
    const map = mapRef.current;
    if (!map) return;

    map.invalidateSize();
    toast.success("ম্যাপ রিফ্রেশ হয়েছে");
  };

  return (
    <>
      <SEOHead
        title="জমির মানচিত্র"
        description="কৃষকের জমির মানচিত্র—টোকেন ছাড়াই OpenStreetMap ভিত্তিক ম্যাপ, জমির স্বাস্থ্য মার্কারসহ।"
        keywords="জমির মানচিত্র, কৃষি মানচিত্র, OpenStreetMap, জমি স্বাস্থ্য"
        canonicalUrl={`${window.location.origin}/map`}
      />

      <div className="min-h-screen relative overflow-hidden">
        <main className="absolute inset-0" aria-label="জমির মানচিত্র">
          <div ref={mapDivRef} className="absolute inset-0" />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-[900]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">ম্যাপ লোড হচ্ছে...</p>
              </div>
            </div>
          )}
        </main>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <Link to="/home" aria-label="হোমে ফিরে যান">
              <Button
                variant="ghost"
                size="icon"
                className="glass-strong border border-border/30 shadow-elevated"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>

            <div className="glass-strong rounded-2xl px-4 py-2 border border-border/30 shadow-elevated">
              <h1 className="text-lg font-bold text-foreground">জমির মানচিত্র</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>{location.loading ? "খুঁজছি..." : location.city || "ঢাকা"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-strong border border-border/30 shadow-elevated"
                  onClick={() => setShowStylePicker((v) => !v)}
                  aria-label="ম্যাপ স্টাইল"
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
                          currentTileLayer === idx
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="inline-flex w-4 h-4 items-center justify-center">🗺️</span>
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
                aria-label="রিফ্রেশ"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Bottom Controls */}
        <aside className="absolute bottom-32 right-4 z-[1000] flex flex-col gap-2">
          <Button
            size="icon"
            className="w-12 h-12 rounded-full glass-strong border border-border/30 shadow-elevated"
            onClick={handleCenterOnLocation}
            aria-label="আমার অবস্থান"
          >
            <Navigation className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow"
            aria-label="নতুন জমি যোগ"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </aside>

        {/* Legend */}
        <aside className="absolute bottom-24 left-4 right-20 z-[1000]">
          <div className="glass-strong rounded-2xl p-4 border border-border/30 shadow-elevated">
            <h2 className="font-medium text-foreground mb-3">জমির স্বাস্থ্য</h2>
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
        </aside>

        {/* Selected Field Detail */}
        {selectedField && (
          <div
            className="fixed inset-0 z-[1001] flex items-end"
            onClick={() => setSelectedField(null)}
          >
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
            <article
              className="relative w-full p-6 rounded-t-3xl glass-strong border-t border-border/30 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedField.name}</h3>
                  <p className="text-sm text-muted-foreground">শেষ স্ক্যান: {selectedField.lastScan}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusPill(
                    selectedField.status
                  )}`}
                >
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
            </article>
          </div>
        )}
      </div>
    </>
  );
}
