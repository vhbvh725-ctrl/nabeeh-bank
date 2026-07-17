import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  CreditCard,
  Home,
  BarChart3,
  Sparkles,
  User,
  LogOut,
  FileText,
  Bell,
} from 'lucide-react';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../lib/auth-store';

const navItems = [
  { icon: Home,       label: 'Home',      shortLabel: 'Home',  href: '/dashboard' },
  { icon: BarChart3,  label: 'Analytics', shortLabel: 'Stats', href: '/dashboard/transactions' },
  { icon: CreditCard, label: 'Cards',     shortLabel: 'Cards', href: '/dashboard/cards' },
  { icon: Sparkles,   label: 'Nabeh AI',  shortLabel: 'AI',    href: '/dashboard/ai' },
  { icon: FileText,   label: 'Documents', shortLabel: 'Docs',  href: '/dashboard/contracts' },
  { icon: User,       label: 'Profile',   shortLabel: 'Me',    href: '/dashboard/profile' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try { await logoutUser.mutateAsync(); } catch {}
    logout();
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row overflow-hidden">

      {/* ──────────────── Desktop Sidebar ──────────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0"
        style={{ background: 'rgba(8,7,5,0.88)', backdropFilter: 'blur(32px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-primary/8 blur-md -z-10" />
            </div>
            <div>
              <p className="font-bold text-[15px] gold-gradient-text tracking-wide leading-none">Nabeeh</p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] mt-1">Ultra Banking</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-white/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-pill"
                      className="absolute inset-0 rounded-xl border border-primary/20"
                      style={{ background: 'rgba(212,175,55,0.08)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 42 }}
                    />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/15 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                      : 'bg-white/[0.04] group-hover:bg-white/[0.07]'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="relative z-10 font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sign-out */}
        <div className="p-3 pb-6 border-t border-white/[0.04]">
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-red-500/10 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* ──────────────── Mobile Top Header ──────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40"
        style={{ background: 'rgba(7,6,4,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm gold-gradient-text">Nabeeh Ultra</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center relative"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(212,175,55,0.8)]" />
          </motion.button>
        </div>
      </header>

      {/* ──────────────── Main Content ──────────────── */}
      <main className="flex-1 flex flex-col min-h-[100dvh] overflow-x-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-7xl mx-auto px-4 pt-16 pb-32 md:pt-8 md:px-8 md:pb-10 custom-scrollbar"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ──────────────── Mobile Bottom Nav (Floating Island) ──────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', paddingLeft: 12, paddingRight: 12 }}>
        <div className="glass-float rounded-2xl px-1 py-1.5">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
                  <motion.div
                    whileTap={{ scale: 0.82 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                    className="relative flex flex-col items-center min-w-[44px] select-none"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active"
                        className="absolute inset-0 rounded-xl border border-primary/25 shadow-[0_0_14px_rgba(212,175,55,0.12)]"
                        style={{ background: 'rgba(212,175,55,0.12)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <div className={`relative z-10 flex flex-col items-center gap-0.5 py-2 px-2 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/60'
                    }`}>
                      <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0, y: 3, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 2, scale: 0.85 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="text-[8.5px] font-bold uppercase tracking-widest leading-none whitespace-nowrap"
                          >
                            {item.shortLabel}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
