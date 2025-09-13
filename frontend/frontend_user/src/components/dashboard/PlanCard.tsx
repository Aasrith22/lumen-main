import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wifi, Zap, Clock } from "lucide-react";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    type: string;
    quota: number;
    speed: string;
    price: number;
    expiryDate: string;
    status: 'active' | 'expiring' | 'expired';
    daysLeft: number;
  };
  onViewDetails: (planId: string) => void;
}

const PlanCard = ({ plan, onViewDetails }: PlanCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'expiring':
        return 'bg-warning text-warning-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expiring':
        return 'Expiring Soon';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-deep-blue">{plan.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {plan.type}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(plan.status)}>
            {getStatusText(plan.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-deep-blue" />
            <div>
              <p className="text-sm text-muted-foreground">Data Quota</p>
              <p className="font-semibold">{plan.quota}GB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-deep-blue" />
            <div>
              <p className="text-sm text-muted-foreground">Speed</p>
              <p className="font-semibold">{plan.speed}</p>
            </div>
          </div>
        </div>

        {/* Expiry Info */}
        <div className="bg-light-gray/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-deep-blue" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Expires on</p>
              <p className="font-semibold">{plan.expiryDate}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {plan.daysLeft > 0 ? `${plan.daysLeft} days` : 'Expired'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Price</p>
            <p className="text-xl font-bold text-deep-blue">${plan.price}</p>
          </div>
          <Button 
            onClick={() => onViewDetails(plan.id)}
            variant={plan.status === 'expired' ? 'warning' : 'default'}
          >
            {plan.status === 'expired' ? 'Renew Plan' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;