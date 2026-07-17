import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { FileText, Shield, CheckCircle2, Clock, Upload, PenTool } from 'lucide-react';
import { useSignatureCanvas } from '../../hooks/use-signature-canvas';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function SignatureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const { canvasRef, startDrawing, draw, stopDrawing, clear, getBase64, hasSignature } = useSignatureCanvas();
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-resize canvas on open
  useEffect(() => {
    if (isOpen && step === 2 && mode === 'draw') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [isOpen, step, mode]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === 'draw' && !hasSignature) return;
    
    setStep(3);
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  };

  const handleDone = () => {
    toast.success("Contract signed successfully");
    onClose();
    setTimeout(() => {
      setStep(1);
      setAgreed(false);
      clear();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass rounded-3xl border border-border overflow-hidden shadow-2xl bg-background"
      >
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" /> Contract Review
                </h2>
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 h-48 overflow-y-auto custom-scrollbar text-sm text-white/70 space-y-4">
                  <p className="font-bold text-white">NABEEH BANK PERSONAL LOAN AGREEMENT</p>
                  <p>This Agreement is entered into between Nabeeh Bank ("Lender") and the verified account holder ("Borrower").</p>
                  <p>1. LOAN AMOUNT: 25,000 SAR<br/>2. INTEREST RATE: 3.5% APR<br/>3. TERM: 12 Months<br/>4. MONTHLY PAYMENT: 2,145 SAR</p>
                  <p>By signing this document electronically, you agree that your electronic signature holds the same legal standing as a handwritten signature under applicable law.</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-primary border-primary text-black' : 'border-white/20 text-transparent group-hover:border-primary/50'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span className="text-sm text-white/90">I have read and agree to the terms and conditions</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">Cancel</button>
                  <button onClick={() => setStep(2)} disabled={!agreed} className="flex-1 py-3 rounded-xl bg-primary text-black hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">Proceed to Sign</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-bold text-white">Sign Document</h2>
                
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                  <button onClick={() => setMode('draw')} className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${mode === 'draw' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}>
                    <PenTool className="w-4 h-4" /> Draw
                  </button>
                  <button onClick={() => setMode('upload')} className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${mode === 'upload' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}>
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                </div>

                {mode === 'draw' ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl border-2 border-primary/20 overflow-hidden touch-none h-48 relative">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair"
                      />
                      {!hasSignature && <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-black/20 font-medium text-lg italic">Sign here</div>}
                    </div>
                    <div className="flex justify-end">
                      <button onClick={clear} className="text-xs text-muted-foreground hover:text-white transition-colors">Clear signature</button>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center bg-black/20 hover:bg-white/5 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-white mb-1">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">PNG or JPG (transparent background preferred)</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">Back</button>
                  <button onClick={handleSubmit} disabled={mode === 'draw' && !hasSignature} className="flex-1 py-3 rounded-xl bg-primary text-black hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    Submit Signature
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                {isVerifying ? (
                  <div className="space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white mb-2">Signature uploaded successfully.</p>
                      <p className="text-sm text-primary mb-1">Your contract is under review.</p>
                      <p className="text-xs text-muted-foreground animate-pulse">Nabeh AI is verifying your signature integrity...</p>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white mb-2">Verification Complete</p>
                      <p className="text-sm text-emerald-400">Signature matches your profile.</p>
                    </div>
                    <button onClick={handleDone} className="w-full py-3 rounded-xl bg-primary text-black hover:bg-primary/90 transition-colors font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
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

export default function Contracts() {
  const { user } = useRequireAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false); // mock local state for the demo

  return (
    <DashboardLayout>
      <SignatureModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setHasSigned(true); }} />
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto space-y-8"
      >
        <header>
          <h1 className="text-3xl font-bold text-white mb-1">Digital Contracts</h1>
          <p className="text-muted-foreground text-sm">Your legally binding digital agreements</p>
        </header>

        {/* Active Contract */}
        {!hasSigned && (
          <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 border border-primary/30 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Loan Agreement</h2>
                <p className="text-muted-foreground text-sm">Nabeeh Bank Personal Loan - 12 months</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" /> Awaiting Signature
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase">Amount</p>
                <p className="font-mono text-white font-bold text-lg">25,000 SAR</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase">Rate</p>
                <p className="font-mono text-white font-bold text-lg">3.5% APR</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase">Term</p>
                <p className="font-mono text-white font-bold text-lg">12 Months</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase">Monthly</p>
                <p className="font-mono text-white font-bold text-lg">2,145 SAR</p>
              </div>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="w-full py-4 rounded-2xl bg-primary text-black text-lg font-bold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3">
              <PenTool className="w-5 h-5" /> Sign This Contract
            </button>
          </motion.div>
        )}

        {/* Completed Contracts */}
        <motion.div variants={staggerContainer} className="space-y-4 pt-4">
          <h3 className="text-xl font-bold text-white mb-4">Completed Agreements</h3>
          
          {[
            { title: 'Account Opening Agreement', date: 'Jan 15, 2026' },
            { title: 'Debit Card Agreement', date: 'Jan 15, 2026' },
            { title: 'Online Banking Terms', date: 'Feb 1, 2026' },
          ].map((contract, i) => (
            <motion.div key={contract.title} variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-white/10">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{contract.title}</h4>
                  <p className="text-xs text-muted-foreground">Signed: {contract.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest font-bold">Active</span>
                <button className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">View PDF</button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
