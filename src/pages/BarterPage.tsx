import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEOHead } from "@/components/seo/SEOHead";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  RefreshCw, 
  MapPin, 
  Package, 
  ArrowLeftRight,
  User,
  Phone,
  MessageSquare,
  Check,
  X,
  Loader2,
  Wheat,
  Leaf,
  Apple
} from "lucide-react";

interface CropListing {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: number;
  unit: string;
  quality_grade: string;
  description: string | null;
  location: string | null;
  wanted_crops: string[];
  is_available: boolean;
  views_count: number;
  created_at: string;
}

interface TradeRequest {
  id: string;
  listing_id: string;
  requester_id: string;
  offered_crop: string;
  offered_quantity: number;
  offered_unit: string;
  message: string | null;
  status: string;
  requester_name: string | null;
  requester_phone: string | null;
  created_at: string;
}

const cropOptions = [
  { name: "ধান", emoji: "🌾" },
  { name: "গম", emoji: "🌾" },
  { name: "পাট", emoji: "🌿" },
  { name: "আলু", emoji: "🥔" },
  { name: "পেঁয়াজ", emoji: "🧅" },
  { name: "রসুন", emoji: "🧄" },
  { name: "টমেটো", emoji: "🍅" },
  { name: "বেগুন", emoji: "🍆" },
  { name: "মরিচ", emoji: "🌶️" },
  { name: "আম", emoji: "🥭" },
  { name: "কলা", emoji: "🍌" },
  { name: "সরিষা", emoji: "🌻" },
  { name: "ভুট্টা", emoji: "🌽" },
  { name: "মাছ", emoji: "🐟" },
];

const getCropEmoji = (cropName: string): string => {
  const crop = cropOptions.find(c => c.name === cropName);
  return crop?.emoji || "🌱";
};

