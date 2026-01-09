import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Groq LLaMA 3.1 Integration (RootSource-inspired)
 * 10x faster than GPT-4 with production-ready performance
 * 
 * Features:
 * - LLaMA 3.1 8B Instant (< 1 second responses)
 * - Agricultural expertise in Bengali
 * - Fallback to existing Gemini if Groq unavailable
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  use_groq?: boolean;
}

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `আপনি একজন কৃষি বিশেষজ্ঞ AI সহায়ক যিনি বাংলাদেশের কৃষকদের সাহায্য করেন।

আপনার দক্ষতা:
- ধান, গম, পাট, সবজি চাষের পরামর্শ
- রোগ ও পোকামাকড় শনাক্তকরণ এবং প্রতিকার
- সার ও সেচ ব্যবস্থাপনা
- আবহাওয়া ভিত্তিক পরামর্শ
- NASA স্যাটেলাইট ডেটা বিশ্লেষণ
- বাংলাদেশের তিনটি ফসলী মৌসুম (বোরো, আউশ, আমন) সম্পর্কে জ্ঞান

উত্তর দেওয়ার নিয়ম:
1. সহজ বাংলায় উত্তর দিন
2. বৈজ্ঞানিক তথ্য দিয়ে সমর্থন করুন
3. ব্যবহারিক পরামর্শ দিন
4. প্রয়োজনে উদাহরণ দিন
5. ইমোজি ব্যবহার করে বোধগম্য করুন`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, temperature = 0.7, max_tokens = 1024, use_groq = true }: GroqChatRequest = await req.json();

    console.log(`Chat request received, messages: ${messages.length}, use_groq: ${use_groq}`);

    // Add system prompt if not present
    const fullMessages: ChatMessage[] = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

    let responseText = '';
    let usedProvider = '';

    // Try Groq first if enabled and API key available
    if (use_groq && GROQ_API_KEY) {
      try {
        console.log('Attempting Groq LLaMA 3.1...');
        
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant', // Ultra-fast model
            messages: fullMessages,
            temperature,
            max_tokens,
            top_p: 0.9,
            stream: false
          })
        });

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text();
          console.error('Groq API error:', groqResponse.status, errorText);
          throw new Error(`Groq API error: ${groqResponse.status}`);
        }

        const groqData = await groqResponse.json();
        responseText = groqData.choices[0]?.message?.content || '';
        usedProvider = 'Groq LLaMA 3.1 8B';
        
        console.log(`Groq response received: ${responseText.length} chars`);
      } catch (groqError) {
        console.error('Groq failed, falling back to Gemini:', groqError);
        // Fall through to Gemini fallback
      }
    }

    // Fallback to Lovable AI (Gemini) if Groq failed or disabled
    if (!responseText && LOVABLE_API_KEY) {
      console.log('Using Lovable AI (Gemini) fallback...');
      
      const geminiResponse = await fetch('https://gateway.lovable.app/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: fullMessages,
          temperature,
          max_tokens
        })
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      }

      const geminiData = await geminiResponse.json();
      responseText = geminiData.choices[0]?.message?.content || '';
      usedProvider = 'Google Gemini 2.5 Flash';
      
      console.log(`Gemini response received: ${responseText.length} chars`);
    }

    if (!responseText) {
      throw new Error('No AI provider available');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: responseText,
        provider: usedProvider,
        model: usedProvider.includes('Groq') ? 'llama-3.1-8b-instant' : 'gemini-2.5-flash',
        fast_mode: usedProvider.includes('Groq')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Chat function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        fallback_message: 'দুঃখিত, AI সেবা বর্তমানে অনুপলব্ধ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
