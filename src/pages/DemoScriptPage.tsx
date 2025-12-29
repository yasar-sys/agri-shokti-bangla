import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/seo/SEOHead";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Clock,
  Video,
  Sparkles,
  Brain,
  Users,
  TrendingUp,
  Leaf,
  Camera,
  MessageSquare,
  BarChart3,
  ArrowLeftRight,
  Download,
  ChevronRight,
  Loader2
} from "lucide-react";

interface ScriptSection {
  id: string;
  title: string;
  titleBn: string;
  duration: string;
  timestamp: string;
  icon: any;
  content: string[];
  visualNotes: string;
}

const demoScript: ScriptSection[] = [
  {
    id: "intro",
    title: "Introduction & Problem",
    titleBn: "ভূমিকা ও সমস্যা",
    duration: "0:45",
    timestamp: "0:00 - 0:45",
    icon: Sparkles,
    content: [
      "আসসালামু আলাইকুম! আমি AgriShokti প্রজেক্ট উপস্থাপন করছি।",
      "বাংলাদেশে ৩.৫ কোটি কৃষক পরিবার আছে। তাদের বেশিরভাগই সঠিক তথ্যের অভাবে প্রতি বছর ৩০-৪০% ফসল হারায়।",
      "সমস্যাগুলো হলো: রোগ শনাক্তকরণে দেরি, আবহাওয়ার পূর্বাভাস না পাওয়া, বাজার দামের তথ্য না থাকা, এবং সরকারি সেবা সম্পর্কে অজ্ঞতা।",
      "AgriShokti এই সব সমস্যার AI-powered সমাধান দেয়!"
    ],
    visualNotes: "Show app splash screen → Bangladesh farming statistics → Problem visualization"
  },
  {
    id: "disease-ai",
    title: "AI Disease Detection",
    titleBn: "AI রোগ শনাক্তকরণ",
    duration: "0:50",
    timestamp: "0:45 - 1:35",
    icon: Camera,
    content: [
      "প্রথমে দেখুন আমাদের AI Disease Detection ফিচার।",
      "কৃষক শুধু তার ফসলের একটি ছবি তুলবেন।",
      "Google Gemini AI ছবি analyze করে রোগ শনাক্ত করে।",
      "সাথে সাথে বাংলায় চিকিৎসা পরামর্শ দেয়।",
      "এটি ৯৫% accuracy-তে কাজ করে এবং ৩ সেকেন্ডে ফলাফল দেয়!"
    ],
    visualNotes: "Demo: Camera → Take photo → AI processing animation → Disease result with Bengali treatment"
  },
  {
    id: "rag-chat",
    title: "RAG-Powered Bengali Chat",
    titleBn: "RAG চ্যাটবট",
    duration: "0:40",
    timestamp: "1:35 - 2:15",
    icon: MessageSquare,
    content: [
      "এবার দেখুন আমাদের কৃষি AI চ্যাটবট।",
      "এটি RAG (Retrieval Augmented Generation) প্রযুক্তি ব্যবহার করে।",
      "কৃষি জ্ঞানভাণ্ডার থেকে সঠিক তথ্য খুঁজে আনে।",
      "বাংলায় প্রশ্ন করুন, বাংলায় উত্তর পান।",
      "ভয়েস ইনপুটও সমর্থিত!"
    ],
    visualNotes: "Demo: Chat interface → Type/Speak question → Show RAG retrieval → Bengali response with sources"
  },
  {
    id: "barter",
    title: "Crop Barter Innovation",
    titleBn: "ফসল বিনিময় উদ্ভাবন",
    duration: "0:35",
    timestamp: "2:15 - 2:50",
    icon: ArrowLeftRight,
    content: [
      "এখন দেখুন আমাদের সবচেয়ে unique ফিচার - ফসল বিনিময়!",
      "কৃষকরা সরাসরি ফসল বিনিময় করতে পারেন।",
      "মধ্যস্বত্বভোগী ছাড়া ন্যায্য দামে বাণিজ্য।",
      "এটি সম্পূর্ণ নতুন একটি ধারণা যা কৃষকদের ক্ষমতায়ন করে!"
    ],
    visualNotes: "Demo: Barter marketplace → List crop → Send trade request → Accept/Reject"
  },
  {
    id: "features",
    title: "Additional AI Features",
    titleBn: "অতিরিক্ত AI ফিচার",
    duration: "0:35",
    timestamp: "2:50 - 3:25",
    icon: Brain,
    content: [
      "আরও কিছু গুরুত্বপূর্ণ ফিচার:",
      "১. Real-time আবহাওয়া সতর্কতা",
      "২. বাজার দামের AI পূর্বাভাস",
      "৩. সার ক্যালকুলেটর ও NPK গণনা",
      "৪. সরকারি সেবা ও কৃষি অফিসের তথ্য",
      "৫. Impact Analytics Dashboard"
    ],
    visualNotes: "Quick montage: Weather alerts → Market prices → Fertilizer calc → Gov services → Analytics"
  },
  {
    id: "impact",
    title: "Impact & Conclusion",
    titleBn: "প্রভাব ও উপসংহার",
    duration: "0:35",
    timestamp: "3:25 - 4:00",
    icon: TrendingUp,
    content: [
      "AgriShokti-র প্রভাব:",
      "৩.৫ কোটি কৃষক পরিবারে পৌঁছানোর সম্ভাবনা",
      "২০-৩০% ফসলের ক্ষতি কমানো সম্ভব",
      "প্রতি কৃষক বছরে ৫০,০০০+ টাকা সাশ্রয়",
      "PWA হওয়ায় অফলাইনেও কাজ করে",
      "ধন্যবাদ! AgriShokti - কৃষকের ডিজিটাল সঙ্গী।"
    ],
    visualNotes: "Show impact metrics → PWA demo → Final screen with tagline"
  }
];

