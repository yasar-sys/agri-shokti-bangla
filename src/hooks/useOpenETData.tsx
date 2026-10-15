// NASA OpenET Evapotranspiration Data Hook
// Integrates with OpenET API for water management and irrigation planning

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OpenETData {
  date: string;
  et_value: number; // Evapotranspiration in mm
  et_reference: number; // Reference ET
  et_fraction: number; // ET fraction (0-1)
  precipitation: number; // Precipitation in mm
  soil_moisture?: number; // Soil moisture percentage
  quality_score: number; // Data quality (0-1)
}

interface FieldETData {
  field_id: string;
  field_name: string;
  field_name_bn: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  current_et: OpenETData;
  weekly_et: OpenETData[];
  monthly_summary: {
    total_et: number;
    avg_daily_et: number;
    total_precip: number;
    water_balance: number; // precip - et
    irrigation_need: number; // Estimated irrigation need
  };
  recommendations: {
    irrigation_timing: string;
    water_amount: number;
    efficiency_tips: string[];
    drought_risk: 'low' | 'medium' | 'high';
  };
  last_updated: string;
}

export function useOpenETData(userId: string | null) {
  const [fields, setFields] = useState<FieldETData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldETData | null>(null);
  const { toast } = useToast();

  // Fetch OpenET data for all fields
  const fetchETData = useCallback(async () => {
    if (!userId) { setLoading(false); setFields([]); setSelectedField(null); return; }

    try {
      setLoading(true);

      // Try to get real data from edge function
      const { data, error } = await supabase.functions.invoke('openet-data', {
        body: { userId, action: 'fetch_all_fields' }
      });

      if (error || !data?.success) {
        setFields([]);
        setSelectedField(null);
        throw new Error('OpenET-এর প্রকৃত তথ্য এখন পাওয়া যাচ্ছে না');
      } else {
        setFields(data.fields || []);
        if (data.fields?.length > 0) {
          setSelectedField(data.fields[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching OpenET data:', error);
      toast({
        title: 'ত্রুটি',
        description: 'OpenET ডেটা লোড করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Refresh ET data for a specific field
  const refreshFieldET = useCallback(async (fieldId: string) => {
    if (!userId) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('openet-data', {
        body: { userId, action: 'refresh_field', fieldId }
      });

      if (error || !data?.success) {
        throw new Error('OpenET-এর প্রকৃত তথ্য এখন পাওয়া যাচ্ছে না');
      } else {
        setFields(prev => prev.map(f => f.field_id === fieldId ? data.field : f));
        if (selectedField?.field_id === fieldId) {
          setSelectedField(data.field);
        }
      }

      toast({
        title: 'সফল',
        description: 'OpenET ডেটা আপডেট হয়েছে',
      });
    } catch (error) {
      console.error('Error refreshing field ET:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ET ডেটা আপডেট করতে ব্যর্থ',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [userId, selectedField, toast]);

  // Get irrigation forecast for next 7 days
  const getIrrigationForecast = useCallback(async (fieldId: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.functions.invoke('openet-forecast', {
        body: { userId, fieldId, days: 7 }
      });

      if (error || !data?.success) return null;

      return data;
    } catch (error) {
      console.error('Error getting irrigation forecast:', error);
      return null;
    }
  }, [userId]);

  // Calculate water balance for multiple fields
  const getWaterBalanceReport = useCallback(() => {
    if (fields.length === 0) return null;

    const totalArea = fields.reduce((sum, field) => sum + field.area_acres, 0);
    const totalET = fields.reduce((sum, field) => sum + field.monthly_summary.total_et, 0);
    const totalPrecip = fields.reduce((sum, field) => sum + field.monthly_summary.total_precip, 0);
    const totalIrrigationNeed = fields.reduce((sum, field) => sum + field.monthly_summary.irrigation_need, 0);

    const highRiskFields = fields.filter(f => f.recommendations.drought_risk === 'high').length;
    const mediumRiskFields = fields.filter(f => f.recommendations.drought_risk === 'medium').length;

    return {
      total_fields: fields.length,
      total_area_acres: Number(totalArea.toFixed(2)),
      total_water_loss_mm: Number(totalET.toFixed(2)),
      total_water_gain_mm: Number(totalPrecip.toFixed(2)),
      net_water_balance_mm: Number((totalPrecip - totalET).toFixed(2)),
      total_irrigation_need_mm: Number(totalIrrigationNeed.toFixed(2)),
      estimated_water_cost_taka: Number((totalIrrigationNeed * totalArea * 15).toFixed(0)), // Rough estimate
      drought_risk_summary: {
        high_risk_fields: highRiskFields,
        medium_risk_fields: mediumRiskFields,
        low_risk_fields: fields.length - highRiskFields - mediumRiskFields
      },
      overall_risk: highRiskFields > 0 ? 'high' : mediumRiskFields > fields.length / 2 ? 'medium' : 'low',
      generated_at: new Date().toISOString()
    };
  }, [fields]);

  // Initial data fetch
  useEffect(() => {
    fetchETData();
  }, [userId, fetchETData]);

  return {
    fields,
    loading,
    refreshing,
    selectedField,
    setSelectedField,
    fetchETData,
    refreshFieldET,
    getIrrigationForecast,
    getWaterBalanceReport,
  };
}
