import { 
  Scan, 
  MessageSquare, 
  TrendingUp, 
  Cloud,
  History,
  Award,
  Beaker,
  GraduationCap,
  UsersRound,
  MapPin,
  ScanSearch,
  Bug,
  LogIn,
  LogOut,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const stats = [
  { value: "০৬", label: "স্ক্যান" },
  { value: "৩ লেভেল", label: "র‍্যাংক" },
  { value: "৩২°", label: "মেঘলা", icon: Cloud },
];

const services = [
  { icon: Scan, label: "রোগ শনাক্তকরণ", to: "/camera", color: "text-secondary" },
  { icon: ScanSearch, label: "সার স্ক্যান", to: "/fertilizer-scan", color: "text-destructive" },
  { icon: Bug, label: "পোকার ম্যাপ", to: "/pest-map", color: "text-primary" },
  { icon: MessageSquare, label: "AI সহায়ক", to: "/chat", color: "text-secondary" },
  { icon: TrendingUp, label: "বাজার দর", to: "/market", color: "text-secondary" },
  { icon: Cloud, label: "আবহাওয়া", to: "/weather", color: "text-secondary" },
  { icon: History, label: "ফসল ইতিহাস", to: "/history", color: "text-secondary" },
  { icon: Award, label: "পুরস্কার", to: "/gamification", color: "text-secondary" },
  { icon: Beaker, label: "সার পরামর্শ", to: "/fertilizer", color: "text-primary" },
  { icon: GraduationCap, label: "কৃষি জ্ঞান", to: "/knowledge", color: "text-accent-foreground" },
  { icon: UsersRound, label: "কমিউনিটি", to: "/community", color: "text-muted-foreground" },
];

const marketPrices = [
  { emoji: "🌾", name: "ধান", price: "৳১,৮৫০", weeklyAvg: "৳১,৮২০", change: "+৩০", positive: true },
  { emoji: "🥔", name: "আলু", price: "৳১,৫০০", weeklyAvg: "৳১,৪৮০", change: "+২০", positive: true },
  { emoji: "🧅", name: "পেঁয়াজ", price: "৳৪,৫০০", weeklyAvg: "৳৪,৬৫০", change: "-১০০", positive: false },
];

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("লগআউট করতে সমস্যা হয়েছে");
    } else {
      toast.success("সফলভাবে লগআউট হয়েছে");
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />
      </div>

      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              সুপ্রভাত, কৃষক ভাই🌾
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              আজ আপনার ক্ষেতের সেবায় আমরা আছি
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 text-destructive" />
              <span>ময়মনসিংহ, বাংলাদেশ</span>
            </div>
          </div>
          
          {/* Login/Logout & Farmer Icon */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-4xl">👨‍🌾</div>
            {session ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-xs gap-1 bg-card/80 border-border hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="w-3 h-3" />
                লগআউট
              </Button>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs gap-1 bg-card/80 border-border hover:bg-secondary/20 hover:text-secondary hover:border-secondary/50"
                >
                  <LogIn className="w-3 h-3" />
                  লগইন
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <div className="flex items-center justify-center gap-1">
                {stat.icon && <stat.icon className="w-4 h-4 text-muted-foreground" />}
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Tip */}
      <section className="px-4 mb-4">
        <div className="bg-card border-2 border-primary/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-semibold text-primary text-sm mb-1">আজকের কৃষি টিপস</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                বৃষ্টির সম্ভাবনা ৬০%। সকালে সেচ দিন, বিকেলে কীটনাশক স্প্রে করবেন না। ধানের চারা রোপণের সেরা সময়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">সেবা সমূহ</h2>
        <div className="grid grid-cols-3 gap-2">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.to}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-card/80 hover:border-secondary/50 transition-all active:scale-95"
            >
              <service.icon className={cn("w-6 h-6", service.color)} />
              <span className="text-xs text-foreground text-center font-medium">{service.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Market Prices */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">আজকের বাজার দর</h2>
          <Link to="/market" className="text-xs text-secondary">সব দেখুন →</Link>
        </div>
        <div className="space-y-2">
          {marketPrices.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <span className="text-sm text-foreground block">{item.name}</span>
                  <span className="text-xs text-muted-foreground">সা. গড়: {item.weeklyAvg}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{item.price}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  item.positive ? "text-secondary bg-secondary/20" : "text-destructive bg-destructive/20"
                )}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Button */}
      <section className="px-4 mb-4">
        <Link to="/camera">
          <div className="bg-secondary text-secondary-foreground rounded-xl p-4 text-center font-semibold hover:bg-secondary/90 transition-colors active:scale-98">
            ক্ষেতের ছবি তুলুন, AI দেখবে
          </div>
        </Link>
      </section>

      {/* Community Banner */}
      <section className="px-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">
            🤝 আপনার গ্রামে <span className="text-secondary font-semibold">১২৫ জন</span> কৃষক AgriBrain ব্যবহার করছেন!
          </p>
        </div>
      </section>
    </div>
  );
}
