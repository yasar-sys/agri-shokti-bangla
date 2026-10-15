import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const COMMUNITY_BUCKET = "community-images";

/** Renders a stored community image path (private bucket) or a full URL. */
export function CommunityImage({ src, alt }: { src: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(/^(https?:|blob:|data:)/.test(src) ? src : null);

  useEffect(() => {
    if (/^(https?:|blob:|data:)/.test(src)) { setUrl(src); return; }
    let active = true;
    supabase.storage.from(COMMUNITY_BUCKET).createSignedUrl(src, 60 * 60 * 24).then(({ data }) => {
      if (active) setUrl(data?.signedUrl ?? null);
    });
    return () => { active = false; };
  }, [src]);

  if (!url) return <div className="w-full h-56 bg-muted animate-pulse" />;
  return <img src={url} alt={alt} className="w-full max-h-96 object-cover" loading="lazy" />;
}
