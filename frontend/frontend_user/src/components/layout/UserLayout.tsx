import { ReactNode } from "react";
import Navbar from "./Navbar";

interface UserLayoutProps {
  children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
  const handleLogout = () => {
    // Clear user data and redirect to login
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="user" onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};