import { useEffect, useState } from "react";
import { ArrowLeft, Share2, Download, AlertTriangle, CheckCircle, Leaf, Droplets, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

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
    
    // If no data, redirect to camera
    if (!storedResult) {
      navigate('/camera');
    }
  }, [navigate]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      case 'none': return 'text-secondary bg-secondary/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'অত্যন্ত গুরুতর';
      case 'high': return 'গুরুতর';
      case 'medium': return 'মাঝারি';
      case 'low': return 'হালকা';
      case 'none': return 'সুস্থ';
      default: return 'অজানা';
    }
  };

  if (!diseaseData) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/camera"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">রোগ নির্ণয়</h1>
            <p className="text-xs text-muted-foreground">AI বিশ্লেষণ সম্পন্ন</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border">
            <Download className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Scanned Image */}
      <section className="px-4 mb-4">
        <div className="aspect-video rounded-2xl overflow-hidden bg-card border border-border">
          {scannedImage ? (
            <img src={scannedImage} alt="Scanned crop" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">স্ক্যান করা ছবি</p>
            </div>
          )}
        </div>
      </section>

      {/* Disease Result Card */}
      <section className="px-4 mb-4">
        <div className="p-4 rounded-2xl bg-card border border-border animate-slide-up">
          {/* Header with confidence */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {diseaseData.isHealthy ? (
                  <CheckCircle className="w-6 h-6 text-secondary" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
                <h2 className="text-lg font-bold text-foreground">{diseaseData.diseaseName}</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {diseaseData.cropType}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(diseaseData.severity)}`}>
                  {getSeverityText(diseaseData.severity)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-secondary">{diseaseData.confidence}%</div>
              <div className="text-xs text-muted-foreground">নির্ভুলতা</div>
            </div>
          </div>

          {/* Symptoms */}
          {diseaseData.symptoms.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">🔍 লক্ষণসমূহ</h3>
              <ul className="space-y-1">
                {diseaseData.symptoms.map((symptom, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Causes */}
          {diseaseData.causes && diseaseData.causes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">⚠️ কারণ</h3>
              <ul className="space-y-1">
                {diseaseData.causes.map((cause, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment */}
          {diseaseData.treatment && (
            <div className="mb-4 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <h3 className="text-sm font-semibold text-foreground mb-2">💊 চিকিৎসা</h3>
              <p className="text-sm text-muted-foreground">{diseaseData.treatment}</p>
            </div>
          )}

          {/* Chemical Solution */}
          {diseaseData.chemicalSolution && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">রাসায়নিক সমাধান</h3>
              </div>
              <p className="text-sm text-muted-foreground">{diseaseData.chemicalSolution}</p>
            </div>
          )}

          {/* Organic Solution */}
          {diseaseData.organicSolution && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-foreground">জৈব সমাধান</h3>
              </div>
              <p className="text-sm text-muted-foreground">{diseaseData.organicSolution}</p>
            </div>
          )}

          {/* Fertilizer & Irrigation */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {diseaseData.fertilizer && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <h3 className="text-xs font-semibold text-foreground mb-1">🌱 সার</h3>
                <p className="text-xs text-muted-foreground">{diseaseData.fertilizer}</p>
              </div>
            )}
            {diseaseData.irrigation && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-1 mb-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <h3 className="text-xs font-semibold text-foreground">সেচ</h3>
                </div>
                <p className="text-xs text-muted-foreground">{diseaseData.irrigation}</p>
              </div>
            )}
          </div>

          {/* Preventive Measures */}
          {diseaseData.preventiveMeasures && diseaseData.preventiveMeasures.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">🛡️ প্রতিরোধমূলক ব্যবস্থা</h3>
              <ul className="space-y-1">
                {diseaseData.preventiveMeasures.map((measure, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    {measure}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recovery & Impact Info */}
          {(diseaseData.expectedRecoveryDays > 0 || diseaseData.yieldImpact) && (
            <div className="flex gap-3 mb-4">
              {diseaseData.expectedRecoveryDays > 0 && (
                <div className="flex-1 p-2 rounded-lg bg-muted text-center">
                  <div className="text-lg font-bold text-foreground">{diseaseData.expectedRecoveryDays}</div>
                  <div className="text-xs text-muted-foreground">দিনে সুস্থ</div>
                </div>
              )}
              {diseaseData.yieldImpact && (
                <div className="flex-1 p-2 rounded-lg bg-muted text-center">
                  <div className="text-lg font-bold text-foreground">{diseaseData.yieldImpact}</div>
                  <div className="text-xs text-muted-foreground">ফলনে প্রভাব</div>
                </div>
              )}
            </div>
          )}

          {/* Additional Notes */}
          {diseaseData.additionalNotes && (
            <div className="p-3 rounded-xl bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                💡 {diseaseData.additionalNotes}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-4 space-y-3">
        <Link to="/chat">
          <Button className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
            AI এর সাথে আরও কথা বলুন
          </Button>
        </Link>
        <Link to="/camera">
          <Button variant="outline" className="w-full h-12 border-border text-foreground hover:bg-muted font-semibold">
            নতুন স্ক্যান করুন
          </Button>
        </Link>
      </section>

      {/* LLM Attribution */}
      <section className="px-4 mt-6">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            🤖 এই বিশ্লেষণ Gemini Vision AI দ্বারা সম্পন্ন
          </p>
        </div>
      </section>
    </div>
  );
}
