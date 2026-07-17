import { useGetMe, useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { User, Mail, Phone, Shield, FileSignature, LogOut, Brain, Trophy, CheckCircle2 } from 'lucide-react';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../../lib/auth-store';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const dnaData = [
  { subject: 'Saving', A: 85, fullMark: 100 },
  { subject: 'Investing', A: 60, fullMark: 100 },
  { subject: 'Budgeting', A: 90, fullMark: 100 },
  { subject: 'Debt Mgmt', A: 75, fullMark: 100 },
  { subject: 'Planning', A: 70, fullMark: 100 },
];

export default function Profile() {
  const { user } = useRequireAuth();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logoutUser.mutateAsync();
    logout();
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-6xl mx-auto space-y-8"
      >
        <header>
          <h1 className="text-3xl font-bold text-white mb-1">Identity & DNA</h1>
          <p className="text-muted-foreground text-sm">Your secure profile and financial characteristics</p>
        </header>

        {/* Financial DNA */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold text-white mb-4">Your Financial DNA</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass p-5 rounded-2xl border-t-4 border-t-emerald-500">
              <Brain className="w-6 h-6 text-emerald-500 mb-3" />
              <h3 className="font-bold text-white text-sm mb-1">Smart Saver</h3>
              <p className="text-xs text-muted-foreground">You consistently save 18% of your monthly income.</p>
            </div>
            <div className="glass p-5 rounded-2xl border-t-4 border-t-blue-500">
              <Shield className="w-6 h-6 text-blue-500 mb-3" />
              <h3 className="font-bold text-white text-sm mb-1">Low Risk Investor</h3>
              <p className="text-xs text-muted-foreground">You prefer stable, guaranteed returns over high volatility.</p>
            </div>
            <div className="glass p-5 rounded-2xl border-t-4 border-t-primary">
              <Trophy className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold text-white text-sm mb-1">Budget Champion</h3>
              <p className="text-xs text-muted-foreground">Your expense-to-income ratio is in the top 5% of members.</p>
            </div>
          </div>
          
          <div className="glass rounded-3xl p-6 h-[400px] border border-border/50">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="DNA" dataKey="A" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenges */}
          <motion.div variants={staggerContainer} className="space-y-4">
            <h2 className="text-xl font-bold text-white">Active Challenges</h2>
            
            <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-white text-sm">Save 100 SAR this week</h3>
                  <p className="text-xs text-muted-foreground mt-1">Reward: Gold Badge</p>
                </div>
                <span className="font-mono text-sm text-white">65 / 100 SAR</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-primary/30 relative overflow-hidden bg-primary/5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white text-sm mb-1 line-through opacity-70">Zero impulse purchases (3 days)</h3>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary font-bold">COMPLETED • Claimed</span>
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-white text-sm">Review all subscriptions</h3>
                  <p className="text-xs text-muted-foreground mt-1">Reward: Silver Badge</p>
                </div>
                <span className="text-xs text-muted-foreground">Not started</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-white/20" style={{ width: '0%' }} />
              </div>
            </motion.div>
          </motion.div>

          {/* Identity Info */}
          <motion.div variants={staggerContainer} className="space-y-6">
            <motion.div variants={itemVariants} className="glass rounded-3xl p-6 border border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                  <p className="text-muted-foreground text-xs">Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-white/90 truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-white/90 truncate">{user?.phone}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full mt-6 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" /> End Session
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-3xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Digital Signature</h3>
                  <p className="text-xs text-muted-foreground">Used for digital contracts</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[120px] relative">
                {user?.signatureData ? (
                  <>
                    <img src={user.signatureData} alt="Digital Signature" className="max-h-[80px] max-w-full invert opacity-80 mix-blend-screen drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">Verified</div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No signature recorded</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
