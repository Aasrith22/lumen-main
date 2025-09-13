import { useEffect, useRef, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Plus,
  Settings,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

const Index = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = getCurrentUser();

  const refreshRef = useRef<() => Promise<void>>();
  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansRes, subsRes] = await Promise.all([
          api.getPlans(),
          user?._id ? api.listSubscriptions({ userId: user._id }) : Promise.resolve({ data: [] })
        ]);
        setPlans(plansRes.data || []);
        setSubscriptions(subsRes.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    refreshRef.current = loadData;
    loadData();

    // Poll every 20s to capture new admin-created plans
    const interval = setInterval(loadData, 20000);
    // Refetch when tab becomes visible
    const onVis = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVis); };
  }, [user?._id]);

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  const totalSpent = subscriptions.reduce((sum, sub) => {
    if (sub.plan?.Price || sub.plan?.price) {
      return sum + (sub.plan?.Price || sub.plan?.price);
    }
    return sum;
  }, 0);

  // Mock usage data - in a real app this would come from the API
  const usagePercentage = 65;
  const dataUsed = activeSubscription ? Math.floor((activeSubscription.plan?.quota || 100) * 0.65) : 0;
  const dataTotal = activeSubscription?.plan?.quota || 100;

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">Here's your subscription overview and usage statistics.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/plans">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Browse Plans
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => refreshRef.current?.()}>
              Refresh
            </Button>
            {!activeSubscription && (
              <Link to="/plans">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSubscription ? activeSubscription.plan?.Name || activeSubscription.plan?.name || "Unknown" : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeSubscription ? `$${activeSubscription.plan?.Price || activeSubscription.plan?.price}/month` : "No active subscription"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usagePercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {dataUsed}GB of {dataTotal}GB used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Across {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSubscription ? "Active" : "Inactive"}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeSubscription ? "Subscription running" : "No active plan"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                {activeSubscription ? "Upgrade or switch to a different plan" : "Choose a plan to get started"}
              </CardDescription>
            </div>
            <Link to="/plans">
              <Button variant="outline" size="sm">
                View All Plans
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.slice(0, 3).map((plan) => (
                <Card key={plan._id} className="relative">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold">{plan.Name || plan.name}</h4>
                      <div className="text-2xl font-bold text-primary">
                        ${plan.Price || plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.speed} • {plan.quota}GB
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {plan.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                Error loading data: {error}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default Index;
// import { useState } from "react";
// import LoginForm from "@/components/auth/LoginForm";
// import Navbar from "@/components/layout/Navbar";
// import Dashboard from "@/components/dashboard/Dashboard";

// const Index = () => {
//   const [user, setUser] = useState<{ type: 'user' | 'admin' } | null>(null);

//   const handleLogin = (userType: 'user' | 'admin') => {
//     setUser({ type: userType });
//   };

//   const handleLogout = () => {
//     setUser(null);
//   };

//   if (!user) {
//     return <LoginForm onLogin={handleLogin} />;
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar userType={user.type} onLogout={handleLogout} />
//       <Dashboard userType={user.type} />
//     </div>
//   );
// };

// export default Index;
