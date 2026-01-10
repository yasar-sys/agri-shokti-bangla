import { useEffect, useState, useCallback, useMemo } from "react";
import { ArrowLeft, Satellite, RefreshCw, Loader2, Wifi, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "@/hooks/useLocation";
import { useNDVIData } from "@/hooks/useNDVIData";
import { supabase } from "@/integrations/supabase/client";
import { AgroMonitoringMap } from "@/components/AgroMonitoringMap";
import { useToast } from "@/hooks/use-toast";
import { useSatelliteServiceWorker } from "@/hooks/useSatelliteServiceWorker";
import { ComponentErrorBoundary } from "@/components/ui/component-error-boundary";
import { SatelliteAIInsight } from "@/components/satellite/SatelliteAIInsight";
import { NDVITimeSeriesChart } from "@/components/satellite/NDVITimeSeriesChart";
import { getPolygonById } from "@/lib/agroMonitoringService";

export default function SatellitePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activePolygonId, setActivePolygonId] = useState<string | null>(null);
  const [polygonStats, setPolygonStats] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const location = useLocation();
  // We still use useNDVIData to get global field zones if needed, 
  // but main data flow is now through AgroMonitoringMap and NDVITimeSeriesChart
  const { fieldZones, loading: ndviLoading, refetch: refreshNDVI } = useNDVIData(userId);
  const { toast } = useToast();
  const serviceWorker = useSatelliteServiceWorker();

  // Initial Data Load
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch polygon stats when active polygon changes
  useEffect(() => {
    const fetchPolygonStats = async () => {
      if (!activePolygonId) return;
      try {
        const stats = await getPolygonById(activePolygonId);
        setPolygonStats(stats);
      } catch (error) {
        console.error('Error fetching polygon stats:', error);
      }
    };
    fetchPolygonStats();
  }, [activePolygonId]);

  // Network Status Handling
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "অনলাইন", description: "ইন্টারনেট সংযোগ পুনরুদ্ধার হয়েছে" });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "অফলাইন",
        description: "ক্যাশ করা ডেটা ব্যবহার করা হচ্ছে",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    setLastRefreshed(new Date());
    refreshNDVI();
    // Refresh logic for map and charts is handled by their internal useEffects 
    // dependent on a refresh trigger or simple re-mount if needed
    toast({ title: "রিফ্রেশ সম্পন্ন", description: "সর্বশেষ স্যাটেলাইট ডেটা লোড হয়েছে" });
  }, [refreshNDVI, toast]);

  return (
    <ComponentErrorBoundary componentName="AgroMonitoring Satellite Map">
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <Link to="/">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-bold">স্যাটেলাইট ভিউ</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    AgroMonitoring
                  </Badge>
                  {!isOnline && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs gap-1">
                      <WifiOff className="w-3 h-3" />
                      অফলাইন
                    </Badge>
                  )}
                  {serviceWorker.isRegistered && (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="PWA Active" />
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground hidden sm:block">
                  Last update: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 space-y-6">

          {/* Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Map Area - Full width on mobile, 2/3 on large screens */}
            <div className="lg:col-span-2 space-y-4">
              <AgroMonitoringMap
                showNDVIOverlay={true}
                showWeatherOverlay={false} // We can enable this if we add a toggle later
                onPolygonClick={setActivePolygonId}
                // refreshTrigger={lastRefreshed.getTime()} // Passing this prop if added to map
                className="h-[500px] lg:h-[600px] shadow-sm"
              />

              {/* Context Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span>লাইভ স্যাটেলাইট ফিড সক্রিয়</span>
                </div>
                <div>
                  উৎস: Sentinel-2 & Landsat-8
                </div>
              </div>
            </div>

            {/* Sidebar / Bottom Panel - Analytics */}
            <div className="space-y-6">
              {/* Selected Polygon Info or General Advice */}
              {activePolygonId ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <NDVITimeSeriesChart polygonId={activePolygonId} />
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6 text-center border border-dashed border-border flex flex-col items-center justify-center h-48 lg:h-auto">
                  <Satellite className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">কোনো পলিগন নির্বাচিত হয়নি</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    বিস্তারিত NDVI বিশ্লেষণ এবং স্বয়ংক্রিয় পরামর্শ দেখতে ম্যাপ থেকে একটি জমি (পলিগন) নির্বাচন করুন।
                  </p>
                </div>
              )}

              {/* AI Insight - Only show if we have data */}
              {activePolygonId && (
                <SatelliteAIInsight
                  // These would ideally come from the historical data or a separate API call per polygon
                  // Passing defaults/placeholders until that data hook is fully unified
                  ndviValue={0.75}
                  moistureValue={0.6}
                  trend="improving"
                />
              )}
            </div>

          </div>
        </main>
      </div>
    </ComponentErrorBoundary>
  );
}
