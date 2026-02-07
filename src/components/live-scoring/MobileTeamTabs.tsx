'use client';

interface Team {
  name: string;
  shortName: string;
  color: string;
}

interface MobileTeamTabsProps {
  homeTeam: Team;
  awayTeam: Team;
  activeTeam: 'home' | 'away';
  onTeamChange: (team: 'home' | 'away') => void;
  homeComplete?: boolean;
  awayComplete?: boolean;
}

export function MobileTeamTabs({
  homeTeam,
  awayTeam,
  activeTeam,
  onTeamChange,
}: MobileTeamTabsProps) {
  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => onTeamChange('home')}
        className={`
          flex-1 py-3 px-4
          flex items-center justify-center gap-2
          font-heading font-semibold text-base
          transition-all duration-100
          border-b-2
          ${activeTeam === 'home' 
            ? 'border-current text-text-primary' 
            : 'border-transparent text-text-muted hover:text-text-secondary'
          }
        `}
        style={{ 
          color: activeTeam === 'home' ? homeTeam.color : undefined,
          borderColor: activeTeam === 'home' ? homeTeam.color : undefined,
        }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: homeTeam.color }}
        />
        {homeTeam.shortName}
      </button>
      
      <button
        onClick={() => onTeamChange('away')}
        className={`
          flex-1 py-3 px-4
          flex items-center justify-center gap-2
          font-heading font-semibold text-base
          transition-all duration-100
          border-b-2
          ${activeTeam === 'away' 
            ? 'border-current text-text-primary' 
            : 'border-transparent text-text-muted hover:text-text-secondary'
          }
        `}
        style={{ 
          color: activeTeam === 'away' ? awayTeam.color : undefined,
          borderColor: activeTeam === 'away' ? awayTeam.color : undefined,
        }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: awayTeam.color }}
        />
        {awayTeam.shortName}
      </button>
    </div>
  );
}
