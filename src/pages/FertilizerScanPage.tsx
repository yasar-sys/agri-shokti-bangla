import { useState, useRef } from "react";
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  Beaker,
  Leaf,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  MessageSquare,
  Info,
  Pill,
  Droplets
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface ScanResult {
  isAuthentic: boolean | null;
  authenticityConfidence: number;
  brandName: string;
  productName: string;
  manufacturer: string;
  expiryDate: string;
  isExpired: boolean | null;
  composition: string;
  recommendedDose: string;
  suitableCrops: string[];
  warnings: string[];
  fakeIndicators: string[];
  recommendation: string;
  summary: string;
}

export default function FertilizerScanPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "ফাইল অনেক বড়",
          description: "১০ MB এর কম সাইজের ছবি ব্যবহার করুন।",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFertilizer = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setProgress(0);
    setStatusText("ছবি প্রক্রিয়াকরণ হচ্ছে...");

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    const statusMessages = [
      "ছবি প্রক্রিয়াকরণ হচ্ছে...",
      "AI মডেল বিশ্লেষণ করছে...",
      "প্যাকেট তথ্য যাচাই করছে...",
      "BSTI মার্ক পরীক্ষা করছে...",
      "ফলাফল তৈরি হচ্ছে..."
    ];
    
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      setStatusText(statusMessages[statusIndex]);
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke('scan-fertilizer', {
        body: { imageBase64: imagePreview }
      });

      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setProgress(100);

      if (error) throw error;

      if (data.result) {
        setResult(data.result);
        setStatusText("বিশ্লেষণ সম্পন্ন!");
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      console.error('Analysis error:', error);
      toast({
        title: "বিশ্লেষণ ব্যর্থ",
        description: error instanceof Error ? error.message : "আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setImagePreview(null);
    setResult(null);
    setProgress(0);
    setStatusText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAuthenticityColor = () => {
    if (result?.isAuthentic === null) return "text-muted-foreground";
    if (result?.isAuthentic) return "text-secondary";
    return "text-destructive";
  };

  const getAuthenticityBg = () => {
    if (result?.isAuthentic === null) return "bg-muted/20";
    if (result?.isAuthentic) return "bg-secondary/20";
    return "bg-destructive/20";
  };

  const getAuthenticityIcon = () => {
    if (result?.isAuthentic === null) return Shield;
    if (result?.isAuthentic) return ShieldCheck;
    return ShieldAlert;
  };

  const AuthIcon = result ? getAuthenticityIcon() : Shield;

  return (
    <div 
      className="mobile-container min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(/src/assets/bangladesh-village-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-destructive/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/home" 
            className="w-12 h-12 rounded-2xl bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/30 to-red-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              সার স্ক্যানার
            </h1>
            <p className="text-sm text-muted-foreground mt-1">ভেজাল সার শনাক্তকরণ</p>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <section className="px-4 mb-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">ভেজাল সার থেকে সাবধান!</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                বাংলাদেশে প্রতি বছর হাজার হাজার কৃষক ভেজাল সারের কারণে ক্ষতিগ্রস্ত হন। স্ক্যান করে নিশ্চিত হোন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scan Area - Camera Style like Disease Detection */}
      <section className="px-4 mb-4">
        {!imagePreview ? (
          <div 
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card/80 to-card/60 border border-border backdrop-blur-sm cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Scan Frame */}
            <div className="aspect-[4/3] relative flex items-center justify-center p-8">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-secondary/60 rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-secondary/60 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-secondary/60 rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-secondary/60 rounded-br-xl" />
              
              {/* Center content */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">সারের প্যাকেট স্ক্যান করুন</h3>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                  প্যাকেটের সামনের দিকের পরিষ্কার ছবি তুলুন
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-border/50 flex gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-secondary to-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Camera className="w-5 h-5" />
                ছবি তুলুন
              </button>
              <button className="flex-1 py-3 bg-muted text-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
                <Upload className="w-5 h-5" />
                গ্যালারি
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview with frame */}
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border">
              <img 
                src={imagePreview} 
                alt="Fertilizer packet" 
                className="w-full aspect-[4/3] object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              
              {/* Reset button */}
              <button 
                onClick={resetScan}
                className="absolute top-3 right-3 p-2.5 bg-card/90 backdrop-blur-sm rounded-xl border border-border hover:bg-card transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-foreground" />
              </button>

              {/* Status indicator */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span>ছবি রেডি - বিশ্লেষণ করুন</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            {!result && (
              <div className="space-y-3">
                <button
                  onClick={analyzeFertilizer}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-secondary via-secondary to-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      AI বিশ্লেষণ করছে...
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6" />
                      সার যাচাই করুন
                    </>
                  )}
                </button>

                {/* Progress bar during analysis */}
                {isAnalyzing && (
                  <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{statusText}</span>
                      <span className="text-sm font-semibold text-secondary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Results - Disease Card Style */}
      {result && (
        <section className="px-4 space-y-4 animate-slide-up">
          {/* Main Result Card */}
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <AuthIcon className={cn("w-6 h-6", getAuthenticityColor())} />
                  {result.isAuthentic === true && "আসল সার ✓"}
                  {result.isAuthentic === false && "সন্দেহজনক/ভেজাল ⚠"}
                  {result.isAuthentic === null && "যাচাই করা যায়নি"}
                </h3>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    getAuthenticityBg(),
                    getAuthenticityColor()
                  )}
                >
                  {result.authenticityConfidence}% নিশ্চয়তা
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>AI সার যাচাইকরণ • POST /api/scan-fertilizer</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">পণ্যের তথ্য</h4>
              </div>
              <div className="space-y-2">
                {[
                  { label: "ব্র্যান্ড", value: result.brandName },
                  { label: "পণ্য", value: result.productName },
                  { label: "প্রস্তুতকারক", value: result.manufacturer },
                  { label: "উপাদান", value: result.composition },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span><span className="text-foreground font-medium">{item.label}:</span> {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry Date */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className={cn(
                  "w-5 h-5",
                  result.isExpired === true ? "text-destructive" : "text-secondary"
                )} />
                <h4 className="font-medium text-foreground">মেয়াদ</h4>
              </div>
              <p className={cn(
                "text-sm",
                result.isExpired === true ? "text-destructive" : "text-muted-foreground"
              )}>
                {result.expiryDate}
                {result.isExpired === true && " (মেয়াদ উত্তীর্ণ!)"}
                {result.isExpired === false && " (বৈধ)"}
              </p>
            </div>

            {/* Dosage */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5 text-secondary" />
                <h4 className="font-medium text-foreground">সঠিক মাত্রা</h4>
              </div>
              <p className="text-sm text-muted-foreground">{result.recommendedDose}</p>
            </div>

            {/* Suitable Crops */}
            {result.suitableCrops.length > 0 && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-medium text-foreground">উপযুক্ত ফসল</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.suitableCrops.map((crop, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fake Indicators */}
          {result.fakeIndicators.length > 0 && (
            <div className="rounded-2xl border border-destructive/30 overflow-hidden bg-destructive/10">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <h4 className="font-semibold text-destructive">ভেজাল লক্ষণ</h4>
                </div>
                <ul className="space-y-2">
                  {result.fakeIndicators.map((indicator, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-destructive mt-1">•</span>
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="rounded-2xl border border-primary/30 overflow-hidden bg-primary/10">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-primary">সতর্কতা</h4>
                </div>
                <ul className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div className="rounded-2xl border border-secondary/30 overflow-hidden bg-secondary/10">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <h4 className="font-semibold text-secondary">AI পরামর্শ</h4>
              </div>
              <p className="text-sm text-foreground">{result.recommendation}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/chat"
              className="py-3 bg-card border border-border rounded-xl font-semibold flex items-center justify-center gap-2 text-foreground hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              AI চ্যাট
            </Link>
            <button
              onClick={resetScan}
              className="py-3 bg-gradient-to-r from-secondary to-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-5 h-5" />
              নতুন স্ক্যান
            </button>
          </div>
        </section>
      )}

      {/* Tips - Only show when no result */}
      {!result && !imagePreview && (
        <section className="px-4 mt-4">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              স্ক্যান করার টিপস
            </h3>
            <div className="space-y-2">
              {[
                "প্যাকেটের সামনের দিক ভালো আলোতে ধরুন",
                "BSTI মার্ক, তারিখ ও ব্যাচ নম্বর দেখা যাক",
                "ঝাপসা বা অন্ধকার ছবি এড়িয়ে চলুন",
                "পুরো প্যাকেট ফ্রেমে রাখুন"
              ].map((tip, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights */}
      {!result && !imagePreview && (
        <section className="px-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Shield, label: "ভেজাল শনাক্ত", color: "text-destructive" },
              { icon: Calendar, label: "মেয়াদ যাচাই", color: "text-primary" },
              { icon: Leaf, label: "ফসল পরামর্শ", color: "text-secondary" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 text-center">
                <feature.icon className={cn("w-6 h-6 mx-auto mb-1", feature.color)} />
                <span className="text-xs text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}