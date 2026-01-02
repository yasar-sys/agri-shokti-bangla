import { useEffect, useState } from "react";
import { ArrowLeft, Share2, Download, AlertTriangle, CheckCircle, Leaf, Droplets, FlaskConical, Zap, Shield, Clock, TrendingDown, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Generate and download PDF report
  const handleDownloadReport = async () => {
    if (!diseaseData) return;
    
    setIsDownloading(true);
    
    try {
      const reportDate = new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const severityText = {
        'critical': 'সঙ্কটজনক',
        'high': 'উচ্চ',
        'medium': 'মাঝারি',
        'low': 'নিম্ন',
        'none': 'সুস্থ'
      }[diseaseData.severity] || 'অজানা';

      // Create HTML content for the report
      const reportHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>রোগ নির্ণয় রিপোর্ট - ${diseaseData.diseaseName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Noto Sans Bengali', sans-serif; 
      background: #fff; 
      color: #1a1a2e;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #16a34a;
    }
    .logo { font-size: 28px; font-weight: bold; color: #16a34a; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 14px; }
    .report-meta { 
      display: flex; 
      justify-content: space-between; 
      background: #f0fdf4;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .meta-item { text-align: center; }
    .meta-label { font-size: 12px; color: #666; }
    .meta-value { font-size: 16px; font-weight: 600; color: #16a34a; }
    .section { margin-bottom: 25px; }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      color: #1a1a2e;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #16a34a;
      border-radius: 2px;
    }
    .result-box {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 2px solid #16a34a;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .result-box.warning {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-color: #f59e0b;
    }
    .result-box.danger {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border-color: #ef4444;
    }
    .disease-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .confidence { font-size: 14px; color: #666; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    }
    .info-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 500; }
    .list-item {
      padding: 8px 12px;
      background: #f8fafc;
      border-left: 3px solid #16a34a;
      margin-bottom: 8px;
      border-radius: 0 8px 8px 0;
    }
    .treatment-box {
      background: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 12px;
      padding: 20px;
    }
    .solution-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
    .solution-card {
      padding: 15px;
      border-radius: 8px;
    }
    .solution-card.organic {
      background: #f0fdf4;
      border: 1px solid #22c55e;
    }
    .solution-card.chemical {
      background: #fef2f2;
      border: 1px solid #ef4444;
    }
    .solution-label { font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .stats-row { display: flex; gap: 15px; margin-top: 15px; }
    .stat-item {
      flex: 1;
      text-align: center;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .stat-value { font-size: 24px; font-weight: 700; color: #16a34a; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌿 কৃষি মিত্র - AgriBrain</div>
    <div class="subtitle">AI-চালিত ফসল রোগ নির্ণয় রিপোর্ট</div>
  </div>

  <div class="report-meta">
    <div class="meta-item">
      <div class="meta-label">তারিখ ও সময়</div>
      <div class="meta-value">${reportDate}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">ফসলের ধরন</div>
      <div class="meta-value">${diseaseData.cropType}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">AI নির্ভুলতা</div>
      <div class="meta-value">${diseaseData.confidence}%</div>
    </div>
  </div>

  <div class="result-box ${diseaseData.severity === 'critical' || diseaseData.severity === 'high' ? 'danger' : diseaseData.severity === 'medium' ? 'warning' : ''}">
    <div class="disease-name">${diseaseData.isHealthy ? '✅ সুস্থ ফসল' : '⚠️ ' + diseaseData.diseaseName}</div>
    <div class="confidence">তীব্রতা: ${severityText} | সনাক্তকরণ আত্মবিশ্বাস: ${diseaseData.confidence}%</div>
  </div>

  ${diseaseData.symptoms.length > 0 ? `
  <div class="section">
    <div class="section-title">🔍 লক্ষণসমূহ</div>
    ${diseaseData.symptoms.map(s => `<div class="list-item">${s}</div>`).join('')}
  </div>
  ` : ''}

  ${diseaseData.treatment ? `
  <div class="section">
    <div class="section-title">💊 চিকিৎসা ও প্রতিকার</div>
    <div class="treatment-box">
      <p>${diseaseData.treatment}</p>
      
      <div class="solution-grid">
        ${diseaseData.organicSolution ? `
        <div class="solution-card organic">
          <div class="solution-label">🌱 জৈব সমাধান</div>
          <p>${diseaseData.organicSolution}</p>
        </div>
        ` : ''}
        ${diseaseData.chemicalSolution ? `
        <div class="solution-card chemical">
          <div class="solution-label">🧪 রাসায়নিক সমাধান</div>
          <p>${diseaseData.chemicalSolution}</p>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">📊 সার ও সেচ পরামর্শ</div>
    <div class="info-grid">
      ${diseaseData.fertilizer ? `
      <div class="info-card">
        <div class="info-label">🌱 সার পরামর্শ</div>
        <div class="info-value">${diseaseData.fertilizer}</div>
      </div>
      ` : ''}
      ${diseaseData.irrigation ? `
      <div class="info-card">
        <div class="info-label">💧 সেচ পরামর্শ</div>
        <div class="info-value">${diseaseData.irrigation}</div>
      </div>
      ` : ''}
    </div>
  </div>

  ${diseaseData.expectedRecoveryDays > 0 || diseaseData.yieldImpact ? `
  <div class="section">
    <div class="section-title">📈 পূর্বাভাস</div>
    <div class="stats-row">
      ${diseaseData.expectedRecoveryDays > 0 ? `
      <div class="stat-item">
        <div class="stat-value">${diseaseData.expectedRecoveryDays}</div>
        <div class="stat-label">দিনে আরোগ্য সম্ভব</div>
      </div>
      ` : ''}
      ${diseaseData.yieldImpact ? `
      <div class="stat-item">
        <div class="stat-value">${diseaseData.yieldImpact}</div>
        <div class="stat-label">ফলন প্রভাব</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${diseaseData.additionalNotes ? `
  <div class="section">
    <div class="section-title">💡 অতিরিক্ত পরামর্শ</div>
    <div class="list-item">${diseaseData.additionalNotes}</div>
  </div>
  ` : ''}

  <div class="footer">
    <p>এই রিপোর্টটি Gemini Vision AI দ্বারা বিশ্লেষিত</p>
    <p>© ${new Date().getFullYear()} কৃষি মিত্র - AgriBrain | সকল অধিকার সংরক্ষিত</p>
    <p style="margin-top: 8px; font-size: 11px; color: #999;">
      এই রিপোর্টটি শুধুমাত্র তথ্যমূলক উদ্দেশ্যে। গুরুতর সমস্যার জন্য স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিন।
    </p>
  </div>
</body>
</html>
      `;

      // Create blob and download
      const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `রোগ-নির্ণয়-রিপোর্ট-${diseaseData.diseaseName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('রিপোর্ট সফলভাবে ডাউনলোড হয়েছে');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('রিপোর্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsDownloading(false);
    }
  };

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
            <button 
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-secondary/50 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 text-foreground animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-foreground" />
              )}
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
        <Button 
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className={cn(
            "w-full h-13 font-bold rounded-2xl",
            "bg-gradient-to-r from-primary to-primary/80",
            "text-primary-foreground shadow-glow",
            "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
            "transition-all duration-300"
          )}
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <FileText className="w-5 h-5 mr-2" />
          )}
          রিপোর্ট ডাউনলোড করুন
        </Button>
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
