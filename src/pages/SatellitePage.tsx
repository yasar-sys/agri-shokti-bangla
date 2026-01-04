import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowLeft, Satellite, Plane, MapPin, Leaf, AlertTriangle, RefreshCw, Plus, Loader2, BarChart3, Droplets, Activity, CloudRain, Layers, Eye, TrendingUp, Thermometer, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshingAll, setRefreshingAll] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

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
  
  // NASA Data Hooks
  const openETData = useOpenETData(userId);
  const cropCASMAData = useCropCASMAData(userId);
  const earthObservation = useNASAEarthObservation(userId);
  const weatherData = useNASAWeatherData(userId);

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
        status_bn: route.status_bn,
        coverage_percentage: route.coverage_percentage,
        waypoints: route.waypoints || [],
        optimized_path: route.optimized_path || []
      }));
    }
    // Add demo waypoints for default routes
    return defaultRoutes.map((route, idx) => ({
      ...route,
      coverage_percentage: route.status === 'completed' ? 100 : route.status === 'in_progress' ? 65 : 0,
      waypoints: [
        { lat: 23.8103 + (idx * 0.02), lng: 90.4125, type: 'start' },
        { lat: 23.8103 + (idx * 0.02) + 0.01, lng: 90.4125 + 0.01, type: 'waypoint' },
        { lat: 23.8103 + (idx * 0.02) + 0.02, lng: 90.4125 + 0.005, type: 'waypoint' },
        { lat: 23.8103 + (idx * 0.02) + 0.015, lng: 90.4125 + 0.02, type: 'end' }
      ],
      optimized_path: []
    }));
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

  // Enhanced AI recommendation based on real data and NASA insights
  const aiRecommendation = useMemo(() => {
    const criticalZones = displayZones.filter(z => z.health_score < 0.6);
    const droughtAlerts = cropCASMAData.droughtAlerts.length;
    const highETFields = openETData.fields.filter(f => f.current_et?.et_value > 6).length;
    const weatherAlerts = weatherData.alerts.length;
    
    if (criticalZones.length > 0 && droughtAlerts > 0) {
      const worst = criticalZones.reduce((a, b) => 
        a.health_score < b.health_score ? a : b
      );
      const healthPercent = toBengaliNumber(Math.round(worst.health_score * 100) / 100);
      return `🚨 ${worst.name_bn}এ NDVI কম (${healthPercent}) এবং NASA খরা সতর্কতা সক্রিয়। সম্ভাব্য কারণ: মাটির আর্দ্রতা কম এবং বাষ্পীভবন বেশি। জরুরি সেচ দিন এবং ড্রোন দিয়ে কীটনাশক স্প্রে করুন।`;
    }
    
    if (highETFields > 0 && weatherAlerts > 0) {
      return `🌡️ NASA OpenET ডেটা অনুযায়ী বাষ্পীভবন বেশি এবং তাপমাত্রা বৃদ্ধির সতর্কতা। সকালে ও সন্ধ্যায় সেচ দিন এবং জৈব সার ব্যবহার করুন মাটির আর্দ্রতা ধরে রাখতে।`;
    }
    
    if (criticalZones.length > 0) {
      const worst = criticalZones.reduce((a, b) => 
        a.health_score < b.health_score ? a : b
      );
      const healthPercent = toBengaliNumber(Math.round(worst.health_score * 100) / 100);
      return `${worst.name_bn}এ NDVI কম (${healthPercent})। NASA স্যাটেলাইট ডেটা অনুযায়ী ফসলের স্বাস্থ্য খারাপ। ড্রোন দিয়ে কীটনাশক স্প্রে করার পর সেচ দিন।`;
    }
    
    if (earthObservation.fields.length > 0) {
      const avgNDVI = earthObservation.fields.reduce((sum, field) => 
        sum + (field.vegetation_indices?.ndvi || 0), 0) / earthObservation.fields.length;
      if (avgNDVI > 0.8) {
        return `🌾 NASA স্যাটেলাইট ডেটা অনুযায়ী সব ফিল্ডের NDVI খুব ভালো (${toBengaliNumber(parseFloat((avgNDVI * 100).toFixed(1)))}%)। ফসল সংগ্রহের জন্য প্রস্তুত।`;
      }
    }
    
    return "🌱 NASA ডেটা অনুযায়ী সব জোনের স্বাস্থ্য ভালো আছে। নিয়মিত পর্যবেক্ষণ চালিয়ে যান এবং NASA আপডেট দেখুন।";
  }, [displayZones, cropCASMAData.droughtAlerts, openETData.fields, weatherData.alerts, earthObservation.fields]);

  // Refresh all NASA data sources
  const refreshAllData = async () => {
    setRefreshingAll(true);
    try {
      await Promise.all([
        openETData.fetchETData(),
        cropCASMAData.fetchSoilData(),
        earthObservation.fetchSatelliteData(),
        weatherData.fetchWeatherData(),
        triggerScan()
      ]);
      
      toast({
        title: 'সফল',
        description: 'সব NASA ডেটা আপডেট হয়েছে',
      });
    } catch (error) {
      console.error('Error refreshing all data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ডেটা আপডেট করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setRefreshingAll(false);
    }
  };

  // Calculate overall system status
  const getSystemStatus = () => {
    const totalLoading = (openETData.loading ? 1 : 0) + 
                        (cropCASMAData.loading ? 1 : 0) + 
                        (earthObservation.loading ? 1 : 0) + 
                        (weatherData.loading ? 1 : 0) +
                        (zonesLoading ? 1 : 0);
    
    if (totalLoading === 5) return { status: 'loading', text: 'সব ডেটা লোড হচ্ছে', color: 'bg-blue-500' };
    if (totalLoading > 0) return { status: 'partial', text: 'কিছু ডেটা লোড হচ্ছে', color: 'bg-yellow-500' };
    return { status: 'ready', text: 'সব ডেটা প্রস্তুত', color: 'bg-green-500' };
  };

  const systemStatus = getSystemStatus();
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
                NASA স্যাটেলাইট + ড্রোন ভিশন
              </h1>
              <p className="text-xs text-muted-foreground">NASA ডেটা সহ NDVI ম্যাপ ও ড্রোন রুট অপ্টিমাইজেশন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* System Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", systemStatus.color)} />
              <span className="text-xs text-muted-foreground">{systemStatus.text}</span>
            </div>
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
              onClick={refreshAllData}
              disabled={refreshingAll}
              className="rounded-full"
            >
              {refreshingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* NASA Data Sources Overview */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">OpenET</p>
                  <p className="text-lg font-bold text-blue-900">
                    {openETData.fields.length > 0 ? toBengaliNumber(openETData.fields.length) : '০'}
                  </p>
                  <p className="text-xs text-blue-700">জল ব্যবস্থাপনা</p>
                </div>
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Crop-CASMA</p>
                  <p className="text-lg font-bold text-orange-900">
                    {cropCASMAData.droughtAlerts.length > 0 ? toBengaliNumber(cropCASMAData.droughtAlerts.length) : '০'}
                  </p>
                  <p className="text-xs text-orange-700">খরা সতর্কতা</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Earth Obs</p>
                  <p className="text-lg font-bold text-green-900">
                    {earthObservation.fields.length > 0 ? toBengaliNumber(earthObservation.fields.length) : '০'}
                  </p>
                  <p className="text-xs text-green-700">স্যাটেলাইট</p>
                </div>
                <Satellite className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Weather</p>
                  <p className="text-lg font-bold text-purple-900">
                    {weatherData.alerts.length > 0 ? toBengaliNumber(weatherData.alerts.length) : '০'}
                  </p>
                  <p className="text-xs text-purple-700">আবহাওয়া সতর্কতা</p>
                </div>
                <CloudRain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview" className="text-xs">ওভারভিউ</TabsTrigger>
            <TabsTrigger value="satellite" className="text-xs">স্যাটেলাইট</TabsTrigger>
            <TabsTrigger value="nasa" className="text-xs">NASA ডেটা</TabsTrigger>
            <TabsTrigger value="drone" className="text-xs">ড্রোন</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Interactive NASA Satellite Map */}
            <NASASatelliteMap
              latitude={location.latitude || 23.8103}
              longitude={location.longitude || 90.4125}
              zones={displayZones.slice(0, 4).map(z => ({
                id: z.id,
                name_bn: z.name_bn,
                health_score: z.health_score
              }))}
              droneRoutes={displayRoutes.map(r => ({
                id: r.id,
                task_bn: r.task_bn,
                status: r.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
                status_bn: r.status_bn,
                area_acres: r.area_acres,
                estimated_time_mins: r.estimated_time_mins,
                coverage_percentage: r.coverage_percentage,
                waypoints: r.waypoints,
                optimized_path: r.optimized_path
              }))}
              showDroneRoutes={true}
            />
            <div className="mt-2 p-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-destructive" />
                <span className="text-sm text-foreground">
                  {location.loading ? "লোকেশন খোঁজা হচ্ছে..." : `${location.city}, ${location.country}`}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">আপডেট: {lastScanTime}</span>
            </div>

            {/* Field Zones */}
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
          </TabsContent>

          {/* Satellite Tab */}
          <TabsContent value="satellite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-green-600" />
                  NASA স্যাটেলাইট পর্যবেক্ষণ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <NASAFarmMap
                  openETData={openETData.fields}
                  soilData={cropCASMAData.fields}
                  satelliteData={earthObservation.fields}
                  weatherData={weatherData.weatherData}
                  centerLat={23.8103}
                  centerLng={90.4125}
                  onFieldClick={(field) => {
                    console.log('Field clicked:', field);
                    toast({
                      title: 'ফিল্ড নির্বাচিত',
                      description: `${field.field_name_bn} - বিস্তারিত তথ্য দেখুন`,
                    });
                  }}
                />
              </CardContent>
            </Card>

            {/* NDVI Legend */}
            <Card>
              <CardContent className="p-3">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* NASA Data Tab */}
          <TabsContent value="nasa" className="space-y-4">
            {/* OpenET Water Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  OpenET জল ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {openETData.loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-600">OpenET ডেটা লোড হচ্ছে...</p>
                  </div>
                ) : openETData.fields.length > 0 ? (
                  <div className="space-y-3">
                    {openETData.fields.map((field) => (
                      <div key={field.field_id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{field.field_name_bn}</span>
                          <Badge variant={field.recommendations.drought_risk === 'high' ? 'destructive' : 
                                       field.recommendations.drought_risk === 'medium' ? 'default' : 'secondary'}>
                            {field.recommendations.drought_risk === 'high' ? 'উচ্চ ঝুঁকি' :
                             field.recommendations.drought_risk === 'medium' ? 'মাঝারি ঝুঁকি' : 'স্বাভাবিক'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">বর্তমান ET</p>
                            <p className="font-semibold">{field.current_et.et_value} mm/দিন</p>
                          </div>
                          <div>
                            <p className="text-gray-600">সেচ প্রয়োজন</p>
                            <p className="font-semibold">{field.monthly_summary.irrigation_need} mm</p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">সেচ পরামর্শ</p>
                          <p className="text-xs font-medium text-blue-700">{field.recommendations.irrigation_timing}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Droplets className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">OpenET ডেটা উপলব্ধ নেই</p>
                    <Button size="sm" variant="outline" onClick={openETData.fetchETData} className="mt-2">
                      ডেটা লোড করুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Crop-CASMA Soil Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  Crop-CASMA মাটি বিশ্লেষণ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cropCASMAData.loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-gray-600">মাটির ডেটা লোড হচ্ছে...</p>
                  </div>
                ) : cropCASMAData.fields.length > 0 ? (
                  <div className="space-y-3">
                    {cropCASMAData.fields.map((field) => (
                      <div key={field.field_id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{field.field_name_bn}</span>
                          <Badge variant={field.current_data.drought_index > 0.7 ? 'destructive' : 
                                       field.current_data.drought_index > 0.5 ? 'default' : 'secondary'}>
                            {field.current_data.drought_index > 0.7 ? 'উচ্চ খরা' :
                             field.current_data.drought_index > 0.5 ? 'মাঝারি খরা' : 'স্বাভাবিক'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">ভূপৃষ্ঠ আর্দ্রতা</p>
                            <p className="font-semibold">{(field.current_data.surface_moisture * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">মাটির তাপমাত্রা</p>
                            <p className="font-semibold">{field.current_data.soil_temperature}°C</p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">ফসল চাপ</p>
                          <p className="text-xs font-medium text-orange-700">{(field as any).crop_stress?.stress_level || 'স্বাভাবিক'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">মাটির ডেটা উপলব্ধ নেই</p>
                    <Button size="sm" variant="outline" onClick={cropCASMAData.fetchSoilData} className="mt-2">
                      ডেটা লোড করুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drone Tab */}
          <TabsContent value="drone" className="space-y-4">
            {/* Drone Routes */}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Recommendation */}
      <section className="px-4 pb-4">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-chart-4/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-semibold text-chart-4 text-sm mb-1">AI পরামর্শ (NASA ডেটা সহ)</h3>
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
