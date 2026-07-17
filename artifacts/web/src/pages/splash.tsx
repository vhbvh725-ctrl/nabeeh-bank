import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/login');
    }, 3500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[100px] opacity-50" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="w-20 h-20 mb-8 rounded-full border-t border-primary/50 bg-background/50 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)]"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
        >
          Nabeeh <span className="gold-gradient-text">Ultra</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-muted-foreground tracking-widest uppercase text-sm font-medium"
        >
          Your intelligent financial companion
        </motion.p>
      </motion.div>
    </div>
  );
}
