import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { DistrictStats } from '@/hooks/usePestData';
import { Loader2 } from 'lucide-react';

interface PestMapboxProps {
  districtStats: DistrictStats[];
  onDistrictClick?: (district: DistrictStats) => void;
  selectedDistrict?: string | null;
}

const PestMapbox: React.FC<PestMapboxProps> = ({ 
  districtStats, 
  onDistrictClick,
  selectedDistrict 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError('Mapbox token not configured');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Failed to load map configuration');
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [90.4125, 23.8103], // Bangladesh center
        zoom: 6,
        pitch: 30,
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add scale
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        setLoading(false);
        
        // Add atmosphere effect
        map.current?.setFog({
          color: 'rgb(20, 20, 30)',
          'high-color': 'rgb(30, 40, 50)',
          'horizon-blend': 0.1,
        });
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers when district stats change
  useEffect(() => {
    if (!map.current || districtStats.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each district
    districtStats.forEach((district) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'pest-marker';
      
      const size = Math.max(30, Math.min(60, 30 + district.reports * 2));
      const pulseSize = size + 20;
      
      // Color based on risk level
      let bgColor = '#22c55e'; // green for low
      let pulseColor = 'rgba(34, 197, 94, 0.4)';
      if (district.riskLevel === 'high') {
        bgColor = '#ef4444';
        pulseColor = 'rgba(239, 68, 68, 0.4)';
      } else if (district.riskLevel === 'medium') {
        bgColor = '#f97316';
        pulseColor = 'rgba(249, 115, 22, 0.4)';
      }

      // Add pulse animation for high-risk districts
      if (district.riskLevel === 'high' || district.trend === 'increasing') {
        el.innerHTML = `
          <div style="position: relative; width: ${size}px; height: ${size}px;">
            <div style="
              position: absolute;
              width: ${pulseSize}px;
              height: ${pulseSize}px;
              left: -${(pulseSize - size) / 2}px;
              top: -${(pulseSize - size) / 2}px;
              border-radius: 50%;
              background: ${pulseColor};
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: relative;
              width: ${size}px;
              height: ${size}px;
              background: ${bgColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${size / 3}px;
              border: 3px solid rgba(255,255,255,0.3);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              cursor: pointer;
            ">${district.reports}</div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${bgColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${size / 3}px;
            border: 3px solid rgba(255,255,255,0.3);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          ">${district.reports}</div>
        `;
      }

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${district.district_bn}</h3>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: ${bgColor};
              "></span>
              <span style="color: #4b5563; font-size: 12px;">
                ${district.riskLevel === 'high' ? 'উচ্চ ঝুঁকি' : district.riskLevel === 'medium' ? 'মাঝারি ঝুঁকি' : 'কম ঝুঁকি'}
              </span>
            </div>
            <p style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">
              <strong>রিপোর্ট:</strong> ${district.reports} টি
            </p>
            <p style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">
              <strong>প্রধান পোকা:</strong> ${district.mainPest}
            </p>
            <p style="color: #6b7280; font-size: 11px;">
              <strong>আবহাওয়া ঝুঁকি:</strong> ${district.weatherRisk}%
            </p>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([district.longitude, district.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Click handler
      el.addEventListener('click', () => {
        onDistrictClick?.(district);
        
        // Fly to district
        map.current?.flyTo({
          center: [district.longitude, district.latitude],
          zoom: 8,
          duration: 1500,
        });
      });

      markers.current.push(marker);
    });
  }, [districtStats, onDistrictClick]);

  // Fly to selected district
  useEffect(() => {
    if (!map.current || !selectedDistrict) return;
    
    const district = districtStats.find(d => d.district === selectedDistrict);
    if (district) {
      map.current.flyTo({
        center: [district.longitude, district.latitude],
        zoom: 8,
        duration: 1500,
      });
    }
  }, [selectedDistrict, districtStats]);

  // Add CSS for pulse animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.4;
        }
        100% {
          transform: scale(1);
          opacity: 0.8;
        }
      }
      .mapboxgl-popup-content {
        border-radius: 12px !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-[300px] rounded-2xl bg-card border border-border flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-border">
      {loading && (
        <div className="absolute inset-0 bg-card flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg p-2 z-10 border border-border">
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">উচ্চ</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">মাঝারি</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">কম</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestMapbox;
