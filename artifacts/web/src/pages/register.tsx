import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, User, Mail, Phone, Lock, PenTool, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRegisterUser } from '@workspace/api-client-react';
import { useAuthStore } from '../lib/auth-store';
import { useSignatureCanvas } from '../hooks/use-signature-canvas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const VERIFICATION_STEPS = [
  'Encrypting Signature...',
  'Identity Verified',
  'AI Validation Complete',
  'Digital Certificate Created',
  'Contract Submitted',
];

export default function Register() {
  const [, setLocation] = useLocation();
  const setToken = useAuthStore((s) => s.setToken);
  const registerMutation = useRegisterUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<RegisterForm | null>(null);
  const [verifiedSteps, setVerifiedSteps] = useState<boolean[]>([false, false, false, false, false]);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const sigCanvas = useSignatureCanvas();

  const onStep1Submit = (data: RegisterForm) => {
    setFormData(data);
    setStep(2);
  };

  const handleRegister = async () => {
    if (!formData) return;
    try {
      const signatureData = sigCanvas.hasSignature ? sigCanvas.getBase64() : undefined;
      const payload = { ...formData, signatureData: signatureData || undefined };
      const res = await registerMutation.mutateAsync({ data: payload });
      setToken(res.token);
      setStep(3);

      // Trigger sequential verification animation
      const delays = [600, 1400, 2200, 3000, 3800];
      delays.forEach((delay, index) => {
        setTimeout(() => {
          setVerifiedSteps(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
          });
          if (index === delays.length - 1) {
            setTimeout(() => setVerificationComplete(true), 600);
          }
        }, delay);
      });

    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-2xl p-6 md:p-8 shadow-2xl border-t border-primary/20"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Create Profile</h1>
                <p className="text-muted-foreground text-sm">Step 1 of 2: Basic Identity</p>
              </div>

              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-muted-foreground">Full Legal Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullName" {...register('fullName')} className="pl-10 bg-black/40 h-12" placeholder="Ahmed Al-Rashid" />
                  </div>
                  {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" {...register('email')} className="pl-10 bg-black/40 h-12" placeholder="ahmed@example.com" />
                  </div>
                  {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" {...register('phone')} className="pl-10 bg-black/40 h-12" placeholder="+966 5X XXX XXXX" />
                  </div>
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Master Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" {...register('password')} className="pl-10 bg-black/40 h-12" placeholder="••••••••" />
                  </div>
                  {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button type="submit" className="w-full h-12 mt-4 bg-primary text-black font-semibold shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-shadow">
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </form>

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-2xl p-6 md:p-8 shadow-2xl border-t border-primary/20"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Digital Signature</h1>
                <p className="text-muted-foreground text-sm">Step 2 of 2: Contract Authorization</p>
              </div>

              <div className="space-y-6">
                <div className="bg-black/60 rounded-xl border border-border/50 p-4 relative overflow-hidden touch-none group">
                  <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                    <PenTool className="w-24 h-24 text-muted-foreground" />
                  </div>
                  <div className="absolute inset-x-4 bottom-1/4 h-[1px] bg-border/40 pointer-events-none" />

                  <canvas
                    ref={sigCanvas.canvasRef}
                    onMouseDown={sigCanvas.startDrawing}
                    onMouseMove={sigCanvas.draw}
                    onMouseUp={sigCanvas.stopDrawing}
                    onMouseLeave={sigCanvas.stopDrawing}
                    onTouchStart={sigCanvas.startDrawing}
                    onTouchMove={sigCanvas.draw}
                    onTouchEnd={sigCanvas.stopDrawing}
                    className="w-full h-48 cursor-crosshair relative z-10"
                  />

                  {sigCanvas.hasSignature && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={sigCanvas.clear}
                      className="absolute top-2 right-2 h-8 text-xs bg-black/80 hover:bg-destructive/20 hover:text-destructive z-20"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12"
                    disabled={registerMutation.isPending}
                  >
                    Back
                  </Button>
                  <motion.div className="flex-[2]" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      onClick={handleRegister}
                      disabled={!sigCanvas.hasSignature || registerMutation.isPending}
                      className="w-full h-12 bg-primary text-black font-semibold shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                    >
                      {registerMutation.isPending
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : 'Finalize Creation'
                      }
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              className="glass rounded-2xl p-8 shadow-2xl border border-primary/30 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

              {/* Animated shield icon */}
              <div className="flex justify-center mb-8 relative z-10">
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/10"
                    animate={{ boxShadow: ['0 0 20px rgba(212,175,55,0.2)', '0 0 40px rgba(212,175,55,0.4)', '0 0 20px rgba(212,175,55,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ShieldCheck className="w-10 h-10 text-primary" />
                  </motion.div>
                  {/* Rotating ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary border-b-2 border-b-transparent border-l-2 border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Verification steps */}
              <div className="space-y-3 mb-8 relative z-10">
                {VERIFICATION_STEPS.map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={verifiedSteps[i] ? { opacity: 1, x: 0 } : { opacity: 0.25, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${verifiedSteps[i] ? 'bg-primary' : 'bg-white/10'}`}
                    >
                      {verifiedSteps[i]
                        ? <CheckCircle2 className="w-4 h-4 text-black" />
                        : <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      }
                    </motion.div>
                    <span className={`text-sm font-medium transition-colors duration-500 ${verifiedSteps[i] ? 'text-white' : 'text-white/30'}`}>
                      {label}
                    </span>
                    {verifiedSteps[i] && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto text-primary text-xs"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Final message + Continue button */}
              <AnimatePresence>
                {verificationComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 text-center"
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-6" />
                    <p className="text-white font-medium mb-1">Your electronic signature has been securely linked</p>
                    <p className="text-muted-foreground text-sm mb-6">to your Nabeeh identity.</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setLocation('/dashboard')}
                        className="w-full h-12 bg-primary text-black font-bold shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-shadow"
                      >
                        Continue to Dashboard
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
