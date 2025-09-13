import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

export const SubscriptionChart = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.listSubscriptions();
        setRows(res.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Simple aggregation: count active/cancelled by plan type
  const data = useMemo(() => {
    const buckets: Record<string, { type: string; active: number; cancelled: number; new: number }> = {};
    for (const s of rows) {
      const type = s.plan?.type || "Unknown";
      if (!buckets[type]) buckets[type] = { type, active: 0, cancelled: 0, new: 0 };
      if (s.status === "active") buckets[type].active += 1;
      if (s.status === "cancelled") buckets[type].cancelled += 1;
      // naive: treat created in last 30 days as "new"
      if (Date.now() - new Date(s.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000) buckets[type].new += 1;
    }
    return Object.values(buckets);
  }, [rows]);

  return (
    <Card className="bg-gradient-card border-card-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Subscription Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading chart...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="type" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))"
              }}
            />
            <Bar dataKey="active" fill="hsl(var(--primary))" name="Active" />
            <Bar dataKey="new" fill="hsl(var(--success))" name="New" />
            <Bar dataKey="cancelled" fill="hsl(var(--destructive))" name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};