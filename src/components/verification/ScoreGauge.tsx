'use client';

import type { VeracityLevel } from '@/lib/types';
import { VERACITY_CONFIG } from '@/lib/types';

interface ScoreGaugeProps {
  score: number;
  veracityLevel: VeracityLevel;
}

export function ScoreGauge({ score, veracityLevel }: ScoreGaugeProps) {
  const config = VERACITY_CONFIG[veracityLevel];

  // SVG gauge calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getGaugeColor = () => {
    if (score >= 80) return '#00E5A0'; // neon
    if (score >= 50) return '#F59E0B'; // trend/amber
    return '#FF406A'; // alert
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getGaugeColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color: getGaugeColor() }}
          >
            {score}
          </span>
          <span className="text-xs text-muted-foreground mt-1">de 100</span>
        </div>
      </div>

      <div className="text-center">
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            veracityLevel === 'verified'
              ? 'bg-neon/15 text-neon'
              : veracityLevel === 'dubious'
              ? 'bg-trend/15 text-trend'
              : 'bg-alert/15 text-alert'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-current" />
          {config.label}
        </span>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs">
          {config.description}
        </p>
      </div>
    </div>
  );
}
