import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowLeft, Satellite, Plane, MapPin, Leaf, AlertTriangle, RefreshCw, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useLocation } from "@/hooks/useLocation";
import { useNDVIData } from "@/hooks/useNDVIData";
import { useDroneRoutes } from "@/hooks/useDroneRoutes";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

// Default demo zones for when no data exists
const defaultZones = [
  { id: "demo-1", name: "East Block", name_bn: "পূর্ব ব্লক", health_score: 0.85, status: "good", status_bn: "সুস্থ" },
  { id: "demo-2", name: "West Block", name_bn: "পশ্চিম ব্লক", health_score: 0.72, status: "moderate", status_bn: "মাঝারি" },
  { id: "demo-3", name: "North Block", name_bn: "উত্তর ব্লক", health_score: 0.45, status: "poor", status_bn: "সমস্যা আছে" },
  { id: "demo-4", name: "South Block", name_bn: "দক্ষিণ ব্লক", health_score: 0.91, status: "excellent", status_bn: "খুব ভালো" },
];

const defaultRoutes = [
  { id: "demo-r1", task_bn: "কীটনাশক স্প্রে", area_acres: 2.5, estimated_time_mins: 25, status: "pending", status_bn: "অপেক্ষমাণ" },
  { id: "demo-r2", task_bn: "সার ছিটানো", area_acres: 1.8, estimated_time_mins: 18, status: "completed", status_bn: "সম্পন্ন" },
  { id: "demo-r3", task_bn: "পানি স্প্রে", area_acres: 3.2, estimated_time_mins: 32, status: "in_progress", status_bn: "চলছে" },
];

// Convert number to Bengali numerals
function toBengaliNumber(num: number): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => {
    if (d === '.') return '.';
    return bengaliNumerals[parseInt(d)] || d;
  }).join('');
}

