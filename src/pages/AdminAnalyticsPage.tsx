import { ArrowLeft, Users, Activity, Bug, TrendingUp, BarChart3, RefreshCw, Shield, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const featureIcons: Record<string, string> = {
  'disease_scan': '🔬',
  'chat': '💬',
  'market': '📊',
  'weather': '🌤️',
  'calendar': '📅',
  'fertilizer': '🧪',
  'community': '👥',
  'knowledge': '📚',
  'pest_map': '🐛',
  'satellite': '🛰️',
};

const diseaseColors = [
  'from-red-500/20 to-red-600/20 border-red-500/30',
  'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  'from-lime-500/20 to-lime-600/20 border-lime-500/30',
];

export default function AdminAnalyticsPage() {
  const { isAdmin, loading, error, engagement, features, diseases, refetch } = useAdminAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">অ্যানালিটিক্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full bg-card/90 border-destructive/30">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">অ্যাক্সেস নেই</h2>
            <p className="text-muted-foreground mb-4">{error || 'এই পেজে অ্যাক্সেস করতে অ্যাডমিন অধিকার প্রয়োজন।'}</p>
            <Link to="/home">
              <Button variant="outline">হোমে ফিরে যান</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${villageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/home">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                অ্যাডমিন ড্যাশবোর্ড
              </h1>
              <p className="text-xs text-muted-foreground">অ্যানালিটিক্স ও রিপোর্ট</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Engagement Stats */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            ব্যবহারকারী এনগেজমেন্ট
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-foreground">{engagement?.total_users || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">মোট ব্যবহারকারী</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-foreground">{engagement?.active_users_today || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">আজকে সক্রিয়</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-foreground">{engagement?.active_users_week || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">সাপ্তাহিক সক্রিয়</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-foreground">{engagement?.total_scans || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">মোট স্ক্যান</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.total_posts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">কমিউনিটি পোস্ট</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.total_chat_messages || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">চ্যাট মেসেজ</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature Usage */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            ফিচার ব্যবহার (৩০ দিন)
          </h2>
          {features.length > 0 ? (
            <div className="space-y-3">
              {features.slice(0, 10).map((feature, idx) => {
                const maxCount = features[0]?.usage_count || 1;
                const percentage = (feature.usage_count / maxCount) * 100;
                
                return (
                  <Card key={feature.feature_name} className="bg-card/80 border-border/50">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{featureIcons[feature.feature_name] || '📱'}</span>
                          <span className="font-medium text-foreground">{feature.feature_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">{feature.usage_count}</span>
                          <span className="text-xs text-muted-foreground ml-1">বার</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {feature.unique_users} জন ব্যবহারকারী
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="py-8 text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">কোনো ফিচার ব্যবহারের ডেটা নেই</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Disease Trends */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5 text-destructive" />
            রোগ প্রবণতা (৩০ দিন)
          </h2>
          {diseases.length > 0 ? (
            <div className="space-y-3">
              {diseases.slice(0, 8).map((disease, idx) => (
                <Card 
                  key={disease.disease} 
                  className={cn(
                    "bg-gradient-to-r border",
                    diseaseColors[idx % diseaseColors.length]
                  )}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{disease.disease}</p>
                        <p className="text-xs text-muted-foreground">
                          সর্বশেষ: {new Date(disease.latest_date).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{disease.case_count}</p>
                        <p className="text-[10px] text-muted-foreground">কেস</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="py-8 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">কোনো রোগের ডেটা নেই</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
