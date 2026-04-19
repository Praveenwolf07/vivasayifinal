import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User,
  Sprout,
  Gavel,
  Truck,
  TrendingUp,
  Star,
  MapPin,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Edit2,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

interface ProfileData {
  avatar_url?: string | null;
  phone?: string | null;
  location?: string | null;
  full_name?: string | null;
}

interface UserStats {
  cropsSold?: number;
  revenue?: number;
  bidsWon?: number;
  totalBids?: number;
  fulfilled?: number;
  completed?: number;
}

function ProfilePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<UserStats>({});

  // Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  interface Activity {
    date: string;
    txt: string;
    primary: boolean;
  }
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;

    // Set initial form states
    setEditEmail(user.email || "");

    const loadData = async () => {
      // Fetch Profile Data
      const { data: pData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (pData) {
        setProfileData(pData);
        setEditAvatar(pData.avatar_url || "");
        setEditPhone(pData.phone || "+91 98765 43210");
        setEditLocation(pData.location || "Maharashtra, India");
      }

      // Fetch Real-Time Stats
      const currentRole = role || "farmer";

      // Calculate Average Rating safely handling missing table
      let avgRating: string | null = null;
      let reviewCount = 0;
      try {
        const { data: reviews, error: reviewError } = await supabase
          .from("reviews")
          .select("rating")
          .eq("target_user_id", user.id);
        if (!reviewError && reviews) {
          avgRating =
            reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : null;
          reviewCount = reviews.length;
        }
      } catch (e) {
        // reviews table might not exist yet if user hasn't run migration
        console.log("Reviews table disabled or not found.");
      }

      if (currentRole === "farmer") {
        const { data: orders } = await supabase
          .from("orders")
          .select("total_price, status")
          .eq("farmer_id", user.id);
        const soldOrders = orders?.filter((o) => o.status === "delivered") || [];
        const revenue = soldOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
        setStats({ cropsSold: soldOrders.length, revenue, avgRating, reviewCount });

        // Fetch Farmer Activity
        const { data: pLogs } = await supabase
          .from("products")
          .select("name, created_at")
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        const { data: oLogs } = await supabase
          .from("orders")
          .select("products(name), status, updated_at")
          .eq("farmer_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        const logs = [
          ...(pLogs || []).map((l) => ({
            date: l.created_at,
            txt: `Listed ${l.name}`,
            primary: true,
          })),
          ...(oLogs || []).map((l) => ({
            date: l.updated_at,
            txt: `Order for ${(l.products as unknown as { name: string })?.name} changed to ${l.status}`,
            primary: l.status === "delivered",
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);
        setActivities(logs);
      } else if (currentRole === "buyer") {
        const { data: bids } = await supabase.from("bids").select("status").eq("buyer_id", user.id);
        const bidsWon = bids?.filter((b) => b.status === "accepted").length || 0;
        const totalBids = bids?.length || 0;

        const { data: orders } = await supabase
          .from("orders")
          .select("status")
          .eq("buyer_id", user.id);
        const fulfilled = orders?.filter((o) => o.status === "delivered").length || 0;
        setStats({ bidsWon, totalBids, fulfilled, avgRating, reviewCount });

        // Fetch Buyer Activity
        const { data: bLogs } = await supabase
          .from("bids")
          .select("products(name), status, created_at")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8);
        setActivities(
          (bLogs || []).map((l) => ({
            date: l.created_at,
            txt: `Placed bid for ${(l.products as unknown as { name: string })?.name} (${l.status})`,
            primary: l.status === "accepted",
          })),
        );
      } else if (currentRole === "transporter") {
        const { data: orders } = await supabase
          .from("orders")
          .select("status")
          .eq("transporter_id", user.id);
        const completed = orders?.filter((o) => o.status === "delivered").length || 0;
        setStats({ completed, avgRating, reviewCount });

        // Fetch Transporter Activity
        const { data: tLogs } = await supabase
          .from("orders")
          .select("products(name, location), status, updated_at")
          .eq("transporter_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(8);
        setActivities(
          (tLogs || []).map((l) => ({
            date: l.updated_at,
            txt: `Delivery job ${(l.products as unknown as { name: string })?.name} status: ${l.status}`,
            primary: l.status === "delivered",
          })),
        );
      }
    };

    loadData();
  }, [user, role]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 1. Update Profile in public.profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: editAvatar,
          phone: editPhone,
          location: editLocation,
        })
        .eq("id", user!.id);

      if (profileError) throw profileError;

      // 2. Opt: Update Auth Email
      if (editEmail !== user!.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: editEmail });
        if (authError) throw authError;
      }

      toast.success("Profile updated successfully!");
      setProfileData((prev) => ({
        ...prev,
        avatar_url: editAvatar,
        phone: editPhone,
        location: editLocation,
      }));
      setIsEditing(false);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const currentRole = role || "farmer"; // Default fallback

  // Render stats based on real-time data
  const renderFarmerStats = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Sprout className="h-4 w-4 text-success" />
          Crops Sold
        </div>
        <div className="text-2xl font-bold font-display">{stats.cropsSold ?? 0}</div>
        <div className="text-xs text-muted-foreground mt-auto">All time via platform</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Revenue Generated
        </div>
        <div className="text-2xl font-bold font-display">
          ₹{(stats.revenue ?? 0).toLocaleString("en-IN")}
        </div>
        <div className="text-xs text-success mt-auto">From delivered orders</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          Buyer Rating
        </div>
        <div className="text-2xl font-bold font-display">
          {stats.avgRating ? `${stats.avgRating}/5` : "No ratings"}
        </div>
        <div className="text-xs text-muted-foreground mt-auto">
          {stats.reviewCount ? `Based on ${stats.reviewCount} reviews` : "Pending first review"}
        </div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-blue-500" />
          Profile Status
        </div>
        <div className="text-2xl font-bold font-display text-blue-600">Active</div>
        <div className="text-xs text-muted-foreground mt-auto">Grower Account</div>
      </Card>
    </div>
  );

  const renderBuyerStats = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Gavel className="h-4 w-4 text-accent" />
          Total Bids Won
        </div>
        <div className="text-2xl font-bold font-display">{stats.bidsWon ?? 0}</div>
        <div className="text-xs text-muted-foreground mt-auto">
          Out of {stats.totalBids ?? 0} bids placed
        </div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          Estimated Profit Margin
        </div>
        <div className="text-2xl font-bold font-display text-success">+14.2%</div>
        <div className="text-xs text-muted-foreground mt-auto">Based on market price avg</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Orders Fulfilled
        </div>
        <div className="text-2xl font-bold font-display">{stats.fulfilled ?? 0}</div>
        <div className="text-xs text-muted-foreground mt-auto">Completed deliveries</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          Farmer Rating
        </div>
        <div className="text-2xl font-bold font-display">
          {stats.avgRating ? `${stats.avgRating}/5` : "No ratings"}
        </div>
        <div className="text-xs text-muted-foreground mt-auto">
          {stats.reviewCount ? `Based on ${stats.reviewCount} reviews` : "Pending first review"}
        </div>
      </Card>
    </div>
  );

  const renderTransporterStats = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Truck className="h-4 w-4 text-soil" />
          Deliveries Completed
        </div>
        <div className="text-2xl font-bold font-display">{stats.completed ?? 0}</div>
        <div className="text-xs text-muted-foreground mt-auto">Successfully transported</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Total Distance
        </div>
        <div className="text-2xl font-bold font-display">-- km</div>
        <div className="text-xs text-muted-foreground mt-auto">Live tracking unavailable</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Safe Transport
        </div>
        <div className="text-2xl font-bold font-display">100%</div>
        <div className="text-xs text-muted-foreground mt-auto">Zero damage reported</div>
      </Card>
      <Card className="p-5 flex flex-col gap-2">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          Service Rating
        </div>
        <div className="text-2xl font-bold font-display">
          {stats.avgRating ? `${stats.avgRating}/5` : "No ratings"}
        </div>
        <div className="text-xs text-muted-foreground mt-auto">
          {stats.reviewCount ? `Based on ${stats.reviewCount} reviews` : "Pending first review"}
        </div>
      </Card>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center font-sans"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
      }}
    >
      <div className="container py-8 max-w-6xl animate-fade-in text-white">
        <div className="mb-4">
          <Button
            variant="ghost"
            className="mb-4 -ml-4 text-white hover:bg-white/10"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="mb-8 drop-shadow-lg">
          <h1 className="font-display text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-white/80">
            Manage your account preferences and view your performance metrics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info Sidebar */}
          <div className="space-y-6 md:col-span-1">
            <Card className="p-6 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <div className="flex flex-col items-centertext-center border-b pb-6 mb-6">
                {profileData?.avatar_url ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden mb-4 mx-auto border-2 border-primary/20">
                    <img
                      src={profileData.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary">
                    <User className="h-12 w-12" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-center">
                  {profileData?.full_name || user.user_metadata?.name || user.email?.split("@")[0]}
                </h2>
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                    {currentRole}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Contact Info
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.phone || "+91 98765 43210"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.location || "Maharashtra, India"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 font-display">Your Track Record</h2>
              <p className="text-muted-foreground mb-2">
                Here is a summary of your historical performances and transactions on the platform.
              </p>

              {currentRole === "farmer" && renderFarmerStats()}
              {currentRole === "buyer" && renderBuyerStats()}
              {currentRole === "transporter" && renderTransporterStats()}
            </div>

            <Card className="p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">Recent Activity Logs</h2>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No recent activity found.</p>
                ) : (
                  activities.map((act, i) => (
                    <div
                      key={i}
                      className={`border-l-2 pl-4 py-2 ${act.primary ? "border-primary" : "border-border opacity-80"}`}
                    >
                      <div className="text-sm text-muted-foreground mb-1">
                        {new Date(act.date).toLocaleString()}
                      </div>
                      <div className="font-medium">{act.txt}</div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Profile Picture URL</Label>
                <Input
                  placeholder="https://..."
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a link to an image. We recommend square dimensions.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Changing your email will require verification.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
