import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";

// Pages
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import CameraPage from "./pages/CameraPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import ChatPage from "./pages/ChatPage";
import MarketPage from "./pages/MarketPage";
import WeatherPage from "./pages/WeatherPage";
import MapPage from "./pages/MapPage";
import HistoryPage from "./pages/HistoryPage";
import GamificationPage from "./pages/GamificationPage";
import SettingsPage from "./pages/SettingsPage";
import KnowledgePage from "./pages/KnowledgePage";
import CommunityPage from "./pages/CommunityPage";
import FertilizerPage from "./pages/FertilizerPage";
import FertilizerScanPage from "./pages/FertilizerScanPage";
import PestMapPage from "./pages/PestMapPage";
import SatellitePage from "./pages/SatellitePage";
import FarmingCalendarPage from "./pages/FarmingCalendarPage";
import MachineOptimizerPage from "./pages/MachineOptimizerPage";
import NPKCalculatorPage from "./pages/NPKCalculatorPage";
import ClimateAlertPage from "./pages/ClimateAlertPage";
import GovServicesPage from "./pages/GovServicesPage";
import SupportPage from "./pages/SupportPage";
import ProfilePage from "./pages/ProfilePage";
import DemoPage from "./pages/DemoPage";
import StoragePage from "./pages/StoragePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const hideNavRoutes = ["/", "/auth"];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="font-bengali">
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
        <Route path="/machine" element={<MachineOptimizerPage />} />
        <Route path="/npk-calculator" element={<NPKCalculatorPage />} />
        <Route path="/climate-alert" element={<ClimateAlertPage />} />
        <Route path="/gov-services" element={<GovServicesPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/storage" element={<StoragePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
