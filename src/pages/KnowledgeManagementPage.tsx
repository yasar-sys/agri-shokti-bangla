import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Database,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string | null;
  crop_type: string | null;
  season: string | null;
  keywords: string[] | null;
  is_active: boolean;
  created_at: string;
  embedding: number[] | null;
}

const CATEGORIES = [
  'ফসল উৎপাদন',
  'রোগ ও পোকা',
  'সার ব্যবস্থাপনা',
  'সেচ ব্যবস্থাপনা',
  'বীজ ও চারা',
  'জৈব কৃষি',
  'মৎস্য চাষ',
  'গবাদি পশু',
  'সরকারি সেবা',
  'সাধারণ'
];

const CROPS = [
  'ধান',
  'গম',
  'ভুট্টা',
  'পাট',
  'আলু',
  'টমেটো',
  'বেগুন',
  'শাকসবজি',
  'ফলমূল',
  'মসলা'
];

const SEASONS = [
  'বোরো',
  'আউশ',
  'আমন',
  'রবি',
  'খরিফ-১',
  'খরিফ-২',
  'সারাবছর'
];

export default function KnowledgeManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [embeddingInProgress, setEmbeddingInProgress] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, embedded: 0, active: 0 });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'সাধারণ',
    source: '',
    crop_type: '',
    season: '',
    keywords: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data - embedding comes as string from DB but we just check if it exists
      const docs = (data || []).map(doc => ({
        ...doc,
        embedding: doc.embedding ? (doc.embedding as unknown as number[]) : null
      })) as KnowledgeDocument[];
      
      setDocuments(docs);
      
      // Calculate stats
      const total = docs.length;
      const embedded = docs.filter(d => d.embedding !== null).length;
      const active = docs.filter(d => d.is_active).length;
      setStats({ total, embedded, active });
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'ডকুমেন্ট লোড করতে সমস্যা হয়েছে',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'তথ্য অসম্পূর্ণ',
        description: 'শিরোনাম এবং বিষয়বস্তু আবশ্যক',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          source: formData.source || null,
          crop_type: formData.crop_type || null,
          season: formData.season || null,
          keywords: keywords.length > 0 ? keywords : null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'সফল!',
        description: 'নতুন ডকুমেন্ট যোগ হয়েছে'
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'সাধারণ',
        source: '',
        crop_type: '',
        season: '',
        keywords: ''
      });
      setIsDialogOpen(false);
      fetchDocuments();

      // Generate embedding for the new document
      if (data) {
        generateEmbedding(data.id);
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'ডকুমেন্ট যোগ করতে সমস্যা হয়েছে',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generateEmbedding = async (documentId: string) => {
    setEmbeddingInProgress(documentId);
    try {
      const { data, error } = await supabase.functions.invoke('embed-document', {
        body: {
          document_id: documentId,
          action: 'embed_single'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'এম্বেডিং সম্পন্ন',
          description: 'ভেক্টর সার্চের জন্য প্রস্তুত'
        });
        fetchDocuments();
      }
    } catch (error) {
      console.error('Embedding error:', error);
      toast({
        title: 'এম্বেডিং সমস্যা',
        description: 'ভেক্টর তৈরি করতে সমস্যা হয়েছে',
        variant: 'destructive'
      });
    } finally {
      setEmbeddingInProgress(null);
    }
  };

  const embedAllDocuments = async () => {
    setEmbeddingInProgress('all');
    try {
      const { data, error } = await supabase.functions.invoke('embed-document', {
        body: {
          action: 'embed_all'
        }
      });

      if (error) throw error;

      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      toast({
        title: 'এম্বেডিং সম্পন্ন',
        description: `${successCount}/${data.total} ডকুমেন্ট প্রসেস হয়েছে`
      });
      fetchDocuments();
    } catch (error) {
      console.error('Bulk embedding error:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'এম্বেডিং প্রক্রিয়ায় সমস্যা',
        variant: 'destructive'
      });
    } finally {
      setEmbeddingInProgress(null);
    }
  };

  const toggleDocumentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-xl font-bold">জ্ঞানভাণ্ডার ব্যবস্থাপনা</h1>
            <p className="text-sm opacity-90">RAG Knowledge Base</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-3 text-center">
              <Database className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">মোট ডকুমেন্ট</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-3 text-center">
              <Sparkles className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.embedded}</p>
              <p className="text-xs text-muted-foreground">এম্বেডেড</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">সক্রিয়</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                নতুন ডকুমেন্ট
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>নতুন ডকুমেন্ট যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">শিরোনাম *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="ডকুমেন্টের শিরোনাম"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">বিষয়বস্তু *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                    placeholder="কৃষি বিষয়ক তথ্য লিখুন..."
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">ক্যাটাগরি</label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">ফসল</label>
                    <Select
                      value={formData.crop_type}
                      onValueChange={(v) => setFormData(p => ({ ...p, crop_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="বেছে নিন" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map(crop => (
                          <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">মৌসুম</label>
                    <Select
                      value={formData.season}
                      onValueChange={(v) => setFormData(p => ({ ...p, season: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="বেছে নিন" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASONS.map(season => (
                          <SelectItem key={season} value={season}>{season}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">উৎস</label>
                    <Input
                      value={formData.source}
                      onChange={(e) => setFormData(p => ({ ...p, source: e.target.value }))}
                      placeholder="BARI, DAE..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">কীওয়ার্ড (কমা দিয়ে আলাদা)</label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData(p => ({ ...p, keywords: e.target.value }))}
                    placeholder="ধান, রোগ, চিকিৎসা..."
                  />
                </div>
                <Button 
                  onClick={handleAddDocument} 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      যোগ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      ডকুমেন্ট যোগ করুন
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline"
            onClick={embedAllDocuments}
            disabled={embeddingInProgress === 'all'}
          >
            {embeddingInProgress === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ডকুমেন্ট খুঁজুন..."
            className="pl-10"
          />
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">কোন ডকুমেন্ট পাওয়া যায়নি</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className={!doc.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {doc.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                        {doc.crop_type && (
                          <Badge variant="outline" className="text-xs">
                            🌾 {doc.crop_type}
                          </Badge>
                        )}
                        {doc.embedding ? (
                          <Badge className="bg-green-500/10 text-green-600 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            এম্বেডেড
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            এম্বেডিং নেই
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!doc.embedding && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateEmbedding(doc.id)}
                          disabled={embeddingInProgress === doc.id}
                        >
                          {embeddingInProgress === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDocumentStatus(doc.id, doc.is_active)}
                      >
                        {doc.is_active ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doc.content}
                  </p>
                  {doc.source && (
                    <p className="text-xs text-muted-foreground mt-2">
                      📚 উৎস: {doc.source}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
