import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UsageChart from "./UsageChart";
import PlanCard from "./PlanCard";
import ServiceCard from "../services/ServiceCard";
import { Bell, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

interface DashboardProps {
  userType: 'user' | 'admin';
}

const Dashboard = ({ userType }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [plans, setPlans] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getCurrentUser(), []);

  // Mock data
  const usageData = [
    { name: 'Used', value: 45, color: 'hsl(var(--deep-blue))' },
    { name: 'Remaining', value: 55, color: 'hsl(var(--soft-cyan))' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, subsRes] = await Promise.all([
          api.getPlans(),
          api.listSubscriptions(user?._id ? { userId: user._id } : undefined),
        ]);
        setPlans(plansRes.data || []);
        setSubs(subsRes.data || []);
      } catch (e: any) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  // Subscribe to a plan
  const handleSubscribe = async (planId: string) => {
    if (!user?._id) return alert('No user in local storage.');
    try {
      const res = await api.subscribe(user._id, planId);
      setSubs(prev => [res.data, ...prev]);
      alert('Subscribed successfully');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Upgrade/Downgrade
  const handleChangePlan = async (subscriptionId: string, newPlanId: string) => {
    try {
      const res = await api.changePlan(subscriptionId, newPlanId);
      setSubs(prev => prev.map(s => (s._id === subscriptionId ? res.data : s)));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      const res = await api.cancel(subscriptionId);
      setSubs(prev => prev.map(s => (s._id === subscriptionId ? res.data : s)));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRenew = async (subscriptionId: string) => {
    try {
      const res = await api.renew(subscriptionId);
      setSubs(prev => prev.map(s => (s._id === subscriptionId ? res.data : s)));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const services = useMemo(() => {
    const byType: Record<string, any> = {};
    for (const p of plans) {
      const type = p.type || 'Other';
      if (!byType[type]) byType[type] = { id: type, name: `${type} Plans`, description: `${type} internet plans`, type, featured: type === 'Fibernet', plans: [] as any[] };
      byType[type].plans.push({ 
        id: p._id, 
        name: p.Name || p.name, 
        speed: p.speed, 
        quota: p.quota, 
        price: p.Price || p.price 
      });
    }
    return Object.values(byType);
  }, [plans]);

  const handlePlanDetails = (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    if (!plan) return;
    if (confirm(`Subscribe to ${plan.Name || plan.name} for $${plan.Price || plan.price}/mo?`)) {
      handleSubscribe(planId);
    }
  };

  const handleServiceExplore = (serviceId: string) => {
    const s = services.find((x: any) => x.id === serviceId) as any;
    if (!s) return;
    const choice = prompt(`Enter plan name to subscribe:\n${s.plans.map((p: any) => `- ${p.name} ($${p.price})`).join('\n')}`);
    const plan = plans.find(p => (p.Name || p.name).toLowerCase() === String(choice||'').toLowerCase());
    if (plan) handleSubscribe(plan._id);
  };

  if (userType === 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-deep-blue">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage subscriptions, plans, and analytics</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-blue">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-blue">$142,890</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-blue">1,249</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-blue">+23%</div>
              <p className="text-xs text-muted-foreground">Quarterly growth</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-deep-blue mb-2">Admin Features Coming Soon</h3>
          <p className="text-muted-foreground">
            Plan management, analytics, and user administration features will be available here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-deep-blue">Welcome back!</h1>
        <p className="text-muted-foreground">Manage your subscriptions and explore new services</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'services' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('services')}
          >
            My Services
          </Button>
          <Button
            variant={activeTab === 'browse' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('browse')}
          >
            Browse Services
          </Button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Notifications */}
          <Card className="border-warning bg-warning/5">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-warning" />
                <CardTitle className="text-warning">Important Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">• Your Broadband Basic plan expires in 7 days</p>
                <p className="text-sm">• New promotional offers available for Fibernet plans</p>
              </div>
              <Button variant="warning" size="sm" className="mt-3">
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Usage Chart */}
            <UsageChart 
              data={usageData}
              totalUsage={45}
              totalQuota={100}
            />

            {/* Quick Stats */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-deep-blue">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-light-gray/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Active Plans</p>
                    <p className="text-2xl font-bold text-deep-blue">2</p>
                  </div>
                  <div className="bg-light-gray/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                    <p className="text-2xl font-bold text-deep-blue">$79.98</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold text-deep-blue mb-3">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan renewal reminder sent</span>
                      <span className="text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage alert: 80% quota reached</span>
                      <span className="text-muted-foreground">5 days ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* My Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-deep-blue">My Active Plans</h2>
            <Badge variant="outline" className="text-deep-blue">
              {subs.filter(s => s.status === 'active').length} Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && <p className="text-sm text-muted-foreground">Loading your plans...</p>}
            {!loading && subs.length === 0 && <p className="text-sm text-muted-foreground">You have no subscriptions yet.</p>}
            {!loading && subs.map(sub => (
              <PlanCard 
                key={sub._id}
                plan={{
                  id: sub._id,
                  name: sub.plan?.name || 'Plan',
                  type: sub.plan?.type || '',
                  quota: sub.plan?.quota || 0,
                  speed: sub.plan?.speed || '',
                  price: sub.plan?.price || 0,
                  expiryDate: sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—',
                  status: (sub.status || 'active') as any,
                  daysLeft: sub.endDate ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000*60*60*24))) : 30,
                }}
                onViewDetails={(planId) => {
                  const choice = prompt('Type: upgrade <PlanName>, downgrade <PlanName>, cancel, or renew');
                  if (!choice) return;
                  const [action, ...rest] = choice.split(' ');
                  if (action === 'cancel') return handleCancel(sub._id);
                  if (action === 'renew') return handleRenew(sub._id);
                  const targetName = rest.join(' ');
                  const newPlan = plans.find(p => p.name.toLowerCase() === targetName.toLowerCase());
                  if (newPlan) handleChangePlan(sub._id, newPlan._id);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Browse Services Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-deep-blue">Available Services</h2>
            <p className="text-muted-foreground">Explore and subscribe to new internet plans</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service: any) => (
              <ServiceCard 
                key={service.id}
                service={service}
                onExplore={handleServiceExplore}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;