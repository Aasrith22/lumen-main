import { Button } from "@/components/ui/button";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCurrentUser, logout } from "@/lib/auth";
import { useEffect, useState } from "react";

export const AdminHeader = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="h-16 bg-primary border-b border-border flex items-center justify-between px-6 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users, plans, subscriptions..."
            className="pl-9 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/70 focus:bg-background/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Settings className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="text-primary-foreground hover:bg-red-500/20 hover:text-red-100"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        
        {/* Admin Profile */}
        <div className="flex items-center gap-2 ml-3 pl-3 border-l border-primary-foreground/20">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.fullname?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-primary-foreground text-sm font-medium">
              {user?.fullname || 'Admin'}
            </p>
            <p className="text-primary-foreground/70 text-xs">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};