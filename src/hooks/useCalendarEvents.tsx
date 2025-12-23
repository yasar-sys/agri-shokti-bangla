import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  title: string;
  title_bn: string;
  event_date: string;
  event_time: string;
  event_type: string;
  location?: string;
  description?: string;
  reminder: boolean;
  user_id: string;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchEvents();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('calendar-events-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_calendar_events',
            filter: `user_id=eq.${userId}`
          },
          () => fetchEvents()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [userId]);

  const fetchEvents = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'user_id'>) => {
    if (!userId) {
      toast.error('লগইন করুন');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .insert({
          ...event,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('ইভেন্ট সংরক্ষিত হয়েছে!');
      return data;
    } catch (err) {
      console.error('Error adding event:', err);
      toast.error('ইভেন্ট সংরক্ষণ করতে সমস্যা হয়েছে');
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { error } = await supabase
        .from('user_calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('ইভেন্ট আপডেট হয়েছে');
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('ইভেন্ট মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('মুছতে সমস্যা হয়েছে');
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.event_date === dateStr);
  };

  return {
    events,
    loading,
    isLoggedIn: !!userId,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    refetch: fetchEvents
  };
}
