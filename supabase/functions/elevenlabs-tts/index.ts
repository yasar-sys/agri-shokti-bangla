import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();
    
    console.log('=== ElevenLabs TTS Request ===');
    console.log('Text length:', text?.length || 0);
    console.log('Text preview:', text?.substring(0, 100) || 'No text');
    console.log('Voice ID:', voiceId || 'Using default');

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      console.error('ERROR: ELEVENLABS_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured', code: 'NO_API_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('API Key configured: Yes (length:', ELEVENLABS_API_KEY.length, ')');

    if (!text || text.trim().length === 0) {
      console.error('ERROR: No text provided');
      return new Response(
        JSON.stringify({ error: 'Text is required', code: 'NO_TEXT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Roger voice - good for multilingual including Bengali
    const selectedVoice = voiceId || 'CwhRBWXzGAHq8TQ4Fs17';

    // Use mp3_44100_128 for high quality
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`;
    
    console.log('Calling ElevenLabs API...');
    console.log('URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_multilingual_v2', // Best for Bengali
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
          speed: 0.95, // Slightly slower for clarity
        },
      }),
    });

    console.log('ElevenLabs Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', response.status, errorText);
      
      let errorMessage = 'TTS generation failed';
      let errorCode = 'API_ERROR';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail?.message || errorJson.message || errorText;
        
        // Check for quota/billing issues
        if (errorMessage.includes('Free Tier') || errorMessage.includes('quota') || errorMessage.includes('characters_exceeded')) {
          errorCode = 'QUOTA_EXCEEDED';
          errorMessage = 'ElevenLabs free tier quota exceeded. Please upgrade or try again later.';
        }
      } catch {
        errorMessage = errorText;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          status: response.status,
          code: errorCode
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('Audio generated successfully, size:', audioBuffer.byteLength, 'bytes');

    if (audioBuffer.byteLength < 100) {
      console.error('ERROR: Audio buffer too small, likely invalid');
      return new Response(
        JSON.stringify({ error: 'Invalid audio response from ElevenLabs', code: 'INVALID_AUDIO' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return binary audio directly with proper headers
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'FUNCTION_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
