import { ArrowLeft, Warehouse, Plus, Package, Thermometer, Droplets, AlertTriangle, CheckCircle2, Trash2, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useState, useEffect } from "react";
import { useCropStorage, NewCropStorage } from "@/hooks/useCropStorage";
import { supabase } from "@/integrations/supabase/client";

const storageTips = [
  { emoji: "🌾", tip: "ধান সংরক্ষণের আগে ভালোভাবে শুকিয়ে নিন (আর্দ্রতা ১২% এর নিচে)" },
  { emoji: "🥔", tip: "আলু ঠান্ডা ও অন্ধকার জায়গায় রাখুন, আলো থেকে দূরে রাখুন" },
  { emoji: "🧅", tip: "পেঁয়াজ শুষ্ক ও বাতাস চলাচল করে এমন জায়গায় রাখুন" },
  { emoji: "🏠", tip: "গুদামে ইঁদুর ও পোকামাকড় প্রতিরোধ ব্যবস্থা রাখুন" }
];

const storageTypes = ["ঐতিহ্যবাহী", "আধুনিক", "কোল্ড স্টোরেজ", "সমবায় গুদাম", "বাড়ির গোলা"];
const conditions = [
  { value: "excellent", label: "চমৎকার" },
  { value: "good", label: "ভালো" },
  { value: "warning", label: "সতর্কতা" },
  { value: "danger", label: "ঝুঁকিপূর্ণ" },
];
const units = ["মণ", "কেজি", "বস্তা", "টন"];

export default function StoragePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { storageItems, loading, userId, addStorageItem, deleteStorageItem, getStats } = useCropStorage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<NewCropStorage>({
    crop_name: "",
    quantity: "",
    unit: "মণ",
    location: "",
    storage_type: "ঐতিহ্যবাহী",
    condition: "good",
    moisture: "",
    temperature: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session?.user);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-secondary bg-secondary/20';
      case 'good': return 'text-chart-4 bg-chart-4/20';
      case 'warning': return 'text-primary bg-primary/20';
      default: return 'text-destructive bg-destructive/20';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'চমৎকার';
      case 'good': return 'ভালো';
      case 'warning': return 'সতর্কতা';
      default: return 'ঝুঁকিপূর্ণ';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crop_name || !formData.quantity || !formData.location) {
      return;
    }

    const success = await addStorageItem(formData);
    if (success) {
      setShowAddForm(false);
      setFormData({
        crop_name: "",
        quantity: "",
        unit: "মণ",
        location: "",
        storage_type: "ঐতিহ্যবাহী",
        condition: "good",
        moisture: "",
        temperature: "",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই সংরক্ষণ মুছে ফেলতে চান?')) {
      await deleteStorageItem(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = getStats();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pb-24 relative">
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

        <header className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">গুদাম ব্যবস্থাপনা</h1>
              <p className="text-xs text-muted-foreground">ফসল সংরক্ষণ ট্র্যাকিং</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-12 text-center">
          <Warehouse className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">লগইন প্রয়োজন</h2>
          <p className="text-sm text-muted-foreground mb-4">
            আপনার ফসল সংরক্ষণ ট্র্যাক করতে প্রথমে লগইন করুন
          </p>
          <Button onClick={() => navigate('/auth')}>
            লগইন করুন
          </Button>
        </div>
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
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">গুদাম ব্যবস্থাপনা</h1>
            <p className="text-xs text-muted-foreground">ফসল সংরক্ষণ ট্র্যাকিং</p>
          </div>
          <Button size="icon" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Add Form */}
      {showAddForm && (
        <section className="px-4 mb-4">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground mb-2">নতুন ফসল সংরক্ষণ</h3>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ফসলের নাম *</label>
              <input
                type="text"
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                placeholder="যেমন: ধান, গম, আলু"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">পরিমাণ *</label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="যেমন: ২০"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">একক</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">সংরক্ষণ স্থান *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="যেমন: বাড়ির গোলা, সমবায় গুদাম"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">গুদামের ধরন</label>
                <select
                  value={formData.storage_type}
                  onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  {storageTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">অবস্থা</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">আর্দ্রতা</label>
                <input
                  type="text"
                  value={formData.moisture || ""}
                  onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                  placeholder="যেমন: ১২%"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">তাপমাত্রা</label>
                <input
                  type="text"
                  value={formData.temperature || ""}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="যেমন: ২৫°C"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              সংরক্ষণ করুন
            </Button>
          </form>
        </section>
      )}

      {/* Summary */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Package className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalCrops}</p>
            <p className="text-xs text-muted-foreground">মোট ফসল</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Warehouse className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.uniqueLocations}</p>
            <p className="text-xs text-muted-foreground">গুদাম</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.warnings}</p>
            <p className="text-xs text-muted-foreground">সতর্কতা</p>
          </div>
        </div>
      </section>

      {/* Storage List */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">সংরক্ষিত ফসল</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : storageItems.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">কোন ফসল সংরক্ষিত নেই</p>
            <p className="text-sm text-muted-foreground">উপরে + বাটনে ক্লিক করে নতুন ফসল যোগ করুন</p>
          </div>
        ) : (
          <div className="space-y-3">
            {storageItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.crop_name}</h3>
                      <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} • {item.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                      {getConditionText(item.condition)}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background/50 rounded-lg p-2">
                    <Droplets className="w-4 h-4 text-chart-3 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
                    <p className="text-sm font-medium text-foreground">{item.moisture || '-'}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2">
                    <Thermometer className="w-4 h-4 text-destructive mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">তাপমাত্রা</p>
                    <p className="text-sm font-medium text-foreground">{item.temperature || '-'}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2">
                    <CheckCircle2 className="w-4 h-4 text-chart-4 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">সংরক্ষণ</p>
                    <p className="text-sm font-medium text-foreground">{item.storage_type}</p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  সংরক্ষণের তারিখ: {formatDate(item.stored_date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Storage Tips */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">সংরক্ষণ টিপস</h2>
        <div className="space-y-2">
          {storageTips.map((item, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
              <span className="text-xl">{item.emoji}</span>
              <p className="text-sm text-foreground">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
