import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced AI Chat Hook with Groq LLaMA + Gemini Fallback
 * RootSource-inspired ultra-fast AI responses
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  useGroq?: boolean; // Enable Groq for 10x faster responses
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  message: string;
  provider: string;
  model: string;
  fast_mode: boolean;
}

export function useEnhancedChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<string>('');

  const sendMessage = useCallback(async (
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse | null> => {
    const {
      useGroq = true, // Default to Groq for speed
      temperature = 0.7,
      max_tokens = 1024
    } = options;

    setLoading(true);
    setError(null);

    try {
      // Use the unified 'chat' function which routes through Lovable Gateway
      // This works on managed Supabase without needing custom GROQ_API_KEYs
      const { data, error: invokeError } = await supabase.functions.invoke('chat', {
        body: {
          messages,
          model: useGroq ? 'fast' : 'default', // 'fast' maps to Llama 3.1
          temperature,
          max_tokens
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Chat request failed');
      }

      // The 'chat' function returns { response: string } or { error: string }
      if (data.error) {
        throw new Error(data.error);
      }

      const response: ChatResponse = {
        message: data.response,
        provider: useGroq ? 'Lovable Groq (Llama 3.1)' : 'Lovable Gemini',
        model: useGroq ? 'llama-3.1-8b-instruct' : 'gemini-2.5-flash',
        fast_mode: useGroq
      };

      setLastProvider(response.provider);
      console.log(`✓ AI Response from ${response.provider} via Lovable Gateway`);

      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Unified chat error:', err);
      setError(errorMessage);
      return null;

    } finally {
      setLoading(false);
    }
  }, []);

  // Simple chat interface
  const chat = useCallback(async (
    userMessage: string,
    messageHistory: ChatMessage[] = [],
    options?: ChatOptions
  ): Promise<string | null> => {
    const messages: ChatMessage[] = [
      ...messageHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await sendMessage(messages, options);
    return response?.message || null;
  }, [sendMessage]);

  // Get AI recommendation based on data
  const getRecommendation = useCallback(async (
    context: {
      crop?: string;
      problem?: string;
      weather?: any;
      ndvi?: number;
      location?: string;
    }
  ): Promise<string | null> => {
    const prompt = `আমার ফসল: ${context.crop || 'ধান'}
সমস্যা: ${context.problem || 'সাধারণ পরামর্শ চাই'}
অবস্থান: ${context.location || 'বাংলাদেশ'}
${context.ndvi ? `NDVI: ${context.ndvi}` : ''}
${context.weather ? `আবহাওয়া: ${JSON.stringify(context.weather)}` : ''}

অনুগ্রহ করে বিস্তারিত পরামর্শ দিন।`;

    return await chat(prompt, [], { useGroq: true });
  }, [chat]);

  return {
    sendMessage,
    chat,
    getRecommendation,
    loading,
    error,
    lastProvider,
    isReady: !loading
  };
}

// Conversation memory storage
const conversationMemory = new Map<string, ChatMessage[]>();

export function useConversationMemory(conversationId: string = 'default') {
  const getHistory = useCallback((): ChatMessage[] => {
    return conversationMemory.get(conversationId) || [];
  }, [conversationId]);

  const addMessage = useCallback((message: ChatMessage) => {
    const history = getHistory();
    history.push(message);
    conversationMemory.set(conversationId, history);
  }, [conversationId, getHistory]);

  const clearHistory = useCallback(() => {
    conversationMemory.delete(conversationId);
  }, [conversationId]);

  const getLastN = useCallback((n: number): ChatMessage[] => {
    const history = getHistory();
    return history.slice(-n);
  }, [getHistory]);

  return {
    getHistory,
    addMessage,
    clearHistory,
    getLastN
  };
}
