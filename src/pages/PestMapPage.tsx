import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Bug, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Shield,
  Users,
  Flame,
  ThermometerSun,
  RefreshCw,
  Plus,
  X,
  Send,
  Droplets,
  Thermometer
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePestData, DistrictStats } from "@/hooks/usePestData";
import PestMapbox from "@/components/PestMapbox";
import { Button } from "@/components/ui/button";

export default function PestMapPage() {
  const { 
    reports, 
    districtStats, 
    weatherRisks, 
    loading, 
    lastUpdated, 
    submitReport, 
    refetch,
    commonPests,
    bangladeshDistricts 
  } = usePestData();
  
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictStats | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "alerts" | "reports">("map");
  const [showReportForm, setShowReportForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Report form state
  const [reportForm, setReportForm] = useState({
    district: '',
    pest_name: '',
    pest_name_bn: '',
    crop_type: '',
    severity: 'medium',
    description: '',
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSubmitReport = async () => {
    if (!reportForm.district || !reportForm.pest_name_bn || !reportForm.crop_type) {
      return;
    }

    const districtData = bangladeshDistricts.find(d => d.name === reportForm.district);
    if (!districtData) return;

    const success = await submitReport({
      latitude: districtData.lat,
      longitude: districtData.lng,
      district: reportForm.district,
      pest_name: reportForm.pest_name || reportForm.pest_name_bn,
      pest_name_bn: reportForm.pest_name_bn,
      crop_type: reportForm.crop_type,
      severity: reportForm.severity,
      description: reportForm.description,
    });

    if (success) {
      setShowReportForm(false);
      setReportForm({
        district: '',
        pest_name: '',
        pest_name_bn: '',
        crop_type: '',
        severity: 'medium',
        description: '',
      });
    }
  };

  const highRiskCount = districtStats.filter(d => d.riskLevel === "high").length;
  const totalReports = reports.length;

  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
    return `${diffDays} দিন আগে`;
  };

  // Generate AI-based alerts from weather and pest data
  const generateAlerts = () => {
    const alerts: Array<{
      title: string;
      description: string;
      severity: 'high' | 'medium';
      affectedAreas: string[];
      precautions: string[];
    }> = [];

    // High risk district alert
    const highRiskDistricts = districtStats.filter(d => d.riskLevel === 'high');
    if (highRiskDistricts.length > 0) {
      const mainPests = [...new Set(highRiskDistricts.map(d => d.mainPest))].slice(0, 2);
      alerts.push({
        title: `${mainPests[0]} আক্রমণ সতর্কতা`,
        description: `${highRiskDistricts.length}টি জেলায় ${mainPests[0]} এর আক্রমণ বৃদ্ধি পাচ্ছে। দ্রুত ব্যবস্থা নিন।`,
        severity: 'high',
        affectedAreas: highRiskDistricts.map(d => d.district_bn),
        precautions: [
          'আলোর ফাঁদ ব্যবহার করুন',
          'ফেরোমন ফাঁদ স্থাপন করুন',
          'প্রতিদিন মাঠ পরিদর্শন করুন',
          'অনুমোদিত কীটনাশক স্প্রে করুন'
        ]
      });
    }

    // Weather-based alert
    const humidDistricts = districtStats.filter(d => d.weatherRisk >= 70);
    if (humidDistricts.length > 0) {
      alerts.push({
        title: 'উচ্চ আর্দ্রতা জনিত পোকার ঝুঁকি',
        description: 'বর্তমান আবহাওয়ায় উচ্চ আর্দ্রতার কারণে পোকামাকড়ের বংশবৃদ্ধি বাড়তে পারে।',
        severity: 'medium',
        affectedAreas: humidDistricts.slice(0, 4).map(d => d.district_bn),
        precautions: [
          'জমিতে পানি জমতে দেবেন না',
          'সুষম সার ব্যবহার করুন',
          'প্রাকৃতিক শত্রু সংরক্ষণ করুন',
          'জৈব কীটনাশক ব্যবহার বিবেচনা করুন'
        ]
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  return (
    <div 
      className="mobile-container min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home" className="p-2 -ml-2 rounded-full hover:bg-muted">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">পোকার আক্রমণ ম্যাপ</h1>
              <p className="text-xs text-muted-foreground">
                রিয়েল-টাইম • {lastUpdated ? formatTime(lastUpdated) : 'লোড হচ্ছে...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
            </Button>
            <Button 
              size="icon"
              onClick={() => setShowReportForm(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">পোকার রিপোর্ট দিন</h2>
              <button onClick={() => setShowReportForm(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">জেলা *</label>
                <select
                  value={reportForm.district}
                  onChange={(e) => setReportForm({...reportForm, district: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">জেলা নির্বাচন করুন</option>
                  {bangladeshDistricts.map(d => (
                    <option key={d.name} value={d.name}>{d.name_bn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">পোকার নাম *</label>
                <select
                  value={reportForm.pest_name_bn}
                  onChange={(e) => {
                    const pest = commonPests.find(p => p.name_bn === e.target.value);
                    setReportForm({
                      ...reportForm, 
                      pest_name_bn: e.target.value,
                      pest_name: pest?.name || e.target.value
                    });
                  }}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">পোকা নির্বাচন করুন</option>
                  {commonPests.map(p => (
                    <option key={p.name} value={p.name_bn}>{p.name_bn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ফসল *</label>
                <input
                  type="text"
                  value={reportForm.crop_type}
                  onChange={(e) => setReportForm({...reportForm, crop_type: e.target.value})}
                  placeholder="যেমন: ধান, গম, আলু"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">তীব্রতা</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      onClick={() => setReportForm({...reportForm, severity: level})}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        reportForm.severity === level
                          ? level === 'high' 
                            ? 'bg-destructive text-destructive-foreground'
                            : level === 'medium'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {level === 'high' ? 'উচ্চ' : level === 'medium' ? 'মাঝারি' : 'কম'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="আক্রমণের বিস্তারিত লিখুন..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>

              <Button 
                className="w-full"
                onClick={handleSubmitReport}
                disabled={!reportForm.district || !reportForm.pest_name_bn || !reportForm.crop_type}
              >
                <Send className="w-4 h-4 mr-2" />
                রিপোর্ট জমা দিন
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-destructive/20 border border-destructive/30 rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{highRiskCount}</p>
            <p className="text-xs text-muted-foreground">ঝুঁকিপূর্ণ জেলা</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Bug className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{totalReports}</p>
            <p className="text-xs text-muted-foreground">রিপোর্ট (৭ দিনে)</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{districtStats.length}</p>
            <p className="text-xs text-muted-foreground">পর্যবেক্ষণ জেলা</p>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="px-4 mb-4">
        <div className="flex bg-muted rounded-xl p-1">
          {[
            { id: "map", label: "ম্যাপ", icon: MapPin },
            { id: "alerts", label: "সতর্কতা", icon: AlertTriangle },
            { id: "reports", label: "রিপোর্ট", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "alerts" && alerts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-destructive" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Map View */}
      {activeTab === "map" && (
        <section className="px-4 space-y-4">
          {/* Interactive Map */}
          <PestMapbox 
            districtStats={districtStats}
            onDistrictClick={setSelectedDistrict}
            selectedDistrict={selectedDistrict?.district}
          />

          {/* Selected District Details */}
          {selectedDistrict && (
            <div className={cn(
              "p-4 rounded-xl border animate-in slide-in-from-bottom-4",
              selectedDistrict.riskLevel === "high" && "bg-destructive/10 border-destructive/30",
              selectedDistrict.riskLevel === "medium" && "bg-primary/10 border-primary/30",
              selectedDistrict.riskLevel === "low" && "bg-secondary/10 border-secondary/30"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-foreground" />
                  <h3 className="font-semibold text-foreground">{selectedDistrict.district_bn}</h3>
                </div>
                <button onClick={() => setSelectedDistrict(null)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">প্রধান পোকা</p>
                  <p className="text-sm font-medium text-foreground">{selectedDistrict.mainPest}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">রিপোর্ট সংখ্যা</p>
                  <p className="text-sm font-medium text-foreground">{selectedDistrict.reports} টি</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">প্রবণতা</p>
                  <div className="flex items-center gap-1">
                    {selectedDistrict.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-destructive" />}
                    {selectedDistrict.trend === 'decreasing' && <TrendingUp className="w-4 h-4 text-secondary rotate-180" />}
                    {selectedDistrict.trend === 'stable' && <div className="w-4 h-4 border-t-2 border-muted-foreground" />}
                    <span className="text-sm font-medium text-foreground">
                      {selectedDistrict.trend === "increasing" && "বাড়ছে"}
                      {selectedDistrict.trend === "decreasing" && "কমছে"}
                      {selectedDistrict.trend === "stable" && "স্থির"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">আবহাওয়া ঝুঁকি</p>
                  <p className="text-sm font-medium text-foreground">{selectedDistrict.weatherRisk}%</p>
                </div>
              </div>

              {/* Weather details if available */}
              {weatherRisks.get(selectedDistrict.district) && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">
                        {weatherRisks.get(selectedDistrict.district)?.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-chart-3" />
                      <span className="text-sm text-foreground">
                        {weatherRisks.get(selectedDistrict.district)?.humidity.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThermometerSun className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-secondary">AI বিশ্লেষণ</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {districtStats.filter(d => d.riskLevel === 'high').length > 0 ? (
                <>
                  বর্তমান আবহাওয়া ও আর্দ্রতার কারণে{' '}
                  <span className="font-semibold text-destructive">
                    {districtStats.filter(d => d.riskLevel === 'high').slice(0, 2).map(d => d.mainPest).join(' ও ')}
                  </span>{' '}
                  এর আক্রমণ বাড়ার সম্ভাবনা রয়েছে। আগামী ৭ দিনে{' '}
                  <span className="font-semibold">
                    {districtStats.filter(d => d.riskLevel === 'high').slice(0, 2).map(d => d.district_bn).join(' ও ')}
                  </span>{' '}
                  জেলায় বিশেষ সতর্কতা অবলম্বন করুন।
                </>
              ) : (
                'বর্তমানে পোকার আক্রমণ নিয়ন্ত্রণে আছে। নিয়মিত মাঠ পরিদর্শন চালিয়ে যান।'
              )}
            </p>
          </div>
        </section>
      )}

      {/* Alerts View */}
      {activeTab === "alerts" && (
        <section className="px-4 space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">কোন সতর্কতা নেই</h3>
              <p className="text-sm text-muted-foreground">বর্তমানে কোন জরুরি সতর্কতা নেই</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-2xl p-4 border",
                  alert.severity === "high" 
                    ? "bg-destructive/10 border-destructive/30" 
                    : "bg-primary/10 border-primary/30"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    alert.severity === "high" ? "bg-destructive/20" : "bg-primary/20"
                  )}>
                    <AlertTriangle className={cn(
                      "w-5 h-5",
                      alert.severity === "high" ? "text-destructive" : "text-primary"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-semibold",
                      alert.severity === "high" ? "text-destructive" : "text-primary"
                    )}>
                      {alert.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">আক্রান্ত এলাকা:</p>
                  <div className="flex flex-wrap gap-1">
                    {alert.affectedAreas.slice(0, 5).map((area, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-muted rounded-full text-xs text-foreground"
                      >
                        {area}
                      </span>
                    ))}
                    {alert.affectedAreas.length > 5 && (
                      <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                        +{alert.affectedAreas.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-background/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-medium text-foreground">প্রতিরোধ ব্যবস্থা</span>
                  </div>
                  <ul className="space-y-1">
                    {alert.precautions.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-secondary mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Reports View */}
      {activeTab === "reports" && (
        <section className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">সাম্প্রতিক রিপোর্ট</h2>
            <Button size="sm" variant="outline" onClick={() => setShowReportForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              রিপোর্ট দিন
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">কোন রিপোর্ট নেই</h3>
              <p className="text-sm text-muted-foreground mb-4">
                এখনো কোন পোকার রিপোর্ট জমা হয়নি
              </p>
              <Button onClick={() => setShowReportForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                প্রথম রিপোর্ট দিন
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 10).map((report) => (
                <div 
                  key={report.id}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        report.severity === 'high' ? "bg-destructive/20" : 
                        report.severity === 'medium' ? "bg-primary/20" : "bg-secondary/20"
                      )}>
                        <Bug className={cn(
                          "w-4 h-4",
                          report.severity === 'high' ? "text-destructive" : 
                          report.severity === 'medium' ? "text-primary" : "text-secondary"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{report.pest_name_bn}</h4>
                        <p className="text-xs text-muted-foreground">{report.crop_type} • {report.district}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      report.severity === 'high' ? "bg-destructive/20 text-destructive" :
                      report.severity === 'medium' ? "bg-primary/20 text-primary" :
                      "bg-secondary/20 text-secondary"
                    )}>
                      {report.severity === 'high' ? 'উচ্চ' : report.severity === 'medium' ? 'মাঝারি' : 'কম'}
                    </span>
                  </div>
                  
                  {report.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{report.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{formatRelativeTime(report.created_at)}</span>
                    {report.is_verified && (
                      <span className="flex items-center gap-1 text-secondary">
                        <Shield className="w-3 h-3" />
                        যাচাইকৃত
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
