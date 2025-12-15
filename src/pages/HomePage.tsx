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
  User,
  Settings,
  Satellite,
  Calendar,
  Tractor,
  Calculator,
  CloudLightning,
  ChevronDown,
  Landmark,
  Loader2,
  Warehouse,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriBrainLogo from "@/assets/agri-brain-logo.png";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const services = [
  { icon: Scan, label: "রোগ শনাক্তকরণ", to: "/camera", color: "text-secondary", description: "ফসলের রোগ চিনুন" },
  { icon: ScanSearch, label: "সার স্ক্যান", to: "/fertilizer-scan", color: "text-destructive", description: "সার যাচাই করুন" },
  { icon: Bug, label: "পোকার ম্যাপ", to: "/pest-map", color: "text-primary", description: "এলাকার পোকা দেখুন" },
  { icon: MessageSquare, label: "AI সহায়ক", to: "/chat", color: "text-secondary", description: "কৃষি পরামর্শ নিন" },
  { icon: TrendingUp, label: "বাজার দর", to: "/market", color: "text-chart-2", description: "বাজার মূল্য দেখুন" },
  { icon: Cloud, label: "আবহাওয়া", to: "/weather", color: "text-chart-3", description: "আবহাওয়া পূর্বাভাস" },
  { icon: Satellite, label: "স্যাটেলাইট ভিশন", to: "/satellite", color: "text-chart-4", description: "NDVI ম্যাপ দেখুন" },
  { icon: Calendar, label: "ফার্মিং ক্যালেন্ডার", to: "/calendar", color: "text-chart-5", description: "কাজের সময়সূচী" },
  { icon: Tractor, label: "যন্ত্র অপ্টিমাইজার", to: "/machine", color: "text-chart-1", description: "ট্রাক্টর/টিলার গাইড" },
  { icon: Calculator, label: "সার ক্যালকুলেটর", to: "/npk-calculator", color: "text-primary", description: "NPK ডোজ হিসাব" },
  { icon: CloudLightning, label: "জলবায়ু সতর্কতা", to: "/climate-alert", color: "text-destructive", description: "দুর্যোগ সতর্কতা" },
  { icon: Landmark, label: "সরকারি সেবা", to: "/gov-services", color: "text-chart-3", description: "ভর্তুকি ও ঋণ" },
  { icon: Warehouse, label: "গুদাম ব্যবস্থাপনা", to: "/storage", color: "text-chart-4", description: "ফসল সংরক্ষণ" },
  { icon: History, label: "ফসল ইতিহাস", to: "/history", color: "text-muted-foreground", description: "আগের স্ক্যান দেখুন" },
  { icon: Award, label: "পুরস্কার", to: "/gamification", color: "text-primary", description: "ব্যাজ ও পয়েন্ট" },
  { icon: Beaker, label: "সার পরামর্শ", to: "/fertilizer", color: "text-secondary", description: "সার সুপারিশ" },
  { icon: GraduationCap, label: "কৃষি জ্ঞান", to: "/knowledge", color: "text-accent-foreground", description: "শিখুন ও জানুন" },
  { icon: UsersRound, label: "কমিউনিটি", to: "/community", color: "text-muted-foreground", description: "কৃষক সংঘ" },
];

const marketPrices = [
  { emoji: "🌾", name: "ধান", price: "৳১,৮৫০", weeklyAvg: "৳১,৮২০", change: "+৩০", positive: true },
  { emoji: "🥔", name: "আলু", price: "৳১,৫০০", weeklyAvg: "৳১,৪৮০", change: "+২০", positive: true },
  { emoji: "🧅", name: "পেঁয়াজ", price: "৳৪,৫০০", weeklyAvg: "৳৪,৬৫০", change: "-১০০", positive: false },
];

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  total_scans: number;
  xp_points: number;
  rank: string;
}

