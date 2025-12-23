import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommunityPost {
  id: string;
  author_name: string;
  author_location: string | null;
  title: string;
  content: string;
  image_url: string | null;
  crop_type: string | null;
  post_type: string;
  likes_count: number;
  comments_count: number;
  is_verified: boolean;
  is_featured: boolean;
  user_id: string | null;
  created_at: string;
}

interface TopContributor {
  name: string;
  points: number;
  avatar: string;
}

export function useCommunityPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchTopContributors();
    fetchUserLikes();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('community-posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => {
          fetchPosts();
          fetchUserLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, xp_points')
        .order('xp_points', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const avatars = ['👨‍🌾', '👩‍🌾', '👨', '👴', '👩'];
      setTopContributors(
        (data || []).map((p, i) => ({
          name: p.full_name || 'কৃষক',
          points: p.xp_points || 0,
          avatar: avatars[i % avatars.length]
        }))
      );
    } catch (err) {
      console.error('Error fetching top contributors:', err);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserLikes((data || []).map(l => l.post_id));
    } catch (err) {
      console.error('Error fetching user likes:', err);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('লাইক করতে লগইন করুন');
        return;
      }

      const isLiked = userLikes.includes(postId);

      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserLikes(prev => prev.filter(id => id !== postId));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
        setUserLikes(prev => [...prev, postId]);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('লাইক করতে সমস্যা হয়েছে');
    }
  };

  const createPost = async (post: {
    title: string;
    content: string;
    post_type?: string;
    crop_type?: string;
    image_url?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('পোস্ট করতে লগইন করুন');
        return false;
      }

      // Get user profile for author name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('community_posts')
        .insert({
          ...post,
          user_id: user.id,
          author_name: profile?.full_name || user.email?.split('@')[0] || 'কৃষক',
          post_type: post.post_type || 'story'
        });

      if (error) throw error;
      toast.success('পোস্ট সফলভাবে প্রকাশিত হয়েছে!');
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('পোস্ট করতে সমস্যা হয়েছে');
      return false;
    }
  };

  const isPostLiked = (postId: string) => userLikes.includes(postId);

  return {
    posts,
    topContributors,
    loading,
    toggleLike,
    createPost,
    isPostLiked,
    refetch: fetchPosts
  };
}
