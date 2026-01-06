-- Create a table for caching NASA data results to improve performance
CREATE TABLE IF NOT EXISTS public.nasa_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_nasa_data_cache_key ON public.nasa_data_cache(cache_key);

-- Index for automatic cleanup (optional, for periodic deletion)
CREATE INDEX IF NOT EXISTS idx_nasa_data_cache_expires_at ON public.nasa_data_cache(expires_at);

-- RLS handles (accessible by service role for edge functions)
ALTER TABLE public.nasa_data_cache DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.nasa_data_cache IS 'Stores cached NASA API results to reduce latency for farmers.';
