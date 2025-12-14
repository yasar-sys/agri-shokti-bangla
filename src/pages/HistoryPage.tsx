import { TimelineCard } from "@/components/ui/TimelineCard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const historyData = [
  {
    date: "১০ জানুয়ারি, ২০২৫",
    cropName: "ধান (বোরো)",
    result: "healthy" as const,
    summary: "ফসল সুস্থ অবস্থায় আছে। কোন রোগ পাওয়া যায়নি।",
  },
  {
    date: "৮ জানুয়ারি, ২০২৫",
    cropName: "গম",
    result: "disease" as const,
    summary: "পাতা ঝলসা রোগ শনাক্ত হয়েছে। ছত্রাকনাশক প্রয়োগ করুন।",
  },
  {
    date: "৫ জানুয়ারি, ২০২৫",
    cropName: "আলু",
    result: "healthy" as const,
    summary: "ফসল ভালো অবস্থায় আছে। সেচ দেওয়ার পরামর্শ দেওয়া হয়েছে।",
  },
  {
    date: "২ জানুয়ারি, ২০২৫",
    cropName: "পেঁয়াজ",
    result: "disease" as const,
    summary: "পার্পেল ব্লচ রোগ পাওয়া গেছে। চিকিৎসা প্রদান করা হয়েছে।",
  },
];

export default function HistoryPage() {
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
            <h1 className="text-2xl font-bold text-foreground">স্ক্যান ইতিহাস</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>GET /api/history</span>
            </div>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <section className="px-4">
        {historyData.map((item, index) => (
          <TimelineCard
            key={index}
            date={item.date}
            cropName={item.cropName}
            result={item.result}
            summary={item.summary}
          />
        ))}
      </section>
    </div>
  );
}
