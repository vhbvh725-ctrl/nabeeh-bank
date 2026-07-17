import { useState } from 'react';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { DashboardLayout } from '../../components/dashboard-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  User, Camera, Fingerprint, Bell, Lock, Eye, Shield, Globe, HelpCircle,
  MessageCircle, ChevronRight, Sun, Moon, Star, CheckCircle2, Sparkles,
  Phone, Mail, MapPin, LogOut, Trash2, BrainCircuit, PenTool, CreditCard,
  Smartphone, KeyRound, Activity, Award
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../../lib/auth-store';
import { toast } from 'sonner';

// ─── Settings Row ─────────────────────────────────────────────────────────────
function Row({ icon: Icon, iconColor, label, value, onClick, danger = false, toggle, checked, onCheckedChange, badge }: {
  icon: any; iconColor: string; label: string; value?: string; onClick?: () => void;
  danger?: boolean; toggle?: boolean; checked?: boolean; onCheckedChange?: (v: boolean) => void; badge?: string;
}) {
  const iconBg: Record<string, string> = {
    gold:'bg-primary/12 border-primary/20', blue:'bg-blue-500/12 border-blue-500/20', emerald:'bg-emerald-500/12 border-emerald-500/20',
    red:'bg-red-500/12 border-red-500/20', purple:'bg-purple-500/12 border-purple-500/20', cyan:'bg-cyan-500/12 border-cyan-500/20',
    amber:'bg-amber-500/12 border-amber-500/20', indigo:'bg-indigo-500/12 border-indigo-500/20',
  };
  const iconText: Record<string, string> = {
    gold:'text-primary', blue:'text-blue-400', emerald:'text-emerald-400', red:'text-red-400',
    purple:'text-purple-400', cyan:'text-cyan-400', amber:'text-amber-400', indigo:'text-indigo-400',
  };
  return (
    <motion.div
      whileHover={!toggle ? { backgroundColor: 'rgba(255,255,255,0.025)' } : {}}
      whileTap={!toggle ? { scale: 0.995 } : {}}
      onClick={!toggle ? onClick : undefined}
      className={`flex items-center gap-4 px-4 py-3.5 ${!toggle ? 'cursor-pointer' : ''} group transition-colors`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconBg[iconColor] ?? 'bg-white/5 border-white/10'}`}>
        <Icon className={`w-3.5 h-3.5 ${iconText[iconColor] ?? 'text-white'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        {value && <p className="text-xs text-muted-foreground/55 truncate mt-0.5">{value}</p>}
      </div>
      {badge && <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">{badge}</span>}
      {toggle && <Switch checked={checked} onCheckedChange={onCheckedChange} />}
      {!toggle && onClick && <ChevronRight className={`w-4 h-4 flex-shrink-0 ${danger ? 'text-red-400/50' : 'text-muted-foreground/30'} group-hover:${danger ? 'text-red-400/70' : 'text-primary/50'} transition-colors`} />}
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55 font-bold px-1 mb-2">{title}</p>
      <div className="glass-float rounded-2xl border border-white/7 card-premium overflow-hidden divide-y divide-white/[0.04]">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="relative group">
      <motion.div whileHover={{ scale: 1.04 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white border-2 border-primary/40 shadow-[0_0_30px_rgba(212,175,55,0.2)] cursor-pointer"
        style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.25),rgba(212,175,55,0.08))' }}>
        {initials}
      </motion.div>
      <motion.button whileTap={{ scale: 0.88 }} onClick={() => toast.info('Photo upload coming soon')}
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.4)] hover:bg-primary/90 transition-colors">
        <Camera className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useRequireAuth();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore(s => s.logout);

  const [biometric,    setBiometric]    = useState(true);
  const [notifications, setNotifications] = useState({ txn: true, bills: true, ai: true, fraud: true, goals: false });
  const [privacy,      setPrivacy]      = useState({ analytics: true, personalized: true });
  const [theme,        setTheme]        = useState<'dark' | 'light' | 'auto'>('dark');
  const [language,     setLanguage]     = useState<'en' | 'ar'>('en');
  const [twoFA,        setTwoFA]        = useState(true);

  const handleLogout = async () => {
    try { await logoutUser.mutateAsync(); } catch {}
    logout();
  };

  const name  = user?.fullName  ?? 'Ahmed Al-Rashid';
  const email = user?.email     ?? 'ahmed@nabeeh.bank';
  const phone = user?.phone     ?? '+966 50 000 0000';
  const firstName = name.split(' ')[0];

  return (
    <DashboardLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 pb-4 max-w-2xl mx-auto">

        {/* ── Profile Hero ── */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-3xl p-6 border border-white/8 card-premium relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.06),rgba(10,9,7,0.9))' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10 flex items-start gap-5">
            <Avatar name={name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white">{name}</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/25">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-bold">Verified</span>
                </div>
              </div>
              <p className="text-muted-foreground/70 text-sm mb-3">{email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                  <Star className="w-3 h-3" /> Ultra Member
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px]">
                  <Activity className="w-3 h-3" /> Health: 91/100
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px]">
                  Member since Jan 2026
                </span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative z-10 flex justify-between pt-5 mt-4 border-t border-white/[0.06]">
            {[['847', 'Transactions'], ['18%', 'Savings Rate'], ['Top 12%', 'Health Rank']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <p className="font-mono font-bold text-white text-base">{val}</p>
                <p className="text-[10px] text-muted-foreground/60">{lbl}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} className="space-y-4">

          {/* ── Personal Information ── */}
          <Section title="Personal Information">
            <Row icon={User}    iconColor="gold"    label="Full Name"    value={name}  onClick={() => toast.info('Name editing — coming soon')} />
            <Row icon={Mail}    iconColor="blue"    label="Email"        value={email} onClick={() => toast.info('Email editing — coming soon')} />
            <Row icon={Phone}   iconColor="emerald" label="Phone"        value={phone} onClick={() => toast.info('Phone editing — coming soon')} />
            <Row icon={MapPin}  iconColor="purple"  label="Address"      value="Riyadh, Saudi Arabia" onClick={() => toast.info('Address editing — coming soon')} />
          </Section>

          {/* ── Digital Identity ── */}
          <Section title="Digital Identity">
            <Row icon={Award}        iconColor="gold"   label="Identity Verified"   value="NID ending •••4821" badge="Verified" onClick={() => toast.info('Identity verification is complete')} />
            <Row icon={Fingerprint}  iconColor="blue"   label="Biometric Login"     toggle checked={biometric} onCheckedChange={setBiometric}
              value={biometric ? 'Face ID & Fingerprint enabled' : 'Biometrics disabled'} />
            <Row icon={PenTool}      iconColor="emerald" label="Digital Signature"  value="Certificate NB-SIG-2026-7731 · Active" onClick={() => toast.info('Opening signature vault')} />
            <Row icon={BrainCircuit} iconColor="purple"  label="Financial DNA"      value="Smart Saver · Low Risk · Budget Disciplined" onClick={() => toast.info('Viewing DNA profile')} />
          </Section>

          {/* ── Security ── */}
          <Section title="Security">
            <Row icon={KeyRound}   iconColor="gold"    label="Change PIN"        value="Last changed 3 months ago" onClick={() => toast.info('PIN change flow — coming soon')} />
            <Row icon={Shield}     iconColor="emerald" label="Two-Factor Auth"   toggle checked={twoFA} onCheckedChange={v => { setTwoFA(v); toast.success(v ? '2FA enabled' : '2FA disabled'); }} value={twoFA ? 'SMS + Authenticator App' : 'Disabled'} />
            <Row icon={Smartphone} iconColor="blue"    label="Active Sessions"   value="2 devices · This device + iPad" onClick={() => toast.info('Session manager — coming soon')} />
            <Row icon={Eye}        iconColor="cyan"    label="Login History"     value="Last login: Today 2:41 PM" onClick={() => toast.info('Viewing login history')} />
            <Row icon={CreditCard} iconColor="amber"   label="Manage Cards"      value="1 active card · •••• 8821" onClick={() => toast.info('Opening card management')} />
          </Section>

          {/* ── Notifications ── */}
          <Section title="Notifications">
            <Row icon={Bell}    iconColor="gold"    label="Transactions"   toggle checked={notifications.txn}   onCheckedChange={v => setNotifications(p => ({...p,txn:v}))}   value={notifications.txn   ? 'All transactions notify you' : 'Off'} />
            <Row icon={Bell}    iconColor="amber"   label="Bills & Dues"   toggle checked={notifications.bills} onCheckedChange={v => setNotifications(p => ({...p,bills:v}))} value={notifications.bills ? '24h before due date' : 'Off'} />
            <Row icon={Sparkles}iconColor="purple"  label="AI Insights"    toggle checked={notifications.ai}    onCheckedChange={v => setNotifications(p => ({...p,ai:v}))}    value={notifications.ai    ? 'Daily morning briefing' : 'Off'} />
            <Row icon={Shield}  iconColor="red"     label="Fraud Alerts"   toggle checked={notifications.fraud} onCheckedChange={v => setNotifications(p => ({...p,fraud:v}))} value="Critical · Always on" />
            <Row icon={Activity}iconColor="blue"    label="Goal Milestones" toggle checked={notifications.goals} onCheckedChange={v => setNotifications(p => ({...p,goals:v}))} value={notifications.goals ? 'When goals are reached' : 'Off'} />
          </Section>

          {/* ── Privacy ── */}
          <Section title="Privacy">
            <Row icon={Eye}    iconColor="blue"    label="Usage Analytics"     toggle checked={privacy.analytics}    onCheckedChange={v => setPrivacy(p => ({...p,analytics:v}))}    value={privacy.analytics    ? 'Help improve the app' : 'Off'} />
            <Row icon={Sparkles}iconColor="gold"   label="Personalized AI"    toggle checked={privacy.personalized} onCheckedChange={v => setPrivacy(p => ({...p,personalized:v}))} value={privacy.personalized ? 'AI learns your habits' : 'Off'} />
            <Row icon={Trash2} iconColor="red"     label="Clear Financial Data"  onClick={() => toast.error('This action cannot be undone — requires PIN confirmation')} />
          </Section>

          {/* ── Preferences ── */}
          <Section title="Preferences">
            {/* Theme */}
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary"/> : theme === 'light' ? <Sun className="w-3.5 h-3.5 text-primary"/> : <Sparkles className="w-3.5 h-3.5 text-primary"/>}
                </div>
                <p className="text-white text-sm font-medium flex-1">Theme</p>
              </div>
              <div className="flex gap-2">
                {(['dark','light','auto'] as const).map(t => (
                  <motion.button key={t} whileTap={{ scale: 0.93 }} onClick={() => { setTheme(t); toast.success(`${t.charAt(0).toUpperCase()+t.slice(1)} mode applied`); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${theme===t?'bg-primary text-black':'bg-white/5 border border-white/8 text-muted-foreground hover:text-white'}`}>
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Language */}
            <div className="px-4 py-3.5 border-t border-white/[0.04]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/12 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-white text-sm font-medium flex-1">Language</p>
              </div>
              <div className="flex gap-2">
                {[{key:'en',label:'English'},{key:'ar',label:'العربية'}].map(l => (
                  <motion.button key={l.key} whileTap={{ scale: 0.93 }} onClick={() => { setLanguage(l.key as 'en' | 'ar'); toast.success(`Language set to ${l.label}`); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${language===l.key?'bg-primary text-black':'bg-white/5 border border-white/8 text-muted-foreground hover:text-white'}`}>
                    {l.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Help & Support ── */}
          <Section title="Help & Support">
            <Row icon={HelpCircle}   iconColor="blue"   label="Help Center"     value="FAQs, guides, tutorials"     onClick={() => toast.info('Opening Help Center')} />
            <Row icon={MessageCircle}iconColor="emerald" label="Live Chat"      value="Average response: 2 min"      onClick={() => toast.success('Connecting to support agent…')} badge="Online" />
            <Row icon={Mail}         iconColor="gold"   label="Email Support"   value="support@nabeeh.bank"          onClick={() => toast.info('Opening email client')} />
            <Row icon={Activity}     iconColor="purple" label="System Status"   value="All systems operational · 99.9% uptime" onClick={() => toast.info('All systems are fully operational')} />
          </Section>

          {/* ── About ── */}
          <Section title="About">
            <Row icon={Sparkles} iconColor="gold"  label="Nabeeh Bank Ultra" value="Version 2.0.0 · Build 2026.07" onClick={() => toast.info('Nabeeh Bank V2 Ultra — The world\'s smartest AI banking experience')} />
            <Row icon={Lock}     iconColor="blue"  label="Privacy Policy"    value="Last updated June 2026" onClick={() => toast.info('Opening Privacy Policy')} />
            <Row icon={Shield}   iconColor="emerald" label="Terms of Service" value="Nabeeh Bank · Saudi Arabia"   onClick={() => toast.info('Opening Terms of Service')} />
          </Section>

          {/* ── Sign Out ── */}
          <motion.div variants={itemVariants}>
            <div className="space-y-2">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full py-3.5 rounded-2xl border border-red-500/20 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/8 transition-colors"
                style={{ background: 'rgba(239,68,68,0.04)' }}>
                <LogOut className="w-4 h-4" /> Sign Out
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                onClick={() => toast.error('Account deletion requires in-person verification at a Nabeeh branch.')}
                className="w-full py-3 rounded-2xl text-red-500/60 text-xs font-medium hover:text-red-400 transition-colors">
                Delete Account
              </motion.button>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
