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
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    try {
      const { data, error } = await supabase.functions.invoke('scan-fertilizer', {
        body: { imageBase64: imagePreview }
      });

      if (error) throw error;

      if (data.result) {
        setResult(data.result);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAuthenticityColor = () => {
    if (result?.isAuthentic === null) return "text-muted-foreground";
    if (result?.isAuthentic) return "text-secondary";
    return "text-destructive";
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
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">সার স্ক্যানার</h1>
            <p className="text-sm text-muted-foreground">ভেজাল সার শনাক্তকরণ</p>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <section className="px-4 mb-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">ভেজাল সার থেকে সাবধান!</p>
              <p className="text-xs text-muted-foreground mt-1">
                বাংলাদেশে প্রতি বছর হাজার হাজার কৃষক ভেজাল সারের কারণে ক্ষতিগ্রস্ত হন। স্ক্যান করে নিশ্চিত হোন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scan Area */}
      <section className="px-4 mb-4">
        {!imagePreview ? (
          <div 
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-card cursor-pointer hover:border-secondary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">সারের প্যাকেট স্ক্যান করুন</h3>
            <p className="text-sm text-muted-foreground mb-4">
              প্যাকেটের সামনের দিকের পরিষ্কার ছবি তুলুন
            </p>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                ছবি তুলুন
              </button>
              <button className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                আপলোড
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
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
              <img 
                src={imagePreview} 
                alt="Fertilizer packet" 
                className="w-full h-48 object-cover"
              />
              <button 
                onClick={resetScan}
                className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background"
              >
                <RefreshCw className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Analyze Button */}
            {!result && (
              <button
                onClick={analyzeFertilizer}
                disabled={isAnalyzing}
                className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI বিশ্লেষণ করছে...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    বিশ্লেষণ করুন
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      {result && (
        <section className="px-4 space-y-4">
          {/* Authenticity Card */}
          <div className={cn(
            "rounded-2xl p-4 border-2",
            result.isAuthentic === true && "bg-secondary/10 border-secondary",
            result.isAuthentic === false && "bg-destructive/10 border-destructive",
            result.isAuthentic === null && "bg-muted border-border"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                result.isAuthentic === true && "bg-secondary/20",
                result.isAuthentic === false && "bg-destructive/20",
                result.isAuthentic === null && "bg-muted"
              )}>
                <AuthIcon className={cn("w-6 h-6", getAuthenticityColor())} />
              </div>
              <div>
                <h3 className={cn("text-lg font-bold", getAuthenticityColor())}>
                  {result.isAuthentic === true && "আসল সার ✓"}
                  {result.isAuthentic === false && "সন্দেহজনক/ভেজাল ⚠"}
                  {result.isAuthentic === null && "যাচাই করা যায়নি"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  বিশ্বাসযোগ্যতা: {result.authenticityConfidence}%
                </p>
              </div>
            </div>
            
            {/* Confidence Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  result.isAuthentic === true && "bg-secondary",
                  result.isAuthentic === false && "bg-destructive",
                  result.isAuthentic === null && "bg-muted-foreground"
                )}
                style={{ width: `${result.authenticityConfidence}%` }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h4 className="font-semibold text-foreground mb-3">পণ্যের তথ্য</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ব্র্যান্ড</span>
                <span className="text-sm font-medium text-foreground">{result.brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">পণ্য</span>
                <span className="text-sm font-medium text-foreground">{result.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">প্রস্তুতকারক</span>
                <span className="text-sm font-medium text-foreground">{result.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">উপাদান</span>
                <span className="text-sm font-medium text-foreground">{result.composition}</span>
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className={cn(
            "rounded-2xl p-4 border",
            result.isExpired === true && "bg-destructive/10 border-destructive",
            result.isExpired === false && "bg-secondary/10 border-secondary",
            result.isExpired === null && "bg-card border-border"
          )}>
            <div className="flex items-center gap-3">
              <Calendar className={cn(
                "w-6 h-6",
                result.isExpired === true && "text-destructive",
                result.isExpired === false && "text-secondary",
                result.isExpired === null && "text-muted-foreground"
              )} />
              <div>
                <p className="text-sm text-muted-foreground">মেয়াদ</p>
                <p className={cn(
                  "font-semibold",
                  result.isExpired === true && "text-destructive",
                  result.isExpired === false && "text-foreground",
                  result.isExpired === null && "text-muted-foreground"
                )}>
                  {result.expiryDate}
                  {result.isExpired === true && " (মেয়াদ উত্তীর্ণ!)"}
                  {result.isExpired === false && " (বৈধ)"}
                </p>
              </div>
            </div>
          </div>

          {/* Dosage */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">সঠিক মাত্রা</h4>
            </div>
            <p className="text-sm text-muted-foreground">{result.recommendedDose}</p>
          </div>

          {/* Suitable Crops */}
          {result.suitableCrops.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-secondary" />
                <h4 className="font-semibold text-foreground">উপযুক্ত ফসল</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.suitableCrops.map((crop, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fake Indicators */}
          {result.fakeIndicators.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4">
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
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
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
          )}

          {/* AI Recommendation */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <h4 className="font-semibold text-secondary">AI পরামর্শ</h4>
            </div>
            <p className="text-sm text-foreground">{result.recommendation}</p>
          </div>

          {/* Scan Again Button */}
          <button
            onClick={resetScan}
            className="w-full py-3 bg-muted text-foreground rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            আবার স্ক্যান করুন
          </button>
        </section>
      )}

      {/* Tips */}
      {!result && (
        <section className="px-4 mt-4">
          <h3 className="font-semibold text-foreground mb-3">স্ক্যান করার টিপস</h3>
          <div className="space-y-2">
            {[
              "প্যাকেটের সামনের দিক ভালো আলোতে ধরুন",
              "BSTI মার্ক, তারিখ ও ব্যাচ নম্বর দেখা যাক",
              "ঝাপসা বা অন্ধকার ছবি এড়িয়ে চলুন",
              "পুরো প্যাকেট ফ্রেমে রাখুন"
            ].map((tip, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-secondary" />
                {tip}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
