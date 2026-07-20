import { dashboardData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface EquityBarsProps {
  className?: string;
  compact?: boolean;
  count?: number;
  chartWidth?: number;
  start?: number;
  blueCount?: number;
}

export function EquityBars({ className, compact = false, count, chartWidth, start, blueCount }: EquityBarsProps) {
  const barCount = count ?? (compact ? 16 : dashboardData.equityHeights.length);
  const heights = dashboardData.equityHeights.slice(0, barCount);
  const max = Math.max(...heights);
  const gap = compact ? 5 : 7;
  const barWidth = compact ? 13 : 16;
  const xStart = start ?? (compact ? 10 : 16);
  const width = chartWidth ?? (compact ? 330 : 700);
  const accentStartsAt = blueCount ?? (compact ? 5 : 7);

  return (
    <svg
      aria-label="Portfolio equity increased over the last 30 days"
      className={cn("block w-full", className)}
      role="img"
      viewBox={`0 0 ${width} 204`}
      preserveAspectRatio="none"
    >
      {heights.map((height, index) => {
        const scaled = (height / max) * 187;
        return (
          <rect
            key={`${index}-${height}`}
            x={xStart + index * (barWidth + gap)}
            y={204 - scaled}
            width={barWidth}
            height={scaled}
            rx="3"
            fill={index < accentStartsAt ? "var(--finops-status-info)" : "var(--finops-bg-brand)"}
          />
        );
      })}
    </svg>
  );
}
