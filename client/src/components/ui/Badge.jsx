import { cn } from '../../utils/helpers';

/**
 * Badge — semantic status indicator.
 *
 * Variants: default | success | warning | error | ai | outline
 * Sizes: sm | md
 */
const variantStyles = {
  default:
    'bg-surface-100 text-text-muted border border-border',
  success:
    'bg-success-muted text-success border border-success/20',
  warning:
    'bg-warning-muted text-warning border border-warning/20',
  error:
    'bg-error-muted text-error border border-error/20',
  ai:
    'bg-ai-accent-muted text-ai-accent border border-ai-accent/20',
  primary:
    'bg-primary-muted text-primary border border-primary/20',
  outline:
    'bg-transparent text-text-muted border border-border',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg font-medium whitespace-nowrap transition-colors',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
