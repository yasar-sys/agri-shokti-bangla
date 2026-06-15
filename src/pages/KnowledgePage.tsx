import { GraduationCap, BookOpen, Sprout, Bug, Droplets, Sun, ChevronRight, ArrowLeft, Users, School, Database, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import awardImage from "@/assets/award-2026.jpg.asset.json";

const categories = [
  { id: "crops", icon: Sprout, label: "ফসল চাষ", color: "text-secondary" },
  { id: "disease", icon: Bug, label: "রোগ ব্যবস্থাপনা", color: "text-destructive" },
  { id: "irrigation", icon: Droplets, label: "সেচ ব্যবস্থা", color: "text-primary" },
  { id: "weather", icon: Sun, label: "আবহাওয়া ও ফসল", color: "text-primary" },
  { id: "books", icon: BookOpen, label: "বই রেফারেন্স", color: "text-primary" },
  { id: "team", icon: Users, label: "টিম পরিচিতি", color: "text-secondary" },
  { id: "sources", icon: Database, label: "ডেটা সোর্স", color: "text-primary" },
];

const knowledgeContent: Record<string, { title: string; content: string; url?: string }[]> = {
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
      title: "আধুনিক ধান চাষ প্রযুক্তি",
      content: "প্রকাশক: বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI)। ISBN: 978-984-8945-35-2। BRRI উদ্ভাবিত সকল জাতের বিস্তারিত তথ্য, রোগ-পোকা ব্যবস্থাপনা ও উচ্চ ফলনশীল চাষাবাদ পদ্ধতি।",
      url: "https://brri.gov.bd/site/page/e0b24d9a-69b5-48ac-a5c9-aa51f0d5a145"
    },
    {
      title: "সমন্বিত বালাই ব্যবস্থাপনা (IPM) হ্যান্ডবুক",
      content: "প্রকাশক: কৃষি সম্প্রসারণ অধিদপ্তর (DAE), ২০২৩। জৈব ও রাসায়নিক পদ্ধতির সমন্বয়ে পোকামাকড় দমনের বিজ্ঞানভিত্তিক গাইড।",
      url: "https://dae.gov.bd/site/page/7e5ded4e-4a7c-4c55-8c58-ed6f8f8e0d56/IPM"
    },
    {
      title: "মৃত্তিকা ও সার সুপারিশমালা",
      content: "প্রকাশক: মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট (SRDI)। ফসলভিত্তিক সুষম সার প্রয়োগের সরকারি নির্দেশিকা।",
      url: "https://srdi.gov.bd"
    },
    {
      title: "সবজি উৎপাদন প্রযুক্তি",
      content: "প্রকাশক: BARI, গাজীপুর। ISBN: 978-984-523-089-7। বাংলাদেশের প্রধান ৫০+ সবজির চাষ প্রযুক্তি ও রোগ ব্যবস্থাপনা।",
      url: "https://bari.gov.bd/site/page/publications"
    },
    {
      title: "ফলদ বৃক্ষ রোপণ ও পরিচর্যা",
      content: "প্রকাশক: BARI হর্টিকালচার বিভাগ। আম, লিচু, কাঁঠাল, পেয়ারা ও কলার বাণিজ্যিক চাষ পদ্ধতি।",
      url: "https://bari.gov.bd/site/page/horticulture"
    },
    {
      title: "জৈব কৃষি নির্দেশিকা",
      content: "প্রকাশক: কৃষি মন্ত্রণালয়, ২০২২। রাসায়নিক সার ছাড়া টেকসই কৃষির সরকারি গাইডলাইন।",
      url: "https://moa.gov.bd"
    },
    {
      title: "Bangladesh Journal of Agricultural Research",
      content: "ISSN: 0258-7122। BARI প্রকাশিত ত্রৈমাসিক বৈজ্ঞানিক জার্নাল। কৃষি গবেষণার সর্বশেষ ফলাফল প্রকাশিত হয়।",
      url: "https://www.banglajol.info/index.php/BJAR"
    },
    {
      title: "Journal of Bangladesh Agricultural University",
      content: "ISSN: 1810-3030। বাংলাদেশ কৃষি বিশ্ববিদ্যালয়ের গবেষণা জার্নাল। ফসল উন্নয়ন ও প্রযুক্তি বিষয়ক প্রবন্ধ।",
      url: "https://www.banglajol.info/index.php/JBAU"
    },
    {
      title: "ধান গবেষণা সাময়িকী",
      content: "প্রকাশক: BRRI। বার্ষিক প্রকাশনা। ধান সংক্রান্ত সর্বশেষ গবেষণা ও প্রযুক্তি।",
      url: "https://brri.gov.bd/site/page/publications"
    },
    {
      title: "কৃষকের কৃষি প্রযুক্তি হাতবই",
      content: "প্রকাশক: BARC (Bangladesh Agricultural Research Council)। কৃষকদের জন্য সহজ ভাষায় লেখা প্রযুক্তি সংকলন।",
      url: "https://barc.gov.bd"
    },
    {
      title: "ফসল উৎপাদন ক্যালেন্ডার",
      content: "প্রকাশক: DAE। মৌসুম ভিত্তিক ফসল চাষের সময়সূচি ও কৃষি কর্মপঞ্জি।",
      url: "https://dae.gov.bd/site/page/crop_calendar"
    },
    {
      title: "Plant Disease Journal - BARI",
      content: "ISSN: 2414-4576। ফসলের রোগ সনাক্তকরণ ও ব্যবস্থাপনা বিষয়ক গবেষণা জার্নাল।",
      url: "https://bari.gov.bd/site/page/plant-pathology"
    },
  ],
  team: [],
  sources: [],
};

