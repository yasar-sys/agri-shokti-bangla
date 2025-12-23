import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Bell,
  Trash2,
  X,
  Globe,
  Languages,
  LogIn,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocation";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

interface FarmEvent {
  id: string;
  title: string;
  titleBn: string;
  date: Date;
  time: string;
  location?: string;
  description?: string;
  type: "planting" | "harvesting" | "fertilizer" | "irrigation" | "pest" | "other";
  reminder: boolean;
}

const eventTypeColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  planting: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", icon: "🌱" },
  harvesting: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400", icon: "🌾" },
  fertilizer: { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400", icon: "🧪" },
  irrigation: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", icon: "💧" },
  pest: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400", icon: "🐛" },
  other: { bg: "bg-gray-500/20", border: "border-gray-500/30", text: "text-gray-400", icon: "📌" },
};

const eventTypesOptions = [
  { value: "planting", labelBn: "বীজ রোপণ", labelEn: "Planting" },
  { value: "harvesting", labelBn: "ফসল কাটা", labelEn: "Harvesting" },
  { value: "fertilizer", labelBn: "সার প্রয়োগ", labelEn: "Fertilizer" },
  { value: "irrigation", labelBn: "সেচ দেওয়া", labelEn: "Irrigation" },
  { value: "pest", labelBn: "কীটনাশক", labelEn: "Pest Control" },
  { value: "other", labelBn: "অন্যান্য", labelEn: "Other" },
];

