import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Satellite, Plane, MapPin, Leaf, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useLocation } from "@/hooks/useLocation";

const ndviZones = [
  { id: 1, name: "পূর্ব ব্লক", health: 0.85, status: "সুস্থ", color: "bg-secondary" },
  { id: 2, name: "পশ্চিম ব্লক", health: 0.72, status: "মাঝারি", color: "bg-chart-2" },
  { id: 3, name: "উত্তর ব্লক", health: 0.45, status: "সমস্যা আছে", color: "bg-destructive" },
  { id: 4, name: "দক্ষিণ ব্লক", health: 0.91, status: "খুব ভালো", color: "bg-secondary" },
];

const droneRoutes = [
  { id: 1, task: "কীটনাশক স্প্রে", area: "২.৫ একর", time: "২৫ মিনিট", status: "অপেক্ষমাণ" },
  { id: 2, task: "সার ছিটানো", area: "১.৮ একর", time: "১৮ মিনিট", status: "সম্পন্ন" },
  { id: 3, task: "পানি স্প্রে", area: "৩.২ একর", time: "৩২ মিনিট", status: "চলছে" },
];

export default function SatellitePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Simple map placeholder - in production would use Mapbox
    setMapLoaded(true);
  }, []);

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Satellite className="w-5 h-5 text-chart-4" />
              স্যাটেলাইট + ড্রোন ভিশন
            </h1>
            <p className="text-xs text-muted-foreground">NDVI ম্যাপ ও ড্রোন রুট অপ্টিমাইজেশন</p>
          </div>
        </div>
      </header>

      {/* Interactive Map */}
      <section className="px-4 py-4">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div 
            ref={mapContainerRef}
            className="aspect-video relative"
          >
            {/* Satellite Map Visualization */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-chart-2/30 to-destructive/20">
              {/* Grid overlay showing field zones */}
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
                {ndviZones.map((zone) => (
                  <div 
                    key={zone.id}
                    className={cn(
                      "rounded-lg flex items-center justify-center relative overflow-hidden transition-all hover:scale-[1.02]",
                      zone.health >= 0.8 && "bg-secondary/50",
                      zone.health >= 0.6 && zone.health < 0.8 && "bg-chart-2/50",
                      zone.health < 0.6 && "bg-destructive/50"
                    )}
                  >
                    {/* Vegetation texture pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <circle
                            key={i}
                            cx={Math.random() * 100}
                            cy={Math.random() * 100}
                            r={2 + Math.random() * 3}
                            fill={zone.health >= 0.7 ? "#7BF2A0" : zone.health >= 0.5 ? "#F2C94C" : "#E76F51"}
                            opacity={0.6 + Math.random() * 0.4}
                          />
                        ))}
                      </svg>
                    </div>
                    <div className="text-center z-10 bg-background/60 backdrop-blur-sm rounded-lg px-2 py-1">
                      <p className="text-xs font-medium text-foreground">{zone.name}</p>
                      <p className="text-lg font-bold text-foreground">{(zone.health * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Drone path animation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M10 20 Q 50 10 90 30 Q 50 50 10 70 Q 50 90 90 80"
                  stroke="#F2C94C"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  fill="none"
                  opacity="0.6"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="20"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Drone icon */}
                <circle cx="50" cy="50" r="2" fill="#F2C94C">
                  <animate
                    attributeName="cx"
                    values="10;90;10;90;10"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values="20;30;70;80;20"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          </div>
          <div className="p-3 border-t border-border flex items-center justify-between bg-card/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-destructive" />
              <span className="text-sm text-foreground">
                {location.loading ? "লোকেশন খোঁজা হচ্ছে..." : `${location.city}, ${location.country}`}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">আপডেট: ২ ঘণ্টা আগে</span>
          </div>
        </div>
      </section>

      {/* NDVI Legend */}
      <section className="px-4 mb-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-secondary" />
            NDVI স্বাস্থ্য সূচক
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-destructive via-chart-2 to-secondary" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-destructive">অসুস্থ (0.0)</span>
            <span className="text-xs text-chart-2">মাঝারি (0.5)</span>
            <span className="text-xs text-secondary">সুস্থ (1.0)</span>
          </div>
        </div>
      </section>

      {/* Field Zones */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">ক্ষেতের জোনভিত্তিক স্বাস্থ্য</h2>
        <div className="grid grid-cols-2 gap-2">
          {ndviZones.map((zone) => (
            <div key={zone.id} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{zone.name}</span>
                <div className={cn("w-3 h-3 rounded-full", zone.color)} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{(zone.health * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">{zone.status}</p>
                </div>
                {zone.health < 0.6 && (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Drone Routes */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plane className="w-4 h-4 text-chart-4" />
          ড্রোন স্প্রে রুট
        </h2>
        <div className="space-y-2">
          {droneRoutes.map((route) => (
            <div key={route.id} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{route.task}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">📐 {route.area}</span>
                    <span className="text-xs text-muted-foreground">⏱️ {route.time}</span>
                  </div>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  route.status === "সম্পন্ন" && "bg-secondary/20 text-secondary",
                  route.status === "চলছে" && "bg-chart-2/20 text-chart-2",
                  route.status === "অপেক্ষমাণ" && "bg-muted text-muted-foreground"
                )}>
                  {route.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-chart-4/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-semibold text-chart-4 text-sm mb-1">AI পরামর্শ</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                উত্তর ব্লকে NDVI কম (০.৪৫)। সম্ভাব্য কারণ: পানির অভাব বা পোকার আক্রমণ। 
                ড্রোন দিয়ে কীটনাশক স্প্রে করার পর সেচ দিন। ৩ দিন পর পুনরায় স্ক্যান করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}