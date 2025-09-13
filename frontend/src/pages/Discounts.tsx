import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Search,
  Percent,
  Calendar as CalendarIcon,
  Gift,
  TrendingUp,
  Users
} from "lucide-react";

// Mock discount data
const mockDiscounts = [
  {
    id: 1,
    name: "Summer Special 2024",
    code: "SUMMER24",
    type: "percentage",
    value: 25,
    description: "25% off on all Fibernet plans",
    applicablePlans: ["Fibernet Basic", "Fibernet Premium"],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    usageLimit: 1000,
    usedCount: 342,
    status: "active",
    createdDate: "2024-05-15"
  },
  {
    id: 2,
    name: "New Customer Discount",
    code: "WELCOME20",
    type: "percentage", 
    value: 20,
    description: "20% off first 3 months for new customers",
    applicablePlans: ["All Plans"],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    usageLimit: 500,
    usedCount: 128,
    status: "active",
    createdDate: "2023-12-20"
  },
  {
    id: 3,
    name: "Black Friday Deal",
    code: "BLACKFRIDAY",
    type: "fixed",
    value: 50,
    description: "$50 off yearly subscriptions",
    applicablePlans: ["Fibernet Pro", "Business Basic"],
    startDate: "2024-11-25",
    endDate: "2024-11-30",
    usageLimit: 200,
    usedCount: 45,
    status: "scheduled",
    createdDate: "2024-10-15"
  },
  {
    id: 4,
    name: "Student Discount",
    code: "STUDENT15",
    type: "percentage",
    value: 15,
    description: "15% discount for students",
    applicablePlans: ["Fibernet Basic", "Broadband Copper"],
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    usageLimit: 300,
    usedCount: 67,
    status: "active",
    createdDate: "2024-08-20"
  },
  {
    id: 5,
    name: "Holiday Special",
    code: "HOLIDAY30",
    type: "percentage",
    value: 30,
    description: "Holiday season special offer",
    applicablePlans: ["All Plans"],
    startDate: "2023-12-15",
    endDate: "2024-01-15",
    usageLimit: 800,
    usedCount: 756,
    status: "expired",
    createdDate: "2023-12-01"
  }
];

const Discounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    value: "",
    description: "",
    applicablePlans: [],
    usageLimit: "",
    status: "active"
  });

  const filteredDiscounts = mockDiscounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || discount.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddDiscount = () => {
    setSelectedDiscount(null);
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      description: "",
      applicablePlans: [],
      usageLimit: "",
      status: "active"
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setIsAddDiscountOpen(true);
  };

  const handleEditDiscount = (discount: any) => {
    setSelectedDiscount(discount);
    setFormData({
      name: discount.name,
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      description: discount.description,
      applicablePlans: discount.applicablePlans,
      usageLimit: discount.usageLimit.toString(),
      status: discount.status
    });
    setStartDate(new Date(discount.startDate));
    setEndDate(new Date(discount.endDate));
    setIsAddDiscountOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - will integrate with backend later
    console.log("Discount data:", {
      ...formData,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });
    setIsAddDiscountOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "scheduled":
        return "bg-warning text-warning-foreground";
      case "expired":
        return "bg-muted text-muted-foreground";
      case "inactive":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const activeDiscounts = mockDiscounts.filter(d => d.status === "active");
  const totalUsages = mockDiscounts.reduce((sum, discount) => sum + discount.usedCount, 0);
  const totalSavings = mockDiscounts.reduce((sum, discount) => {
    // Rough calculation of savings provided
    const avgOrderValue = 75; // Assume average order value
    return sum + (discount.usedCount * (discount.type === "percentage" ? 
      (avgOrderValue * discount.value / 100) : discount.value));
  }, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discounts & Promotions</h1>
            <p className="text-muted-foreground">Create and manage promotional offers and discount codes</p>
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
            <Button variant="admin-primary" size="sm" onClick={handleAddDiscount}>
              <Plus className="h-4 w-4" />
              Create Discount
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Discounts</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeDiscounts.length}</div>
              <p className="text-xs text-success">Currently running</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Usage</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">discount codes used</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${totalSavings.toLocaleString()}</div>
              <p className="text-xs text-success">provided in discounts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Usage Rate</CardTitle>
              <Percent className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {Math.round((totalUsages / mockDiscounts.reduce((sum, d) => sum + d.usageLimit, 0)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">of usage limits</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search discounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discounts Table */}
        <Card className="bg-gradient-card border-card-border shadow-card">
          <CardHeader>
            <CardTitle>Discount Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{discount.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-48">
                          {discount.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {discount.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {discount.type === "percentage" ? "Percentage" : "Fixed Amount"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(discount.startDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          to {new Date(discount.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <div className="font-medium">{discount.usedCount}</div>
                          <div className="text-muted-foreground">of {discount.usageLimit}</div>
                        </div>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${Math.min((discount.usedCount / discount.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(discount.status)}>
                        {discount.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditDiscount(discount)}
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

        {/* Add/Edit Discount Dialog */}
        <Dialog open={isAddDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedDiscount ? "Edit Discount" : "Create New Discount"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Summer Special 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SUMMER24"
                    className="font-mono"
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
                  placeholder="Describe this discount campaign..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    Discount Value {formData.type === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step={formData.type === "percentage" ? "1" : "0.01"}
                    min="0"
                    max={formData.type === "percentage" ? "100" : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder={formData.type === "percentage" ? "25" : "50.00"}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) => setFormData({...formData, status: checked ? "active" : "inactive"})}
                />
                <Label htmlFor="status">Active Campaign</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="admin-secondary" onClick={() => setIsAddDiscountOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="admin-primary">
                  {selectedDiscount ? "Update Discount" : "Create Discount"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Discounts;