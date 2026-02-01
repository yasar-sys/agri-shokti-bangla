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
  isSupported: boolean;
}

export function useElevenLabsTTS(options: UseElevenLabsTTSOptions = {}): UseElevenLabsTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any current playback
    stop();
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting TTS for text:', text.substring(0, 50) + '...');
      
      // Use fetch directly for binary audio data
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text,
            voiceId: options.voiceId || 'CwhRBWXzGAHq8TQ4Fs17' // Roger voice - good for Bengali
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS Error:', response.status, errorText);
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      console.log('Audio blob received, size:', audioBlob.size);
      
      if (audioBlob.size < 100) {
        throw new Error('Invalid audio response');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('Audio playback started');
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('অডিও চালাতে সমস্যা হয়েছে');
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err instanceof Error ? err.message : 'TTS সমস্যা হয়েছে');
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [stop, options.voiceId]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
    isSupported: true
  };
}