const SERVICES_PER_PAGE = 6;

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const location = useLocation();
  const weather = useWeather(location.latitude, location.longitude);

  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const currentServices = services.slice(
    currentPage * SERVICES_PER_PAGE,
    (currentPage + 1) * SERVICES_PER_PAGE
  );

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

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, total_scans, xp_points, rank')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("লগআউট করতে সমস্যা হয়েছে");
    } else {
      toast.success("সফলভাবে লগআউট হয়েছে");
    }
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getUserLevel = () => {
    if (!profile) return 1;
    return Math.floor(profile.xp_points / 100) + 1;
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

      {/* Professional Header */}
      <header className="relative overflow-hidden">
        {/* Header Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-md" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        
        <div className="relative px-4 pt-6 pb-5">
          <div className="flex items-start justify-between">
            {/* Left Side - Logo & Greeting */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={agriBrainLogo} 
                  alt="agriশক্তি Logo" 
                  className="w-12 h-12 object-contain rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-1">
                  agriশক্তি
                  <span className="text-xs font-normal bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full ml-1">বেটা</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  "মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি"
                </p>
              </div>
            </div>
            
            {/* Right Side - User Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative group focus:outline-none">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-primary/20 group-hover:border-secondary/50 transition-all shadow-lg group-hover:shadow-secondary/20 overflow-hidden">
                    {session && profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👨‍🌾</span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-card rounded-full border border-border flex items-center justify-center shadow-sm group-hover:bg-secondary/20 transition-colors">
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {session && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-card animate-pulse" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                {session ? (
                  <>
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">লগইন করা আছে</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile?.full_name || session.user.email?.split('@')[0]}
                      </p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer gap-2">
                        <User className="w-4 h-4" />
                        <span>প্রোফাইল</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer gap-2">
                        <Settings className="w-4 h-4" />
                        <span>সেটিংস</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">স্বাগতম!</p>
                      <p className="text-sm font-medium text-foreground">অ্যাকাউন্ট তৈরি করুন</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="cursor-pointer gap-2">
                        <LogIn className="w-4 h-4" />
                        <span>লগইন / রেজিস্টার</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer gap-2">
                        <Settings className="w-4 h-4" />
                        <span>সেটিংস</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Location & Weather Bar */}
          <div className="mt-4 flex items-center justify-between bg-card/50 rounded-xl px-3 py-2 border border-border/50">
            <div className="flex items-center gap-2">
              {location.loading ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm text-foreground">
                {location.loading ? 'লোকেশন খুঁজছি...' : `${location.city}, ${location.country}`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {weather.loading ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <span className="text-base">{weather.icon}</span>
                  <span className="text-foreground font-medium">{weather.temp}°C</span>
                  <span className="text-muted-foreground text-xs">{weather.conditionBn}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row - Real Data */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <span className="text-lg font-bold text-foreground">
              {profile ? String(profile.total_scans).padStart(2, '০') : '০০'}
            </span>
            <p className="text-xs text-muted-foreground mt-1">স্ক্যান</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <span className="text-lg font-bold text-foreground">{getUserLevel()} লেভেল</span>
            <p className="text-xs text-muted-foreground mt-1">র‍্যাংক</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-base">{weather.icon}</span>
              <span className="text-lg font-bold text-foreground">{weather.temp}°</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{weather.conditionBn}</p>
          </div>
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

      {/* Services Carousel */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">সেবা সমূহ</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentPage + 1}/{totalPages}
            </span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={prevPage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={nextPage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 transition-all duration-300">
          {currentServices.map((service, index) => (
            <Link
              key={service.to}
              to={service.to}
              className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-card/80 hover:border-secondary/50 transition-all active:scale-95 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10")}>
                <service.icon className={cn("w-5 h-5", service.color)} />
              </div>
              <span className="text-xs text-foreground text-center font-medium leading-tight">{service.label}</span>
            </Link>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentPage ? "bg-secondary w-4" : "bg-muted-foreground/30"
              )}
            />
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
          <div className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-xl p-4 text-center font-semibold hover:from-secondary/90 hover:to-secondary/70 transition-all active:scale-98 shadow-lg shadow-secondary/20">
            <div className="flex items-center justify-center gap-2">
              <Scan className="w-5 h-5" />
              <span>ক্ষেতের ছবি তুলুন, AI দেখবে</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Community Banner */}
      <section className="px-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">
            🤝 আপনার গ্রামে <span className="text-secondary font-semibold">১২৫ জন</span> কৃষক agriশক্তি ব্যবহার করছেন!
          </p>
        </div>
      </section>
    </div>
  );
}
