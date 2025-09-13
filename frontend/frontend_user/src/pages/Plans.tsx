import { useEffect, useRef, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Wifi, 
  Zap, 
  Clock, 
  Check,
  Star
} from "lucide-react";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { addNotification } from "@/lib/notifications";
import { Link, useNavigate } from "react-router-dom";

const UserPlans = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();
  
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
        setUserSubscriptions(subsRes.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    refreshRef.current = loadData;
    loadData();
    const interval = setInterval(loadData, 20000);
    const onVis = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVis); };
  }, [user?._id]);

  const categories = [
    { id: "all", name: "All Plans", icon: Star },
    { id: "Fibernet", name: "Fibernet", icon: Zap },
    { id: "Broadband Copper", name: "Broadband", icon: Wifi },
  ];

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = (plan.Name || plan.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || plan.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubscribe = async (planId: string) => {
    // Check if user already has an active subscription
    const hasActiveSubscription = userSubscriptions.some(sub => sub.status === 'active');
    if (hasActiveSubscription) {
      alert('You already have an active subscription. Please cancel or change your current plan first.');
      return;
    }

    try {
      const plan = plans.find(p => p._id === planId);
      if (confirm(`Subscribe to ${plan?.Name || plan?.name} for $${plan?.Price || plan?.price}/month?`)) {
  const res = await api.subscribe(user?._id, planId);
        setUserSubscriptions(prev => [res.data, ...prev]);
        addNotification({
          title: "Subscription successful",
          description: `You're now subscribed to ${plan?.Name || plan?.name}.`,
        });
        alert('Successfully subscribed to the plan!');
      }
    } catch (e: any) {
      alert(`Subscription failed: ${e.message}`);
    }
  };

  const isSubscribed = (planId: string) => {
    return userSubscriptions.some(sub => 
      sub.plan?._id === planId && sub.status === 'active'
    );
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading plans...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Choose Your Perfect Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select from our range of high-speed internet plans designed to meet your needs
          </p>
          <div className="flex justify-center">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>Back to Dashboard</Button>
              <Button variant="secondary" onClick={() => refreshRef.current?.()}>Refresh</Button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {error && (
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => {
            const subscribed = isSubscribed(plan._id);
            return (
              <Card 
                key={plan._id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  subscribed ? 'ring-2 ring-primary' : ''
                }`}
              >
                {subscribed && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">
                    {plan.Name || plan.name}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      ${plan.Price || plan.price}
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {plan.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Speed and Quota */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-medium">Speed: {plan.speed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-primary" />
                      <span className="font-medium">Data: {plan.quota}GB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        Auto Renewal: {plan["Auto Renewal Allowed"] === "Yes" ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Features:</p>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Description */}
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="pt-4">
                    {subscribed ? (
                      <Button disabled className="w-full">
                        <Check className="h-4 w-4 mr-2" />
                        Subscribed
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSubscribe(plan._id)}
                        className="w-full"
                        size="lg"
                      >
                        Subscribe Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPlans.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No plans found matching your criteria.</p>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserPlans;