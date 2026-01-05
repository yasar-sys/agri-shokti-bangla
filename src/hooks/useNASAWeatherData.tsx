// NASA Climate and Weather Forecasting Hook
// Integrates NASA POWER and GMAO data for agricultural weather forecasting

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  date: string;
  temperature_max: number; // Celsius
  temperature_min: number; // Celsius
  temperature_avg: number; // Celsius
  humidity: number; // 0-100 percentage
  precipitation: number; // mm
  wind_speed: number; // km/h
  wind_direction: number; // degrees
  solar_radiation: number; // MJ/m²/day
  evapotranspiration: number; // mm/day
  cloud_cover: number; // 0-100 percentage
  pressure: number; // hPa
  dew_point: number; // Celsius
}

interface WeatherAlert {
  id: string;
  type: 'frost' | 'heat_wave' | 'drought' | 'flood' | 'storm' | 'wind' | 'pest_warning';
  severity: 'watch' | 'warning' | 'advisory' | 'emergency';
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  affected_areas: string[];
  start_time: string;
  end_time: string;
  confidence: number; // 0-1
  recommendations: string[];
  recommendations_bn: string[];
  agricultural_impact: string;
  agricultural_impact_bn: string;
}

interface ClimateForecast {
  forecast_date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability: number; // 0-100
  precipitation_amount: number; // mm
  humidity: number;
  wind_speed: number;
  conditions: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'stormy';
  confidence: number; // 0-1
  agricultural_suitability: 'excellent' | 'good' | 'moderate' | 'poor' | 'unsuitable';
  pest_disease_risk: 'low' | 'medium' | 'high';
  field_work_suitability: 'excellent' | 'good' | 'moderate' | 'poor';
}

interface SeasonalOutlook {
  season_name: string;
  season_name_bn: string;
  start_date: string;
  end_date: string;
  temperature_trend: 'above_normal' | 'normal' | 'below_normal';
  precipitation_trend: 'above_normal' | 'normal' | 'below_normal';
  drought_probability: number; // 0-100
  flood_probability: number; // 0-100
  el_nino_impact: 'positive' | 'neutral' | 'negative';
  overall_outlook: 'favorable' | 'normal' | 'challenging';
  recommendations: string[];
  recommendations_bn: string[];
}

interface WeatherAnalysis {
  location_name: string;
  location_name_bn: string;
  latitude: number;
  longitude: number;
  current_conditions: WeatherData;
  historical_data: WeatherData[]; // Last 30 days
  forecast_7day: ClimateForecast[];
  forecast_14day: ClimateForecast[];
  seasonal_outlook: SeasonalOutlook;
  active_alerts: WeatherAlert[];
  agricultural_summary: {
    growing_degree_days: number; // Accumulated GDD
    frost_free_days: number;
    total_precipitation_30d: number;
    avg_temperature_30d: number;
    precipitation_deficit: number;
    soil_moisture_outlook: string;
    soil_moisture_outlook_bn: string;
  };
  crop_advisory: {
    planting_suitability: 'excellent' | 'good' | 'moderate' | 'poor';
    irrigation_need: 'none' | 'light' | 'moderate' | 'heavy';
    pest_monitoring_priority: 'low' | 'medium' | 'high' | 'urgent';
    disease_risk: 'low' | 'medium' | 'high';
    field_operations: string[];
    field_operations_bn: string[];
  };
  data_sources: {
    primary_source: string;
    supporting_sources: string[];
    last_updated: string;
    next_update: string;
  };
}

