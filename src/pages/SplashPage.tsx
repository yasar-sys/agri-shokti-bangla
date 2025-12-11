import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function SplashPage() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => navigate("/home"), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex items-center justify-center">
          <Leaf className="w-10 h-10 text-secondary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AgriBrain</h1>
          <p className="text-sm text-primary mt-1">বাংলার কৃষকের AI সহকারী</p>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-secondary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      {/* Footer credit */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-muted-foreground">
          Designed by Samin Yasar Sunny
        </p>
      </div>
    </div>
  );
}
