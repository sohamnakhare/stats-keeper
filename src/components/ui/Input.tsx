'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: InputSize;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'min-h-[var(--tap-target-min)] px-3 text-sm',
  md: 'min-h-[var(--tap-target-md)] px-4 text-base',
  lg: 'min-h-[var(--tap-target-lg)] px-4 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      inputSize = 'md',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const baseStyles = `
      w-full
      bg-bg-tertiary
      border border-border
      rounded-[var(--radius-md)]
      text-text-primary
      placeholder:text-text-muted
      transition-all duration-[var(--duration-fast)]
      focus:outline-none
      focus:border-border-focus
      focus:shadow-[0_0_0_2px_rgba(0,245,160,0.2)]
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorStyles = error
      ? 'border-accent focus:border-accent focus:shadow-[0_0_0_2px_rgba(255,107,53,0.2)]'
      : '';

    return (
      <div className="flex flex-col gap-[var(--space-1)]">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${sizeStyles[inputSize]} ${errorStyles} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-accent">{error}</span>
        )}
        {hint && !error && (
          <span className="text-xs text-text-muted">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
