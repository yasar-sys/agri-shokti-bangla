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
  BarChart3,
  ArrowLeftRight,
  Video,
  Sprout,
  Droplets, Mic, Sun, Wind, Lightbulb, Leaf, Languages
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp, Waveform, CropLine } from "@/components/ui/editorial";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
 import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriBrainLogo from "@/assets/agri-brain-logo.png";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
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

const VoiceConversation = lazy(() => import("@/components/VoiceConversation").then(module => ({ default: module.VoiceConversation })));

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
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceHover, setVoiceHover] = useState(false);
  const text = (bn: string, en: string, hi: string) => language === "en" ? en : language === "hi" ? hi : bn;

   // Swipe handling for services carousel
   const touchStartX = useRef<number | null>(null);
   const touchEndX = useRef<number | null>(null);
   const minSwipeDistance = 50;

   const handleTouchStart = useCallback((e: React.TouchEvent) => {
     touchEndX.current = null;
     touchStartX.current = e.targetTouches[0].clientX;
   }, []);

   const handleTouchMove = useCallback((e: React.TouchEvent) => {
     touchEndX.current = e.targetTouches[0].clientX;
   }, []);

   const handleTouchEnd = useCallback(() => {
     if (!touchStartX.current || !touchEndX.current) return;
     
     const distance = touchStartX.current - touchEndX.current;
     const isLeftSwipe = distance > minSwipeDistance;
     const isRightSwipe = distance < -minSwipeDistance;
     
     const numPages = Math.ceil(24 / SERVICES_PER_PAGE); // 24 services
     if (isLeftSwipe) {
       setCurrentPage((prev) => (prev + 1) % numPages);
     }
     if (isRightSwipe) {
       setCurrentPage((prev) => (prev - 1 + numPages) % numPages);
     }
     
     touchStartX.current = null;
     touchEndX.current = null;
   }, []);

  // Services array with translation keys
  const services = [
    { icon: Scan, labelKey: "diseaseDetection", to: "/camera", descKey: "diseaseDesc" },
    { icon: ScanSearch, labelKey: "fertilizerScan", to: "/fertilizer-scan", descKey: "fertilizerDesc" },
    { icon: Bug, labelKey: "pestMap", to: "/pest-map", descKey: "pestDesc" },
    { icon: MessageSquare, labelKey: "aiAssistant", to: "/chat", descKey: "aiDesc" },
    { icon: TrendingUp, labelKey: "marketPrice", to: "/market", descKey: "marketDesc" },
    { icon: Cloud, labelKey: "weather", to: "/weather", descKey: "weatherDesc" },
    { icon: Calendar, labelKey: "calendar", to: "/farmer-calendar", descKey: "calendarBanglaEng" },
    { icon: Compass, labelKey: "compass", to: "/compass", descKey: "compassDesc" },
    { icon: Map, labelKey: "landMap", to: "/map", descKey: "landMapDesc" },
    { icon: Satellite, labelKey: "satellite", to: "/satellite", descKey: "satelliteDesc" },
     { icon: Calendar, labelKey: "myCalendar", to: "/calendar", descKey: "myCalendarDesc" },
    { icon: Tractor, labelKey: "machine", to: "/machine", descKey: "machineDesc" },
    { icon: Calculator, labelKey: "npkCalculator", to: "/npk-calculator", descKey: "npkDesc" },
    { icon: CloudLightning, labelKey: "climateAlert", to: "/climate-alert", descKey: "climateDesc" },
    { icon: Landmark, labelKey: "govServices", to: "/gov-services", descKey: "govDesc" },
    { icon: Warehouse, labelKey: "storage", to: "/storage", descKey: "storageDesc" },
    { icon: History, labelKey: "history", to: "/history", descKey: "historyDesc" },
    { icon: Award, labelKey: "rewards", to: "/gamification", descKey: "rewardsDesc" },
    { icon: GraduationCap, labelKey: "knowledge", to: "/knowledge", descKey: "knowledgeDesc" },
    { icon: UsersRound, labelKey: "community", to: "/community", descKey: "communityDesc" },
    { icon: PlayCircle, labelKey: "appGuide", to: "/demo", descKey: "guideDesc" },
    { icon: MapPin, labelKey: "landCalculator", to: "/land-calculator", descKey: "landDesc" },
    { icon: BarChart3, labelKey: "impactAnalytics", to: "/impact", descKey: "impactDesc" },
    { icon: ArrowLeftRight, labelKey: "cropBarter", to: "/barter", descKey: "barterDesc" },
    { icon: Sprout, labelKey: "yieldMax", to: "/yieldmax", descKey: "yieldMaxDesc" },
    { icon: Droplets, labelKey: "precisionFarm", to: "/precision-farm", descKey: "precisionFarmDesc" },
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
  const topMarketPrices = marketPrices && marketPrices.length > 0 
    ? marketPrices.slice(0, 3).map(p => ({
        emoji: p.crop_emoji || '🌾',
        name: p.crop_name,
        price: `৳${p.today_price?.toLocaleString('bn-BD') || '0'}`,
        weeklyAvg: p.weekly_avg ? `৳${p.weekly_avg.toLocaleString('bn-BD')}` : null,
        change: (p.today_price || 0) - (p.yesterday_price || 0),
        positive: (p.today_price || 0) >= (p.yesterday_price || 0),
        unit: p.unit || t('perKg')
      }))
    : [];

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
      // Clear local state first to ensure UI updates immediately
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Sign out from Supabase (local scope is more reliable)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error(t('logoutError'));
      } else {
        toast.success(t('logoutSuccess'));
      }
      
      // Always navigate to splash page
      window.location.href = '/';
    } catch (err) {
      console.error('Logout exception:', err);
      toast.error(t('logoutError'));
      // Still navigate even on error
      window.location.href = '/';
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
    <motion.div className="home-workspace" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }}>
      <header className="home-header safe-area-top">
        <div className="home-inner home-header-row">
          <Link to="/home" className="flex items-center gap-3" aria-label={t('home')}>
            <img src={agriBrainLogo} alt="" width="44" height="44" className="h-11 w-11 object-contain rounded-md" />
            <div><div className="brand-name">agri<span className="text-primary">শক্তি</span></div><p className="text-xs text-muted-foreground hidden sm:block">{t('taglineShort')}</p></div>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden md:flex items-center gap-1 mr-3" aria-label={t('language')}>
              {(['bn', 'en', 'hi'] as const).map(lang => <Button key={lang} variant="ghost" className={cn('px-3', language === lang && 'bg-muted text-primary')} onClick={() => setLanguage(lang)} aria-pressed={language === lang}>{lang === 'bn' ? 'বাংলা' : lang === 'en' ? 'EN' : 'हिन्दी'}</Button>)}
            </div>
            <InstallAppButton />
            <NotificationCenter className="h-12 w-12 bg-transparent" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={t('account')} className="overflow-hidden rounded-full border border-border"><img src={session && profile?.avatar_url ? profile.avatar_url : farmerAvatar} alt="" className="w-full h-full object-cover" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-elevated">
                <div className="px-3 py-3 border-b border-border"><p className="text-xs text-muted-foreground">{session ? t('account') : t('welcome')}</p><p className="text-sm font-semibold truncate">{session ? profile?.full_name || session.user.email?.split('@')[0] : t('getStarted')}</p></div>
                {session ? <><DropdownMenuItem asChild><Link to="/profile" className="gap-3 min-h-12"><User className="w-4 h-4" />{t('profile')}</Link></DropdownMenuItem>{isAdmin && <DropdownMenuItem asChild><Link to="/admin" className="gap-3 min-h-12"><Shield className="w-4 h-4" />{t('adminDashboard')}</Link></DropdownMenuItem>}</> : <DropdownMenuItem asChild><Link to="/auth" className="gap-3 min-h-12"><LogIn className="w-4 h-4" />{t('login')}</Link></DropdownMenuItem>}
                <DropdownMenuItem asChild><Link to="/settings" className="gap-3 min-h-12"><Settings className="w-4 h-4" />{t('settings')}</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex justify-between px-2">{(['bn', 'en', 'hi'] as const).map(lang => <Button key={lang} variant="ghost" onClick={() => setLanguage(lang)} aria-pressed={language === lang}>{lang === 'bn' ? 'বাংলা' : lang === 'en' ? 'EN' : 'हिन्दी'}</Button>)}</div>
                <DropdownMenuItem onClick={toggleTheme} className="gap-3 min-h-12"><Sun className="w-4 h-4" />{theme === 'light' ? text('ডার্ক মোড', 'Dark mode', 'डार्क मोड') : text('লাইট মোড', 'Light mode', 'लाइट मोड')}</DropdownMenuItem>
                {session && <><DropdownMenuSeparator /><DropdownMenuItem onClick={handleLogout} className="gap-3 min-h-12 text-destructive"><LogOut className="w-4 h-4" />{t('logout')}</DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="home-inner">
        <div className="home-date-strip">
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-clay" />{location.loading ? t('findingLocation') : location.city}<span className="hidden sm:inline">· {location.country}</span></span>
          <span className="flex gap-4 items-center"><span>{getLocalizedDate()}</span><span className="font-mono tabular-nums hidden sm:inline">{getLocalizedTime()}</span></span>
        </div>
        <div className="home-introduction">
          <div><p className="text-xs text-clay mb-1">{text('মাটি, মানুষ, প্রযুক্তি', 'SOIL. PEOPLE. POSSIBILITY.', 'मिट्टी, लोग, तकनीक')}</p><h1 className="home-greeting">{text('আসসালামু আলাইকুম,', 'Welcome to your field,', 'आपके खेत में स्वागत है,')}<br className="sm:hidden" /> <span className="text-primary">{profile?.full_name || text('কৃষক ভাই!', 'farmer.', 'किसान भाई!')}</span></h1></div>
          <CropLine className="text-primary/60 hidden sm:block shrink-0" />
        </div>

        <div className="home-lead-grid">
          <section aria-label={t('aiAssistant')}>
            <div className="voice-feature">
              <div>
                <p className="text-xs text-clay flex items-center gap-2 mb-2"><span className="w-1.5 h-1.5 bg-clay rounded-full" />{t('aiAssistant')}</p>
                <h2>{text('আপনার কথা,', 'Your voice.', 'आपकी आवाज़,')}<br /><span className="text-primary">{text('কৃষির নতুন শক্তি।', 'A stronger harvest.', 'खेती की नई ताकत।')}</span></h2>
                <p className="text-sm text-muted-foreground mt-2 mb-4">{t('aiDesc')}</p>
                <Button variant="link" asChild className="p-0 justify-start text-sm"><Link to="/chat">{t('aiChat')}<ArrowRight className="w-4 h-4" /></Link></Button>
              </div>
              <div className="voice-orbit">
                <motion.div whileTap={reducedMotion ? undefined : { scale: 0.95 }} transition={{ type: 'spring', duration: 0.24, bounce: 0.2 }}>
                  <Button className="voice-mic" aria-label={t('speakBengali')} onClick={() => setVoiceOpen(true)} onMouseEnter={() => setVoiceHover(true)} onMouseLeave={() => setVoiceHover(false)} onFocus={() => setVoiceHover(true)} onBlur={() => setVoiceHover(false)}><Mic /></Button>
                </motion.div>
                <Waveform active={voiceHover} />
                <span className="text-xs text-muted-foreground">{t('speakBengali')}</span>
              </div>
            </div>
            <figure className="field-photo"><img src={villageBg} alt={text('বাংলাদেশের ধানের মাঠ ও গ্রাম', 'Rice fields and village in Bangladesh', 'बांग्लादेश के धान के खेत और गाँव')} width="1366" height="768" fetchPriority="high" /><figcaption>{t('tagline')}</figcaption></figure>
          </section>

          <section className="weather-feature" aria-label={t('weather')}>
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-medium">{t('weather')}</h2><Cloud className="w-7 h-7 text-clay" /></div>
            <div>
              {weather.loading ? <Skeleton className="h-20 w-36" /> : weather.error ? <p className="text-sm text-danger">{weather.error}</p> : <><div className="weather-number"><CountUp value={weather.temp} suffix="°" /></div><p className="text-sm text-muted-foreground mb-4">{weather.conditionBn}</p></>}
            </div>
            <div className="weather-details">
              <div className="grid grid-cols-2 gap-4 border-y border-border py-4 text-xs">
                <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-info" /><div><span className="text-muted-foreground block">{t('humidity')}</span><span className="font-mono">{weather.loading || weather.error ? '—' : weather.humidity + '%'}</span></div></div>
                <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-primary" /><div><span className="text-muted-foreground block">{t('wind')}</span><span className="font-mono">{weather.loading || weather.error ? '—' : weather.wind + ' km/h'}</span></div></div>
              </div>
              <div className="flex items-center justify-between py-3 text-xs"><span className="text-muted-foreground">{t('scans')} <span className="font-mono text-foreground ml-1">{profile ? String(profile.total_scans).padStart(2, '0') : '00'}</span></span><span className="text-muted-foreground">{t('level')} <span className="font-mono text-foreground ml-1">{getUserLevel()}</span></span></div>
              <Button variant="link" asChild className="px-0"><Link to="/weather">{t('weatherDesc')}<ArrowRight /></Link></Button>
            </div>
          </section>
        </div>

        <section className="home-services" aria-labelledby="services-heading">
          <div className="flex items-center justify-between gap-2 mb-4"><h2 id="services-heading" className="home-section-title">{t('services')}</h2><div className="flex items-center gap-1"><span className="font-mono text-xs text-muted-foreground mr-2">{String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span><Button variant="ghost" size="icon" onClick={prevPage} aria-label={text('আগের সেবাসমূহ', 'Previous services', 'पिछली सेवाएँ')}><ChevronLeft /></Button><Button variant="outline" size="icon" onClick={nextPage} aria-label={text('পরের সেবাসমূহ', 'Next services', 'अगली सेवाएँ')}><ChevronRight /></Button></div></div>
          <div className="service-editorial-grid" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {currentServices.map((service, index) => <motion.div key={service.to} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.025 }} className="service-editorial-item">
              <Link to={service.to} className="flex items-center gap-3 w-full min-h-16 group"><service.icon className={cn('w-7 h-7 shrink-0', index % 3 === 1 ? 'text-clay' : 'text-primary')} strokeWidth={1.5} /><div className="min-w-0"><span className="text-sm font-semibold block">{t(service.labelKey)}</span><span className="text-xs text-muted-foreground block mt-1">{t(service.descKey)}</span></div><ArrowRight className="w-4 h-4 ml-auto shrink-0 text-muted-foreground hidden sm:block group-hover:text-primary" /></Link>
            </motion.div>)}
          </div>
          <div className="flex justify-center mt-2">{Array.from({ length: totalPages }).map((_, i) => <Button key={i} variant="ghost" size="icon" onClick={() => setCurrentPage(i)} aria-label={text(`সেবার পৃষ্ঠা ${i + 1}`, `Services page ${i + 1}`, `सेवा पृष्ठ ${i + 1}`)} aria-current={i === currentPage ? 'true' : undefined}><span className={cn('h-1 rounded-full', i === currentPage ? 'w-6 bg-primary' : 'w-2 bg-border')} /></Button>)}</div>
        </section>

        <div className="home-bottom-grid">
          <section aria-labelledby="market-heading">
            <div className="flex items-center justify-between gap-4 mb-2"><h2 id="market-heading" className="home-section-title">{t('todayMarketPrice')}</h2><Button asChild variant="link" className="px-0"><Link to="/market">{t('viewAll')}<ArrowRight /></Link></Button></div>
            {marketLoading ? <div className="space-y-4 py-4" role="status" aria-label={t('loading')}>{[0, 1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : topMarketPrices.length ? topMarketPrices.map((item, index) => <div key={index} className="market-table-row"><div className="flex items-center gap-3"><Sprout className="w-5 h-5 text-primary shrink-0" /><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.weeklyAvg ? `${t('weeklyAvg')}: ${item.weeklyAvg}` : item.unit}</p></div></div><span className="font-mono text-lg tabular-nums">{item.price}</span><span className={cn('flex items-center gap-1 text-xs font-mono min-w-12 justify-end', item.positive ? 'text-healthy' : 'text-danger')}>{item.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}{item.change >= 0 ? '+' : ''}{item.change}</span></div>) : <div className="py-8 border-b border-border flex gap-4 items-start"><TrendingUp className="text-muted-foreground w-6 h-6" /><div><p className="text-sm">{text('বাজারদর এখন পাওয়া যাচ্ছে না', 'Market prices are unavailable right now', 'बाजार भाव अभी उपलब्ध नहीं हैं')}</p><Button asChild variant="link" className="px-0"><Link to="/market">{t('marketPrice')}<ArrowRight /></Link></Button></div></div>}
          </section>
          <aside className="tip-editorial">
            <p className="text-xs text-clay flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4" />{t('todayTip')}</p>
            <p className="font-display text-lg leading-relaxed">{[
              "সকালে সেচ দিলে পানির অপচয় কম হয় এবং গাছ বেশি পানি শোষণ করে।",
              "মাটির pH ৬-৭ এর মধ্যে রাখলে বেশিরভাগ ফসল ভালো হয়।",
              "জৈব সার ব্যবহারে মাটির স্বাস্থ্য ভালো থাকে ও ফলন বাড়ে।",
              "ফসল ঘুরিয়ে চাষ করলে মাটির উর্বরতা বজায় থাকে।",
              "পোকা দমনে প্রথমে জৈব পদ্ধতি ব্যবহার করুন।",
              "বীজ বপনের আগে বীজ শোধন করলে রোগ কম হয়।",
              "সঠিক সময়ে সার দিলে ফলন ২০-৩০% বাড়ে।"
            ][new Date().getDate() % 7]}</p>
            <Button asChild variant="outline" className="mt-5 w-full justify-between"><Link to="/camera"><Scan />{t('aiDiseaseDiagnosis')}<ArrowRight /></Link></Button>
          </aside>
        </div>
        <footer className="mt-10 pt-6 border-t border-border flex flex-wrap justify-between gap-4 text-xs text-muted-foreground"><span>agriশক্তি · {t('taglineShort')}</span><p>কৃষকের হাতেই দেশের ভবিষ্যৎ, তাদের শ্রমেই আমাদের অন্ন।</p></footer>
      </main>
      {voiceOpen && <Suspense fallback={<div className="fixed inset-0 z-[60] bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" aria-label={t('loading')} /></div>}><VoiceConversation isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} /></Suspense>}
    </motion.div>
  );
}
