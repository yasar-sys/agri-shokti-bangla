import { useEffect, useState, useCallback, useMemo } from "react";
import { ArrowLeft, Satellite, RefreshCw, Loader2, Calendar, SplitSquareHorizontal, Wifi, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { useNDVIData } from "@/hooks/useNDVIData";
import { useDroneRoutes } from "@/hooks/useDroneRoutes";
import { supabase } from "@/integrations/supabase/client";
import { NASASatelliteMap } from "@/components/NASASatelliteMap";
import { AgroMonitoringMap } from "@/components/AgroMonitoringMap";
import { useToast } from "@/hooks/use-toast";
import { TimelapseControls } from "@/components/satellite/TimelapseControls";
import { SatelliteComparison } from "@/components/satellite/SatelliteComparison";
import { MobileSatelliteControls } from "@/components/satellite/MobileSatelliteControls";
import { useSatelliteServiceWorker } from "@/hooks/useSatelliteServiceWorker";
import { nasaApiClient } from "@/lib/nasaApiClient";
import { ComponentErrorBoundary } from "@/components/ui/component-error-boundary";
import { SatelliteAIInsight } from "@/components/satellite/SatelliteAIInsight";
import { SatelliteSourceSelector, type SatelliteSource } from "@/components/satellite/SatelliteSourceSelector";
import { useNASAPowerClimate } from "@/hooks/useNASAPowerClimate";
import { NASAClimateDetails } from "@/components/satellite/NASAClimateDetails";
import { NDVITimeSeriesChart } from "@/components/satellite/NDVITimeSeriesChart";
import { getPolygonById } from "@/lib/agroMonitoringService";

type TileLayer = 'satellite' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation';

export default function SatellitePage() {
  const [userId, setUserId] = useState<string | null>(null);

  // State for Satellite Source Selection
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteSource>('agromonitoring');

  // State for AgroMonitoring
  const [activePolygonId, setActivePolygonId] = useState<string | null>(null);

  // State for NASA
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [activeLayer, setActiveLayer] = useState<TileLayer>('ndvi');
  const [apiHealth, setApiHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [nasaHealthData, setNasaHealthData] = useState<any>(null);

  // Common State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Hooks
  const location = useLocation();
  const { fieldZones, loading: ndviLoading, refetch: refreshNDVI } = useNDVIData(userId);
  const { routes, loading: droneLoading, refetch: refreshDrone } = useDroneRoutes(userId);
  const { toast } = useToast();
  const serviceWorker = useSatelliteServiceWorker();

  // NASA POWER Climate Integration
  const {
    data: climateData,
    loading: climateLoading,
    refresh: refreshClimate
  } = useNASAPowerClimate({
    latitude: location?.latitude,
    longitude: location?.longitude,
    autoFetch: selectedSatellite !== 'agromonitoring'
  });

  // Fetch NASA NDVI History (Legacy)
  const fetchNASAHealthData = useCallback(async () => {
    if (!userId || fieldZones.length === 0) return;
    try {
      const data = await nasaApiClient.getNDVIHistory(fieldZones[0]?.id);
      setNasaHealthData(data);
    } catch (error) {
      console.error('Error fetching NASA NDVI history:', error);
    }
  }, [userId, fieldZones]);

  useEffect(() => {
    if (selectedSatellite !== 'agromonitoring') {
      fetchNASAHealthData();
    }
  }, [selectedSatellite, fieldZones, fetchNASAHealthData]);

  // Generate 30 days of dates for Timeline
  const dates = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  }), []);

  const currentDateIndex = dates.findIndex(date => date.toDateString() === currentDate.toDateString());

  // User Auth
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Online/Offline Status
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

  // NASA API Health Check
  useEffect(() => {
    if (selectedSatellite === 'agromonitoring') return;

    const checkAPIHealth = () => {
      const health = nasaApiClient.getOverallHealth();
      setApiHealth(health);
    };

    checkAPIHealth();
    const interval = setInterval(checkAPIHealth, 30000);

    return () => clearInterval(interval);
  }, [selectedSatellite]);

  // Comparison Mode Logic
  const comparisonMode = useMemo(() => {
    if (!showComparison) return null;
    return {
      type: 'slider' as const,
      leftDate: dates[0] || new Date(),
      rightDate: dates[dates.length - 1] || new Date(),
    };
  }, [showComparison, dates]);

  // Auto-play Logic
  useEffect(() => {
    if (isPlaying && currentDateIndex < dates.length - 1) {
      const timer = setTimeout(() => setCurrentDate(dates[currentDateIndex + 1]), 800);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentDateIndex === dates.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentDateIndex, dates]);

  // Refresh Handler
  const handleRefresh = useCallback(async () => {
    if (!userId) return;
    try {
      await Promise.all([refreshNDVI(), refreshDrone()]);
      if (selectedSatellite !== 'agromonitoring') {
        await refreshClimate();
      }
      toast({ title: "রিফ্রেশ সম্পন্ন", description: "সর্বশেষ ডেটা লোড হয়েছে" });
    } catch (error) {
      toast({
        title: "রিফ্রেশ ব্যর্থ",
        description: "পরে আবার চেষ্টা করুন",
        variant: "destructive"
      });
    }
  }, [userId, refreshNDVI, refreshDrone, refreshClimate, selectedSatellite, toast]);

  const handleCompare = useCallback((mode: any) => {
    setShowComparison(false);
    toast({
      title: "তুলনা মোড সক্রিয়",
      description: `${mode.leftDate.toLocaleDateString('bn-BD')} vs ${mode.rightDate.toLocaleDateString('bn-BD')}`
    });
  }, [toast]);

  const handleExportTimelapse = useCallback(() => {
    toast({
      title: "এক্সপোর্ট শুরু হচ্ছে",
      description: "টাইমলাপস ভিডিও তৈরি হচ্ছে..."
    });
  }, [toast]);

  const isLoading = ndviLoading || droneLoading || (selectedSatellite !== 'agromonitoring' && climateLoading);

  return (
    <ComponentErrorBoundary componentName="Satellite Map">
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
                    {selectedSatellite === 'agromonitoring' ? 'AgroMonitoring' : 'NASA'}
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
                <SatelliteSourceSelector
                  selectedSource={selectedSatellite}
                  onSourceChange={setSelectedSatellite}
                  className="hidden sm:flex"
                />

                {/* NASA-Specific Controls */}
                {selectedSatellite !== 'agromonitoring' && (
                  <>
                    <Button
                      variant={showComparison ? "secondary" : "outline"}
                      size="sm"
                      className="h-9 gap-2 hidden sm:flex"
                      onClick={() => setShowComparison(!showComparison)}
                    >
                      <SplitSquareHorizontal className="w-4 h-4" />
                      <span className="hidden md:inline">তুলনা</span>
                    </Button>

                    <Button
                      variant={showTimeline ? "secondary" : "outline"}
                      size="sm"
                      className="h-9 gap-2"
                      onClick={() => setShowTimeline(!showTimeline)}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">টাইমলাইন</span>
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative">

          {selectedSatellite === 'agromonitoring' ? (
            // =========================
            // AGROMONITORING VIEW
            // =========================
            <div className="container mx-auto px-4 py-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 space-y-4">
                  <AgroMonitoringMap
                    showNDVIOverlay={true}
                    showWeatherOverlay={false}
                    onPolygonClick={setActivePolygonId}
                    className="h-[500px] lg:h-[600px] shadow-sm"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span>লাইভ হাই-রেজোলিউশন স্যাটেলাইট সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                        Real Data
                      </Badge>
                      <span>উৎস: Sentinel-2 & Landsat-8 (AgroMonitoring API)</span>
                    </div>
                  </div>
                </div>

                {/* Analytics Panel */}
                <div className="space-y-6">
                  {activePolygonId ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <NDVITimeSeriesChart polygonId={activePolygonId} />
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-6 text-center border border-dashed border-border flex flex-col items-center justify-center h-48 lg:h-auto">
                      <Satellite className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <h3 className="text-base font-semibold text-foreground">কোনো পলিগন নির্বাচিত হয়নি</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        বিস্তারিত NDVI বিশ্লেষণ দেখতে ম্যাপ থেকে একটি জমি (পলিগন) নির্বাচন করুন।
                      </p>
                    </div>
                  )}

                  {/* AI Insight Placeholder for Agro */}
                  {activePolygonId && (
                    <SatelliteAIInsight
                      ndviValue={0.75}
                      moistureValue={0.6}
                      trend="improving"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            // =========================
            // NASA VIEW (Demo Data)
            // =========================
            <>
              {/* Demo Data Notice */}
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
                <div className="container mx-auto flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                  <span className="font-semibold">⚠️ ডেমো ডেটা:</span>
                  <span>
                    এই ভিউ NASA GIBS/MODIS সিমুলেটেড ডেটা ব্যবহার করছে। বাস্তব NDVI বিশ্লেষণের জন্য AgroMonitoring সোর্স নির্বাচন করুন।
                  </span>
                </div>
              </div>

              <NASASatelliteMap
                latitude={location?.latitude ?? 23.8103}
                longitude={location?.longitude ?? 90.4125}
                zones={fieldZones}
                droneRoutes={routes}
                selectedLayer={activeLayer}
                onLayerChange={setActiveLayer}
                comparisonMode={comparisonMode}
              />

              {/* AI Insight Overlay */}
              <div className="absolute bottom-4 right-4 z-[1001] hidden lg:block w-80">
                <SatelliteAIInsight
                  ndviValue={nasaHealthData?.history?.[nasaHealthData.history.length - 1]?.ndvi ?? 0.7}
                  moistureValue={nasaHealthData?.history?.[nasaHealthData.history.length - 1]?.moisture_index ?? 0.5}
                  trend={(nasaHealthData?.trend as any) || "stable"}
                />
              </div>

              {/* Mobile Controls */}
              <MobileSatelliteControls
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                onComparisonToggle={() => setShowComparison(!showComparison)}
                onTimelapseToggle={() => setShowTimeline(!showTimeline)}
                selectedSatellite={selectedSatellite}
                onSatelliteChange={setSelectedSatellite}
              />

              {/* Comparison UI */}
              {showComparison && (
                <SatelliteComparison
                  dates={dates}
                  onCompare={handleCompare}
                  onClose={() => setShowComparison(false)}
                />
              )}

              {/* Timeline UI */}
              {showTimeline && (
                <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 z-[1002]">
                  <TimelapseControls
                    dates={dates}
                    currentIndex={currentDateIndex >= 0 ? currentDateIndex : 0}
                    onIndexChange={(index) => setCurrentDate(dates[index])}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    isPlaying={isPlaying}
                    onExport={handleExportTimelapse}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* NASA Climate - Only for NASA view */}
        {selectedSatellite !== 'agromonitoring' && (
          <section className="container mx-auto px-4 pb-12">
            <NASAClimateDetails data={climateData} loading={climateLoading} />
          </section>
        )}
      </div>
    </ComponentErrorBoundary>
  );
}
