import { useEffect, useState, useRef } from 'react';
import { Loader2, Satellite, AlertTriangle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NASASatelliteMapProps {
  latitude?: number;
  longitude?: number;
  zones?: Array<{
    id: string;
    name_bn: string;
    health_score: number;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  onZoneClick?: (zoneId: string) => void;
}

interface SatelliteTiles {
  ndvi_terra: string;
  ndvi_aqua: string;
  true_color: string;
  date: string;
  center: { lat: number; lng: number };
}

type LayerType = 'ndvi' | 'truecolor' | 'stress';

export function NASASatelliteMap({ latitude = 23.8103, longitude = 90.4125, zones = [], onZoneClick }: NASASatelliteMapProps) {
  const [loading, setLoading] = useState(true);
  const [tiles, setTiles] = useState<SatelliteTiles | null>(null);
  const [activeLayer, setActiveLayer] = useState<LayerType>('ndvi');
  const [analysis, setAnalysis] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchSatelliteTiles();
    fetchAnalysis();
  }, [latitude, longitude]);

  const fetchSatelliteTiles = async () => {
    try {
      const response = await supabase.functions.invoke('nasa-ndvi', {
        body: { action: 'get_satellite_tiles', latitude, longitude }
      });

      if (response.data?.success) {
        setTiles(response.data.tiles);
      }
    } catch (error) {
      console.error('Error fetching satellite tiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const response = await supabase.functions.invoke('nasa-ndvi', {
        body: { action: 'analyze_imagery', latitude, longitude }
      });

      if (response.data?.success) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  // Generate NDVI heatmap visualization
  const renderNDVIVisualization = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background representing satellite view
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (activeLayer === 'ndvi') {
      bgGradient.addColorStop(0, 'hsl(142, 50%, 25%)');
      bgGradient.addColorStop(0.3, 'hsl(85, 45%, 30%)');
      bgGradient.addColorStop(0.5, 'hsl(55, 60%, 35%)');
      bgGradient.addColorStop(0.7, 'hsl(120, 55%, 28%)');
      bgGradient.addColorStop(1, 'hsl(95, 50%, 22%)');
    } else if (activeLayer === 'truecolor') {
      bgGradient.addColorStop(0, 'hsl(120, 40%, 35%)');
      bgGradient.addColorStop(0.5, 'hsl(100, 35%, 40%)');
      bgGradient.addColorStop(1, 'hsl(80, 30%, 45%)');
    } else {
      bgGradient.addColorStop(0, 'hsl(0, 50%, 40%)');
      bgGradient.addColorStop(0.5, 'hsl(45, 70%, 45%)');
      bgGradient.addColorStop(1, 'hsl(120, 50%, 35%)');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw field rows pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x / 20) * 3);
      }
      ctx.stroke();
    }

    // Draw vegetation/crop dots
    zones.forEach((zone, idx) => {
      const zoneX = (idx % 2) * (width / 2) + width / 4;
      const zoneY = Math.floor(idx / 2) * (height / 2) + height / 4;
      const radius = Math.min(width, height) / 5;

      // Zone health color
      const health = zone.health_score;
      let hue = health >= 0.7 ? 120 : health >= 0.4 ? 55 : 0;
      let saturation = 60 + health * 20;
      let lightness = 30 + health * 20;

      if (activeLayer === 'stress') {
        hue = (1 - health) * 60; // Red to yellow
        saturation = 70;
      }

      // Draw zone area
      const gradient = ctx.createRadialGradient(zoneX, zoneY, 0, zoneX, zoneY, radius);
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
      gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, ${lightness - 10}%, 0.6)`);
      gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness - 20}%, 0.3)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(zoneX, zoneY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw crop dots
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius * 0.8;
        const dotX = zoneX + Math.cos(angle) * distance;
        const dotY = zoneY + Math.sin(angle) * distance;
        const dotRadius = 2 + Math.random() * 3;
        
        const dotHealth = health * (0.8 + Math.random() * 0.4);
        const dotHue = dotHealth >= 0.7 ? 100 + Math.random() * 40 : dotHealth >= 0.4 ? 40 + Math.random() * 30 : Math.random() * 30;
        
        ctx.fillStyle = `hsla(${dotHue}, ${50 + Math.random() * 30}%, ${35 + Math.random() * 20}%, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw stress indicators for unhealthy zones
      if (health < 0.5 && activeLayer !== 'truecolor') {
        for (let i = 0; i < 5; i++) {
          const stressX = zoneX + (Math.random() - 0.5) * radius;
          const stressY = zoneY + (Math.random() - 0.5) * radius;
          
          ctx.fillStyle = 'hsla(0, 70%, 50%, 0.4)';
          ctx.beginPath();
          ctx.arc(stressX, stressY, 5 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw anomaly markers if analysis available
    if (analysis?.detected_anomalies) {
      analysis.detected_anomalies.forEach((anomaly: any, idx: number) => {
        const x = (idx % 3 + 1) * (width / 4);
        const y = (Math.floor(idx / 3) + 1) * (height / 3);
        
        // Pulsing alert circle
        ctx.strokeStyle = anomaly.severity === 'high' ? 'hsl(0, 70%, 50%)' : 'hsl(45, 80%, 50%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
  };

  useEffect(() => {
    if (!loading && canvasRef.current) {
      renderNDVIVisualization();
    }
  }, [loading, zones, activeLayer, analysis]);

  if (loading) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">স্যাটেলাইট ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      {/* Layer Toggle */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1">
        <Button
          size="sm"
          variant={activeLayer === 'ndvi' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('ndvi')}
          className="h-7 text-xs"
        >
          NDVI
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'truecolor' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('truecolor')}
          className="h-7 text-xs"
        >
          রঙিন
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'stress' ? 'default' : 'ghost'}
          onClick={() => setActiveLayer('stress')}
          className="h-7 text-xs"
        >
          স্ট্রেস
        </Button>
      </div>

      {/* NASA Badge */}
      <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
        <Satellite className="w-3 h-3 text-chart-4" />
        <span className="text-xs text-muted-foreground">NASA GIBS</span>
      </div>

      {/* Canvas for NDVI visualization */}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full aspect-video"
        style={{ imageRendering: 'auto' }}
      />

      {/* Zone Labels Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
          {zones.slice(0, 4).map((zone, idx) => (
            <div 
              key={zone.id}
              className="flex items-center justify-center pointer-events-auto cursor-pointer"
              onClick={() => onZoneClick?.(zone.id)}
            >
              <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/50 transition-transform hover:scale-105">
                <p className="text-xs font-medium text-foreground text-center">{zone.name_bn}</p>
                <p className={cn(
                  "text-xl font-bold text-center",
                  zone.health_score >= 0.7 ? "text-secondary" :
                  zone.health_score >= 0.4 ? "text-chart-2" : "text-destructive"
                )}>
                  {(zone.health_score * 100).toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground text-center">
                  {activeLayer === 'ndvi' ? 'NDVI' : activeLayer === 'stress' ? 'স্ট্রেস' : 'স্বাস্থ্য'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Alerts */}
      {analysis?.detected_anomalies?.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="bg-destructive/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-xs text-destructive-foreground">
              {analysis.detected_anomalies.length}টি সমস্যা সনাক্ত হয়েছে
            </span>
          </div>
        </div>
      )}

      {/* Date stamp */}
      {tiles?.date && (
        <div className="absolute bottom-2 right-2 z-10 bg-background/60 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-xs text-muted-foreground">{tiles.date}</span>
        </div>
      )}

      {/* Scanning animation overlay */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsla(200, 100%, 70%, 0.08) 50%, transparent 100%)',
          animation: 'scanLine 4s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