export default function BarterPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [myListings, setMyListings] = useState<CropListing[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [activeTab, setActiveTab] = useState<"browse" | "my-listings" | "requests">("browse");
  const [user, setUser] = useState<any>(null);

  // Form states
  const [newListing, setNewListing] = useState({
    crop_name: "",
    quantity: "",
    unit: "কেজি",
    quality_grade: "ভালো",
    description: "",
    location: "",
    wanted_crops: [] as string[]
  });

  const [tradeOffer, setTradeOffer] = useState({
    offered_crop: "",
    offered_quantity: "",
    offered_unit: "কেজি",
    message: "",
    requester_name: "",
    requester_phone: ""
  });

  useEffect(() => {
    checkAuth();
    fetchListings();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchMyListings(user.id);
      fetchTradeRequests(user.id);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("crop_listings")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("crop_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error) {
      console.error("Error fetching my listings:", error);
    }
  };

  const fetchTradeRequests = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("trade_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTradeRequests(data || []);
    } catch (error) {
      console.error("Error fetching trade requests:", error);
    }
  };

  const handleCreateListing = async () => {
    if (!user) {
      toast.error("লগইন করুন");
      navigate("/auth");
      return;
    }

    if (!newListing.crop_name || !newListing.quantity) {
      toast.error("ফসলের নাম ও পরিমাণ দিন");
      return;
    }

    try {
      const { error } = await supabase.from("crop_listings").insert({
        user_id: user.id,
        crop_name: newListing.crop_name,
        quantity: parseFloat(newListing.quantity),
        unit: newListing.unit,
        quality_grade: newListing.quality_grade,
        description: newListing.description || null,
        location: newListing.location || null,
        wanted_crops: newListing.wanted_crops
      });

      if (error) throw error;

      toast.success("ফসল তালিকায় যোগ হয়েছে!");
      setShowAddDialog(false);
      setNewListing({
        crop_name: "",
        quantity: "",
        unit: "কেজি",
        quality_grade: "ভালো",
        description: "",
        location: "",
        wanted_crops: []
      });
      fetchListings();
      fetchMyListings(user.id);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("ফসল যোগ করতে সমস্যা হয়েছে");
    }
  };

  const handleTradeRequest = async () => {
    if (!user) {
      toast.error("লগইন করুন");
      navigate("/auth");
      return;
    }

    if (!selectedListing || !tradeOffer.offered_crop || !tradeOffer.offered_quantity) {
      toast.error("বিনিময় তথ্য দিন");
      return;
    }

    try {
      const { error } = await supabase.from("trade_requests").insert({
        listing_id: selectedListing.id,
        requester_id: user.id,
        offered_crop: tradeOffer.offered_crop,
        offered_quantity: parseFloat(tradeOffer.offered_quantity),
        offered_unit: tradeOffer.offered_unit,
        message: tradeOffer.message || null,
        requester_name: tradeOffer.requester_name || null,
        requester_phone: tradeOffer.requester_phone || null
      });

      if (error) throw error;

      toast.success("বিনিময় অনুরোধ পাঠানো হয়েছে!");
      setShowTradeDialog(false);
      setTradeOffer({
        offered_crop: "",
        offered_quantity: "",
        offered_unit: "কেজি",
        message: "",
        requester_name: "",
        requester_phone: ""
      });
    } catch (error) {
      console.error("Error creating trade request:", error);
      toast.error("অনুরোধ পাঠাতে সমস্যা হয়েছে");
    }
  };

  const handleUpdateTradeStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("trade_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      toast.success(status === "accepted" ? "বিনিময় গ্রহণ করা হয়েছে!" : "বিনিময় বাতিল করা হয়েছে");
      if (user) fetchTradeRequests(user.id);
    } catch (error) {
      console.error("Error updating trade status:", error);
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} দিন আগে`;
    if (diffHours > 0) return `${diffHours} ঘণ্টা আগে`;
    return "এইমাত্র";
  };

  return (
    <>
      <SEOHead
        title="ফসল বিনিময় | AgriShokti"
        description="কৃষকদের জন্য ফসল বিনিময় প্ল্যাটফর্ম - সরাসরি ফসল বিনিময় করুন"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/home")}
              className="rounded-full bg-background/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6 text-primary" />
                ফসল বিনিময়
              </h1>
              <p className="text-sm text-muted-foreground">
                সরাসরি ফসল বিনিময় করুন - মধ্যস্বত্বভোগী ছাড়া
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ফসল বা এলাকা খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/80"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {[
            { id: "browse", label: "সব ফসল", icon: Package },
            { id: "my-listings", label: "আমার তালিকা", icon: Leaf },
            { id: "requests", label: "অনুরোধ", icon: MessageSquare }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 py-2">
          {/* Add Listing Button */}
          {user && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4 bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন ফসল যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wheat className="w-5 h-5 text-primary" />
                    ফসল বিক্রি/বিনিময়ে দিন
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">ফসলের নাম *</label>
                    <Select
                      value={newListing.crop_name}
                      onValueChange={(v) => setNewListing({ ...newListing, crop_name: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ফসল নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropOptions.map((crop) => (
                          <SelectItem key={crop.name} value={crop.name}>
                            {crop.emoji} {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">পরিমাণ *</label>
                      <Input
                        type="number"
                        placeholder="১০০"
                        value={newListing.quantity}
                        onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">একক</label>
                      <Select
                        value={newListing.unit}
                        onValueChange={(v) => setNewListing({ ...newListing, unit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="কেজি">কেজি</SelectItem>
                          <SelectItem value="মণ">মণ</SelectItem>
                          <SelectItem value="টন">টন</SelectItem>
                          <SelectItem value="পিস">পিস</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">মান</label>
                    <Select
                      value={newListing.quality_grade}
                      onValueChange={(v) => setNewListing({ ...newListing, quality_grade: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="অতি উত্তম">অতি উত্তম</SelectItem>
                        <SelectItem value="ভালো">ভালো</SelectItem>
                        <SelectItem value="মোটামুটি">মোটামুটি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">এলাকা</label>
                    <Input
                      placeholder="যেমন: ময়মনসিংহ সদর"
                      value={newListing.location}
                      onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">বিস্তারিত</label>
                    <Textarea
                      placeholder="ফসল সম্পর্কে বিস্তারিত লিখুন..."
                      value={newListing.description}
                      onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleCreateListing} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    তালিকায় যোগ করুন
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {!user && (
            <Card className="mb-4 border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="py-6 text-center">
                <User className="w-10 h-10 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground mb-3">
                  ফসল বিনিময় করতে লগইন করুন
                </p>
                <Button onClick={() => navigate("/auth")}>
                  লগইন করুন
                </Button>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Browse Tab */}
              {activeTab === "browse" && (
                <div className="space-y-3">
                  {filteredListings.length === 0 ? (
                    <Card className="text-center py-12">
                      <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">কোনো ফসল পাওয়া যায়নি</p>
                    </Card>
                  ) : (
                    filteredListings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                                {getCropEmoji(listing.crop_name)}
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground">{listing.crop_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {listing.quantity} {listing.unit}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {listing.quality_grade}
                            </Badge>
                          </div>

                          {listing.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-3 h-3" />
                              {listing.location}
                            </div>
                          )}

                          {listing.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {listing.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(listing.created_at)}
                            </span>
                            <Dialog open={showTradeDialog && selectedListing?.id === listing.id} onOpenChange={(open) => {
                              setShowTradeDialog(open);
                              if (open) setSelectedListing(listing);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="gap-1">
                                  <ArrowLeftRight className="w-3 h-3" />
                                  বিনিময় করুন
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {getCropEmoji(listing.crop_name)} {listing.crop_name} বিনিময়
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm">
                                      <strong>চাই:</strong> {listing.quantity} {listing.unit} {listing.crop_name}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">আপনি কী দিতে চান? *</label>
                                    <Select
                                      value={tradeOffer.offered_crop}
                                      onValueChange={(v) => setTradeOffer({ ...tradeOffer, offered_crop: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="ফসল নির্বাচন করুন" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {cropOptions.map((crop) => (
                                          <SelectItem key={crop.name} value={crop.name}>
                                            {crop.emoji} {crop.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-sm font-medium">পরিমাণ *</label>
                                      <Input
                                        type="number"
                                        placeholder="৫০"
                                        value={tradeOffer.offered_quantity}
                                        onChange={(e) => setTradeOffer({ ...tradeOffer, offered_quantity: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">একক</label>
                                      <Select
                                        value={tradeOffer.offered_unit}
                                        onValueChange={(v) => setTradeOffer({ ...tradeOffer, offered_unit: v })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="কেজি">কেজি</SelectItem>
                                          <SelectItem value="মণ">মণ</SelectItem>
                                          <SelectItem value="টন">টন</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">আপনার নাম</label>
                                    <Input
                                      placeholder="নাম লিখুন"
                                      value={tradeOffer.requester_name}
                                      onChange={(e) => setTradeOffer({ ...tradeOffer, requester_name: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">মোবাইল নম্বর</label>
                                    <Input
                                      placeholder="০১৭..."
                                      value={tradeOffer.requester_phone}
                                      onChange={(e) => setTradeOffer({ ...tradeOffer, requester_phone: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">বার্তা</label>
                                    <Textarea
                                      placeholder="অতিরিক্ত কিছু বলতে চাইলে..."
                                      value={tradeOffer.message}
                                      onChange={(e) => setTradeOffer({ ...tradeOffer, message: e.target.value })}
                                    />
                                  </div>

                                  <Button onClick={handleTradeRequest} className="w-full">
                                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                                    বিনিময় অনুরোধ পাঠান
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* My Listings Tab */}
              {activeTab === "my-listings" && (
                <div className="space-y-3">
                  {myListings.length === 0 ? (
                    <Card className="text-center py-12">
                      <Leaf className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">আপনার কোনো তালিকা নেই</p>
                    </Card>
                  ) : (
                    myListings.map((listing) => (
                      <Card key={listing.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl">
                                {getCropEmoji(listing.crop_name)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{listing.crop_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {listing.quantity} {listing.unit}
                                </p>
                              </div>
                            </div>
                            <Badge variant={listing.is_available ? "default" : "secondary"}>
                              {listing.is_available ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === "requests" && (
                <div className="space-y-3">
                  {tradeRequests.length === 0 ? (
                    <Card className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">কোনো অনুরোধ নেই</p>
                    </Card>
                  ) : (
                    tradeRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getCropEmoji(request.offered_crop)}</span>
                                <span className="font-semibold">{request.offered_crop}</span>
                                <Badge variant="outline" className="text-xs">
                                  {request.offered_quantity} {request.offered_unit}
                                </Badge>
                              </div>
                              {request.requester_name && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {request.requester_name}
                                </p>
                              )}
                              {request.requester_phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {request.requester_phone}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                request.status === "accepted"
                                  ? "default"
                                  : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {request.status === "pending"
                                ? "অপেক্ষমাণ"
                                : request.status === "accepted"
                                ? "গৃহীত"
                                : "বাতিল"}
                            </Badge>
                          </div>

                          {request.message && (
                            <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-2 rounded">
                              {request.message}
                            </p>
                          )}

                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-green-600 border-green-600"
                                onClick={() => handleUpdateTradeStatus(request.id, "accepted")}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                গ্রহণ
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 border-red-600"
                                onClick={() => handleUpdateTradeStatus(request.id, "rejected")}
                              >
                                <X className="w-4 h-4 mr-1" />
                                বাতিল
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 rounded-full shadow-lg bg-background"
          onClick={() => {
            fetchListings();
            if (user) {
              fetchMyListings(user.id);
              fetchTradeRequests(user.id);
            }
          }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}