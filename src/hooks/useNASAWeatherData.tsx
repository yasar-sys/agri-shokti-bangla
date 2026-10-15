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

  // Fetch NASA weather data
  const fetchWeatherData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    try {
      setLoading(true);

      // Try to get real data from edge function
      const { data, error } = await supabase.functions.invoke('nasa-weather', {
        body: { userId, action: 'fetch_weather_data' }
      });

      if (error || !data?.success) {
        setWeatherData(null);
        setAlerts([]);
        throw new Error('NASA-এর প্রকৃত তথ্য এখন পাওয়া যাচ্ছে না');
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
  }, [userId, toast]);

  // Refresh weather forecast
  const refreshForecast = useCallback(async () => {
    if (!userId) return;

    setForecastUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('nasa-weather', {
        body: { userId, action: 'refresh_forecast' }
      });

      if (error || !data?.success) {
        throw new Error('NASA-এর প্রকৃত তথ্য আপডেট করা যায়নি');
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
  }, [userId, toast]);

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
    fetchWeatherData();
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
