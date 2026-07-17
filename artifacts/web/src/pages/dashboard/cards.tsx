import { useState } from 'react';
import { useGetCards, useToggleCardFreeze } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { CreditCard, Snowflake, Settings, Eye, EyeOff, ShieldCheck, ArrowRightLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function FraudModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [processingItems, setProcessingItems] = useState<boolean[]>([false, false, false, false]);

  if (!isOpen) return null;

  const handleConfirmFraud = () => {
    setStep(3);
    const delays = [0, 600, 1200, 1800];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setProcessingItems(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, delay);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-3xl border border-red-500/30 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-gradient-to-b from-red-950/40 to-black"
      >
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Security Alert</h2>
                <p className="text-white/80 mb-8">Are you the person who requested a withdrawal of <span className="font-mono text-red-400 font-bold">50,000 SAR</span> from your account?</p>
                <div className="space-y-3">
                  <button onClick={() => { toast.success("Verified successfully."); onClose(); setStep(1); }} className="w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                    Yes, that was me
                  </button>
                  <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20 transition-colors font-medium">
                    No, that was NOT me
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <h2 className="text-xl font-bold text-white mb-4">Confirm Unauthorized Activity</h2>
                <p className="text-white/70 text-sm mb-8">Confirming will immediately freeze your card and file a formal fraud report with Nabeeh Security.</p>
                <div className="space-y-3">
                  <button onClick={handleConfirmFraud} className="w-full py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-bold shadow-lg shadow-red-500/20">
                    Confirm Fraud
                  </button>
                  <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-4 text-left mb-8 max-w-[240px] mx-auto">
                  {[
                    "Card frozen successfully",
                    "Fraud report filed",
                    "Branch notified",
                    "Replacement card requested"
                  ].map((text, i) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${processingItems[i] ? 'bg-primary text-black' : 'bg-white/10 text-transparent'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className={`text-sm transition-colors duration-300 ${processingItems[i] ? 'text-white' : 'text-white/40'}`}>{text}</span>
                    </div>
                  ))}
                </div>
                {processingItems[3] && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-lg font-bold text-primary mb-6">Your account is now secure.</p>
                    <button onClick={() => { onClose(); setTimeout(() => setStep(1), 500); setProcessingItems([false,false,false,false]); }} className="w-full py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium">
                      Done
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function BeforeYouPayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl border border-border overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" /> Before You Pay
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">Transfer Amount</p>
            <p className="text-3xl font-mono font-bold text-white">5,000 <span className="text-sm font-sans font-normal text-muted-foreground">SAR</span></p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <p className="text-amber-500 font-medium text-sm mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Low Balance Warning</p>
            <p className="text-white/80 text-sm leading-relaxed">
              After this transaction you will have <span className="font-mono text-white font-bold">820 SAR</span> remaining until your next salary date in <span className="font-bold text-white">9 days</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium text-sm">
              Cancel
            </button>
            <button onClick={() => { toast.success("Transfer initiated securely"); onClose(); }} className="py-3 rounded-xl bg-primary text-black hover:bg-primary/90 transition-colors font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] text-sm">
              Continue Transfer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Cards() {
  const { user } = useRequireAuth();
  const queryClient = useQueryClient();
  const { data: cards, isLoading } = useGetCards();
  const toggleFreezeMutation = useToggleCardFreeze();
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [payModalOpen, setPayModalOpen] = useState(false);

  const handleToggleFreeze = async (id: string, currentlyFrozen: boolean) => {
    try {
      await toggleFreezeMutation.mutateAsync({ id, data: { frozen: !currentlyFrozen } });
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast.success(currentlyFrozen ? 'Card unfrozen successfully' : 'Card frozen securely');
    } catch (error) {
      toast.error('Failed to update card status');
    }
  };

  const toggleNumberVisibility = (id: string) => {
    setShowNumbers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BeforeYouPayModal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} />
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Cards</h1>
          <p className="text-muted-foreground text-sm">Manage your physical and virtual cards</p>
        </header>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards?.map((card) => {
            const isVisible = showNumbers[card.id];
            
            return (
              <motion.div key={card.id} variants={itemVariants} className="space-y-4">
                {/* The Card Graphic */}
                <div className={`relative h-56 rounded-3xl p-6 flex flex-col justify-between overflow-hidden border transition-all duration-500 ${
                  card.isFrozen 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 opacity-80' 
                    : card.type === 'mastercard' 
                      ? 'bg-gradient-to-br from-zinc-900 to-black border-primary/30 shadow-[0_0_30px_rgba(212,175,55,0.08)]' 
                      : 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.08)]'
                }`}>
                  
                  {card.isFrozen && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <div className="bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700">
                        <Snowflake className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-100 uppercase tracking-widest">Frozen</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start z-0">
                    <div className="w-12 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center">
                      <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-200/50 to-yellow-600/50 border border-yellow-500/50"></div>
                    </div>
                    <div className="font-bold tracking-widest text-xl text-white/80 uppercase italic">
                      {card.type}
                    </div>
                  </div>
                  
                  <div className="z-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xl md:text-2xl tracking-[0.2em] text-white">
                        {isVisible ? card.number : `•••• •••• •••• ${card.number.slice(-4)}`}
                      </p>
                      <button 
                        onClick={() => toggleNumberVisibility(card.id)}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end text-sm text-white/70 uppercase tracking-wider">
                      <div>
                        <p className="text-[10px] text-white/50 mb-1">Card Holder</p>
                        <p className="font-medium text-xs">{card.holderName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 mb-1">Valid Thru</p>
                        <p className="font-medium text-xs">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPayModalOpen(true)} className="glass py-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" /> Simulate Transfer
                  </button>
                  <div className="glass rounded-xl px-4 flex items-center justify-between border border-border/50">
                    <Label htmlFor={`freeze-${card.id}`} className="text-white text-sm font-medium cursor-pointer">Freeze Card</Label>
                    <Switch 
                      id={`freeze-${card.id}`} 
                      checked={card.isFrozen}
                      disabled={toggleFreezeMutation.isPending}
                      onCheckedChange={() => handleToggleFreeze(card.id, card.isFrozen)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
