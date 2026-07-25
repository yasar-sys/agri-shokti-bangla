import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const iOS = isIOS();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  // Show only when we have a prompt (Android/desktop) or on iOS (manual instructions).
  if (!deferred && !iOS) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    if (iOS) setShowIOSHelp(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label="অ্যাপ ইনস্টল করুন"
        className="relative"
      >
        <Download className="h-5 w-5" />
      </Button>

      <Dialog open={showIOSHelp} onOpenChange={setShowIOSHelp}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>হোম স্ক্রিনে যোগ করুন</DialogTitle>
            <DialogDescription>
              iPhone-এ অ্যাপটি ইনস্টল করতে নিচের ধাপগুলো অনুসরণ করুন:
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-primary">১.</span>
              <span className="flex items-center gap-1">
                Safari-এর নিচে <Share className="inline h-4 w-4" /> শেয়ার বাটনে ট্যাপ করুন
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">২.</span>
              <span>"Add to Home Screen" খুঁজে ট্যাপ করুন</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">৩.</span>
              <span>"Add" চাপুন — অ্যাপ আইকন হোম স্ক্রিনে চলে আসবে</span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
