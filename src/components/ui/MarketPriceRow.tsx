import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketPriceRowProps {
  crop: string;
  todayPrice: number;
  yesterdayPrice: number;
  weeklyAvg?: number;
  unit?: string;
  className?: string;
}

export function MarketPriceRow({
  crop,
  todayPrice,
  yesterdayPrice,
  weeklyAvg,
  unit = "টাকা/কেজি",
  className,
}: MarketPriceRowProps) {
  const change = todayPrice - yesterdayPrice;
  const changePercent = ((change / yesterdayPrice) * 100).toFixed(1);

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change > 0) return "text-secondary";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getTrendBg = () => {
    if (change > 0) return "bg-secondary/20";
    if (change < 0) return "bg-destructive/20";
    return "bg-muted";
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl",
        "bg-card border border-border",
        "hover:border-primary/30 transition-colors",
        className
      )}
    >
      {/* Crop name */}
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{crop}</h4>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>

      {/* Today's price */}
      <div className="text-right mr-4">
        <p className="font-semibold text-foreground">৳{todayPrice}</p>
        <span className="text-xs text-muted-foreground">আজ</span>
      </div>

      {/* Weekly average */}
      {weeklyAvg !== undefined && (
        <div className="text-right mr-4">
          <p className="text-sm text-primary">৳{weeklyAvg}</p>
          <span className="text-xs text-muted-foreground">সা. গড়</span>
        </div>
      )}

      {/* Change */}
      <div
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg",
          getTrendBg(),
          getTrendColor()
        )}
      >
        {getTrendIcon()}
        <span className="text-sm font-medium">
          {change > 0 ? "+" : ""}{changePercent}%
        </span>
      </div>
    </div>
  );
}
