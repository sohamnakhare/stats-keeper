'use client';

import { type SelectHTMLAttributes, forwardRef } from 'react';

type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: SelectSize;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'min-h-[var(--tap-target-min)] px-3 text-sm',
  md: 'min-h-[var(--tap-target-md)] px-4 text-base',
  lg: 'min-h-[var(--tap-target-lg)] px-4 text-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      selectSize = 'md',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles = `
      w-full
      bg-bg-tertiary
      border border-border
      rounded-[var(--radius-md)]
      text-text-primary
      transition-all duration-[var(--duration-fast)]
      focus:outline-none
      focus:border-border-focus
      focus:shadow-[0_0_0_2px_rgba(0,245,160,0.2)]
      disabled:opacity-50 disabled:cursor-not-allowed
      appearance-none
      cursor-pointer
      bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23A0A0B0%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')]
      bg-[length:20px]
      bg-[right_12px_center]
      bg-no-repeat
      pr-10
    `;

    const errorStyles = error
      ? 'border-accent focus:border-accent focus:shadow-[0_0_0_2px_rgba(255,107,53,0.2)]'
      : '';

    return (
      <div className="flex flex-col gap-[var(--space-1)]">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${baseStyles} ${sizeStyles[selectSize]} ${errorStyles} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
