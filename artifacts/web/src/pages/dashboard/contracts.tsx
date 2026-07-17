import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  FileText, Shield, CheckCircle2, Clock, Upload, PenTool,
  FileBadge, ChevronRight, Lock, Key, Fingerprint, BrainCircuit,
  Award, Send, Sparkles, Home, Car, CreditCard, UserCheck, ScrollText
} from 'lucide-react';
import { useSignatureCanvas } from '../../hooks/use-signature-canvas';
import { toast } from 'sonner';

// ─── Signature flow steps ─────────────────────────────────────────────────────
const FLOW_STEPS = [
  { icon: Key,          label: 'Encrypting Signature',    desc: 'AES-256 military-grade encryption applied',    color: '#D4AF37' },
  { icon: Fingerprint,  label: 'Identity Verification',   desc: 'Biometric profile matched — 99.7% confidence', color: '#3b82f6' },
  { icon: BrainCircuit, label: 'AI Validation',           desc: 'Nabeh AI authenticates your signature',         color: '#a855f7' },
  { icon: Award,        label: 'Digital Certificate',     desc: 'ISO 27001-compliant certificate issued',        color: '#10b981' },
  { icon: Send,         label: 'Contract Submitted',      desc: 'Securely transmitted to legal registry',        color: '#06b6d4' },
];

const SUPPORTED_USES = [
  { icon: CreditCard,  label: 'Loans'              },
  { icon: ScrollText,  label: 'Contracts'          },
  { icon: Home,        label: 'Government Forms'   },
  { icon: FileBadge,   label: 'Bank Agreements'    },
  { icon: UserCheck,   label: 'Profile Verification'},
];

