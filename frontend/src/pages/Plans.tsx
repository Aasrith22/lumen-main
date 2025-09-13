import { useState } from "react";
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

// Mock data based on CSV structure
const mockPlans = [
  { id: 1, name: "Fibernet Basic", price: 59.99, autoRenewal: true, status: "Active", subscribers: 234, revenue: 14037.66 },
  { id: 2, name: "Fibernet Premium", price: 89.99, autoRenewal: true, status: "Active", subscribers: 189, revenue: 17007.11 },
  { id: 3, name: "Broadband Copper", price: 39.99, autoRenewal: false, status: "Active", subscribers: 156, revenue: 6238.44 },
  { id: 4, name: "Fibernet Pro", price: 129.99, autoRenewal: true, status: "Active", subscribers: 89, revenue: 11569.11 },
  { id: 5, name: "Business Basic", price: 199.99, autoRenewal: true, status: "Inactive", subscribers: 45, revenue: 8999.55 },
];

const Plans = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    features: "",
    autoRenewal: true,
    status: "Active"
  });

  const filteredPlans = mockPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setFormData({
      name: "",
      price: "",
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
      name: plan.name,
      price: plan.price.toString(),
      description: "High-speed internet with unlimited data",
      features: "Unlimited data, 24/7 support, Free installation",
      autoRenewal: plan.autoRenewal,
      status: plan.status
    });
    setIsAddPlanOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - will integrate with backend later
    console.log("Plan data:", formData);
    setIsAddPlanOpen(false);
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
              <div className="text-2xl font-bold text-foreground">{mockPlans.length}</div>
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
                {mockPlans.reduce((sum, plan) => sum + plan.subscribers, 0)}
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
              <div className="text-2xl font-bold text-foreground">
                ${mockPlans.reduce((sum, plan) => sum + plan.revenue, 0).toLocaleString()}
              </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Auto Renewal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>${plan.price}/month</TableCell>
                    <TableCell>
                      <Badge variant={plan.autoRenewal ? "default" : "secondary"}>
                        {plan.autoRenewal ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={plan.status === "Active" ? "default" : "secondary"}
                        className={plan.status === "Active" ? "bg-success text-success-foreground" : ""}
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.subscribers}</TableCell>
                    <TableCell>${plan.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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