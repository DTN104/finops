"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type InputHTMLAttributes } from "react";

import { corporateActionSchema, useOperationsStore, type CorporateAction, type CorporateActionInput, type CorporateActionStatus } from "@/components/operations/operations-store";
import { Button, DataTable, Dialog, EmptyState, MetricCard, StatusBadge, type DataTableColumn, type StatusBadgeTone } from "@/components/ui";

const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const formatDate = (value: string) => value ? formatter.format(new Date(`${value}T00:00:00Z`)) : "—";
const statusTone: Record<CorporateActionStatus, StatusBadgeTone> = { DRAFT: "neutral", ANNOUNCED: "info", UPCOMING: "success", "ACTION NEEDED": "warning" };

export function CorporateActionsList({ canManage }: { canManage: boolean }) {
  const actions = useOperationsStore((state) => state.actions);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => actions.filter((action) => {
    const normalized = query.trim().toLowerCase();
    return (canManage || action.published)
      && (!normalized || action.symbol.toLowerCase().includes(normalized) || action.title.toLowerCase().includes(normalized))
      && (type === "all" || action.type === type)
      && (status === "all" || action.status === status);
  }), [actions, canManage, query, status, type]);

  const columns: readonly DataTableColumn<CorporateAction>[] = [
    { key: "symbol", header: "Symbol", className: "w-[8%] pl-[14px] text-primary", cell: (action) => action.symbol },
    { key: "event", header: "Event", className: "w-[19%]", cell: (action) => action.title },
    { key: "type", header: "Type", className: "w-[17%]", cell: (action) => action.type },
    { key: "ex", header: "Ex-date", className: "w-[13%]", cell: (action) => formatDate(action.exDate) },
    { key: "record", header: "Record date", className: "w-[13%]", cell: (action) => formatDate(action.recordDate) },
    { key: "payment", header: "Payment date", className: "w-[13%]", cell: (action) => formatDate(action.paymentDate) },
    { key: "status", header: "Status", className: "w-[12%]", cell: (action) => <StatusBadge label={action.status} tone={statusTone[action.status]} className="h-7" /> },
    { key: "action", header: "Action", className: "w-[8%]", cell: (action) => <Link href={`/corporate-actions/${action.id}`} className="text-profit hover:underline">View</Link> },
  ];

  return (
    <main className="p-4 lg:p-6">
      <header className="flex items-center justify-between">
        <div><h1 className="text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">Corporate Actions</h1><p className="type-body-s mt-1 hidden text-secondary lg:block">Track and administer simulated issuer events across the portfolio universe.</p></div>
        {canManage ? <Link href="/corporate-actions/new" className="flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-brand px-4 font-medium text-on-brand">New event</Link> : <span className="type-label-m text-muted">READ ONLY</span>}
      </header>

      <section aria-label="Corporate action metrics" className="mt-[18px] grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Upcoming events" value="18" supporting="Next 30 days" className="h-[108px] w-auto gap-[7px] p-4 [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard trend="warning" label="Requires action" value="4" supporting="2 voting • 2 rights" className="h-[108px] w-auto gap-[7px] p-4 [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard trend="positive" label="Cash expected" value="₫18.42M" supporting="Across holdings" className="h-[108px] w-auto gap-[7px] p-4 [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard label="Completed YTD" value="37" supporting="All mock events" className="h-[108px] w-auto gap-[7px] p-4 [&_[data-slot=trend-bar]]:hidden" />
      </section>

      <section aria-label="Corporate action filters" className="mt-[18px] grid gap-[10px] lg:flex">
        <label><span className="sr-only">Search corporate actions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol or event" className="h-10 w-full rounded-[10px] border border-border-default bg-surface px-[14px] outline-none placeholder:text-muted focus:border-border-focus focus:shadow-[var(--focus-accent)] lg:w-[330px]" /></label>
        <FilterSelect label="Event type" value={type} onChange={setType} options={["all", "Cash Dividend", "Voting", "Bonus Shares", "Rights Offering", "Stock Dividend", "Bond Maturity"]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["all", "UPCOMING", "ACTION NEEDED", "ANNOUNCED", "DRAFT"]} />
        <button type="button" disabled className="hidden h-10 w-[148px] rounded-[var(--radius-sm)] border border-border-default bg-surface-raised disabled:opacity-100 lg:block">Next 90 days</button>
      </section>

      <section className="mt-[18px] hidden overflow-hidden rounded-[14px] border border-border-default bg-surface lg:block">
        {filtered.length ? <DataTable caption="Corporate action events" columns={columns} rows={filtered} getRowKey={(action) => action.id} /> : <EmptyState title="No matching events" description="No corporate actions match these filters." />}
      </section>

      <section className="mt-[14px] grid gap-[10px] lg:hidden">
        {filtered.map((action) => (
          <Link key={action.id} href={`/corporate-actions/${action.id}`} className="rounded-[14px] border border-border-default bg-surface p-[14px] focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]">
            <span className="flex items-start justify-between gap-3"><span><strong>{action.symbol}</strong><span className="ml-2 text-secondary">{action.title}</span></span><StatusBadge label={action.status} tone={statusTone[action.status]} className="h-7" /></span>
            <span className="type-data-s mt-3 flex justify-between text-muted"><span>{action.type}</span><span>{formatDate(action.exDate)}</span></span>
          </Link>
        ))}
      </section>

      <section className="mt-[18px] hidden rounded-[14px] border border-border-default bg-surface p-[18px] lg:grid lg:grid-cols-[200px_repeat(4,1fr)]">
        <h2 className="type-heading-h3">Upcoming timeline</h2>
        {["22 Jul|FPT ex-dividend", "28 Jul|VCB voting cutoff", "04 Aug|HPG ex-right", "11 Aug|SSI rights open"].map((item) => { const [date, label] = item.split("|"); return <div key={item} className="border-l border-border-default pl-4"><p className="type-data-s">{date}</p><p className="type-body-s mt-1 text-secondary">{label}</p></div>; })}
      </section>
    </main>
  );
}

