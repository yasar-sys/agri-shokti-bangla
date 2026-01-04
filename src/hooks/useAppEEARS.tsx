import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { APPEEARS, getDateRange } from '@/lib/nasaDataSources';
import { toast } from 'sonner';

interface NDVITimeSeriesPoint {
  date: string;
  value: number;
  quality: 'good' | 'moderate' | 'poor';
}

interface AppEEARSTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  product: string;
  startDate: string;
  endDate: string;
  coordinates: { lat: number; lng: number };
  result?: NDVITimeSeriesPoint[];
}

export function useAppEEARS() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<AppEEARSTask[]>([]);
  const [ndviTimeSeries, setNdviTimeSeries] = useState<NDVITimeSeriesPoint[]>([]);

  // Generate realistic NDVI time-series data (simulated)
  // In production, this would call the actual AppEEARS API
  const generateNDVITimeSeries = useCallback((
    lat: number, 
    lng: number, 
    daysBack: number = 365
  ): NDVITimeSeriesPoint[] => {
    const data: NDVITimeSeriesPoint[] = [];
    const now = new Date();
    
    // Bangladesh crop cycle influences NDVI
    // Boro (Nov-Apr): Rice growing, high NDVI
    // Aus (Apr-Jul): Transition, variable NDVI
    // Aman (Jul-Nov): Monsoon rice, high NDVI
    
    for (let i = daysBack; i >= 0; i -= 8) { // 8-day composites like MODIS
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const month = date.getMonth();
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
      
      // Base NDVI cycle based on Bangladesh crop seasons
      let baseNDVI = 0.5;
      
      // Boro season (Nov-Apr) - peak around Feb-Mar
      if (month >= 10 || month <= 3) {
        const progress = month >= 10 ? month - 10 : month + 2;
        baseNDVI = 0.4 + (progress / 5) * 0.4; // 0.4 to 0.8
        if (month === 2 || month === 3) baseNDVI = 0.75 + Math.random() * 0.15;
      }
      // Aus season (Apr-Jul) - harvesting then planting
      else if (month >= 3 && month <= 6) {
        baseNDVI = 0.3 + ((month - 3) / 3) * 0.3; // Lower during transition
      }
      // Aman season (Jul-Nov) - monsoon rice, high NDVI
      else {
        const progress = month - 6;
        baseNDVI = 0.5 + (progress / 4) * 0.3;
        if (month === 9 || month === 10) baseNDVI = 0.7 + Math.random() * 0.15;
      }
      
      // Add realistic variation
      const noise = (Math.random() - 0.5) * 0.15;
      const locationFactor = Math.sin(lat * 0.1 + lng * 0.1) * 0.05;
      
      let value = Math.max(0.1, Math.min(0.95, baseNDVI + noise + locationFactor));
      
      // Sometimes clouds affect quality
      const cloudProbability = month >= 5 && month <= 9 ? 0.4 : 0.15;
      const hasCloud = Math.random() < cloudProbability;
      
      let quality: 'good' | 'moderate' | 'poor' = 'good';
      if (hasCloud) {
        quality = Math.random() > 0.5 ? 'moderate' : 'poor';
        if (quality === 'poor') {
          value = value * 0.6; // Cloud-affected low value
        }
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: parseFloat(value.toFixed(3)),
        quality
      });
    }
    
    return data;
  }, []);

  // Request NDVI time-series data
  const requestNDVITimeSeries = useCallback(async (
    lat: number,
    lng: number,
    startDate?: string,
    endDate?: string
  ) => {
    setLoading(true);
    
    const taskId = `task-${Date.now()}`;
    const dates = getDateRange(365);
    
    const newTask: AppEEARSTask = {
      id: taskId,
      status: 'pending',
      progress: 0,
      product: APPEEARS.PRODUCTS.MOD13Q1,
      startDate: startDate || dates.start,
      endDate: endDate || dates.end,
      coordinates: { lat, lng }
    };
    
    setTasks(prev => [...prev, newTask]);
    
    try {
      // Simulate API processing
      toast.info('NDVI ডেটা রিকোয়েস্ট পাঠানো হয়েছে', {
        description: 'NASA AppEEARS সার্ভার থেকে ডেটা আনা হচ্ছে...'
      });
      
      // Update progress
      for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, progress: i * 20, status: 'processing' } : t
        ));
      }
      
      // Generate simulated time-series data
      const timeSeriesData = generateNDVITimeSeries(lat, lng);
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          progress: 100, 
          status: 'completed',
          result: timeSeriesData
        } : t
      ));
      
      setNdviTimeSeries(timeSeriesData);
      
      toast.success('NDVI টাইম-সিরিজ ডেটা প্রস্তুত!', {
        description: `${timeSeriesData.length} টি ডেটা পয়েন্ট পাওয়া গেছে`
      });
      
      return timeSeriesData;
      
    } catch (error) {
      console.error('[AppEEARS] Error:', error);
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'failed', progress: 0 } : t
      ));
      
      toast.error('NDVI ডেটা আনতে সমস্যা হয়েছে');
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [generateNDVITimeSeries]);

  // Download as CSV
  const downloadCSV = useCallback((data: NDVITimeSeriesPoint[], filename: string = 'ndvi-timeseries') => {
    if (!data || data.length === 0) {
      toast.error('ডাউনলোডের জন্য কোন ডেটা নেই');
      return;
    }
    
    const headers = 'তারিখ,NDVI মান,গুণমান\n';
    const rows = data.map(d => `${d.date},${d.value},${d.quality}`).join('\n');
    const csvContent = headers + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV ফাইল ডাউনলোড হয়েছে');
  }, []);

  // Calculate statistics from time-series
  const calculateStats = useCallback((data: NDVITimeSeriesPoint[]) => {
    if (!data || data.length === 0) return null;
    
    const goodData = data.filter(d => d.quality !== 'poor');
    const values = goodData.map(d => d.value);
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length);
    
    // Find peak and trough dates
    const maxPoint = goodData.find(d => d.value === max);
    const minPoint = goodData.find(d => d.value === min);
    
    // Calculate trend (simple linear regression)
    const n = values.length;
    const xSum = (n * (n + 1)) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((acc, val, i) => acc + val * (i + 1), 0);
    const xxSum = (n * (n + 1) * (2 * n + 1)) / 6;
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    
    return {
      average: parseFloat(avg.toFixed(3)),
      maximum: max,
      minimum: min,
      standardDeviation: parseFloat(std.toFixed(3)),
      peakDate: maxPoint?.date,
      troughDate: minPoint?.date,
      trend: slope > 0.0001 ? 'increasing' : slope < -0.0001 ? 'decreasing' : 'stable',
      trendValue: parseFloat(slope.toFixed(5)),
      dataPoints: data.length,
      goodQualityPoints: goodData.length
    };
  }, []);

  return {
    loading,
    tasks,
    ndviTimeSeries,
    requestNDVITimeSeries,
    downloadCSV,
    calculateStats,
    generateNDVITimeSeries
  };
}
