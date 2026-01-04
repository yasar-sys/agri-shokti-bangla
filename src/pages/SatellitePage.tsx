import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowLeft, Satellite, Plane, MapPin, Leaf, AlertTriangle, RefreshCw, Plus, Loader2, BarChart3, Droplets, Activity, CloudRain, Layers, Eye, TrendingUp, Thermometer, Radio, Calendar, Download, Settings, Maximize2, Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Home, Compass, Grid, Filter, Search, Info, ChevronLeft, ChevronRight, X, Check, Clock, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useLocation } from "@/hooks/useLocation";
import { useNDVIData } from "@/hooks/useNDVIData";
import { useDroneRoutes } from "@/hooks/useDroneRoutes";
import { useOpenETData } from "@/hooks/useOpenETData";
import { useCropCASMAData } from "@/hooks/useCropCASMAData";
import { useNASAEarthObservation } from "@/hooks/useNASAEarthObservation";
import { useNASAWeatherData } from "@/hooks/useNASAWeatherData";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { NASASatelliteMap } from "@/components/NASASatelliteMap";
import { NASAFarmMap } from "@/components/NASAFarmMap";
import { NDVIHistoryChart } from "@/components/NDVIHistoryChart";
import { useToast } from "@/hooks/use-toast";

// NASA Worldview-inspired layer configurations
const worldviewLayers = [
  { id: 'true_color', name: 'True Color', name_bn: 'সত্যিকার রঙ', type: 'imagery', default: true },
  { id: 'ndvi', name: 'NDVI', name_bn: 'এনডিভিআই', type: 'index', default: false },
  { id: 'evi', name: 'EVI', name_bn: 'ইভিআই', type: 'index', default: false },
  { id: 'lai', name: 'LAI', name_bn: 'এলএআই', type: 'index', default: false },
  { id: 'clouds', name: 'Clouds', name_bn: 'মেঘ', type: 'overlay', default: false },
  { id: 'fire', name: 'Fires', name_bn: 'আগুন', type: 'overlay', default: false },
  { id: 'floods', name: 'Floods', name_bn: 'বন্যা', type: 'overlay', default: false },
  { id: 'drought', name: 'Drought', name_bn: 'খরা', type: 'overlay', default: false },
];

