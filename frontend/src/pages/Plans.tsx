import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Search,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";

import api from "@/lib/api";

const Plans = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    type: "Fibernet",
    speed: "100 Mbps",
    quota: "100",
    description: "",
    features: "",
    autoRenewal: true,
    status: "Active"
  });

  const location = useLocation();
  const shouldOpenAdd = useMemo(() => new URLSearchParams(location.search).get('add') === '1', [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getPlans();
        setPlans(res.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (shouldOpenAdd) {
      handleAddPlan();
    }
  }, [shouldOpenAdd]);

  const filteredPlans = plans.filter(plan =>
    (plan.Name || plan.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.Status === "Active" ? "active" : "inactive").includes(searchTerm.toLowerCase())
  );

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setFormData({
      name: "",
      price: "",
      type: "Fibernet",
      speed: "100 Mbps",
      quota: "100",
      description: "",
      features: "",
      autoRenewal: true,
      status: "Active"
    });
    setIsAddPlanOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.Name || plan.name || "",
      price: String(plan.Price || plan.price || ""),
      type: plan.type || "Fibernet",
      speed: plan.speed || "100 Mbps",
      quota: String(plan.quota || ""),
      description: plan.description || "",
      features: (plan.features || []).join("\n"),
      autoRenewal: (plan["Auto Renewal Allowed"] === "Yes") || true,
      status: (plan.Status === "Active") ? "Active" : "Inactive"
    });
    setIsAddPlanOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        type: formData.type,
        speed: formData.speed,
        quota: parseInt(formData.quota || '0', 10),
        features: formData.features
          .split(/\n|\r/)
          .map(f => f.trim())
          .filter(Boolean),
        isActive: formData.status === "Active",
      };
      if (selectedPlan?._id) {
        const res = await api.updatePlan(selectedPlan._id, payload);
        setPlans(prev => prev.map(p => (p._id === selectedPlan._id ? res.data : p)));
      } else {
        const res = await api.createPlan(payload);
        setPlans(prev => [res.data, ...prev]);
      }
      setIsAddPlanOpen(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await api.deletePlan(id);
      setPlans(prev => prev.filter(p => p._id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Plans Management</h1>
            <p className="text-muted-foreground">Create and manage subscription plans for your services</p>
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
            <Button variant="admin-primary" size="sm" onClick={handleAddPlan}>
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Plans</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{plans.length}</div>
              <p className="text-xs text-success">+2 new this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {/* Placeholder: requires subscription aggregation */}
                {0}
              </div>
              <p className="text-xs text-success">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$0</div>
              <p className="text-xs text-success">+8.2% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Plans Table */}
        <Card className="bg-gradient-card border-card-border shadow-card">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-muted-foreground">Loading plans...</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell className="font-medium">{plan.Name || plan.name}</TableCell>
                    <TableCell>${plan.Price || plan.price}/month</TableCell>
                    <TableCell>
                      <Badge 
                        variant={plan.Status === "Active" || plan.isActive ? "default" : "secondary"}
                        className={plan.Status === "Active" || plan.isActive ? "bg-success text-success-foreground" : ""}
                      >
                        {plan.Status === "Active" || plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(plan._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Plan Dialog */}
        <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPlan ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Fibernet Premium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="59.99"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    placeholder="Fibernet or Broadband Copper"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speed">Speed</Label>
                  <Input
                    id="speed"
                    value={formData.speed}
                    onChange={(e) => setFormData({...formData, speed: e.target.value})}
                    placeholder="100 Mbps"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quota">Quota (GB)</Label>
                  <Input
                    id="quota"
                    type="number"
                    value={formData.quota}
                    onChange={(e) => setFormData({...formData, quota: e.target.value})}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this plan..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="Unlimited data&#10;24/7 support&#10;Free installation"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoRenewal"
                    checked={formData.autoRenewal}
                    onCheckedChange={(checked) => setFormData({...formData, autoRenewal: checked})}
                  />
                  <Label htmlFor="autoRenewal">Auto Renewal Allowed</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status === "Active"}
                    onCheckedChange={(checked) => setFormData({...formData, status: checked ? "Active" : "Inactive"})}
                  />
                  <Label htmlFor="status">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="admin-secondary" onClick={() => setIsAddPlanOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="admin-primary">
                  {selectedPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Plans;