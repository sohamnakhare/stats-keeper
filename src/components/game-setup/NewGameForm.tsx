'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from '@/components/ui';
import type { SavedRoster, TeamInput } from '@/types';

// Team color options
const TEAM_COLORS = [
  { value: '#00F5A0', label: 'Green' },
  { value: '#FF6B35', label: 'Orange' },
  { value: '#00D4FF', label: 'Cyan' },
  { value: '#FF3366', label: 'Red' },
  { value: '#FFD700', label: 'Gold' },
  { value: '#9B59B6', label: 'Purple' },
  { value: '#3498DB', label: 'Blue' },
  { value: '#E74C3C', label: 'Crimson' },
];

interface NewGameFormProps {
  onSubmit: (data: {
    date: Date;
    venue?: string;
    homeTeam: TeamInput;
    awayTeam: TeamInput;
  }) => void;
  recentRosters: SavedRoster[];
  onSelectRoster: (roster: SavedRoster, side: 'home' | 'away') => void;
}

interface ValidationErrors {
  homeTeam?: {
    name?: string;
    shortName?: string;
    color?: string;
  };
  awayTeam?: {
    name?: string;
    shortName?: string;
    color?: string;
  };
  date?: string;
}

export function NewGameForm({ onSubmit, recentRosters, onSelectRoster }: NewGameFormProps) {
  // Format datetime for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [date, setDate] = useState(formatDateTimeLocal(new Date()));
  const [venue, setVenue] = useState('');
  const [homeTeam, setHomeTeam] = useState<TeamInput>({
    name: '',
    shortName: '',
    color: '#00F5A0',
  });
  const [awayTeam, setAwayTeam] = useState<TeamInput>({
    name: '',
    shortName: '',
    color: '#FF6B35',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate home team
    if (!homeTeam.name || homeTeam.name.length < 2 || homeTeam.name.length > 30) {
      newErrors.homeTeam = { ...newErrors.homeTeam, name: 'Team name must be 2-30 characters' };
    }
    if (!homeTeam.shortName || !/^[A-Z]{1,3}$/.test(homeTeam.shortName)) {
      newErrors.homeTeam = { ...newErrors.homeTeam, shortName: 'Must be 1-3 uppercase letters' };
    }

    // Validate away team
    if (!awayTeam.name || awayTeam.name.length < 2 || awayTeam.name.length > 30) {
      newErrors.awayTeam = { ...newErrors.awayTeam, name: 'Team name must be 2-30 characters' };
    }
    if (!awayTeam.shortName || !/^[A-Z]{1,3}$/.test(awayTeam.shortName)) {
      newErrors.awayTeam = { ...newErrors.awayTeam, shortName: 'Must be 1-3 uppercase letters' };
    }

    // Warn if same color
    if (homeTeam.color === awayTeam.color) {
      newErrors.awayTeam = { ...newErrors.awayTeam, color: 'Consider using different colors for each team' };
    }

    // Validate date and time
    if (!date) {
      newErrors.date = 'Date and time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        date: new Date(date),
        venue: venue || undefined,
        homeTeam,
        awayTeam,
      });
    }
  };

  const handleShortNameChange = (value: string, side: 'home' | 'away') => {
    const upperValue = value.toUpperCase().slice(0, 3);
    if (side === 'home') {
      setHomeTeam({ ...homeTeam, shortName: upperValue });
    } else {
      setAwayTeam({ ...awayTeam, shortName: upperValue });
    }
  };

  const applyRoster = (roster: SavedRoster, side: 'home' | 'away') => {
    const teamInput: TeamInput = {
      name: roster.teamName,
      shortName: roster.shortName,
      color: roster.color,
    };
    
    if (side === 'home') {
      setHomeTeam(teamInput);
    } else {
      setAwayTeam(teamInput);
    }
    
    onSelectRoster(roster, side);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[var(--space-6)]">
      {/* Date and Venue */}
      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-[var(--space-4)] md:grid-cols-2">
          <Input
            label="Date & Time"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
          <Input
            label="Venue (optional)"
            placeholder="e.g. City Arena"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Teams */}
      <div className="grid gap-[var(--space-6)] lg:grid-cols-2">
        {/* Home Team */}
        <Card className="border-l-4 border-l-team-home">
          <CardHeader>
            <CardTitle className="flex items-center gap-[var(--space-2)]">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: homeTeam.color }}
              />
              Home Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-[var(--space-4)]">
            <Input
              label="Team Name"
              placeholder="e.g. Hawks"
              value={homeTeam.name}
              onChange={(e) => setHomeTeam({ ...homeTeam, name: e.target.value })}
              error={errors.homeTeam?.name}
            />
            <div className="grid grid-cols-2 gap-[var(--space-4)]">
              <Input
                label="Short Name"
                placeholder="HWK"
                value={homeTeam.shortName}
                onChange={(e) => handleShortNameChange(e.target.value, 'home')}
                error={errors.homeTeam?.shortName}
                maxLength={3}
              />
              <Select
                label="Color"
                options={TEAM_COLORS}
                value={homeTeam.color}
                onChange={(e) => setHomeTeam({ ...homeTeam, color: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Away Team */}
        <Card className="border-l-4 border-l-team-away">
          <CardHeader>
            <CardTitle className="flex items-center gap-[var(--space-2)]">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: awayTeam.color }}
              />
              Away Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-[var(--space-4)]">
            <Input
              label="Team Name"
              placeholder="e.g. Bulls"
              value={awayTeam.name}
              onChange={(e) => setAwayTeam({ ...awayTeam, name: e.target.value })}
              error={errors.awayTeam?.name}
            />
            <div className="grid grid-cols-2 gap-[var(--space-4)]">
              <Input
                label="Short Name"
                placeholder="BUL"
                value={awayTeam.shortName}
                onChange={(e) => handleShortNameChange(e.target.value, 'away')}
                error={errors.awayTeam?.shortName}
                maxLength={3}
              />
              <Select
                label="Color"
                options={TEAM_COLORS}
                value={awayTeam.color}
                onChange={(e) => setAwayTeam({ ...awayTeam, color: e.target.value })}
                error={errors.awayTeam?.color}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rosters Quick Select */}
      {recentRosters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Or select from saved rosters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {recentRosters.slice(0, 8).map((roster) => (
                <div key={roster.id} className="flex gap-[var(--space-1)]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyRoster(roster, 'home')}
                    className="flex items-center gap-[var(--space-2)]"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: roster.color }}
                    />
                    {roster.teamName}
                    <span className="text-text-muted text-xs">→ Home</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyRoster(roster, 'away')}
                    className="text-text-muted"
                  >
                    Away
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Next: Add Rosters →
        </Button>
      </div>
    </form>
  );
}
