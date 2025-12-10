import { Globe, Bell, HelpCircle, Info, ChevronRight, User, Shield, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AgriBrainLogo } from "@/components/ui/AgriBrainLogo";

export default function SettingsPage() {
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">সেটিংস</h1>
        <p className="text-muted-foreground">অ্যাপ কাস্টমাইজ করুন</p>
      </header>

      {/* Settings Groups */}
      <section className="px-4 space-y-6">
        {/* Language */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">ভাষা</p>
                <p className="text-sm text-muted-foreground">বাংলা</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <h3 className="px-4 pt-4 text-sm font-medium text-muted-foreground">নোটিফিকেশন</h3>
          
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">পুশ নোটিফিকেশন</p>
                <p className="text-sm text-muted-foreground">আবহাওয়া ও বাজার আপডেট</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">SMS নোটিফিকেশন</p>
                <p className="text-sm text-muted-foreground">গুরুত্বপূর্ণ সতর্কতা</p>
              </div>
            </div>
            <Switch />
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <h3 className="px-4 pt-4 text-sm font-medium text-muted-foreground">অ্যাকাউন্ট</h3>
          
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">প্রোফাইল</p>
                <p className="text-sm text-muted-foreground">নাম ও ফোন নম্বর</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">গোপনীয়তা</p>
                <p className="text-sm text-muted-foreground">ডাটা সুরক্ষা সেটিংস</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Help */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">সাহায্য</p>
                <p className="text-sm text-muted-foreground">প্রশ্ন ও উত্তর</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Info className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">অ্যাপ সম্পর্কে</p>
                <p className="text-sm text-muted-foreground">সংস্করণ ১.০.০</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-4 mt-8">
        <div className="p-6 rounded-2xl bg-card border border-border text-center">
          <AgriBrainLogo size="sm" />
          <p className="text-sm text-muted-foreground mt-4">
            বাংলার কৃষকের AI সহকারী
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            সংস্করণ ১.০.০
          </p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-primary">
              Designed by Samin Yasar Sunny
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
