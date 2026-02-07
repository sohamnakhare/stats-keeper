'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-text-inverse 
    hover:shadow-[var(--glow-primary)] 
    active:scale-[0.98]
  `,
  secondary: `
    bg-surface border border-border text-text-primary 
    hover:bg-bg-hover hover:border-text-muted
  `,
  ghost: `
    bg-transparent text-text-primary 
    hover:bg-bg-hover
  `,
  danger: `
    bg-accent text-white 
    hover:shadow-[var(--glow-accent)] 
    active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[var(--tap-target-min)] px-3 text-sm',
  md: 'min-h-[var(--tap-target-md)] px-4 text-base',
  lg: 'min-h-[var(--tap-target-lg)] px-6 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-heading font-semibold
      rounded-[var(--radius-md)]
      transition-all duration-[var(--duration-fast)]
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
      disabled:opacity-50 disabled:pointer-events-none
    `;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
