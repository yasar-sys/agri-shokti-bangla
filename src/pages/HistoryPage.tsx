import { TimelineCard } from "@/components/ui/TimelineCard";
import { ArrowLeft, Loader2, AlertCircle, Trash2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScanHistory } from "@/hooks/useScanHistory";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const { scans, loading, isAuthenticated, deleteScan, getStats } = useScanHistory();
  
  const stats = getStats();

  const formatDate = (dateString: string) => {
    try {
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
    } catch {
      return dateString;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: language === 'bn' ? bn : undefined 
      });
    } catch {
      return '';
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div 
        className="mobile-container min-h-screen pb-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(${villageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
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
            </div>
          </div>
        </header>

        <section className="px-4">
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {language === 'bn' ? 'লগইন করুন' : 'Please Login'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'bn' 
                ? 'আপনার স্ক্যান ইতিহাস দেখতে লগইন করুন। প্রতিটি স্ক্যান আপনার একাউন্টে সংরক্ষিত থাকবে।'
                : 'Login to view your scan history. Each scan will be saved to your account.'
              }
            </p>
            <Link to="/auth">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <LogIn className="w-4 h-4 mr-2" />
                {language === 'bn' ? 'লগইন করুন' : 'Login'}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div 
      className="mobile-container min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(${villageBg})`,
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
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'bn' ? `মোট ${stats.totalScans}টি স্ক্যান` : `Total ${stats.totalScans} scans`}
            </p>
          </div>
        </div>
      </header>

      {/* Statistics */}
      {scans.length > 0 && (
        <section className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-3 text-center border border-border/50">
              <p className="text-2xl font-bold text-secondary">{stats.totalScans}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'bn' ? 'মোট স্ক্যান' : 'Total Scans'}
              </p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center border border-border/50">
              <p className="text-2xl font-bold text-destructive">{stats.diseasesDetected}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'bn' ? 'রোগ সনাক্ত' : 'Diseases Found'}
              </p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center border border-border/50">
              <p className="text-2xl font-bold text-primary">{stats.avgHealthScore}%</p>
              <p className="text-xs text-muted-foreground">
                {language === 'bn' ? 'গড় স্বাস্থ্য' : 'Avg Health'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && scans.length === 0 && (
        <section className="px-4">
          <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {language === 'bn' ? 'কোন স্ক্যান নেই' : 'No Scans Yet'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'bn' 
                ? 'ফসলের রোগ সনাক্ত করতে ক্যামেরা দিয়ে স্ক্যান করুন'
                : 'Scan your crops with the camera to detect diseases'
              }
            </p>
            <Link to="/camera">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {language === 'bn' ? 'স্ক্যান করুন' : 'Start Scanning'}
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Scan Timeline */}
      {!loading && scans.length > 0 && (
        <section className="px-4">
          {scans.map((scan, index) => (
            <div key={scan.id} className="relative">
              <TimelineCard
                date={formatDate(scan.created_at)}
                cropName={scan.disease_name || (language === 'bn' ? 'অজানা' : 'Unknown')}
                result={scan.health_score && scan.health_score >= 80 ? "healthy" : "disease"}
                summary={scan.treatment || (language === 'bn' ? 'বিস্তারিত দেখতে ক্লিক করুন' : 'Click for details')}
              />
              {/* Time ago badge */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {formatTimeAgo(scan.created_at)}
                </span>
                <button
                  onClick={() => deleteScan(scan.id)}
                  className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
