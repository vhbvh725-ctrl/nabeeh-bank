import { motion } from 'framer-motion';

export const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: { duration: 0.3 } }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};
