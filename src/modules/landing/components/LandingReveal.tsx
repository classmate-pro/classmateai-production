import { motion, type Variants } from 'motion/react';
import { ComponentProps, ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

interface LandingRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export default function LandingReveal({
  children,
  className,
  delay = 0,
  y = 44,
}: LandingRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -48px 0px' }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

interface LandingStaggerGridProps {
  children: ReactNode;
  className?: string;
}

export function LandingStaggerGrid({ children, className }: LandingStaggerGridProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
    >
      {children}
    </motion.div>
  );
}

export function LandingStaggerItem({
  children,
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <motion.div className={className} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}
