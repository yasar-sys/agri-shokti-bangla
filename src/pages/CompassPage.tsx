import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Navigation, MapPin, Compass as CompassIcon, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocation";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

// Bengali direction names
const directions: Record<string, { bn: string; en: string; degree: number }> = {
  N: { bn: "উত্তর", en: "North", degree: 0 },
  NE: { bn: "উত্তর-পূর্ব", en: "Northeast", degree: 45 },
  E: { bn: "পূর্ব", en: "East", degree: 90 },
  SE: { bn: "দক্ষিণ-পূর্ব", en: "Southeast", degree: 135 },
  S: { bn: "দক্ষিণ", en: "South", degree: 180 },
  SW: { bn: "দক্ষিণ-পশ্চিম", en: "Southwest", degree: 225 },
  W: { bn: "পশ্চিম", en: "West", degree: 270 },
  NW: { bn: "উত্তর-পশ্চিম", en: "Northwest", degree: 315 },
};

const getDirection = (degree: number): string => {
  const normalized = ((degree % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return "N";
  if (normalized >= 22.5 && normalized < 67.5) return "NE";
  if (normalized >= 67.5 && normalized < 112.5) return "E";
  if (normalized >= 112.5 && normalized < 157.5) return "SE";
  if (normalized >= 157.5 && normalized < 202.5) return "S";
  if (normalized >= 202.5 && normalized < 247.5) return "SW";
  if (normalized >= 247.5 && normalized < 292.5) return "W";
  return "NW";
};

const toBengaliNumeral = (num: number): string => {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return Math.round(num).toString().split('').map(d => bengaliNumerals[parseInt(d)] || d).join('');
};

export default function CompassPage() {
  const [heading, setHeading] = useState<number>(0);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if device orientation is supported
    if (!window.DeviceOrientationEvent) {
      setIsSupported(false);
      return;
    }

    // For iOS 13+ we need to request permission
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            setPermissionGranted(true);
            startCompass();
          } else {
            toast.error("কম্পাস অনুমতি প্রয়োজন");
          }
        } catch (error) {
          console.error("Permission error:", error);
        }
      } else {
        // For Android and other browsers
        setPermissionGranted(true);
        startCompass();
      }
    };

    const startCompass = () => {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
        if (webkitEvent.webkitCompassHeading !== undefined) {
          // iOS
          setHeading(webkitEvent.webkitCompassHeading);
        } else if (event.alpha !== null) {
          // Android
          setHeading(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    };

    // Start compass on mount
    requestPermission();

    // Simulate compass for demo if not on mobile
    if (!('DeviceOrientationEvent' in window) || window.innerWidth > 768) {
      setPermissionGranted(true);
      const interval = setInterval(() => {
        setHeading(prev => (prev + 0.5) % 360);
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const currentDirection = getDirection(heading);
  const directionInfo = directions[currentDirection];

  const handleRequestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.location.reload();
        }
      } catch (error) {
        toast.error("কম্পাস অ্যাক্সেস দিতে পারছি না");
      }
    }
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${villageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="glass-card border border-border/30">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gradient-premium">কম্পাস</h1>
            <p className="text-xs text-muted-foreground mt-0.5">দিক নির্ণয়</p>
          </div>
          <Button variant="ghost" size="icon" className="glass-card border border-border/30">
            <Target className="w-5 h-5" />
          </Button>
        </div>

        {/* Location Info */}
        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {location.loading ? "খুঁজছি..." : location.city}
                </p>
                <p className="text-xs text-muted-foreground">{location.country}</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{location.latitude?.toFixed(4)}°N</p>
              <p>{location.longitude?.toFixed(4)}°E</p>
            </div>
          </div>
        </div>
      </header>

      {/* Compass Display */}
      <section className="px-5 py-8 flex flex-col items-center">
        {!isSupported ? (
          <div className="glass-card rounded-2xl p-6 border border-border/30 text-center">
            <CompassIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">আপনার ডিভাইস কম্পাস সাপোর্ট করে না</p>
          </div>
        ) : !permissionGranted ? (
          <div className="glass-card rounded-2xl p-6 border border-border/30 text-center">
            <CompassIcon className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground mb-4">কম্পাস ব্যবহার করতে অনুমতি দিন</p>
            <Button 
              onClick={handleRequestPermission}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              অনুমতি দিন
            </Button>
          </div>
        ) : (
          <>
            {/* Direction Display */}
            <div className="text-center mb-8">
              <p className="text-6xl font-bold text-gradient-premium mb-2">
                {directionInfo.bn}
              </p>
              <p className="text-xl text-muted-foreground">{directionInfo.en}</p>
              <p className="text-2xl font-mono text-primary mt-2">
                {toBengaliNumeral(heading)}°
              </p>
            </div>

            {/* Compass Rose */}
            <div className="relative w-72 h-72">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full glass-card border-2 border-primary/30 shadow-glow" />
              
              {/* Degree markers */}
              <div 
                className="absolute inset-4 rounded-full"
                style={{ transform: `rotate(${-heading}deg)`, transition: 'transform 0.1s ease-out' }}
              >
                {/* Cardinal directions */}
                {Object.entries(directions).map(([key, dir]) => (
                  <div
                    key={key}
                    className="absolute w-full h-full flex items-start justify-center"
                    style={{ transform: `rotate(${dir.degree}deg)` }}
                  >
                    <div className="flex flex-col items-center pt-2">
                      <div className={`w-0.5 h-4 ${key.length === 1 ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                      <span className={`text-sm font-bold mt-1 ${key.length === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                        style={{ transform: `rotate(${heading - dir.degree}deg)` }}
                      >
                        {key.length === 1 ? dir.bn.charAt(0) : ''}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Degree tick marks */}
                {Array.from({ length: 72 }).map((_, i) => {
                  const deg = i * 5;
                  const isCardinal = deg % 90 === 0;
                  const isIntercardinal = deg % 45 === 0;
                  return (
                    <div
                      key={i}
                      className="absolute w-full h-full flex items-start justify-center"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div className={`w-0.5 ${
                        isCardinal ? 'h-3 bg-primary' : 
                        isIntercardinal ? 'h-2 bg-secondary' : 
                        'h-1 bg-muted-foreground/30'
                      }`} />
                    </div>
                  );
                })}
              </div>

              {/* Center compass needle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  {/* North pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-12 flex flex-col items-center">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-[24px] border-l-transparent border-r-transparent border-b-red-500" />
                    <div className="w-2 h-4 bg-red-500" />
                  </div>
                  {/* South pointer */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-12 flex flex-col items-center rotate-180">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-[24px] border-l-transparent border-r-transparent border-b-muted-foreground" />
                    <div className="w-2 h-4 bg-muted-foreground" />
                  </div>
                  {/* Center dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary shadow-glow" />
                  </div>
                </div>
              </div>
            </div>

            {/* Heading Info */}
            <div className="mt-8 glass-card rounded-2xl p-4 border border-border/30 w-full max-w-xs">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">হেডিং</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {toBengaliNumeral(heading)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">দিক</p>
                  <p className="text-2xl font-bold text-gradient-premium">
                    {currentDirection}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Direction Guide */}
      <section className="px-5">
        <h3 className="text-lg font-bold text-foreground mb-3">দিক নির্দেশিকা</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(directions).map(([key, dir]) => (
            <div
              key={key}
              className={`glass-card rounded-xl p-3 border text-center transition-all ${
                currentDirection === key 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-border/30'
              }`}
            >
              <p className="font-bold text-foreground">{key}</p>
              <p className="text-xs text-muted-foreground">{dir.bn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="px-5 mt-6">
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl shrink-0">
              💡
            </div>
            <div>
              <h4 className="font-semibold text-amber-400 mb-1">টিপস</h4>
              <p className="text-sm text-muted-foreground">
                সঠিক দিক পেতে আপনার ফোনটি সমতল রাখুন এবং মেটালের কাছ থেকে দূরে রাখুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
