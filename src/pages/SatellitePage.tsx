import { useEffect, useState } from "react";
import { ArrowLeft, Satellite, RefreshCw, Loader2, Calendar, ChevronDown, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { useNDVIData } from "@/hooks/useNDVIData";
import { useDroneRoutes } from "@/hooks/useDroneRoutes";
import { supabase } from "@/integrations/supabase/client";
import { NASASatelliteMap } from "@/components/NASASatelliteMap";
import { useToast } from "@/hooks/use-toast";

const SATELLITE_OPTIONS = [
  { id: 'modis', name: 'MODIS', resolution: '250m' },
  { id: 'landsat', name: 'Landsat 8/9', resolution: '30m' },
  { id: 'sentinel', name: 'Sentinel-2', resolution: '10m' },
];

export default function SatellitePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState('modis');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  
  const location = useLocation();
  const { fieldZones, loading: ndviLoading, refetch: refreshNDVI } = useNDVIData(userId);
  const { routes, loading: droneLoading, refetch: refreshDrone } = useDroneRoutes(userId);
  const { toast } = useToast();

  // Generate 30 days of dates
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const currentDateIndex = dates.findIndex(date => date.toDateString() === currentDate.toDateString());

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Auto-play timeline
  useEffect(() => {
    if (isPlaying && currentDateIndex < dates.length - 1) {
      const timer = setTimeout(() => setCurrentDate(dates[currentDateIndex + 1]), 800);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentDateIndex === dates.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentDateIndex, dates]);

  const handleRefresh = async () => {
    if (!userId) return;
    await Promise.all([refreshNDVI(), refreshDrone()]);
    toast({ title: "রিফ্রেশ সম্পন্ন", description: "সর্বশেষ NASA ডেটা লোড হয়েছে" });
  };

  const isLoading = ndviLoading || droneLoading;

  return (
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
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Satellite Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex">
                    <Satellite className="w-4 h-4" />
                    {SATELLITE_OPTIONS.find(s => s.id === selectedSatellite)?.name}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {SATELLITE_OPTIONS.map((sat) => (
                    <DropdownMenuItem
                      key={sat.id}
                      onClick={() => setSelectedSatellite(sat.id)}
                      className="justify-between"
                    >
                      <span>{sat.name}</span>
                      <span className="text-xs text-muted-foreground">{sat.resolution}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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
        <NASASatelliteMap
          latitude={location?.latitude ?? 23.8103}
          longitude={location?.longitude ?? 90.4125}
          zones={fieldZones}
          droneRoutes={routes}
        />

        {/* Timeline Panel */}
        {showTimeline && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 z-[1002]">
            <div className="container mx-auto">
              <div className="flex items-center gap-4">
                {/* Playback Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => currentDateIndex > 0 && setCurrentDate(dates[currentDateIndex - 1])}
                    disabled={currentDateIndex === 0}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => currentDateIndex < dates.length - 1 && setCurrentDate(dates[currentDateIndex + 1])}
                    disabled={currentDateIndex === dates.length - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Timeline Slider */}
                <div className="flex-1">
                  <Slider
                    value={[currentDateIndex >= 0 ? currentDateIndex : 0]}
                    onValueChange={(value) => setCurrentDate(dates[value[0]])}
                    max={dates.length - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span className="hidden sm:inline">{dates[0].toLocaleDateString('bn-BD')}</span>
                    <span className="font-medium text-foreground">
                      {currentDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="hidden sm:inline">{dates[dates.length - 1].toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTimeline(false)}
                  className="text-muted-foreground"
                >
                  বন্ধ
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
