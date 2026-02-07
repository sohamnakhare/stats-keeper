'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={`
          flex items-center gap-[var(--space-3)] 
          cursor-pointer 
          min-h-[var(--tap-target-min)]
          ${className}
        `}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="
              peer
              w-5 h-5
              appearance-none
              bg-bg-tertiary
              border border-border
              rounded-[var(--radius-sm)]
              cursor-pointer
              transition-all duration-[var(--duration-fast)]
              checked:bg-primary
              checked:border-primary
              focus:outline-none
              focus:ring-2 focus:ring-primary-glow
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            {...props}
          />
          <svg
            className="
              absolute 
              w-3 h-3 
              text-text-inverse 
              pointer-events-none
              opacity-0
              peer-checked:opacity-100
              transition-opacity duration-[var(--duration-fast)]
            "
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-text-primary">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-text-muted">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
