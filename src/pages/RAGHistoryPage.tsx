import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  Star,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface RAGInteraction {
  id: string;
  query: string;
  response: string;
  sources: string | null;
  model_used: string | null;
  response_time_ms: number | null;
  feedback_rating: number | null;
  created_at: string;
}

export default function RAGHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interactions, setInteractions] = useState<RAGInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    avgTime: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      let query = supabase
        .from('rag_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (session?.session?.user?.id) {
        query = query.eq('user_id', session.session.user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInteractions(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const total = data.length;
        const avgTime = Math.round(
          data.reduce((acc, i) => acc + (i.response_time_ms || 0), 0) / total
        );
        const ratedItems = data.filter(i => i.feedback_rating);
        const avgRating = ratedItems.length > 0
          ? (ratedItems.reduce((acc, i) => acc + (i.feedback_rating || 0), 0) / ratedItems.length).toFixed(1)
          : 0;
        
        setStats({ total, avgTime, avgRating: Number(avgRating) });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'ইতিহাস লোড করতে সমস্যা হয়েছে',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (id: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('rag_interactions')
        .update({ feedback_rating: rating })
        .eq('id', id);

      if (error) throw error;

      setInteractions(prev =>
        prev.map(i => i.id === id ? { ...i, feedback_rating: rating } : i)
      );

      toast({
        title: 'ধন্যবাদ!',
        description: 'আপনার মতামত সংরক্ষণ হয়েছে'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">কথোপকথনের ইতিহাস</h1>
            <p className="text-sm opacity-90">RAG Interactions</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-3 text-center">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">মোট প্রশ্ন</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <p className="text-xl font-bold text-blue-600">{stats.avgTime}ms</p>
              <p className="text-xs text-muted-foreground">গড় সময়</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
              <p className="text-xl font-bold text-yellow-600">{stats.avgRating || '-'}</p>
              <p className="text-xs text-muted-foreground">গড় রেটিং</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : interactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">কোন কথোপকথন পাওয়া যায়নি</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/chat')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                প্রশ্ন করুন
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => setExpandedId(
                    expandedId === interaction.id ? null : interaction.id
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">
                        {interaction.query}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(interaction.created_at), 'PPp', { locale: bn })}
                        {interaction.response_time_ms && (
                          <Badge variant="outline" className="text-xs">
                            {interaction.response_time_ms}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                    {expandedId === interaction.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedId === interaction.id && (
                  <CardContent className="pt-0 border-t">
                    <div className="pt-3 space-y-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">
                          {interaction.response}
                        </p>
                      </div>
                      
                      {interaction.sources && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>📚 উৎস:</span>
                          <span>{interaction.sources}</span>
                        </div>
                      )}

                      {/* Feedback */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          এই উত্তর কি সহায়ক ছিল?
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={(e) => {
                                e.stopPropagation();
                                submitFeedback(interaction.id, rating);
                              }}
                              className={`p-1 rounded ${
                                interaction.feedback_rating === rating
                                  ? 'text-yellow-500'
                                  : 'text-muted-foreground hover:text-yellow-500'
                              }`}
                            >
                              <Star 
                                className="h-5 w-5"
                                fill={interaction.feedback_rating && interaction.feedback_rating >= rating ? 'currentColor' : 'none'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
