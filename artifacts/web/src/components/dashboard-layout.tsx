import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  CreditCard, Home, BarChart3, Sparkles, User, LogOut,
  FileBadge, Bell, Landmark, X, CheckCircle2, AlertTriangle,
  TrendingUp, ShieldCheck
} from 'lucide-react';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../lib/auth-store';

const navItems = [
  { icon: Home,     label: 'Home',     shortLabel: 'Home',    href: '/dashboard'              },
  { icon: BarChart3,label: 'Analytics',shortLabel: 'Stats',   href: '/dashboard/transactions' },
  { icon: Landmark, label: 'Banking',  shortLabel: 'Bank',    href: '/dashboard/banking'      },
  { icon: CreditCard,label:'Cards',   shortLabel: 'Cards',   href: '/dashboard/cards'        },
  { icon: Sparkles, label: 'Nabeh AI', shortLabel: 'AI',      href: '/dashboard/ai'           },
  { icon: FileBadge,label: 'Documents',shortLabel: 'Docs',   href: '/dashboard/contracts'    },
  { icon: User,     label: 'Profile',  shortLabel: 'Me',      href: '/dashboard/profile'      },
];

// Mobile shows the most important 5
const mobileNav = [
  { icon: Home,      label: 'Home',    shortLabel: 'Home',  href: '/dashboard'              },
  { icon: BarChart3, label: 'Analytics',shortLabel:'Stats', href: '/dashboard/transactions' },
  { icon: Landmark,  label: 'Banking', shortLabel: 'Bank',  href: '/dashboard/banking'      },
  { icon: Sparkles,  label: 'Nabeh AI',shortLabel: 'AI',   href: '/dashboard/ai'           },
  { icon: User,      label: 'Profile', shortLabel: 'Me',    href: '/dashboard/profile'      },
];

const NOTIFICATIONS = [
  { id: '1', icon: ShieldCheck, color: 'emerald', title: 'Fraud scan complete', body: '847 transactions verified · 0 threats', time: 'Just now', read: false },
  { id: '2', icon: TrendingUp,  color: 'primary', title: 'AI Insight ready',   body: 'Gold prices are currently attractive (+3.2%)', time: '2m ago', read: false },
  { id: '3', icon: AlertTriangle,color:'amber',   title: 'Bill due tomorrow',  body: 'Internet Bill · SAR 199 · STC Broadband', time: '1h ago', read: true  },
  { id: '4', icon: CheckCircle2,color: 'blue',   title: 'Goal milestone',     body: 'Emergency Fund reached 85% — keep going!', time: '3h ago', read: true  },
];

