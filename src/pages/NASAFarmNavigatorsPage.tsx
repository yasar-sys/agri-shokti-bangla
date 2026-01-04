// NASA Farm Navigators Dashboard Page
// Comprehensive integration of NASA Earth observation data for agriculture

import { useEffect, useState } from "react";
import { ArrowLeft, Satellite, Droplets, Thermometer, AlertTriangle, CloudRain, BarChart3, Map, Leaf, Radio, TrendingUp, Calendar, Download, RefreshCw, Eye, Activity, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpenETData } from "@/hooks/useOpenETData";
import { useCropCASMAData } from "@/hooks/useCropCASMAData";
import { useNASAEarthObservation } from "@/hooks/useNASAEarthObservation";
import { useNASAWeatherData } from "@/hooks/useNASAWeatherData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NASAFarmMap } from "@/components/NASAFarmMap";
import { cn } from "@/lib/utils";

// Convert number to Bengali numerals
function toBengaliNumber(num: number): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => {
    if (d === '.') return '.';
    return bengaliNumerals[parseInt(d)] || d;
  }).join('');
}

export default function NASAFarmNavigatorsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshingAll, setRefreshingAll] = useState(false);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // NASA Data Hooks
  const openETData = useOpenETData(userId);
  const cropCASMAData = useCropCASMAData(userId);
  const earthObservation = useNASAEarthObservation(userId);
  const weatherData = useNASAWeatherData(userId);

  // Refresh all NASA data sources
  const refreshAllData = async () => {
    setRefreshingAll(true);
    try {
      await Promise.all([
        openETData.fetchETData(),
        cropCASMAData.fetchSoilData(),
        earthObservation.fetchSatelliteData(),
        weatherData.fetchWeatherData()
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
                        (weatherData.loading ? 1 : 0);
    
    if (totalLoading === 4) return { status: 'loading', text: 'সব ডেটা লোড হচ্ছে', color: 'bg-blue-500' };
    if (totalLoading > 0) return { status: 'partial', text: 'কিছু ডেটা লোড হচ্ছে', color: 'bg-yellow-500' };
    return { status: 'ready', text: 'সব ডেটা প্রস্তুত', color: 'bg-green-500' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Satellite className="w-5 h-5 text-blue-600" />
                NASA Farm Navigators
              </h1>
              <p className="text-xs text-gray-600">পৃথিবী পর্যবেক্ষণ ডেটা চাষাবাদে</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* System Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", systemStatus.color)} />
              <span className="text-xs text-gray-600">{systemStatus.text}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAllData}
              disabled={refreshingAll}
              className="text-xs"
            >
              {refreshingAll ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              সব আপডেট
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4">
        {/* NASA Data Sources Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">OpenET</p>
                  <p className="text-lg font-bold text-blue-900">
                    {openETData.fields.length > 0 ? toBengaliNumber(openETData.fields.length) : '০'}
                  </p>
                  <p className="text-xs text-blue-700">ফিল্ড</p>
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
                    {cropCASMAData.fields.length > 0 ? toBengaliNumber(cropCASMAData.fields.length) : '০'}
                  </p>
                  <p className="text-xs text-orange-700">মাটি বিশ্লেষণ</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
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
                <Map className="w-8 h-8 text-green-500" />
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
                  <p className="text-xs text-purple-700">সতর্কতা</p>
                </div>
                <CloudRain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100">
            <TabsTrigger value="overview" className="text-xs">ওভারভিউ</TabsTrigger>
            <TabsTrigger value="water" className="text-xs">জলবায়ু</TabsTrigger>
            <TabsTrigger value="soil" className="text-xs">মাটি</TabsTrigger>
            <TabsTrigger value="satellite" className="text-xs">স্যাটেলাইট</TabsTrigger>
            <TabsTrigger value="map" className="text-xs">মানচিত্র</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  NASA ডেটা ওভারভিউ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* OpenET Water Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      OpenET জল ব্যবস্থাপনা
                    </span>
                    <Badge variant={openETData.fields.length > 0 ? "default" : "secondary"}>
                      {openETData.fields.length > 0 ? "সক্রিয়" : "প্রস্তুত"}
                    </Badge>
                  </div>
                  {openETData.fields.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <p>• বাষ্পীভবন ডেটা: {openETData.fields.length} টি ফিল্ড</p>
                      <p>• সেচ পরামর্শ: স্বয়ংক্রিয়</p>
                      <p>• জল ভারসাম্য: পর্যবেক্ষণ চলছে</p>
                    </div>
                  )}
                </div>

                {/* Crop-CASMA Soil Analysis */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-500" />
                      Crop-CASMA মাটি বিশ্লেষণ
                    </span>
                    <Badge variant={cropCASMAData.fields.length > 0 ? "default" : "secondary"}>
                      {cropCASMAData.fields.length > 0 ? "সক্রিয়" : "প্রস্তুত"}
                    </Badge>
                  </div>
                  {cropCASMAData.fields.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <p>• মাটির আর্দ্রতা: {cropCASMAData.fields.length} টি ফিল্ড</p>
                      <p>• খরা সতর্কতা: {cropCASMAData.droughtAlerts.length} টি</p>
                      <p>• ফসল চাপ: পর্যবেক্ষণ চলছে</p>
                    </div>
                  )}
                </div>

                {/* Earth Observation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Satellite className="w-4 h-4 text-green-500" />
                      NASA স্যাটেলাইট পর্যবেক্ষণ
                    </span>
                    <Badge variant={earthObservation.fields.length > 0 ? "default" : "secondary"}>
                      {earthObservation.fields.length > 0 ? "সক্রিয়" : "প্রস্তুত"}
                    </Badge>
                  </div>
                  {earthObservation.fields.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <p>• NDVI বিশ্লেষণ: {earthObservation.fields.length} টি ফিল্ড</p>
                      <p>• ফসল স্বাস্থ্য: স্বয়ংক্রিয়</p>
                      <p>• পরিবর্তন সনাক্তকরণ: চলছে</p>
                    </div>
                  )}
                </div>

                {/* Weather Forecast */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-purple-500" />
                      NASA আবহাওয়া পূর্বাভাস
                    </span>
                    <Badge variant={weatherData.weatherData ? "default" : "secondary"}>
                      {weatherData.weatherData ? "সক্রিয়" : "প্রস্তুত"}
                    </Badge>
                  </div>
                  {weatherData.weatherData && (
                    <div className="text-xs text-gray-600">
                      <p>• ৭ দিনের পূর্বাভাস: সক্রিয়</p>
                      <p>• সক্রিয় সতর্কতা: {weatherData.alerts.length} টি</p>
                      <p>• কৃষি পরামর্শ: স্বয়ংক্রিয়</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  দ্রুত পদক্ষেপ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('water')}
                    className="text-xs justify-start"
                  >
                    <Droplets className="w-3 h-3 mr-2" />
                    জল ব্যবস্থাপনা
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('soil')}
                    className="text-xs justify-start"
                  >
                    <Activity className="w-3 h-3 mr-2" />
                    মাটি বিশ্লেষণ
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('satellite')}
                    className="text-xs justify-start"
                  >
                    <Satellite className="w-3 h-3 mr-2" />
                    স্যাটেলাইট ডেটা
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshAllData}
                    disabled={refreshingAll}
                    className="text-xs justify-start"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    সব আপডেট
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Water Management Tab */}
          <TabsContent value="water" className="space-y-4">
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
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
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

            {/* Weather Forecast */}
            {weatherData.weatherData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-purple-600" />
                    আবহাওয়া পূর্বাভাস
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weatherData.weatherData.forecast_7day.slice(0, 5).map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="font-medium">
                          {new Date(forecast.forecast_date).toLocaleDateString('bn-BD', { weekday: 'short' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{forecast.temperature_max}°C</span>
                          {forecast.precipitation_amount > 0 && (
                            <span className="text-blue-600">💧 {forecast.precipitation_amount}mm</span>
                          )}
                        </div>
                        <Badge variant={forecast.agricultural_suitability === 'excellent' ? 'default' : 
                                     forecast.agricultural_suitability === 'good' ? 'secondary' : 'outline'}>
                          {forecast.agricultural_suitability === 'excellent' ? 'অনুকূল' :
                           forecast.agricultural_suitability === 'good' ? 'ভালো' : 'মাঝারি'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Soil Analysis Tab */}
          <TabsContent value="soil" className="space-y-4">
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
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-gray-600">Crop-CASMA ডেটা লোড হচ্ছে...</p>
                  </div>
                ) : cropCASMAData.fields.length > 0 ? (
                  <div className="space-y-3">
                    {cropCASMAData.fields.map((field) => (
                      <div key={field.field_id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{field.field_name_bn}</span>
                          <Badge variant={field.current_data.drought_index > 0.7 ? 'destructive' : 
                                       field.current_data.drought_index > 0.5 ? 'default' : 'secondary'}>
                            {field.current_data.drought_index > 0.7 ? 'তীব্র খরা' :
                             field.current_data.drought_index > 0.5 ? 'মাঝারি খরা' : 'স্বাভাবিক'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">পৃষ্ঠের আর্দ্রতা</span>
                              <span>{Math.round(field.current_data.surface_moisture * 100)}%</span>
                            </div>
                            <Progress value={field.current_data.surface_moisture * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">রুট জোন আর্দ্রতা</span>
                              <span>{Math.round(field.current_data.root_zone_moisture * 100)}%</span>
                            </div>
                            <Progress value={field.current_data.root_zone_moisture * 100} className="h-2" />
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">সেচ পরামর্শ</p>
                          <p className="text-xs font-medium text-orange-700">{field.recommendations.irrigation_bn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Crop-CASMA ডেটা উপলব্ধ নেই</p>
                    <Button size="sm" variant="outline" onClick={cropCASMAData.fetchSoilData} className="mt-2">
                      ডেটা লোড করুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Drought Alerts */}
            {cropCASMAData.droughtAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    খরা সতর্কতা
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cropCASMAData.droughtAlerts.map((alert, index) => (
                      <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-red-800">{alert.title_bn}</span>
                          <Badge variant="destructive">{alert.severity === 'emergency' ? 'জরুরি' : 'সতর্কতা'}</Badge>
                        </div>
                        <p className="text-xs text-red-700">{alert.description_bn}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="w-4 h-4 text-green-600" />
                  NASA ডেটা মানচিত্র
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[550px]">
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
                      description: `${field.name_bn} - বিস্তারিত তথ্য দেখুন`,
                    });
                  }}
                />
              </CardContent>
            </Card>

            {/* Map Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
                <CardContent className="p-3 text-center">
                  <Map className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold text-blue-900">
                    {openETData.fields.length + cropCASMAData.fields.length + earthObservation.fields.length}
                  </p>
                  <p className="text-xs text-blue-700">মোট ফিল্ড</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
                <CardContent className="p-3 text-center">
                  <Layers className="w-6 h-6 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold text-green-900">5</p>
                  <p className="text-xs text-green-700">ডেটা স্তর</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
                <CardContent className="p-3 text-center">
                  <Activity className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-lg font-bold text-purple-900">
                    {cropCASMAData.droughtAlerts.length}
                  </p>
                  <p className="text-xs text-purple-700">সতর্কতা</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="satellite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-green-600" />
                  NASA স্যাটেলাইট পর্যবেক্ষণ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {earthObservation.loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-600">স্যাটেলাইট ডেটা লোড হচ্ছে...</p>
                  </div>
                ) : earthObservation.fields.length > 0 ? (
                  <div className="space-y-3">
                    {earthObservation.fields.map((field) => (
                      <div key={field.field_id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{field.field_name_bn}</span>
                          <Badge variant={field.change_detection.trend === 'declining' ? 'destructive' : 
                                       field.change_detection.trend === 'improving' ? 'default' : 'secondary'}>
                            {field.change_detection.trend === 'declining' ? 'অবনতি' :
                             field.change_detection.trend === 'improving' ? 'উন্নতি' : 'স্থিতিশীল'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">NDVI</p>
                            <p className="font-semibold">{field.vegetation_indices.ndvi.toFixed(3)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">ফসল স্বাস্থ্য</p>
                            <p className="font-semibold">{field.crop_health.vigor_score}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">জৈব ভর</p>
                            <p className="font-semibold">{field.crop_health.biomass_estimate} kg/ha</p>
                          </div>
                          <div>
                            <p className="text-gray-600">ফলন পূর্বাভাস</p>
                            <p className="font-semibold">{field.crop_health.yield_prediction} ton/ha</p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">স্যাটেলাইট</p>
                          <p className="text-xs font-medium text-green-700">{field.satellite_data.satellite}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Satellite className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">স্যাটেলাইট ডেটা উপলব্ধ নেই</p>
                    <Button size="sm" variant="outline" onClick={earthObservation.fetchSatelliteData} className="mt-2">
                      ডেটা লোড করুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Satellites */}
            {earthObservation.availableSatellites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600" />
                    উপলব্ধ স্যাটেলাইট
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {earthObservation.availableSatellites.map((satellite, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {satellite}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
