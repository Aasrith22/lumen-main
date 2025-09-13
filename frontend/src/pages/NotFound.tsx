import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AdminLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-warning" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <h2 className="text-xl font-medium text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="flex justify-center gap-3">
            <Button variant="admin-primary" asChild>
              <a href="/">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotFound;
