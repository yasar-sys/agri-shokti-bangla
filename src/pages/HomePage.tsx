import { 
  Scan, 
  Bug, 
  Cloud, 
  ShoppingCart, 
  Droplets, 
  MapPin,
  Camera,
  Sparkles
} from "lucide-react";
import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { ApiStatusIndicator } from "@/components/ui/ApiStatusIndicator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              আসসালামু আলাইকুম,
            </h1>
            <p className="text-lg text-primary font-medium">কৃষক ভাই! 🌾</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ApiStatusIndicator status="connected" label="API সংযুক্ত" />
            <ApiStatusIndicator status="connected" label="LLM রেডি" />
          </div>
        </div>

        {/* Weather Widget */}
        <WeatherWidget className="animate-slide-up" />
      </header>

      {/* Features Grid */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">কী করতে চান?</h2>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={Scan}
            title="ফসল চেনা"
            description="ছবি তুলে ফসল শনাক্ত করুন"
            to="/camera"
            variant="gold"
            delay={100}
          />
          <FeatureCard
            icon={Bug}
            title="রোগ নির্ণয়"
            description="AI দিয়ে রোগ খুঁজে বের করুন"
            to="/diagnosis"
            variant="mint"
            delay={200}
          />
          <FeatureCard
            icon={Cloud}
            title="আবহাওয়া"
            description="আজকের আবহাওয়া দেখুন"
            to="/weather"
            delay={300}
          />
          <FeatureCard
            icon={ShoppingCart}
            title="বাজারদর"
            description="লাইভ ফসলের দাম"
            to="/market"
            delay={400}
          />
          <FeatureCard
            icon={Droplets}
            title="সার ও সেচ"
            description="পরামর্শ নিন AI থেকে"
            to="/chat"
            delay={500}
          />
          <FeatureCard
            icon={MapPin}
            title="জমির রিপোর্ট"
            description="মানচিত্রে দেখুন"
            to="/map"
            delay={600}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <Link to="/camera">
          <div className="relative overflow-hidden rounded-2xl p-6 gradient-gold glow-gold animate-slide-up" style={{ animationDelay: "700ms" }}>
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
              <Sparkles className="w-full h-full" />
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-primary-foreground">
                  ক্ষেতের ছবি তুলুন
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  AI দেখবে এবং পরামর্শ দেবে
                </p>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
            >
              স্ক্যান শুরু করুন
            </Button>
          </div>
        </Link>
      </section>

      {/* API Status Footer */}
      <section className="px-4 mt-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">সক্রিয় API সার্ভিস</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>POST /api/ai/chat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>POST /api/vision/detect</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>GET /api/weather</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>GET /api/market-prices</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