const satelliteInstruments = [
  { id: 'modis', name: 'MODIS', name_bn: 'মোডিস', resolution: '250m', daily: true },
  { id: 'landsat', name: 'Landsat 8/9', name_bn: 'ল্যান্ডস্যাট', resolution: '30m', daily: false },
  { id: 'sentinel', name: 'Sentinel-2', name_bn: 'সেন্টিনেল', resolution: '10m', daily: false },
  { id: 'viirs', name: 'VIIRS', name_bn: 'ভিআইআরএস', resolution: '375m', daily: true },
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
  const [activeTab, setActiveTab] = useState('worldview');
  const [selectedLayers, setSelectedLayers] = useState(['true_color']);
  const [selectedInstrument, setSelectedInstrument] = useState('modis');
  const [opacity, setOpacity] = useState([80]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [zoom, setZoom] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [measurementMode, setMeasurementMode] = useState<'none' | 'area' | 'distance'>('none');
  const [userId, setUserId] = useState<string | null>(null);
  
  const location = useLocation();
  const locationError = location?.error;
  const { fieldZones, loading: ndviLoading, refetch: refreshNDVI } = useNDVIData(userId);
  const { routes, loading: droneLoading, refetch: refreshDrone } = useDroneRoutes(userId);
  const { fields: openETData, loading: openETLoading, fetchETData: refreshOpenET } = useOpenETData(userId);
  const { fields: cropData, loading: cropLoading, fetchSoilData: refreshCrop } = useCropCASMAData(userId);
  const { fields: earthObservation, loading: earthLoading, fetchSatelliteData: refreshEarth } = useNASAEarthObservation(userId);
  const { weatherData, loading: weatherLoading, fetchWeatherData: refreshWeather } = useNASAWeatherData(userId);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Worldview-inspired timeline controls
  const dates = useMemo(() => {
    const dates = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }, []);

  const currentDateIndex = dates.findIndex(date => 
    date.toDateString() === currentDate.toDateString()
  );

  const handleTimelinePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimelinePrevious = () => {
    if (currentDateIndex > 0) {
      setCurrentDate(dates[currentDateIndex - 1]);
    }
  };

  const handleTimelineNext = () => {
    if (currentDateIndex < dates.length - 1) {
      setCurrentDate(dates[currentDateIndex + 1]);
    }
  };

  const handleLayerToggle = (layerId: string) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleRefreshAll = async () => {
    if (!userId) return;
    
    await Promise.all([
      refreshNDVI(),
      refreshDrone(),
      refreshOpenET(),
      refreshCrop(),
      refreshEarth(),
      refreshWeather()
    ]);
    toast({
      title: "ডেটা রিফ্রেশ হয়েছে",
      description: "সব NASA ডেটা সোর্স আপডেট হয়েছে",
    });
  };

  // Auto-play timeline
  useEffect(() => {
    if (isPlaying && currentDateIndex < dates.length - 1) {
      const timer = setTimeout(() => {
        setCurrentDate(dates[currentDateIndex + 1]);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentDateIndex === dates.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentDateIndex, dates]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* NASA Worldview-inspired Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:text-green-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ফিরে যান
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Satellite className="w-6 h-6 text-green-400" />
                <h1 className="text-xl font-bold text-white">NASA Worldview Bangladesh</h1>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Live
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleRefreshAll} className="text-white hover:text-green-400">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-green-400">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-green-400">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Worldview Interface */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Layer Panel */}
        {showLayerPanel && (
          <div className="w-80 bg-black/50 backdrop-blur-lg border-r border-white/10 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Layers</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowLayerPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Satellite Instruments */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Satellite</h4>
                <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    {satelliteInstruments.map(instrument => (
                      <SelectItem key={instrument.id} value={instrument.id} className="text-white">
                        <div className="flex items-center justify-between w-full">
                          <span>{instrument.name}</span>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>{instrument.resolution}</span>
                            {instrument.daily && <Badge variant="secondary">Daily</Badge>}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Layers */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Data Layers</h4>
                {worldviewLayers.map(layer => (
                  <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedLayers.includes(layer.id)}
                        onCheckedChange={() => handleLayerToggle(layer.id)}
                      />
                      <div>
                        <div className="text-sm text-white">{layer.name}</div>
                        <div className="text-xs text-gray-400">{layer.name_bn}</div>
                      </div>
                    </div>
                    <Badge variant={layer.type === 'imagery' ? 'default' : layer.type === 'index' ? 'secondary' : 'outline'} className="text-xs">
                      {layer.type}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Opacity Control */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Opacity</h4>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">{opacity[0]}%</div>
              </div>

              {/* Measurement Tools */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Measurement Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={measurementMode === 'distance' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMeasurementMode('distance')}
                    className="text-xs"
                  >
                    Distance
                  </Button>
                  <Button
                    variant={measurementMode === 'area' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMeasurementMode('area')}
                    className="text-xs"
                  >
                    Area
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Map Area */}
        <div className="flex-1 relative">
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <div className="bg-black/50 backdrop-blur-lg rounded-lg p-2 space-y-2">
              <Button variant="ghost" size="sm" className="text-white hover:text-green-400 w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-green-400 w-full justify-start">
                <Compass className="w-4 h-4 mr-2" />
                North
              </Button>
              <div className="border-t border-white/10 pt-2 space-y-2">
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(zoom + 1, 20))} className="text-white hover:text-green-400 w-full justify-start">
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Zoom In
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(zoom - 1, 1))} className="text-white hover:text-green-400 w-full justify-start">
                  <ZoomOut className="w-4 h-4 mr-2" />
                  Zoom Out
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur-lg rounded-lg p-2 flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-gray-400 outline-none w-64"
              />
            </div>
          </div>

          {/* Toggle Layer Panel */}
          {!showLayerPanel && (
            <div className="absolute top-4 left-4 z-10">
              <Button variant="ghost" size="sm" onClick={() => setShowLayerPanel(true)} className="bg-black/50 text-white hover:text-green-400">
                <Layers className="w-4 h-4 mr-2" />
                Layers
              </Button>
            </div>
          )}

          {/* Main Map */}
          <div className="w-full h-full bg-black/20">
            <NASAFarmMap 
              centerLat={location ? location.latitude : 23.6850}
              centerLng={location ? location.longitude : 90.3563}
              openETData={openETData || []}
              soilData={cropData || []}
              satelliteData={earthObservation || []}
              weatherData={weatherData}
            />
          </div>

          {/* Timeline Controls */}
          {showTimeline && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-white/10 p-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleTimelinePrevious} className="text-white hover:text-green-400">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleTimelinePlay} className="text-white hover:text-green-400">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleTimelineNext} className="text-white hover:text-green-400">
                  <SkipForward className="w-4 h-4" />
                </Button>
                
                <div className="flex-1">
                  <Slider
                    value={[currentDateIndex]}
                    onValueChange={(value) => setCurrentDate(dates[value[0]])}
                    max={dates.length - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{dates[0].toLocaleDateString()}</span>
                    <span className="text-white font-medium">{currentDate.toLocaleDateString()}</span>
                    <span>{dates[dates.length - 1].toLocaleDateString()}</span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setShowTimeline(false)} className="text-white hover:text-green-400">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Toggle Timeline */}
          {!showTimeline && (
            <div className="absolute bottom-4 left-4 z-10">
              <Button variant="ghost" size="sm" onClick={() => setShowTimeline(true)} className="bg-black/50 text-white hover:text-green-400">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
