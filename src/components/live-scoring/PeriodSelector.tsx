'use client';

import { useEffect, useRef } from 'react';
import type { Period } from '@/types';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
  { value: 'OT1', label: 'OT1' },
  { value: 'OT2', label: 'OT2' },
  { value: 'OT3', label: 'OT3' },
];

interface PeriodSelectorProps {
  currentPeriod: Period;
  isOpen: boolean;
  onSelect: (period: Period) => void;
  onClose: () => void;
}

export function PeriodSelector({
  currentPeriod,
  isOpen,
  onSelect,
  onClose,
}: PeriodSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Delay adding listener to prevent immediate close from the triggering click
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      document.addEventListener('keydown', handleEscape);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (period: Period) => {
    onSelect(period);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="
        absolute top-full left-1/2 -translate-x-1/2
        mt-[var(--space-2)]
        z-50
        bg-surface-elevated
        border border-border
        rounded-[var(--radius-lg)]
        shadow-[var(--shadow-lg)]
        animate-slide-up
      "
      role="listbox"
      aria-label="Select period"
    >
      {/* Quarters Section */}
      <div className="p-[var(--space-3)]">
        <div className="text-text-muted text-[10px] uppercase tracking-wide mb-[var(--space-2)]">
          Quarters
        </div>
        <div className="flex gap-[var(--space-2)]">
          {PERIODS.slice(0, 4).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              role="option"
              aria-selected={currentPeriod === value}
              className={`
                w-12 h-12
                flex items-center justify-center
                rounded-[var(--radius-md)]
                font-heading font-semibold text-sm
                transition-all duration-[var(--duration-fast)]
                active:scale-[0.95]
                ${
                  currentPeriod === value
                    ? 'bg-primary text-text-inverse shadow-[var(--glow-primary)]'
                    : 'bg-bg-tertiary text-text-primary hover:bg-bg-hover'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overtime Section */}
      <div className="p-[var(--space-3)] pt-0">
        <div className="text-text-muted text-[10px] uppercase tracking-wide mb-[var(--space-2)]">
          Overtime
        </div>
        <div className="flex gap-[var(--space-2)]">
          {PERIODS.slice(4).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              role="option"
              aria-selected={currentPeriod === value}
              className={`
                w-12 h-12
                flex items-center justify-center
                rounded-[var(--radius-md)]
                font-heading font-semibold text-sm
                transition-all duration-[var(--duration-fast)]
                active:scale-[0.95]
                ${
                  currentPeriod === value
                    ? 'bg-primary text-text-inverse shadow-[var(--glow-primary)]'
                    : 'bg-bg-tertiary text-text-primary hover:bg-bg-hover'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