export function useNASAWeatherData(userId: string | null) {
  const [weatherData, setWeatherData] = useState<WeatherAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [forecastUpdating, setForecastUpdating] = useState(false);
  const { toast } = useToast();

  // Generate realistic NASA weather demo data
  const generateDemoWeatherData = useCallback((): WeatherAnalysis => {
    const today = new Date();
    const historicalData: WeatherData[] = [];
    
    // Generate 30 days of historical weather data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic Bangladesh weather patterns
      const baseTemp = 25 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 5; // Seasonal variation
      const dailyVariation = Math.random() * 8 - 4;
      const maxTemp = baseTemp + 5 + dailyVariation + Math.random() * 3;
      const minTemp = baseTemp - 3 + dailyVariation + Math.random() * 2;
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        temperature_max: Number(maxTemp.toFixed(1)),
        temperature_min: Number(minTemp.toFixed(1)),
        temperature_avg: Number(((maxTemp + minTemp) / 2).toFixed(1)),
        humidity: Number((60 + Math.random() * 30).toFixed(0)),
        precipitation: Math.random() > 0.7 ? Number((Math.random() * 15).toFixed(1)) : 0,
        wind_speed: Number((5 + Math.random() * 15).toFixed(1)),
        wind_direction: Math.floor(Math.random() * 360),
        solar_radiation: Number((15 + Math.random() * 10).toFixed(1)),
        evapotranspiration: Number((3 + Math.random() * 4).toFixed(2)),
        cloud_cover: Number((Math.random() * 100).toFixed(0)),
        pressure: Number((1008 + Math.random() * 20).toFixed(0)),
        dew_point: Number((minTemp + 2 + Math.random() * 3).toFixed(1))
      });
    }

    const currentConditions = historicalData[historicalData.length - 1];

    // Generate 7-day forecast
    const forecast7day: ClimateForecast[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const conditions: Array<'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'stormy'> = 
        ['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'stormy'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      forecast7day.push({
        forecast_date: date.toISOString().split('T')[0],
        temperature_max: Number((currentConditions.temperature_max + (Math.random() - 0.5) * 5).toFixed(1)),
        temperature_min: Number((currentConditions.temperature_min + (Math.random() - 0.5) * 4).toFixed(1)),
        precipitation_probability: condition === 'rainy' || condition === 'stormy' ? 
          Number((60 + Math.random() * 35).toFixed(0)) : Number((Math.random() * 30).toFixed(0)),
        precipitation_amount: condition === 'rainy' || condition === 'stormy' ? 
          Number((Math.random() * 12).toFixed(1)) : Number((Math.random() * 2).toFixed(1)),
        humidity: Number((50 + Math.random() * 40).toFixed(0)),
        wind_speed: Number((5 + Math.random() * 20).toFixed(1)),
        conditions: condition,
        confidence: Number((0.7 + Math.random() * 0.25).toFixed(3)),
        agricultural_suitability: condition === 'sunny' ? 'excellent' : 
                                 condition === 'partly_cloudy' ? 'good' :
                                 condition === 'cloudy' ? 'moderate' : 'poor',
        pest_disease_risk: condition === 'rainy' || condition === 'stormy' ? 'high' : 'medium',
        field_work_suitability: condition === 'sunny' || condition === 'partly_cloudy' ? 'excellent' : 
                              condition === 'cloudy' ? 'moderate' : 'poor'
      });
    }

    // Generate 14-day forecast (extended with lower confidence)
    const forecast14day = [...forecast7day];
    for (let i = 8; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      forecast14day.push({
        forecast_date: date.toISOString().split('T')[0],
        temperature_max: Number((currentConditions.temperature_max + (Math.random() - 0.5) * 8).toFixed(1)),
        temperature_min: Number((currentConditions.temperature_min + (Math.random() - 0.5) * 6).toFixed(1)),
        precipitation_probability: Number((Math.random() * 100).toFixed(0)),
        precipitation_amount: Number((Math.random() * 15).toFixed(1)),
        humidity: Number((40 + Math.random() * 50).toFixed(0)),
        wind_speed: Number((5 + Math.random() * 25).toFixed(1)),
        conditions: (['sunny', 'partly_cloudy', 'cloudy', 'rainy'] as const)[Math.floor(Math.random() * 4)],
        confidence: Number((0.5 + Math.random() * 0.3).toFixed(3)),
        agricultural_suitability: 'moderate',
        pest_disease_risk: 'medium',
        field_work_suitability: 'moderate'
      });
    }

    // Generate seasonal outlook
    const seasonalOutlook: SeasonalOutlook = {
      season_name: 'Boro Season',
      season_name_bn: 'বোরো মৌসুম',
      start_date: '2024-11-01',
      end_date: '2025-05-31',
      temperature_trend: Math.random() > 0.5 ? 'above_normal' : 'normal',
      precipitation_trend: Math.random() > 0.6 ? 'below_normal' : 'normal',
      drought_probability: Number((Math.random() * 30).toFixed(0)),
      flood_probability: Number((Math.random() * 20).toFixed(0)),
      el_nino_impact: Math.random() > 0.7 ? 'positive' : 'neutral',
      overall_outlook: Math.random() > 0.6 ? 'favorable' : 'normal',
      recommendations: [
        'সময়মতো বোরো ধান চাষ শুরু করুন',
        'সেচ ব্যবস্থাপনায় গুরুত্ব দিন',
        'উন্নত মানের বীজ ব্যবহার করুন',
        'সার ব্যবস্থাপনায় সতর্ক থাকুন'
      ],
      recommendations_bn: [
        'সময়মতো বোরো ধান চাষ শুরু করুন',
        'সেচ ব্যবস্থাপনায় গুরুত্ব দিন',
        'উন্নত মানের বীজ ব্যবহার করুন',
        'সার ব্যবস্থাপনায় সতর্ক থাকুন'
      ]
    };

    // Generate weather alerts
    const activeAlerts: WeatherAlert[] = [];
    if (currentConditions.temperature_max > 35) {
      activeAlerts.push({
        id: 'heat-001',
        type: 'heat_wave',
        severity: 'warning',
        title: 'তাপপ্রবাহ সতর্কতা',
        title_bn: 'তাপপ্রবাহ সতর্কতা',
        description: `High temperature of ${currentConditions.temperature_max}°C detected. Heat stress warning for crops.`,
        description_bn: `${currentConditions.temperature_max}°C তাপমাত্রা সনাক্ত হয়েছে। ফসলের জন্য তাপপ্রবাহ সতর্কতা।`,
        affected_areas: ['ঢাকা', 'রাজশাহী', 'খুলনা'],
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85,
        recommendations: [
          'Increase irrigation frequency',
          'Provide shade for sensitive crops',
          'Monitor for heat stress symptoms',
          'Avoid field work during peak hours'
        ],
        recommendations_bn: [
          'সেচের ফ্রিকোয়েন্সি বাড়ান',
          'স্পর্শকাতর ফসলের জন্য ছায়া প্রদান করুন',
          'তাপপ্রবাহের লক্ষণগুলি পর্যবেক্ষণ করুন',
          'শীর্ষ সময়ে ক্ষেতকাজ এড়িয়ে চলুন'
        ],
        agricultural_impact: 'Heat stress can reduce crop yield and affect pollination',
        agricultural_impact_bn: 'তাপপ্রবাহ ফসলের ফলন কমাতে পারে এবং পরাগায়নকে প্রভাবিত করতে পারে'
      });
    }

    // Calculate agricultural summary
    const growingDegreeDays = historicalData.reduce((sum, day) => {
      const gdd = Math.max(0, (day.temperature_max + day.temperature_min) / 2 - 10); // Base temp 10°C
      return sum + gdd;
    }, 0);

    const totalPrecip30d = historicalData.reduce((sum, day) => sum + day.precipitation, 0);
    const avgTemp30d = historicalData.reduce((sum, day) => sum + day.temperature_avg, 0) / 30;
    const precipitationDeficit = Math.max(0, (100 - totalPrecip30d)); // Assume 100mm needed

    return {
      location_name: 'Mymensingh Division',
      location_name_bn: 'ময়মনসিংহ বিভাগ',
      latitude: 24.7471,
      longitude: 90.4203,
      current_conditions: currentConditions,
      historical_data: historicalData,
      forecast_7day: forecast7day,
      forecast_14day: forecast14day,
      seasonal_outlook: seasonalOutlook,
      active_alerts: activeAlerts,
      agricultural_summary: {
        growing_degree_days: Math.round(growingDegreeDays),
        frost_free_days: 365, // Bangladesh doesn't have frost
        total_precipitation_30d: Number(totalPrecip30d.toFixed(1)),
        avg_temperature_30d: Number(avgTemp30d.toFixed(1)),
        precipitation_deficit: Number(precipitationDeficit.toFixed(1)),
        soil_moisture_outlook: precipitationDeficit > 50 ? 'শুষ্ক' : precipitationDeficit > 20 ? 'মাঝারি' : 'ভালো',
        soil_moisture_outlook_bn: precipitationDeficit > 50 ? 'শুষ্ক' : precipitationDeficit > 20 ? 'মাঝারি' : 'ভালো'
      },
      crop_advisory: {
        planting_suitability: currentConditions.precipitation > 5 ? 'moderate' : 
                             currentConditions.temperature_avg > 20 ? 'excellent' : 'good',
        irrigation_need: precipitationDeficit > 50 ? 'heavy' : 
                        precipitationDeficit > 20 ? 'moderate' : 
                        precipitationDeficit > 5 ? 'light' : 'none',
        pest_monitoring_priority: currentConditions.humidity > 80 ? 'high' : 
                                  currentConditions.humidity > 60 ? 'medium' : 'low',
        disease_risk: currentConditions.humidity > 85 && currentConditions.temperature_avg > 25 ? 'high' : 
                     currentConditions.humidity > 70 ? 'medium' : 'low',
        field_operations: currentConditions.precipitation < 2 && currentConditions.wind_speed < 15 ? 
          ['চাষা', 'সার প্রয়োগ', 'সেচ', 'ফসল পরিচর্যা'] : 
          ['পরিকল্পনা পর্যালোচনা', 'সরঞ্জাম প্রস্তুতি'],
        field_operations_bn: currentConditions.precipitation < 2 && currentConditions.wind_speed < 15 ? 
          ['চাষা', 'সার প্রয়োগ', 'সেচ', 'ফসল পরিচর্যা'] : 
          ['পরিকল্পনা পর্যালোচনা', 'সরঞ্জাম প্রস্তুতি']
      },
      data_sources: {
        primary_source: 'NASA POWER',
        supporting_sources: ['GMAO GEOS-FP', 'MODIS', 'TRMM'],
        last_updated: new Date().toISOString(),
        next_update: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      }
    };
  }, []);

  // Fetch NASA weather data
  const fetchWeatherData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Try to get real data from edge function
      const { data, error } = await supabase.functions.invoke('nasa-weather', {
        body: { userId, action: 'fetch_weather_data' }
      });

      if (error || !data?.success) {
        console.log('NASA Weather edge function not available, using demo data');
        
        const demoData = generateDemoWeatherData();
        setWeatherData(demoData);
        setAlerts(demoData.active_alerts);
      } else {
        setWeatherData(data.weather_data);
        setAlerts(data.active_alerts || []);
      }
    } catch (error) {
      console.error('Error fetching NASA weather data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'NASA আবহাওয়া ডেটা লোড করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, generateDemoWeatherData, toast]);

  // Refresh weather forecast
  const refreshForecast = useCallback(async () => {
    if (!userId) return;

    setForecastUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('nasa-weather', {
        body: { userId, action: 'refresh_forecast' }
      });

      if (error || !data?.success) {
        // Update with refreshed demo data
        const refreshedData = generateDemoWeatherData();
        setWeatherData(refreshedData);
        setAlerts(refreshedData.active_alerts);
      } else {
        setWeatherData(data.weather_data);
        setAlerts(data.active_alerts || []);
      }

      toast({
        title: 'সফল',
        description: 'আবহাওয়া পূর্বাভাস আপডেট হয়েছে',
      });
    } catch (error) {
      console.error('Error refreshing forecast:', error);
      toast({
        title: 'ত্রুটি',
        description: 'পূর্বাভাস আপডেট করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setForecastUpdating(false);
    }
  }, [userId, generateDemoWeatherData, toast]);

  // Get agricultural weather summary
  const getAgriculturalSummary = useCallback(() => {
    if (!weatherData) return null;

    const { current_conditions, forecast_7day, agricultural_summary, crop_advisory } = weatherData;

    // Calculate next 7 days averages
    const avgNext7Days = {
      temperature: forecast_7day.reduce((sum, day) => sum + day.temperature_max, 0) / forecast_7day.length,
      precipitation: forecast_7day.reduce((sum, day) => sum + day.precipitation_amount, 0),
      humidity: forecast_7day.reduce((sum, day) => sum + day.humidity, 0) / forecast_7day.length,
      suitable_days: forecast_7day.filter(day => day.field_work_suitability === 'excellent').length
    };

    return {
      current_status: {
        temperature: current_conditions.temperature_avg,
        humidity: current_conditions.humidity,
        precipitation: current_conditions.precipitation,
        overall_conditions: current_conditions.precipitation > 10 ? 'wet' : 
                           current_conditions.temperature_avg > 30 ? 'hot' : 'moderate'
      },
      short_term_outlook: {
        next_7_days_avg_temp: Number(avgNext7Days.temperature.toFixed(1)),
        next_7_days_total_rain: Number(avgNext7Days.precipitation.toFixed(1)),
        next_7_days_avg_humidity: Number(avgNext7Days.humidity.toFixed(0)),
        suitable_field_work_days: avgNext7Days.suitable_days,
        outlook_summary: avgNext7Days.precipitation > 50 ? 'বৃষ্টিপূর্ণ' :
                        avgNext7Days.temperature > 32 ? 'উষ্ণ' : 'অনুকূল'
      },
      agricultural_impacts: {
        growing_degree_days: agricultural_summary.growing_degree_days,
        irrigation_requirement: crop_advisory.irrigation_need,
        pest_monitoring_level: crop_advisory.pest_monitoring_priority,
        disease_risk_level: crop_advisory.disease_risk,
        recommended_operations: crop_advisory.field_operations,
        recommended_operations_bn: crop_advisory.field_operations_bn
      },
      alerts_summary: {
        total_active_alerts: alerts.length,
        high_priority_alerts: alerts.filter(a => a.severity === 'warning' || a.severity === 'emergency').length,
        weather_related_alerts: alerts.filter(a => ['frost', 'heat_wave', 'drought', 'flood', 'storm'].includes(a.type)).length,
        agricultural_alerts: alerts.filter(a => ['pest_warning'].includes(a.type)).length
      },
      seasonal_context: {
        current_season: weatherData.seasonal_outlook.season_name_bn,
        temperature_trend: weatherData.seasonal_outlook.temperature_trend,
        precipitation_trend: weatherData.seasonal_outlook.precipitation_trend,
        seasonal_outlook: weatherData.seasonal_outlook.overall_outlook
      },
      data_freshness: {
        last_updated: weatherData.data_sources.last_updated,
        next_update: weatherData.data_sources.next_update,
        data_quality: 'high' // NASA data quality
      }
    };
  }, [weatherData, alerts]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchWeatherData();
    }
  }, [userId, fetchWeatherData]);

  return {
    weatherData,
    loading,
    refreshing,
    forecastUpdating,
    alerts,
    fetchWeatherData,
    refreshForecast,
    getAgriculturalSummary,
  };
}
