import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embeddings using Gemini API via Lovable Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-004',
      input: cleanText,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Embedding API error:', response.status, errorText);
    throw new Error(`Failed to generate embedding: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { question, type = 'rag', user_id, session_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use service role for database operations, anon key for user-facing queries
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY!);

    let context = '';
    let retrievedDocIds: string[] = [];
    let sources: string[] = [];
    let systemPrompt = '';

    if (type === 'rag') {
      console.log('Generating embedding for query:', question);
      
      // Step 1: Generate embedding for the user's question
      let queryEmbedding: number[];
      try {
        queryEmbedding = await generateEmbedding(question, LOVABLE_API_KEY);
        console.log('Query embedding generated, length:', queryEmbedding.length);
      } catch (embeddingError) {
        console.error('Embedding generation failed, falling back to keyword search:', embeddingError);
        // Fallback to keyword-based search if embedding fails
        return await keywordFallback(question, LOVABLE_API_KEY, supabase, corsHeaders, startTime, user_id, session_id);
      }

      // Step 2: Search for similar documents using vector similarity
      const { data: documents, error: searchError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.4,
        match_count: 5
      });

      if (searchError) {
        console.error('Vector search error:', searchError);
        // Fallback to keyword search
        return await keywordFallback(question, LOVABLE_API_KEY, supabase, corsHeaders, startTime, user_id, session_id);
      }

      console.log(`Found ${documents?.length || 0} relevant documents via vector search`);

      // Step 3: Build context from retrieved documents
      if (documents && documents.length > 0) {
        retrievedDocIds = documents.map((doc: any) => doc.id);
        sources = [...new Set(documents.map((doc: any) => doc.source || 'কৃষি তথ্যভাণ্ডার'))] as string[];
        
        context = documents.map((doc: any, index: number) => 
          `📚 [${index + 1}] ${doc.title} (${doc.source || 'কৃষি তথ্যভাণ্ডার'})\n` +
          `📊 প্রাসঙ্গিকতা: ${Math.round(doc.similarity * 100)}%\n` +
          `${doc.crop_type ? `🌾 ফসল: ${doc.crop_type}` : ''}\n` +
          `${doc.season ? `🗓️ মৌসুম: ${doc.season}` : ''}\n\n` +
          `${doc.content}`
        ).join('\n\n---\n\n');
      }

      // Step 4: Create system prompt with retrieved context
      systemPrompt = `আপনি বাংলাদেশের কৃষকদের জন্য একজন বিশেষজ্ঞ কৃষি সহায়ক AI। আপনার নাম "agriশক্তি AI"।

🎯 আপনার উদ্দেশ্য:
- বাংলাদেশের কৃষকদের সঠিক ও নির্ভরযোগ্য কৃষি তথ্য প্রদান করা
- স্থানীয় প্রেক্ষাপট ও জলবায়ু অনুযায়ী পরামর্শ দেওয়া

📖 আপনার তথ্যভাণ্ডার থেকে প্রাসঙ্গিক তথ্য:
${context || '❌ এই প্রশ্নের জন্য তথ্যভাণ্ডারে প্রাসঙ্গিক তথ্য পাওয়া যায়নি।'}

📋 নির্দেশনা:
1. সর্বদা বাংলায় উত্তর দিন
2. উপরে প্রদত্ত তথ্যভাণ্ডারের তথ্য ব্যবহার করে উত্তর দিন
3. তথ্য উৎস উল্লেখ করুন (যেমন: BARI, কৃষি সম্প্রসারণ)
4. সঠিক তথ্য না থাকলে সততার সাথে বলুন
5. জরুরি ক্ষেত্রে স্থানীয় কৃষি অফিসে যোগাযোগের পরামর্শ দিন
6. উত্তর সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ রাখুন
7. প্রয়োজনে ধাপে ধাপে নির্দেশনা দিন`;

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

    // Step 5: Call Gemini for answer generation
    console.log('Calling Gemini for answer generation...');

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
        max_tokens: 1500,
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
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'সার্ভিস সাময়িকভাবে অনুপলব্ধ।',
          type: 'payment_required'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'উত্তর পাওয়া যায়নি।';
    const tokensUsed = data.usage?.total_tokens || 0;

    console.log('AI response received successfully');

    // Step 6: Store interaction in database
    const responseTimeMs = Date.now() - startTime;
    
    try {
      await supabase.from('rag_interactions').insert({
        user_id: user_id || null,
        session_id: session_id || crypto.randomUUID(),
        query: question,
        retrieved_context: context || null,
        retrieved_doc_ids: retrievedDocIds.length > 0 ? retrievedDocIds : null,
        response: answer,
        sources: sources.length > 0 ? sources.join(', ') : null,
        model_used: 'gemini-2.5-flash',
        tokens_used: tokensUsed,
        response_time_ms: responseTimeMs
      });
      console.log('Interaction saved to database');
    } catch (dbError) {
      console.error('Failed to save interaction:', dbError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({ 
      answer,
      sources: sources.length > 0 ? sources : null,
      documents_used: retrievedDocIds.length,
      type,
      response_time_ms: responseTimeMs
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

// Fallback function for keyword-based search when vector search fails
async function keywordFallback(
  question: string, 
  apiKey: string, 
  supabase: any, 
  corsHeaders: any,
  startTime: number,
  user_id?: string,
  session_id?: string
) {
  console.log('Using keyword fallback search');
  
  const keywords = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
  
  const { data: documents, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .limit(10);

  if (error) {
    console.error('Keyword search error:', error);
  }

  // Filter and rank by keyword matching
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

  const context = rankedDocs.length > 0
    ? rankedDocs.map((doc: any) => `📚 ${doc.title}\n${doc.content}`).join('\n\n---\n\n')
    : '';

  const systemPrompt = `আপনি বাংলাদেশের কৃষকদের জন্য একজন বিশেষজ্ঞ কৃষি সহায়ক।
${context ? `\n📖 প্রাসঙ্গিক তথ্য:\n${context}\n` : ''}
সর্বদা বাংলায় উত্তর দিন এবং তথ্যভাণ্ডার থেকে পাওয়া তথ্য ব্যবহার করুন।`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || 'উত্তর পাওয়া যায়নি।';

  // Save interaction
  const responseTimeMs = Date.now() - startTime;
  try {
    await supabase.from('rag_interactions').insert({
      user_id: user_id || null,
      session_id: session_id || crypto.randomUUID(),
      query: question,
      retrieved_context: context || null,
      response: answer,
      sources: 'Keyword Search Fallback',
      model_used: 'gemini-2.5-flash',
      response_time_ms: responseTimeMs
    });
  } catch (e) {
    console.error('Failed to save fallback interaction:', e);
  }

  return new Response(JSON.stringify({ 
    answer,
    sources: rankedDocs.length > 0 ? 'BARI, কৃষি সম্প্রসারণ অধিদপ্তর' : null,
    type: 'rag',
    fallback: true,
    response_time_ms: responseTimeMs
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
