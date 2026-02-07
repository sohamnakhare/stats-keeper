import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, var(--color-primary) 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, var(--color-accent) 2px, transparent 2px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-[var(--space-4)] py-[var(--space-12)] md:py-[var(--space-12)]">
          <div className="text-center space-y-[var(--space-6)]">
            {/* Logo/Title */}
            <div className="space-y-[var(--space-2)]">
              <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight">
                STATS KEEPER
              </h1>
              <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
                Lightning-fast basketball statistics tracking. 
                Any stat in under 2 seconds, built on FIBA standards.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-[var(--space-4)] flex flex-col items-center gap-[var(--space-4)]">
              <Link href="/game/new">
                <Button size="lg" className="text-lg px-8">
                  <svg
                    className="w-5 h-5 mr-[var(--space-2)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Game
                </Button>
              </Link>
              <Link 
                href="/games" 
                className="text-text-secondary hover:text-primary transition-colors flex items-center gap-[var(--space-2)]"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
                </svg>
                View All Games
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-[var(--space-4)] py-[var(--space-12)]">
        <div className="grid gap-[var(--space-6)] md:grid-cols-3">
          {/* Speed */}
          <Card variant="outlined" className="text-center">
            <CardContent className="pt-[var(--space-6)]">
              <div className="
                w-14 h-14 mx-auto mb-[var(--space-4)]
                flex items-center justify-center
                bg-[rgba(0,245,160,0.15)]
                rounded-full
              ">
                <svg
                  className="w-7 h-7 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary mb-[var(--space-2)]">
                Game Speed
              </h3>
              <p className="text-text-secondary text-sm">
                Record any stat in under 2 seconds with large tap targets and intuitive controls.
              </p>
            </CardContent>
          </Card>

          {/* FIBA Compliance */}
          <Card variant="outlined" className="text-center">
            <CardContent className="pt-[var(--space-6)]">
              <div className="
                w-14 h-14 mx-auto mb-[var(--space-4)]
                flex items-center justify-center
                bg-[rgba(0,212,255,0.15)]
                rounded-full
              ">
                <svg
                  className="w-7 h-7 text-highlight"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary mb-[var(--space-2)]">
                FIBA Compliant
              </h3>
              <p className="text-text-secondary text-sm">
                All statistics follow official FIBA Statisticians' Manual 2024 definitions.
              </p>
            </CardContent>
          </Card>

          {/* Data Persistence */}
          <Card variant="outlined" className="text-center">
            <CardContent className="pt-[var(--space-6)]">
              <div className="
                w-14 h-14 mx-auto mb-[var(--space-4)]
                flex items-center justify-center
                bg-[rgba(255,215,0,0.15)]
                rounded-full
              ">
                <svg
                  className="w-7 h-7 text-gold"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary mb-[var(--space-2)]">
                Auto-Save
              </h3>
              <p className="text-text-secondary text-sm">
                Every action is saved instantly. Never lose data, even if the app closes unexpectedly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="bg-bg-secondary py-[var(--space-12)]">
        <div className="max-w-5xl mx-auto px-[var(--space-4)]">
          <div className="text-center mb-[var(--space-8)]">
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-[var(--space-2)]">
              Track Everything
            </h2>
            <p className="text-text-secondary">
              All the stats you need, from basic box scores to advanced metrics.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-4)]">
            {[
              { label: 'Field Goals', icon: '🏀' },
              { label: 'Rebounds', icon: '📊' },
              { label: 'Assists', icon: '🎯' },
              { label: 'Turnovers', icon: '↩️' },
              { label: 'Steals', icon: '🔒' },
              { label: 'Blocks', icon: '✋' },
              { label: 'Fouls', icon: '🚫' },
              { label: 'Free Throws', icon: '🎽' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="
                  p-[var(--space-4)]
                  bg-surface
                  border border-border
                  rounded-[var(--radius-lg)]
                  text-center
                "
              >
                <span className="text-2xl mb-[var(--space-2)] block">{stat.icon}</span>
                <span className="text-sm text-text-secondary">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-[var(--space-4)] py-[var(--space-8)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-[var(--space-4)] text-sm text-text-muted">
          <p>
            Built following the FIBA Statisticians' Manual 2024
          </p>
          <p>
            Stats Keeper v0.1.0
          </p>
        </div>
      </footer>
    </main>
  );
}
