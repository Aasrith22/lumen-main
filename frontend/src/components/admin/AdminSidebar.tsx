import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Package,
  TrendingUp,
  Bell,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  
  { name: "Users", href: "/users", icon: Users },
  { name: "Plans", href: "/plans", icon: Package },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  
  
  
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar shadow-elevated">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">L</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg">Lumen</h1>
            <p className="text-sidebar-foreground/70 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-accent-foreground text-sm font-medium">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sidebar-foreground text-sm font-medium">Admin User</p>
            <p className="text-sidebar-foreground/70 text-xs">admin@lumen.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};