import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DistrictStats } from '@/hooks/usePestData';
import { Bug, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';

interface PestLeafletMapProps {
  districtStats: DistrictStats[];
  onDistrictClick?: (district: DistrictStats) => void;
  selectedDistrict?: string | null;
}

const PestLeafletMap: React.FC<PestLeafletMapProps> = ({ 
  districtStats, 
  onDistrictClick,
  selectedDistrict 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map
    map.current = L.map(mapContainer.current, {
      center: [23.8103, 90.4125], // Bangladesh center
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Add dark-themed tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map.current);

    // Create markers layer group
    markersLayer.current = L.layerGroup().addTo(map.current);

    // Add scale control
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map.current);

    setIsMapReady(true);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when district stats change
  useEffect(() => {
    if (!map.current || !markersLayer.current || !isMapReady) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    // Add markers for each district
    districtStats.forEach((district) => {
      const size = Math.max(28, Math.min(50, 28 + district.reports * 2));
      
      // Color based on risk level
      let bgColor = '#22c55e'; // green for low
      let shadowColor = 'rgba(34, 197, 94, 0.5)';
      let riskText = 'কম ঝুঁকি';
      
      if (district.riskLevel === 'high') {
        bgColor = '#ef4444';
        shadowColor = 'rgba(239, 68, 68, 0.5)';
        riskText = 'উচ্চ ঝুঁকি';
      } else if (district.riskLevel === 'medium') {
        bgColor = '#f97316';
        shadowColor = 'rgba(249, 115, 22, 0.5)';
        riskText = 'মাঝারি ঝুঁকি';
      }

      // Create custom icon with animation for high risk
      const isAnimated = district.riskLevel === 'high' || district.trend === 'increasing';
      
      const iconHtml = `
        <div class="pest-marker-wrapper" style="position: relative; width: ${size}px; height: ${size}px;">
          ${isAnimated ? `
            <div style="
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              background: ${shadowColor};
              animation: pestPulse 2s infinite ease-in-out;
            "></div>
          ` : ''}
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, ${bgColor}, ${bgColor}dd);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${size / 2.5}px;
            border: 2px solid rgba(255,255,255,0.4);
            box-shadow: 0 4px 15px ${shadowColor};
            cursor: pointer;
            transition: all 0.3s ease;
          " class="pest-marker-inner">
            ${district.reports}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'pest-custom-marker',
        html: iconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      // Create marker
      const marker = L.marker([district.latitude, district.longitude], { icon })
        .addTo(markersLayer.current!);

      // Create popup content
      const popupContent = `
        <div class="pest-popup" style="
          min-width: 180px;
          padding: 12px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          ">
            <div style="
              width: 36px;
              height: 36px;
              background: ${bgColor}20;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${bgColor}" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <h3 style="
                font-weight: 600;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
              ">${district.district_bn}</h3>
              <span style="
                display: inline-block;
                font-size: 11px;
                color: ${bgColor};
                background: ${bgColor}15;
                padding: 2px 8px;
                border-radius: 10px;
                margin-top: 2px;
              ">${riskText}</span>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280; font-size: 12px;">📊 রিপোর্ট সংখ্যা</span>
              <span style="font-weight: 600; color: #374151; font-size: 13px;">${district.reports} টি</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280; font-size: 12px;">🐛 প্রধান পোকা</span>
              <span style="font-weight: 500; color: #374151; font-size: 12px;">${district.mainPest}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280; font-size: 12px;">🌡️ আবহাওয়া ঝুঁকি</span>
              <span style="font-weight: 600; color: ${district.weatherRisk > 60 ? '#ef4444' : district.weatherRisk > 40 ? '#f97316' : '#22c55e'}; font-size: 13px;">${district.weatherRisk}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280; font-size: 12px;">📈 প্রবণতা</span>
              <span style="
                font-size: 11px;
                padding: 2px 8px;
                border-radius: 8px;
                background: ${district.trend === 'increasing' ? '#fef2f2' : district.trend === 'decreasing' ? '#f0fdf4' : '#f3f4f6'};
                color: ${district.trend === 'increasing' ? '#dc2626' : district.trend === 'decreasing' ? '#16a34a' : '#6b7280'};
              ">${district.trend === 'increasing' ? '⬆️ বাড়ছে' : district.trend === 'decreasing' ? '⬇️ কমছে' : '➡️ স্থির'}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'pest-leaflet-popup',
        closeButton: true,
        maxWidth: 250,
      });

      // Click handler
      marker.on('click', () => {
        onDistrictClick?.(district);
        
        // Fly to district
        map.current?.flyTo([district.latitude, district.longitude], 9, {
          duration: 1.2,
        });
      });

      // Hover effects
      marker.on('mouseover', () => {
        marker.openPopup();
      });
    });
  }, [districtStats, onDistrictClick, isMapReady]);

  // Fly to selected district
  useEffect(() => {
    if (!map.current || !selectedDistrict || !isMapReady) return;
    
    const district = districtStats.find(d => d.district === selectedDistrict);
    if (district) {
      map.current.flyTo([district.latitude, district.longitude], 9, {
        duration: 1.2,
      });
    }
  }, [selectedDistrict, districtStats, isMapReady]);

  // Add custom CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'pest-map-styles';
    style.textContent = `
      @keyframes pestPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.4);
          opacity: 0.3;
        }
      }
      
      .pest-custom-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .pest-marker-inner:hover {
        transform: scale(1.15) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3) !important;
      }
      
      .pest-leaflet-popup .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        border: none;
        padding: 0;
      }
      
      .pest-leaflet-popup .leaflet-popup-content {
        margin: 0;
      }
      
      .pest-leaflet-popup .leaflet-popup-tip {
        background: white;
        box-shadow: 0 3px 14px rgba(0,0,0,0.1);
      }
      
      .pest-leaflet-popup .leaflet-popup-close-button {
        color: #9ca3af !important;
        font-size: 20px !important;
        padding: 8px 10px !important;
      }
      
      .pest-leaflet-popup .leaflet-popup-close-button:hover {
        color: #374151 !important;
      }
      
      .leaflet-control-zoom a {
        background: rgba(30, 41, 59, 0.9) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        width: 32px !important;
        height: 32px !important;
        line-height: 32px !important;
        margin: 2px !important;
      }
      
      .leaflet-control-zoom a:hover {
        background: rgba(51, 65, 85, 0.95) !important;
      }
      
      .leaflet-control-scale-line {
        background: rgba(30, 41, 59, 0.8) !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 2px 8px !important;
        font-size: 10px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('pest-map-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[300px] sm:h-[350px] rounded-2xl overflow-hidden border border-border shadow-lg">
      <div ref={mapContainer} className="absolute inset-0 z-0" />
      
      {/* Gradient overlay for aesthetics */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-t from-background/20 via-transparent to-transparent" />
      
      {/* Legend - Bottom left, compact on mobile */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-background/95 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 z-[400] border border-border shadow-lg">
        <p className="text-[8px] sm:text-[10px] font-medium text-muted-foreground mb-1.5 sm:mb-2 uppercase tracking-wider">ঝুঁকির মাত্রা</p>
        <div className="flex flex-row sm:flex-col gap-2 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-destructive shadow-sm shadow-destructive/30" />
            <span className="text-[10px] sm:text-xs text-foreground">উচ্চ</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 shadow-sm shadow-orange-500/30" />
            <span className="text-[10px] sm:text-xs text-foreground">মাঝারি</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 shadow-sm shadow-green-500/30" />
            <span className="text-[10px] sm:text-xs text-foreground">কম</span>
          </div>
        </div>
      </div>

      {/* Stats overlay - Top right instead of top left to avoid overlap */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-background/95 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 z-[400] border border-border shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bug className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">মোট জেলা</p>
            <p className="text-sm sm:text-lg font-bold text-foreground">{districtStats.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestLeafletMap;
