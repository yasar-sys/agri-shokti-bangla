import { useState, useEffect } from 'react';
import { Satellite, Check, Clock, Maximize2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TILE_LAYERS, getGIBSDate } from '@/lib/nasaDataSources';

export type SatelliteSource = 'modis' | 'landsat' | 'sentinel';

interface SatelliteInfo {
  id: SatelliteSource;
  name: string;
  nameBn: string;
  resolution: string;
  description: string;
  descriptionBn: string;
  updateFrequency: string;
  updateFrequencyBn: string;
  dataDelay: number; // days
  coverage: string;
  coverageBn: string;
  color: string;
}

const SATELLITE_SOURCES: SatelliteInfo[] = [
  {
    id: 'modis',
    name: 'MODIS Terra',
    nameBn: 'মডিস টেরা',
    resolution: '250m',
    description: 'NASA Terra satellite - Best for large area monitoring',
    descriptionBn: 'NASA টেরা স্যাটেলাইট - বড় এলাকা পর্যবেক্ষণের জন্য আদর্শ',
    updateFrequency: 'Daily',
    updateFrequencyBn: 'প্রতিদিন',
    dataDelay: 1,
    coverage: 'Global',
    coverageBn: 'বিশ্বব্যাপী',
    color: '#ef4444'
  },
  {
    id: 'landsat',
    name: 'Landsat 8/9',
    nameBn: 'ল্যান্ডস্যাট ৮/৯',
    resolution: '30m',
    description: 'USGS/NASA - High resolution, ideal for field-level analysis',
    descriptionBn: 'USGS/NASA - উচ্চ রেজোলিউশন, মাঠ পর্যায়ের বিশ্লেষণের জন্য আদর্শ',
    updateFrequency: '16 days',
    updateFrequencyBn: '১৬ দিন',
    dataDelay: 2,
    coverage: 'Global',
    coverageBn: 'বিশ্বব্যাপী',
    color: '#3b82f6'
  },
  {
    id: 'sentinel',
    name: 'Sentinel-2',
    nameBn: 'সেন্টিনেল-২',
    resolution: '10m',
    description: 'ESA/NASA HLS - Highest resolution for detailed crop monitoring',
    descriptionBn: 'ESA/NASA HLS - বিস্তারিত ফসল পর্যবেক্ষণের জন্য সর্বোচ্চ রেজোলিউশন',
    updateFrequency: '5 days',
    updateFrequencyBn: '৫ দিন',
    dataDelay: 5,
    coverage: 'Land only',
    coverageBn: 'শুধু ভূমি',
    color: '#22c55e'
  }
];

interface SatelliteSourceSelectorProps {
  selectedSource: SatelliteSource;
  onSourceChange: (source: SatelliteSource) => void;
  className?: string;
}

export function SatelliteSourceSelector({
  selectedSource,
  onSourceChange,
  className
}: SatelliteSourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [layerDates, setLayerDates] = useState<Record<SatelliteSource, string>>({
    modis: '',
    landsat: '',
    sentinel: ''
  });

  // Get current data dates for each satellite
  useEffect(() => {
    const modisLayer = TILE_LAYERS.getMODISLayer();
    const landsatLayer = TILE_LAYERS.getLandsatLayer();
    const sentinelLayer = TILE_LAYERS.getSentinelLayer();

    setLayerDates({
      modis: modisLayer.date || getGIBSDate(1),
      landsat: new Date().toISOString().split('T')[0], // Landsat uses current imagery composite
      sentinel: sentinelLayer.date || getGIBSDate(5)
    });
  }, []);

  const selectedSatellite = SATELLITE_SOURCES.find(s => s.id === selectedSource) || SATELLITE_SOURCES[0];

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('bn-BD', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("h-10 gap-2 min-w-[160px]", className)}
        >
          <Satellite className="w-4 h-4" style={{ color: selectedSatellite.color }} />
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{selectedSatellite.nameBn}</span>
            <span className="text-[10px] text-muted-foreground">{selectedSatellite.resolution}</span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        className="w-80 p-0" 
        sideOffset={8}
      >
        <div className="p-3 border-b bg-muted/30">
          <h4 className="font-semibold text-sm">স্যাটেলাইট উৎস নির্বাচন করুন</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            প্রতিটি স্যাটেলাইটের রেজোলিউশন ও আপডেট তারিখ দেখুন
          </p>
        </div>

        <div className="p-2 space-y-1">
          {SATELLITE_SOURCES.map((satellite) => (
            <button
              key={satellite.id}
              onClick={() => {
                onSourceChange(satellite.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                selectedSource === satellite.id && "bg-primary/10 ring-1 ring-primary/20"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${satellite.color}20` }}
                >
                  <Satellite className="w-5 h-5" style={{ color: satellite.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{satellite.nameBn}</span>
                    {selectedSource === satellite.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {satellite.descriptionBn}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                      <Maximize2 className="w-3 h-3" />
                      {satellite.resolution}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                      <Clock className="w-3 h-3" />
                      {satellite.updateFrequencyBn}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-5 gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(layerDates[satellite.id])}
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>বর্তমান: <strong className="text-foreground">{selectedSatellite.nameBn}</strong></span>
            <span>ডেটা তারিখ: <strong className="text-foreground">{formatDate(layerDates[selectedSource])}</strong></span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Mobile version
export function MobileSatelliteSourceSelector({
  selectedSource,
  onSourceChange,
  className
}: SatelliteSourceSelectorProps) {
  const [layerDates, setLayerDates] = useState<Record<SatelliteSource, string>>({
    modis: '',
    landsat: '',
    sentinel: ''
  });

  useEffect(() => {
    const modisLayer = TILE_LAYERS.getMODISLayer();
    const sentinelLayer = TILE_LAYERS.getSentinelLayer();

    setLayerDates({
      modis: modisLayer.date || getGIBSDate(1),
      landsat: new Date().toISOString().split('T')[0],
      sentinel: sentinelLayer.date || getGIBSDate(5)
    });
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('bn-BD', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold">স্যাটেলাইট উৎস</h4>
      <div className="grid grid-cols-3 gap-2">
        {SATELLITE_SOURCES.map((satellite) => (
          <button
            key={satellite.id}
            onClick={() => onSourceChange(satellite.id)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
              selectedSource === satellite.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            <Satellite 
              className="w-6 h-6 mb-1" 
              style={{ color: selectedSource === satellite.id ? satellite.color : undefined }}
            />
            <span className="text-xs font-medium text-center">{satellite.nameBn}</span>
            <span className="text-[10px] text-muted-foreground">{satellite.resolution}</span>
            <span className="text-[9px] text-muted-foreground mt-1">
              {formatDate(layerDates[satellite.id])}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
