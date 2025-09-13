import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  DollarSign,
  Calendar,
  Download,
  Filter
} from "lucide-react";

// Mock analytics data
const subscriptionTrends = [
  { month: "Jan", active: 1240, cancelled: 80, new: 320, revenue: 89600 },
  { month: "Feb", active: 1380, cancelled: 65, new: 225, revenue: 99720 },
  { month: "Mar", active: 1520, cancelled: 95, new: 235, revenue: 109840 },
  { month: "Apr", active: 1680, cancelled: 110, new: 270, revenue: 121440 },
  { month: "May", active: 1850, cancelled: 85, new: 255, revenue: 133600 },
  { month: "Jun", active: 2020, cancelled: 120, new: 290, revenue: 145840 },
];

const planPopularity = [
  { name: "Fibernet Premium", value: 35, color: "hsl(var(--primary))" },
  { name: "Fibernet Basic", value: 28, color: "hsl(var(--success))" },
  { name: "Broadband Copper", value: 20, color: "hsl(var(--warning))" },
  { name: "Fibernet Pro", value: 12, color: "hsl(var(--destructive))" },
  { name: "Business Basic", value: 5, color: "hsl(var(--muted))" },
];

const revenueByPlan = [
  { plan: "Fibernet Premium", revenue: 45600, subscribers: 189 },
  { plan: "Fibernet Basic", revenue: 38400, subscribers: 234 },
  { plan: "Broadband Copper", revenue: 22800, subscribers: 156 },
  { plan: "Fibernet Pro", revenue: 18200, subscribers: 89 },
  { plan: "Business Basic", revenue: 12000, subscribers: 45 },
];

const churnAnalysis = [
  { month: "Jan", churnRate: 6.5, newCustomers: 320, lostCustomers: 80 },
  { month: "Feb", churnRate: 4.7, newCustomers: 225, lostCustomers: 65 },
  { month: "Mar", churnRate: 6.3, newCustomers: 235, lostCustomers: 95 },
  { month: "Apr", churnRate: 6.8, newCustomers: 270, lostCustomers: 110 },
  { month: "May", churnRate: 4.6, newCustomers: 255, lostCustomers: 85 },
  { month: "Jun", churnRate: 5.9, newCustomers: 290, lostCustomers: 120 },
];

const Analytics = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track subscription performance and user engagement metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="6months">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="admin-secondary" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="admin-secondary" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$145,840</div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2,020</div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5.9%</div>
              <div className="flex items-center text-xs text-success">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.9% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Revenue Per User</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$72.20</div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.1% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader>
              <CardTitle>Subscription Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader>
              <CardTitle>Plan Popularity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planPopularity}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {planPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={subscriptionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader>
              <CardTitle>Churn Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={churnAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="churnRate" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Table */}
        <Card className="bg-gradient-card border-card-border shadow-card">
          <CardHeader>
            <CardTitle>Plan Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByPlan.map((plan, index) => (
                <div key={plan.plan} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{plan.plan}</h3>
                      <p className="text-sm text-muted-foreground">{plan.subscribers} subscribers</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      ${plan.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(plan.revenue / plan.subscribers).toFixed(2)} per user
                    </div>
                  </div>
                  
                  <Badge 
                    variant={index < 2 ? "default" : "secondary"}
                    className={index < 2 ? "bg-success text-success-foreground" : ""}
                  >
                    {index < 2 ? "Top Performer" : index < 4 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;