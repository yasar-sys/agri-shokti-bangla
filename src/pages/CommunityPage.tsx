import { UsersRound, MessageCircle, Heart, Share2, ThumbsUp, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const posts = [
  {
    id: 1,
    author: "রহিম উদ্দিন",
    location: "ময়মনসিংহ",
    avatar: "👨‍🌾",
    time: "২ ঘণ্টা আগে",
    content: "এবার আমন ধানে ভালো ফলন হয়েছে আলহামদুলিল্লাহ! AWD পদ্ধতিতে সেচ দিয়ে পানিও বাঁচলো, খরচও কমলো।",
    likes: 45,
    comments: 12,
    image: "🌾",
  },
  {
    id: 2,
    author: "করিম মিয়া",
    location: "রংপুর",
    avatar: "👴",
    time: "৫ ঘণ্টা আগে",
    content: "আলু গাছে লেট ব্লাইট দেখা দিয়েছে। কেউ কি জানেন কোন ওষুধ ভালো কাজ করে? সাহায্য করুন ভাইয়েরা।",
    likes: 23,
    comments: 34,
    image: "🥔",
  },
  {
    id: 3,
    author: "ফাতেমা বেগম",
    location: "যশোর",
    avatar: "👩‍🌾",
    time: "১ দিন আগে",
    content: "আমার সবজি বাগান থেকে এই মাসে ১৫,০০০ টাকা আয় হয়েছে! মহিলা কৃষকদের এগিয়ে আসা উচিত। 💪",
    likes: 128,
    comments: 45,
    image: "🥬",
  },
  {
    id: 4,
    author: "আব্দুল হক",
    location: "বগুড়া",
    avatar: "👨",
    time: "২ দিন আগে",
    content: "agriশক্তি অ্যাপ দিয়ে ধানের রোগ ধরতে পারলাম! সময়মতো স্প্রে করে ফসল বাঁচালাম। অনেক ধন্যবাদ এই অ্যাপকে।",
    likes: 89,
    comments: 21,
    image: "📱",
  },
];

const topContributors = [
  { name: "রহিম উদ্দিন", points: 1250, avatar: "👨‍🌾" },
  { name: "ফাতেমা বেগম", points: 980, avatar: "👩‍🌾" },
  { name: "আব্দুল হক", points: 870, avatar: "👨" },
];

export default function CommunityPage() {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(/src/assets/bangladesh-village-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <UsersRound className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">কৃষক কমিউনিটি</h1>
            <p className="text-sm text-muted-foreground">১,২৫০+ সক্রিয় সদস্য</p>
          </div>
        </div>
      </header>

      {/* Top Contributors */}
      <section className="px-4 mb-4">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">🏆 সেরা অবদানকারী</h3>
          <div className="flex justify-around">
            {topContributors.map((user, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-1">{user.avatar}</div>
                <p className="text-xs text-foreground font-medium">{user.name}</p>
                <p className="text-xs text-secondary">{user.points} পয়েন্ট</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Post */}
      <section className="px-4 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="text-2xl">👨‍🌾</div>
          <input
            type="text"
            placeholder="আপনার কৃষি অভিজ্ঞতা শেয়ার করুন..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <Button size="sm" className="bg-secondary text-secondary-foreground">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Posts Feed */}
      <section className="px-4 space-y-4">
        <h2 className="text-base font-semibold text-foreground">সাম্প্রতিক পোস্ট</h2>
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-card border border-border rounded-xl p-4"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{post.avatar}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.location} • {post.time}</p>
              </div>
              <span className="text-2xl">{post.image}</span>
            </div>

            {/* Post Content */}
            <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                onClick={() => toggleLike(post.id)}
                className={cn(
                  "flex items-center gap-1.5 text-sm transition-colors",
                  likedPosts.includes(post.id) ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("w-4 h-4", likedPosts.includes(post.id) && "fill-current")} />
                <span>{likedPosts.includes(post.id) ? post.likes + 1 : post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Share2 className="w-4 h-4" />
                <span>শেয়ার</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Join CTA */}
      <section className="px-4 mt-6">
        <div className="bg-secondary/20 border border-secondary/30 rounded-xl p-4 text-center">
          <p className="text-sm text-foreground mb-2">
            🤝 আপনার এলাকার কৃষকদের সাথে যুক্ত হোন!
          </p>
          <Button className="bg-secondary text-secondary-foreground">
            কমিউনিটিতে যোগ দিন
          </Button>
        </div>
      </section>
    </div>
  );
}