import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

/**
 * EmptyState — reusable empty/onboarding state with icon, title, description, and CTA.
 * Used when data is unavailable or user hasn't completed an action.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-text-subtle" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-text-main font-display mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-text-muted max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
