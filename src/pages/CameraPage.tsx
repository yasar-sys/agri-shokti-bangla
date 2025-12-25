import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles, ArrowLeft, Zap, Leaf, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CameraPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error(t('imageSizeError'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setStatusText(t('processingImage'));

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    try {
      setStatusText(t('aiAnalyzing'));
      
      const { data, error } = await supabase.functions.invoke('detect-disease', {
        body: { imageBase64: capturedImage }
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Disease detection error:', error);
        toast.error(t('analysisError'));
        setIsAnalyzing(false);
        setProgress(0);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsAnalyzing(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      setStatusText(t('analysisComplete'));

      sessionStorage.setItem('diseaseResult', JSON.stringify(data.result));
      sessionStorage.setItem('scannedImage', capturedImage);
      
      setTimeout(() => {
        navigate("/diagnosis");
      }, 500);

    } catch (err) {
      console.error('Analysis error:', err);
      clearInterval(progressInterval);
      toast.error(t('serverError'));
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    setProgress(0);
    setStatusText("");
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden bg-background">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative px-5 pt-6 pb-5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-secondary/50 transition-all shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-gradient-premium">{t('aiScanner')}</span>
              <Zap className="w-5 h-5 text-primary animate-pulse" />
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('uploadOrTakePhoto')}</p>
          </div>
        </div>
      </header>

      {/* Camera/Upload Area */}
      <section className="px-5">
        {!capturedImage ? (
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed border-border/50 glass-card">
            {/* Animated border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-secondary/20 animate-pulse" />
            
            {/* Camera viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full aspect-square max-w-[280px]">
                {/* Corner brackets with glow */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-secondary rounded-tl-2xl shadow-glow" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-secondary rounded-tr-2xl shadow-glow" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-secondary rounded-bl-2xl shadow-glow" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-secondary rounded-br-2xl shadow-glow" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-4 shadow-soft animate-bounce-subtle">
                    <Camera className="w-10 h-10 text-secondary" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t('takeClearPhoto')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-border/50 shadow-elevated">
            <img
              src={capturedImage}
              alt="Captured crop"
              className="w-full h-full object-cover"
            />
            
            {/* Clear button */}
            <button
              onClick={clearImage}
              disabled={isAnalyzing}
              className="absolute top-4 right-4 w-12 h-12 rounded-2xl glass-strong flex items-center justify-center disabled:opacity-50 hover:bg-destructive/20 transition-colors"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Analysis overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 glass-strong flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-secondary" />
                </div>
                <p className="text-foreground font-semibold mt-6 text-lg">{statusText}</p>
                <div className="w-56 h-2 bg-muted/50 rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Gemini Vision AI
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-3 text-center border border-border/30">
            <Leaf className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">{t('diseases100')}</p>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center border border-border/30">
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">{t('accuracy95')}</p>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center border border-border/30">
            <Shield className="w-5 h-5 text-chart-3 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">{t('withTreatment')}</p>
          </div>
        </div>
      </section>

      {/* Tip */}
      <section className="px-5 mt-5">
        <div className="glass-card p-4 rounded-2xl border border-secondary/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium mb-1">{t('aiTip')}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('aiTipText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-5 mt-6 space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {!capturedImage ? (
          <>
            <Button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "environment");
                  fileInputRef.current.click();
                }
              }}
              className={cn(
                "w-full h-14 text-base font-bold rounded-2xl",
                "bg-gradient-to-r from-primary to-primary/80",
                "text-primary-foreground shadow-glow-gold",
                "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                "transition-all duration-300"
              )}
            >
              <Camera className="w-6 h-6 mr-3" />
              {t('takePhotoWithCamera')}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute("capture");
                  fileInputRef.current.click();
                }
              }}
              className={cn(
                "w-full h-14 text-base font-semibold rounded-2xl",
                "glass-card border-border/50 text-foreground",
                "hover:bg-muted/50 hover:border-secondary/50",
                "transition-all duration-300"
              )}
            >
              <Upload className="w-6 h-6 mr-3" />
              {t('uploadFromGallery')}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={cn(
              "w-full h-14 text-base font-bold rounded-2xl",
              "bg-gradient-to-r from-secondary to-secondary/80",
              "text-secondary-foreground shadow-glow",
              "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
              "transition-all duration-300",
              "disabled:opacity-50 disabled:hover:scale-100"
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 mr-3" />
            )}
            {isAnalyzing ? t('analyzing') : t('analyzeWithAI')}
          </Button>
        )}
      </section>
    </div>
  );
}
