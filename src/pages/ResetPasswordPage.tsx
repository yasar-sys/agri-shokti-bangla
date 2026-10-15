import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
    if (password !== confirm) return toast.error("দুটি পাসওয়ার্ড মিলছে না");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("নতুন পাসওয়ার্ড সংরক্ষিত হয়েছে");
    navigate("/portal");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-primary">নতুন পাসওয়ার্ড দিন</h1>
        {!ready && (
          <p className="text-sm text-muted-foreground">ইমেইলে পাঠানো রিসেট লিংক থেকে এই পাতায় আসুন।</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="np">নতুন পাসওয়ার্ড</Label>
          <Input id="np" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp">পাসওয়ার্ড নিশ্চিত করুন</Label>
          <Input id="cp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>সংরক্ষণ করুন</Button>
      </form>
    </div>
  );
}
