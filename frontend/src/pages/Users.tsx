import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Mail,
  Phone,
  Calendar,
  CreditCard,
  TrendingUp,
  Users as UsersIcon
} from "lucide-react";

// Mock user data based on CSV structure
const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "1234567801",
    status: "active",
    subscription: {
      plan: "Fibernet Premium",
      type: "monthly",
      status: "active",
      startDate: "2024-01-15",
      nextBilling: "2024-12-15",
      amount: 89.99
    },
    joinDate: "2024-01-15",
    totalSpent: 980.89
  },
  {
    id: 2,
    name: "Sarah Johnson", 
    email: "sarah.j@email.com",
    phone: "1234567802",
    status: "active",
    subscription: {
      plan: "Fibernet Basic",
      type: "yearly",
      status: "active", 
      startDate: "2024-03-10",
      nextBilling: "2025-03-10",
      amount: 599.99
    },
    joinDate: "2024-03-10",
    totalSpent: 599.99
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "1234567803", 
    status: "inactive",
    subscription: {
      plan: "Broadband Copper",
      type: "monthly",
      status: "paused",
      startDate: "2023-11-20",
      nextBilling: null,
      amount: 39.99
    },
    joinDate: "2023-11-20",
    totalSpent: 519.87
  },
  {
    id: 4,
    name: "Emily Wilson",
    email: "emily.w@email.com", 
    phone: "1234567804",
    status: "active",
    subscription: {
      plan: "Fibernet Pro",
      type: "monthly",
      status: "active",
      startDate: "2024-05-08",
      nextBilling: "2024-12-08",
      amount: 129.99
    },
    joinDate: "2024-05-08",
    totalSpent: 909.93
  }
];

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.subscription.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "paused":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "paused":
        return "bg-warning text-warning-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const activeUsers = mockUsers.filter(u => u.status === "active").length;
  const totalRevenue = mockUsers.reduce((sum, user) => sum + user.totalSpent, 0);
  const avgRevenuePerUser = totalRevenue / mockUsers.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users & Subscriptions</h1>
            <p className="text-muted-foreground">Manage user accounts and their subscription details</p>
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{mockUsers.length}</div>
              <p className="text-xs text-success">{activeUsers} active users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">from all users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-card-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Revenue/User</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${avgRevenuePerUser.toFixed(2)}</div>
              <p className="text-xs text-success">+12.5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card className="bg-gradient-card border-card-border shadow-card">
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Subscription Status</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.subscription.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.subscription.type} - ${user.subscription.amount}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSubscriptionStatusColor(user.subscription.status)}>
                        {user.subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${user.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {selectedUser.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-muted-foreground">{selectedUser.phone}</p>
                  </div>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>

                {/* Subscription Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Current Subscription</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium">{selectedUser.subscription.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{selectedUser.subscription.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">${selectedUser.subscription.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getSubscriptionStatusColor(selectedUser.subscription.status)}>
                          {selectedUser.subscription.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Account Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Join Date:</span>
                        <span className="font-medium">{selectedUser.joinDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="font-medium">{selectedUser.subscription.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Billing:</span>
                        <span className="font-medium">
                          {selectedUser.subscription.nextBilling || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="font-medium text-success">
                          ${selectedUser.totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button variant="admin-secondary">Edit User</Button>
                  <Button variant="admin-primary">Manage Subscription</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Users;