import { useGetMe } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { User, Mail, Phone, Shield, FileSignature, LogOut, Brain, Trophy, CheckCircle2, Star, ChevronRight } from 'lucide-react';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../../lib/auth-store';
import { format } from 'date-fns';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const dnaData = [
  { subject: 'Saving',    A: 85, fullMark: 100 },
  { subject: 'Investing', A: 60, fullMark: 100 },
  { subject: 'Budgeting', A: 90, fullMark: 100 },
  { subject: 'Debt Mgmt', A: 75, fullMark: 100 },
  { subject: 'Planning',  A: 70, fullMark: 100 },
];

const DNA_BADGES = [
  { icon: Brain,  color: 'emerald', label: 'Smart Saver',      desc: 'Saves 18% of income consistently'  },
  { icon: Shield, color: 'blue',    label: 'Low Risk',          desc: 'Prefers stable guaranteed returns' },
  { icon: Trophy, color: 'primary', label: 'Budget Champion',   desc: 'Top 5% expense-to-income ratio'    },
];

const CHALLENGES = [
  { label: 'Save 100 SAR this week',        progress: 65, target: 100, unit: 'SAR', reward: 'Gold Badge',   done: false },
  { label: 'Zero impulse purchases (3 days)', progress: 3, target: 3,  unit: '',    reward: 'Claimed',       done: true  },
  { label: 'Review all subscriptions',       progress: 0,  target: 1,  unit: '',    reward: 'Silver Badge',  done: false },
];

export default function Profile() {
  const { user } = useRequireAuth();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try { await logoutUser.mutateAsync(); } catch {}
    logout();
  };

  return (
    <DashboardLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto space-y-5 pt-1">

        {/* Identity card */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-3xl p-5 border border-white/8 card-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <User className="w-8 h-8 text-primary" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{user?.fullName ?? '—'}</h2>
              <p className="text-muted-foreground text-xs">
                Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">Premium</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Verified</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 relative z-10">
            {[
              { icon: Mail,  value: user?.email },
              { icon: Phone, value: user?.phone },
            ].map(({ icon: Icon, value }) => (
              <motion.div key={value} whileHover={{ x: 2 }}
                className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.07] transition-colors px-3 py-2.5 rounded-xl border border-white/5 cursor-default">
                <Icon className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                <span className="text-sm text-white/80 truncate">{value ?? '—'}</span>
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full mt-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/8 transition-colors flex items-center justify-center gap-2 relative z-10"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </motion.button>
        </motion.div>

        {/* Financial DNA badges */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-widest px-1 mb-3">Financial DNA</h3>
          <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-3">
            {DNA_BADGES.map(({ icon: Icon, color, label, desc }) => (
              <motion.div key={label} variants={itemVariants} whileHover={{ y: -2 }}
                className={`glass-float rounded-2xl p-3.5 border card-premium flex flex-col gap-2 ${
                  color === 'primary' ? 'border-primary/20' : color === 'emerald' ? 'border-emerald-500/20' : 'border-blue-500/20'
                }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  color === 'primary' ? 'bg-primary/15' : color === 'emerald' ? 'bg-emerald-500/15' : 'bg-blue-500/15'
                }`}>
                  <Icon className={`w-4 h-4 ${color === 'primary' ? 'text-primary' : color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold leading-snug">{label}</p>
                  <p className="text-muted-foreground/70 text-[10px] leading-tight mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Radar chart */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-3xl p-5 border border-white/8 card-premium">
          <h3 className="text-sm font-semibold text-white mb-4">DNA Radar</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dnaData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="DNA" dataKey="A" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Challenges */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-3">
            <Star className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Active Challenges</h3>
          </div>
          <motion.div variants={staggerContainer} className="space-y-3">
            {CHALLENGES.map((ch) => (
              <motion.div key={ch.label} variants={itemVariants}
                className={`glass-float rounded-2xl p-4 border card-premium ${ch.done ? 'border-primary/20 bg-primary/5' : 'border-white/5'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className={`text-sm font-medium ${ch.done ? 'line-through opacity-50 text-white' : 'text-white'}`}>{ch.label}</p>
                  {ch.done
                    ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    : <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap flex-shrink-0">
                        {ch.progress}{ch.unit} / {ch.target}{ch.unit}
                      </span>
                  }
                </div>
                {ch.done ? (
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">Completed · {ch.reward}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ch.target > 0 ? (ch.progress / ch.target) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: ch.progress === 0 ? 'rgba(255,255,255,0.1)' : 'hsl(var(--primary))' }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">Reward: {ch.reward}</p>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Digital Signature */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-3xl p-5 border border-white/8 card-premium">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <FileSignature className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Digital Signature</h3>
              <p className="text-muted-foreground/70 text-xs">Used for secure contracts</p>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[100px] relative">
            {user?.signatureData ? (
              <>
                <img
                  src={user.signatureData}
                  alt="Digital Signature"
                  className="max-h-[70px] max-w-full opacity-80 mix-blend-screen drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  style={{ filter: 'invert(1) sepia(1) saturate(2) hue-rotate(10deg)' }}
                />
                <div className="absolute top-2 right-2 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </div>
              </>
            ) : (
              <p className="text-muted-foreground/50 text-sm italic">No signature recorded</p>
            )}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
