import { cn } from "@/lib/utils";
import { Scan, MessageSquare, Home, Mic } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, labelKey: "home", path: "/home", gradient: "from-emerald-500 to-teal-600" },
    { icon: Scan, labelKey: "scanner", path: "/camera", gradient: "from-amber-500 to-orange-600" },
    { icon: MessageSquare, labelKey: "aiChat", path: "/chat", gradient: "from-violet-500 to-purple-600" },
    { icon: Mic, labelKey: "support", path: "/support", gradient: "from-rose-500 to-pink-600" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Premium glass background with blur */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl" />
      
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />
      
      <div className="relative flex items-center justify-around py-3 px-4 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center group"
            >
              {/* Icon container */}
              <div className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ease-out",
                isActive 
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg scale-110` 
                  : "bg-transparent group-hover:bg-muted/40 group-active:scale-95"
              )}>
                {/* Active glow effect */}
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-xl -z-10",
                    item.gradient
                  )} />
                )}
                
                {/* Shine effect on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
                  </div>
                )}
                
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive 
                    ? "text-white drop-shadow-sm" 
                    : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              
              {/* Label */}
              <span className={cn(
                "mt-1 text-[10px] font-semibold tracking-wide transition-all duration-300",
                isActive 
                  ? "text-foreground opacity-100 translate-y-0" 
                  : "text-muted-foreground opacity-70 group-hover:opacity-100"
              )}>
                {t(item.labelKey)}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className={cn(
                  "absolute -bottom-1 w-1 h-1 rounded-full bg-gradient-to-r animate-pulse",
                  item.gradient
                )} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
