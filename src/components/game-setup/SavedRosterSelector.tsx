'use client';

import { useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import type { SavedRoster } from '@/types';

interface SavedRosterSelectorProps {
  rosters: SavedRoster[];
  onSelect: (roster: SavedRoster) => void;
  onDelete: (rosterId: string) => void;
  isLoading?: boolean;
}

export function SavedRosterSelector({
  rosters,
  onSelect,
  onDelete,
  isLoading = false,
}: SavedRosterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleDelete = (rosterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete === rosterId) {
      onDelete(rosterId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(rosterId);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (rosters.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-[var(--space-2)]"
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Load Roster
        <svg
          className={`w-4 h-4 transition-transform duration-[var(--duration-fast)] ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <Card
            variant="elevated"
            className="
              absolute top-full right-0 mt-[var(--space-2)]
              w-80 max-h-96 overflow-auto
              z-20 animate-slide-up
            "
          >
            <CardContent className="p-0">
              <div className="p-[var(--space-2)] border-b border-border">
                <p className="text-xs text-text-muted">
                  Select a saved roster
                </p>
              </div>
              <ul className="divide-y divide-border">
                {rosters.map((roster) => (
                  <li key={roster.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(roster);
                        setIsOpen(false);
                      }}
                      className="
                        w-full p-[var(--space-3)]
                        flex items-center gap-[var(--space-3)]
                        text-left
                        hover:bg-bg-hover
                        transition-colors duration-[var(--duration-fast)]
                      "
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: roster.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {roster.teamName}
                        </p>
                        <p className="text-xs text-text-muted">
                          {roster.players.length} players • Last used {formatDate(roster.lastUsed)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(roster.id, e)}
                        className={`
                          p-[var(--space-1)] rounded-[var(--radius-sm)]
                          transition-colors duration-[var(--duration-fast)]
                          ${confirmDelete === roster.id 
                            ? 'bg-accent text-white' 
                            : 'text-text-muted hover:text-accent hover:bg-bg-tertiary'
                          }
                        `}
                        title={confirmDelete === roster.id ? 'Click again to confirm' : 'Delete roster'}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
