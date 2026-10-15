import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AccountType = 'farmer' | 'merchant' | 'trader';
export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface AccountRecord {
  user_id: string;
  account_type: AccountType;
  status: AccountStatus;
  display_name: string | null;
  business_name: string | null;
  phone: string | null;
  location: string | null;
}

export const ACCOUNT_LABELS: Record<AccountType, string> = {
  farmer: 'কৃষক',
  merchant: 'মার্চেন্ট',
  trader: 'ব্যবসায়ী',
};

/** Signed-in user, their portal account and admin flag (admin checked server-side via user_roles). */
export function useAccountPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) { setAccount(null); setIsAdmin(false); setLoading(false); return; }
    const [{ data: acc }, { data: admin }] = await Promise.all([
      supabase.from('account_types').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.rpc('has_role', { _user_id: u.id, _role: 'admin' }),
    ]);
    setAccount((acc as AccountRecord) ?? null);
    setIsAdmin(!!admin);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => load(session?.user ?? null), 0);
    });
    supabase.auth.getUser().then(({ data }) => load(data.user));
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const chooseAccount = useCallback(async (input: { account_type: AccountType; display_name: string; business_name?: string; phone?: string; location?: string }) => {
    if (!user) throw new Error('আগে লগইন করুন');
    const row = { user_id: user.id, ...input };
    const { error } = account
      ? await supabase.from('account_types').update(input).eq('user_id', user.id)
      : await supabase.from('account_types').insert(row);
    if (error) throw error;
    await load(user);
  }, [user, account, load]);

  return { user, account, isAdmin, loading, chooseAccount, reload: () => load(user) };
}
