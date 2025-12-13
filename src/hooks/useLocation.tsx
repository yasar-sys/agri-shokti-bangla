import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    city: 'ময়মনসিংহ',
    country: 'বাংলাদেশ',
    latitude: 24.7471,
    longitude: 90.4203,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=bn`
          );
          const data = await response.json();
          
          const city = data.address?.city || 
                       data.address?.town || 
                       data.address?.village || 
                       data.address?.county ||
                       data.address?.state_district ||
                       'অজানা';
          
          const country = data.address?.country || 'বাংলাদেশ';
          
          setLocation({
            city,
            country,
            latitude,
            longitude,
            loading: false,
            error: null,
          });
        } catch (error) {
          // If geocoding fails, just use coordinates
          setLocation({
            city: 'আপনার এলাকা',
            country: 'বাংলাদেশ',
            latitude,
            longitude,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        console.log('Location error:', error.message);
        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  return location;
}
