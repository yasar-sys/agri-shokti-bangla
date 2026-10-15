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
    <nav className="editorial-bottom-nav fixed bottom-0 left-0 right-0 z-40 safe-area-bottom" aria-label={t('home')}>
      <div className="flex items-center justify-around px-4 py-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} className={cn('relative flex flex-col items-center justify-center gap-1 px-4 transition-colors duration-200', active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
            {active && <span className="absolute top-0 h-0.5 w-6 bg-primary" />}
            <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
            <span className="text-xs font-medium">{t(item.labelKey)}</span>
          </Link>;
        })}
      </div>
    </nav>
  );
}
