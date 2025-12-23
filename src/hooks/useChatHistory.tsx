import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  session_id: string;
  created_at: string;
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Use user ID as session ID for logged-in users, otherwise generate a temporary one
    const sId = session?.user?.id || `guest-${Date.now()}`;
    setSessionId(sId);
    
    if (session?.user) {
      await fetchHistory(sId);
    }
    setLoading(false);
  };

  const fetchHistory = async (sId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      setMessages(data?.map(m => ({
        ...m,
        sender: m.sender as 'user' | 'ai'
      })) || []);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const saveMessage = async (content: string, sender: 'user' | 'ai') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return; // Only save for logged-in users

      await supabase.from('chat_messages').insert({
        content,
        sender,
        session_id: session.user.id
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  };

  const clearHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', session.user.id);
      
      setMessages([]);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  return {
    messages,
    loading,
    sessionId,
    saveMessage,
    clearHistory,
    refetch: () => fetchHistory(sessionId)
  };
}
