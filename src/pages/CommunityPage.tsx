import { UsersRound, MessageCircle, Heart, Share2, Send, ArrowLeft, Plus, Image, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { CommentSection } from "@/components/community/CommentSection";
import { SEOHead, createFAQSchema } from "@/components/seo/SEOHead";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const getAvatarEmoji = (name: string) => {
  const emojis = ['👨‍🌾', '👩‍🌾', '👨', '👴', '👩', '🧑‍🌾'];
  const index = name.charCodeAt(0) % emojis.length;
  return emojis[index];
};

const getCropEmoji = (cropType: string | null) => {
  const emojiMap: Record<string, string> = {
    'ধান': '🌾', 'rice': '🌾',
    'আলু': '🥔', 'potato': '🥔',
    'টমেটো': '🍅', 'tomato': '🍅',
    'পেঁয়াজ': '🧅', 'onion': '🧅',
    'সবজি': '🥬', 'vegetable': '🥬',
    'ভুট্টা': '🌽', 'corn': '🌽',
  };
  if (!cropType) return '🌱';
  return emojiMap[cropType.toLowerCase()] || '🌱';
};

export default function CommunityPage() {
  const { posts, topContributors, loading, toggleLike, isPostLiked, createPost, fetchComments, addComment } = useCommunityPosts();
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    const success = await createPost({
      title: newPostContent.substring(0, 50),
      content: newPostContent,
      post_type: 'story'
    });
    if (success) {
      setNewPostContent('');
      setShowPostForm(false);
    }
    setIsPosting(false);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: bn });
    } catch {
      return 'সম্প্রতি';
    }
  };

  return (
    <>
      <SEOHead
        title="কৃষক কমিউনিটি"
        description="বাংলাদেশের হাজারো কৃষকের সাথে যুক্ত হোন। কৃষি অভিজ্ঞতা শেয়ার করুন, প্রশ্ন করুন এবং বিশেষজ্ঞদের পরামর্শ নিন।"
        structuredData={createFAQSchema([
          { question: 'কমিউনিটিতে কীভাবে যোগ দেব?', answer: 'রেজিস্টার করে সহজেই কমিউনিটিতে যোগ দিতে পারবেন।' },
          { question: 'পোস্ট করতে কি টাকা লাগে?', answer: 'না, সম্পূর্ণ বিনামূল্যে পোস্ট করতে পারবেন।' }
        ])}
      />
      <div 
        className="min-h-screen pb-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(${villageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Header */}
        <header className="px-4 pt-8 pb-4 sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/home"
                className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Link>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center shadow-lg">
                <UsersRound className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">কৃষক কমিউনিটি</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  {posts.length}+ সক্রিয় পোস্ট
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowPostForm(!showPostForm)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              পোস্ট
            </Button>
          </div>
        </header>

        {/* Top Contributors - Real Data */}
        {topContributors.length > 0 && (
          <section className="px-4 mb-4 mt-4">
            <div className="bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 border border-border rounded-2xl p-4 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-xl">🏆</span> সেরা অবদানকারী
              </h3>
              <div className="flex justify-around">
                {topContributors.slice(0, 3).map((user, index) => (
                  <div key={index} className="text-center group">
                    <div className={cn(
                      "text-3xl mb-1 transition-transform group-hover:scale-110",
                      index === 0 && "animate-bounce-subtle"
                    )}>
                      {user.avatar}
                    </div>
                    <p className="text-xs text-foreground font-medium truncate max-w-[80px]">{user.name}</p>
                    <p className="text-xs text-secondary font-bold">{user.points.toLocaleString('bn-BD')} XP</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Create Post Form */}
        {showPostForm && (
          <section className="px-4 mb-4 animate-slide-up">
            <div className="bg-card border-2 border-secondary/30 rounded-2xl p-4 shadow-glow">
              <div className="flex items-start gap-3">
                <div className="text-2xl">👨‍🌾</div>
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="আপনার কৃষি অভিজ্ঞতা, সমস্যা বা সাফল্যের গল্প শেয়ার করুন..."
                    className="w-full bg-muted/50 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[100px] focus:ring-2 focus:ring-secondary/50"
                    disabled={isPosting}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Image className="w-4 h-4 mr-1" /> ছবি
                      </Button>
                    </div>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isPosting}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      size="sm"
                    >
                      {isPosting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" /> প্রকাশ করুন
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Post Button (collapsed state) */}
        {!showPostForm && (
          <section className="px-4 mb-4">
            <button
              onClick={() => setShowPostForm(true)}
              className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <div className="text-2xl">👨‍🌾</div>
              <span className="flex-1 text-left text-sm text-muted-foreground">
                আপনার কৃষি অভিজ্ঞতা শেয়ার করুন...
              </span>
              <Send className="w-4 h-4 text-secondary" />
            </button>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        )}

        {/* Posts Feed - Real Data */}
        <section className="px-4 space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            সাম্প্রতিক পোস্ট
          </h2>
          
          {!loading && posts.length === 0 && (
            <div className="text-center py-12 bg-card/50 rounded-2xl border border-border">
              <p className="text-muted-foreground">এখনো কোন পোস্ট নেই</p>
              <Button 
                onClick={() => setShowPostForm(true)}
                className="mt-4 bg-secondary text-secondary-foreground"
              >
                প্রথম পোস্ট করুন
              </Button>
            </div>
          )}

          {posts.map((post, index) => (
            <article
              key={post.id}
              className={cn(
                "bg-card border border-border rounded-2xl p-4 hover:border-secondary/30 transition-all",
                "animate-slide-up",
                index === 0 && post.is_featured && "border-primary/50 shadow-glow-gold"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center text-xl">
                  {getAvatarEmoji(post.author_name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    {post.author_name}
                    {post.is_verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-secondary fill-secondary/20" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.author_location || 'বাংলাদেশ'} • {formatTimeAgo(post.created_at)}
                  </p>
                </div>
                <span className="text-2xl">{getCropEmoji(post.crop_type)}</span>
              </div>

              {/* Post Content */}
              <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

              {/* Post Image */}
              {post.image_url && (
                <div className="mb-3 rounded-xl overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm transition-all active:scale-95",
                    isPostLiked(post.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                  )}
                >
                  <Heart className={cn(
                    "w-5 h-5 transition-transform",
                    isPostLiked(post.id) && "fill-current scale-110"
                  )} />
                  <span className="font-medium">{post.likes_count || 0}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments_count || 0}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>শেয়ার</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Join CTA */}
        <section className="px-4 mt-6">
          <div className="bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30 rounded-2xl p-5 text-center backdrop-blur-sm">
            <div className="text-3xl mb-2">🤝</div>
            <p className="text-sm text-foreground mb-3 font-medium">
              আপনার এলাকার কৃষকদের সাথে যুক্ত হোন!
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              অভিজ্ঞতা শেয়ার করুন, পরামর্শ নিন, সফল হোন
            </p>
            <Link to="/auth">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                কমিউনিটিতে যোগ দিন
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
