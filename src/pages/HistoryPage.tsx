import { TimelineCard } from "@/components/ui/TimelineCard";
import { ArrowLeft, Loader2, History, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ScanHistoryItem {
  id: string;
  created_at: string;
  disease_name: string | null;
  health_score: number | null;
  symptoms: string[] | null;
  treatment: string | null;
}

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<ScanHistoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);

        const { data, error } = await supabase
          .from('scan_history')
          .select('id, created_at, disease_name, health_score, symptoms, treatment')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching scan history:', error);
        } else {
          setHistoryData(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'bn') {
      return date.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getResultType = (healthScore: number | null, diseaseName: string | null): 'healthy' | 'disease' => {
    if (healthScore && healthScore >= 80) return 'healthy';
    if (diseaseName?.includes('সুস্থ') || diseaseName?.toLowerCase().includes('healthy')) return 'healthy';
    return 'disease';
  };

  const getSummary = (item: ScanHistoryItem): string => {
    if (item.treatment) {
      return item.treatment.length > 80 ? item.treatment.substring(0, 80) + '...' : item.treatment;
    }
    if (item.symptoms && item.symptoms.length > 0) {
      return item.symptoms.slice(0, 2).join(', ');
    }
    return language === 'bn' ? 'বিস্তারিত তথ্য নেই' : 'No details available';
  };

  return (
    <div 
      className="mobile-container min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(/src/assets/bangladesh-village-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('scanHistoryTitle')}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>{isLoggedIn ? t('yourScans') : t('loginRequired')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin mb-4" />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {language === 'bn' 
                ? 'আপনার স্ক্যান ইতিহাস দেখতে লগইন করুন' 
                : 'Please login to view your scan history'}
            </p>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              {t('login')}
            </Link>
          </div>
        ) : historyData.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'bn' ? 'কোন স্ক্যান নেই' : 'No Scans Yet'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {language === 'bn' 
                ? 'ফসলের ছবি স্ক্যান করুন, এখানে ইতিহাস দেখা যাবে' 
                : 'Scan crop images to see history here'}
            </p>
            <Link 
              to="/camera"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              {t('scanNow')}
            </Link>
          </div>
        ) : (
          historyData.map((item) => (
            <TimelineCard
              key={item.id}
              date={formatDate(item.created_at)}
              cropName={item.disease_name || (language === 'bn' ? 'অজানা' : 'Unknown')}
              result={getResultType(item.health_score, item.disease_name)}
              summary={getSummary(item)}
            />
          ))
        )}
      </section>
    </div>
  );
}
