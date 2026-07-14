export function PositionPerformanceChart() {
  const points = [
    [20, 166], [52, 160], [85, 176], [116, 150], [148, 160], [180, 137], [212, 145], [244, 124], [277, 135], [309, 112],
    [341, 122], [374, 98], [406, 108], [438, 84], [470, 96], [503, 70], [535, 82], [568, 54], [600, 66], [633, 41], [666, 51],
  ];

  return (
    <svg viewBox="0 0 720 250" role="img" aria-label="FPT position performance increased across the displayed period" className="size-full">
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        return <line key={`${point[0]}-${point[1]}`} x1={point[0]} y1={point[1]} x2={next[0]} y2={next[1]} stroke="var(--finops-status-profit)" strokeWidth="3" strokeLinecap="round" />;
      })}
    </svg>
  );
}
