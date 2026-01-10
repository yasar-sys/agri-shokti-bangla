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

type TileLayer = 'satellite' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation';

export default function SatellitePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteSource>('modis');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [activeLayer, setActiveLayer] = useState<TileLayer>('ndvi');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [healthData, setHealthData] = useState<any>(null);

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
    autoFetch: true
  });

  const fetchNDVIHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await nasaApiClient.getNDVIHistory(fieldZones[0]?.id);
      setHealthData(data);
    } catch (error) {
      console.error('Error fetching NDVI history:', error);
    }
  }, [userId, fieldZones]);

  useEffect(() => {
    if (fieldZones.length > 0) {
      fetchNDVIHistory();
    }
  }, [fieldZones, fetchNDVIHistory]);

  // Generate 30 days of dates - Memoized to prevent re-renders
  const dates = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  }), []);

  const currentDateIndex = dates.findIndex(date => date.toDateString() === currentDate.toDateString());

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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

  useEffect(() => {
    const checkAPIHealth = () => {
      const health = nasaApiClient.getOverallHealth();
      setApiHealth(health);
    };

    checkAPIHealth();
    const interval = setInterval(checkAPIHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const comparisonMode = useMemo(() => {
    if (!showComparison) return null;
    return {
      type: 'slider' as const,
      leftDate: dates[0] || new Date(),
      rightDate: dates[dates.length - 1] || new Date(),
    };
  }, [showComparison, dates]);

  // Auto-play timeline
  useEffect(() => {
    if (isPlaying && currentDateIndex < dates.length - 1) {
      const timer = setTimeout(() => setCurrentDate(dates[currentDateIndex + 1]), 800);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentDateIndex === dates.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentDateIndex, dates]);

  const handleRefresh = useCallback(async () => {
    if (!userId) return;
    try {
      await Promise.all([refreshNDVI(), refreshDrone(), refreshClimate()]);
      toast({ title: "রিফ্রেশ সম্পন্ন", description: "সর্বশেষ NASA ডেটা লোড হয়েছে" });
    } catch (error) {
      toast({
        title: "রিফ্রেশ ব্যর্থ",
        description: "পরে আবার চেষ্টা করুন",
        variant: "destructive"
      });
    }
  }, [userId, refreshNDVI, refreshDrone, toast]);

  const handleCompare = useCallback((mode: any) => {
    console.log('Comparison mode:', mode);
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

  const isLoading = ndviLoading || droneLoading;

  return (
    <ComponentErrorBoundary componentName="লিফলেট স্যাটেলাইট ম্যাপ">
      <div className="min-h-screen bg-background flex flex-col">
        {/* Clean Header */}
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
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    NASA
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
                {/* Satellite Source Selector */}
                <SatelliteSourceSelector
                  selectedSource={selectedSatellite}
                  onSourceChange={setSelectedSatellite}
                  className="hidden sm:flex"
                />

                {/* Comparison Toggle */}
                <Button
                  variant={showComparison ? "secondary" : "outline"}
                  size="sm"
                  className="h-9 gap-2 hidden sm:flex"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                  <span className="hidden md:inline">তুলনা</span>
                </Button>

                {/* Timeline Toggle */}
                <Button
                  variant={showTimeline ? "secondary" : "outline"}
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => setShowTimeline(!showTimeline)}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">টাইমলাইন</span>
                </Button>

                {/* Refresh */}
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

        {/* Main Map Area */}
        <main className="flex-1 relative">
          {selectedSatellite === 'agromonitoring' ? (
            <AgroMonitoringMap
              showNDVIOverlay={activeLayer === 'ndvi'}
              showWeatherOverlay={activeLayer === 'lst' || activeLayer === 'precipitation'}
            />
          ) : (
            <NASASatelliteMap
              latitude={location?.latitude ?? 23.8103}
              longitude={location?.longitude ?? 90.4125}
              zones={fieldZones}
              droneRoutes={routes}
              selectedLayer={activeLayer}
              onLayerChange={setActiveLayer}
              comparisonMode={comparisonMode}
            />
          )}

          {/* AI Insight Panel - Positioned bottom-right on desktop to avoid overlapping comparison */}
          {/* Hide when AgroMonitoring is selected */}
          {selectedSatellite !== 'agromonitoring' && (
            <div className="absolute bottom-4 right-4 z-[1001] hidden lg:block w-80">
              <SatelliteAIInsight
                ndviValue={healthData?.history?.[healthData.history.length - 1]?.ndvi ?? 0.7}
                moistureValue={healthData?.history?.[healthData.history.length - 1]?.moisture_index ?? 0.5}
                trend={(healthData?.trend as any) || "stable"}
              />
            </div>
          )}

          {/* Mobile Controls */}
          <MobileSatelliteControls
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            onComparisonToggle={() => setShowComparison(!showComparison)}
            onTimelapseToggle={() => setShowTimeline(!showTimeline)}
            selectedSatellite={selectedSatellite}
            onSatelliteChange={setSelectedSatellite}
          />

          {/* Comparison Panel */}
          {showComparison && (
            <SatelliteComparison
              dates={dates}
              onCompare={handleCompare}
              onClose={() => setShowComparison(false)}
            />
          )}

          {/* Timeline Panel */}
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

          {/* API Health Indicator */}
          {apiHealth !== 'healthy' && (
            <div className="absolute top-4 right-4 z-50">
              <Badge
                variant="outline"
                className={cn(
                  "gap-2",
                  apiHealth === 'degraded' && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                  apiHealth === 'down' && "bg-red-500/10 text-red-600 border-red-500/20"
                )}
              >
                <Wifi className="w-3 h-3" />
                {apiHealth === 'degraded' ? 'NASA API ধীর' : 'NASA API বন্ধ'}
              </Badge>
            </div>
          )}
        </main>

        {/* NASA Climate Insights Section - Only show for NASA satellites */}
        {selectedSatellite !== 'agromonitoring' && (
          <section className="container mx-auto px-4 pb-12">
            <NASAClimateDetails data={climateData} loading={climateLoading} />
          </section>
        )}
      </div>
    </ComponentErrorBoundary>
  );
}