export function CorporateActionDetail({ id, canManage }: { id: string; canManage: boolean }) {
  const action = useOperationsStore((state) => state.actions.find((candidate) => candidate.id === id && (canManage || candidate.published)));
  if (!action) return <main className="p-6"><EmptyState title="Corporate action not found" description="This simulated event does not exist." action={<Link href="/corporate-actions" className="text-profit">Back to Corporate Actions</Link>} /></main>;
  const fpt = action.symbol === "FPT";

  return (
    <main className="p-4 lg:p-6">
      <header className="flex items-start justify-between gap-4">
        <div><Link href="/corporate-actions" className="type-label-m text-profit">CORPORATE ACTIONS / {action.symbol}</Link><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">{action.symbol} • {action.title}</h1><StatusBadge label={action.status} tone={statusTone[action.status]} /></div><p className="type-body-s mt-1 text-secondary">{action.type} • Mock issuer data</p></div>
        {canManage ? <Link href={`/corporate-actions/${action.id}/edit`} className="flex h-10 items-center rounded-[var(--radius-sm)] border border-border-default bg-surface-raised px-4 font-medium">Edit event</Link> : null}
      </header>

      <section className="mt-[18px] grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard label="Ex-right date" value={formatDate(action.exDate)} supporting="T+0 entitlement cutoff" />
        <DetailCard label="Record date" value={formatDate(action.recordDate)} supporting="Shareholder register" />
        <DetailCard label="Payment date" value={formatDate(action.paymentDate)} supporting="Expected cash credit" />
        <DetailCard label={action.type} value={action.amountPerShare ? `₫${action.amountPerShare.toLocaleString("en-US")} / share` : "Non-cash event"} supporting={action.currency} />
      </section>

      <div className="mt-[18px] grid gap-[18px] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <section className="rounded-[14px] border border-border-default bg-surface p-[18px]">
          <h2 className="type-heading-h3">Event overview</h2>
          <p className="mt-3 text-secondary">{action.description} Holdings recorded at the mock record date receive entitlements automatically.</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Fact label="Event reference" value={action.id} />
            <Fact label="Source" value={action.sourceReference} />
            <Fact label="Currency" value={action.currency} />
            <Fact label="Tax rate" value={fpt ? "5% withholding" : "Not applicable"} />
            <Fact label="Requires investor action" value={action.status === "ACTION NEEDED" ? "Yes" : "No"} />
          </dl>
        </section>
        <section className="rounded-[14px] border border-border-default bg-surface p-[18px]">
          <h2 className="type-heading-h3">Portfolio impact</h2>
          <div className="mt-3 space-y-3"><Summary label="Eligible holding" value={fpt ? "2,400 shares" : "Simulated position"} /><Summary label="Gross dividend" value={fpt ? "₫4,800,000" : "Calculated at record date"} /><Summary label="Withholding tax" value={fpt ? "-₫240,000" : "—"} /><Summary label="Net cash expected" value={fpt ? "₫4,560,000" : "Pending"} profit={fpt} /></div>
          <p className="type-body-s mt-5 rounded-[10px] bg-profit-bg p-3 text-profit">Automatic settlement — no real funds or securities are involved.</p>
        </section>
      </div>

      <section className="mt-[18px] rounded-[14px] border border-border-default bg-surface p-[18px]">
        <h2 className="type-heading-h3">Audit trail</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3"><AuditStep time="14 Jul 09:12" actor="System Feed" action="Event imported" /><AuditStep time="14 Jul 09:18" actor="Mina Tran" action="Validated dates and amount" /><AuditStep time="14 Jul 09:22" actor="Mina Tran" action="Published event" /></div>
      </section>
    </main>
  );
}

