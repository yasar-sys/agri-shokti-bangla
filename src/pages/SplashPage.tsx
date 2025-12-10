import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AgriBrainLogo } from "@/components/ui/AgriBrainLogo";

export default function SplashPage() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => navigate("/home"), 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Logo and branding */}
      <div className="relative z-10 animate-scale-in">
        <AgriBrainLogo size="xl" showTagline />
      </div>

      {/* Loading indicator */}
      <div className="relative z-10 mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-secondary animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* Footer credit */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "1s" }}>
          Designed by Samin Yasar Sunny
        </p>
      </div>
    </div>
  );
}
