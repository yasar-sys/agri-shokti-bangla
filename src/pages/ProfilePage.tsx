import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Droplets, Globe, MapPinned, Scan, Award, Calendar, Loader2, Edit3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  blood_group: string | null;
  nationality: string | null;
  phone: string | null;
  total_scans: number;
  diseases_detected: number;
  days_active: number;
  xp_points: number;
  rank: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে');
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">আমার প্রোফাইল</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Edit3 className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 p-1 mx-auto">
              <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary rounded-full flex items-center justify-center border-4 border-background">
              <span className="text-secondary-foreground text-xs font-bold">
                {profile?.xp_points ? Math.floor(profile.xp_points / 100) + 1 : 1}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mt-4">
            {profile?.full_name || session?.user?.email?.split('@')[0] || 'কৃষক'}
          </h2>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          <p className="text-xs text-secondary mt-1">{profile?.rank || 'নতুন কৃষক'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4 text-center">
              <Scan className="w-6 h-6 text-secondary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{profile?.total_scans || 0}</p>
              <p className="text-xs text-muted-foreground">মোট স্ক্যান</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4 text-center">
              <Award className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{profile?.xp_points || 0}</p>
              <p className="text-xs text-muted-foreground">XP পয়েন্ট</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4 text-center">
              <Calendar className="w-6 h-6 text-chart-3 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{profile?.days_active || 1}</p>
              <p className="text-xs text-muted-foreground">দিন সক্রিয়</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-secondary" />
              ব্যক্তিগত তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">ইমেইল</p>
                <p className="text-sm text-foreground">{session?.user?.email}</p>
              </div>
            </div>

            {profile?.blood_group && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Droplets className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">রক্তের গ্রুপ</p>
                  <p className="text-sm text-foreground">{profile.blood_group}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">জাতীয়তা</p>
                <p className="text-sm text-foreground">{profile?.nationality || 'বাংলাদেশী'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              কার্যক্রম সারসংক্ষেপ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-xl">
              <span className="text-sm text-foreground">রোগ শনাক্ত করা হয়েছে</span>
              <span className="font-bold text-secondary">{profile?.diseases_detected || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl">
              <span className="text-sm text-foreground">মোট XP অর্জিত</span>
              <span className="font-bold text-primary">{profile?.xp_points || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-chart-3/10 rounded-xl">
              <span className="text-sm text-foreground">সক্রিয় দিন</span>
              <span className="font-bold text-chart-3">{profile?.days_active || 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/history">
            <Button variant="outline" className="w-full gap-2">
              <Scan className="w-4 h-4" />
              স্ক্যান ইতিহাস
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="outline" className="w-full gap-2">
              <Calendar className="w-4 h-4" />
              আমার ক্যালেন্ডার
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
