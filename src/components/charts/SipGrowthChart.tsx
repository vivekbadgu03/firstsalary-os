import React, { useState } from 'react';
import { formatINR } from '../../lib/calculations';

interface SipYearData {
  year: number;
  invested: number;
  futureValue: number;
  returns: number;
}

interface SipGrowthChartProps {
  yearlyData: SipYearData[];
  monthlyInvestment: number;
}

export const SipGrowthChart: React.FC<SipGrowthChartProps> = ({
  yearlyData,
  monthlyInvestment,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!yearlyData || yearlyData.length === 0) return null;

  const maxYear = yearlyData[yearlyData.length - 1].year;
  const maxFV = yearlyData[yearlyData.length - 1].futureValue;
  const safeMaxFV = maxFV > 0 ? maxFV : 10000;

  // SVG Chart Dimensions
  const width = 540;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Build points for paths
  const fvPoints = yearlyData.map((d, i) => {
    const x = padding.left + (i / (yearlyData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.futureValue / safeMaxFV) * graphHeight;
    return `${x},${y}`;
  });

  const investedPoints = yearlyData.map((d, i) => {
    const x = padding.left + (i / (yearlyData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.invested / safeMaxFV) * graphHeight;
    return `${x},${y}`;
  });

  const fvPath = `M ${fvPoints.join(' L ')}`;
  const investedPath = `M ${investedPoints.join(' L ')}`;

  // Area path for gradient fill
  const firstPointX = padding.left;
  const lastPointX = padding.left + graphWidth;
  const bottomY = padding.top + graphHeight;
  const fvArea = `M ${firstPointX},${bottomY} L ${fvPoints.join(' L ')} L ${lastPointX},${bottomY} Z`;

  const activeData = hoveredIndex !== null ? yearlyData[hoveredIndex] : yearlyData[yearlyData.length - 1];

  return (
    <div className="space-y-3">
      {/* Interactive Hover Card Display */}
      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">
            Year {activeData.year} Milestone:
          </span>
          <span className="text-slate-500">
            (Invested: {formatINR(activeData.invested)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-emerald-700 text-sm">
            Total: {formatINR(activeData.futureValue)}
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            +{formatINR(activeData.returns)} gain
          </span>
        </div>
      </div>

      {/* SVG Responsive Area Chart */}
      <div className="relative w-full overflow-hidden rounded-xl bg-white border border-slate-200/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left + graphWidth}
            y2={padding.top}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + graphHeight / 2}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight / 2}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={bottomY}
            x2={padding.left + graphWidth}
            y2={bottomY}
            stroke="#e2e8f0"
          />

          {/* Area Fill */}
          <path d={fvArea} fill="url(#emeraldAreaGrad)" />

          {/* Lines */}
          <path
            d={investedPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <path
            d={fvPath}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Hover Vertical Line */}
          {hoveredIndex !== null && (
            <line
              x1={padding.left + (hoveredIndex / (yearlyData.length - 1)) * graphWidth}
              y1={padding.top}
              x2={padding.left + (hoveredIndex / (yearlyData.length - 1)) * graphWidth}
              y2={bottomY}
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Interactive Scrubber Circles */}
          {yearlyData.map((d, i) => {
            const x = padding.left + (i / (yearlyData.length - 1)) * graphWidth;
            const y = padding.top + graphHeight - (d.futureValue / safeMaxFV) * graphHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g key={d.year}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth={isHovered ? 3 : 2}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(i)}
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          <text
            x={padding.left}
            y={height - 8}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="start"
          >
            Year 1
          </text>
          <text
            x={padding.left + graphWidth / 2}
            y={height - 8}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
          >
            Year {Math.round(maxYear / 2)}
          </text>
          <text
            x={padding.left + graphWidth}
            y={height - 8}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="end"
          >
            Year {maxYear}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-slate-400 border-dashed" />
            <span>Cumulative Invested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="font-semibold text-slate-700">Projected Total Wealth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
