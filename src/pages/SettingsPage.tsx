import { useState, useEffect } from "react";
import { Globe, Bell, HelpCircle, Info, ChevronRight, User, Shield, Smartphone, ArrowLeft, Check, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Language = "bn" | "en";

const translations = {
  bn: {
    settings: "সেটিংস",
    customizeApp: "অ্যাপ কাস্টমাইজ করুন",
    language: "ভাষা",
    bangla: "বাংলা",
    english: "English",
    notifications: "নোটিফিকেশন",
    pushNotifications: "পুশ নোটিফিকেশন",
    weatherMarketUpdate: "আবহাওয়া ও বাজার আপডেট",
    smsNotifications: "SMS নোটিফিকেশন",
    importantAlerts: "গুরুত্বপূর্ণ সতর্কতা",
    account: "অ্যাকাউন্ট",
    profile: "প্রোফাইল",
    namePhone: "নাম ও ফোন নম্বর",
    privacy: "গোপনীয়তা",
    dataProtection: "ডাটা সুরক্ষা সেটিংস",
    help: "সাহায্য",
    faq: "প্রশ্ন ও উত্তর",
    aboutApp: "অ্যাপ সম্পর্কে",
    version: "সংস্করণ ১.০.০",
    aiAssistant: "বাংলার কৃষকের AI সহকারী",
    createdBy: "Created by TEAM_NEWBIES",
    back: "ফিরে যান",
    selectLanguage: "ভাষা নির্বাচন করুন",
    enterPhone: "ফোন নম্বর দিন",
    phoneNumber: "ফোন নম্বর",
    save: "সংরক্ষণ করুন",
    smsSaved: "SMS নোটিফিকেশন সক্রিয় হয়েছে",
    smsDisabled: "SMS নোটিফিকেশন বন্ধ হয়েছে",
    languageChanged: "ভাষা পরিবর্তন হয়েছে",
  },
  en: {
    settings: "Settings",
    customizeApp: "Customize your app",
    language: "Language",
    bangla: "বাংলা",
    english: "English",
    notifications: "Notifications",
    pushNotifications: "Push Notifications",
    weatherMarketUpdate: "Weather & Market Updates",
    smsNotifications: "SMS Notifications",
    importantAlerts: "Important Alerts",
    account: "Account",
    profile: "Profile",
    namePhone: "Name & Phone Number",
    privacy: "Privacy",
    dataProtection: "Data Protection Settings",
    help: "Help",
    faq: "FAQ",
    aboutApp: "About App",
    version: "Version 1.0.0",
    aiAssistant: "AI Assistant for Bangladesh Farmers",
    createdBy: "Created by TEAM_NEWBIES",
    back: "Go Back",
    selectLanguage: "Select Language",
    enterPhone: "Enter Phone Number",
    phoneNumber: "Phone Number",
    save: "Save",
    smsSaved: "SMS notifications enabled",
    smsDisabled: "SMS notifications disabled",
    languageChanged: "Language changed",
  },
};

export default function SettingsPage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "bn";
  });
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageDialog(false);
    toast.success(lang === "bn" ? "ভাষা বাংলা করা হয়েছে" : "Language changed to English");
  };

  const handleSmsToggle = (enabled: boolean) => {
    if (enabled && !phoneNumber) {
      setShowSmsDialog(true);
    } else {
      setSmsEnabled(enabled);
      toast.success(enabled ? t.smsSaved : t.smsDisabled);
    }
  };

  const handleSavePhone = () => {
    if (phoneNumber.length >= 11) {
      setSmsEnabled(true);
      setShowSmsDialog(false);
      toast.success(t.smsSaved);
    } else {
      toast.error(language === "bn" ? "সঠিক ফোন নম্বর দিন" : "Enter a valid phone number");
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Header with Back Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.settings}</h1>
            <p className="text-sm text-muted-foreground">{t.customizeApp}</p>
          </div>
        </div>
      </header>

      {/* Settings Groups */}
      <section className="px-4 py-6 space-y-6">
        {/* Language */}
        <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
          <DialogTrigger asChild>
            <div className="rounded-2xl bg-card border border-border overflow-hidden cursor-pointer hover:bg-card/80 transition-colors">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t.language}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === "bn" ? "বাংলা 🇧🇩" : "English 🇺🇸"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{t.selectLanguage}</DialogTitle>
              <DialogDescription>
                {language === "bn" ? "আপনার পছন্দের ভাষা বেছে নিন" : "Choose your preferred language"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <button
                onClick={() => handleLanguageChange("bn")}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  language === "bn" 
                    ? "border-secondary bg-secondary/10" 
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇧🇩</span>
                  <span className="font-medium text-foreground">বাংলা</span>
                </div>
                {language === "bn" && <Check className="w-5 h-5 text-secondary" />}
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  language === "en" 
                    ? "border-secondary bg-secondary/10" 
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-medium text-foreground">English</span>
                </div>
                {language === "en" && <Check className="w-5 h-5 text-secondary" />}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <h3 className="px-4 pt-4 text-sm font-medium text-muted-foreground">{t.notifications}</h3>
          
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t.pushNotifications}</p>
                <p className="text-sm text-muted-foreground">{t.weatherMarketUpdate}</p>
              </div>
            </div>
            <Switch 
              checked={pushEnabled} 
              onCheckedChange={setPushEnabled}
            />
          </div>

          <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t.smsNotifications}</p>
                  <p className="text-sm text-muted-foreground">{t.importantAlerts}</p>
                  {smsEnabled && phoneNumber && (
                    <p className="text-xs text-secondary mt-1">📱 {phoneNumber}</p>
                  )}
                </div>
              </div>
              <Switch 
                checked={smsEnabled} 
                onCheckedChange={handleSmsToggle}
              />
            </div>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-secondary" />
                  {t.enterPhone}
                </DialogTitle>
                <DialogDescription>
                  {language === "bn" 
                    ? "SMS নোটিফিকেশন পেতে আপনার মোবাইল নম্বর দিন" 
                    : "Enter your mobile number to receive SMS notifications"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phoneNumber}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Button 
                  onClick={handleSavePhone}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {t.save}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Account */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <h3 className="px-4 pt-4 text-sm font-medium text-muted-foreground">{t.account}</h3>
          
          <Link to="/profile" className="p-4 flex items-center justify-between border-b border-border hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t.profile}</p>
                <p className="text-sm text-muted-foreground">{t.namePhone}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t.privacy}</p>
                <p className="text-sm text-muted-foreground">{t.dataProtection}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Help */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <Link to="/support" className="p-4 flex items-center justify-between border-b border-border hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t.help}</p>
                <p className="text-sm text-muted-foreground">{t.faq}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Info className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t.aboutApp}</p>
                <p className="text-sm text-muted-foreground">{t.version}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-4 mt-4">
        <div className="p-6 rounded-2xl bg-card border border-border text-center">
          <h2 className="text-xl font-bold text-foreground">agriশক্তি</h2>
          <p className="text-sm text-muted-foreground mt-4">
            {t.aiAssistant}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t.version}
          </p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-primary">
              {t.createdBy}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
