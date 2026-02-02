import { useState, useCallback, useRef } from 'react';

interface UseElevenLabsTTSOptions {
  voiceId?: string;
}

interface UseElevenLabsTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useElevenLabsTTS(options: UseElevenLabsTTSOptions = {}): UseElevenLabsTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    // Cleanup audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    // Revoke object URL to free memory
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    console.log('[ElevenLabs TTS] Stop called');
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) {
      console.warn('[ElevenLabs TTS] Empty text provided, skipping');
      return;
    }

    // Stop any current playback first
    stop();
    
    setIsLoading(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const errMsg = 'Supabase configuration missing';
      console.error('[ElevenLabs TTS]', errMsg);
      setError(errMsg);
      setIsLoading(false);
      return;
    }

    // Use Roger voice (good for Bengali) or custom voice
    const voiceId = options.voiceId || 'CwhRBWXzGAHq8TQ4Fs17';
    
    // Limit text length to avoid free-tier issues
    const trimmedText = text.trim().substring(0, 300);

    console.log('[ElevenLabs TTS] Starting request...');
    console.log('[ElevenLabs TTS] Text length:', trimmedText.length);
    console.log('[ElevenLabs TTS] Voice ID:', voiceId);

    try {
      // Call our Supabase edge function (NOT ElevenLabs directly)
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
            text: trimmedText,
            voiceId: voiceId,
          }),
        }
      );

      console.log('[ElevenLabs TTS] Response status:', response.status);
      console.log('[ElevenLabs TTS] Response content-type:', response.headers.get('content-type'));

      // Check if response is JSON (error) or audio (success)
      const contentType = response.headers.get('content-type') || '';
      
      if (!response.ok || contentType.includes('application/json')) {
        // This is an error response
        let errorMessage = `TTS request failed (${response.status})`;
        try {
          const errorData = await response.json();
          console.error('[ElevenLabs TTS] Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.error('[ElevenLabs TTS] Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      console.log('[ElevenLabs TTS] Audio blob received');
      console.log('[ElevenLabs TTS] Blob size:', audioBlob.size, 'bytes');
      console.log('[ElevenLabs TTS] Blob type:', audioBlob.type);
      
      if (audioBlob.size < 100) {
        throw new Error('Audio response too small - likely invalid');
      }

      // Create object URL for playback
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      console.log('[ElevenLabs TTS] Audio URL created:', audioUrl);

      // Create and configure audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event handlers BEFORE setting src
      audio.onloadeddata = () => {
        console.log('[ElevenLabs TTS] Audio loaded, duration:', audio.duration);
      };

      audio.onplay = () => {
        console.log('[ElevenLabs TTS] Audio playback started');
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        console.log('[ElevenLabs TTS] Audio playback ended');
        setIsSpeaking(false);
        cleanup();
      };

      audio.onerror = (e) => {
        console.error('[ElevenLabs TTS] Audio playback error:', e);
        console.error('[ElevenLabs TTS] Audio error code:', audio.error?.code);
        console.error('[ElevenLabs TTS] Audio error message:', audio.error?.message);
        setError('অডিও চালাতে সমস্যা হয়েছে');
        setIsSpeaking(false);
        setIsLoading(false);
        cleanup();
      };

      // Set source and play
      audio.src = audioUrl;
      
      console.log('[ElevenLabs TTS] Attempting to play audio...');
      await audio.play();
      console.log('[ElevenLabs TTS] Audio play() succeeded');
      
    } catch (err) {
      console.error('[ElevenLabs TTS] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'TTS সমস্যা হয়েছে';
      setError(errorMessage);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [stop, cleanup, options.voiceId]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  };
}
