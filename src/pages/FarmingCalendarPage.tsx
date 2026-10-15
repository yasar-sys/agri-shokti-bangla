import { ArrowLeft, Calendar, Droplets, Leaf, Bug, Scissors, Sprout, Sun, Plus, Trash2, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserCalendars, type CalendarTask } from "@/hooks/useUserCalendars";
import { ScrollArea } from "@/components/ui/scroll-area";

const cropOptions = [
  { id: "aman", name: "আমন ধান", emoji: "🌾", duration: 120 },
  { id: "boro", name: "বোরো ধান", emoji: "🌾", duration: 150 },
  { id: "wheat", name: "গম", emoji: "🌿", duration: 110 },
  { id: "potato", name: "আলু", emoji: "🥔", duration: 90 },
  { id: "tomato", name: "টমেটো", emoji: "🍅", duration: 100 },
  { id: "onion", name: "পেঁয়াজ", emoji: "🧅", duration: 120 },
  { id: "corn", name: "ভুট্টা", emoji: "🌽", duration: 100 },
  { id: "mustard", name: "সরিষা", emoji: "🌻", duration: 90 },
  { id: "lentil", name: "মসুর ডাল", emoji: "🫘", duration: 100 },
  { id: "chickpea", name: "ছোলা", emoji: "🫘", duration: 110 },
  { id: "ginger", name: "আদা", emoji: "🫚", duration: 240 },
  { id: "turmeric", name: "হলুদ", emoji: "🟡", duration: 270 },
  { id: "bottle_gourd", name: "লাউ", emoji: "🥒", duration: 75 },
  { id: "pumpkin", name: "কুমড়া", emoji: "🎃", duration: 90 },
  { id: "cucumber", name: "শসা", emoji: "🥒", duration: 60 },
  { id: "bitter_gourd", name: "করলা", emoji: "🥬", duration: 65 },
  { id: "okra", name: "ঢেঁড়স", emoji: "🌿", duration: 55 },
  { id: "spinach", name: "পালং শাক", emoji: "🥬", duration: 45 },
  { id: "red_spinach", name: "লাল শাক", emoji: "🥬", duration: 40 },
  { id: "taro", name: "কচু", emoji: "🍠", duration: 180 },
  { id: "sweet_potato", name: "মিষ্টি আলু", emoji: "🍠", duration: 120 },
  { id: "jute", name: "পাট", emoji: "🌿", duration: 120 },
  { id: "sugarcane", name: "আখ", emoji: "🎍", duration: 365 },
  { id: "garlic", name: "রসুন", emoji: "🧄", duration: 150 },
  { id: "chili", name: "মরিচ", emoji: "🌶️", duration: 90 },
  { id: "eggplant", name: "বেগুন", emoji: "🍆", duration: 80 },
  { id: "cabbage", name: "বাঁধাকপি", emoji: "🥬", duration: 90 },
  { id: "cauliflower", name: "ফুলকপি", emoji: "🥦", duration: 85 },
  { id: "carrot", name: "গাজর", emoji: "🥕", duration: 75 },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Droplets,
  Leaf,
  Scissors,
  Bug,
  Sun,
};

const generateCalendar = (crop: typeof cropOptions[0]): CalendarTask[] => {
  return [
    { day: "০১", task: "বীজ বপন/রোপণ", icon: "Sprout", color: "text-secondary", done: false },
    { day: "০৫", task: "প্রথম সেচ", icon: "Droplets", color: "text-chart-3", done: false },
    { day: "১০", task: "ইউরিয়া প্রয়োগ (১ম কিস্তি)", icon: "Leaf", color: "text-primary", done: false },
    { day: "১৫", task: "আগাছা পরিষ্কার", icon: "Scissors", color: "text-chart-2", done: false },
    { day: "২০", task: "পোকা চেক", icon: "Bug", color: "text-destructive", done: false },
    { day: "২৫", task: "দ্বিতীয় সেচ", icon: "Droplets", color: "text-chart-3", done: false },
    { day: "৩০", task: "ইউরিয়া প্রয়োগ (২য় কিস্তি)", icon: "Leaf", color: "text-primary", done: false },
  ];
};

const getEmojiForCrop = (cropName: string): string => {
  const crop = cropOptions.find(c => c.name === cropName);
  return crop?.emoji || "🌱";
};

