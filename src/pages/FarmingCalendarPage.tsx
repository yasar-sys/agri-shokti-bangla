import { ArrowLeft, Calendar, Droplets, Leaf, Bug, Scissors, Sprout, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const currentMonth = [
  { day: "০১", task: "বীজ বপন", icon: Sprout, color: "text-secondary", done: true },
  { day: "০৫", task: "প্রথম সেচ", icon: Droplets, color: "text-chart-3", done: true },
  { day: "১০", task: "ইউরিয়া প্রয়োগ", icon: Leaf, color: "text-primary", done: true },
  { day: "১৫", task: "আগাছা পরিষ্কার", icon: Scissors, color: "text-chart-2", done: false },
  { day: "২০", task: "পোকা চেক", icon: Bug, color: "text-destructive", done: false },
  { day: "২৫", task: "দ্বিতীয় সেচ", icon: Droplets, color: "text-chart-3", done: false },
  { day: "৩০", task: "TSP প্রয়োগ", icon: Leaf, color: "text-primary", done: false },
];

const upcomingTasks = [
  { 
    month: "কার্তিক", 
    tasks: [
      { name: "তৃতীয় সেচ", date: "০৫ কার্তিক", type: "সেচ" },
      { name: "পটাশ প্রয়োগ", date: "১০ কার্তিক", type: "সার" },
      { name: "ফুল আসার সময়", date: "১৫ কার্তিক", type: "পর্যবেক্ষণ" },
    ]
  },
  { 
    month: "অগ্রহায়ণ", 
    tasks: [
      { name: "শেষ সেচ", date: "০১ অগ্রহায়ণ", type: "সেচ" },
      { name: "ফসল কাটার প্রস্তুতি", date: "১৫ অগ্রহায়ণ", type: "ফসল" },
      { name: "ফসল কাটা", date: "২৫ অগ্রহায়ণ", type: "ফসল" },
    ]
  },
];

export default function FarmingCalendarPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-chart-5" />
              ফার্মিং ক্যালেন্ডার
            </h1>
            <p className="text-xs text-muted-foreground">AI তৈরি ৬ মাসের কাজের সূচি</p>
          </div>
        </div>
      </header>

      {/* Current Crop */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">বর্তমান ফসল</p>
              <h2 className="text-xl font-bold text-foreground">আমন ধান</h2>
              <p className="text-sm text-secondary">বয়স: ৪৫ দিন | আরো ৬০ দিন বাকি</p>
            </div>
            <div className="text-4xl">🌾</div>
          </div>
          <div className="mt-3 bg-card/50 rounded-lg p-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">অগ্রগতি</span>
              <span className="text-foreground font-medium">৪২%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* This Month Tasks */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" />
          এই মাসের কাজ (আশ্বিন)
        </h2>
        <div className="space-y-2">
          {currentMonth.map((item, index) => (
            <div 
              key={index}
              className={cn(
                "bg-card border rounded-xl p-3 flex items-center gap-3",
                item.done ? "border-secondary/50 opacity-70" : "border-border"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                item.done ? "bg-secondary/20" : "bg-muted"
              )}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.task}</p>
                <p className="text-xs text-muted-foreground">{item.day} আশ্বিন</p>
              </div>
              {item.done ? (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">সম্পন্ন ✓</span>
              ) : (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">বাকি</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Months */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">আগামী মাসগুলোর পরিকল্পনা</h2>
        {upcomingTasks.map((month, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-sm font-medium text-primary mb-2">{month.month}</h3>
            <div className="space-y-2">
              {month.tasks.map((task, taskIdx) => (
                <div key={taskIdx} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
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

      {/* Generate New Calendar */}
      <section className="px-4">
        <Button className="w-full bg-gradient-to-r from-chart-5 to-chart-5/80 text-chart-5-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          নতুন ফসলের ক্যালেন্ডার তৈরি করুন
        </Button>
      </section>
    </div>
  );
}
