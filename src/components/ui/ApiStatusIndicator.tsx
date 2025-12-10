import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ApiStatusIndicatorProps {
  status: "connected" | "disconnected" | "loading";
  label?: string;
  className?: string;
}

export function ApiStatusIndicator({ status, label, className }: ApiStatusIndicatorProps) {
  const statusConfig = {
    connected: {
      icon: Wifi,
      color: "text-secondary",
      bg: "bg-secondary/20",
      pulse: true,
      label: "সংযুক্ত",
    },
    disconnected: {
      icon: WifiOff,
      color: "text-destructive",
      bg: "bg-destructive/20",
      pulse: false,
      label: "বিচ্ছিন্ন",
    },
    loading: {
      icon: Loader2,
      color: "text-primary",
      bg: "bg-primary/20",
      pulse: false,
      label: "লোড হচ্ছে...",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("p-1.5 rounded-lg", config.bg)}>
        <Icon
          className={cn(
            "w-4 h-4",
            config.color,
            status === "loading" && "animate-spin",
            config.pulse && "animate-pulse"
          )}
        />
      </div>
      <span className={cn("text-xs font-medium", config.color)}>
        {label || config.label}
      </span>
    </div>
  );
}
