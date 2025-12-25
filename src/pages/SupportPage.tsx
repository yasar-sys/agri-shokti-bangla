import { ArrowLeft, Mail, Phone, MessageCircle, Clock, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

export default function SupportPage() {
  const { t } = useLanguage();
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('supportCenter')}</h1>
            <p className="text-sm text-muted-foreground">{t('contactUs')}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeadphonesIcon className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('weAreHere')}</h2>
          <p className="text-muted-foreground">{t('contactAnytime')}</p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-4">
          <Card className="bg-card/80 border-border overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/20 to-secondary/5 pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-secondary/20 rounded-xl">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                ইমেইল সাপোর্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <a 
                href="mailto:saminyasarsunny@gmail.com"
                className="text-lg font-semibold text-foreground hover:text-secondary transition-colors"
              >
                saminyasarsunny@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                ইমেইলে লিখুন, ২৪ ঘন্টার মধ্যে উত্তর পাবেন
              </p>
              <Button 
                asChild
                className="w-full mt-4 bg-secondary/10 text-secondary hover:bg-secondary/20"
                variant="ghost"
              >
                <a href="mailto:saminyasarsunny@gmail.com">
                  <Mail className="w-4 h-4 mr-2" />
                  ইমেইল পাঠান
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                ফোন সাপোর্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <a 
                href="tel:01865239302"
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
              >
                ০১৮৬৫-২৩৯৩০২
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                সকাল ৯টা - রাত ১০টা (প্রতিদিন)
              </p>
              <Button 
                asChild
                className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20"
                variant="ghost"
              >
                <a href="tel:01865239302">
                  <Phone className="w-4 h-4 mr-2" />
                  কল করুন
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-secondary" />
              সচরাচর জিজ্ঞাসা
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-xl">
              <p className="font-medium text-foreground text-sm">কিভাবে রোগ স্ক্যান করব?</p>
              <p className="text-xs text-muted-foreground mt-1">
                স্ক্যানার বাটনে ক্লিক করে ফসলের ছবি তুলুন, AI স্বয়ংক্রিয়ভাবে রোগ শনাক্ত করবে।
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl">
              <p className="font-medium text-foreground text-sm">সার ক্যালকুলেটর কিভাবে ব্যবহার করব?</p>
              <p className="text-xs text-muted-foreground mt-1">
                হোমপেজ থেকে সার ক্যালকুলেটরে গিয়ে জমির পরিমাণ ও ফসল সিলেক্ট করুন।
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl">
              <p className="font-medium text-foreground text-sm">অ্যাকাউন্ট তৈরি করতে টাকা লাগে?</p>
              <p className="text-xs text-muted-foreground mt-1">
                না, agriশক্তি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়।
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4 text-center">
              <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">সাপোর্ট সময়</p>
              <p className="text-xs text-muted-foreground">সকাল ৯টা - রাত ১০টা</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">অবস্থান</p>
              <p className="text-xs text-muted-foreground">ময়মনসিংহ, বাংলাদেশ</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Heart className="w-4 h-4 text-destructive" />
            TEAM_NEWBIES দ্বারা তৈরি
          </p>
        </div>
      </div>
    </div>
  );
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}
