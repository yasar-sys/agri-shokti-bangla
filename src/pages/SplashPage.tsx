import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriLogo from "@/assets/agri-brain-logo.png";

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.85), rgba(10, 31, 23, 0.95)), url(${villageBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl">
          <img src={agriLogo} alt="agriশক্তি Logo" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">agriশক্তি</h1>
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
