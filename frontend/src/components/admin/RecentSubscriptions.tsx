import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-success text-success-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    case "cancelled":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const RecentSubscriptions = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.listSubscriptions();
        const subs = res.data || [];
        // Sort by createdAt descending and take latest 6
        subs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(subs.slice(0, 6));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Card className="bg-gradient-card border-card-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
        )}
        {items.map((subscription: any) => (
          <div key={subscription._id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {(subscription.user?.fullname || "U N").split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{subscription.user?.fullname || "Unknown"}</p>
                <span className="text-sm font-medium text-foreground">${subscription.plan?.Price?.toFixed?.(2) || subscription.plan?.price?.toFixed?.(2) || subscription.plan?.Price || subscription.plan?.price || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{subscription.user?.email || ""}</p>
                <span className="text-xs text-muted-foreground">{new Date(subscription.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{subscription.plan?.Name || subscription.plan?.name || "—"}</span>
                <Badge className={getStatusColor(subscription.status)} variant="secondary">{subscription.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};