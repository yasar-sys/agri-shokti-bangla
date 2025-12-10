import { cn } from "@/lib/utils";
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react";

interface TimelineCardProps {
  date: string;
  cropName: string;
  result: "healthy" | "disease";
  imageUrl?: string;
  summary: string;
  className?: string;
}

export function TimelineCard({
  date,
  cropName,
  result,
  imageUrl,
  summary,
  className,
}: TimelineCardProps) {
  const isHealthy = result === "healthy";

  return (
    <div className={cn("flex gap-4", className)}>
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isHealthy ? "bg-secondary/20" : "bg-destructive/20"
          )}
        >
          {isHealthy ? (
            <CheckCircle className="w-5 h-5 text-secondary" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          )}
        </div>
        <div className="w-0.5 h-full bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {imageUrl && (
            <div className="aspect-video bg-muted overflow-hidden">
              <img
                src={imageUrl}
                alt={cropName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">{cropName}</h4>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  isHealthy
                    ? "bg-secondary/20 text-secondary"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {isHealthy ? "সুস্থ" : "রোগাক্রান্ত"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
