import { useEffect, useState } from 'react';
import { Layers, Satellite, Leaf, Droplets, Thermometer, CloudRain, Download, SplitSquareHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { satelliteTileCache } from '@/lib/satelliteTileCache';
import { nasaApiClient } from '@/lib/nasaApiClient';

type TileLayer = 'satellite' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation';

interface MobileSatelliteControlsProps {
  activeLayer: TileLayer;
  onLayerChange: (layer: TileLayer) => void;
  onComparisonToggle: () => void;
  onTimelapseToggle: () => void;
  className?: string;
}

const LAYERS = [
  { id: 'satellite' as TileLayer, name: 'স্যাটেলাইট', icon: Satellite, color: '#6b7280' },
  { id: 'ndvi' as TileLayer, name: 'উদ্ভিদ সূচক', icon: Leaf, color: '#22c55e' },
  { id: 'soil_moisture' as TileLayer, name: 'মাটির আর্দ্রতা', icon: Droplets, color: '#3b82f6' },
  { id: 'lst' as TileLayer, name: 'তাপমাত্রা', icon: Thermometer, color: '#f97316' },
  { id: 'precipitation' as TileLayer, name: 'বৃষ্টিপাত', icon: CloudRain, color: '#8b5cf6' },
];

export function MobileSatelliteControls({
  activeLayer,
  onLayerChange,
  onComparisonToggle,
  onTimelapseToggle,
  className,
}: MobileSatelliteControlsProps) {
  const [cacheStats, setCacheStats] = useState({ count: 0, sizeMB: 0 });
  const [apiHealth, setApiHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateStats = async () => {
      const stats = await satelliteTileCache.getCacheStats();
      setCacheStats(stats);
      
      const health = nasaApiClient.getOverallHealth();
      setApiHealth(health);
    };

    updateStats();
    const interval = setInterval(updateStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    await satelliteTileCache.clearCache();
    nasaApiClient.clearCache();
    setCacheStats({ count: 0, sizeMB: 0 });
  };

  return (
    <>
      {/* Mobile Floating Button */}
      <div className={cn('lg:hidden', className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-[1001]"
              style={{ backgroundColor: LAYERS.find(l => l.id === activeLayer)?.color }}
            >
              {(() => {
                const Icon = LAYERS.find(l => l.id === activeLayer)?.icon || Layers;
                return <Icon className="w-6 h-6 text-white" />;
              })()}
            </Button>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[70vh] p-0">
            <SheetHeader className="px-4 pt-4 pb-2 border-b">
              <SheetTitle>স্যাটেলাইট লেয়ার</SheetTitle>
            </SheetHeader>
            
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(70vh-60px)]">
              {/* Layer Selection */}
              <div className="grid grid-cols-2 gap-3">
                {LAYERS.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => {
                        onLayerChange(layer.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                        activeLayer === layer.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Icon
                        className="w-8 h-8"
                        style={{ color: activeLayer === layer.id ? layer.color : undefined }}
                      />
                      <span className="text-sm font-medium text-center">{layer.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">দ্রুত ক্রিয়া</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      onComparisonToggle();
                      setIsOpen(false);
                    }}
                  >
                    <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                    তুলনা করুন
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      onTimelapseToggle();
                      setIsOpen(false);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    টাইমলাপস
                  </Button>
                </div>
              </div>

              {/* API Health */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">সিস্টেম স্ট্যাটাস</h4>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">API স্বাস্থ্য</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          apiHealth === 'healthy' && 'bg-green-500',
                          apiHealth === 'degraded' && 'bg-yellow-500',
                          apiHealth === 'down' && 'bg-red-500'
                        )}
                      />
                      <span className="text-sm font-medium">
                        {apiHealth === 'healthy' && 'সুস্থ'}
                        {apiHealth === 'degraded' && 'ধীর'}
                        {apiHealth === 'down' && 'বন্ধ'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ক্যাশ সাইজ</span>
                    <span className="text-sm font-medium">{cacheStats.sizeMB} MB</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">টাইল সংখ্যা</span>
                    <span className="text-sm font-medium">{cacheStats.count}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={handleClearCache}
                  >
                    ক্যাশ পরিষ্কার করুন
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Controls */}
      <div className="hidden lg:flex flex-col gap-2 absolute top-4 left-4 z-[1001]">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          return (
            <Button
              key={layer.id}
              variant={activeLayer === layer.id ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'h-10 w-10',
                activeLayer === layer.id && 'shadow-lg'
              )}
              style={
                activeLayer === layer.id
                  ? { backgroundColor: layer.color, borderColor: layer.color }
                  : undefined
              }
              onClick={() => onLayerChange(layer.id)}
              title={layer.name}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>
    </>
  );
}
