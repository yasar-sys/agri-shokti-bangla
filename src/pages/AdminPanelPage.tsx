import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Check, X, BarChart3, Trash2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountPortal, ACCOUNT_LABELS, type AccountRecord } from '@/hooks/useAccountPortal';
import { PortalShell, StatusBadge, bn } from '@/components/portal/PortalShell';

interface PriceSub { id: string; submitter_name: string | null; crop_name: string; price: number; unit: string; market_location: string | null; note: string | null; status: string; created_at: string; }
interface Listing { id: string; seller_name: string; seller_phone: string | null; crop_name: string; quantity: number; unit: string; asking_price: number; location: string | null; status: string; }

export default function AdminPanelPage() {
  const { user, isAdmin, loading } = useAccountPortal();
  const [accounts, setAccounts] = useState<(AccountRecord & { created_at: string })[]>([]);
  const [subs, setSubs] = useState<PriceSub[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: a }, { data: s }, { data: l }] = await Promise.all([
      supabase.from('account_types').select('*').order('created_at', { ascending: false }),
      supabase.from('price_submissions').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('produce_listings').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    setAccounts((a as never) ?? []); setSubs((s as PriceSub[]) ?? []); setListings((l as Listing[]) ?? []);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const ch = supabase.channel(`admin-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_submissions' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_listings' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, load]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <PortalShell eyebrow="এডমিন" title="অ্যাক্সেস নেই" subtitle="এই পাতাটি শুধু এডমিনের জন্য."><Link to="/home" className="text-primary">হোমে ফিরুন</Link></PortalShell>;

  const setAccountStatus = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(id);
    const { error } = await supabase.from('account_types').update({ status }).eq('user_id', id);
    setBusy(null);
    if (error) toast.error('আপডেট করা যায়নি'); else { toast.success(status === 'approved' ? 'অনুমোদন দেওয়া হয়েছে' : 'বাতিল করা হয়েছে'); load(); }
  };
  const review = async (id: string, approve: boolean) => {
    setBusy(id);
    const { error } = await supabase.rpc('review_price_submission', { _id: id, _approve: approve });
    setBusy(null);
    if (error) toast.error('আপডেট করা যায়নি'); else { toast.success(approve ? 'দাম বাজার দরে প্রকাশিত হয়েছে' : 'দাম বাতিল'); load(); }
  };
  const removeListing = async (id: string) => { await supabase.from('produce_listings').delete().eq('id', id); load(); };

  const pendingAcc = accounts.filter(a => a.status === 'pending');
  const pendingSubs = subs.filter(s => s.status === 'pending');
  const counts = { farmer: 0, merchant: 0, trader: 0 } as Record<string, number>;
  accounts.forEach(a => { counts[a.account_type] = (counts[a.account_type] ?? 0) + 1; });

  return (
    <PortalShell eyebrow="নিয়ন্ত্রণ কক্ষ" title="এডমিন প্যানেল" subtitle="অ্যাকাউন্ট অনুমোদন, বাজার দর প্রকাশ এবং বিক্রয় বিজ্ঞাপন নিয়ন্ত্রণ।"
      action={<Button asChild variant="outline"><Link to="/admin"><BarChart3 className="w-4 h-4" />অ্যানালিটিক্স</Link></Button>}>
      <div className="grid gap-px bg-border border border-border grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="bg-card p-6 col-span-2 md:col-span-1"><p className="text-sm text-muted-foreground">অনুমোদনের অপেক্ষায়</p><p className="font-mono text-5xl mt-1">{bn(pendingAcc.length + pendingSubs.length)}</p></div>
        {(['farmer', 'merchant', 'trader'] as const).map(t => <div key={t} className="bg-card p-6"><p className="text-sm text-muted-foreground">{ACCOUNT_LABELS[t]}</p><p className="font-mono text-3xl mt-1">{bn(counts[t])}</p></div>)}
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="h-12 w-full md:w-auto">
          <TabsTrigger value="accounts" className="min-h-10">অ্যাকাউন্ট ({bn(pendingAcc.length)})</TabsTrigger>
          <TabsTrigger value="prices" className="min-h-10">দাম ({bn(pendingSubs.length)})</TabsTrigger>
          <TabsTrigger value="listings" className="min-h-10">বিজ্ঞাপন</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6">
          {!accounts.length ? <p className="text-muted-foreground text-sm">কোনো অ্যাকাউন্ট নেই।</p> :
            <ul className="divide-y divide-border border-y border-border">{accounts.map(a => (
              <li key={a.user_id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.display_name ?? '—'} {a.business_name && <span className="text-muted-foreground font-normal">· {a.business_name}</span>}</p>
                  <p className="text-sm text-muted-foreground">{ACCOUNT_LABELS[a.account_type]}{a.location && ` · ${a.location}`}{a.phone && <> · <a className="text-primary" href={`tel:${a.phone}`}>{a.phone}</a></>}</p>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={a.status} />
                  {a.account_type !== 'farmer' && a.status !== 'approved' && <Button size="sm" disabled={busy === a.user_id} onClick={() => setAccountStatus(a.user_id, 'approved')}><Check className="w-4 h-4" />অনুমোদন</Button>}
                  {a.account_type !== 'farmer' && a.status !== 'rejected' && <Button size="sm" variant="outline" disabled={busy === a.user_id} onClick={() => setAccountStatus(a.user_id, 'rejected')}><X className="w-4 h-4" />বাতিল</Button>}
                </div>
              </li>))}</ul>}
        </TabsContent>

        <TabsContent value="prices" className="mt-6">
          {!subs.length ? <p className="text-muted-foreground text-sm">কোনো দাম জমা পড়েনি।</p> :
            <ul className="divide-y divide-border border-y border-border">{subs.map(s => (
              <li key={s.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.crop_name} · <span className="font-mono">৳{bn(s.price)}/{s.unit}</span></p>
                  <p className="text-sm text-muted-foreground">{s.submitter_name ?? '—'}{s.market_location && ` · ${s.market_location}`} · {new Date(s.created_at).toLocaleString('bn-BD')}</p>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={s.status} />
                  {s.status === 'pending' && <>
                    <Button size="sm" disabled={busy === s.id} onClick={() => review(s.id, true)}><Check className="w-4 h-4" />প্রকাশ</Button>
                    <Button size="sm" variant="outline" disabled={busy === s.id} onClick={() => review(s.id, false)}><X className="w-4 h-4" />বাতিল</Button></>}
                </div>
              </li>))}</ul>}
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          {!listings.length ? <p className="text-muted-foreground text-sm">কোনো বিজ্ঞাপন নেই।</p> :
            <ul className="divide-y divide-border border-y border-border">{listings.map(l => (
              <li key={l.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-semibold">{l.crop_name} · {bn(l.quantity)} {l.unit} · <span className="font-mono">৳{bn(l.asking_price)}</span></p>
                  <p className="text-sm text-muted-foreground">{l.seller_name}{l.location && ` · ${l.location}`}{l.seller_phone && <> · <Phone className="w-3 h-3 inline" /> {l.seller_phone}</>}</p></div>
                <div className="flex items-center gap-2"><StatusBadge status={l.status} /><Button size="icon" variant="ghost" aria-label="মুছুন" onClick={() => removeListing(l.id)}><Trash2 className="w-4 h-4" /></Button></div>
              </li>))}</ul>}
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}
