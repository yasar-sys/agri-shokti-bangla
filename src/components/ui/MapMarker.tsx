import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface MapMarkerProps {
  status: "healthy" | "warning" | "disease";
  fieldName: string;
  lastScan?: string;
  healthScore?: number;
  onClick?: () => void;
  className?: string;
}

export const MapMarker = forwardRef<HTMLDivElement, MapMarkerProps>(
  (
    { status, fieldName, lastScan, healthScore, onClick, className }: MapMarkerProps,
    ref
  ) => {
    const statusConfig = {
      healthy: {
        color: "text-secondary",
        bg: "bg-secondary",
        glow: "shadow-[0_0_10px_hsl(145_75%_71%/0.5)]",
        label: "সুস্থ",
      },
      warning: {
        color: "text-primary",
        bg: "bg-primary",
        glow: "shadow-[0_0_10px_hsl(45_87%_62%/0.5)]",
        label: "সতর্কতা",
      },
      disease: {
        color: "text-destructive",
        bg: "bg-destructive",
        glow: "shadow-[0_0_10px_hsl(16_72%_61%/0.5)]",
        label: "রোগাক্রান্ত",
      },
    };

    const config = statusConfig[status];

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn("relative cursor-pointer group", "animate-scale-in", className)}
      >
        {/* Marker */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "transition-transform group-hover:scale-110",
            config.bg,
            config.glow
          )}
        >
          <MapPin className="w-5 h-5 text-background" />
        </div>

        {/* Pulse effect for disease */}
        {status === "disease" && (
          <div className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-30" />
        )}

        {/* Popup on hover */}
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "pointer-events-none"
          )}
        >
          <div className="bg-card border border-border rounded-xl p-3 shadow-xl min-w-[150px]">
            <h4 className="font-medium text-foreground text-sm mb-1">{fieldName}</h4>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full", config.bg)} />
              <span className={cn("text-xs", config.color)}>{config.label}</span>
            </div>
            {healthScore !== undefined && (
              <p className="text-xs text-muted-foreground">স্বাস্থ্য স্কোর: {healthScore}%</p>
            )}
            {lastScan && (
              <p className="text-xs text-muted-foreground">শেষ স্ক্যান: {lastScan}</p>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-card" />
        </div>
      </div>
    );
  }
);

MapMarker.displayName = "MapMarker";
