// NASA Earth Observation Data Integration Hook
// Combines Landsat, MODIS, Sentinel-2 data for comprehensive agricultural monitoring

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SatelliteData {
  satellite: 'Landsat-8' | 'Landsat-9' | 'Sentinel-2' | 'MODIS';
  acquisition_date: string;
  cloud_cover: number; // 0-100 percentage
  data_quality: 'excellent' | 'good' | 'fair' | 'poor';
  processing_level: string;
}

interface VegetationIndex {
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
  evi: number; // Enhanced Vegetation Index
  savi: number; // Soil Adjusted Vegetation Index
  ndwi: number; // Normalized Difference Water Index
  msavi: number; // Modified Soil Adjusted Vegetation Index
  confidence: number; // 0-1
}

interface CropHealthMetrics {
  biomass_estimate: number; // kg/ha
  leaf_area_index: number; // LAI
  chlorophyll_content: number; // ug/cm²
  water_stress_index: number; // 0-1
  growth_stage: 'early' | 'vegetative' | 'flowering' | 'fruiting' | 'mature';
  vigor_score: number; // 0-100
  yield_prediction: number; // tons/ha
  yield_confidence: number; // 0-1
}

interface FieldSatelliteAnalysis {
  field_id: string;
  field_name: string;
  field_name_bn: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  satellite_data: SatelliteData;
  vegetation_indices: VegetationIndex;
  crop_health: CropHealthMetrics;
  change_detection: {
    ndvi_change_7d: number; // NDVI change over 7 days
    ndvi_change_30d: number; // NDVI change over 30 days
    biomass_change_7d: number; // kg/ha
    trend: 'improving' | 'stable' | 'declining';
    anomaly_detected: boolean;
    anomaly_type: string;
  };
  seasonal_analysis: {
    season_name: string;
    season_name_bn: string;
    planting_date: string;
    expected_harvest: string;
    days_since_planting: number;
    growth_progress: number; // 0-100
    seasonal_performance: 'below_average' | 'average' | 'above_average';
  };
  recommendations: {
    immediate_actions: string[];
    immediate_actions_bn: string[];
    fertilizer_recommendations: {
      nitrogen: number; // kg/ha
      phosphorus: number; // kg/ha
      potassium: number; // kg/ha
      application_timing: string;
      application_timing_bn: string;
    };
    pest_disease_risk: {
      risk_level: 'low' | 'medium' | 'high';
      likely_pests: string[];
      likely_pests_bn: string[];
      monitoring_tips: string[];
      monitoring_tips_bn: string[];
    };
  };
  data_sources: {
    primary_satellite: string;
    supporting_data: string[];
    processing_date: string;
    next_available_imagery: string;
  };
  last_updated: string;
}

