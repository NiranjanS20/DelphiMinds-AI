import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/helpers';

/**
 * Reusable Button component with variants, sizes, and loading state.
 *
 * Design tokens: Sage primary, Violet AI accent.
 * Standardization: rounded-xl, font-display for labels, consistent focus rings.
 */
const variants = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent',
  ai:
    'bg-gradient-to-r from-ai-accent to-primary hover:opacity-90 text-white glow-ai border border-transparent',
  secondary:
    'bg-surface-50 hover:bg-surface-100 text-text-main border border-border hover:border-border-hover',
  ghost:
    'bg-transparent hover:bg-surface-50 text-text-muted hover:text-text-main',
  danger:
    'bg-error hover:bg-error/90 text-white shadow-lg shadow-error/20',
  outline:
    'bg-transparent border border-primary/50 text-primary hover:bg-primary-muted hover:border-primary',
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
        'inline-flex items-center justify-center gap-2 font-semibold font-display transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
