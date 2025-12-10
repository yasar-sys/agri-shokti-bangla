import { ArrowLeft, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiseaseCard } from "@/components/ui/DiseaseCard";
import { Link } from "react-router-dom";

export default function DiagnosisPage() {
  // Mock disease data - would come from POST /api/vision/detect-disease
  const diseaseData = {
    name: "ধানের পাতা ঝলসা রোগ (Leaf Blast)",
    confidence: 87,
    symptoms: [
      "পাতায় ডিম্বাকৃতির ধূসর দাগ",
      "দাগের চারপাশে বাদামী সীমারেখা",
      "পাতা শুকিয়ে যাওয়া",
      "ফসলের বৃদ্ধি কমে যাওয়া",
    ],
    treatment: "ট্রাইসাইক্লাজোল বা আইসোপ্রোথিওলেন জাতীয় ছত্রাকনাশক প্রয়োগ করুন। প্রতি লিটার পানিতে ১ গ্রাম মিশিয়ে স্প্রে করুন।",
    fertilizer: "ইউরিয়া সার কমিয়ে দিন। পটাশ সার বাড়ান।",
    irrigation: "জমিতে পানি ধরে রাখুন ২-৩ ইঞ্চি।",
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/camera"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">রোগ নির্ণয়</h1>
            <p className="text-xs text-muted-foreground">AI বিশ্লেষণ সম্পন্ন</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border">
            <Download className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Scanned Image */}
      <section className="px-4 mb-4">
        <div className="aspect-video rounded-2xl overflow-hidden bg-card border border-border">
          <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">স্ক্যান করা ছবি</p>
              <p className="text-xs text-muted-foreground mt-1">(ধানের পাতা)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Card */}
      <section className="px-4 mb-4">
        <DiseaseCard disease={diseaseData} className="animate-slide-up" />
      </section>

      {/* Action Buttons */}
      <section className="px-4 space-y-3">
        <Link to="/chat">
          <Button className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
            AI এর সাথে আরও কথা বলুন
          </Button>
        </Link>
        <Link to="/camera">
          <Button variant="outline" className="w-full h-12 border-border text-foreground hover:bg-muted font-semibold">
            নতুন স্ক্যান করুন
          </Button>
        </Link>
      </section>

      {/* LLM Attribution */}
      <section className="px-4 mt-6">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            🤖 এই বিশ্লেষণ GPT/Claude LLM এবং Vision AI দ্বারা সম্পন্ন
          </p>
        </div>
      </section>
    </div>
  );
}
