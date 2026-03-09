'use client';

interface ScoreGaugeProps {
  score: number;
  className?: string;
}

function getScoreColor(score: number): { text: string; stroke: string; bg: string; label: string } {
  if (score < 40) {
    return {
      text: 'text-red-600',
      stroke: 'stroke-red-500',
      bg: 'bg-red-50',
      label: 'Critico',
    };
  }
  if (score <= 70) {
    return {
      text: 'text-amber-500',
      stroke: 'stroke-amber-400',
      bg: 'bg-amber-50',
      label: 'Moderado',
    };
  }
  return {
    text: 'text-green-600',
    stroke: 'stroke-green-500',
    bg: 'bg-green-50',
    label: 'Bom',
  };
}

export function ScoreGauge({ score, className = '' }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const colors = getScoreColor(clampedScore);

  // SVG semicircular gauge
  const radius = 60;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" role="meter" aria-valuenow={clampedScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Score do imovel: ${clampedScore} de 100`}>
        <svg width="160" height="100" viewBox="0 0 160 100">
          {/* Background arc */}
          <path
            d="M 10 90 A 60 60 0 0 1 150 90"
            fill="none"
            className="stroke-gray-200"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 10 90 A 60 60 0 0 1 150 90"
            fill="none"
            className={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={`text-3xl font-bold ${colors.text}`}>{clampedScore}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
        {colors.label}
      </span>
    </div>
  );
}
