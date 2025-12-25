import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, UserPlus, LogIn, Loader2, User, Droplets, Globe, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AuthPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [nationality, setNationality] = useState(t('bangladeshi'));
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nationalities = [t('bangladeshi'), t('indian'), t('other')];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/home");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        if (error.message.includes("Invalid login credentials")) {
          toast.error(t('wrongEmailPass'));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(t('loginSuccess'));
        // Navigation will happen via onAuthStateChange
      }
    } catch (err) {
      setLoading(false);
      toast.error(t('somethingWrong'));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error(t('fillNameEmailPass'));
      return;
    }

    if (password.length < 6) {
      toast.error(language === 'en' ? "Password must be at least 6 characters" : "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            avatar_url: avatarUrl,
            blood_group: bloodGroup,
            nationality: nationality,
          },
        },
      });

      if (error) {
        setLoading(false);
        if (error.message.includes("already registered")) {
          toast.error(t('emailAlreadyUsed'));
        } else {
          toast.error(error.message);
        }
      } else if (data.session) {
        toast.success(t('accountCreated'));
        // Navigation will happen via onAuthStateChange
      } else {
        setLoading(false);
        toast.success(t('accountCreated'));
        navigate("/home");
      }
    } catch (err) {
      setLoading(false);
      toast.error(t('somethingWrong'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
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
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('back')}</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">👨‍🌾</div>
          <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('aiAssistantFull')}</p>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="gap-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <LogIn className="w-4 h-4" />
                  {t('loginTitle')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <UserPlus className="w-4 h-4" />
                  {t('registerTitle')}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Login Tab */}
              <TabsContent value="login">
                <CardTitle className="text-lg mb-1">{t('welcomeBack')}</CardTitle>
                <CardDescription className="mb-4">{t('loginToAccount')}</CardDescription>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {t('email')}
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('yourEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      {t('password')}
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('yourPassword')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('wait')}
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('loginBtn')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <CardTitle className="text-lg mb-1">{t('openAccount')}</CardTitle>
                <CardDescription className="mb-4">{t('createNewAccount')}</CardDescription>
                
                <form onSubmit={handleSignup} className="space-y-3">
                  {/* Avatar Upload */}
                  <div className="flex justify-center mb-4">
                    <label className="cursor-pointer">
                      <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-secondary transition-colors">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground text-center mt-1">{t('uploadPhoto')}</p>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      {t('fullName')}
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder={t('yourFullName')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {t('email')}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('yourEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      {t('password')}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('minPassword')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <Droplets className="w-4 h-4" />
                        {t('bloodGroup')}
                      </Label>
                      <Select value={bloodGroup} onValueChange={setBloodGroup}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder={t('select')} />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        {t('nationality')}
                      </Label>
                      <Select value={nationality} onValueChange={setNationality}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder={t('select')} />
                        </SelectTrigger>
                        <SelectContent>
                          {nationalities.map((nat) => (
                            <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('wait')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t('signupBtn')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {t('createdBy')}
        </p>
      </div>
    </div>
  );
}
