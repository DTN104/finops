import type { AllocationSlice } from "@/lib/portfolio";

const toneClasses: Record<AllocationSlice["tone"], string> = {
  brand: "bg-brand",
  info: "bg-info",
  profit: "bg-profit",
  warning: "bg-warning",
  neutral: "bg-border-strong",
};

export function AllocationList({ allocations, mobile = false }: { allocations: AllocationSlice[]; mobile?: boolean }) {
  const visible = mobile
    ? allocations.filter((allocation) => allocation.label !== "Consumer")
    : allocations;

  return (
    <section className={mobile ? "h-[212px] rounded-[14px] border border-border-default bg-surface p-[14px]" : "h-[304px] rounded-[14px] border border-border-default bg-surface p-[18px]"}>
      <h2 className={mobile ? "type-label-l" : "type-heading-h3"}>Allocation</h2>
      <div className={mobile ? "mt-3 grid gap-[10px]" : "mt-[14px] grid gap-3"}>
        {visible.map((allocation) => (
          <div key={allocation.label}>
            <div className="flex items-center justify-between">
              <span className="type-body-s text-secondary">{allocation.label}</span>
              <span className="type-data-s text-primary">{allocation.percent.toFixed(0)}%</span>
            </div>
            <div className={`${mobile ? "mt-[5px] h-[6px]" : "mt-[6px] h-2"} overflow-hidden rounded-full bg-canvas`}>
              <div aria-hidden="true" className={`h-full rounded-full ${toneClasses[allocation.tone]}`} style={{ width: `${Math.min(100, allocation.percent)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