// Bengali month names
const bengaliMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const englishMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const bengaliDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const englishDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Convert to Bengali numerals
const toBengaliNumeral = (num: number): string => {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bengaliNumerals[parseInt(d)] || d).join('');
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [localEvents, setLocalEvents] = useState<FarmEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const [currentTime, setCurrentTime] = useState(new Date());
  const geoLocation = useLocation();
  
  // Database calendar events hook
  const { 
    events: dbEvents, 
    loading: eventsLoading, 
    isLoggedIn,
    addEvent: addDbEvent,
    deleteEvent: deleteDbEvent,
    getEventsForDate: getDbEventsForDate
  } = useCalendarEvents();
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    titleBn: "",
    time: "09:00",
    location: "",
    description: "",
    type: "other" as FarmEvent["type"],
    reminder: true
  });

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert database events to local format
  const events: FarmEvent[] = [
    ...dbEvents.map(e => ({
      id: e.id,
      title: e.title,
      titleBn: e.title_bn,
      date: new Date(e.event_date),
      time: e.event_time,
      location: e.location,
      description: e.description,
      type: e.event_type as FarmEvent["type"],
      reminder: e.reminder
    })),
    ...localEvents
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.title) {
      toast.error(language === "bn" ? "শিরোনাম দিন" : "Please add a title");
      return;
    }

    if (isLoggedIn) {
      // Save to database for logged-in users
      await addDbEvent({
        title: newEvent.title,
        title_bn: newEvent.titleBn || newEvent.title,
        event_date: selectedDate.toISOString().split('T')[0],
        event_time: newEvent.time,
        event_type: newEvent.type,
        location: newEvent.location || undefined,
        description: newEvent.description || undefined,
        reminder: newEvent.reminder
      });
    } else {
      // Store locally for guests
      const event: FarmEvent = {
        id: Date.now().toString(),
        ...newEvent,
        date: selectedDate,
      };
      setLocalEvents(prev => [...prev, event]);
      toast.success(language === "bn" ? "ইভেন্ট যোগ হয়েছে! (লগইন করলে সংরক্ষিত থাকবে)" : "Event added! (Login to save permanently)");
    }

    setNewEvent({
      title: "",
      titleBn: "",
      time: "09:00",
      location: "",
      description: "",
      type: "other",
      reminder: true
    });
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (isLoggedIn) {
      await deleteDbEvent(eventId);
    } else {
      setLocalEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success(language === "bn" ? "ইভেন্ট মুছে ফেলা হয়েছে" : "Event deleted");
    }
  };

  const selectedDateEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getDate() === selectedDate.getDate() && 
           eventDate.getMonth() === selectedDate.getMonth() && 
           eventDate.getFullYear() === selectedDate.getFullYear();
  }) : [];

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (language === "bn") {
      return `${toBengaliNumeral(hours)}:${toBengaliNumeral(minutes).padStart(2, '০')}:${toBengaliNumeral(seconds).padStart(2, '০')}`;
    }
    return date.toLocaleTimeString('en-US', { hour12: true });
  };

  const formatDate = (date: Date) => {
    if (language === "bn") {
      return `${toBengaliNumeral(date.getDate())} ${bengaliMonths[date.getMonth()]}, ${toBengaliNumeral(date.getFullYear())}`;
    }
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${villageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="glass-card border border-border/30">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gradient-premium">
              {language === "bn" ? "কৃষি ক্যালেন্ডার" : "Farm Calendar"}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
              <Globe className="w-3 h-3" />
              <span>{geoLocation.loading ? "..." : geoLocation.city}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="glass-card border border-border/30"
            onClick={() => setLanguage(l => l === "bn" ? "en" : "bn")}
          >
            <Languages className="w-5 h-5" />
          </Button>
        </div>

        {/* Real-time Clock */}
        <div className="glass-card rounded-2xl p-4 border border-border/30 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground font-mono">
                {formatTime(currentTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(currentTime)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>
                  {geoLocation.loading ? "..." : 
                    `${geoLocation.latitude?.toFixed(2)}°N, ${geoLocation.longitude?.toFixed(2)}°E`}
                </span>
              </div>
              <p className="text-xs text-primary mt-1">
                {language === "bn" ? "বাংলাদেশ সময়" : "Bangladesh Standard Time"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <section className="px-5 mb-4">
        <div className="glass-card rounded-2xl p-4 border border-border/30">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-bold text-foreground">
              {language === "bn" 
                ? `${bengaliMonths[currentDate.getMonth()]} ${toBengaliNumeral(currentDate.getFullYear())}`
                : `${englishMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              }
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(language === "bn" ? bengaliDays : englishDays).map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for starting day */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDate(day);
              const hasEvents = dayEvents.length > 0;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative
                    transition-all duration-200 hover:scale-105
                    ${isToday(day) ? 'bg-primary text-primary-foreground font-bold shadow-glow' : ''}
                    ${isSelected(day) && !isToday(day) ? 'bg-secondary/20 border-2 border-secondary' : ''}
                    ${!isToday(day) && !isSelected(day) ? 'hover:bg-muted/50' : ''}
                  `}
                >
                  <span>{language === "bn" ? toBengaliNumeral(day) : day}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div 
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${eventTypeColors[event.type].bg.replace('/20', '')}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Date Events */}
      <section className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-foreground">
            {selectedDate && (
              language === "bn" 
                ? `${toBengaliNumeral(selectedDate.getDate())} ${bengaliMonths[selectedDate.getMonth()]}`
                : selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            )}
            {language === "bn" ? " এর কাজ" : "'s Tasks"}
          </h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                {language === "bn" ? "যোগ করুন" : "Add"}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-border/30 max-w-[90vw] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-gradient-premium">
                  {language === "bn" ? "নতুন ইভেন্ট" : "New Event"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    {language === "bn" ? "শিরোনাম" : "Title"}
                  </label>
                  <Input
                    placeholder={language === "bn" ? "ইভেন্টের নাম..." : "Event name..."}
                    value={newEvent.title}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value, titleBn: e.target.value }))}
                    className="glass-card border-border/30"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      {language === "bn" ? "সময়" : "Time"}
                    </label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="glass-card border-border/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      {language === "bn" ? "ধরন" : "Type"}
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as FarmEvent["type"] }))}
                      className="w-full h-10 rounded-xl glass-card border border-border/30 px-3 text-sm bg-transparent"
                    >
                      {eventTypesOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-card">
                          {language === "bn" ? opt.labelBn : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    {language === "bn" ? "স্থান" : "Location"}
                  </label>
                  <Input
                    placeholder={language === "bn" ? "জমির নাম..." : "Field name..."}
                    value={newEvent.location}
                    onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="glass-card border-border/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    {language === "bn" ? "বিবরণ" : "Description"}
                  </label>
                  <Textarea
                    placeholder={language === "bn" ? "বিস্তারিত লিখুন..." : "Add details..."}
                    value={newEvent.description}
                    onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="glass-card border-border/30 min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={handleAddEvent}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                >
                  {language === "bn" ? "ইভেন্ট যোগ করুন" : "Add Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {selectedDateEvents.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 border border-border/30 text-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {language === "bn" ? "এই দিনে কোনো কাজ নেই" : "No tasks for this day"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateEvents.map(event => (
              <div
                key={event.id}
                className={`glass-card rounded-2xl p-4 border ${eventTypeColors[event.type].border} relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${eventTypeColors[event.type].bg.replace('/20', '')}`} />
                
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${eventTypeColors[event.type].bg} flex items-center justify-center text-xl`}>
                      {eventTypeColors[event.type].icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {language === "bn" ? event.titleBn : event.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.reminder && (
                      <Bell className="w-4 h-4 text-primary" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      <section className="px-5">
        <h3 className="text-lg font-bold text-foreground mb-3">
          {language === "bn" ? "আসন্ন কাজ" : "Upcoming Tasks"}
        </h3>
        <div className="space-y-2">
          {events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(event => (
              <div
                key={event.id}
                className={`glass-card rounded-xl p-3 border ${eventTypeColors[event.type].border} flex items-center gap-3`}
              >
                <div className={`w-8 h-8 rounded-lg ${eventTypeColors[event.type].bg} flex items-center justify-center text-lg`}>
                  {eventTypeColors[event.type].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {language === "bn" ? event.titleBn : event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "bn" 
                      ? `${toBengaliNumeral(new Date(event.date).getDate())} ${bengaliMonths[new Date(event.date).getMonth()]}`
                      : new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                    }
                    {" • "}{event.time}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
