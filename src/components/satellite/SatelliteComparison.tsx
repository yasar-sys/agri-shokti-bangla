import { useState } from 'react';
import { SplitSquareHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ComparisonMode {
  type: 'side-by-side' | 'slider' | 'overlay';
  leftDate: Date;
  rightDate: Date;
}

interface SatelliteComparisonProps {
  dates: Date[];
  onCompare: (mode: ComparisonMode) => void;
  onClose: () => void;
  className?: string;
}

export function SatelliteComparison({
  dates,
  onCompare,
  onClose,
  className,
}: SatelliteComparisonProps) {
  const [leftDateIndex, setLeftDateIndex] = useState(0);
  const [rightDateIndex, setRightDateIndex] = useState(dates.length - 1);
  const [compareType, setCompareType] = useState<'side-by-side' | 'slider' | 'overlay'>('side-by-side');

  const handleApply = () => {
    onCompare({
      type: compareType,
      leftDate: dates[leftDateIndex],
      rightDate: dates[rightDateIndex],
    });
  };

  return (
    <div className={cn(
      'absolute top-4 left-4 bg-background/95 backdrop-blur-md border rounded-lg shadow-lg p-4 w-80 z-[1003]',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SplitSquareHorizontal className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">তুলনা মোড</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Comparison Type */}
      <div className="space-y-3 mb-4">
        <label className="text-sm font-medium">তুলনা ধরন</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {compareType === 'side-by-side' && 'পাশাপাশি'}
              {compareType === 'slider' && 'স্লাইডার'}
              {compareType === 'overlay' && 'ওভারলে'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => setCompareType('side-by-side')}>
              পাশাপাশি
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCompareType('slider')}>
              স্লাইডার
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCompareType('overlay')}>
              ওভারলে
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Left Date */}
      <div className="space-y-2 mb-3">
        <label className="text-sm font-medium">প্রথম তারিখ</label>
        <select
          value={leftDateIndex}
          onChange={(e) => setLeftDateIndex(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-md bg-background text-sm"
        >
          {dates.map((date, index) => (
            <option key={index} value={index}>
              {date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Right Date */}
      <div className="space-y-2 mb-4">
        <label className="text-sm font-medium">দ্বিতীয় তারিখ</label>
        <select
          value={rightDateIndex}
          onChange={(e) => setRightDateIndex(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-md bg-background text-sm"
        >
          {dates.map((date, index) => (
            <option key={index} value={index}>
              {date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1">
          প্রয়োগ করুন
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          বাতিল
        </Button>
      </div>

      {/* Stats */}
      {leftDateIndex !== rightDateIndex && (
        <div className="mt-4 p-3 bg-muted rounded-md text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">সময় পার্থক্য:</span>
            <span className="font-medium">
              {Math.abs(
                Math.floor(
                  (dates[rightDateIndex].getTime() - dates[leftDateIndex].getTime()) / (1000 * 60 * 60 * 24)
                )
              )} দিন
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
