import { useGetMe, useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { User, Mail, Phone, Shield, FileSignature, LogOut } from 'lucide-react';
import { useLogoutUser } from '@workspace/api-client-react';
import { useAuthStore } from '../../lib/auth-store';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useRequireAuth();
  const { data: spending } = useGetSpending();
  const logoutUser = useLogoutUser();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logoutUser.mutateAsync();
    logout();
  };

  const totalSpending = spending?.reduce((sum, item) => sum + item.amount, 0) || 1;

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto space-y-8"
      >
        <header>
          <h1 className="text-3xl font-bold text-white mb-1">Identity & DNA</h1>
          <p className="text-muted-foreground text-sm">Your secure profile and financial characteristics</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <motion.div variants={staggerContainer} className="md:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div variants={itemVariants} className="glass rounded-3xl p-6 border border-border/50 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{user?.fullName}</h2>
              <p className="text-muted-foreground text-sm mb-6">Ultra Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}</p>
              
              <div className="w-full space-y-4">
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

            {/* Signature Status */}
            <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${user?.hasSignature ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Digital Contract</h3>
                  <p className="text-xs text-muted-foreground">Authorized signature</p>
                </div>
              </div>
              {user?.hasSignature ? (
                <div className="bg-black/40 p-4 rounded-xl border border-primary/20 flex items-center justify-center h-24">
                  {user.signatureData ? (
                    <img src={user.signatureData} alt="Digital Signature" className="max-h-full max-w-full invert opacity-80 mix-blend-screen" />
                  ) : (
                    <p className="text-primary text-sm italic">Signature securely stored</p>
                  )}
                </div>
              ) : (
                <div className="bg-black/40 p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center h-24">
                  <p className="text-muted-foreground text-sm">No signature on file</p>
                </div>
              )}
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} className="md:col-span-2 space-y-6">
            {/* Security Status */}
            <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 border border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">Security Status</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">Your account is protected by military-grade encryption and biometric authentication requirements for all external transfers.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Two-Factor Auth</p>
                    <p className="text-emerald-400 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Login</p>
                    <p className="text-white font-medium">Just now (Current)</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial DNA */}
            <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 border border-border/50">
              <h3 className="text-xl font-bold text-white mb-6">Financial DNA</h3>
              
              <div className="space-y-6">
                {spending?.map((cat) => {
                  const percent = (cat.amount / totalSpending) * 100;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="capitalize">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-white">${cat.amount.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({percent.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
