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
  homeFoulsThisPeriod?: number;
  awayFoulsThisPeriod?: number;
}

export function MobileTeamTabs({
  homeTeam,
  awayTeam,
  activeTeam,
  onTeamChange,
  homeFoulsThisPeriod = 0,
  awayFoulsThisPeriod = 0,
}: MobileTeamTabsProps) {
  const homeInBonus = homeFoulsThisPeriod >= 4;
  const awayInBonus = awayFoulsThisPeriod >= 4;

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
        {/* Team fouls dots */}
        {homeFoulsThisPeriod > 0 && (
          <div className="flex items-center gap-0.5 ml-1">
            {Array.from({ length: Math.min(homeFoulsThisPeriod, 5) }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-1.5 h-1.5 rounded-full
                  ${homeInBonus ? 'bg-gold' : 'bg-text-muted'}
                `}
              />
            ))}
          </div>
        )}
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
        {/* Team fouls dots */}
        {awayFoulsThisPeriod > 0 && (
          <div className="flex items-center gap-0.5 ml-1">
            {Array.from({ length: Math.min(awayFoulsThisPeriod, 5) }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-1.5 h-1.5 rounded-full
                  ${awayInBonus ? 'bg-gold' : 'bg-text-muted'}
                `}
              />
            ))}
          </div>
        )}
      </button>
    </div>
  );
}
