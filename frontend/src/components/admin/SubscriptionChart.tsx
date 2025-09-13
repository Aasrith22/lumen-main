import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", active: 1240, cancelled: 80, new: 320 },
  { month: "Feb", active: 1380, cancelled: 65, new: 205 },
  { month: "Mar", active: 1520, cancelled: 95, new: 235 },
  { month: "Apr", active: 1680, cancelled: 110, new: 270 },
  { month: "May", active: 1850, cancelled: 85, new: 255 },
  { month: "Jun", active: 2020, cancelled: 120, new: 290 },
];

export const SubscriptionChart = () => {
  return (
    <Card className="bg-gradient-card border-card-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Subscription Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
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
      </CardContent>
    </Card>
  );
};