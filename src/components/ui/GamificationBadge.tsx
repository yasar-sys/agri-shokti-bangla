import { cn } from "@/lib/utils";
import { Award, Star, Leaf, Trophy, Target } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  earned?: boolean;
  progress?: number;
  className?: string;
}

export function GamificationBadge({
  icon: Icon = Award,
  title,
  description,
  earned = false,
  progress,
  className,
}: BadgeProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center p-4 rounded-2xl border transition-all",
        earned
          ? "bg-primary/10 border-primary/30 glow-gold"
          : "bg-muted/50 border-border opacity-60 grayscale",
        className
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-3",
          earned ? "bg-primary/20" : "bg-muted"
        )}
      >
        <Icon className={cn("w-8 h-8", earned ? "text-primary" : "text-muted-foreground")} />
      </div>

      {/* Title */}
      <h4 className={cn("font-medium text-sm text-center", earned ? "text-foreground" : "text-muted-foreground")}>
        {title}
      </h4>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>
      )}

      {/* Progress bar for unearned badges */}
      {!earned && progress !== undefined && (
        <div className="w-full mt-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">{progress}%</p>
        </div>
      )}

      {/* Earned checkmark */}
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Star className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

// Pre-defined badge types
export const badges = {
  firstScan: { icon: Leaf, title: "প্রথম স্ক্যান", description: "আপনার প্রথম ফসল স্ক্যান করেছেন" },
  fiveScans: { icon: Target, title: "৫টি স্ক্যান", description: "৫টি ফসল সফলভাবে স্ক্যান করেছেন" },
  diseaseExpert: { icon: Trophy, title: "রোগ বিশেষজ্ঞ", description: "১০টি রোগ সঠিকভাবে শনাক্ত করেছেন" },
  weatherWatcher: { icon: Award, title: "আবহাওয়া পর্যবেক্ষক", description: "৭ দিন ধারাবাহিকভাবে আবহাওয়া চেক করেছেন" },
};
