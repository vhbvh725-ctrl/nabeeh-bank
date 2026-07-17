import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { FileText, Shield, CheckCircle2, Clock, Upload, PenTool, FileBadge, ChevronRight, Lock } from 'lucide-react';
import { useSignatureCanvas } from '../../hooks/use-signature-canvas';
import { toast } from 'sonner';

function SignatureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const { canvasRef, startDrawing, draw, stopDrawing, clear, hasSignature } = useSignatureCanvas();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && step === 2 && mode === 'draw') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
  }, [isOpen, step, mode]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === 'draw' && !hasSignature) return;
    setStep(3);
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 2400);
  };

  const handleDone = () => {
    toast.success('Contract signed successfully');
    onClose();
    setTimeout(() => { setStep(1); setAgreed(false); clear(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        className="w-full max-w-lg glass-float rounded-t-3xl md:rounded-3xl border-t border-white/10 md:border overflow-hidden md:border-white/8"
        style={{ background: 'rgba(10,9,7,0.95)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="p-5 md:p-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Contract Review</h2>
                    <p className="text-muted-foreground text-xs">Read carefully before signing</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 p-4 h-44 overflow-y-auto custom-scrollbar text-sm space-y-3"
                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <p className="font-bold text-white text-sm">NABEEH BANK PERSONAL LOAN AGREEMENT</p>
                  <p className="text-white/60 leading-relaxed text-sm">This Agreement is entered into between Nabeeh Bank ("Lender") and the verified account holder ("Borrower").</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[['Amount', '25,000 SAR'], ['Rate', '3.5% APR'], ['Term', '12 Months'], ['Monthly', '2,145 SAR']].map(([k, v]) => (
                      <div key={k} className="bg-white/[0.04] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">{k}</p>
                        <p className="text-white text-sm font-mono font-bold">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">By signing this document electronically, you agree that your electronic signature holds the same legal standing as a handwritten signature under applicable law.</p>
                </div>

                <motion.label whileTap={{ scale: 0.98 }} className="flex items-center gap-3 cursor-pointer group">
                  <motion.div
                    animate={{ backgroundColor: agreed ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)' }}
                    className="w-5 h-5 rounded-md border border-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ borderColor: agreed ? 'hsl(var(--primary))' : undefined }}
                  >
                    {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </motion.div>
                  <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span className="text-sm text-white/80">I have read and agree to the terms</span>
                </motion.label>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                    className="py-3 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors">
                    Cancel
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)} disabled={!agreed}
                    className="py-3 rounded-xl bg-primary text-black text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-opacity">
                    Proceed to Sign
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-bold text-white">Sign Document</h2>

                <div className="flex p-1 rounded-xl border border-white/8 gap-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  {(['draw', 'upload'] as const).map((m) => (
                    <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setMode(m)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        mode === m ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
                      }`}>
                      {m === 'draw' ? <><PenTool className="w-3.5 h-3.5" /> Draw</> : <><Upload className="w-3.5 h-3.5" /> Upload</>}
                    </motion.button>
                  ))}
                </div>

                {mode === 'draw' ? (
                  <div className="space-y-2">
                    <div className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden touch-none h-44 relative shadow-inner">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-black/20 text-base italic font-medium">
                          Sign here
                        </div>
                      )}
                    </div>
                    <button onClick={clear} className="text-xs text-muted-foreground hover:text-white transition-colors float-right">Clear</button>
                    <div className="clear-both" />
                  </div>
                ) : (
                  <div className="h-44 rounded-2xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-colors">
                    <Upload className="w-7 h-7 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium text-white/70">Tap to upload image</p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">PNG or JPG</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                    className="py-3 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors">
                    Back
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={mode === 'draw' && !hasSignature}
                    className="py-3 rounded-xl bg-primary text-black text-sm font-bold disabled:opacity-40 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-opacity">
                    Submit Signature
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                {isVerifying ? (
                  <div className="space-y-5">
                    <div className="relative w-16 h-16 mx-auto">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-2 rounded-full border-t-2 border-primary/30 border-r-2 border-r-transparent border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1.5">Verifying signature…</p>
                      <p className="text-muted-foreground text-xs animate-pulse">Nabeh AI is validating your identity</p>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <div>
                      <p className="text-white font-bold text-lg mb-1">Verification Complete</p>
                      <p className="text-emerald-400 text-sm">Signature matches your profile</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleDone}
                      className="w-full py-3 rounded-xl bg-primary text-black font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                      Done
                    </motion.button>
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

const COMPLETED = [
  { title: 'Account Opening Agreement', date: 'Jan 15, 2026' },
  { title: 'Debit Card Agreement',       date: 'Jan 15, 2026' },
  { title: 'Online Banking Terms',        date: 'Feb 1, 2026'  },
];

export default function Contracts() {
  const { user } = useRequireAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  return (
    <DashboardLayout>
      <SignatureModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setHasSigned(true); }} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto space-y-5 pt-1">

        {/* Header */}
        <header>
          <div className="flex items-center gap-2 mb-1">
            <FileBadge className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-white">Documents</h1>
          </div>
          <p className="text-muted-foreground text-sm">Legally binding digital agreements</p>
        </header>

        {/* Pending contract */}
        {!hasSigned && (
          <motion.div variants={itemVariants}
            className="glass-float rounded-3xl p-5 border border-primary/25 card-premium relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(10,9,7,0.8) 100%)' }}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-semibold mb-1">Pending</p>
                <h2 className="text-xl font-bold text-white">Loan Agreement</h2>
                <p className="text-muted-foreground/70 text-xs mt-0.5">Nabeeh Bank Personal Loan · 12 months</p>
              </div>
              <div className="flex-shrink-0 bg-amber-500/10 border border-amber-500/25 text-amber-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Awaiting
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5 relative z-10">
              {[['Amount', '25,000 SAR'], ['Rate', '3.5% APR'], ['Term', '12 Months'], ['Monthly', '2,145 SAR']].map(([k, v]) => (
                <div key={k} className="bg-black/40 rounded-2xl p-3.5 border border-white/6">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">{k}</p>
                  <p className="font-mono text-white font-bold text-base">{v}</p>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="relative z-10 w-full py-4 rounded-2xl bg-primary text-black text-base font-bold flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_40px_rgba(212,175,55,0.35)] transition-shadow"
            >
              <PenTool className="w-4 h-4" /> Sign This Contract
            </motion.button>
          </motion.div>
        )}

        {/* Completed */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-3">
            <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
            <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-widest">Completed Agreements</h3>
          </div>
          <motion.div variants={staggerContainer} className="glass-float rounded-2xl border border-white/6 card-premium overflow-hidden divide-y divide-white/[0.04]">
            {COMPLETED.map((contract) => (
              <motion.div key={contract.title} variants={itemVariants}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-4 px-4 py-4 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate group-hover:text-primary/90 transition-colors">{contract.title}</p>
                    <p className="text-muted-foreground/60 text-xs">Signed: {contract.date}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="hidden sm:block px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Active</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
