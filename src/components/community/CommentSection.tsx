import { useEffect, useState } from "react";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import type { PostComment } from "@/hooks/useCommunityPosts";

const getAvatarEmoji = (name: string) => {
  const emojis = ['👨‍🌾', '👩‍🌾', '👨', '👴', '👩', '🧑‍🌾'];
  const index = (name?.charCodeAt(0) || 0) % emojis.length;
  return emojis[index];
};

const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: bn });
  } catch {
    return 'সম্প্রতি';
  }
};

interface CommentSectionProps {
  postId: string;
  fetchComments: (postId: string) => Promise<PostComment[]>;
  addComment: (postId: string, content: string) => Promise<PostComment | null>;
}

export function CommentSection({ postId, fetchComments, addComment }: CommentSectionProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchComments(postId).then((data) => {
      if (active) {
        setComments(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    const created = await addComment(postId, text.trim());
    if (created) {
      setComments((prev) => [...prev, created]);
      setText('');
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3 animate-slide-up">
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-secondary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          এখনো কোন মন্তব্য নেই। প্রথম মন্তব্য করুন!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center text-base shrink-0">
                {getAvatarEmoji(c.author_name)}
              </div>
              <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                  {c.author_name}
                  {c.is_expert_reply && (
                    <CheckCircle className="w-3 h-3 text-secondary fill-secondary/20" />
                  )}
                  <span className="text-muted-foreground font-normal">• {formatTimeAgo(c.created_at)}</span>
                </p>
                <p className="text-sm text-foreground leading-snug mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="একটি মন্তব্য লিখুন..."
          className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-secondary/50"
          disabled={submitting}
        />
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          size="sm"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
