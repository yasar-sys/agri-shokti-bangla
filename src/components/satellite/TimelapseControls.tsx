import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Download, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TimelapseControlsProps {
  dates: Date[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  onExport?: () => void;
  className?: string;
}

export function TimelapseControls({
  dates,
  currentIndex,
  onIndexChange,
  onPlay,
  onPause,
  isPlaying,
  onExport,
  className,
}: TimelapseControlsProps) {
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else if (loop) {
      onIndexChange(dates.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < dates.length - 1) {
      onIndexChange(currentIndex + 1);
    } else if (loop) {
      onIndexChange(0);
    }
  };

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
  ];

  return (
    <div className={cn('flex flex-col gap-3 p-4 bg-background/95 backdrop-blur-md rounded-lg border', className)}>
      {/* Playback Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevious}
            disabled={!loop && currentIndex === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNext}
            disabled={!loop && currentIndex === dates.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-1">
          {speedOptions.map((option) => (
            <Button
              key={option.value}
              variant={speed === option.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Loop & Export */}
        <div className="flex items-center gap-1">
          <Button
            variant={loop ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLoop(!loop)}
            title="Loop"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          
          {onExport && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onExport}
              title="Export Timelapse"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="space-y-2">
        <Slider
          value={[currentIndex]}
          onValueChange={(value) => onIndexChange(value[0])}
          max={dates.length - 1}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{dates[0]?.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}</span>
          <span className="font-medium text-foreground">
            {dates[currentIndex]?.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span>{dates[dates.length - 1]?.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}</span>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          ফ্রেম {currentIndex + 1} / {dates.length}
        </div>
      </div>
    </div>
  );
}
