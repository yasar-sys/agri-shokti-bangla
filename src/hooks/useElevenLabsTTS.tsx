import { useState, useCallback, useRef } from 'react';

interface UseElevenLabsTTSOptions {
  voiceId?: string;
  useFallback?: boolean; // Use browser TTS as fallback
}

interface UseElevenLabsTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  usingFallback: boolean;
}

export function useElevenLabsTTS(options: UseElevenLabsTTSOptions = {}): UseElevenLabsTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanup = useCallback(() => {
    // Cleanup audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    // Cleanup speech synthesis
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  // Fallback to browser's native TTS
  const speakWithBrowserTTS = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser TTS not supported'));
        return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Try to find Bengali voice
      const voices = window.speechSynthesis.getVoices();
      const bengaliVoice = voices.find(v => 
        v.lang.includes('bn') || v.lang.includes('hi') || v.name.includes('Bengali')
      );
      if (bengaliVoice) {
        utterance.voice = bengaliVoice;
      }
      
      utterance.lang = 'bn-BD';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        console.log('[TTS Fallback] Started speaking');
        setIsSpeaking(true);
        setIsLoading(false);
      };
      
      utterance.onend = () => {
        console.log('[TTS Fallback] Finished speaking');
        setIsSpeaking(false);
        utteranceRef.current = null;
        resolve();
      };
      
      utterance.onerror = (e) => {
        console.error('[TTS Fallback] Error:', e);
        setIsSpeaking(false);
        utteranceRef.current = null;
        reject(new Error('Browser TTS failed'));
      };
      
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) {
      console.warn('[TTS] Empty text provided, skipping');
      return;
    }

    // Stop any current playback first
    stop();
    
    setIsLoading(true);
    setError(null);
    setUsingFallback(false);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[TTS] Missing Supabase configuration, using fallback');
      setUsingFallback(true);
      try {
        await speakWithBrowserTTS(text);
      } catch (err) {
        setError('TTS configuration error');
        setIsLoading(false);
      }
      return;
    }

    try {
      console.log('[TTS] Starting ElevenLabs TTS request...');
      console.log('[TTS] Text length:', text.length);
      
      // Call our edge function (NOT ElevenLabs directly)
      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ 
            text: text.trim().substring(0, 500), // Limit text length
            voiceId: options.voiceId || 'CwhRBWXzGAHq8TQ4Fs17'
          }),
        }
      );

      console.log('[TTS] Response status:', response.status);

      // Check if response is JSON (error) or audio (success)
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json') || !response.ok) {
        // This is an error response - try to parse it
        let errorMessage = 'TTS request failed';
        try {
          const errorData = await response.json();
          console.error('[TTS] Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.error('[TTS] Could not parse error response');
        }
        
        // Check if it's a quota/billing issue - use fallback
        if (response.status === 401 || response.status === 429 || 
            errorMessage.includes('Free Tier') || errorMessage.includes('quota')) {
          console.log('[TTS] ElevenLabs quota issue, using browser fallback');
          setUsingFallback(true);
          await speakWithBrowserTTS(text);
          return;
        }
        
        throw new Error(errorMessage);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      console.log('[TTS] Audio blob received, size:', audioBlob.size);
      
      if (audioBlob.size < 100) {
        console.log('[TTS] Audio too small, using fallback');
        setUsingFallback(true);
        await speakWithBrowserTTS(text);
        return;
      }

      // Create object URL for playback
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create and configure audio element
      const audio = new Audio();
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('[TTS] Audio playback started');
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        console.log('[TTS] Audio playback ended');
        setIsSpeaking(false);
        cleanup();
      };

      audio.onerror = (e) => {
        console.error('[TTS] Audio playback error:', e);
        // Try fallback on audio error
        console.log('[TTS] Audio error, trying fallback');
        cleanup();
        setUsingFallback(true);
        speakWithBrowserTTS(text).catch(() => {
          setError('অডিও চালাতে সমস্যা হয়েছে');
          setIsSpeaking(false);
          setIsLoading(false);
        });
      };

      // Set source and play
      audio.src = audioUrl;
      await audio.play();
      console.log('[TTS] Audio playing');
      
    } catch (err) {
      console.error('[TTS] Error:', err);
      
      // Try browser fallback
      console.log('[TTS] Trying browser fallback due to error');
      setUsingFallback(true);
      try {
        await speakWithBrowserTTS(text);
      } catch (fallbackErr) {
        const errorMessage = err instanceof Error ? err.message : 'TTS সমস্যা হয়েছে';
        setError(errorMessage);
        setIsLoading(false);
        setIsSpeaking(false);
      }
    }
  }, [stop, cleanup, options.voiceId, speakWithBrowserTTS]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
    isSupported: true,
    usingFallback
  };
}
