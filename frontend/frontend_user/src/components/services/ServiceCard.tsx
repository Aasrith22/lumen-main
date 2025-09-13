import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Router, Star, ArrowRight } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    type: 'Fibernet' | 'Broadband Copper';
    featured: boolean;
    plans: Array<{
      id: string;
      name: string;
      speed: string;
      quota: number;
      price: number;
    }>;
  };
  onExplore: (serviceId: string) => void;
}

const ServiceCard = ({ service, onExplore }: ServiceCardProps) => {
  const getServiceIcon = (type: string) => {
    return type === 'Fibernet' ? (
      <Wifi className="w-6 h-6 text-deep-blue" />
    ) : (
      <Router className="w-6 h-6 text-deep-blue" />
    );
  };

  const minPrice = Math.min(...service.plans.map(plan => plan.price));
  const maxSpeed = service.plans.reduce((max, plan) => {
    const speed = parseInt(plan.speed);
    return speed > max ? speed : max;
  }, 0);

  return (
    <Card className="card-hover relative overflow-hidden">
      {service.featured && (
        <div className="absolute top-0 right-0">
          <div className="bg-warning text-warning-foreground px-3 py-1 text-xs font-medium flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Popular</span>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-light-gray rounded-lg">
            {getServiceIcon(service.type)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-deep-blue">{service.name}</CardTitle>
            <CardDescription className="text-sm">
              {service.description}
            </CardDescription>
            <Badge variant="outline" className="mt-2 text-xs">
              {service.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Service Highlights */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-light-gray/50 rounded-lg p-3">
            <p className="text-muted-foreground">From</p>
            <p className="text-lg font-bold text-deep-blue">${minPrice}/mo</p>
          </div>
          <div className="bg-light-gray/50 rounded-lg p-3">
            <p className="text-muted-foreground">Up to</p>
            <p className="text-lg font-bold text-deep-blue">{maxSpeed} Mbps</p>
          </div>
        </div>

        {/* Available Plans Count */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            {service.plans.length} plans available
          </p>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onExplore(service.id)}
          className="w-full"
          variant="default"
        >
          Explore Plans
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;