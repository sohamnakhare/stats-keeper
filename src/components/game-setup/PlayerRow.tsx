'use client';

import { Input, Select, Checkbox } from '@/components/ui';
import type { Position, PlayerInput } from '@/types';

const POSITION_OPTIONS = [
  { value: '', label: 'Position' },
  { value: 'PG', label: 'Point Guard (PG)' },
  { value: 'SG', label: 'Shooting Guard (SG)' },
  { value: 'SF', label: 'Small Forward (SF)' },
  { value: 'PF', label: 'Power Forward (PF)' },
  { value: 'C', label: 'Center (C)' },
];

interface PlayerRowProps {
  player: PlayerInput;
  onUpdate: (player: PlayerInput) => void;
  onDelete: () => void;
  isStarter: boolean;
  onStarterToggle: () => void;
  isCaptain: boolean;
  onCaptainToggle: () => void;
  errors?: {
    number?: string;
    name?: string;
  };
  disabled?: boolean;
}

export function PlayerRow({
  player,
  onUpdate,
  onDelete,
  isStarter,
  onStarterToggle,
  isCaptain,
  onCaptainToggle,
  errors,
  disabled = false,
}: PlayerRowProps) {
  return (
    <div className="p-[var(--space-3)] sm:p-[var(--space-4)] bg-bg-tertiary rounded-[var(--radius-lg)] group space-y-[var(--space-2)] sm:space-y-[var(--space-3)] relative">
      {/* Delete Button - Top right on mobile, inline on desktop */}
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="
          absolute top-[var(--space-2)] right-[var(--space-2)]
          sm:hidden
          w-8 h-8 flex-shrink-0
          flex items-center justify-center
          text-text-muted bg-bg-secondary
          rounded-[var(--radius-md)]
          transition-all duration-[var(--duration-fast)]
          hover:bg-accent hover:text-white
          active:bg-accent active:text-white
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        title="Remove Player"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      {/* Row 1: Jersey Number and Name */}
      <div className="flex items-start gap-[var(--space-2)] sm:gap-[var(--space-3)] pt-8 sm:pt-0">
        {/* Jersey Number */}
        <div className="w-16 sm:w-20 flex-shrink-0">
          <Input
            inputSize="sm"
            type="number"
            min={0}
            max={99}
            placeholder="#"
            value={player.number || ''}
            onChange={(e) => onUpdate({ ...player, number: parseInt(e.target.value) || 0 })}
            error={errors?.number}
            disabled={disabled}
            className="text-center font-display text-lg sm:text-xl"
            label="No."
          />
        </div>

        {/* Player Name */}
        <div className="flex-1 min-w-0">
          <Input
            inputSize="sm"
            placeholder="Player name"
            value={player.name}
            onChange={(e) => onUpdate({ ...player, name: e.target.value })}
            error={errors?.name}
            disabled={disabled}
            label="Name"
          />
        </div>

        {/* Delete Button - Desktop only (inline) */}
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="
            hidden sm:flex
            w-10 h-10 flex-shrink-0 mt-6
            items-center justify-center
            text-text-muted
            rounded-[var(--radius-md)]
            transition-all duration-[var(--duration-fast)]
            hover:bg-accent hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="Remove Player"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      {/* Row 2: Position and Toggles */}
      <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-4)] flex-wrap">
        {/* Position */}
        <div className="w-full sm:w-48 order-last sm:order-first">
          <Select
            selectSize="sm"
            options={POSITION_OPTIONS}
            value={player.position || ''}
            onChange={(e) => onUpdate({ ...player, position: e.target.value as Position })}
            disabled={disabled}
          />
        </div>

        {/* Starter Toggle */}
        <Checkbox
          checked={isStarter}
          onChange={onStarterToggle}
          disabled={disabled}
          label="Starter"
        />

        {/* Spacer - only on desktop */}
        <div className="hidden sm:block flex-1" />

        {/* Captain Toggle */}
        <button
          type="button"
          onClick={onCaptainToggle}
          disabled={disabled || !isStarter}
          className={`
            flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)]
            px-[var(--space-2)] sm:px-[var(--space-3)] py-[var(--space-2)]
            rounded-[var(--radius-md)]
            transition-all duration-[var(--duration-fast)]
            ${isCaptain 
              ? 'bg-gold text-text-inverse' 
              : 'bg-surface border border-border text-text-muted hover:border-gold hover:text-gold'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isCaptain ? 'Team Captain' : 'Make Captain (must be starter)'}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={isCaptain ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Captain</span>
        </button>
      </div>
    </div>
  );
}
