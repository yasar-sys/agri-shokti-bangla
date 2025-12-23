import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Loader2 } from "lucide-react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

// Lazy load pages for better performance
const SplashPage = lazy(() => import("./pages/SplashPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CameraPage = lazy(() => import("./pages/CameraPage"));
const DiagnosisPage = lazy(() => import("./pages/DiagnosisPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const MarketPage = lazy(() => import("./pages/MarketPage"));
const WeatherPage = lazy(() => import("./pages/WeatherPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const KnowledgePage = lazy(() => import("./pages/KnowledgePage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const FertilizerPage = lazy(() => import("./pages/FertilizerPage"));
const FertilizerScanPage = lazy(() => import("./pages/FertilizerScanPage"));
const PestMapPage = lazy(() => import("./pages/PestMapPage"));
const SatellitePage = lazy(() => import("./pages/SatellitePage"));
const FarmingCalendarPage = lazy(() => import("./pages/FarmingCalendarPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const CompassPage = lazy(() => import("./pages/CompassPage"));
const MachineOptimizerPage = lazy(() => import("./pages/MachineOptimizerPage"));
const NPKCalculatorPage = lazy(() => import("./pages/NPKCalculatorPage"));
const ClimateAlertPage = lazy(() => import("./pages/ClimateAlertPage"));
const GovServicesPage = lazy(() => import("./pages/GovServicesPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const StoragePage = lazy(() => import("./pages/StoragePage"));
const LandCalculatorPage = lazy(() => import("./pages/LandCalculatorPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              কিছু সমস্যা হয়েছে
            </h1>
            <p className="text-muted-foreground mb-6">
              অ্যাপে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              পৃষ্ঠা রিফ্রেশ করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
      <p className="text-muted-foreground">লোড হচ্ছে...</p>
    </div>
  </div>
);

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const hideNavRoutes = ["/", "/auth"];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      <div className="font-bengali">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/diagnosis" element={<DiagnosisPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/fertilizer" element={<FertilizerPage />} />
            <Route path="/fertilizer-scan" element={<FertilizerScanPage />} />
            <Route path="/pest-map" element={<PestMapPage />} />
            <Route path="/satellite" element={<SatellitePage />} />
            <Route path="/calendar" element={<FarmingCalendarPage />} />
            <Route path="/farmer-calendar" element={<CalendarPage />} />
            <Route path="/compass" element={<CompassPage />} />
            <Route path="/machine" element={<MachineOptimizerPage />} />
            <Route path="/npk-calculator" element={<NPKCalculatorPage />} />
            <Route path="/climate-alert" element={<ClimateAlertPage />} />
            <Route path="/gov-services" element={<GovServicesPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/land-calculator" element={<LandCalculatorPage />} />
            <Route path="/admin" element={<AdminAnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {showNav && <BottomNav />}
      </div>
    </ErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <OfflineBanner />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
