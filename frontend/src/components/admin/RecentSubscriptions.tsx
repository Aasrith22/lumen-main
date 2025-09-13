import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentSubscriptions = [
  {
    id: "1",
    user: "John Smith",
    email: "john.smith@email.com",
    plan: "Fibernet Premium",
    status: "active",
    amount: "$89.99",
    date: "2 hours ago",
  },
  {
    id: "2", 
    user: "Sarah Johnson",
    email: "sarah.j@email.com",
    plan: "Broadband Copper",
    status: "pending",
    amount: "$49.99",
    date: "4 hours ago",
  },
  {
    id: "3",
    user: "Mike Davis",
    email: "mike.davis@email.com", 
    plan: "Fibernet Basic",
    status: "active",
    amount: "$59.99",
    date: "6 hours ago",
  },
  {
    id: "4",
    user: "Emily Wilson",
    email: "emily.w@email.com",
    plan: "Fibernet Premium",
    status: "cancelled",
    amount: "$89.99",
    date: "8 hours ago",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-success text-success-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    case "cancelled":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const RecentSubscriptions = () => {
  return (
    <Card className="bg-gradient-card border-card-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSubscriptions.map((subscription) => (
          <div key={subscription.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {subscription.user.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{subscription.user}</p>
                <span className="text-sm font-medium text-foreground">{subscription.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{subscription.email}</p>
                <span className="text-xs text-muted-foreground">{subscription.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{subscription.plan}</span>
                <Badge className={getStatusColor(subscription.status)} variant="secondary">
                  {subscription.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};