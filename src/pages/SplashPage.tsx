import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriLogo from "@/assets/agri-brain-logo.png";
import { Leaf, Sprout, Sun, Droplets } from "lucide-react";

export default function SplashPage() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showMotto, setShowMotto] = useState(false);

  useEffect(() => {
    // Staggered animations
    const taglineTimer = setTimeout(() => setShowTagline(true), 500);
    const mottoTimer = setTimeout(() => setShowMotto(true), 1000);
    
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => navigate("/home"), 500);
    }, 3000);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(mottoTimer);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: `url(${villageBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background animate-pulse" 
           style={{ animationDuration: '4s' }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          >
            {i % 4 === 0 && <Leaf className="w-6 h-6 text-secondary/30" />}
            {i % 4 === 1 && <Sprout className="w-5 h-5 text-primary/30" />}
            {i % 4 === 2 && <Sun className="w-4 h-4 text-chart-2/30" />}
            {i % 4 === 3 && <Droplets className="w-5 h-5 text-chart-3/30" />}
          </div>
        ))}
      </div>

      {/* Radial glow behind logo */}
      <div className="absolute w-64 h-64 rounded-full bg-secondary/20 blur-3xl animate-pulse" />

      {/* Logo and content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo with glow effect */}
        <div className="relative animate-scale-in">
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-32 h-32 rounded-2xl bg-gradient-to-br from-secondary to-primary blur-xl opacity-60 animate-pulse" />
          
          {/* Logo container */}
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-secondary/50 transform hover:scale-105 transition-transform">
            <img 
              src={agriLogo} 
              alt="agriশক্তি Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Decorative corner elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-secondary rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-secondary rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-secondary rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-secondary rounded-br-lg" />
        </div>

        {/* App name with gradient */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-chart-2 bg-clip-text text-transparent animate-slide-up">
            agriশক্তি
          </h1>
          
          {/* Tagline */}
          <p 
            className={`text-sm text-secondary mt-2 transition-all duration-700 ${
              showTagline ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            বাংলার কৃষকের AI সহকারী
          </p>
        </div>

        {/* Motto with staggered animation */}
        <div 
          className={`text-center max-w-xs transition-all duration-700 ${
            showMotto ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-card/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              🌾 মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি 🌾
            </p>
          </div>
        </div>
      </div>

      {/* Loading indicator - animated crops */}
      <div className="relative z-10 mt-12 flex items-center gap-3">
        {["🌱", "🌿", "🌾"].map((emoji, i) => (
          <div
            key={i}
            className="text-2xl animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-6 w-48 h-1 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full animate-progress"
          style={{
            animation: "progress 2.5s ease-out forwards"
          }}
        />
      </div>

      {/* Footer credit */}
      <div className="absolute bottom-8 text-center z-10">
        <div className="bg-card/30 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30">
          <p className="text-xs text-muted-foreground">
            Created by <span className="text-secondary font-medium">TEAM_NEWBIES</span>
          </p>
        </div>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.6; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}