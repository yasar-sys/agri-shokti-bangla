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
    // Revoke object URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    // Cancel speech synthesis
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    console.log('[TTS] Stop called');
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  // Browser native TTS fallback
  const speakWithBrowserTTS = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser TTS not supported'));
        return;
      }

      console.log('[TTS Fallback] Using browser native TTS');
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Try to find Bengali or Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const bengaliVoice = voices.find(v => 
        v.lang.includes('bn') || v.lang.includes('hi') || v.name.toLowerCase().includes('bengali')
      );
      if (bengaliVoice) {
        utterance.voice = bengaliVoice;
        console.log('[TTS Fallback] Using voice:', bengaliVoice.name);
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

    // Use Roger voice or custom voice
    const voiceId = options.voiceId || 'CwhRBWXzGAHq8TQ4Fs17';
    
    // Limit text length
    const trimmedText = text.trim().substring(0, 300);

    console.log('[TTS] Starting ElevenLabs request...');
    console.log('[TTS] Text length:', trimmedText.length);

    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('CONFIG_MISSING');
      }

      // Call Supabase edge function
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

      console.log('[TTS] Response status:', response.status);

      const contentType = response.headers.get('content-type') || '';
      
      if (!response.ok || contentType.includes('application/json')) {
        // Error response - check if we should fallback
        let errorData: { code?: string; error?: string } = {};
        try {
          errorData = await response.json();
          console.error('[TTS] Error response:', errorData);
        } catch {
          // ignore parse error
        }
        
        // Use fallback for quota/auth issues
        if (response.status === 401 || response.status === 429 || 
            errorData.code === 'QUOTA_EXCEEDED' || errorData.code === 'NO_API_KEY') {
          console.log('[TTS] ElevenLabs unavailable, using browser fallback');
          setUsingFallback(true);
          await speakWithBrowserTTS(trimmedText);
          return;
        }
        
        throw new Error(errorData.error || `TTS failed (${response.status})`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      console.log('[TTS] Audio blob size:', audioBlob.size, 'bytes');
      
      if (audioBlob.size < 100) {
        throw new Error('INVALID_AUDIO');
      }

      // Create and play audio
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

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

      audio.onerror = () => {
        console.error('[TTS] Audio playback error, trying fallback');
        cleanup();
        setUsingFallback(true);
        speakWithBrowserTTS(trimmedText).catch(() => {
          setError('অডিও চালাতে সমস্যা');
          setIsSpeaking(false);
          setIsLoading(false);
        });
      };

      audio.src = audioUrl;
      await audio.play();
      console.log('[TTS] ElevenLabs audio playing');
      
    } catch (err) {
      console.error('[TTS] Error:', err);
      
      // Try browser fallback for any error
      console.log('[TTS] Trying browser fallback due to error');
      setUsingFallback(true);
      
      try {
        await speakWithBrowserTTS(trimmedText);
      } catch (fallbackErr) {
        console.error('[TTS] Fallback also failed:', fallbackErr);
        setError('ভয়েস আউটপুট সমস্যা - ব্রাউজার TTS সাপোর্ট নেই');
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
    usingFallback,
  };
}
