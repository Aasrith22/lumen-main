import { useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import ManageSubscriptionDialog from "@/components/services/ManageSubscriptionDialog";

const MyServices = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getCurrentUser();

  const reload = async () => {
    try {
      const res = user?._id ? await api.listSubscriptions({ userId: user._id }) : { data: [] };
      setSubscriptions(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [user?._id]);

  return (
    <UserLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Services</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-destructive">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <Card key={sub._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{sub.plan?.Name || sub.plan?.name || "Plan"}</span>
                  <Badge variant={sub.status === 'active' ? 'secondary' : 'outline'}>{sub.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Price: ${sub.plan?.Price || sub.plan?.price}/mo</div>
                {sub.renewalDate && (
                  <div>Renews: {new Date(sub.renewalDate).toLocaleDateString()}</div>
                )}
                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedSub(sub); setDialogOpen(true); }}>
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && subscriptions.length === 0 && (
            <div className="text-muted-foreground">No services yet.</div>
          )}
        </div>
      </div>
      <ManageSubscriptionDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) reload(); }}
        subscription={selectedSub}
        userId={user?._id}
      />
    </UserLayout>
  );
};

export default MyServices;
