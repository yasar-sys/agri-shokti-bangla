import { useState, useRef } from "react";
import { Camera, Upload, Image, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CameraPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setProgress(0);

    // Simulate API call progress: POST /api/vision/detect-disease
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate("/diagnosis"), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const clearImage = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    setProgress(0);
  };

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
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">ফসল স্ক্যান</h1>
        <p className="text-muted-foreground mt-1">ছবি তুলুন বা আপলোড করুন</p>
      </header>

      {/* Camera/Upload Area */}
      <section className="px-4">
        {!capturedImage ? (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-border bg-card/50">
            {/* Camera viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 aspect-square">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-secondary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-secondary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary rounded-br-lg" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">
                    ক্যামেরা দিয়ে ছবি তুলুন অথবা গ্যালারি থেকে আপলোড করুন
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border">
            <img
              src={capturedImage}
              alt="Captured crop"
              className="w-full h-full object-cover"
            />
            
            {/* Clear button */}
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            {/* Analysis overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
                <p className="text-foreground font-medium mb-2">AI বিশ্লেষণ করছে...</p>
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  POST /api/vision/detect-disease
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tip */}
      <section className="px-4 mt-4">
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">টিপ:</strong> পাতার পরিষ্কার ছবি তুলুন। 
              ভালো আলোতে তোলা ছবি AI সঠিকভাবে বিশ্লেষণ করতে পারে।
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-4 mt-6 space-y-3">
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
              className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Camera className="w-6 h-6 mr-3" />
              ক্যামেরা দিয়ে ছবি তুলুন
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute("capture");
                  fileInputRef.current.click();
                }
              }}
              className="w-full h-14 text-lg font-semibold border-border text-foreground hover:bg-muted"
            >
              <Upload className="w-6 h-6 mr-3" />
              গ্যালারি থেকে আপলোড
            </Button>
          </>
        ) : (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full h-14 text-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-mint"
          >
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 mr-3" />
            )}
            {isAnalyzing ? "বিশ্লেষণ হচ্ছে..." : "AI দিয়ে বিশ্লেষণ করুন"}
          </Button>
        )}
      </section>
    </div>
  );
}