type NColor = 'emerald' | 'primary' | 'amber' | 'blue';
const nBg:  Record<NColor, string> = { emerald:'bg-emerald-500/15 border-emerald-500/25', primary:'bg-primary/15 border-primary/25', amber:'bg-amber-500/15 border-amber-500/25', blue:'bg-blue-500/15 border-blue-500/25' };
const nTxt: Record<NColor, string> = { emerald:'text-emerald-400', primary:'text-primary', amber:'text-amber-400', blue:'text-blue-400' };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore(s => s.logout);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try { await logoutUser.mutateAsync(); } catch {}
    logout();
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row overflow-hidden">

      {/* ──────────── Desktop Sidebar ──────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0"
        style={{ background: 'rgba(7,6,4,0.92)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.045)' }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary/18 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-primary/6 blur-md -z-10" />
            </div>
            <div>
              <p className="font-bold text-[15px] gold-gradient-text tracking-wide leading-none">Nabeeh</p>
              <p className="text-[10px] text-muted-foreground/45 uppercase tracking-[0.22em] mt-0.5">Ultra Banking</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
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
                    <motion.div layoutId="sidebar-pill"
                      className="absolute inset-0 rounded-xl border border-primary/18"
                      style={{ background: 'rgba(212,175,55,0.07)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 42 }}
                    />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                    isActive ? 'bg-primary/15 shadow-[0_0_12px_rgba(212,175,55,0.15)]' : 'bg-white/[0.04] group-hover:bg-white/[0.07]'
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
          <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-red-500/10 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* ──────────── Mobile Top Header ──────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40"
        style={{ background: 'rgba(7,6,4,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/18 border border-primary/40 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm gold-gradient-text">Nabeeh Ultra</span>
          </div>

          {/* Notification Bell */}
          <motion.button whileTap={{ scale: 0.86 }} onClick={() => setNotifOpen(o => !o)}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center relative"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unread > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[8px] font-bold text-black shadow-[0_0_6px_rgba(212,175,55,0.7)]">
                {unread}
              </motion.span>
            )}
          </motion.button>
        </div>
      </header>

      {/* ──────────── Notification Panel ──────────── */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]" onClick={() => setNotifOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="fixed top-14 right-4 z-[70] w-80 glass-float rounded-2xl border border-white/9 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              style={{ background: 'rgba(10,9,7,0.97)' }}>

              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                  <p className="text-white font-semibold text-sm">Notifications</p>
                  {unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{unread}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && <button onClick={markAllRead} className="text-[10px] text-primary/80 hover:text-primary transition-colors font-semibold">Mark all read</button>}
                  <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.map(n => (
                  <motion.div key={n.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors ${!n.read ? 'bg-white/[0.015]' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${nBg[n.color as NColor]}`}>
                      <n.icon className={`w-3.5 h-3.5 ${nTxt[n.color as NColor]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                        <span className="text-muted-foreground/50 text-[10px] flex-shrink-0 mt-0.5">{n.time}</span>
                      </div>
                      <p className="text-muted-foreground/60 text-[11px] leading-snug mt-0.5 truncate">{n.body}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_4px_rgba(212,175,55,0.7)]" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────── Main Content ──────────── */}
      <main className="flex-1 flex flex-col min-h-[100dvh] overflow-x-hidden relative">
        {/* Desktop notification bell (top-right of content area) */}
        <div className="hidden md:flex absolute top-5 right-8 z-30">
          <div className="relative">
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setNotifOpen(o => !o)}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Bell className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
              {unread > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[8px] font-bold text-black">
                  {unread}
                </motion.span>
              )}
            </motion.button>
            {/* Desktop notification panel */}
            <AnimatePresence>
              {notifOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[20]" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute right-0 top-11 z-[30] w-80 glass-float rounded-2xl border border-white/9 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                    style={{ background: 'rgba(10,9,7,0.97)' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-primary" />
                        <p className="text-white font-semibold text-sm">Notifications</p>
                        {unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{unread}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {unread > 0 && <button onClick={markAllRead} className="text-[10px] text-primary/80 hover:text-primary transition-colors font-semibold">Mark all read</button>}
                        <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.map(n => (
                        <motion.div key={n.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors ${!n.read ? 'bg-white/[0.015]' : ''}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${nBg[n.color as NColor]}`}>
                            <n.icon className={`w-3.5 h-3.5 ${nTxt[n.color as NColor]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                              <span className="text-muted-foreground/50 text-[10px] flex-shrink-0 mt-0.5">{n.time}</span>
                            </div>
                            <p className="text-muted-foreground/60 text-[11px] leading-snug mt-0.5 truncate">{n.body}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_4px_rgba(212,175,55,0.7)]" />}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-7xl mx-auto px-4 pt-16 pb-32 md:pt-10 md:px-8 md:pb-12 custom-scrollbar"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ──────────── Mobile Floating Island Nav ──────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))', paddingLeft: 10, paddingRight: 10 }}>
        <div className="glass-float rounded-2xl px-1 py-1"
          style={{ boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-around">
            {mobileNav.map((item) => {
              const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
                  <motion.div whileTap={{ scale: 0.80 }} transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                    className="relative flex flex-col items-center min-w-[44px] select-none">
                    {isActive && (
                      <motion.div layoutId="mobile-active"
                        className="absolute inset-0 rounded-xl border border-primary/22 shadow-[0_0_14px_rgba(212,175,55,0.1)]"
                        style={{ background: 'rgba(212,175,55,0.11)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <div className={`relative z-10 flex flex-col items-center gap-0.5 py-2 px-2 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/55'
                    }`}>
                      <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.7} />
                      <AnimatePresence>
                        {isActive && (
                          <motion.span key="label"
                            initial={{ opacity: 0, y: 3, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 2, scale: 0.85 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap">
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