const bookReferences = [
  { name: "আধুনিক ধান চাষ প্রযুক্তি", author: "BRRI", year: "2023", isbn: "978-984-8945-35-2" },
  { name: "সমন্বিত বালাই ব্যবস্থাপনা হ্যান্ডবুক", author: "DAE", year: "2023", isbn: "" },
  { name: "মৃত্তিকা ও সার সুপারিশমালা", author: "SRDI", year: "2024", isbn: "" },
  { name: "সবজি উৎপাদন প্রযুক্তি", author: "BARI", year: "2023", isbn: "978-984-523-089-7" },
  { name: "Bangladesh Journal of Agricultural Research", author: "BARI", year: "Quarterly", isbn: "ISSN: 0258-7122" },
  { name: "Journal of BAU", author: "BAU", year: "Biannual", isbn: "ISSN: 1810-3030" },
  { name: "কৃষকের কৃষি প্রযুক্তি হাতবই", author: "BARC", year: "2024", isbn: "" },
  { name: "ফসল উৎপাদন ক্যালেন্ডার", author: "DAE", year: "2024", isbn: "" },
];

const dataSources = [
  { name: "Open-Meteo API", description: "রিয়েল-টাইম আবহাওয়া ও পূর্বাভাস ডেটা", url: "https://open-meteo.com", type: "API" },
  { name: "NASA GIBS", description: "স্যাটেলাইট টাইল ও NDVI ইমেজারি", url: "https://earthdata.nasa.gov/gibs", type: "Satellite" },
  { name: "Sentinel-2 (ESA)", description: "ইউরোপীয় স্যাটেলাইট ইমেজ ও ভেজিটেশন ইনডেক্স", url: "https://sentinel.esa.int", type: "Satellite" },
  { name: "OpenStreetMap", description: "জিওলোকেশন ও ম্যাপ ডেটা সার্ভিস", url: "https://openstreetmap.org", type: "Map" },
  { name: "SoilGrids (ISRIC)", description: "বৈশ্বিক মাটির গুণাগুণ ও বৈশিষ্ট্য ডেটা", url: "https://soilgrids.org", type: "Data" },
  { name: "BRRI", description: "বাংলাদেশ ধান গবেষণা ইনস্টিটিউট - ধান জাত ও প্রযুক্তি", url: "https://brri.gov.bd", type: "Research" },
  { name: "BARI", description: "বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট - ফসল গবেষণা", url: "https://bari.gov.bd", type: "Research" },
  { name: "DAE", description: "কৃষি সম্প্রসারণ অধিদপ্তর - কৃষি তথ্য সেবা", url: "https://dae.gov.bd", type: "Govt" },
  { name: "BMD", description: "বাংলাদেশ আবহাওয়া অধিদপ্তর - স্থানীয় আবহাওয়া", url: "https://bmd.gov.bd", type: "Govt" },
  { name: "DAM", description: "কৃষি বিপণন অধিদপ্তর - বাজার দর তথ্য", url: "https://dam.gov.bd", type: "Govt" },
  { name: "SRDI", description: "মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট - মাটি তথ্য", url: "https://srdi.gov.bd", type: "Research" },
  { name: "PlantVillage (Penn State)", description: "ফসলের রোগ সনাক্তকরণ AI ডেটাসেট", url: "https://plantvillage.psu.edu", type: "AI" },
  { name: "FAO STAT", description: "জাতিসংঘ খাদ্য ও কৃষি সংস্থার পরিসংখ্যান", url: "https://fao.org/faostat", type: "Data" },
  { name: "Lovable AI Gateway", description: "Gemini/GPT মডেল ইন্টিগ্রেশন", url: "https://lovable.dev", type: "AI" },
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
                 <h2 className="text-lg font-bold text-primary">টিম পরিচিতি</h2>
                <p className="text-xs text-muted-foreground">agriশক্তি ডেভেলপমেন্ট টিম</p>
              </div>
            </div>

            {/* Members */}
             <h4 className="text-sm font-medium text-muted-foreground mb-2">সদস্যবৃন্দ</h4>
            <div className="space-y-2">
              <div className="bg-card/50 rounded-xl p-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                     <span className="text-secondary text-xs font-bold">SY</span>
                  </div>
                  <div>
                     <span className="font-medium text-foreground block">সামিন ইয়াসার</span>
                     <span className="text-xs text-muted-foreground">টিম মেম্বার</span>
                  </div>
                </div>
              </div>
              <div className="bg-card/50 rounded-xl p-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                     <span className="text-secondary text-xs font-bold">RJ</span>
                  </div>
                  <div>
                     <span className="font-medium text-foreground block">রাহিয়াতুল জান্নাত</span>
                     <span className="text-xs text-muted-foreground">টিম মেম্বার</span>
                  </div>
                </div>
              </div>
              <div className="bg-card/50 rounded-xl p-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                     <span className="text-secondary text-xs font-bold">MA</span>
                  </div>
                  <div>
                     <span className="font-medium text-foreground block">মাজহারুল ইসলাম আবিদ</span>
                     <span className="text-xs text-muted-foreground">টিম মেম্বার</span>
                  </div>
                </div>
              </div>
            </div>
             <div className="mt-3 pt-3 border-t border-border/50 text-center">
               <p className="text-xs text-muted-foreground">ময়মনসিংহ ইঞ্জিনিয়ারিং কলেজ</p>
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
            {knowledgeContent[activeCategory]?.map((item, index) => {
              const hasUrl = 'url' in item && item.url;
              const CardWrapper = hasUrl ? 'a' : 'div';
              const cardProps = hasUrl ? { 
                href: item.url, 
                target: '_blank', 
                rel: 'noopener noreferrer' 
              } : {};
              
              return (
                <CardWrapper
                  key={index}
                  {...cardProps}
                  className={cn(
                    "bg-card border border-border rounded-xl p-4 transition-colors block",
                    hasUrl && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        {hasUrl && <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                      {hasUrl && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          অনলাইনে পড়ুন →
                        </p>
                      )}
                    </div>
                    {!hasUrl && <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />}
                  </div>
                </CardWrapper>
              );
            })}
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