// ─── Signature Modal ──────────────────────────────────────────────────────────
function SignatureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step,     setStep]     = useState<1 | 2 | 3>(1);
  const [agreed,   setAgreed]   = useState(false);
  const [mode,     setMode]     = useState<'draw' | 'upload'>('draw');
  const [flowStep, setFlowStep] = useState(-1);  // which step is active (-1 = none, 0-4 = steps)
  const [allDone,  setAllDone]  = useState(false);
  const { canvasRef, startDrawing, draw, stopDrawing, clear, hasSignature } = useSignatureCanvas();

  useEffect(() => {
    if (isOpen && step === 2 && mode === 'draw') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
  }, [isOpen, step, mode]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === 'draw' && !hasSignature) return;
    setStep(3);
    setFlowStep(0);
    // Stagger each step
    [0, 1, 2, 3, 4].forEach(i => {
      setTimeout(() => setFlowStep(i), i * 1100);
    });
    // All done after last step
    setTimeout(() => setAllDone(true), 4 * 1100 + 800);
  };

  const handleDone = () => {
    toast.success('Contract signed and stored securely');
    onClose();
    setTimeout(() => { setStep(1); setAgreed(false); setFlowStep(-1); setAllDone(false); clear(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="w-full max-w-lg glass-float rounded-t-3xl md:rounded-3xl border-t border-white/10 md:border md:border-white/8 overflow-hidden"
        style={{ background: 'rgba(10,9,7,0.97)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="p-5 md:p-7">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Contract Review ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Contract Review</h2>
                    <p className="text-muted-foreground/60 text-xs">Read carefully before signing</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 p-4 h-44 overflow-y-auto custom-scrollbar space-y-3"
                  style={{background:'rgba(0,0,0,0.4)'}}>
                  <p className="font-bold text-white text-sm">NABEEH BANK PERSONAL LOAN AGREEMENT</p>
                  <p className="text-white/60 leading-relaxed text-sm">This Agreement is entered into between Nabeeh Bank ("Lender") and the verified account holder ("Borrower").</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[['Amount','25,000 SAR'],['Rate','3.5% APR'],['Term','12 Months'],['Monthly','2,145 SAR']].map(([k,v])=>(
                      <div key={k} className="bg-white/[0.04] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[10px] text-muted-foreground/60 uppercase mb-1">{k}</p>
                        <p className="text-white text-sm font-mono font-bold">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">By signing electronically, you agree your signature holds the same legal standing as a handwritten signature under applicable law.</p>
                </div>

                <motion.label whileTap={{scale:0.98}} className="flex items-center gap-3 cursor-pointer">
                  <motion.div
                    animate={{ backgroundColor: agreed ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)' }}
                    className="w-5 h-5 rounded-md border border-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ borderColor: agreed ? 'hsl(var(--primary))' : undefined }}>
                    {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </motion.div>
                  <input type="checkbox" className="hidden" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                  <span className="text-sm text-white/80">I have read and agree to the terms</span>
                </motion.label>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button whileTap={{scale:0.97}} onClick={onClose} className="py-3 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors">Cancel</motion.button>
                  <motion.button whileTap={{scale:0.97}} onClick={() => setStep(2)} disabled={!agreed}
                    className="py-3 rounded-xl bg-primary text-black text-sm font-bold disabled:opacity-40 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-opacity">
                    Proceed to Sign
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Sign ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                <h2 className="text-lg font-bold text-white">Sign Document</h2>

                <div className="flex p-1 rounded-xl border border-white/8 gap-1" style={{background:'rgba(0,0,0,0.4)'}}>
                  {(['draw','upload'] as const).map(m => (
                    <motion.button key={m} whileTap={{scale:0.95}} onClick={() => setMode(m)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${mode===m?'bg-white/10 text-white':'text-muted-foreground hover:text-white'}`}>
                      {m==='draw' ? <><PenTool className="w-3.5 h-3.5"/>Draw</> : <><Upload className="w-3.5 h-3.5"/>Upload</>}
                    </motion.button>
                  ))}
                </div>

                {mode === 'draw' ? (
                  <div className="space-y-2">
                    <div className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden touch-none h-44 relative shadow-inner">
                      <canvas ref={canvasRef}
                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair" />
                      {!hasSignature && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-black/20 text-base italic font-medium">Sign here</div>
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
                  <motion.button whileTap={{scale:0.97}} onClick={() => setStep(1)}
                    className="py-3 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors">Back</motion.button>
                  <motion.button whileTap={{scale:0.97}} onClick={handleSubmit} disabled={mode==='draw'&&!hasSignature}
                    className="py-3 rounded-xl bg-primary text-black text-sm font-bold disabled:opacity-40 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    Finalize Signature
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Processing Flow ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{opacity:0,scale:0.94}} animate={{opacity:1,scale:1}} className="py-4">
                {!allDone ? (
                  <div>
                    {/* Animated orb */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <motion.div animate={{rotate:360}} transition={{duration:4,repeat:Infinity,ease:'linear'}}
                        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      <motion.div animate={{rotate:-360}} transition={{duration:6,repeat:Infinity,ease:'linear'}}
                        className="absolute inset-2.5 rounded-full border-t-2 border-l-2 border-blue-500/50 border-r-2 border-r-transparent border-b-2 border-b-transparent" />
                      <motion.div animate={{rotate:360}} transition={{duration:8,repeat:Infinity,ease:'linear'}}
                        className="absolute inset-5 rounded-full border-t-2 border-purple-400/40 border-r-2 border-r-transparent border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-primary" />
                      </div>
                    </div>

                    <p className="text-center text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-1">Processing</p>
                    <h2 className="text-center text-lg font-bold text-white mb-6">Securing Your Signature</h2>

                    {/* Sequential steps */}
                    <div className="space-y-3">
                      {FLOW_STEPS.map((s, i) => {
                        const isDone    = flowStep > i;
                        const isActive  = flowStep === i;
                        return (
                          <motion.div key={s.label}
                            initial={{ opacity: 0.15 }}
                            animate={isDone || isActive ? { opacity: 1 } : { opacity: 0.15 }}
                            className="flex items-center gap-3">
                            <motion.div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-500"
                              style={isDone
                                ? {background:s.color, borderColor:s.color, boxShadow:`0 0 12px ${s.color}55`}
                                : isActive
                                  ? {background:'rgba(212,175,55,0.15)', borderColor:'rgba(212,175,55,0.5)', boxShadow:'0 0 8px rgba(212,175,55,0.2)'}
                                  : {background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.08)'}}>
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : isActive ? (
                                <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}>
                                  <s.icon className="w-3.5 h-3.5 text-primary" />
                                </motion.div>
                              ) : (
                                <s.icon className="w-3.5 h-3.5 text-white/20" />
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold transition-colors duration-500 ${isDone||isActive?'text-white':'text-white/20'}`}>{s.label}</p>
                              <AnimatePresence>
                                {(isDone || isActive) && (
                                  <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                                    {isActive && !isDone ? '…' : s.desc}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                            <AnimatePresence>
                              {isDone && (
                                <motion.span initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:400,damping:20}}
                                  className="text-xs font-bold flex-shrink-0" style={{color:s.color}}>✓</motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* ── Success Screen ── */
                  <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:260,damping:22}} className="text-center">
                    {/* Gold shimmer glow */}
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      <motion.div className="absolute inset-0 rounded-full"
                        animate={{scale:[1,1.3,1],opacity:[0.6,0,0.6]}}
                        transition={{duration:2.5,repeat:Infinity}}
                        style={{background:'radial-gradient(circle,rgba(212,175,55,0.4) 0%,transparent 70%)'}} />
                      <motion.div
                        initial={{scale:0,rotate:-20}}
                        animate={{scale:1,rotate:0}}
                        transition={{type:'spring',stiffness:300,damping:18,delay:0.1}}
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{background:'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.08))',border:'2px solid rgba(212,175,55,0.5)',boxShadow:'0 0 40px rgba(212,175,55,0.25)'}}>
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                      </motion.div>
                    </div>

                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-1">Certificate Issued</p>
                      <h2 className="text-2xl font-bold text-white mb-1">Signature Secured</h2>
                      <p className="text-muted-foreground/70 text-sm mb-5">Your signature is securely stored in the Nabeeh Vault.</p>

                      {/* Certificate details */}
                      <div className="rounded-2xl border border-primary/20 p-4 mb-5 text-left space-y-2"
                        style={{background:'rgba(212,175,55,0.05)'}}>
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-primary" />
                          <p className="text-primary font-bold text-xs uppercase tracking-wider">Digital Certificate</p>
                        </div>
                        {[['Certificate ID','NB-SIG-2026-7731'],['Issued By','Nabeeh Security Authority'],['Validity','Lifetime'],['Standard','ISO 27001 · eIDAS']].map(([k,v])=>(
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-muted-foreground/60">{k}</span>
                            <span className="text-white font-mono">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Supported uses */}
                      <div className="mb-5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3 text-left">Accepted for</p>
                        <div className="grid grid-cols-5 gap-2">
                          {SUPPORTED_USES.map(u => (
                            <motion.div key={u.label}
                              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                              transition={{delay:0.4 + SUPPORTED_USES.indexOf(u) * 0.08}}
                              className="flex flex-col items-center gap-1.5">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <u.icon className="w-4 h-4 text-primary" />
                              </div>
                              <p className="text-[9px] text-muted-foreground/60 text-center leading-tight">{u.label}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Shimmer divider */}
                      <div className="h-px mb-5" style={{background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)'}} />

                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                        onClick={handleDone}
                        className="w-full py-3.5 rounded-2xl font-bold text-black text-sm"
                        style={{background:'linear-gradient(135deg,#D4AF37,#f59e0b)',boxShadow:'0 0 25px rgba(212,175,55,0.3)'}}>
                        <Sparkles className="w-4 h-4 inline mr-2 -mt-0.5" />
                        Done — View in Documents
                      </motion.button>
                    </motion.div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────
const COMPLETED = [
  { title: 'Account Opening Agreement', date: 'Jan 15, 2026' },
  { title: 'Debit Card Agreement',       date: 'Jan 15, 2026' },
  { title: 'Online Banking Terms',        date: 'Feb 1, 2026'  },
];

export default function Contracts() {
  const { user } = useRequireAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned,   setHasSigned]   = useState(false);

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
          <p className="text-muted-foreground/70 text-sm">Legally binding digital agreements</p>
        </header>

        {/* Pending contract */}
        {!hasSigned && (
          <motion.div variants={itemVariants}
            className="glass-float rounded-3xl p-5 border border-primary/25 card-premium relative overflow-hidden"
            style={{background:'linear-gradient(135deg,rgba(212,175,55,0.05) 0%,rgba(10,9,7,0.8) 100%)'}}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold mb-1">Pending Signature</p>
                <h2 className="text-xl font-bold text-white">Loan Agreement</h2>
                <p className="text-muted-foreground/70 text-xs mt-0.5">Nabeeh Bank Personal Loan · 12 months</p>
              </div>
              <div className="flex-shrink-0 bg-amber-500/10 border border-amber-500/25 text-amber-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Awaiting
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5 relative z-10">
              {[['Amount','25,000 SAR'],['Rate','3.5% APR'],['Term','12 Months'],['Monthly','2,145 SAR']].map(([k,v])=>(
                <div key={k} className="bg-black/40 rounded-2xl p-3.5 border border-white/6">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">{k}</p>
                  <p className="font-mono text-white font-bold text-base">{v}</p>
                </div>
              ))}
            </div>

            <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.97}}
              onClick={() => setIsModalOpen(true)}
              className="relative z-10 w-full py-4 rounded-2xl bg-primary text-black text-base font-bold flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_40px_rgba(212,175,55,0.35)] transition-shadow">
              <PenTool className="w-4 h-4" /> Sign This Contract
            </motion.button>
          </motion.div>
        )}

        {/* Signed state */}
        {hasSigned && (
          <motion.div initial={{opacity:0,scale:0.96,y:8}} animate={{opacity:1,scale:1,y:0}} transition={{type:'spring'}}
            className="glass-float rounded-3xl p-5 border border-emerald-500/20 card-premium"
            style={{background:'rgba(16,185,129,0.04)'}}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold">Loan Agreement Signed</p>
                <p className="text-emerald-400 text-xs font-medium mt-0.5">Certificate NB-SIG-2026-7731 · Signed today</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completed */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-3">
            <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
            <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-widest">Completed Agreements</h3>
          </div>
          <motion.div variants={staggerContainer} className="glass-float rounded-2xl border border-white/6 card-premium overflow-hidden divide-y divide-white/[0.04]">
            {COMPLETED.map(contract => (
              <motion.div key={contract.title} variants={itemVariants}>
                <motion.div whileHover={{backgroundColor:'rgba(255,255,255,0.025)'}} whileTap={{scale:0.99}}
                  className="flex items-center gap-4 px-4 py-4 cursor-pointer group">
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
