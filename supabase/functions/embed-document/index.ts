import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embeddings using Gemini API via Lovable Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  // Clean and truncate text to fit context window
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

  try {
    const { document_id, content, title, action = 'embed_single' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (action === 'embed_single') {
      // Embed a single document by ID
      if (!document_id) {
        throw new Error('document_id is required for embed_single action');
      }

      // Fetch document content
      const { data: doc, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('id', document_id)
        .single();

      if (fetchError || !doc) {
        throw new Error(`Document not found: ${document_id}`);
      }

      // Combine title and content for better semantic representation
      const textToEmbed = `${doc.title}\n\n${doc.content}`;
      
      console.log(`Generating embedding for document: ${doc.title}`);
      const embedding = await generateEmbedding(textToEmbed, LOVABLE_API_KEY);

      // Update document with embedding
      const { error: updateError } = await supabase
        .from('knowledge_base')
        .update({ embedding: embedding })
        .eq('id', document_id);

      if (updateError) {
        throw new Error(`Failed to update embedding: ${updateError.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        document_id,
        message: 'Embedding generated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'embed_all') {
      // Embed all documents without embeddings
      const { data: docs, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('id, title, content')
        .is('embedding', null)
        .eq('is_active', true);

      if (fetchError) {
        throw new Error(`Failed to fetch documents: ${fetchError.message}`);
      }

      const results = [];
      for (const doc of docs || []) {
        try {
          const textToEmbed = `${doc.title}\n\n${doc.content}`;
          console.log(`Generating embedding for: ${doc.title}`);
          
          const embedding = await generateEmbedding(textToEmbed, LOVABLE_API_KEY);
          
          const { error: updateError } = await supabase
            .from('knowledge_base')
            .update({ embedding: embedding })
            .eq('id', doc.id);

          if (updateError) {
            results.push({ id: doc.id, success: false, error: updateError.message });
          } else {
            results.push({ id: doc.id, success: true });
          }
          
          // Rate limiting - wait 500ms between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          results.push({ id: doc.id, success: false, error: errMsg });
        }
      }

      return new Response(JSON.stringify({
        success: true, 
        total: docs?.length || 0,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'add_and_embed') {
      // Add new document and generate embedding
      if (!content || !title) {
        throw new Error('content and title are required for add_and_embed action');
      }

      const textToEmbed = `${title}\n\n${content}`;
      console.log(`Generating embedding for new document: ${title}`);
      
      const embedding = await generateEmbedding(textToEmbed, LOVABLE_API_KEY);

      // Get additional fields from request
      const { category = 'সাধারণ', source, crop_type, season, keywords, region } = await req.json();

      const { data: newDoc, error: insertError } = await supabase
        .from('knowledge_base')
        .insert({
          title,
          content,
          category,
          source,
          crop_type,
          season,
          keywords,
          region,
          embedding,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert document: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        document: newDoc,
        message: 'Document added with embedding'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('Embed document error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
