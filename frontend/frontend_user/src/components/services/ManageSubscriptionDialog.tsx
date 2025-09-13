import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { addNotification } from "@/lib/notifications";
import { toast } from "@/hooks/use-toast";

interface ManageSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subscription: any | null; // { _id, plan: { _id, Name, Price }, status }
  userId: string;
}

export default function ManageSubscriptionDialog({ open, onOpenChange, subscription, userId }: ManageSubscriptionDialogProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPlanId, setNewPlanId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await api.getPlans();
          setPlans(res.data || []);
        } catch (e: any) {
          setError(e.message);
        }
      })();
    }
  }, [open]);

  const changePlan = async () => {
    if (!subscription?._id || !newPlanId) return;
    setLoading(true);
    try {
      await api.changePlan(subscription._id, newPlanId);
      addNotification({
        title: "Plan changed",
        description: `Your plan has been changed successfully.`,
      });
      toast({ title: "Plan changed", description: "Your subscription was updated." });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Change failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const cancelPlan = async () => {
    if (!subscription?._id) return;
    setLoading(true);
    try {
      await api.cancel(subscription._id);
      addNotification({
        title: "Subscription cancelled",
        description: `Your subscription was cancelled successfully.`,
      });
      toast({ title: "Subscription cancelled" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Cancel failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            {subscription?.plan?.Name || subscription?.plan?.name} — ${subscription?.plan?.Price || subscription?.plan?.price}/mo
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-destructive text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">Change to another plan</p>
            <Select value={newPlanId} onValueChange={setNewPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new plan" />
              </SelectTrigger>
              <SelectContent>
                {plans
                  .filter((p) => p._id !== subscription?.plan?._id)
                  .map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {(p.Name || p.name) + ` — $${p.Price || p.price}/mo`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <Button variant="outline" onClick={changePlan} disabled={!newPlanId || loading}>
              Change Plan
            </Button>
            <Button variant="destructive" onClick={cancelPlan} disabled={loading}>
              Cancel Subscription
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
