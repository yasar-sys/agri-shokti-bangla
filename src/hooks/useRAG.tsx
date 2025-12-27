import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RAGResponse {
  answer: string;
  sources: string[] | null;
  documents_used: number;
  response_time_ms: number;
  fallback?: boolean;
}

interface RAGInteraction {
  id: string;
  query: string;
  response: string;
  sources: string | null;
  created_at: string;
  feedback_rating: number | null;
}

export function useRAG() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<RAGResponse | null>(null);
  const { toast } = useToast();

  // Get or create a session ID for tracking conversations
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('rag_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('rag_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Main RAG query function
  const askQuestion = useCallback(async (question: string): Promise<RAGResponse | null> => {
    if (!question.trim()) {
      setError('প্রশ্ন লিখুন');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const sessionId = getSessionId();

      const { data, error: fnError } = await supabase.functions.invoke('rag-answer', {
        body: {
          question: question.trim(),
          type: 'rag',
          user_id: session?.session?.user?.id || null,
          session_id: sessionId
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.type === 'rate_limit') {
          toast({
            title: 'দয়া করে অপেক্ষা করুন',
            description: 'অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।',
            variant: 'destructive'
          });
        }
        throw new Error(data.error);
      }

      const response: RAGResponse = {
        answer: data.answer,
        sources: data.sources ? (Array.isArray(data.sources) ? data.sources : [data.sources]) : null,
        documents_used: data.documents_used || 0,
        response_time_ms: data.response_time_ms || 0,
        fallback: data.fallback || false
      };

      setLastResponse(response);
      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'অজানা সমস্যা হয়েছে';
      setError(errorMessage);
      toast({
        title: 'সমস্যা হয়েছে',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSessionId, toast]);

  // Get interaction history
  const getHistory = useCallback(async (limit = 20): Promise<RAGInteraction[]> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const sessionId = getSessionId();

      let query = supabase
        .from('rag_interactions')
        .select('id, query, response, sources, created_at, feedback_rating')
        .order('created_at', { ascending: false })
        .limit(limit);

      // If user is logged in, get their interactions; otherwise, get session-based
      if (session?.session?.user?.id) {
        query = query.eq('user_id', session.session.user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching history:', error);
        return [];
      }

      return (data || []) as RAGInteraction[];
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }, [getSessionId]);

  // Submit feedback for an interaction
  const submitFeedback = useCallback(async (interactionId: string, rating: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('rag_interactions')
        .update({ feedback_rating: rating })
        .eq('id', interactionId);

      if (error) {
        throw error;
      }

      toast({
        title: 'ধন্যবাদ!',
        description: 'আপনার মতামত জমা হয়েছে।'
      });
      return true;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return false;
    }
  }, [toast]);

  // Clear session (for new conversation)
  const clearSession = useCallback(() => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('rag_session_id', newSessionId);
    setLastResponse(null);
    setError(null);
  }, []);

  return {
    askQuestion,
    getHistory,
    submitFeedback,
    clearSession,
    loading,
    error,
    lastResponse
  };
}

export default useRAG;
