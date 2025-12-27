-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_base table for storing vector embeddings
ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast similarity search (using hnsw which doesn't require training data)
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON public.knowledge_base 
USING hnsw (embedding vector_cosine_ops);

-- Create a table to store RAG interaction history
CREATE TABLE IF NOT EXISTS public.rag_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  query TEXT NOT NULL,
  retrieved_context TEXT,
  retrieved_doc_ids UUID[],
  response TEXT NOT NULL,
  sources TEXT,
  model_used TEXT DEFAULT 'gemini-2.5-flash',
  tokens_used INTEGER,
  response_time_ms INTEGER,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rag_interactions
ALTER TABLE public.rag_interactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own interactions
CREATE POLICY "Users can view their own RAG interactions" 
ON public.rag_interactions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create interactions
CREATE POLICY "Anyone can create RAG interactions" 
ON public.rag_interactions 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all interactions using correct has_role signature (user_id first, then role)
CREATE POLICY "Admins can view all RAG interactions" 
ON public.rag_interactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create function for semantic similarity search
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  source TEXT,
  crop_type TEXT,
  season TEXT,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    kb.source,
    kb.crop_type,
    kb.season,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM public.knowledge_base kb
  WHERE kb.is_active = true
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to update document embedding
CREATE OR REPLACE FUNCTION public.update_document_embedding(
  doc_id UUID,
  new_embedding vector(768)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.knowledge_base
  SET embedding = new_embedding
  WHERE id = doc_id;
END;
$$;

-- Add realtime for rag_interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.rag_interactions;