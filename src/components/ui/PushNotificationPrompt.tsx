import { useState } from 'react';
import { Bell, BellOff, AlertTriangle, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

interface PushNotificationPromptProps {
  variant?: 'banner' | 'card' | 'minimal';
  onDismiss?: () => void;
  className?: string;
}

export function PushNotificationPrompt({ 
  variant = 'banner', 
  onDismiss,
  className 
}: PushNotificationPromptProps) {
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    loading, 
    subscribe, 
    unsubscribe,
    sendTestNotification 
  } = usePushNotifications();
  
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !isSupported || isSubscribed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleSubscribe = async () => {
    await subscribe();
  };

  if (variant === 'minimal') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSubscribe}
        disabled={loading}
        className={cn("gap-2", className)}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        বিজ্ঞপ্তি সক্রিয় করুন
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "bg-card border border-border rounded-xl p-4",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">
              পুশ বিজ্ঞপ্তি সক্রিয় করুন
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              জরুরি আবহাওয়া সতর্কতা ও গুরুত্বপূর্ণ আপডেট পেতে বিজ্ঞপ্তি চালু করুন।
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                সক্রিয় করুন
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                পরে
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner variant (default)
  return (
    <div className={cn(
      "bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/30 rounded-xl p-4 relative",
      className
    )}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-secondary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-0.5">
            আবহাওয়া সতর্কতা পান
          </h3>
          <p className="text-sm text-muted-foreground">
            তাপপ্রবাহ, ঝড়, বন্যা - জরুরি সতর্কতা সরাসরি আপনার ফোনে!
          </p>
        </div>
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="gap-2 flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">সক্রিয় করুন</span>
        </Button>
      </div>
    </div>
  );
}

// Settings toggle for notifications
export function NotificationToggle({ className }: { className?: string }) {
  const { 
    isSupported, 
    isSubscribed, 
    loading, 
    subscribe, 
    unsubscribe,
    sendTestNotification 
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className={cn("flex items-center justify-between p-3 bg-muted/50 rounded-lg", className)}>
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">পুশ বিজ্ঞপ্তি</p>
            <p className="text-xs text-muted-foreground">এই ডিভাইসে সমর্থিত নয়</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className={cn("w-5 h-5", isSubscribed ? "text-secondary" : "text-muted-foreground")} />
          <div>
            <p className="text-sm font-medium text-foreground">পুশ বিজ্ঞপ্তি</p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </p>
          </div>
        </div>
        <Button
          variant={isSubscribed ? "outline" : "default"}
          size="sm"
          onClick={() => isSubscribed ? unsubscribe() : subscribe()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSubscribed ? (
            'বন্ধ করুন'
          ) : (
            'চালু করুন'
          )}
        </Button>
      </div>
      
      {isSubscribed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={sendTestNotification}
          disabled={loading}
          className="w-full gap-2"
        >
          <Bell className="w-4 h-4" />
          পরীক্ষামূলক বিজ্ঞপ্তি পাঠান
        </Button>
      )}
    </div>
  );
}
