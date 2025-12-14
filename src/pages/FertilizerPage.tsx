import { Beaker, Leaf, Wheat, Carrot, Apple, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "সব", icon: Beaker },
  { id: "grains", label: "শস্য", icon: Wheat },
  { id: "vegetables", label: "সবজি", icon: Carrot },
  { id: "fruits", label: "ফল", icon: Apple },
];

interface FertilizerData {
  crop: string;
  category: string;
  emoji: string;
  fertilizers: {
    name: string;
    amount: string;
    timing: string;
  }[];
  tips: string;
}

const fertilizerData: FertilizerData[] = [
  {
    crop: "ধান",
    category: "grains",
    emoji: "🌾",
    fertilizers: [
      { name: "ইউরিয়া", amount: "২৫০-২৮০ কেজি/হেক্টর", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "১২০-১৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "১২০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "জিপসাম", amount: "১০০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "ইউরিয়া ৩ ভাগে দিন: রোপণের ১৫, ৩০ ও ৪৫ দিন পর।"
  },
  {
    crop: "গম",
    category: "grains",
    emoji: "🌾",
    fertilizers: [
      { name: "ইউরিয়া", amount: "১৮০-২২০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
      { name: "TSP", amount: "১৪০-১৮০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "৫০-৬০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "বপনের সময় অর্ধেক ইউরিয়া, বাকি অর্ধেক মুকুট পর্যায়ে দিন।"
  },
  {
    crop: "ভুট্টা",
    category: "grains",
    emoji: "🌽",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৫০০-৫৫০ কেজি/হেক্টর", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "২৫০-২৭০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "২০০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "জিংক সালফেট", amount: "১০-১৫ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "ভুট্টায় জিংক খুব জরুরি। জিংকের অভাবে পাতা সাদা হয়ে যায়।"
  },
  {
    crop: "আলু",
    category: "vegetables",
    emoji: "🥔",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৩৫০-৪০০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
      { name: "TSP", amount: "২২০-২৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "৩০০-৩৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "জিপসাম", amount: "১২০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "আলুতে পটাশ বেশি লাগে। MoP দিলে আলু বড় ও মজবুত হয়।"
  },
  {
    crop: "টমেটো",
    category: "vegetables",
    emoji: "🍅",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৩০০ কেজি/হেক্টর", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "২৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "২০০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
      { name: "বোরন", amount: "১০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "বোরনের অভাবে ফল ফাটে ও কালো দাগ হয়। বোরন অবশ্যই দিন।"
  },
  {
    crop: "বেগুন",
    category: "vegetables",
    emoji: "🍆",
    fertilizers: [
      { name: "ইউরিয়া", amount: "২৫০-৩০০ কেজি/হেক্টর", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "১৫০-২০০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "১৫০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
    ],
    tips: "ফুল আসার আগে ইউরিয়া দিন, ফল ধরার পর MoP দিন।"
  },
  {
    crop: "পেঁয়াজ",
    category: "vegetables",
    emoji: "🧅",
    fertilizers: [
      { name: "ইউরিয়া", amount: "২০০-২৫০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
      { name: "TSP", amount: "১৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "১৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "সালফার", amount: "২০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "সালফার পেঁয়াজের ঝাঁঝ বাড়ায় ও সংরক্ষণ ক্ষমতা বৃদ্ধি করে।"
  },
  {
    crop: "রসুন",
    category: "vegetables",
    emoji: "🧄",
    fertilizers: [
      { name: "ইউরিয়া", amount: "২০০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
      { name: "TSP", amount: "১২০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "১২০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "সালফার", amount: "১৫ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "রসুনে সালফার অত্যন্ত গুরুত্বপূর্ণ। এটি গন্ধ ও স্বাদ বাড়ায়।"
  },
  {
    crop: "ফুলকপি",
    category: "vegetables",
    emoji: "🥬",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৩০০ কেজি/হেক্টর", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "২০০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "১৫০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "বোরন", amount: "১৫ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "মলিবডেনাম", amount: "১ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
    ],
    tips: "বোরনের অভাবে ফুলকপির মাথা বাদামি হয় ও ফাঁপা হয়ে যায়।"
  },
  {
    crop: "মরিচ",
    category: "vegetables",
    emoji: "🌶️",
    fertilizers: [
      { name: "ইউরিয়া", amount: "২৫০ কেজি/হেক্টর", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "২০০ কেজি/হেক্টর", timing: "বেসাল ডোজ" },
      { name: "MoP", amount: "১৫০ কেজি/হেক্টর", timing: "২ কিস্তিতে" },
    ],
    tips: "ফুল ও ফল আসার সময় পটাশ দিলে ফলন বাড়ে।"
  },
  {
    crop: "আম",
    category: "fruits",
    emoji: "🥭",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৫০০ গ্রাম/গাছ/বছর", timing: "বর্ষার পর" },
      { name: "TSP", amount: "৩০০ গ্রাম/গাছ/বছর", timing: "বর্ষার পর" },
      { name: "MoP", amount: "৫০০ গ্রাম/গাছ/বছর", timing: "বর্ষার পর" },
      { name: "বোরন", amount: "২০ গ্রাম/গাছ", timing: "মুকুল আসার আগে" },
    ],
    tips: "ফল ঝরে পড়া রোধে বোরন ও পটাশ স্প্রে করুন।"
  },
  {
    crop: "কলা",
    category: "fruits",
    emoji: "🍌",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৫০০ গ্রাম/গাছ", timing: "৩ কিস্তিতে" },
      { name: "TSP", amount: "২৫০ গ্রাম/গাছ", timing: "রোপণের সময়" },
      { name: "MoP", amount: "৫০০ গ্রাম/গাছ", timing: "৩ কিস্তিতে" },
    ],
    tips: "কলায় পটাশ খুব বেশি লাগে। MoP না দিলে ফল ছোট হয়।"
  },
  {
    crop: "পেঁপে",
    category: "fruits",
    emoji: "🍈",
    fertilizers: [
      { name: "ইউরিয়া", amount: "৪০০ গ্রাম/গাছ/বছর", timing: "৪ কিস্তিতে" },
      { name: "TSP", amount: "২৫০ গ্রাম/গাছ/বছর", timing: "২ কিস্তিতে" },
      { name: "MoP", amount: "৪০০ গ্রাম/গাছ/বছর", timing: "৪ কিস্তিতে" },
    ],
    tips: "প্রতি ৩ মাস পর পর সার দিন। নিয়মিত সার দিলে সারা বছর ফল পাবেন।"
  },
];

export default function FertilizerPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = fertilizerData.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Beaker className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">সার পরামর্শ</h1>
            <p className="text-sm text-muted-foreground">ফসল অনুযায়ী সার ব্যবহার</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ফসলের নাম খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
          />
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              )}
            >
              <cat.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Info Card */}
      <section className="px-4 mb-4">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Leaf className="w-6 h-6 text-secondary mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">সার ব্যবহারের সাধারণ নিয়ম</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                বেসাল ডোজ = রোপণ/বপনের সময় প্রয়োগ। সব সময় মাটি পরীক্ষা করে সার দিন। জৈব সার ব্যবহার করলে রাসায়নিক সার কম লাগে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fertilizer Cards */}
      <section className="px-4 space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {activeCategory === "all" ? "সব ফসল" : categories.find(c => c.id === activeCategory)?.label} ({filteredData.length})
        </h2>
        
        {filteredData.map((item, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            {/* Crop Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="text-lg font-semibold text-foreground">{item.crop}</h3>
            </div>

            {/* Fertilizer Table */}
            <div className="space-y-2 mb-3">
              {item.fertilizers.map((fert, fIndex) => (
                <div
                  key={fIndex}
                  className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">{fert.name}</span>
                  <div className="text-right">
                    <span className="text-sm text-secondary">{fert.amount}</span>
                    <span className="text-xs text-muted-foreground block">{fert.timing}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-foreground">
                💡 <span className="font-medium">পরামর্শ:</span> {item.tips}
              </p>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">কোন ফসল পাওয়া যায়নি</p>
          </div>
        )}
      </section>

      {/* Source Credit */}
      <section className="px-4 mt-6">
        <p className="text-xs text-muted-foreground text-center">
          📚 তথ্যসূত্র: সার সুপারিশ নির্দেশিকা - বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC)
        </p>
      </section>
    </div>
  );
}