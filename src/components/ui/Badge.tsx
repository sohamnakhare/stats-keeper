import { type HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'live' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-bg-tertiary text-text-secondary
  `,
  success: `
    bg-[rgba(0,245,160,0.15)] text-primary
  `,
  warning: `
    bg-[rgba(255,215,0,0.15)] text-gold
  `,
  danger: `
    bg-[rgba(255,107,53,0.15)] text-accent
  `,
  live: `
    bg-[#FF3366] text-white animate-live-pulse
  `,
  info: `
    bg-[rgba(0,212,255,0.15)] text-highlight
  `,
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      px-[var(--space-2)] py-[var(--space-1)]
      text-xs font-medium
      rounded-[var(--radius-sm)]
    `;

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
