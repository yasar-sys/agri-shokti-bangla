import { useState, useEffect, useCallback } from 'react';
import { useLocation } from '@/hooks/useLocation';

interface WeatherAlert {
  id: string;
  type: string;
  typeBn: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  severityBn: string;
  message: string;
  advice: string;
  icon: 'thermometer' | 'droplets' | 'wind' | 'cloud-lightning' | 'snowflake' | 'sun';
}

interface ForecastDay {
  day: string;
  dayBn: string;
  tempHigh: number;
  tempLow: number;
  rainChance: number;
  weatherCode: number;
  risk: 'critical' | 'high' | 'medium' | 'low';
  riskBn: string;
}

interface LiveWeatherData {
  alerts: WeatherAlert[];
  forecast: ForecastDay[];
  currentTemp: number;
  currentHumidity: number;
  currentWind: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Weather code to alert type mapping based on WMO standards
const weatherCodeToAlert = (code: number, temp: number, humidity: number, wind: number): WeatherAlert | null => {
  // Extreme heat
  if (temp >= 38) {
    return {
      id: `heat-${Date.now()}`,
      type: 'heatwave',
      typeBn: 'তাপপ্রবাহ',
      severity: temp >= 42 ? 'critical' : 'high',
      severityBn: temp >= 42 ? 'চরম' : 'উচ্চ',
      message: `তাপমাত্রা ${Math.round(temp)}°C। গরম আবহাওয়া চলছে।`,
      advice: 'সকাল ১০টার পর সেচ দেবেন না। চারা ঢেকে রাখুন। পর্যাপ্ত পানি পান করুন।',
      icon: 'thermometer'
    };
  }

  // High humidity (disease risk)
  if (humidity >= 85 && temp >= 25) {
    return {
      id: `humidity-${Date.now()}`,
      type: 'disease_risk',
      typeBn: 'রোগের ঝুঁকি',
      severity: 'medium',
      severityBn: 'মাঝারি',
      message: `আর্দ্রতা ${humidity}%। ছত্রাকজনিত রোগের ঝুঁকি বেশি।`,
      advice: 'ফসলে ছত্রাকনাশক স্প্রে করুন। পানি জমতে দেবেন না।',
      icon: 'droplets'
    };
  }

  // Strong wind
  if (wind >= 40) {
    return {
      id: `wind-${Date.now()}`,
      type: 'strong_wind',
      typeBn: 'ঝড়ো হাওয়া',
      severity: wind >= 60 ? 'high' : 'medium',
      severityBn: wind >= 60 ? 'উচ্চ' : 'মাঝারি',
      message: `বাতাসের গতি ${Math.round(wind)} কি.মি./ঘ.। ঝড়ো হাওয়া চলছে।`,
      advice: 'লম্বা গাছে সাপোর্ট দিন। পলিথিন সরিয়ে রাখুন।',
      icon: 'wind'
    };
  }

  // Thunderstorm (codes 95, 96, 99)
  if (code >= 95) {
    return {
      id: `storm-${Date.now()}`,
      type: 'thunderstorm',
      typeBn: 'বজ্রঝড়',
      severity: 'high',
      severityBn: 'উচ্চ',
      message: 'বজ্রঝড়ের সম্ভাবনা। সতর্ক থাকুন।',
      advice: 'খোলা মাঠে কাজ করবেন না। বৈদ্যুতিক সরঞ্জাম বন্ধ রাখুন।',
      icon: 'cloud-lightning'
    };
  }

  // Heavy rain (codes 65, 67, 82)
  if (code === 65 || code === 67 || code === 82) {
    return {
      id: `rain-${Date.now()}`,
      type: 'heavy_rain',
      typeBn: 'ভারী বৃষ্টি',
      severity: 'medium',
      severityBn: 'মাঝারি',
      message: 'ভারী বৃষ্টির সম্ভাবনা। জলাবদ্ধতা হতে পারে।',
      advice: 'পানি নিষ্কাশনের ব্যবস্থা করুন। নিচু জমিতে ফসল তুলে আনুন।',
      icon: 'droplets'
    };
  }

  // Drought risk (no rain + high temp)
  if (code <= 3 && humidity < 40 && temp >= 30) {
    return {
      id: `drought-${Date.now()}`,
      type: 'drought',
      typeBn: 'খরা ঝুঁকি',
      severity: 'medium',
      severityBn: 'মাঝারি',
      message: `শুষ্ক আবহাওয়া। আর্দ্রতা মাত্র ${humidity}%।`,
      advice: 'পানি সংরক্ষণ করুন। মালচিং ব্যবহার করুন। সকাল-সন্ধ্যায় সেচ দিন।',
      icon: 'sun'
    };
  }

  return null;
};

const getDayName = (date: Date, index: number): { day: string; dayBn: string } => {
  const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const daysBn = ['আজ', 'আগামীকাল', 'পরশু', '৩ দিন পর', '৪ দিন পর', '৫ দিন পর', '৬ দিন পর'];
  
  if (index === 0) return { day: 'Today', dayBn: 'আজ' };
  if (index === 1) return { day: 'Tomorrow', dayBn: 'আগামীকাল' };
  
  const futureDate = new Date(date);
  futureDate.setDate(futureDate.getDate() + index);
  return { day: days[futureDate.getDay()], dayBn: daysBn[index] || `${index} দিন পর` };
};

const getRiskLevel = (tempHigh: number, rainChance: number, weatherCode: number): { risk: 'critical' | 'high' | 'medium' | 'low'; riskBn: string } => {
  if (tempHigh >= 42 || weatherCode >= 95) return { risk: 'critical', riskBn: 'চরম' };
  if (tempHigh >= 38 || weatherCode >= 80) return { risk: 'high', riskBn: 'উচ্চ' };
  if (tempHigh >= 35 || rainChance >= 60) return { risk: 'medium', riskBn: 'মাঝারি' };
  return { risk: 'low', riskBn: 'নিম্ন' };
};

export function useLiveWeatherAlerts() {
  const location = useLocation();
  const [data, setData] = useState<LiveWeatherData>({
    alerts: [],
    forecast: [],
    currentTemp: 0,
    currentHumidity: 0,
    currentWind: 0,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchWeatherData = useCallback(async () => {
    if (!location.latitude || !location.longitude) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch current weather and 7-day forecast from Open-Meteo
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=7`
      );

      if (!response.ok) throw new Error('Weather API failed');

      const weatherData = await response.json();
      const current = weatherData.current;
      const daily = weatherData.daily;

      // Generate alerts based on current conditions
      const alerts: WeatherAlert[] = [];
      const currentAlert = weatherCodeToAlert(
        current.weather_code,
        current.temperature_2m,
        current.relative_humidity_2m,
        current.wind_speed_10m
      );
      if (currentAlert) alerts.push(currentAlert);

      // Check next 3 days for potential alerts
      for (let i = 0; i < Math.min(3, daily.time.length); i++) {
        const futureAlert = weatherCodeToAlert(
          daily.weather_code[i],
          daily.temperature_2m_max[i],
          70, // estimate humidity for future days
          20  // estimate wind for future days
        );
        if (futureAlert && !alerts.find(a => a.type === futureAlert.type)) {
          futureAlert.id = `${futureAlert.type}-future-${i}`;
          futureAlert.message = `আগামী ${i + 1} দিনে: ${futureAlert.message}`;
          alerts.push(futureAlert);
        }
      }

      // Generate 5-day forecast
      const forecast: ForecastDay[] = [];
      for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        const { day, dayBn } = getDayName(new Date(), i);
        const { risk, riskBn } = getRiskLevel(
          daily.temperature_2m_max[i],
          daily.precipitation_probability_max[i],
          daily.weather_code[i]
        );

        forecast.push({
          day,
          dayBn,
          tempHigh: Math.round(daily.temperature_2m_max[i]),
          tempLow: Math.round(daily.temperature_2m_min[i]),
          rainChance: daily.precipitation_probability_max[i],
          weatherCode: daily.weather_code[i],
          risk,
          riskBn
        });
      }

      setData({
        alerts,
        forecast,
        currentTemp: Math.round(current.temperature_2m),
        currentHumidity: Math.round(current.relative_humidity_2m),
        currentWind: Math.round(current.wind_speed_10m),
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Live weather fetch error:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'আবহাওয়া ডেটা লোড করতে ব্যর্থ'
      }));
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    fetchWeatherData();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  return { ...data, refetch: fetchWeatherData };
}
