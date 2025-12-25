import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface CalendarTask {
  day: string;
  task: string;
  icon: string;
  color: string;
  done: boolean;
}

export interface UserCalendar {
  id: string;
  user_id: string;
  crop_name: string;
  land_size: number;
  tasks: CalendarTask[];
  created_at: string;
}

export function useUserCalendars() {
  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchCalendars(user.id);
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          fetchCalendars(session.user.id);
        } else {
          setUserId(null);
          setCalendars([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchCalendars = async (uid: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_calendars")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const parsedCalendars = (data || []).map(cal => ({
        ...cal,
        tasks: (cal.tasks as unknown as CalendarTask[]) || []
      }));

      setCalendars(parsedCalendars);
    } catch (error) {
      console.error("Error fetching calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCalendar = async (
    cropName: string,
    landSize: number,
    tasks: CalendarTask[]
  ): Promise<UserCalendar | null> => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "লগইন প্রয়োজন",
        description: "ক্যালেন্ডার সেভ করতে লগইন করুন।",
      });
      return null;
    }

    try {
      const tasksJson = JSON.parse(JSON.stringify(tasks)) as Json;
      
      const { data, error } = await supabase
        .from("user_calendars")
        .insert({
          user_id: userId,
          crop_name: cropName,
          land_size: landSize,
          tasks: tasksJson,
        })
        .select()
        .single();

      if (error) throw error;

      const newCalendar: UserCalendar = {
        ...data,
        tasks: tasks
      };

      setCalendars(prev => [newCalendar, ...prev]);
      
      toast({
        title: "সফল!",
        description: `${cropName} ক্যালেন্ডার সেভ হয়েছে।`,
      });

      return newCalendar;
    } catch (error) {
      console.error("Error adding calendar:", error);
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "ক্যালেন্ডার সেভ করতে সমস্যা হয়েছে।",
      });
      return null;
    }
  };

  const updateCalendarTasks = async (
    calendarId: string,
    tasks: CalendarTask[]
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const tasksJson = JSON.parse(JSON.stringify(tasks)) as Json;
      
      const { error } = await supabase
        .from("user_calendars")
        .update({ tasks: tasksJson })
        .eq("id", calendarId)
        .eq("user_id", userId);

      if (error) throw error;

      setCalendars(prev =>
        prev.map(cal =>
          cal.id === calendarId ? { ...cal, tasks } : cal
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating calendar:", error);
      return false;
    }
  };

  const deleteCalendar = async (calendarId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("user_calendars")
        .delete()
        .eq("id", calendarId)
        .eq("user_id", userId);

      if (error) throw error;

      setCalendars(prev => prev.filter(cal => cal.id !== calendarId));
      
      toast({
        title: "মুছে ফেলা হয়েছে",
        description: "ক্যালেন্ডার সফলভাবে মুছে ফেলা হয়েছে।",
      });

      return true;
    } catch (error) {
      console.error("Error deleting calendar:", error);
      return false;
    }
  };

  const getActiveCalendar = (): UserCalendar | null => {
    return calendars.length > 0 ? calendars[0] : null;
  };

  return {
    calendars,
    loading,
    isLoggedIn: !!userId,
    addCalendar,
    updateCalendarTasks,
    deleteCalendar,
    getActiveCalendar,
    refetch: () => userId && fetchCalendars(userId),
  };
}