export default function SatellitePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
    setMapLoaded(true);
  }, []);

  // Real-time hooks
  const { fieldZones, loading: zonesLoading, scanning, triggerScan, createFieldZone } = useNDVIData(userId);
  const { routes, loading: routesLoading, optimizing, generateRoutes, stats } = useDroneRoutes(userId);

  // Use real data if available, otherwise use demo data
  const displayZones = useMemo(() => {
    if (fieldZones.length > 0) {
      return fieldZones.map(zone => ({
        id: zone.id,
        name: zone.name,
        name_bn: zone.name_bn,
        health_score: Number(zone.health_score),
        status: zone.status,
        status_bn: zone.status_bn,
        last_scan_at: zone.last_scan_at,
        ndvi_data: zone.ndvi_data
      }));
    }
    return defaultZones;
  }, [fieldZones]);

  const displayRoutes = useMemo(() => {
    if (routes.length > 0) {
      return routes.map(route => ({
        id: route.id,
        task_bn: route.task_bn,
        area_acres: route.area_acres,
        estimated_time_mins: route.estimated_time_mins,
        status: route.status,
        status_bn: route.status_bn
      }));
    }
    return defaultRoutes;
  }, [routes]);

  // Get last scan time
  const lastScanTime = useMemo(() => {
    const zonesWithScans = fieldZones.filter(z => z.last_scan_at);
    if (zonesWithScans.length > 0) {
      const latest = zonesWithScans.reduce((a, b) => 
        new Date(a.last_scan_at) > new Date(b.last_scan_at) ? a : b
      );
      return formatDistanceToNow(new Date(latest.last_scan_at), { addSuffix: true, locale: bn });
    }
    return "২ ঘণ্টা আগে";
  }, [fieldZones]);

  // AI recommendation based on real data
  const aiRecommendation = useMemo(() => {
    const criticalZones = displayZones.filter(z => z.health_score < 0.6);
    if (criticalZones.length > 0) {
      const worst = criticalZones.reduce((a, b) => 
        a.health_score < b.health_score ? a : b
      );
      const healthPercent = toBengaliNumber(Math.round(worst.health_score * 100) / 100);
      return `${worst.name_bn}এ NDVI কম (${healthPercent})। সম্ভাব্য কারণ: পানির অভাব বা পোকার আক্রমণ। ড্রোন দিয়ে কীটনাশক স্প্রে করার পর সেচ দিন। ৩ দিন পর পুনরায় স্ক্যান করুন।`;
    }
    return "সব জোনের স্বাস্থ্য ভালো আছে। নিয়মিত পর্যবেক্ষণ চালিয়ে যান।";
  }, [displayZones]);

  // Seed demo data if user is logged in and no zones exist
  const handleSeedDemoData = async () => {
    if (!userId) return;
    
    for (const zone of defaultZones) {
      await createFieldZone({
        name: zone.name,
        name_bn: zone.name_bn,
        health_score: zone.health_score,
        status: zone.status,
        status_bn: zone.status_bn,
        latitude: 23.8103 + (Math.random() - 0.5) * 0.1,
        longitude: 90.4125 + (Math.random() - 0.5) * 0.1,
        area_acres: 1 + Math.random() * 3
      });
    }
    // Generate routes after creating zones
    setTimeout(() => generateRoutes(), 1000);
  };

  const isLoading = zonesLoading || routesLoading;
  const isUsingDemoData = fieldZones.length === 0;

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
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            {userId && isUsingDemoData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSeedDemoData}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                ডেটা যোগ
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => triggerScan()}
              disabled={scanning || !userId}
              className="rounded-full"
            >
              {scanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Real-time indicator */}
      {userId && !isUsingDemoData && (
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            রিয়েল-টাইম ডেটা সক্রিয়
          </div>
        </div>
      )}

      {/* Interactive Map */}
      <section className="px-4 py-4">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div 
            ref={mapContainerRef}
            className="aspect-video relative"
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              /* Satellite Map Visualization */
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-chart-2/30 to-destructive/20">
                {/* Grid overlay showing field zones */}
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
                  {displayZones.slice(0, 4).map((zone) => (
                    <div 
                      key={zone.id}
                      className={cn(
                        "rounded-lg flex items-center justify-center relative overflow-hidden transition-all hover:scale-[1.02]",
                        zone.health_score >= 0.8 && "bg-secondary/50",
                        zone.health_score >= 0.6 && zone.health_score < 0.8 && "bg-chart-2/50",
                        zone.health_score < 0.6 && "bg-destructive/50"
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
                              fill={zone.health_score >= 0.7 ? "#7BF2A0" : zone.health_score >= 0.5 ? "#F2C94C" : "#E76F51"}
                              opacity={0.6 + Math.random() * 0.4}
                            />
                          ))}
                        </svg>
                      </div>
                      <div className="text-center z-10 bg-background/60 backdrop-blur-sm rounded-lg px-2 py-1">
                        <p className="text-xs font-medium text-foreground">{zone.name_bn}</p>
                        <p className="text-lg font-bold text-foreground">{(zone.health_score * 100).toFixed(0)}%</p>
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
            )}
          </div>
          <div className="p-3 border-t border-border flex items-center justify-between bg-card/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-destructive" />
              <span className="text-sm text-foreground">
                {location.loading ? "লোকেশন খোঁজা হচ্ছে..." : `${location.city}, ${location.country}`}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">আপডেট: {lastScanTime}</span>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">ক্ষেতের জোনভিত্তিক স্বাস্থ্য</h2>
          {isUsingDemoData && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">ডেমো ডেটা</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {displayZones.slice(0, 4).map((zone) => (
            <div key={zone.id} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{zone.name_bn}</span>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  zone.health_score >= 0.8 && "bg-secondary",
                  zone.health_score >= 0.6 && zone.health_score < 0.8 && "bg-chart-2",
                  zone.health_score < 0.6 && "bg-destructive"
                )} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{(zone.health_score * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">{zone.status_bn}</p>
                </div>
                {zone.health_score < 0.6 && (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Drone Routes */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Plane className="w-4 h-4 text-chart-4" />
            ড্রোন স্প্রে রুট
          </h2>
          {userId && !isUsingDemoData && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => generateRoutes()}
              disabled={optimizing}
              className="text-xs"
            >
              {optimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : "অপ্টিমাইজ"}
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {displayRoutes.map((route) => (
            <div key={route.id} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{route.task_bn}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">📐 {toBengaliNumber(route.area_acres)} একর</span>
                    <span className="text-xs text-muted-foreground">⏱️ {toBengaliNumber(route.estimated_time_mins)} মিনিট</span>
                  </div>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  route.status === "completed" && "bg-secondary/20 text-secondary",
                  route.status === "in_progress" && "bg-chart-2/20 text-chart-2",
                  route.status === "pending" && "bg-muted text-muted-foreground"
                )}>
                  {route.status_bn}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Route Stats */}
        {userId && !isUsingDemoData && stats.total > 0 && (
          <div className="mt-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{toBengaliNumber(stats.total)}</p>
                <p className="text-xs text-muted-foreground">মোট রুট</p>
              </div>
              <div>
                <p className="text-lg font-bold text-secondary">{toBengaliNumber(stats.completed)}</p>
                <p className="text-xs text-muted-foreground">সম্পন্ন</p>
              </div>
              <div>
                <p className="text-lg font-bold text-chart-2">{toBengaliNumber(stats.inProgress)}</p>
                <p className="text-xs text-muted-foreground">চলছে</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* AI Recommendation */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-chart-4/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-semibold text-chart-4 text-sm mb-1">AI পরামর্শ</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {aiRecommendation}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
