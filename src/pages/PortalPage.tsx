import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Sprout, Store, Briefcase, Loader2, Clock, ShieldCheck, Phone, MapPin, Trash2, Check, X, Tag, Package } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAccountPortal, ACCOUNT_LABELS, type AccountType, type AccountRecord } from '@/hooks/useAccountPortal';
import { useMarketPrices } from '@/hooks/useMarketPrices';
import { PortalShell, Section, StatusBadge, bn } from '@/components/portal/PortalShell';

interface Listing { id: string; user_id: string; seller_name: string; seller_phone: string | null; crop_name: string; quantity: number; unit: string; asking_price: number; location: string | null; description: string | null; status: string; created_at: string; }
interface Offer { id: string; listing_id: string; buyer_id: string; buyer_name: string; buyer_phone: string | null; offer_price: number; message: string | null; status: string; created_at: string; }
interface PriceSub { id: string; crop_name: string; price: number; unit: string; market_location: string | null; status: string; created_at: string; }

const ROLES: { type: AccountType; icon: typeof Sprout; desc: string }[] = [
  { type: 'farmer', icon: Sprout, desc: 'ফসল বিক্রি করুন, ক্রেতার অফার পান। সঙ্গে সঙ্গে চালু।' },
  { type: 'merchant', icon: Store, desc: 'দোকান/আড়তের দাম দিন, কৃষকের কাছ থেকে কিনুন। এডমিন অনুমোদন লাগবে।' },
  { type: 'trader', icon: Briefcase, desc: 'পাইকারি দাম প্রকাশ করুন, বড় পরিমাণে কিনুন। এডমিন অনুমোদন লাগবে।' },
];

