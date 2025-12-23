import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GovScheme {
  id: string;
  title: string;
  description: string;
  category: string | null;
  eligibility: string | null;
  benefits: string | null;
  application_link: string | null;
  contact_phone: string | null;
  deadline: string | null;
}

export function useGovSchemes() {
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('government_schemes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSchemesByCategory = (category: string) => {
    return schemes.filter(s => s.category === category);
  };

  return { schemes, loading, getSchemesByCategory, refetch: fetchSchemes };
}
