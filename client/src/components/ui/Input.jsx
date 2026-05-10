import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Input — styled text input with label, helper text, error, and icon support.
 * Uses design tokens exclusively.
 */
const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    icon: Icon,
    className,
    id,
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
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-text-subtle" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-surface text-text-main placeholder-text-subtle',
            'px-4 py-2.5 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            Icon ? 'pl-10' : '',
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
      </div>
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

export default Input;
