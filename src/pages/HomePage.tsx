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
  ChevronRight,
  PlayCircle,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingDown,
  Compass,
  Map,
  Shield,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriBrainLogo from "@/assets/agri-brain-logo.png";
import farmerAvatar from "@/assets/farmer-avatar.png";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const weather = useWeather(location.latitude, location.longitude);
  const { prices: marketPrices, loading: marketLoading } = useMarketPrices();
  const { trackPageView, trackFeatureUse } = useAnalyticsTracker();
  const { t, language } = useLanguage();

  // Services array with translation keys
  const services = [
    { icon: Scan, labelKey: "diseaseDetection", to: "/camera", gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400", borderColor: "border-emerald-500/30", descKey: "diseaseDesc" },
    { icon: ScanSearch, labelKey: "fertilizerScan", to: "/fertilizer-scan", gradient: "from-rose-500/20 to-pink-500/20", iconColor: "text-rose-400", borderColor: "border-rose-500/30", descKey: "fertilizerDesc" },
    { icon: Bug, labelKey: "pestMap", to: "/pest-map", gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400", borderColor: "border-amber-500/30", descKey: "pestDesc" },
    { icon: MessageSquare, labelKey: "aiAssistant", to: "/chat", gradient: "from-cyan-500/20 to-sky-500/20", iconColor: "text-cyan-400", borderColor: "border-cyan-500/30", descKey: "aiDesc" },
    { icon: TrendingUp, labelKey: "marketPrice", to: "/market", gradient: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-400", borderColor: "border-green-500/30", descKey: "marketDesc" },
    { icon: Cloud, labelKey: "weather", to: "/weather", gradient: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-400", borderColor: "border-blue-500/30", descKey: "weatherDesc" },
    { icon: Calendar, labelKey: "calendar", to: "/farmer-calendar", gradient: "from-fuchsia-500/20 to-pink-500/20", iconColor: "text-fuchsia-400", borderColor: "border-fuchsia-500/30", descKey: "calendarBanglaEng" },
    { icon: Compass, labelKey: "compass", to: "/compass", gradient: "from-cyan-500/20 to-teal-500/20", iconColor: "text-cyan-400", borderColor: "border-cyan-500/30", descKey: "compassDesc" },
    { icon: Map, labelKey: "landMap", to: "/map", gradient: "from-indigo-500/20 to-violet-500/20", iconColor: "text-indigo-400", borderColor: "border-indigo-500/30", descKey: "landMapDesc" },
    { icon: Satellite, labelKey: "satellite", to: "/satellite", gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-400", borderColor: "border-violet-500/30", descKey: "satelliteDesc" },
    { icon: Calendar, labelKey: "calendar", to: "/calendar", gradient: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-400", borderColor: "border-orange-500/30", descKey: "cropSchedule" },
    { icon: Tractor, labelKey: "machine", to: "/machine", gradient: "from-orange-500/20 to-red-500/20", iconColor: "text-orange-400", borderColor: "border-orange-500/30", descKey: "machineDesc" },
    { icon: Calculator, labelKey: "npkCalculator", to: "/npk-calculator", gradient: "from-lime-500/20 to-green-500/20", iconColor: "text-lime-400", borderColor: "border-lime-500/30", descKey: "npkDesc" },
    { icon: CloudLightning, labelKey: "climateAlert", to: "/climate-alert", gradient: "from-red-500/20 to-rose-500/20", iconColor: "text-red-400", borderColor: "border-red-500/30", descKey: "climateDesc" },
    { icon: Landmark, labelKey: "govServices", to: "/gov-services", gradient: "from-teal-500/20 to-cyan-500/20", iconColor: "text-teal-400", borderColor: "border-teal-500/30", descKey: "govDesc" },
    { icon: Warehouse, labelKey: "storage", to: "/storage", gradient: "from-slate-500/20 to-gray-500/20", iconColor: "text-slate-400", borderColor: "border-slate-500/30", descKey: "storageDesc" },
    { icon: History, labelKey: "history", to: "/history", gradient: "from-zinc-500/20 to-stone-500/20", iconColor: "text-zinc-400", borderColor: "border-zinc-500/30", descKey: "historyDesc" },
    { icon: Award, labelKey: "rewards", to: "/gamification", gradient: "from-yellow-500/20 to-amber-500/20", iconColor: "text-yellow-400", borderColor: "border-yellow-500/30", descKey: "rewardsDesc" },
    { icon: Beaker, labelKey: "fertilizerAdvice", to: "/fertilizer", gradient: "from-indigo-500/20 to-blue-500/20", iconColor: "text-indigo-400", borderColor: "border-indigo-500/30", descKey: "fertAdviceDesc" },
    { icon: GraduationCap, labelKey: "knowledge", to: "/knowledge", gradient: "from-purple-500/20 to-violet-500/20", iconColor: "text-purple-400", borderColor: "border-purple-500/30", descKey: "knowledgeDesc" },
    { icon: UsersRound, labelKey: "community", to: "/community", gradient: "from-sky-500/20 to-blue-500/20", iconColor: "text-sky-400", borderColor: "border-sky-500/30", descKey: "communityDesc" },
    { icon: PlayCircle, labelKey: "appGuide", to: "/demo", gradient: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-400", borderColor: "border-pink-500/30", descKey: "guideDesc" },
    { icon: MapPin, labelKey: "landCalculator", to: "/land-calculator", gradient: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-400", borderColor: "border-emerald-500/30", descKey: "landDesc" },
    { icon: BarChart3, labelKey: "impactAnalytics", to: "/impact", gradient: "from-gradient-start/20 to-gradient-end/20", iconColor: "text-secondary", borderColor: "border-secondary/30", descKey: "impactDesc" },
  ];

  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const currentServices = services.slice(
    currentPage * SERVICES_PER_PAGE,
    (currentPage + 1) * SERVICES_PER_PAGE
  );

  // Track page view on mount
  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get top 3 market prices for display
  const topMarketPrices = marketPrices.slice(0, 3).map(p => ({
    emoji: p.crop_emoji || '🌾',
    name: p.crop_name,
    price: `৳${p.today_price.toLocaleString('bn-BD')}`,
    weeklyAvg: p.weekly_avg ? `৳${p.weekly_avg.toLocaleString('bn-BD')}` : null,
    change: p.today_price - p.yesterday_price,
    positive: p.today_price >= p.yesterday_price,
    unit: p.unit || t('perKg')
  }));

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

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!roleData);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error:', error);
        toast.error(t('logoutError'));
      } else {
        // Clear local state after successful signout
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        toast.success(t('logoutSuccess'));
        // Navigate to splash page
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout exception:', err);
      toast.error(t('logoutError'));
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

  // Get localized date/time
  const getLocalizedTime = () => {
    const locale = language === 'en' ? 'en-US' : 'bn-BD';
    return currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLocalizedDate = () => {
    const locale = language === 'en' ? 'en-US' : 'bn-BD';
    return currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
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
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        {/* Animated orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Premium Header */}
      <header className="relative">
        {/* Glass Header */}
        <div className="relative px-5 pt-6 pb-5">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="flex items-start justify-between">
            {/* Left Side - Logo & Branding */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center overflow-hidden shadow-premium">
                  <img 
                    src={agriBrainLogo} 
                    alt="agriশক্তি Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  <span className="text-gradient-premium">{t('appName')}</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  {t('taglineShort')}
                </p>
              </div>
            </div>
            
            {/* Right Side - User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative group focus:outline-none">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/40 to-secondary/40 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity" />
                  <div className="relative w-14 h-14 rounded-2xl glass-card flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-all shadow-premium overflow-hidden">
                    {session && profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={farmerAvatar} 
                        alt="Farmer" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full border border-border/50 flex items-center justify-center shadow-soft">
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {session && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-full border-2 border-card shadow-glow animate-pulse" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-strong border-border/50 shadow-elevated">
                {session ? (
                  <>
                    <div className="px-3 py-3 border-b border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('account')}</p>
                      <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                        {profile?.full_name || session.user.email?.split('@')[0]}
                      </p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer gap-3 py-2.5">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{t('profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer gap-3 py-2.5">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span>{t('settings')}</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer gap-3 py-2.5">
                          <Shield className="w-4 h-4 text-primary" />
                          <span>{t('adminDashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer gap-3 py-2.5 text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-3 border-b border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('welcome')}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{t('getStarted')}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="cursor-pointer gap-3 py-2.5">
                        <LogIn className="w-4 h-4 text-muted-foreground" />
                        <span>{t('login')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer gap-3 py-2.5">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span>{t('settings')}</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Location & Weather Bar with Real-time Clock */}
          <div className="mt-5 glass-card rounded-2xl px-4 py-3 border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {location.loading ? (
                  <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-destructive" />
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-foreground block">
                    {location.loading ? t('findingLocation') : location.city}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{location.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {weather.loading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">{weather.temp}°</span>
                      <span className="text-[10px] text-muted-foreground block">{weather.conditionBn}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                      {weather.icon}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Real-time Clock */}
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-bold text-gradient-premium">
                  {getLocalizedTime()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {getLocalizedDate()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <section className="px-5 mb-5 animate-slide-up">
        <div className="grid grid-cols-3 gap-3">
          {/* Scans */}
          <div className="group relative overflow-hidden glass-card rounded-2xl p-4 text-center border border-border/30 hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 to-secondary/0 group-hover:from-secondary/10 group-hover:to-transparent transition-all duration-500" />
            <span className="relative text-2xl font-bold text-gradient-mint block">
              {profile ? String(profile.total_scans).padStart(2, '0') : '00'}
            </span>
            <p className="relative text-[11px] text-muted-foreground mt-1 font-medium">{t('scans')}</p>
          </div>
          
          {/* Level */}
          <div className="group relative overflow-hidden glass-card rounded-2xl p-4 text-center border border-border/30 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-gold">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all duration-500" />
            <span className="relative text-2xl font-bold text-gradient-gold block">{getUserLevel()}</span>
            <p className="relative text-[11px] text-muted-foreground mt-1 font-medium">{t('level')}</p>
          </div>
          
          {/* Weather Quick */}
          <div className="group relative overflow-hidden glass-card rounded-2xl p-4 text-center border border-border/30 hover:border-chart-3/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/0 to-chart-3/0 group-hover:from-chart-3/10 group-hover:to-transparent transition-all duration-500" />
            <div className="relative flex items-center justify-center">
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{weather.icon}</span>
            </div>
            <p className="relative text-[11px] text-muted-foreground mt-1 font-medium">{weather.temp}°C</p>
          </div>
        </div>
      </section>

      {/* AI CTA Banner */}
      <section className="px-5 mb-5 animate-slide-up stagger-1">
        <Link to="/camera">
          <div className="relative overflow-hidden rounded-3xl p-5 group">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-emerald-500 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Scan className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    {t('aiDiseaseDiagnosis')}
                    <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    {t('takeCropPhotoAI')}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </section>

      {/* Today's Tip */}
      <section className="px-5 mb-5 animate-slide-up stagger-2">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-primary/30">
          {/* Animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-gradient" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-2xl flex-shrink-0 shadow-soft animate-bounce-subtle">
              💡
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary text-sm mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {t('todayTip')}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('todayTipText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('services')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
              {currentPage + 1}/{totalPages}
            </span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-xl glass-card border border-border/30 hover:border-secondary/50"
                onClick={prevPage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-xl glass-card border border-border/30 hover:border-secondary/50"
                onClick={nextPage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {currentServices.map((service, index) => (
            <Link
              key={service.to}
              to={service.to}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-4 flex flex-col items-center gap-3",
                "glass-card border transition-all duration-300",
                "active:scale-95 hover:-translate-y-1",
                service.borderColor,
                "hover:shadow-lg"
              )}
              style={{ 
                animationDelay: `${index * 60}ms`,
              }}
            >
              {/* Gradient background on hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                service.gradient
              )} />
              
              {/* Icon container */}
              <div className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br transition-all duration-300",
                service.gradient,
                "group-hover:scale-110 group-hover:shadow-lg"
              )}>
                <service.icon className={cn(
                  "w-7 h-7 transition-all duration-300",
                  service.iconColor,
                  "group-hover:scale-110"
                )} />
              </div>
              
              {/* Label */}
              <span className="relative text-xs text-foreground text-center font-semibold leading-tight group-hover:text-primary transition-colors">
                {t(service.labelKey)}
              </span>
            </Link>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === currentPage 
                  ? "w-6 bg-gradient-to-r from-primary to-secondary" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </section>

      {/* Market Prices */}
      <section className="px-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            {t('todayMarketPrice')}
            {marketLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </h2>
          <Link to="/market" className="text-xs text-secondary font-medium flex items-center gap-1 hover:underline">
            {t('viewAll')}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {topMarketPrices.length > 0 ? topMarketPrices.map((item, index) => (
            <div 
              key={index}
              className={cn(
                "group flex items-center justify-between",
                "glass-card rounded-2xl px-4 py-4 border border-border/30",
                "hover:border-primary/30 hover:shadow-soft",
                "transition-all duration-300 hover:-translate-y-0.5",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-soft">
                  {item.emoji}
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground block group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.weeklyAvg ? `${t('weeklyAvg')}: ${item.weeklyAvg}` : item.unit}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">{item.price}</span>
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-bold",
                  item.positive 
                    ? "text-secondary bg-secondary/15 border border-secondary/30" 
                    : "text-destructive bg-destructive/15 border border-destructive/30"
                )}>
                  {item.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.change >= 0 ? '+' : ''}{item.change}
                </div>
              </div>
            </div>
          )) : (
            <div className="glass-card rounded-2xl p-6 text-center border border-border/30">
              <p className="text-muted-foreground text-sm">{t('loading')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Community Banner */}
      <section className="px-5 mb-5">
        <div className="glass-card rounded-2xl p-4 text-center border border-border/30">
          <div className="flex items-center justify-center gap-2 text-sm">
            <UsersRound className="w-4 h-4 text-secondary" />
            <p className="text-muted-foreground">
              {t('farmersUsingApp')} <span className="text-secondary font-bold">{t('farmersCount')}</span> {t('farmersUsingSuffix')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