function RolePicker({ onDone, current }: { onDone: (i: { account_type: AccountType; display_name: string; business_name?: string; phone?: string; location?: string }) => Promise<void>; current?: AccountRecord | null }) {
  const [type, setType] = useState<AccountType>(current?.account_type ?? 'farmer');
  const [name, setName] = useState(current?.display_name ?? '');
  const [biz, setBiz] = useState(current?.business_name ?? '');
  const [phone, setPhone] = useState(current?.phone ?? '');
  const [loc, setLoc] = useState(current?.location ?? '');
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { toast.error('নাম ও ফোন নম্বর দিন'); return; }
    setSaving(true);
    try { await onDone({ account_type: type, display_name: name.trim(), business_name: biz.trim() || undefined, phone: phone.trim(), location: loc.trim() || undefined }); toast.success('অ্যাকাউন্ট সংরক্ষিত হয়েছে'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'সংরক্ষণ করা যায়নি'); }
    finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
        {ROLES.map(({ type: t, icon: Icon, desc }) => (
          <button type="button" key={t} onClick={() => setType(t)} aria-pressed={type === t}
            className={`text-left p-5 border rounded-md transition-colors min-h-32 ${type === t ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/50'}`}>
            <Icon className="w-6 h-6 text-primary" />
            <p className="mt-3 font-display text-2xl">{ACCOUNT_LABELS[t]}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label htmlFor="n">আপনার নাম *</Label><Input id="n" className="h-12 mt-1" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><Label htmlFor="p">ফোন নম্বর *</Label><Input id="p" className="h-12 mt-1" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        {type !== 'farmer' && <div><Label htmlFor="b">প্রতিষ্ঠানের নাম</Label><Input id="b" className="h-12 mt-1" value={biz} onChange={e => setBiz(e.target.value)} /></div>}
        <div><Label htmlFor="l">এলাকা / জেলা</Label><Input id="l" className="h-12 mt-1" value={loc} onChange={e => setLoc(e.target.value)} /></div>
      </div>
      <Button type="submit" size="lg" disabled={saving} className="w-full md:w-auto">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} {ACCOUNT_LABELS[type]} হিসেবে চালিয়ে যান
      </Button>
    </form>
  );
}

function OfferList({ offers, onRespond }: { offers: Offer[]; onRespond?: (id: string, status: 'accepted' | 'rejected') => void }) {
  if (!offers.length) return <p className="text-sm text-muted-foreground">এখনো কোনো অফার নেই।</p>;
  return <ul className="divide-y divide-border">{offers.map(o => (
    <li key={o.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-semibold">{o.buyer_name} · <span className="font-mono">৳{bn(o.offer_price)}</span></p>
        {o.message && <p className="text-sm text-muted-foreground">{o.message}</p>}
        {o.buyer_phone && <a href={`tel:${o.buyer_phone}`} className="text-sm text-primary inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{o.buyer_phone}</a>}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={o.status} />
        {onRespond && o.status === 'pending' && <>
          <Button size="sm" onClick={() => onRespond(o.id, 'accepted')}><Check className="w-4 h-4" />গ্রহণ</Button>
          <Button size="sm" variant="outline" onClick={() => onRespond(o.id, 'rejected')}><X className="w-4 h-4" />বাতিল</Button>
        </>}
      </div>
    </li>))}</ul>;
}

function FarmerPortal({ account, userId }: { account: AccountRecord; userId: string }) {
  const { prices } = useMarketPrices();
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState({ crop_name: '', quantity: '', unit: 'কেজি', asking_price: '', location: account.location ?? '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: l } = await supabase.from('produce_listings').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setListings((l as Listing[]) ?? []);
    const ids = (l ?? []).map(x => x.id);
    if (ids.length) {
      const { data: o } = await supabase.from('produce_offers').select('*').in('listing_id', ids).order('created_at', { ascending: false });
      setOffers((o as Offer[]) ?? []);
    } else setOffers([]);
  }, [userId]);

  useEffect(() => {
    load();
    const ch = supabase.channel(`farmer-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_offers' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_listings' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const ref = prices.find(p => form.crop_name && p.crop_name.includes(form.crop_name.trim()));

  const addListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(form.quantity), asking_price = Number(form.asking_price);
    if (!form.crop_name.trim() || !(quantity > 0) || !(asking_price > 0)) { toast.error('ফসল, পরিমাণ ও দাম ঠিকভাবে দিন'); return; }
    setSaving(true);
    const { error } = await supabase.from('produce_listings').insert({
      user_id: userId, seller_name: account.display_name || 'কৃষক', seller_phone: account.phone,
      crop_name: form.crop_name.trim(), quantity, unit: form.unit, asking_price, location: form.location || null, description: form.description || null,
    });
    setSaving(false);
    if (error) { toast.error('বিজ্ঞাপন দেওয়া যায়নি'); return; }
    toast.success('আপনার ফসল বিক্রির জন্য প্রকাশিত হয়েছে');
    setForm(f => ({ ...f, crop_name: '', quantity: '', asking_price: '', description: '' }));
    load();
  };

  const respond = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('produce_offers').update({ status }).eq('id', id);
    if (error) toast.error('আপডেট করা যায়নি'); else { toast.success(status === 'accepted' ? 'অফার গ্রহণ করেছেন — ক্রেতাকে ফোন করুন' : 'অফার বাতিল'); load(); }
  };
  const markSold = async (id: string, sold: boolean) => { await supabase.from('produce_listings').update({ status: sold ? 'sold' : 'available' }).eq('id', id); load(); };
  const remove = async (id: string) => { await supabase.from('produce_listings').delete().eq('id', id); load(); };

  const pendingOffers = offers.filter(o => o.status === 'pending').length;

  return (
    <>
      <div className="grid gap-px bg-border border border-border md:grid-cols-[2fr_1fr_1fr]">
        <div className="bg-card p-6"><p className="text-sm text-muted-foreground">নতুন অফার</p><p className="font-mono text-5xl mt-1">{bn(pendingOffers)}</p></div>
        <div className="bg-card p-6"><p className="text-sm text-muted-foreground">সক্রিয় বিজ্ঞাপন</p><p className="font-mono text-3xl mt-1">{bn(listings.filter(l => l.status === 'available').length)}</p></div>
        <div className="bg-card p-6"><p className="text-sm text-muted-foreground">বিক্রি হয়েছে</p><p className="font-mono text-3xl mt-1">{bn(listings.filter(l => l.status === 'sold').length)}</p></div>
      </div>

      <Section title="ফসল বিক্রি করুন">
        <form onSubmit={addListing} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1"><Label>ফসল / পণ্য</Label><Input className="h-12 mt-1" placeholder="যেমন: আলু" value={form.crop_name} onChange={e => setForm({ ...form, crop_name: e.target.value })} /></div>
          <div><Label>পরিমাণ</Label><div className="flex gap-2 mt-1"><Input className="h-12" inputMode="decimal" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            <select className="h-12 border border-input bg-background rounded-md px-2" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>{['কেজি', 'মণ', 'টন', 'পিস', 'হালি', 'ডজন'].map(u => <option key={u}>{u}</option>)}</select></div></div>
          <div><Label>চাওয়া দাম (প্রতি {form.unit}, ৳)</Label><Input className="h-12 mt-1" inputMode="decimal" value={form.asking_price} onChange={e => setForm({ ...form, asking_price: e.target.value })} />
            {ref && <p className="text-xs text-muted-foreground mt-1">আজকের বাজার দর: <span className="font-mono">৳{bn(ref.today_price)}</span>/{ref.unit}</p>}</div>
          <div><Label>এলাকা</Label><Input className="h-12 mt-1" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>বিবরণ</Label><Input className="h-12 mt-1" placeholder="মান, কবে পাওয়া যাবে ইত্যাদি" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <Button type="submit" size="lg" disabled={saving} className="md:col-span-3 md:w-fit">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />} বিক্রির জন্য প্রকাশ করুন</Button>
        </form>
      </Section>

      <Section title="আমার বিজ্ঞাপন ও অফার">
        {!listings.length ? <p className="text-muted-foreground text-sm">এখনো কোনো ফসল বিক্রির জন্য দেননি।</p> :
          <div className="space-y-6">{listings.map(l => (
            <article key={l.id} className="border-t border-border pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl">{l.crop_name} <span className="text-muted-foreground text-base font-sans">· {bn(l.quantity)} {l.unit}</span></h3>
                  <p className="font-mono text-lg">৳{bn(l.asking_price)}/{l.unit}</p>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={l.status} />
                  <Button size="sm" variant="outline" onClick={() => markSold(l.id, l.status !== 'sold')}>{l.status === 'sold' ? 'আবার চালু' : 'বিক্রি হয়েছে'}</Button>
                  <Button size="icon" variant="ghost" aria-label="মুছুন" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4" /></Button></div>
              </div>
              <div className="mt-3 pl-4 border-l-2 border-harvest/60"><OfferList offers={offers.filter(o => o.listing_id === l.id)} onRespond={respond} /></div>
            </article>))}</div>}
      </Section>
    </>
  );
}

function BuyerPortal({ account, userId }: { account: AccountRecord; userId: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [subs, setSubs] = useState<PriceSub[]>([]);
  const [price, setPrice] = useState({ crop_name: '', price: '', unit: 'কেজি', market_location: account.location ?? '', note: '' });
  const [offerFor, setOfferFor] = useState<string | null>(null);
  const [offer, setOffer] = useState({ offer_price: '', message: '' });

  const load = useCallback(async () => {
    const [{ data: l }, { data: o }, { data: s }] = await Promise.all([
      supabase.from('produce_listings').select('*').eq('status', 'available').order('created_at', { ascending: false }).limit(100),
      supabase.from('produce_offers').select('*').eq('buyer_id', userId).order('created_at', { ascending: false }),
      supabase.from('price_submissions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
    ]);
    setListings((l as Listing[]) ?? []); setMyOffers((o as Offer[]) ?? []); setSubs((s as PriceSub[]) ?? []);
  }, [userId]);

  useEffect(() => {
    load();
    const ch = supabase.channel(`buyer-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_listings' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_offers' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_submissions' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const submitPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price.price);
    if (!price.crop_name.trim() || !(p > 0)) { toast.error('পণ্যের নাম ও দাম দিন'); return; }
    const { error } = await supabase.from('price_submissions').insert({
      user_id: userId, submitter_name: account.business_name || account.display_name, crop_name: price.crop_name.trim(), price: p, unit: price.unit, market_location: price.market_location || null, note: price.note || null,
    });
    if (error) { toast.error('দাম পাঠানো যায়নি'); return; }
    toast.success('দাম পাঠানো হয়েছে — এডমিন অনুমোদন দিলে বাজার দরে দেখাবে');
    setPrice(s => ({ ...s, crop_name: '', price: '', note: '' })); load();
  };

  const sendOffer = async (listing: Listing) => {
    const p = Number(offer.offer_price);
    if (!(p > 0)) { toast.error('অফার দাম দিন'); return; }
    const { error } = await supabase.from('produce_offers').insert({ listing_id: listing.id, buyer_id: userId, buyer_name: account.business_name || account.display_name || ACCOUNT_LABELS[account.account_type], buyer_phone: account.phone, offer_price: p, message: offer.message || null });
    if (error) { toast.error('অফার পাঠানো যায়নি'); return; }
    toast.success('অফার কৃষকের কাছে পাঠানো হয়েছে'); setOfferFor(null); setOffer({ offer_price: '', message: '' }); load();
  };

  return (
    <>
      <div className="grid gap-px bg-border border border-border md:grid-cols-[2fr_1fr_1fr]">
        <div className="bg-card p-6"><p className="text-sm text-muted-foreground">বিক্রয়যোগ্য কৃষকের ফসল</p><p className="font-mono text-5xl mt-1">{bn(listings.length)}</p></div>
        <div className="bg-card p-6"><p className="text-sm text-muted-foreground">আমার অফার</p><p className="font-mono text-3xl mt-1">{bn(myOffers.length)}</p></div>
        <div className="bg-card p-6"><p className="text-sm text-muted-foreground">প্রকাশিত দাম</p><p className="font-mono text-3xl mt-1">{bn(subs.filter(s => s.status === 'approved').length)}</p></div>
      </div>

      <Section title="আজকের দাম দিন" aside={<Link to="/market" className="text-sm text-primary">বাজার দর দেখুন</Link>}>
        <form onSubmit={submitPrice} className="grid gap-4 md:grid-cols-4">
          <div><Label>পণ্য</Label><Input className="h-12 mt-1" placeholder="যেমন: ধান" value={price.crop_name} onChange={e => setPrice({ ...price, crop_name: e.target.value })} /></div>
          <div><Label>দাম (৳)</Label><Input className="h-12 mt-1" inputMode="decimal" value={price.price} onChange={e => setPrice({ ...price, price: e.target.value })} /></div>
          <div><Label>একক</Label><select className="h-12 mt-1 w-full border border-input bg-background rounded-md px-2" value={price.unit} onChange={e => setPrice({ ...price, unit: e.target.value })}>{['কেজি', 'মণ', 'টন', 'পিস', 'হালি', 'ডজন'].map(u => <option key={u}>{u}</option>)}</select></div>
          <div><Label>বাজার</Label><Input className="h-12 mt-1" value={price.market_location} onChange={e => setPrice({ ...price, market_location: e.target.value })} /></div>
          <Button type="submit" size="lg" className="md:col-span-4 md:w-fit">দাম পাঠান</Button>
        </form>
        {!!subs.length && <ul className="mt-6 divide-y divide-border">{subs.map(s => (
          <li key={s.id} className="py-2 flex items-center justify-between gap-3 text-sm"><span>{s.crop_name} · <span className="font-mono">৳{bn(s.price)}/{s.unit}</span></span><StatusBadge status={s.status} /></li>))}</ul>}
      </Section>

      <Section title="কৃষকের ফসল কিনুন">
        {!listings.length ? <p className="text-sm text-muted-foreground">এখন কোনো ফসল বিক্রির জন্য নেই।</p> :
          <div className="grid gap-px bg-border border border-border md:grid-cols-2">{listings.map(l => {
            const mine = myOffers.find(o => o.listing_id === l.id);
            return (
              <article key={l.id} className="bg-card p-5">
                <div className="flex justify-between gap-2"><h3 className="font-display text-xl">{l.crop_name}</h3><span className="font-mono">৳{bn(l.asking_price)}/{l.unit}</span></div>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-1"><Package className="w-3.5 h-3.5" />{bn(l.quantity)} {l.unit}{l.location && <><MapPin className="w-3.5 h-3.5 ml-2" />{l.location}</>}</p>
                {l.description && <p className="text-sm mt-2">{l.description}</p>}
                <p className="text-sm mt-2">বিক্রেতা: {l.seller_name}</p>
                {mine ? <div className="mt-3 flex items-center gap-2 text-sm">আপনার অফার <span className="font-mono">৳{bn(mine.offer_price)}</span><StatusBadge status={mine.status} />
                  {mine.status === 'accepted' && l.seller_phone && <a className="text-primary inline-flex items-center gap-1" href={`tel:${l.seller_phone}`}><Phone className="w-3.5 h-3.5" />{l.seller_phone}</a>}</div>
                  : offerFor === l.id ? <div className="mt-3 space-y-2">
                    <Input className="h-12" inputMode="decimal" placeholder={`প্রতি ${l.unit} আপনার দাম (৳)`} value={offer.offer_price} onChange={e => setOffer({ ...offer, offer_price: e.target.value })} />
                    <Textarea placeholder="বার্তা (ঐচ্ছিক)" value={offer.message} onChange={e => setOffer({ ...offer, message: e.target.value })} />
                    <div className="flex gap-2"><Button onClick={() => sendOffer(l)}>অফার পাঠান</Button><Button variant="ghost" onClick={() => setOfferFor(null)}>বাতিল</Button></div>
                  </div> : <Button className="mt-3" variant="outline" onClick={() => setOfferFor(l.id)}>অফার দিন</Button>}
              </article>);
          })}</div>}
      </Section>
    </>
  );
}

export default function PortalPage() {
  const { user, account, isAdmin, loading, chooseAccount } = useAccountPortal();
  const [editing, setEditing] = useState(false);

  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const adminLink = isAdmin && <Button asChild variant="outline"><Link to="/admin-panel"><ShieldCheck className="w-4 h-4" />এডমিন প্যানেল</Link></Button>;

  if (!account || editing) {
    return <PortalShell eyebrow="অ্যাকাউন্টের ধরন" title="আপনি কে হিসেবে ব্যবহার করবেন?" subtitle="প্রত্যেকের জন্য আলাদা পোর্টাল। মার্চেন্ট ও ব্যবসায়ী অ্যাকাউন্ট এডমিন অনুমোদনের পর চালু হবে।" action={adminLink}>
      <RolePicker current={account} onDone={async (i) => { await chooseAccount(i); setEditing(false); }} />
    </PortalShell>;
  }

  const label = ACCOUNT_LABELS[account.account_type];
  const changeBtn = <div className="flex gap-2">{adminLink}<Button variant="ghost" onClick={() => setEditing(true)}>ধরন পরিবর্তন</Button></div>;

  if (account.status !== 'approved') {
    return <PortalShell eyebrow={`${label} পোর্টাল`} title={account.status === 'rejected' ? 'আবেদন বাতিল হয়েছে' : 'অনুমোদনের অপেক্ষায়'} action={changeBtn}>
      <div className="border border-border bg-card p-8 max-w-xl"><Clock className="w-8 h-8 text-harvest" />
        <p className="mt-4 leading-relaxed">{account.status === 'rejected' ? 'এডমিন আপনার আবেদন অনুমোদন করেননি। তথ্য ঠিক করে আবার আবেদন করতে পারেন।' : `আপনার ${label} অ্যাকাউন্ট এডমিনের কাছে পাঠানো হয়েছে। অনুমোদন হলে এই পাতায় আপনার পোর্টাল খুলে যাবে।`}</p>
      </div>
    </PortalShell>;
  }

  return <PortalShell eyebrow={`${label} টার্মিনাল`} title={`স্বাগতম, ${account.display_name ?? label}`} subtitle={account.account_type === 'farmer' ? 'আপনার ফসল বিক্রি করুন এবং ক্রেতাদের অফার দেখুন।' : 'আজকের দাম প্রকাশ করুন এবং কৃষকের কাছ থেকে সরাসরি কিনুন।'} action={changeBtn}>
    {account.account_type === 'farmer' ? <FarmerPortal account={account} userId={user.id} /> : <BuyerPortal account={account} userId={user.id} />}
  </PortalShell>;
}