export default function DemoScriptPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("intro");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentSection = demoScript.find(s => s.id === activeSection);
  const currentSectionIndex = demoScript.findIndex(s => s.id === activeSection);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("আপনার ব্রাউজার Text-to-Speech সমর্থন করে না");
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakSection = (section: ScriptSection) => {
    const fullText = section.content.join(' ');
    speakText(fullText);
  };

  const speakAllSections = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    let sectionIndex = currentSectionIndex;
    
    const speakNextSection = () => {
      if (sectionIndex >= demoScript.length) {
        setIsPlaying(false);
        setProgress(100);
        return;
      }

      const section = demoScript[sectionIndex];
      setActiveSection(section.id);
      setProgress((sectionIndex / demoScript.length) * 100);
      
      const fullText = section.content.join(' ');
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        sectionIndex++;
        setTimeout(speakNextSection, 500);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
      };
      
      window.speechSynthesis.speak(utterance);
    };

    speakNextSection();
  };

  const downloadScript = () => {
    let scriptText = "# AgriShokti - 4 Minute Demo Video Script\n";
    scriptText += "# National AI Build-a-thon 2026\n\n";
    scriptText += "Total Duration: 4:00 minutes\n\n";
    scriptText += "---\n\n";

    demoScript.forEach((section) => {
      scriptText += `## ${section.titleBn} (${section.title})\n`;
      scriptText += `**Timestamp:** ${section.timestamp}\n`;
      scriptText += `**Duration:** ${section.duration}\n\n`;
      scriptText += "### Script:\n";
      section.content.forEach((line, i) => {
        scriptText += `${i + 1}. ${line}\n`;
      });
      scriptText += `\n**Visual Notes:** ${section.visualNotes}\n\n`;
      scriptText += "---\n\n";
    });

    const blob = new Blob([scriptText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrishokti-demo-script.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("স্ক্রিপ্ট ডাউনলোড হয়েছে!");
  };

  const totalDuration = "4:00";

  return (
    <>
      <SEOHead
        title="Demo Video Script | AgriShokti"
        description="4-minute demo video script for AgriShokti - National AI Build-a-thon 2026"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/home")}
              className="rounded-full bg-background/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Video className="w-6 h-6 text-primary" />
                ডেমো ভিডিও স্ক্রিপ্ট
              </h1>
              <p className="text-sm text-muted-foreground">
                National AI Build-a-thon 2026 - 4 মিনিট
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">অগ্রগতি</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 py-4 flex gap-2 flex-wrap">
          <Button
            onClick={speakAllSections}
            className={isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-primary to-secondary"}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                থামান
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                সম্পূর্ণ প্লে করুন
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={downloadScript}>
            <Download className="w-4 h-4 mr-2" />
            স্ক্রিপ্ট ডাউনলোড
          </Button>

          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-2">
            <Clock className="w-4 h-4" />
            {totalDuration}
          </Badge>
        </div>

        {/* Timeline */}
        <div className="px-4 pb-4">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {demoScript.map((section, index) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="w-3 h-3 mr-1" />
                {index + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Section */}
        {currentSection && (
          <div className="px-4 space-y-4">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <currentSection.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{currentSection.titleBn}</CardTitle>
                      <p className="text-sm text-muted-foreground">{currentSection.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {currentSection.duration}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{currentSection.timestamp}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Script Lines */}
                <div className="space-y-3">
                  {currentSection.content.map((line, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${
                        isSpeaking && index === currentLineIndex
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{line}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Speak Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => isSpeaking ? stopSpeaking() : speakSection(currentSection)}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      থামান
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      এই সেকশন শুনুন
                    </>
                  )}
                </Button>

                {/* Visual Notes */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">🎬 ভিজ্যুয়াল নোট:</p>
                  <p className="text-sm">{currentSection.visualNotes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={currentSectionIndex === 0}
                onClick={() => setActiveSection(demoScript[currentSectionIndex - 1]?.id)}
              >
                পূর্ববর্তী
              </Button>
              <Button
                className="flex-1"
                disabled={currentSectionIndex === demoScript.length - 1}
                onClick={() => setActiveSection(demoScript[currentSectionIndex + 1]?.id)}
              >
                পরবর্তী
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* All Sections Overview */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            সম্পূর্ণ স্ক্রিপ্ট ওভারভিউ
          </h2>
          <div className="space-y-2">
            {demoScript.map((section, index) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all ${
                  activeSection === section.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/30"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{section.titleBn}</p>
                    <p className="text-xs text-muted-foreground">{section.timestamp}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {section.duration}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="px-4 pb-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                ভিডিও রেকর্ডিং টিপস
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• স্ক্রিন রেকর্ডার (OBS, Loom) ব্যবহার করুন</li>
                <li>• প্রতিটি সেকশনে ডেমো দেখান</li>
                <li>• বাংলায় স্পষ্ট উচ্চারণ করুন</li>
                <li>• ৪ মিনিটের মধ্যে শেষ করুন</li>
                <li>• YouTube-এ Public/Unlisted আপলোড করুন</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}