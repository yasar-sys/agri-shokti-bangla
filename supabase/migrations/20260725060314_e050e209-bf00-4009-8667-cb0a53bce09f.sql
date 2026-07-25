
-- chat_messages: scope to session owner (session_id = auth.uid())
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;

CREATE POLICY "Users can read own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (session_id = auth.uid()::text);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (session_id = auth.uid()::text);

CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (session_id = auth.uid()::text);

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.chat_messages FROM anon;

-- scan_history: owner-only access
DROP POLICY IF EXISTS "Anyone can read scans" ON public.scan_history;
DROP POLICY IF EXISTS "Anyone can insert scans" ON public.scan_history;

CREATE POLICY "Users can read own scans"
  ON public.scan_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own scans"
  ON public.scan_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.scan_history FROM anon;

-- push_subscriptions: remove blanket anonymous read
DROP POLICY IF EXISTS "Allow anonymous subscriptions select by endpoint" ON public.push_subscriptions;

-- Revoke EXECUTE on SECURITY DEFINER helper/trigger functions that should
-- not be callable from the Data API. Trigger functions run as table owner
-- regardless of grants; RPCs stay callable via service_role.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_scan_stats() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_comments_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_likes_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_likes_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_document_embedding(uuid, vector) FROM anon, authenticated, PUBLIC;

-- Aggregate stats functions: restrict to admin role only.
REVOKE EXECUTE ON FUNCTION public.get_engagement_stats() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_feature_stats() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_disease_trends() FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.get_engagement_stats()
 RETURNS TABLE(total_users bigint, active_users_today bigint, active_users_week bigint, total_scans bigint, total_posts bigint, total_chat_messages bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE created_at >= CURRENT_DATE),
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE created_at >= NOW() - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM public.scan_history),
    (SELECT COUNT(*) FROM public.community_posts),
    (SELECT COUNT(*) FROM public.chat_messages);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_feature_stats()
 RETURNS TABLE(feature_name text, usage_count bigint, unique_users bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT event_name, COUNT(*)::bigint, COUNT(DISTINCT user_id)::bigint
  FROM public.analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY event_name
  ORDER BY 2 DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_disease_trends()
 RETURNS TABLE(disease text, case_count bigint, latest_date date)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT disease_name, COUNT(*)::bigint, MAX(created_at::date)
  FROM public.scan_history
  WHERE disease_name IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY disease_name
  ORDER BY 2 DESC;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_engagement_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_feature_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_disease_trends() TO authenticated;
