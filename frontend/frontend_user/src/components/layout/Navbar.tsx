import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User, Shield } from "lucide-react";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { getNotifications, getUnreadCount, markAllRead, ensureSeed } from "../../lib/notifications";

interface NavbarProps {
  userType: 'user' | 'admin';
  onLogout: () => void;
}

const Navbar = ({ userType, onLogout }: NavbarProps) => {
  const [unread, setUnread] = useState<number>(getUnreadCount());
  const [notifications, setNotifications] = useState(getNotifications());

  useEffect(() => {
    // Ensure we have a couple of sample notifications so the menu isn't empty
    ensureSeed();
    const handler = () => {
      setNotifications(getNotifications());
      setUnread(getUnreadCount());
    };
    window.addEventListener("notifications-updated", handler as EventListener);
    return () => window.removeEventListener("notifications-updated", handler as EventListener);
  }, []);

  return (
    <nav className="navbar sticky top-0 z-50 border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <Link to="/" className="text-xl font-bold text-white hover:opacity-90">
                SubManager
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-white/20 text-white" : "text-white hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/my-services"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-white/20 text-white" : "text-white hover:bg-white/10 hover:text-white"
                }`
              }
            >
              My Services
            </NavLink>
            {userType === 'admin' && (
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                Admin Panel
              </Button>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 hover:text-white relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-accent-orange rounded-full text-[10px] flex items-center justify-center text-white">
                      {unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No notifications yet</div>
                ) : (
                  notifications
                    .slice()
                    .reverse()
                    .slice(0, 6)
                    .map((n) => (
                      <div key={n.id} className="px-3 py-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium leading-none">{n.title}</p>
                            {n.description && (
                              <p className="text-muted-foreground text-xs mt-1">{n.description}</p>
                            )}
                            <p className="text-muted-foreground text-[10px] mt-1">
                              {new Date(n.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-accent-orange" />}
                        </div>
                      </div>
                    ))
                )}
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          markAllRead();
                          setUnread(0);
                        }}
                      >
                        Mark all as read
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-white/20 text-white">
                      {userType === 'admin' ? 'A' : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {userType === 'admin' ? 'Administrator' : 'User Account'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userType}@example.com
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;