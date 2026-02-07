'use client';

import type { ExportFormat } from '@/types';
import { Card } from '@/components/ui';

interface ExportOptionsProps {
  gameId: string;
  onExport?: (format: ExportFormat) => void;
}

const EXPORT_OPTIONS: {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}[] = [
  {
    format: 'csv',
    label: 'CSV',
    description: 'Spreadsheet format',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    color: 'primary',
    available: true,
  },
  {
    format: 'json',
    label: 'JSON',
    description: 'Data format',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    color: 'highlight',
    available: true,
  },
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Coming soon',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    color: 'accent',
    available: false,
  },
];

export function ExportOptions({ gameId, onExport }: ExportOptionsProps) {
  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
    } else {
      // Default behavior: trigger download
      window.location.href = `/api/games/${gameId}/summary/export?format=${format}`;
    }
  };

  return (
    <Card className="p-[var(--space-6)]">
      <h3 className="font-heading text-xl font-semibold text-text-primary mb-[var(--space-2)]">
        Export Game Data
      </h3>
      <p className="text-text-secondary mb-[var(--space-6)]">
        Download the game statistics in your preferred format.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-4)]">
        {EXPORT_OPTIONS.map((option) => {
          const colorClasses = {
            primary: 'bg-primary/15 text-primary hover:border-primary',
            highlight: 'bg-highlight/15 text-highlight hover:border-highlight',
            accent: 'bg-accent/15 text-accent',
          };

          return option.available ? (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              className="block w-full text-left"
            >
              <Card
                className={`
                  p-[var(--space-4)] hover:bg-bg-hover transition-colors cursor-pointer
                  border-2 border-transparent ${colorClasses[option.color as keyof typeof colorClasses]}
                `}
              >
                <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
                  <div
                    className={`
                      w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center
                      ${colorClasses[option.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}
                    `}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-text-primary">
                      {option.label}
                    </h4>
                    <p className="text-text-muted text-xs">{option.description}</p>
                  </div>
                </div>
              </Card>
            </button>
          ) : (
            <Card
              key={option.format}
              className="p-[var(--space-4)] opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
                <div
                  className={`
                    w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center
                    ${colorClasses[option.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}
                  `}
                >
                  {option.icon}
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-text-primary">
                    {option.label}
                  </h4>
                  <p className="text-text-muted text-xs">{option.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
