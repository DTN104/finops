import { cn } from "@/lib/utils";

const falling = new Set([0, 5, 8, 11, 14, 17, 20]);
const desktopY = [194, 185, 188, 175, 169, 172, 159, 151, 155, 139, 143, 130, 125, 128, 115, 105, 109, 93, 84, 89, 74, 69, 61];

function Candles({ mobile }: { mobile: boolean }) {
  const count = mobile ? 18 : 23;
  const width = mobile ? 330 : 720;
  const height = mobile ? 230 : 320;
  const step = mobile ? 17 : 29;
  const start = mobile ? 15 : 24;
  const wickHeight = mobile ? 28 : 40;
  const bodyWidth = mobile ? 8 : 12;
  const bodyOffset = mobile ? 6 : 8;
  const bodyHeights = mobile ? [18, 23, 28] : [24, 32, 40];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="FPT candlestick chart showing a rising price trend" className="size-full">
      {Array.from({ length: count }, (_, index) => {
        const x = start + index * step;
        const y = mobile ? 141 - index * 5.35 + (index % 3 === 2 ? 5 : 0) : desktopY[index];
        const color = falling.has(index) ? "var(--finops-status-loss)" : "var(--finops-status-profit)";
        const bodyHeight = bodyHeights[index % 3];
        return (
          <g key={index}>
            <rect x={x} y={y} width="2" height={wickHeight} rx="1" fill={color} />
            <rect x={x - (bodyWidth - 2) / 2} y={y + bodyOffset} width={bodyWidth} height={bodyHeight} rx="2" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

export function CandlestickChart({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[10px] bg-canvas", className)}>
      <div className="hidden size-full lg:block"><Candles mobile={false} /></div>
      <div className="size-full lg:hidden"><Candles mobile /></div>
    </div>
  );
}
