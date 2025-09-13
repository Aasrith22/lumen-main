import { AdminLayout } from "@/components/admin/AdminLayout";
import { MetricCard } from "@/components/admin/MetricCard";
import { RecentSubscriptions } from "@/components/admin/RecentSubscriptions";
import { SubscriptionChart } from "@/components/admin/SubscriptionChart";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Plus,
  Filter,
  Download
} from "lucide-react";

const Index = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening with your subscriptions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="admin-secondary" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="admin-secondary" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="admin-primary" size="sm">
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value="2,847"
            change="+12.5%"
            changeType="positive"
            icon={Users}
            description="from last month"
          />
          <MetricCard
            title="Active Subscriptions"
            value="2,020"
            change="+8.2%"
            changeType="positive"
            icon={CreditCard}
            description="from last month"
          />
          <MetricCard
            title="Monthly Revenue"
            value="$142,580"
            change="+15.3%"
            changeType="positive"
            icon={DollarSign}
            description="from last month"
          />
          <MetricCard
            title="Growth Rate"
            value="23.1%"
            change="+2.4%"
            changeType="positive"
            icon={TrendingUp}
            description="this quarter"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SubscriptionChart />
          <RecentSubscriptions />
        </div>

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Plan Conversion Rate"
            value="68.4%"
            change="+5.2%"
            changeType="positive"
            icon={TrendingUp}
            description="this month"
          />
          <MetricCard
            title="Churn Rate"
            value="4.2%"
            change="-1.1%"
            changeType="positive"
            icon={Users}
            description="improvement"
          />
          <MetricCard
            title="Avg. Revenue Per User"
            value="$78.50"
            change="+$3.20"
            changeType="positive"
            icon={DollarSign}
            description="this month"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
