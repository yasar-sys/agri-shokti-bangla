import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PestReport {
  id: string;
  user_id: string | null;
  latitude: number;
  longitude: number;
  district: string;
  upazila: string | null;
  pest_name: string;
  pest_name_bn: string;
  crop_type: string;
  severity: string;
  description: string | null;
  image_url: string | null;
  is_verified: boolean;
  temperature: number | null;
  humidity: number | null;
  created_at: string;
}

export interface DistrictStats {
  district: string;
  district_bn: string;
  latitude: number;
  longitude: number;
  reports: number;
  highRisk: number;
  mainPest: string;
  riskLevel: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
  weatherRisk: number;
}

export interface WeatherRiskData {
  temperature: number;
  humidity: number;
  riskScore: number;
  riskFactors: string[];
}

// Bangladesh districts with coordinates
const bangladeshDistricts = [
  { name: 'Dhaka', name_bn: 'ঢাকা', lat: 23.8103, lng: 90.4125 },
  { name: 'Mymensingh', name_bn: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
  { name: 'Rajshahi', name_bn: 'রাজশাহী', lat: 24.3745, lng: 88.6042 },
  { name: 'Rangpur', name_bn: 'রংপুর', lat: 25.7439, lng: 89.2752 },
  { name: 'Khulna', name_bn: 'খুলনা', lat: 22.8456, lng: 89.5403 },
  { name: 'Sylhet', name_bn: 'সিলেট', lat: 24.8949, lng: 91.8687 },
  { name: 'Chittagong', name_bn: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
  { name: 'Barisal', name_bn: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
  { name: 'Bogra', name_bn: 'বগুড়া', lat: 24.8510, lng: 89.3697 },
  { name: 'Comilla', name_bn: 'কুমিল্লা', lat: 23.4607, lng: 91.1809 },
  { name: 'Dinajpur', name_bn: 'দিনাজপুর', lat: 25.6217, lng: 88.6354 },
  { name: 'Jessore', name_bn: 'যশোর', lat: 23.1667, lng: 89.2167 },
  { name: 'Narayanganj', name_bn: 'নারায়ণগঞ্জ', lat: 23.6238, lng: 90.5000 },
  { name: 'Gazipur', name_bn: 'গাজীপুর', lat: 24.0023, lng: 90.4264 },
  { name: 'Tangail', name_bn: 'টাঙ্গাইল', lat: 24.2513, lng: 89.9168 },
];

// Common pests in Bangladesh
const commonPests = [
  { name: 'Rice Stem Borer', name_bn: 'ধানের মাজরা পোকা', crops: ['ধান'], tempRange: [25, 35], humidityMin: 70 },
  { name: 'Brown Planthopper', name_bn: 'বাদামী গাছ ফড়িং', crops: ['ধান'], tempRange: [20, 30], humidityMin: 80 },
  { name: 'Aphids', name_bn: 'জাব পোকা', crops: ['সরিষা', 'সবজি'], tempRange: [15, 25], humidityMin: 60 },
  { name: 'Fruit Borer', name_bn: 'ফলছিদ্রকারী পোকা', crops: ['আম', 'টমেটো'], tempRange: [25, 35], humidityMin: 65 },
  { name: 'Cutworm', name_bn: 'কাটুই পোকা', crops: ['আলু', 'সবজি'], tempRange: [15, 25], humidityMin: 50 },
  { name: 'Red Spider Mite', name_bn: 'লাল মাকড়', crops: ['চা', 'সবজি'], tempRange: [25, 35], humidityMin: 40 },
  { name: 'Whitefly', name_bn: 'সাদা মাছি', crops: ['সবজি', 'তুলা'], tempRange: [20, 35], humidityMin: 60 },
  { name: 'Pod Borer', name_bn: 'পড বোরার', crops: ['মসুর', 'ছোলা'], tempRange: [20, 30], humidityMin: 55 },
];

export function usePestData() {
  const [reports, setReports] = useState<PestReport[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [weatherRisks, setWeatherRisks] = useState<Map<string, WeatherRiskData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculate pest risk based on weather conditions
  const calculatePestRisk = useCallback((temp: number, humidity: number): { score: number; factors: string[] } => {
    const factors: string[] = [];
    let score = 0;

    // Temperature risk factors
    if (temp >= 25 && temp <= 35) {
      score += 30;
      factors.push('উচ্চ তাপমাত্রা পোকার বংশবৃদ্ধিতে সহায়ক');
    } else if (temp >= 20 && temp < 25) {
      score += 20;
      factors.push('মাঝারি তাপমাত্রা - কিছু পোকার জন্য অনুকূল');
    }

    // Humidity risk factors
    if (humidity >= 80) {
      score += 35;
      factors.push('অত্যধিক আর্দ্রতা - ছত্রাক ও পোকার আক্রমণ বাড়তে পারে');
    } else if (humidity >= 65) {
      score += 25;
      factors.push('উচ্চ আর্দ্রতা - মাজরা পোকার জন্য অনুকূল');
    } else if (humidity < 50) {
      score += 15;
      factors.push('কম আর্দ্রতা - লাল মাকড়ের আক্রমণ বাড়তে পারে');
    }

    // Combined risk
    if (temp >= 28 && humidity >= 75) {
      score += 20;
      factors.push('তাপমাত্রা ও আর্দ্রতার সংমিশ্রণ অত্যন্ত ঝুঁকিপূর্ণ');
    }

    return { score: Math.min(score, 100), factors };
  }, []);

  // Fetch weather data for districts
  const fetchWeatherRisks = useCallback(async () => {
    const risks = new Map<string, WeatherRiskData>();
    
    try {
      // Fetch weather for major districts (batch with Promise.all for efficiency)
      const weatherPromises = bangladeshDistricts.slice(0, 8).map(async (district) => {
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lng}&current=temperature_2m,relative_humidity_2m`
          );
          const data = await response.json();
          
          const temp = data.current?.temperature_2m || 28;
          const humidity = data.current?.relative_humidity_2m || 70;
          const { score, factors } = calculatePestRisk(temp, humidity);
          
          return {
            name: district.name,
            data: {
              temperature: temp,
              humidity: humidity,
              riskScore: score,
              riskFactors: factors,
            }
          };
        } catch {
          return {
            name: district.name,
            data: {
              temperature: 28,
              humidity: 70,
              riskScore: 50,
              riskFactors: ['আবহাওয়া তথ্য লোড হয়নি'],
            }
          };
        }
      });

      const results = await Promise.all(weatherPromises);
      results.forEach(({ name, data }) => {
        risks.set(name, data);
      });
      
      setWeatherRisks(risks);
    } catch (error) {
      console.error('Error fetching weather risks:', error);
    }
  }, [calculatePestRisk]);

  // Fetch pest reports from database
  const fetchReports = useCallback(async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('pest_reports')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching pest reports:', error);
    }
  }, []);

  // Calculate district statistics
  const calculateDistrictStats = useCallback(() => {
    const stats: DistrictStats[] = bangladeshDistricts.map(district => {
      const districtReports = reports.filter(r => 
        r.district.toLowerCase() === district.name.toLowerCase() ||
        r.district === district.name_bn
      );
      
      const highRiskReports = districtReports.filter(r => r.severity === 'high');
      const weatherData = weatherRisks.get(district.name);
      
      // Find most common pest or assign default based on district
      const pestCounts: Record<string, number> = {};
      districtReports.forEach(r => {
        pestCounts[r.pest_name_bn] = (pestCounts[r.pest_name_bn] || 0) + 1;
      });
      
      // Default pest assignment based on district for demo purposes when no reports
      const defaultPests: Record<string, string> = {
        'Dhaka': 'জাব পোকা',
        'Mymensingh': 'ধানের মাজরা পোকা',
        'Rajshahi': 'ফলছিদ্রকারী পোকা',
        'Rangpur': 'বাদামী গাছ ফড়িং',
        'Khulna': 'সাদা মাছি',
        'Sylhet': 'লাল মাকড়',
        'Chittagong': 'কাটুই পোকা',
        'Barisal': 'ধানের মাজরা পোকা',
        'Bogra': 'পড বোরার',
        'Comilla': 'জাব পোকা',
        'Dinajpur': 'বাদামী গাছ ফড়িং',
        'Jessore': 'সাদা মাছি',
        'Narayanganj': 'জাব পোকা',
        'Gazipur': 'ফলছিদ্রকারী পোকা',
        'Tangail': 'ধানের মাজরা পোকা',
      };
      
      const mainPest = Object.entries(pestCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 
        defaultPests[district.name] || commonPests[0].name_bn;

      // Calculate trend based on recent vs older reports
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const recentReports = districtReports.filter(r => new Date(r.created_at) >= twoDaysAgo);
      const olderReports = districtReports.filter(r => new Date(r.created_at) < twoDaysAgo);
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentReports.length > olderReports.length * 1.5) trend = 'increasing';
      else if (recentReports.length < olderReports.length * 0.5) trend = 'decreasing';

      // Calculate risk level - ensure some demo data shows risk even without reports
      const weatherRiskScore = weatherData?.riskScore || 50;
      const baseRisk = districtReports.length * 5 + highRiskReports.length * 10;
      const totalRisk = Math.max(baseRisk, weatherRiskScore * 0.7);
      
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if (totalRisk >= 55 || highRiskReports.length >= 3) riskLevel = 'high';
      else if (totalRisk >= 35 || highRiskReports.length >= 1) riskLevel = 'medium';

      // Simulate some demo reports for visualization when no actual reports
      const demoReportsCount = districtReports.length > 0 ? districtReports.length : 
        Math.floor(weatherRiskScore / 20) + 1;

      return {
        district: district.name,
        district_bn: district.name_bn,
        latitude: district.lat,
        longitude: district.lng,
        reports: demoReportsCount,
        highRisk: highRiskReports.length,
        mainPest,
        riskLevel,
        trend,
        weatherRisk: weatherRiskScore,
      };
    });

    setDistrictStats(stats);
    setLoading(false);
  }, [reports, weatherRisks]);

  // Submit a new pest report
  const submitReport = async (report: {
    latitude: number;
    longitude: number;
    district: string;
    upazila?: string;
    pest_name: string;
    pest_name_bn: string;
    crop_type: string;
    severity: string;
    description?: string;
  }) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const weatherData = weatherRisks.get(report.district);

      const { error } = await supabase
        .from('pest_reports')
        .insert({
          ...report,
          user_id: session.session?.user?.id || null,
          temperature: weatherData?.temperature,
          humidity: weatherData?.humidity,
        });

      if (error) throw error;
      
      toast.success('পোকার রিপোর্ট সফলভাবে জমা হয়েছে');
      await fetchReports();
      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('রিপোর্ট জমা দিতে সমস্যা হয়েছে');
      return false;
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`pest-reports-realtime-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pest_reports'
        },
        (payload) => {
          console.log('Realtime pest update:', payload);
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchWeatherRisks(), fetchReports()]);
    };
    loadData();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeatherRisks, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeatherRisks, fetchReports]);

  // Calculate stats when reports or weather changes
  useEffect(() => {
    calculateDistrictStats();
  }, [calculateDistrictStats]);

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchWeatherRisks(), fetchReports()]);
  };

  return {
    reports,
    districtStats,
    weatherRisks,
    loading,
    lastUpdated,
    submitReport,
    refetch,
    commonPests,
    bangladeshDistricts,
  };
}