export function useNASAEarthObservation(userId: string | null) {
  const [fields, setFields] = useState<FieldSatelliteAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldSatelliteAnalysis | null>(null);
  const [availableSatellites, setAvailableSatellites] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch NASA Earth Observation data for all fields
  const fetchSatelliteData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    try {
      setLoading(true);

      // Try to get real data from edge function
      const { data, error } = await supabase.functions.invoke('nasa-earth-observation', {
        body: { userId, action: 'fetch_all_fields' }
      });

      if (error || !data?.success) {
        setFields([]);
        setSelectedField(null);
        setAvailableSatellites([]);
        throw new Error('NASA-এর প্রকৃত তথ্য এখন পাওয়া যাচ্ছে না');
      } else {
        setFields(data.fields || []);
        if (data.fields?.length > 0) {
          setSelectedField(data.fields[0]);
        }
        setAvailableSatellites(data.available_satellites || []);
      }
    } catch (error) {
      console.error('Error fetching NASA Earth Observation data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'NASA স্যাটেলাইট ডেটা লোড করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Refresh satellite data for a specific field
  const refreshFieldSatellite = useCallback(async (fieldId: string) => {
    if (!userId) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('nasa-earth-observation', {
        body: { userId, action: 'refresh_field', fieldId }
      });

      if (error || !data?.success) {
        throw new Error('NASA-এর প্রকৃত তথ্য আপডেট করা যায়নি');
      } else {
        setFields(prev => prev.map(f => f.field_id === fieldId ? data.field : f));
        if (selectedField?.field_id === fieldId) {
          setSelectedField(data.field);
        }
      }

      toast({
        title: 'সফল',
        description: 'স্যাটেলাইট ডেটা আপডেট হয়েছে',
      });
    } catch (error) {
      console.error('Error refreshing field satellite data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'স্যাটেলাইট ডেটা আপডেট করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [userId, selectedField, toast]);

  // Get regional satellite analysis
  const getRegionalAnalysis = useCallback(() => {
    if (fields.length === 0) return null;

    const avgNDVI = fields.reduce((sum, field) => sum + field.vegetation_indices.ndvi, 0) / fields.length;
    const avgBiomass = fields.reduce((sum, field) => sum + field.crop_health.biomass_estimate, 0) / fields.length;
    const totalYieldPrediction = fields.reduce((sum, field) => sum + field.crop_health.yield_prediction, 0);
    const totalArea = fields.reduce((sum, field) => sum + field.area_acres, 0);

    const improvingFields = fields.filter(f => f.change_detection.trend === 'improving').length;
    const decliningFields = fields.filter(f => f.change_detection.trend === 'declining').length;
    const anomalyFields = fields.filter(f => f.change_detection.anomaly_detected).length;

    const satelliteUsage = fields.reduce((acc, field) => {
      acc[field.satellite_data.satellite] = (acc[field.satellite_data.satellite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      region_name: 'বাংলাদেশ কৃষি অঞ্চল',
      total_fields: fields.length,
      total_area_acres: Number(totalArea.toFixed(2)),
      avg_ndvi: Number(avgNDVI.toFixed(4)),
      avg_biomass_kg_per_ha: Math.round(avgBiomass),
      total_predicted_yield_tons: Number(totalYieldPrediction.toFixed(2)),
      field_performance_distribution: {
        improving: improvingFields,
        stable: fields.length - improvingFields - decliningFields,
        declining: decliningFields
      },
      anomaly_summary: {
        total_anomalies: anomalyFields,
        anomaly_rate: Number(((anomalyFields / fields.length) * 100).toFixed(1)),
        common_anomaly_types: fields.filter(f => f.change_detection.anomaly_detected)
          .map(f => f.change_detection.anomaly_type)
          .filter((type, index, arr) => arr.indexOf(type) === index)
      },
      satellite_data_sources: satelliteUsage,
      data_quality_summary: {
        excellent: fields.filter(f => f.satellite_data.data_quality === 'excellent').length,
        good: fields.filter(f => f.satellite_data.data_quality === 'good').length,
        fair: fields.filter(f => f.satellite_data.data_quality === 'fair').length,
        poor: fields.filter(f => f.satellite_data.data_quality === 'poor').length
      },
      seasonal_overview: {
        active_seasons: [...new Set(fields.map(f => f.seasonal_analysis.season_name))],
        avg_growth_progress: Math.round(fields.reduce((sum, f) => sum + f.seasonal_analysis.growth_progress, 0) / fields.length),
        performance_distribution: {
          above_average: fields.filter(f => f.seasonal_analysis.seasonal_performance === 'above_average').length,
          average: fields.filter(f => f.seasonal_analysis.seasonal_performance === 'average').length,
          below_average: fields.filter(f => f.seasonal_analysis.seasonal_performance === 'below_average').length
        }
      },
      recommendations: avgNDVI < 0.4 ? [
        'অবিলম্বে সার প্রয়োগের ব্যবস্থা করুন',
        'সম্মিলিত সেচ ব্যবস্থাপনা করুন',
        'জরুরি ফসল স্বাস্থ্য পরীক্ষা করুন'
      ] : avgNDVI < 0.6 ? [
        'সুষম সার ব্যবস্থাপনা নিশ্চিত করুন',
        'নিয়মিত ফসল পর্যবেক্ষণ চালিয়ে যান',
        'পানি সাশ্রয়ী প্রযুক্তি ব্যবহার করুন'
      ] : [
        'বর্তমান ব্যবস্থাপনা চালিয়ে যান',
        'ফলন সংরক্ষণের প্রস্তুতি নিন',
        'ফসল চক্র পরিকল্পনা করুন'
      ],
      analysis_date: new Date().toISOString()
    };
  }, [fields]);

  // Initial data fetch
  useEffect(() => {
    fetchSatelliteData();
  }, [userId, fetchSatelliteData]);

  return {
    fields,
    loading,
    refreshing,
    selectedField,
    setSelectedField,
    availableSatellites,
    fetchSatelliteData,
    refreshFieldSatellite,
    getRegionalAnalysis,
  };
}
