import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id || null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load theme from database or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (userId) {
        // Load from database for logged-in users
        const { data } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (data?.theme) {
          setThemeState(data.theme as Theme);
          document.documentElement.classList.toggle('light', data.theme === 'light');
          document.documentElement.classList.toggle('dark', data.theme === 'dark');
        }
      } else {
        // Load from localStorage for guests
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
          setThemeState(savedTheme);
          document.documentElement.classList.toggle('light', savedTheme === 'light');
          document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
      }
    };

    loadTheme();
  }, [userId]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    localStorage.setItem('theme', newTheme);

    if (userId) {
      // Save to database for logged-in users
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_settings')
          .update({ theme: newTheme })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_settings')
          .insert({ user_id: userId, theme: newTheme });
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
