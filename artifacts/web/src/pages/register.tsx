import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, User, Mail, Phone, Lock, PenTool, CheckCircle2 } from 'lucide-react';
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

export default function Register() {
  const [, setLocation] = useLocation();
  const setToken = useAuthStore((s) => s.setToken);
  const registerMutation = useRegisterUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<RegisterForm | null>(null);

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
      
      const payload = {
        ...formData,
        signatureData: signatureData || undefined
      };
      
      const res = await registerMutation.mutateAsync({ data: payload });
      setToken(res.token);
      setStep(3);
      
      // Auto redirect after celebration
      setTimeout(() => {
        setLocation('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
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
                    <Input id="fullName" {...register('fullName')} className="pl-10 bg-black/40 h-12" placeholder="John Doe" />
                  </div>
                  {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" {...register('email')} className="pl-10 bg-black/40 h-12" placeholder="john@example.com" />
                  </div>
                  {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" {...register('phone')} className="pl-10 bg-black/40 h-12" placeholder="+1 (555) 000-0000" />
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

                <Button type="submit" className="w-full h-12 mt-4 bg-primary text-black font-semibold">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
              
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
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
                  <Button 
                    onClick={handleRegister}
                    disabled={!sigCanvas.hasSignature || registerMutation.isPending}
                    className="flex-[2] h-12 bg-primary text-black font-semibold"
                  >
                    {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize Creation'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-10 shadow-2xl text-center border border-primary/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary mx-auto mb-6 flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Signature Captured</h2>
              <p className="text-muted-foreground relative z-10">
                Your digital signature has been successfully created. It can now be used for electronic banking contracts.
              </p>
              
              <div className="mt-8 relative z-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                <p className="text-xs text-primary mt-2 uppercase tracking-widest">Initializing OS...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