export function CorporateActionForm({ actor, id }: { actor: string; id?: string }) {
  const router = useRouter();
  const existing = useOperationsStore((state) => id ? state.actions.find((action) => action.id === id) : undefined);
  const saveAction = useOperationsStore((state) => state.saveAction);
  const publishAction = useOperationsStore((state) => state.publishAction);
  const [values, setValues] = useState<CorporateActionInput>(() => existing ?? {
    symbol: "FPT", title: "2026 interim dividend", type: "Cash Dividend", currency: "VND", exDate: "2026-07-22", recordDate: "2026-07-23", paymentDate: "2026-08-08", amountPerShare: 2_000, description: "FPT Corporation will pay a simulated interim cash dividend of ₫2,000 per eligible share.", sourceReference: "MOCK-ISSUER-FPT-0714",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewOpen, setReviewOpen] = useState(false);

  const validated = () => {
    const result = corporateActionSchema.safeParse(values);
    if (result.success) { setErrors({}); return result.data; }
    setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
    return null;
  };
  const saveDraft = () => {
    const input = validated();
    if (!input) return;
    const action = saveAction(input, actor, id);
    router.push(`/corporate-actions/${action.id}`);
  };
  const review = (event: FormEvent) => { event.preventDefault(); if (validated()) setReviewOpen(true); };
  const publish = () => {
    const input = validated();
    if (!input) return;
    const action = saveAction(input, actor, id);
    publishAction(action.id, actor);
    setReviewOpen(false);
    router.push(`/corporate-actions/${action.id}`);
  };
  const set = <Key extends keyof CorporateActionInput>(key: Key, value: CorporateActionInput[Key]) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <>
      <form onSubmit={review} className="p-4 lg:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="type-label-m text-profit">ADMIN WORKFLOW</p><h1 className="mt-2 text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">{existing ? "Edit" : "Create"} corporate action</h1><p className="type-body-s mt-1 text-secondary">Add a simulated issuer event to the FinOps universe.</p></div>
          <div className="flex gap-[10px]"><Button size="medium" variant="secondary" onClick={saveDraft}>Save draft</Button><Button size="medium" type="submit">Review event</Button></div>
        </header>

        <div className="mt-[18px] grid gap-[18px] lg:grid-cols-[minmax(0,760px)_minmax(320px,386px)] lg:gap-[14px]">
          <section className="rounded-[14px] border border-border-default bg-surface p-4 lg:p-[18px]">
            <h2 className="type-heading-h3">Event information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Symbol" value={String(values.symbol)} error={errors.symbol} onChange={(event) => set("symbol", event.target.value)} className="sm:col-span-2" />
              <Field label="Event title" value={String(values.title)} error={errors.title} onChange={(event) => set("title", event.target.value)} className="sm:col-span-2" />
              <label className="flex flex-col gap-[7px]"><span className="type-label-m uppercase text-muted">Event type</span><select value={values.type} onChange={(event) => set("type", event.target.value as CorporateActionInput["type"])} className="h-11 rounded-[10px] border border-border-default bg-canvas px-3 outline-none focus:border-border-focus">{["Cash Dividend", "Voting", "Bonus Shares", "Rights Offering", "Stock Dividend", "Bond Maturity"].map((value) => <option key={value}>{value}</option>)}</select></label>
              <Field label="Currency" value="VND" disabled />
              <Field label="Ex-right date" type="date" value={String(values.exDate)} error={errors.exDate} onChange={(event) => set("exDate", event.target.value)} />
              <Field label="Record date" type="date" value={String(values.recordDate)} error={errors.recordDate} onChange={(event) => set("recordDate", event.target.value)} />
              <Field label="Payment date" type="date" value={String(values.paymentDate)} error={errors.paymentDate} onChange={(event) => set("paymentDate", event.target.value)} />
              <Field label="Amount per share" type="number" min="0" step="100" value={String(values.amountPerShare)} error={errors.amountPerShare} onChange={(event) => set("amountPerShare", Number(event.target.value))} />
              <label className="flex flex-col gap-[7px] sm:col-span-2"><span className="type-label-m uppercase text-muted">Description</span><textarea value={values.description} onChange={(event) => set("description", event.target.value)} className="min-h-[100px] rounded-[10px] border border-border-default bg-canvas p-3 outline-none focus:border-border-focus focus:shadow-[var(--focus-accent)]" />{errors.description ? <span className="type-body-s text-loss">{errors.description}</span> : null}</label>
              <Field label="Source reference" value={String(values.sourceReference)} error={errors.sourceReference} onChange={(event) => set("sourceReference", event.target.value)} className="sm:col-span-2" />
            </div>
          </section>
          <section className="h-fit rounded-[14px] border border-border-default bg-surface p-[18px]">
            <div className="flex items-center justify-between"><h2 className="type-heading-h3">Validation summary</h2><StatusBadge label="DRAFT" /></div>
            <div className="mt-4 divide-y divide-border-default"><ValidationRow label="Required fields" value="10 / 10 complete" profit /><ValidationRow label="Date sequence" value={Object.keys(errors).some((key) => key.includes("Date")) ? "Check dates" : "Valid"} profit={!Object.keys(errors).some((key) => key.includes("Date"))} /><ValidationRow label="Eligible holdings" value="1 portfolio position" /><ValidationRow label="Estimated cash impact" value="₫4.56M net" profit /><ValidationRow label="Duplicate check" value="No conflict found" profit /></div>
            <div className="mt-4 rounded-[10px] bg-warning-bg p-3"><p className="font-medium text-warning">Publishing rule</p><p className="type-body-s mt-1 text-secondary">Only Admin users may publish or edit issuer events.</p></div>
          </section>
        </div>
      </form>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen} title="Review and publish corporate action" className="max-h-[calc(100dvh-32px)] max-w-[560px] p-6 lg:p-8">
        <p className="type-label-m text-profit">REVIEW & PUBLISH</p>
        <h2 className="mt-3 text-[26px] leading-8 font-bold lg:text-[32px] lg:leading-10">Publish {String(values.symbol)} cash dividend?</h2>
        <p className="mt-3 text-secondary">Publishing makes this event visible to Viewer and Trader roles and creates an audit entry.</p>
        <div className="mt-5 rounded-[14px] border border-border-default bg-surface p-4"><Summary label="Symbol" value={String(values.symbol)} /><Summary label="Type" value={values.type.toUpperCase()} /><Summary label="Ex-right" value={formatDate(String(values.exDate)).toUpperCase()} /><Summary label="Record date" value={formatDate(String(values.recordDate)).toUpperCase()} /><Summary label="Payment date" value={formatDate(String(values.paymentDate)).toUpperCase()} /><Summary label="Net portfolio impact" value="+₫4.56M" profit /></div>
        <Button size="large" onClick={publish} className="mt-5 w-full">Publish event</Button>
        <Button size="large" variant="secondary" onClick={() => setReviewOpen(false)} className="mt-3 w-full">Back to edit</Button>
      </Dialog>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-raised px-3 capitalize outline-none focus:border-border-focus lg:w-[148px]">{options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label.toLowerCase()}s` : option}</option>)}</select></label>;
}
function DetailCard({ label, value, supporting }: { label: string; value: string; supporting: string }) {
  return <article className="rounded-[14px] border border-border-default bg-surface p-4"><p className="type-body-s text-secondary">{label}</p><p className="type-data-m mt-[7px]">{value}</p><p className="type-data-s mt-[7px] text-muted">{supporting}</p></article>;
}
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="type-label-m uppercase text-muted">{label}</dt><dd className="type-data-s mt-1">{value}</dd></div>; }
function Summary({ label, value, profit = false }: { label: string; value: string; profit?: boolean }) { return <div className="flex min-h-8 items-center justify-between gap-4"><span className="type-body-s text-secondary">{label}</span><span className={`type-data-s text-right ${profit ? "text-profit" : "text-primary"}`}>{value}</span></div>; }
function AuditStep({ time, actor, action }: { time: string; actor: string; action: string }) { return <div className="rounded-[10px] bg-canvas p-3"><p className="type-data-s text-muted">{time}</p><p className="mt-1 font-medium">{actor}</p><p className="type-body-s text-secondary">{action}</p></div>; }
function ValidationRow({ label, value, profit = false }: { label: string; value: string; profit?: boolean }) { return <div className="py-3"><p className="type-body-s text-secondary">{label}</p><p className={`type-data-s mt-1 ${profit ? "text-profit" : "text-primary"}`}>{value}</p></div>; }
function Field({ label, error, className = "", ...props }: { label: string; error?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className={`flex flex-col gap-[7px] ${className}`}><span className="type-label-m uppercase text-muted">{label}</span><input {...props} aria-invalid={Boolean(error) || undefined} className="h-11 rounded-[10px] border border-border-default bg-canvas px-3 outline-none focus:border-border-focus focus:shadow-[var(--focus-accent)] aria-[invalid=true]:border-border-error" />{error ? <span className="type-body-s text-loss">{error}</span> : null}</label>;
}