const getDurationForCrop = (cropName: string): number => {
  const crop = cropOptions.find(c => c.name === cropName);
  return crop?.duration || 100;
};

export default function FarmingCalendarPage() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [landSize, setLandSize] = useState("");
  const [activeCalendarId, setActiveCalendarId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<CalendarTask[]>([]);
  const { toast } = useToast();
  
  const { 
    calendars, 
    loading, 
    isLoggedIn, 
    addCalendar, 
    updateCalendarTasks, 
    deleteCalendar,
    getActiveCalendar 
  } = useUserCalendars();

  // Set active calendar when calendars load
  useEffect(() => {
    if (calendars.length > 0 && !activeCalendarId) {
      setActiveCalendarId(calendars[0].id);
      setLocalTasks(calendars[0].tasks);
    }
  }, [calendars, activeCalendarId]);

  const activeCalendar = calendars.find(c => c.id === activeCalendarId);
  
  const currentCrop = activeCalendar ? {
    name: activeCalendar.crop_name,
    emoji: getEmojiForCrop(activeCalendar.crop_name),
    landSize: activeCalendar.land_size,
    age: Math.floor((Date.now() - new Date(activeCalendar.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    remaining: Math.max(0, getDurationForCrop(activeCalendar.crop_name) - Math.floor((Date.now() - new Date(activeCalendar.created_at).getTime()) / (1000 * 60 * 60 * 24))),
    progress: Math.min(100, Math.floor((Math.floor((Date.now() - new Date(activeCalendar.created_at).getTime()) / (1000 * 60 * 60 * 24)) / getDurationForCrop(activeCalendar.crop_name)) * 100)),
  } : null;

  const tasks = activeCalendar ? localTasks : [];

  const pendingTasks = activeCalendar ? tasks.filter(task => !task.done).map(task => {
    const day = Number(task.day.replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))));
    const due = new Date(activeCalendar.created_at);
    due.setDate(due.getDate() + Math.max(0, day - 1));
    return {
      name: task.task,
      date: due.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      type: task.icon === 'Droplets' ? 'সেচ' : task.icon === 'Leaf' ? 'সার' : task.icon === 'Scissors' ? 'ফসল' : 'পর্যবেক্ষণ',
    };
  }) : [];
  const upcomingTasks = pendingTasks.length ? [{ month: 'আপনার বাকি কাজ', tasks: pendingTasks }] : [];

  const handleCreateCalendar = async () => {
    if (!selectedCrop || !landSize) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "অনুগ্রহ করে ফসল ও জমির পরিমাণ নির্বাচন করুন।",
      });
      return;
    }

    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "লগইন প্রয়োজন",
        description: "ক্যালেন্ডার সেভ করতে লগইন করুন।",
      });
      navigate("/auth");
      return;
    }

    const crop = cropOptions.find(c => c.id === selectedCrop);
    if (crop) {
      const newTasks = generateCalendar(crop);
      const result = await addCalendar(crop.name, parseFloat(landSize), newTasks);
      
      if (result) {
        setActiveCalendarId(result.id);
        setLocalTasks(result.tasks);
        setIsDialogOpen(false);
        setSelectedCrop("");
        setLandSize("");
      }
    }
  };

  const handleToggleTask = async (index: number) => {
    if (!activeCalendar) return;
    
    const updatedTasks = [...localTasks];
    updatedTasks[index] = { ...updatedTasks[index], done: !updatedTasks[index].done };
    setLocalTasks(updatedTasks);
    
    const saved = await updateCalendarTasks(activeCalendar.id, updatedTasks);
    if (!saved) {
      setLocalTasks(activeCalendar.tasks);
      toast({ variant: 'destructive', title: 'সংরক্ষণ হয়নি', description: 'কাজের অবস্থা আপডেট করা যায়নি। আবার চেষ্টা করুন।' });
    }
  };

  const handleDeleteCalendar = async () => {
    if (!activeCalendar) return;
    
    const success = await deleteCalendar(activeCalendar.id);
    if (success) {
      setActiveCalendarId(null);
      setLocalTasks([]);
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Sprout className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-chart-5" />
              ফার্মিং ক্যালেন্ডার
            </h1>
            <p className="text-xs text-muted-foreground">
              {isLoggedIn ? `${calendars.length}টি ক্যালেন্ডার সেভ আছে` : "লগইন করে সেভ করুন"}
            </p>
          </div>
          {activeCalendar && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive"
              onClick={handleDeleteCalendar}
              aria-label="ক্যালেন্ডার মুছুন"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Calendar Selector */}
      {calendars.length > 1 && (
        <section className="px-4 py-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {calendars.map((cal) => (
                <Button
                  key={cal.id}
                  variant={activeCalendarId === cal.id ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => {
                    setActiveCalendarId(cal.id);
                    setLocalTasks(cal.tasks);
                  }}
                >
                  {getEmojiForCrop(cal.crop_name)} {cal.crop_name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </section>
      )}

      {/* Current Crop */}
      {currentCrop ? (
        <section className="px-4 py-4">
          <div className="bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">বর্তমান ফসল</p>
                <h2 className="text-xl font-bold text-foreground">{currentCrop.name}</h2>
                <p className="text-sm text-secondary">
                  বয়স: {currentCrop.age} দিন | আরো {currentCrop.remaining} দিন বাকি
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  জমি: {currentCrop.landSize} একর
                </p>
              </div>
              <div className="text-4xl">{currentCrop.emoji}</div>
            </div>
            <div className="mt-3 bg-card/50 rounded-lg p-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">অগ্রগতি</span>
                <span className="text-foreground font-medium">{currentCrop.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${currentCrop.progress}%` }} />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-4">
          <div className="bg-card/80 backdrop-blur-sm border border-dashed border-border rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium text-foreground mb-1">কোনো ক্যালেন্ডার নেই</h3>
            <p className="text-sm text-muted-foreground mb-4">
              নতুন ফসলের ক্যালেন্ডার তৈরি করুন
            </p>
          </div>
        </section>
      )}

      {/* This Month Tasks */}
      {tasks.length > 0 && (
        <section className="px-4 mb-4">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            এই মাসের কাজ
          </h2>
          <div className="space-y-2">
            {tasks.map((item, index) => (
              <Button
                variant="ghost"
                key={index}
                onClick={() => handleToggleTask(index)}
                aria-pressed={item.done}
                className={cn(
                  "w-full h-auto min-h-16 text-left whitespace-normal bg-card border rounded-md p-3 flex items-center gap-3 cursor-pointer transition-all",
                  item.done ? "border-secondary/50 opacity-70" : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  item.done ? "bg-secondary/20" : "bg-muted"
                )}>
                  {renderIcon(item.icon, cn("w-5 h-5", item.color))}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.task}</p>
                  <p className="text-xs text-muted-foreground">রোপণের {item.day}তম দিন</p>
                </div>
                {item.done ? (
                  <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> সম্পন্ন
                  </span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">বাকি</span>
                )}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Months */}
      {activeCalendar && (
        <section className="px-4 mb-4">
          <h2 className="text-base font-semibold text-foreground mb-3">আগামী মাসগুলোর পরিকল্পনা</h2>
          {upcomingTasks.map((month, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="text-sm font-medium text-primary mb-2">{month.month}</h3>
              <div className="space-y-2">
                {month.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.name}</p>
                      <p className="text-xs text-muted-foreground">{task.date}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      task.type === "সেচ" && "bg-chart-3/20 text-chart-3",
                      task.type === "সার" && "bg-primary/20 text-primary",
                      task.type === "পর্যবেক্ষণ" && "bg-chart-2/20 text-chart-2",
                      task.type === "ফসল" && "bg-secondary/20 text-secondary"
                    )}>
                      {task.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Generate New Calendar */}
      <section className="px-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-chart-5 to-chart-5/80 text-chart-5-foreground">
              <Plus className="w-4 h-4 mr-2" />
              নতুন ফসলের ক্যালেন্ডার তৈরি করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-foreground">নতুন ক্যালেন্ডার তৈরি</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">ফসল নির্বাচন করুন</label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="ফসল বেছে নিন" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.emoji} {crop.name} ({crop.duration} দিন)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">জমির পরিমাণ (একর)</label>
                <Input
                  type="number"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  placeholder="যেমন: ২.৫"
                  min="0.1"
                  step="0.1"
                />
              </div>
              {!isLoggedIn && (
                <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                  ⚠️ ক্যালেন্ডার সেভ করতে লগইন করতে হবে
                </p>
              )}
              <Button 
                onClick={handleCreateCalendar}
                className="w-full bg-secondary text-secondary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                ক্যালেন্ডার তৈরি করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
