import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Full-screen loading spinner with brand animation.
 */
export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-0 bg-mesh">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-brand-500/30 blur-xl animate-pulse-slow" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-sm text-slate-400 font-medium"
      >
        Loading DelphiMinds...
      </motion.p>
    </div>
  );
}

/**
 * Inline loader for sections/cards.
 */
export function SectionLoader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-surface-200 border-t-brand-500"
        />
      </div>
      <p className="mt-4 text-sm text-slate-500">{text}</p>
    </div>
  );
}

/**
 * Skeleton loader for cards.
 */
export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="h-4 w-1/3 rounded-lg shimmer" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-lg shimmer" />
        <div className="h-3 w-4/5 rounded-lg shimmer" />
        <div className="h-3 w-2/3 rounded-lg shimmer" />
      </div>
      <div className="h-8 w-24 rounded-lg shimmer mt-4" />
    </div>
  );
}

/**
 * Skeleton loader for a row of stats.
 */
export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className="h-3 w-16 rounded shimmer" />
          <div className="h-8 w-20 rounded shimmer" />
          <div className="h-2 w-24 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}

export default FullScreenLoader;
