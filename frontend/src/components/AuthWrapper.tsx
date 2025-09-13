import { useEffect, useState } from 'react';
import { LOGIN_URL } from '@/lib/auth';

interface User {
  fullname: string;
  email: string;
  role: string;
  _id: string;
}

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Step 1: Accept one-time auth handoff from login page via URL
        const params = new URLSearchParams(window.location.search);
        const authParam = params.get('auth');
        if (authParam) {
          try {
            const decoded = JSON.parse(decodeURIComponent(atob(authParam)));
            if (decoded && decoded.user && decoded.isLoggedIn) {
              localStorage.setItem('user', JSON.stringify(decoded.user));
              localStorage.setItem('isLoggedIn', 'true');
              // Clean the URL to remove the auth query to prevent re-processing
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (e) {
            console.warn('Invalid auth handoff payload');
          }
        }

        // Step 2: Validate localStorage state
        const userStr = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!userStr || !isLoggedIn) {
          // Redirect to login page - absolute URL to avoid base path issues
          if (isLoading) {
            window.location.replace(LOGIN_URL);
          }
          return;
        }

        const userData = JSON.parse(userStr);
        
        if (userData.role !== 'admin') {
          alert('Access denied. Admin privileges required.');
          localStorage.clear(); // Clear all storage
          window.location.replace(LOGIN_URL);
          return;
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
  console.error('Auth check error:', error);
  localStorage.clear(); // Clear corrupted data
  window.location.replace(LOGIN_URL);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run auth check once
    if (isLoading) {
      checkAuth();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden" id="user-data" data-user={JSON.stringify(user)}></div>
      {children}
    </div>
  );
};

export default AuthWrapper;