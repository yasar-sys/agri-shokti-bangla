import { cn } from "@/lib/utils";

interface AgriBrainLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export function AgriBrainLogo({ className, size = "md", showTagline = false }: AgriBrainLogoProps) {
  const sizes = {
    sm: { logo: 40, text: "text-lg", tagline: "text-xs" },
    md: { logo: 60, text: "text-2xl", tagline: "text-sm" },
    lg: { logo: 80, text: "text-3xl", tagline: "text-base" },
    xl: { logo: 120, text: "text-4xl", tagline: "text-lg" },
  };

  const { logo, text, tagline } = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* AI Neural Leaf Logo */}
      <div className="relative animate-float">
        <svg
          width={logo}
          height={logo}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Outer glow */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7BF2A0" />
              <stop offset="100%" stopColor="#2D8B5A" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F2C94C" />
              <stop offset="100%" stopColor="#D4A84B" />
            </linearGradient>
          </defs>

          {/* Main leaf shape */}
          <path
            d="M60 10C35 25 20 50 25 80C30 95 45 105 60 110C75 105 90 95 95 80C100 50 85 25 60 10Z"
            fill="url(#leafGradient)"
            filter="url(#glow)"
          />

          {/* Leaf vein/stem */}
          <path
            d="M60 25V95"
            stroke="#0A1F17"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M60 40L45 55M60 55L75 70M60 70L40 85"
            stroke="#0A1F17"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Neural network dots */}
          <circle cx="60" cy="30" r="4" fill="url(#goldGradient)" className="animate-pulse-glow" />
          <circle cx="45" cy="50" r="3" fill="url(#goldGradient)" className="animate-pulse-glow" style={{ animationDelay: "0.2s" }} />
          <circle cx="75" cy="50" r="3" fill="url(#goldGradient)" className="animate-pulse-glow" style={{ animationDelay: "0.4s" }} />
          <circle cx="40" cy="70" r="3" fill="url(#goldGradient)" className="animate-pulse-glow" style={{ animationDelay: "0.6s" }} />
          <circle cx="80" cy="70" r="3" fill="url(#goldGradient)" className="animate-pulse-glow" style={{ animationDelay: "0.8s" }} />
          <circle cx="60" cy="90" r="4" fill="url(#goldGradient)" className="animate-pulse-glow" style={{ animationDelay: "1s" }} />

          {/* Neural connections */}
          <path
            d="M60 30L45 50M60 30L75 50M45 50L40 70M75 50L80 70M40 70L60 90M80 70L60 90"
            stroke="#F2C94C"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* App Name */}
      <h1 className={cn("font-bold text-primary tracking-tight", text)}>
        agriশক্তি
      </h1>

      {/* Tagline */}
      {showTagline && (
        <p className={cn("text-muted-foreground font-medium", tagline)}>
          বাংলার কৃষকের AI সহকারী
        </p>
      )}
    </div>
  );
}
