import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, Pill, Droplets, Leaf } from "lucide-react";

interface DiseaseCardProps {
  disease: {
    name: string;
    confidence: number;
    symptoms: string[];
    treatment: string;
    fertilizer?: string;
    irrigation?: string;
  };
  className?: string;
}

export function DiseaseCard({ disease, className }: DiseaseCardProps) {
  const getHealthColor = (confidence: number) => {
    if (confidence >= 80) return "text-destructive";
    if (confidence >= 50) return "text-primary";
    return "text-secondary";
  };

  const getHealthBg = (confidence: number) => {
    if (confidence >= 80) return "bg-destructive/20";
    if (confidence >= 50) return "bg-primary/20";
    return "bg-secondary/20";
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border overflow-hidden",
        "bg-card",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground">{disease.name}</h3>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              getHealthBg(disease.confidence),
              getHealthColor(disease.confidence)
            )}
          >
            {disease.confidence}% নিশ্চয়তা
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          <span>AI রোগ শনাক্ত করেছে • POST /api/vision/detect-disease</span>
        </div>
      </div>

      {/* Symptoms */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">লক্ষণসমূহ</h4>
        </div>
        <ul className="space-y-2">
          {disease.symptoms.map((symptom, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Treatment */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-5 h-5 text-secondary" />
          <h4 className="font-medium text-foreground">চিকিৎসা</h4>
        </div>
        <p className="text-sm text-muted-foreground">{disease.treatment}</p>
      </div>

      {/* Additional recommendations */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {disease.fertilizer && (
          <div className="p-3 rounded-xl bg-muted">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-foreground">সার পরামর্শ</span>
            </div>
            <p className="text-xs text-muted-foreground">{disease.fertilizer}</p>
          </div>
        )}
        {disease.irrigation && (
          <div className="p-3 rounded-xl bg-muted">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">সেচ পরামর্শ</span>
            </div>
            <p className="text-xs text-muted-foreground">{disease.irrigation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
