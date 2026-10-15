import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  conditionBn: string;
  humidity: number;
  wind: number;
  icon: string;
  loading: boolean;
  error: string | null;
}

const conditionMap: Record<string, string> = {
  'clear sky': 'পরিষ্কার আকাশ',
  'few clouds': 'অল্প মেঘ',
  'scattered clouds': 'ছড়ানো মেঘ',
  'broken clouds': 'মেঘলা',
  'overcast clouds': 'ঘন মেঘ',
  'shower rain': 'বৃষ্টি',
  'rain': 'বৃষ্টি',
  'light rain': 'হালকা বৃষ্টি',
  'moderate rain': 'মাঝারি বৃষ্টি',
  'heavy rain': 'ভারী বৃষ্টি',
  'thunderstorm': 'বজ্রঝড়',
  'snow': 'তুষারপাত',
  'mist': 'কুয়াশা',
  'fog': 'কুয়াশা',
  'haze': 'ধোঁয়াশা',
  'dust': 'ধুলিঝড়',
  'smoke': 'ধোঁয়া',
};

export function useWeather(latitude: number, longitude: number) {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 32,
    condition: 'partly cloudy',
    conditionBn: 'আংশিক মেঘলা',
    humidity: 75,
    wind: 12,
    icon: '⛅',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        const current = data.current;
        
        // Weather code to condition mapping
        const weatherCodeMap: Record<number, { condition: string; icon: string }> = {
          0: { condition: 'পরিষ্কার আকাশ', icon: '☀️' },
          1: { condition: 'প্রায় পরিষ্কার', icon: '🌤️' },
          2: { condition: 'আংশিক মেঘলা', icon: '⛅' },
          3: { condition: 'মেঘলা', icon: '☁️' },
          45: { condition: 'কুয়াশা', icon: '🌫️' },
          48: { condition: 'ঘন কুয়াশা', icon: '🌫️' },
          51: { condition: 'হালকা গুঁড়ি বৃষ্টি', icon: '🌧️' },
          53: { condition: 'গুঁড়ি বৃষ্টি', icon: '🌧️' },
          55: { condition: 'ঘন গুঁড়ি বৃষ্টি', icon: '🌧️' },
          61: { condition: 'হালকা বৃষ্টি', icon: '🌧️' },
          63: { condition: 'বৃষ্টি', icon: '🌧️' },
          65: { condition: 'ভারী বৃষ্টি', icon: '🌧️' },
          80: { condition: 'হালকা বৃষ্টি', icon: '🌦️' },
          81: { condition: 'বৃষ্টি', icon: '🌦️' },
          82: { condition: 'ভারী বৃষ্টি', icon: '⛈️' },
          95: { condition: 'বজ্রঝড়', icon: '⛈️' },
          96: { condition: 'শিলাবৃষ্টি', icon: '🌨️' },
          99: { condition: 'ভারী শিলাবৃষ্টি', icon: '🌨️' },
        };
        
        const weatherInfo = weatherCodeMap[current.weather_code] || { condition: 'অজানা', icon: '🌡️' };
        
        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: weatherInfo.condition,
          conditionBn: weatherInfo.condition,
          humidity: Math.round(current.relative_humidity_2m),
          wind: Math.round(current.wind_speed_10m),
          icon: weatherInfo.icon,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: 'আবহাওয়া লোড করতে ব্যর্থ',
        }));
      }
    };

    if (!latitude || !longitude) return;
    fetchWeather();
    // Keep weather live: refresh every 10 minutes and when the app regains focus
    const id = window.setInterval(fetchWeather, 10 * 60 * 1000);
    const onVisible = () => document.visibilityState === 'visible' && fetchWeather();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [latitude, longitude]);

  return weather;
}
