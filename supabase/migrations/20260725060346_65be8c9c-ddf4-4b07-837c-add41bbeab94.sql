
-- analytics_events: require signed-in owner insert
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- rag_interactions: require signed-in owner insert
DROP POLICY IF EXISTS "Anyone can create RAG interactions" ON public.rag_interactions;
CREATE POLICY "Users can insert own RAG interactions"
  ON public.rag_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- has_role: keep executable only by authenticated (needed by RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- match_documents: called from edge function via service_role only
REVOKE EXECUTE ON FUNCTION public.match_documents(vector, double precision, integer) FROM PUBLIC, anon, authenticated;
