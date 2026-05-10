import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Textarea — styled multi-line input matching Input design.
 * Uses design tokens exclusively.
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    helperText,
    error,
    className,
    id,
    rows = 4,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-main font-display"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          'w-full rounded-xl border bg-surface text-text-main placeholder-text-subtle',
          'px-4 py-3 text-sm transition-all duration-200 resize-y',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          error
            ? 'border-error/50 focus:ring-error/30 focus:border-error'
            : 'border-border hover:border-border-hover',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-text-subtle">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Textarea;
