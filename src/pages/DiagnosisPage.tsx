import { useEffect, useState } from "react";
import { ArrowLeft, Share2, Download, AlertTriangle, CheckCircle, Leaf, Droplets, FlaskConical, Zap, Shield, Clock, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface DiseaseResult {
  diseaseName: string;
  confidence: number;
  cropType: string;
  severity: string;
  symptoms: string[];
  causes: string[];
  treatment: string;
  preventiveMeasures: string[];
  fertilizer: string;
  irrigation: string;
  organicSolution: string;
  chemicalSolution: string;
  expectedRecoveryDays: number;
  yieldImpact: string;
  isHealthy: boolean;
  additionalNotes: string;
}

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [diseaseData, setDiseaseData] = useState<DiseaseResult | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('diseaseResult');
    const storedImage = sessionStorage.getItem('scannedImage');
    
    if (storedResult) {
      setDiseaseData(JSON.parse(storedResult));
    }
    if (storedImage) {
      setScannedImage(storedImage);
    }
    
    if (!storedResult) {
      navigate('/camera');
    }
  }, [navigate]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500/30 to-red-500/10 border-red-500/50 text-red-400';
      case 'high': return 'from-orange-500/30 to-orange-500/10 border-orange-500/50 text-orange-400';
      case 'medium': return 'from-yellow-500/30 to-yellow-500/10 border-yellow-500/50 text-yellow-400';
      case 'low': return 'from-green-500/30 to-green-500/10 border-green-500/50 text-green-400';
      case 'none': return 'from-secondary/30 to-secondary/10 border-secondary/50 text-secondary';
      default: return 'from-muted/30 to-muted/10 border-border text-muted-foreground';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return t('critical');
      case 'high': return t('high');
      case 'medium': return t('mediumSeverity');
      case 'low': return t('low');
      case 'none': return t('healthy');
      default: return t('unknown');
    }
  };

  if (!diseaseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative px-5 pt-6 pb-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/camera"
              className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-secondary/50 transition-all shadow-soft"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                {t('diagnosisTitle')}
                <Zap className="w-4 h-4 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">{t('aiAnalysisComplete')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-secondary/50 transition-all">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
            <button className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-secondary/50 transition-all">
              <Download className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Scanned Image */}
      <section className="px-5 mb-5">
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-elevated">
          {scannedImage ? (
            <img src={scannedImage} alt="Scanned crop" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
              <Leaf className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Confidence Badge */}
          <div className="absolute top-3 right-3 glass-strong px-3 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm font-bold text-secondary">{diseaseData.confidence}%</span>
          </div>
        </div>
      </section>

      {/* Main Result Card */}
      <section className="px-5 mb-5">
        <div className="glass-card rounded-3xl p-5 border border-border/50 animate-slide-up">
          {/* Status Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  diseaseData.isHealthy ? "bg-secondary/20" : "bg-destructive/20"
                )}>
                  {diseaseData.isHealthy ? (
                    <CheckCircle className="w-6 h-6 text-secondary" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{diseaseData.diseaseName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
                      {diseaseData.cropType}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold border bg-gradient-to-r",
                      getSeverityColor(diseaseData.severity)
                    )}>
                      {getSeverityText(diseaseData.severity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          {diseaseData.symptoms.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-chart-3/20 flex items-center justify-center">
                  <span className="text-xs">🔍</span>
                </div>
                {t('symptoms')}
              </h3>
              <div className="space-y-2">
                {diseaseData.symptoms.map((symptom, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                    {symptom}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment */}
          {diseaseData.treatment && (
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30">
              <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                {t('treatment')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{diseaseData.treatment}</p>
            </div>
          )}

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 gap-3 mb-5">
            {diseaseData.chemicalSolution && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/30">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-destructive" />
                  <h3 className="text-sm font-bold text-foreground">{t('chemicalSolution')}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{diseaseData.chemicalSolution}</p>
              </div>
            )}

            {diseaseData.organicSolution && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-bold text-foreground">{t('organicSolution')}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{diseaseData.organicSolution}</p>
              </div>
            )}
          </div>

          {/* Fertilizer & Irrigation */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {diseaseData.fertilizer && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm">🌱</span>
                  <h3 className="text-xs font-bold text-foreground">{t('fertilizer')}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground">{diseaseData.fertilizer}</p>
              </div>
            )}
            {diseaseData.irrigation && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
                <div className="flex items-center gap-1 mb-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <h3 className="text-xs font-bold text-foreground">{t('irrigation')}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground">{diseaseData.irrigation}</p>
              </div>
            )}
          </div>

          {/* Recovery Stats */}
          {(diseaseData.expectedRecoveryDays > 0 || diseaseData.yieldImpact) && (
            <div className="flex gap-3 mb-5">
              {diseaseData.expectedRecoveryDays > 0 && (
                <div className="flex-1 p-3 rounded-xl glass-card text-center border border-border/30">
                  <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{diseaseData.expectedRecoveryDays}</div>
                  <div className="text-[10px] text-muted-foreground">{t('recoveryDays')}</div>
                </div>
              )}
              {diseaseData.yieldImpact && (
                <div className="flex-1 p-3 rounded-xl glass-card text-center border border-border/30">
                  <TrendingDown className="w-5 h-5 text-destructive mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{diseaseData.yieldImpact}</div>
                  <div className="text-[10px] text-muted-foreground">{t('yieldImpact')}</div>
                </div>
              )}
            </div>
          )}

          {/* Additional Notes */}
          {diseaseData.additionalNotes && (
            <div className="p-3 rounded-xl glass-card border border-border/30">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">💡</span>
                {diseaseData.additionalNotes}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-5 space-y-3">
        <Link to="/chat">
          <Button className={cn(
            "w-full h-13 font-bold rounded-2xl",
            "bg-gradient-to-r from-secondary to-secondary/80",
            "text-secondary-foreground shadow-glow",
            "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
            "transition-all duration-300"
          )}>
            {t('talkToAI')}
          </Button>
        </Link>
        <Link to="/camera">
          <Button variant="outline" className={cn(
            "w-full h-13 font-semibold rounded-2xl",
            "glass-card border-border/50 text-foreground",
            "hover:bg-muted/50 hover:border-secondary/50",
            "transition-all duration-300"
          )}>
            {t('newScan')}
          </Button>
        </Link>
      </section>

      {/* Attribution */}
      <section className="px-5 mt-6">
        <div className="glass-card p-3 rounded-xl border border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-primary" />
            {t('analyzedBy')} Gemini Vision AI
          </p>
        </div>
      </section>
    </div>
  );
}
