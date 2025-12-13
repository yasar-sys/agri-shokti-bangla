import { GraduationCap, BookOpen, Sprout, Bug, Droplets, Sun, ChevronRight, ArrowLeft, Users, School, Database, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const categories = [
  { id: "crops", icon: Sprout, label: "ফসল চাষ", color: "text-secondary" },
  { id: "disease", icon: Bug, label: "রোগ ব্যবস্থাপনা", color: "text-destructive" },
  { id: "irrigation", icon: Droplets, label: "সেচ ব্যবস্থা", color: "text-primary" },
  { id: "weather", icon: Sun, label: "আবহাওয়া ও ফসল", color: "text-primary" },
  { id: "books", icon: BookOpen, label: "বই রেফারেন্স", color: "text-primary" },
  { id: "team", icon: Users, label: "টিম পরিচিতি", color: "text-secondary" },
  { id: "sources", icon: Database, label: "ডেটা সোর্স", color: "text-primary" },
];

const knowledgeContent: Record<string, { title: string; content: string }[]> = {
  crops: [
    {
      title: "ধান চাষের সঠিক সময়",
      content: "আউশ ধান: চৈত্র-বৈশাখ মাসে বীজ বপন। আমন ধান: আষাঢ়-শ্রাবণ মাসে চারা রোপণ। বোরো ধান: অগ্রহায়ণ-পৌষ মাসে বীজতলা তৈরি।"
    },
    {
      title: "সার প্রয়োগের নিয়ম",
      content: "বেসাল ডোজ: রোপণের সময় TSP ও MP সার প্রয়োগ করুন। টপ ড্রেসিং: রোপণের ২১ দিন পর ইউরিয়া ছিটিয়ে দিন।"
    },
    {
      title: "বীজ শোধন পদ্ধতি",
      content: "বীজ বপনের আগে প্রতি কেজি বীজে ২-৩ গ্রাম ভিটাভেক্স বা থিরাম মিশিয়ে শোধন করুন। এতে বীজবাহিত রোগ কমে।"
    },
  ],
  disease: [
    {
      title: "ব্লাস্ট রোগ চেনার উপায়",
      content: "পাতায় চোখের আকৃতির দাগ দেখা যায়। দাগের মাঝখান ছাই রঙের এবং কিনারা বাদামি। আক্রান্ত হলে ট্রাইসাইক্লাজল স্প্রে করুন।"
    },
    {
      title: "পোকা দমন - জৈব পদ্ধতি",
      content: "নিম পাতার রস ১০% দ্রবণ স্প্রে করুন। আলোর ফাঁদ ব্যবহার করুন। পার্চিং (ডাল পুঁতে দেওয়া) পদ্ধতি অবলম্বন করুন।"
    },
    {
      title: "শিকড় পচা রোগ",
      content: "অতিরিক্ত পানি জমলে শিকড় পচে। নিষ্কাশন ব্যবস্থা ভালো রাখুন। আক্রান্ত হলে কপার অক্সিক্লোরাইড ছিটিয়ে দিন।"
    },
  ],
  irrigation: [
    {
      title: "ধানের পানি ব্যবস্থাপনা",
      content: "AWD (Alternate Wetting and Drying) পদ্ধতি অবলম্বন করুন। মাটি ফাটা শুরু হলে সেচ দিন। এতে ৩০% পানি সাশ্রয় হয়।"
    },
    {
      title: "ড্রিপ সেচ সুবিধা",
      content: "সবজি চাষে ড্রিপ সেচ ব্যবহার করুন। পানি সরাসরি গাছের গোড়ায় যায়। ৫০-৭০% পানি সাশ্রয় সম্ভব।"
    },
    {
      title: "বর্ষায় নিষ্কাশন",
      content: "জমির চারপাশে নালা কেটে রাখুন। অতিরিক্ত পানি যেন জমে না থাকে। নালার গভীরতা ১-১.৫ ফুট রাখুন।"
    },
  ],
  weather: [
    {
      title: "খরায় ফসল রক্ষা",
      content: "মালচিং ব্যবহার করুন (খড়/পলিথিন)। সকালে বা সন্ধ্যায় সেচ দিন। খরা সহনশীল জাত বেছে নিন।"
    },
    {
      title: "বন্যা পরবর্তী পদক্ষেপ",
      content: "পানি নেমে গেলে দ্রুত ইউরিয়া ছিটান। ক্ষতিগ্রস্ত গাছ কেটে ফেলুন। দ্রুত বর্ধনশীল সবজি চাষ করুন।"
    },
    {
      title: "শীতে সবজি চাষ",
      content: "অক্টোবর-নভেম্বরে বীজ বপন করুন। ফুলকপি, বাঁধাকপি, টমেটো চাষের উপযুক্ত সময়। কুয়াশা থেকে রক্ষায় পলিথিন ব্যবহার করুন।"
    },
  ],
  books: [
    {
      title: "আধুনিক ধান চাষ",
      content: "লেখক: বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI)। ধান চাষের A-Z গাইড, জাত নির্বাচন, রোগ ব্যবস্থাপনা ও ফলন বৃদ্ধির কৌশল।"
    },
    {
      title: "সমন্বিত বালাই ব্যবস্থাপনা (IPM)",
      content: "লেখক: কৃষি সম্প্রসারণ অধিদপ্তর। জৈব ও রাসায়নিক পদ্ধতির সমন্বয়ে পোকামাকড় দমনের বিস্তারিত গাইড।"
    },
    {
      title: "মাটি ও সার ব্যবস্থাপনা",
      content: "লেখক: মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট (SRDI)। মাটির স্বাস্থ্য, pH ব্যবস্থাপনা ও সার প্রয়োগের সঠিক নিয়ম।"
    },
    {
      title: "সবজি উৎপাদন হ্যান্ডবুক",
      content: "লেখক: BARI। বাংলাদেশের প্রধান সবজি চাষের কৌশল, বীজ বপন থেকে ফসল তোলা পর্যন্ত।"
    },
    {
      title: "ফল চাষ প্রযুক্তি",
      content: "লেখক: BARI। আম, লিচু, কলা, পেয়ারা ইত্যাদি ফল চাষের আধুনিক পদ্ধতি।"
    },
    {
      title: "জৈব কৃষি ম্যানুয়াল",
      content: "লেখক: Bangladesh Organic Products Manufacturers Association। রাসায়নিক সার ছাড়া টেকসই কৃষির গাইড।"
    },
  ],
  team: [],
  sources: [],
};

const bookReferences = [
  { name: "আধুনিক ধান চাষ পদ্ধতি", author: "BRRI", year: "2023" },
  { name: "সমন্বিত বালাই ব্যবস্থাপনা", author: "DAE", year: "2022" },
  { name: "মাটি ও সার গাইড", author: "SRDI", year: "2023" },
  { name: "সবজি উৎপাদন প্রযুক্তি", author: "BARI", year: "2024" },
];

const dataSources = [
  { name: "Open-Meteo", description: "আবহাওয়ার রিয়েল-টাইম ডেটা", url: "https://open-meteo.com" },
  { name: "OpenStreetMap Nominatim", description: "জিওলোকেশন ও ঠিকানা সার্ভিস", url: "https://nominatim.openstreetmap.org" },
  { name: "SoilGrids", description: "মাটির গুণাগুণ ও বৈশিষ্ট্য ডেটা", url: "https://soilgrids.org" },
  { name: "BRRI (Bangladesh Rice Research Institute)", description: "ধান গবেষণা তথ্য", url: "https://brri.gov.bd" },
  { name: "BARI (Bangladesh Agricultural Research Institute)", description: "কৃষি গবেষণা তথ্য", url: "https://bari.gov.bd" },
  { name: "DAE (Department of Agricultural Extension)", description: "কৃষি সম্প্রসারণ তথ্য", url: "https://dae.gov.bd" },
  { name: "BMD (Bangladesh Meteorological Department)", description: "আবহাওয়া পূর্বাভাস", url: "https://bmd.gov.bd" },
  { name: "PlantVillage Dataset", description: "ফসলের রোগ সনাক্তকরণ AI মডেল", url: "https://plantvillage.psu.edu" },
  { name: "FAO (Food and Agriculture Organization)", description: "আন্তর্জাতিক কৃষি তথ্য", url: "https://fao.org" },
  { name: "Sentinel/Landsat Satellite", description: "স্যাটেলাইট ইমেজারি ও NDVI", url: "https://sentinel.esa.int" },
];

export default function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("crops");

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
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <Link
          to="/home"
          className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">কৃষি জ্ঞান</h1>
          <p className="text-xs text-muted-foreground">কৃষি শিক্ষা ও তথ্য ভান্ডার</p>
        </div>
      </header>

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

      {/* Team Section */}
      {activeCategory === "team" && (
        <section className="px-4 space-y-4">
          {/* Team Card */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">TEAM_NEWBIES</h2>
                <p className="text-xs text-muted-foreground">agriশক্তি ডেভেলপমেন্ট টিম</p>
              </div>
            </div>

            {/* Team Lead */}
            <div className="bg-card/50 rounded-xl p-4 mb-3 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">SY</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">টিম লিড</p>
                  <h3 className="font-semibold text-foreground">Samin Yasar</h3>
                </div>
              </div>
            </div>

            {/* Members */}
            <h4 className="text-sm font-medium text-muted-foreground mb-2">টিম মেম্বার</h4>
            <div className="space-y-2">
              <div className="bg-card/50 rounded-xl p-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-secondary text-xs font-bold">RJ</span>
                  </div>
                  <span className="font-medium text-foreground">Rahiatul Jannat</span>
                </div>
              </div>
              <div className="bg-card/50 rounded-xl p-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-secondary text-xs font-bold">MO</span>
                  </div>
                  <span className="font-medium text-foreground">Maisha Osman Umama</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institution */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <School className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">প্রতিষ্ঠান</p>
                <h3 className="font-semibold text-foreground">Mymensingh Engineering College</h3>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">প্রজেক্ট সম্পর্কে</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              agriশক্তি একটি AI-চালিত কৃষি সহায়তা অ্যাপ্লিকেশন যা বাংলাদেশের কৃষকদের জন্য তৈরি করা হয়েছে। 
              এই অ্যাপটি ফসলের রোগ সনাক্তকরণ, আবহাওয়া পূর্বাভাস, বাজার দর, সার পরামর্শ এবং 
              সরকারি সেবা সম্পর্কে তথ্য প্রদান করে।
            </p>
          </div>
        </section>
      )}

      {/* Data Sources Section */}
      {activeCategory === "sources" && (
        <section className="px-4 space-y-3">
          <h2 className="text-base font-semibold text-foreground mb-2">ডেটা সোর্স ও রেফারেন্স</h2>
          {dataSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-border rounded-xl p-4 flex items-start justify-between hover:border-primary/30 transition-colors block"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-foreground">{source.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
            </a>
          ))}
        </section>
      )}

      {/* Regular Knowledge Content */}
      {activeCategory !== "team" && activeCategory !== "sources" && (
        <>
          {/* Featured Tip */}
          <section className="px-4 mb-4">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">আজকের শিক্ষা</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    মাটির pH ৬-৭ এর মধ্যে রাখলে বেশিরভাগ ফসল ভালো হয়। মাটি পরীক্ষা করে সার প্রয়োগ করুন।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Knowledge Cards */}
          <section className="px-4 space-y-3">
            <h2 className="text-base font-semibold text-foreground mb-2">
              {categories.find(c => c.id === activeCategory)?.label} বিষয়ক তথ্য
            </h2>
            {knowledgeContent[activeCategory]?.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Source Credit */}
      <section className="px-4 mt-6">
        <p className="text-xs text-muted-foreground text-center">
          📚 তথ্যসূত্র: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও কৃষি সম্প্রসারণ অধিদপ্তর
        </p>
      </section>
    </div>
  );
}