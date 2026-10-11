import React from 'react';

interface RunwayGaugeProps {
  runwayMonths: number;
  runwayDays: number;
  statusLabel: string;
  statusColor: 'rose' | 'amber' | 'emerald' | 'blue';
}

export const RunwayGauge: React.FC<RunwayGaugeProps> = ({
  runwayMonths,
  runwayDays,
  statusLabel,
  statusColor,
}) => {
  // Clamp visually between 0 and 6+ months for the gauge arc
  const clampedMonths = Math.min(6, Math.max(0, runwayMonths));
  const percentage = (clampedMonths / 6) * 100;

  // Arc calculation for SVG semicircle
  const radius = 70;
  const circumference = Math.PI * radius; // 180 degrees
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const colorStyles = {
    rose: {
      stroke: '#f43f5e',
      bgLight: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    amber: {
      stroke: '#f59e0b',
      bgLight: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    blue: {
      stroke: '#3b82f6',
      bgLight: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    emerald: {
      stroke: '#10b981',
      bgLight: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
  }[statusColor];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-28 flex items-center justify-center">
        <svg className="w-48 h-28 overflow-visible" viewBox="0 0 160 90">
          {/* Background Arc */}
          <path
            d="M 10 85 A 70 70 0 0 1 150 85"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active Color Arc */}
          <path
            d="M 10 85 A 70 70 0 0 1 150 85"
            fill="none"
            stroke={colorStyles.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{runwayMonths.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">mo</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {runwayDays} Days
          </span>
        </div>
      </div>

      {/* Status Label Pill */}
      <div className="mt-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${colorStyles.bgLight} ${colorStyles.text} ${colorStyles.border} shadow-2xs`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-2 flex justify-between w-full max-w-[190px] text-[10px] text-slate-400 font-medium">
        <span>0 mo</span>
        <span>3 mo (Safe)</span>
        <span>6+ mo</span>
      </div>
    </div>
  );
};
