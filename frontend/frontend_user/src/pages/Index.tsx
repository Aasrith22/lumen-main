import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Dashboard from "@/components/dashboard/Dashboard";
// Update the import path if necessary, for example:
import { LOGIN_URL } from "../lib/auth";
// Or create 'src/lib/auth.ts' and export LOGIN_URL if it doesn't exist.

const Index = () => {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);

  // Accept one-time auth handoff similar to admin app
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth');
      if (authParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(authParam)));
          if (decoded && decoded.user && decoded.isLoggedIn) {
            localStorage.setItem('user', JSON.stringify(decoded.user));
            localStorage.setItem('isLoggedIn', 'true');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch {}
      }

      const userStr = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!userStr || !isLoggedIn) {
        window.location.replace(LOGIN_URL);
        return;
      }
      const user = JSON.parse(userStr);
      setUserType(user.role === 'admin' ? 'admin' : 'user');
    } catch {
      window.location.replace(LOGIN_URL);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    window.location.replace(LOGIN_URL);
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={userType} onLogout={handleLogout} />
      <Dashboard userType={userType} />
    </div>
  );
};

export default Index;
// import { useState } from "react";
// import LoginForm from "@/components/auth/LoginForm";
// import Navbar from "@/components/layout/Navbar";
// import Dashboard from "@/components/dashboard/Dashboard";

// const Index = () => {
//   const [user, setUser] = useState<{ type: 'user' | 'admin' } | null>(null);

//   const handleLogin = (userType: 'user' | 'admin') => {
//     setUser({ type: userType });
//   };

//   const handleLogout = () => {
//     setUser(null);
//   };

//   if (!user) {
//     return <LoginForm onLogin={handleLogin} />;
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar userType={user.type} onLogout={handleLogout} />
//       <Dashboard userType={user.type} />
//     </div>
//   );
// };

// export default Index;
