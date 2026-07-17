import { useState } from 'react';
import { useGetCards, useToggleCardFreeze } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { CreditCard, Snowflake, Settings, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Cards() {
  const { user } = useRequireAuth();
  const queryClient = useQueryClient();
  const { data: cards, isLoading } = useGetCards();
  const toggleFreezeMutation = useToggleCardFreeze();
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});

  const handleToggleFreeze = async (id: string, currentlyFrozen: boolean) => {
    try {
      await toggleFreezeMutation.mutateAsync({ 
        id, 
        data: { frozen: !currentlyFrozen } 
      });
      // Invalidate the cards query to reflect updated state
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
                <div className={`relative h-56 rounded-2xl p-6 flex flex-col justify-between overflow-hidden border transition-all duration-500 ${
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
                      {/* Simulating chip */}
                      <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-200/50 to-yellow-600/50 border border-yellow-500/50"></div>
                    </div>
                    <div className="font-bold tracking-widest text-xl text-white/80 uppercase">
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
                        <p className="font-medium">{card.holderName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 mb-1">Valid Thru</p>
                        <p className="font-medium">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="glass rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${card.isFrozen ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-muted-foreground'}`}>
                        <Snowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <Label htmlFor={`freeze-${card.id}`} className="text-white font-medium cursor-pointer">Freeze Card</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Temporarily disable transactions</p>
                      </div>
                    </div>
                    <Switch 
                      id={`freeze-${card.id}`} 
                      checked={card.isFrozen}
                      disabled={toggleFreezeMutation.isPending}
                      onCheckedChange={() => handleToggleFreeze(card.id, card.isFrozen)}
                    />
                  </div>
                  
                  <div className="h-[1px] w-full bg-border/50 my-2" />
                  
                  <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-white/5 text-muted-foreground">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Card Settings</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Limits, PIN, and security</p>
                      </div>
                    </div>
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
