import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, type = 'rag' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    let context = '';
    let systemPrompt = '';

    if (type === 'rag') {
      // Search knowledge base for relevant documents
      console.log('Searching knowledge base for:', question);
      
      // Extract keywords from question for better matching
      const keywords = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      
      // Search in knowledge base
      const { data: documents, error: searchError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_active', true)
        .limit(10);

      if (searchError) {
        console.error('Knowledge base search error:', searchError);
      }

      // Filter and rank documents by relevance
      const rankedDocs = (documents || [])
        .map((doc: any) => {
          let score = 0;
          const docText = `${doc.title} ${doc.content} ${doc.keywords?.join(' ') || ''}`.toLowerCase();
          
          keywords.forEach((keyword: string) => {
            if (docText.includes(keyword)) score += 1;
            if (doc.keywords?.some((k: string) => k.toLowerCase().includes(keyword))) score += 2;
          });
          
          return { ...doc, relevanceScore: score };
        })
        .filter((doc: any) => doc.relevanceScore > 0)
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);

      console.log(`Found ${rankedDocs.length} relevant documents`);

      // Build context from relevant documents
      if (rankedDocs.length > 0) {
        context = rankedDocs.map((doc: any) => 
          `📚 ${doc.title} (${doc.source || 'কৃষি তথ্যভাণ্ডার'})\n${doc.content}`
        ).join('\n\n---\n\n');
      }

      systemPrompt = `আপনি বাংলাদেশের কৃষকদের জন্য একজন বিশেষজ্ঞ কৃষি সহায়ক। আপনার নাম "agriশক্তি AI"।

আপনার কাছে নিম্নলিখিত তথ্যভাণ্ডার থেকে তথ্য আছে:
- BARI (বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট) গবেষণা
- স্থানীয় কৃষি পদ্ধতি
- সরকারি ভর্তুকি ও ঋণ স্কিম
- পোকা-মাকড় ও রোগ নিয়ন্ত্রণ
- সার প্রয়োগ গাইড

${context ? `\n📖 প্রাসঙ্গিক তথ্য:\n${context}\n` : ''}

নির্দেশনা:
1. সর্বদা বাংলায় উত্তর দিন
2. তথ্যভাণ্ডার থেকে পাওয়া তথ্য ব্যবহার করুন
3. সঠিক তথ্য না থাকলে সততার সাথে বলুন
4. সুপারিশ দেওয়ার সময় স্থানীয় প্রেক্ষাপট বিবেচনা করুন
5. জরুরি ক্ষেত্রে স্থানীয় কৃষি অফিসে যোগাযোগের পরামর্শ দিন
6. উত্তর সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ রাখুন`;

    } else if (type === 'moderate') {
      systemPrompt = `আপনি একটি কৃষি ফোরামের AI মডারেটর। আপনার কাজ হলো:
1. প্রশ্নটি কৃষি সম্পর্কিত কিনা যাচাই করা
2. অনুপযুক্ত বিষয়বস্তু শনাক্ত করা
3. প্রশ্নের মান উন্নত করার পরামর্শ দেওয়া

উত্তর JSON ফরম্যাটে দিন:
{
  "is_appropriate": true/false,
  "is_agriculture_related": true/false,
  "suggested_tags": ["ট্যাগ১", "ট্যাগ২"],
  "improvement_suggestions": "পরামর্শ বা খালি",
  "initial_answer": "প্রাথমিক উত্তর যদি দেওয়া যায়"
}`;
    }

    console.log('Calling Lovable AI with type:', type);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
          type: 'rate_limit'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'উত্তর পাওয়া যায়নি।';

    console.log('AI response received successfully');

    return new Response(JSON.stringify({ 
      answer,
      sources: context ? 'BARI, কৃষি সম্প্রসারণ অধিদপ্তর' : null,
      type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('RAG function error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      answer: 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
