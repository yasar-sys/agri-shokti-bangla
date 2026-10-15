// NASA Crop-CASMA Soil Moisture and Drought Monitoring Hook
// Integrates with USDA-NASA Crop-CASMA for soil moisture analysis

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SoilMoistureData {
  date: string;
  surface_moisture: number; // 0-1 percentage
  root_zone_moisture: number; // 0-1 percentage
  soil_temperature: number; // Celsius
  drought_index: number; // 0-1 (0 = no drought, 1 = extreme drought)
  precipitation_deficit: number; // mm
  field_capacity: number; // 0-1
  wilting_point: number; // 0-1
  available_water: number; // 0-1
  data_quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface DroughtAlert {
  severity: 'watch' | 'warning' | 'emergency';
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  affected_areas: string[];
  recommendations: string[];
  recommendations_bn: string[];
  valid_from: string;
  valid_until: string;
}

interface FieldSoilAnalysis {
  field_id: string;
  field_name: string;
  field_name_bn: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  soil_type: string;
  current_data: SoilMoistureData;
  historical_data: SoilMoistureData[]; // Last 30 days
  drought_trend: 'improving' | 'stable' | 'worsening';
  drought_alerts: DroughtAlert[];
  recommendations: {
    irrigation: string;
    irrigation_bn: string;
    conservation: string[];
    conservation_bn: string[];
    monitoring: string;
    monitoring_bn: string;
  };
  crop_stress_indicators: {
    vegetation_health: number; // 0-1
    growth_stage: string;
    water_requirement: 'low' | 'medium' | 'high' | 'critical';
    yield_impact_risk: 'none' | 'low' | 'medium' | 'high';
  };
  last_updated: string;
}

export function useCropCASMAData(userId: string | null) {
  const [fields, setFields] = useState<FieldSoilAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldSoilAnalysis | null>(null);
  const [droughtAlerts, setDroughtAlerts] = useState<DroughtAlert[]>([]);
  const { toast } = useToast();

  // Fetch Crop-CASMA data for all fields
  const fetchSoilData = useCallback(async () => {
    if (!userId) { setLoading(false); setFields([]); setSelectedField(null); return; }

    try {
      setLoading(true);

      // Try to get real data from edge function
      const { data, error } = await supabase.functions.invoke('crop-casma', {
        body: { userId, action: 'fetch_all_fields' }
      });

      if (error || !data?.success) {
        setFields([]);
        setSelectedField(null);
        setDroughtAlerts([]);
        throw new Error('মাটির আর্দ্রতার প্রকৃত তথ্য এখন পাওয়া যাচ্ছে না');
      } else {
        setFields(data.fields || []);
        if (data.fields?.length > 0) {
          setSelectedField(data.fields[0]);
        }
        setDroughtAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching Crop-CASMA data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'Crop-CASMA ডেটা লোড করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Refresh soil data for a specific field
  const refreshFieldSoil = useCallback(async (fieldId: string) => {
    if (!userId) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('crop-casma', {
        body: { userId, action: 'refresh_field', fieldId }
      });

      if (error || !data?.success) {
        throw new Error('মাটির আর্দ্রতার প্রকৃত তথ্য এখন পাওয়া যাচ্ছে না');
      } else {
        setFields(prev => prev.map(f => f.field_id === fieldId ? data.field : f));
        if (selectedField?.field_id === fieldId) {
          setSelectedField(data.field);
        }
      }

      toast({
        title: 'সফল',
        description: 'মাটির আর্দ্রতা ডেটা আপডেট হয়েছে',
      });
    } catch (error) {
      console.error('Error refreshing field soil data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'মাটির ডেটা আপডেট করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [userId, selectedField, toast]);

  // Get regional drought analysis
  const getRegionalDroughtAnalysis = useCallback(() => {
    if (fields.length === 0) return null;

    const avgDroughtIndex = fields.reduce((sum, field) => sum + field.current_data.drought_index, 0) / fields.length;
    const avgSurfaceMoisture = fields.reduce((sum, field) => sum + field.current_data.surface_moisture, 0) / fields.length;
    const avgRootZoneMoisture = fields.reduce((sum, field) => sum + field.current_data.root_zone_moisture, 0) / fields.length;
    
    const criticalFields = fields.filter(f => f.crop_stress_indicators.water_requirement === 'critical').length;
    const highRiskFields = fields.filter(f => f.crop_stress_indicators.water_requirement === 'high').length;
    const mediumRiskFields = fields.filter(f => f.crop_stress_indicators.water_requirement === 'medium').length;

    const overallDroughtStatus = avgDroughtIndex > 0.7 ? 'extreme' :
                                avgDroughtIndex > 0.5 ? 'severe' :
                                avgDroughtIndex > 0.3 ? 'moderate' : 'normal';

    return {
      region_name: 'বাংলাদেশ কৃষি অঞ্চল',
      total_fields: fields.length,
      overall_drought_status: overallDroughtStatus,
      drought_index: Number(avgDroughtIndex.toFixed(3)),
      avg_surface_moisture: Number(avgSurfaceMoisture.toFixed(3)),
      avg_root_zone_moisture: Number(avgRootZoneMoisture.toFixed(3)),
      field_risk_distribution: {
        critical: criticalFields,
        high: highRiskFields,
        medium: mediumRiskFields,
        low: fields.length - criticalFields - highRiskFields - mediumRiskFields
      },
      total_area_acres: Number(fields.reduce((sum, field) => sum + field.area_acres, 0).toFixed(2)),
      active_alerts: droughtAlerts.length,
      forecast_trend: fields.filter(f => f.drought_trend === 'worsening').length > fields.length / 2 ? 'deteriorating' :
                     fields.filter(f => f.drought_trend === 'improving').length > fields.length / 2 ? 'improving' : 'stable',
      recommendations: overallDroughtStatus === 'extreme' ? [
        'তাৎক্ষণিক জরুরি সেচ ব্যবস্থা গ্রহণ করুন',
        'সরকারি সহায়তার জন্য যোগাযোগ করুন',
        'ফসল ক্ষয়ক্ষতি মূল্যায়ন করুন'
      ] : overallDroughtStatus === 'severe' ? [
        'নিয়মিত সেচের ব্যবস্থা নিন',
        'পানি সংরক্ষণ ব্যবস্থা বাস্তবায়ন করুন',
        'বিকল্প ফসলের পরিকল্পনা করুন'
      ] : [
        'মাটির আর্দ্রতা নিয়মিত পর্যবেক্ষণ করুন',
        'সেচের সময়সূচি অনুসরণ করুন',
        'পানি সাশ্রয়ী প্রযুক্তি ব্যবহার করুন'
      ],
      analysis_date: new Date().toISOString()
    };
  }, [fields, droughtAlerts]);

  // Initial data fetch
  useEffect(() => {
    fetchSoilData();
  }, [userId, fetchSoilData]);

  return {
    fields,
    loading,
    refreshing,
    selectedField,
    setSelectedField,
    droughtAlerts,
    fetchSoilData,
    refreshFieldSoil,
    getRegionalDroughtAnalysis,
  };
}
