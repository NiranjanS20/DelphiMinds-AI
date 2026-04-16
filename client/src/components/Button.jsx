import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/helpers';

/**
 * Reusable Button component with variants, sizes, and loading state.
 */
const variants = {
  primary:
    'bg-gradient-to-r from-primary to-ai-accent hover:from-primary/90 hover:to-ai-accent/90 text-white glow-primary border border-transparent',
  secondary:
    'bg-surface hover:bg-surface/80 text-gray-200 border border-white/10 hover:border-primary/50',
  ghost:
    'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white',
  danger:
    'bg-error hover:bg-error/90 text-white shadow-lg shadow-error/25',
  outline:
    'bg-transparent border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
  icon: 'p-2.5 rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </motion.button>
  );
}
