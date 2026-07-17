import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fingerprint, Sparkles, Loader2, Lock, Mail } from 'lucide-react';
import { useLoginUser } from '@workspace/api-client-react';
import { useAuthStore } from '../lib/auth-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const setToken = useAuthStore((s) => s.setToken);
  const loginMutation = useLoginUser();
  const [isBiometricSimulating, setIsBiometricSimulating] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'user@nabeeh.ultra',
      password: 'password123',
      rememberMe: false,
    }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      setToken(res.token);
      toast.success('Welcome back');
      setLocation('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleBiometricLogin = () => {
    setIsBiometricSimulating(true);
    setTimeout(() => {
      setIsBiometricSimulating(false);
      toast.success('Face ID recognized. Logging in securely.');
      // Simulate login for hackathon demo
      setToken('simulated_token');
      setLocation('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full border border-primary/30 bg-white/5 backdrop-blur-md flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Access your OS</h1>
          <p className="text-muted-foreground text-sm">Secure authorization required</p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  {...register('email')}
                  className="pl-10 bg-black/40 border-border/50 focus:border-primary/50 transition-colors h-12" 
                  placeholder="name@domain.com"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">Password</Label>
                <button type="button" className="text-primary text-xs hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password"
                  {...register('password')}
                  className="pl-10 bg-black/40 border-border/50 focus:border-primary/50 transition-colors h-12" 
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                onCheckedChange={(checked) => setValue('rememberMe', checked === true)} 
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground">Remember authorization</Label>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Button 
                type="submit" 
                disabled={loginMutation.isPending}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide"
              >
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize'}
              </Button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border/50"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-border/50"></div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBiometricLogin}
                disabled={isBiometricSimulating}
                className="w-full h-12 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-white transition-all group"
              >
                {isBiometricSimulating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
                    Biometric Login
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Don't have a profile yet?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">Initialize DNA</Link>
        </p>
      </motion.div>
    </div>
  );
}
