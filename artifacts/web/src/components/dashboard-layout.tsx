import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { 
  CreditCard, 
  Home, 
  LineChart, 
  MessageSquare, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../lib/auth-store';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: LineChart, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: CreditCard, label: 'Cards', href: '/dashboard/cards' },
  { icon: Sparkles, label: 'Nabeh AI', href: '/dashboard/ai' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logoutUser.mutateAsync();
    logout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-border h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg gold-gradient-text tracking-wide">Nabeeh Ultra</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto relative">
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border z-50 px-2 py-3 flex justify-between items-center safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
