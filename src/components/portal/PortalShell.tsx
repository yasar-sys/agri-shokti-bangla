import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CropLine } from '@/components/ui/editorial';

/** Editorial page frame shared by portals and admin panel (matches Home). */
export function PortalShell({ eyebrow, title, subtitle, children, action }: {
  eyebrow: string; title: string; subtitle?: string; children: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-8 relative overflow-hidden">
          <Link to="/home" className="inline-flex items-center gap-2 min-h-12 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> হোম
          </Link>
          <CropLine className="absolute right-4 top-4 text-primary/15 hidden sm:block" />
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-clay font-semibold">{eyebrow}</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-5xl leading-tight tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-muted-foreground max-w-xl">{subtitle}</p>}
            </div>
            {action}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-10">{children}</main>
    </div>
  );
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2 mb-4">
        <h2 className="font-display text-xl md:text-2xl">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'অপেক্ষমাণ', cls: 'bg-warning/15 text-foreground border-warning/50' },
    approved: { label: 'অনুমোদিত', cls: 'bg-healthy/10 text-healthy border-healthy/40' },
    rejected: { label: 'বাতিল', cls: 'bg-destructive/10 text-destructive border-destructive/40' },
    available: { label: 'বিক্রয়যোগ্য', cls: 'bg-healthy/10 text-healthy border-healthy/40' },
    sold: { label: 'বিক্রি হয়েছে', cls: 'bg-muted text-muted-foreground border-border' },
    accepted: { label: 'গৃহীত', cls: 'bg-healthy/10 text-healthy border-healthy/40' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground border-border' };
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-sm border ${s.cls}`}>{s.label}</span>;
}

export const bn = (n: number) => n.toLocaleString('bn-BD');
