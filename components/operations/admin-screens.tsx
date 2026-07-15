"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";

import { changeUserRoleAction, updateSettingsAction } from "@/app/actions/operations";
import { Button, DataTable, Dialog, Drawer, EmptyState, MetricCard, StatusBadge, type DataTableColumn } from "@/components/ui";
import type { AuditLogView, ManagedUser, WorkspaceSettings } from "@/lib/operations";
import type { DemoRole } from "@/lib/session";

const roleCopy: Record<DemoRole, { label: string; description: string }> = {
  viewer: { label: "Viewer", description: "Read market, portfolio and corporate actions" },
  trader: { label: "Trader", description: "Viewer access plus submit/cancel mock orders" },
  admin: { label: "Admin", description: "Full access including users, settings and issuer events" },
};

export function AuditLogsScreen({ logs }: { logs: AuditLogView[] }) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const [action, setAction] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [selectedId, setSelectedId] = useState(logs[0]?.id ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filtered = useMemo(() => logs.filter((log) => {
    const normalized = query.trim().toLowerCase();
    return (!normalized || [log.actor, log.action, log.resource].some((value) => value.toLowerCase().includes(normalized)))
      && (module === "all" || log.module === module)
      && (action === "all" || log.action === action)
      && (outcome === "all" || log.outcome === outcome);
  }), [action, logs, module, outcome, query]);
  const selected = logs.find((log) => log.id === selectedId) ?? filtered[0] ?? null;
  const columns: readonly DataTableColumn<AuditLogView>[] = [
    { key: "time", header: "Time", className: "w-[12%] pl-[14px]", cell: (log) => timeOnly(log.timestamp) },
    { key: "actor", header: "Actor", className: "w-[14%] text-primary", cell: (log) => log.actor },
    { key: "action", header: "Action", className: "w-[17%]", cell: (log) => log.action },
    { key: "module", header: "Module", className: "w-[15%]", cell: (log) => log.module },
    { key: "resource", header: "Resource", className: "w-[19%]", cell: (log) => log.resource },
    { key: "origin", header: "IP / Session", className: "w-[13%]", cell: (log) => log.origin },
    { key: "outcome", header: "Outcome", className: "w-[10%]", cell: (log) => <button type="button" onClick={() => { setSelectedId(log.id); setDrawerOpen(true); }} aria-label={`View ${log.action} audit detail`}><StatusBadge label={log.outcome} tone={log.outcome === "SUCCESS" ? "success" : "danger"} className="h-7" /></button> },
  ];

  return (
    <main className="p-4 lg:p-6">
      <AdminMobileNav current="audit" />
      <PageHeader title="Audit Logs" subtitle="Immutable mock records for security-sensitive and business-critical actions." action={<Button size="medium" variant="secondary" disabled>Export logs</Button>} />
      <section className="mt-[18px] grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminMetric label="Events today" value="184" supporting="Across all modules" />
        <AdminMetric label="Admin actions" value="32" supporting="17.4% of events" />
        <AdminMetric trend="negative" label="Failed actions" value="3" supporting="Reviewed and resolved" />
        <AdminMetric label="Retention" value="365 days" supporting="Mock policy" />
      </section>
      <section aria-label="Audit filters" className="mt-[18px] grid gap-[10px] lg:flex">
        <Search value={query} onChange={setQuery} placeholder="Search action, user, or resource" label="Search audit logs" />
        <SelectFilter label="Module" value={module} onChange={setModule} options={["all", "Trading", "Corporate Actions", "User Management", "Settings", "Market", "Authentication"]} />
        <SelectFilter label="Action" value={action} onChange={setAction} options={["all", ...Array.from(new Set(logs.map((log) => log.action)))]} />
        <SelectFilter label="Outcome" value={outcome} onChange={setOutcome} options={["all", "SUCCESS", "DENIED"]} />
        <button type="button" disabled className="hidden h-10 w-[148px] rounded-[var(--radius-sm)] border border-border-default bg-surface-raised disabled:opacity-100 lg:block">Today</button>
      </section>
      <section className="mt-[18px] hidden overflow-hidden rounded-[14px] border border-border-default bg-surface lg:block">
        {filtered.length ? <DataTable caption="Immutable audit logs" columns={columns} rows={filtered} getRowKey={(log) => log.id} /> : <EmptyState title="No audit logs" description="No immutable records match these filters." />}
      </section>
      <section className="mt-[14px] grid gap-[10px] lg:hidden">
        {filtered.map((log) => <button key={log.id} type="button" onClick={() => { setSelectedId(log.id); setDrawerOpen(true); }} className="rounded-[14px] border border-border-default bg-surface p-[14px] text-left"><span className="flex justify-between gap-3"><strong className="type-data-s">{log.action}</strong><StatusBadge label={log.outcome} tone={log.outcome === "SUCCESS" ? "success" : "danger"} className="h-7" /></span><span className="type-body-s mt-2 block text-secondary">{log.actor} • {log.resource}</span><span className="type-data-s mt-2 block text-muted">{timeOnly(log.timestamp)}</span></button>)}
      </section>
      {selected ? <section className="mt-[18px] flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-border-default bg-surface p-[18px]"><div><p className="type-label-m text-profit">SELECTED AUDIT EVENT</p><h2 className="type-heading-h3 mt-1">{selected.action} • {selected.resource}</h2><p className="type-body-s mt-1 text-secondary">{selected.summary}</p></div><Button size="medium" variant="secondary" onClick={() => setDrawerOpen(true)}>View detail</Button></section> : null}
      <AuditDetailDrawer log={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </main>
  );
}

export function UserManagementScreen({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const selected = users.find((user) => user.id === selectedId) ?? users[0];
  const [nextRole, setNextRole] = useState<DemoRole>(selected?.role ?? "viewer");
  const [announcement, setAnnouncement] = useState("");
  const filtered = useMemo(() => users.filter((user) => {
    const normalized = query.trim().toLowerCase();
    return (!normalized || user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized))
      && (role === "all" || user.role === role)
      && (status === "all" || user.status === status);
  }), [query, role, status, users]);
  const openRoleDialog = (user: ManagedUser) => { setSelectedId(user.id); setNextRole(user.role); setDialogOpen(true); };
  const saveRole = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await changeUserRoleAction(selected.id, nextRole);
      if (result.success) setUsers((current) => current.map((user) => user.id === selected.id ? { ...user, role: nextRole } : user));
      setAnnouncement(result.success ? `${selected.name}'s role changed to ${roleCopy[nextRole].label}` : result.error);
      setDialogOpen(false);
    });
  };
  const columns: readonly DataTableColumn<ManagedUser>[] = [
    { key: "name", header: "Name", className: "w-[18%] pl-[14px] text-primary", cell: (user) => user.name },
    { key: "email", header: "Email", className: "w-[25%]", cell: (user) => user.email },
    { key: "role", header: "Role", className: "w-[13%]", cell: (user) => <StatusBadge label={user.role.toUpperCase()} tone={user.role === "admin" ? "warning" : user.role === "trader" ? "info" : "neutral"} className="h-7" /> },
    { key: "status", header: "Status", className: "w-[13%]", cell: (user) => <StatusBadge label={user.status} tone={user.status === "ACTIVE" ? "success" : "danger"} className="h-7" /> },
    { key: "active", header: "Last active", className: "w-[16%]", cell: (user) => user.lastActive },
    { key: "orders", header: "Orders", className: "w-[7%]", cell: (user) => user.orders },
    { key: "action", header: "Action", className: "w-[8%]", cell: (user) => <button type="button" onClick={() => openRoleDialog(user)} className="text-profit hover:underline">Edit</button> },
  ];

  return (
    <main className="p-4 lg:p-6">
      <AdminMobileNav current="users" />
      <PageHeader title="User Management" subtitle="Manage fictional demo identities and role-based access." action={<Button size="medium" disabled>Create user</Button>} />
      <section className="mt-[18px] grid grid-cols-2 gap-3 lg:grid-cols-4"><AdminMetric label="Total users" value="24" supporting="18 active" /><AdminMetric trend="neutral" label="Viewers" value="11" supporting="Read-only access" /><AdminMetric trend="positive" label="Traders" value="9" supporting="Can submit orders" /><AdminMetric trend="warning" label="Admins" value="4" supporting="Full demo access" /></section>
      <section aria-label="User filters" className="mt-[18px] grid gap-[10px] lg:flex"><Search value={query} onChange={setQuery} placeholder="Search name or email" label="Search users" /><SelectFilter label="Role" value={role} onChange={setRole} options={["all", "viewer", "trader", "admin"]} /><SelectFilter label="Status" value={status} onChange={setStatus} options={["all", "ACTIVE", "DISABLED"]} /><button type="button" disabled className="hidden h-10 w-[148px] rounded-[var(--radius-sm)] border border-border-default bg-surface-raised disabled:opacity-100 lg:block">Recently active</button></section>
      <section className="mt-[18px] hidden overflow-hidden rounded-[14px] border border-border-default bg-surface lg:block">{filtered.length ? <DataTable caption="Managed demo users" columns={columns} rows={filtered} getRowKey={(user) => user.id} /> : <EmptyState title="No users found" description="No demo users match these filters." />}</section>
      <section className="mt-[14px] grid gap-[10px] lg:hidden">{filtered.map((user) => <button key={user.id} type="button" onClick={() => openRoleDialog(user)} className="rounded-[14px] border border-border-default bg-surface p-[14px] text-left"><span className="flex justify-between gap-3"><strong>{user.name}</strong><StatusBadge label={user.role.toUpperCase()} tone={user.role === "admin" ? "warning" : user.role === "trader" ? "info" : "neutral"} className="h-7" /></span><span className="type-body-s mt-2 block text-secondary">{user.email}</span><span className="type-data-s mt-2 block text-muted">{user.lastActive}</span></button>)}</section>
      {selected ? <section className="mt-[18px] flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-border-default bg-surface p-[18px]"><div><p className="type-label-m text-profit">SELECTED USER</p><h2 className="type-heading-h3 mt-1">{selected.name} • {roleCopy[selected.role].label}</h2><p className="type-body-s mt-1 text-secondary">{selected.orders} orders • Last active {selected.lastActive} • MFA disabled</p></div><div className="flex gap-[10px]"><Button size="medium" variant="secondary" onClick={() => openRoleDialog(selected)}>Edit role</Button><Button size="medium" variant="danger" disabled>Disable user</Button></div></section> : null}
      <p aria-live="polite" className="sr-only">{announcement}</p>
      {selected ? <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title={`Edit ${selected.name}'s role`} className="max-w-[540px] p-6 lg:p-8"><h2 className="type-heading-h2">Edit {selected.name}’s role</h2><p className="mt-3 text-secondary">Role changes take effect immediately and are written to Audit Logs.</p><fieldset className="mt-5 space-y-3"><legend className="sr-only">Role</legend>{(Object.keys(roleCopy) as DemoRole[]).map((candidate) => <label key={candidate} className={`flex cursor-pointer items-start gap-3 rounded-[12px] border p-4 ${nextRole === candidate ? "border-border-focus bg-surface" : "border-border-default"}`}><input type="radio" name="role" value={candidate} checked={nextRole === candidate} onChange={() => setNextRole(candidate)} className="mt-1 accent-[var(--finops-bg-brand)]" /><span><strong>{roleCopy[candidate].label}</strong><span className="type-body-s mt-1 block text-secondary">{roleCopy[candidate].description}</span></span></label>)}</fieldset><Button size="large" disabled={pending} onClick={saveRole} className="mt-5 w-full">Save role change</Button><Button size="large" variant="secondary" onClick={() => setDialogOpen(false)} className="mt-3 w-full">Cancel</Button></Dialog> : null}
    </main>
  );
}

export function SettingsScreen({ settings }: { settings: WorkspaceSettings }) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<WorkspaceSettings | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const formSettings = draft ?? settings;
  const change = <Key extends keyof WorkspaceSettings>(key: Key, value: WorkspaceSettings[Key]) => setDraft((current) => ({ ...(current ?? settings), [key]: value }));
  const save = () => startTransition(async () => {
    const result = await updateSettingsAction(formSettings);
    if (result.success) setDraft(null);
    setAnnouncement(result.success ? "Workspace settings saved and audit log created" : result.error);
  });

  return (
    <main className="p-4 lg:p-6">
      <AdminMobileNav current="settings" />
      <PageHeader title="Settings" subtitle="Configure the demo workspace, display and simulated APIs." action={<Button size="medium" disabled={pending} onClick={save}>Save changes</Button>} />
      <div className="mt-[18px] grid gap-[18px] lg:grid-cols-[250px_minmax(0,896px)] lg:gap-[14px]">
        <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto rounded-[14px] border border-border-default bg-surface p-2 lg:flex-col lg:p-3">{["General", "Profile", "Display", "Realtime data", "Notifications", "Mock APIs"].map((item, index) => <button key={item} type="button" disabled={index > 0} className={`h-10 shrink-0 rounded-[8px] px-3 text-left ${index === 0 ? "bg-surface-raised text-primary" : "text-muted"} disabled:opacity-100`}>{item}</button>)}</nav>
        <section className="rounded-[14px] border border-border-default bg-surface p-4 lg:p-[22px]">
          <h2 className="type-heading-h3">General workspace settings</h2><p className="type-body-s mt-1 text-secondary">Defaults apply to this fictional demonstration environment.</p>
          <div className="mt-5 divide-y divide-border-default">
            <SettingRow label="Default landing screen" description="First view after signing in."><select value={formSettings.landingScreen} onChange={(event) => change("landingScreen", event.target.value as WorkspaceSettings["landingScreen"])} className="h-10 rounded-[8px] border border-border-default bg-canvas px-3"><option value="dashboard">Dashboard</option><option value="market">Market</option><option value="portfolio">Portfolio</option></select></SettingRow>
            <SettingRow label="Table density" description="Controls row height across data tables."><select value={formSettings.tableDensity} onChange={(event) => change("tableDensity", event.target.value as WorkspaceSettings["tableDensity"])} className="h-10 rounded-[8px] border border-border-default bg-canvas px-3"><option value="compact">Compact</option><option value="comfortable">Comfortable</option></select></SettingRow>
            <SettingRow label="Quote update cadence" description="Simulated websocket batching frequency."><select value={formSettings.quoteCadence} onChange={(event) => change("quoteCadence", event.target.value as WorkspaceSettings["quoteCadence"])} className="h-10 rounded-[8px] border border-border-default bg-canvas px-3"><option value="250">250 ms</option><option value="500">500 ms</option><option value="1000">1,000 ms</option></select></SettingRow>
            <SettingRow label="Currency display" description="Primary reporting currency."><span className="type-data-s">VND (₫)</span></SettingRow>
            <SettingToggle label="Show paper-trading banner" description="Clearly labels all mock trade surfaces." checked={formSettings.paperTradingBanner} onChange={(checked) => change("paperTradingBanner", checked)} />
            <SettingToggle label="Enable performance telemetry" description="Collect local FPS and render metrics." checked={formSettings.performanceTelemetry} onChange={(checked) => change("performanceTelemetry", checked)} />
            <SettingToggle label="Confirm destructive actions" description="Require confirmation before cancel/disable." checked={formSettings.confirmDestructiveActions} onChange={(checked) => change("confirmDestructiveActions", checked)} />
          </div>
          <div className="mt-5 rounded-[10px] bg-profit-bg p-4"><p className="text-profit">Mock services healthy</p><p className="type-data-s mt-2 text-muted">Market API&nbsp; 32 ms&nbsp;&nbsp; • &nbsp;&nbsp;Trade API&nbsp; 48 ms&nbsp;&nbsp; • &nbsp;&nbsp;Audit stream&nbsp; 21 ms</p></div>
        </section>
      </div>
      <p aria-live="polite" className="sr-only">{announcement}</p>
    </main>
  );
}

function AuditDetailDrawer({ log, open, onOpenChange }: { log: AuditLogView | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!log) return null;
  return <Drawer open={open} onOpenChange={onOpenChange} title="Audit event detail"><StatusBadge label={log.outcome} tone={log.outcome === "SUCCESS" ? "success" : "danger"} className="mt-5" /><p className="type-data-s mt-4 text-muted">{log.id}</p><h3 className="type-heading-h3 mt-2">{log.action}</h3><p className="mt-2 text-secondary">{log.summary}</p><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Actor" value={log.actor} /><Detail label="Module" value={log.module} /><Detail label="Resource" value={log.resource} /><Detail label="Session / IP" value={log.origin} /><Detail label="Timestamp" value={log.timestamp} /></dl><h3 className="mt-7 font-semibold">Before / after</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><CodeBlock label="BEFORE" value={log.before ?? "No previous value"} /><CodeBlock label="AFTER" value={log.after ?? log.summary} /></div><p className="type-data-s mt-6 break-all text-muted">integrity_hash: 8c9f…4d71</p></Drawer>;
}
function AdminMobileNav({ current }: { current: "audit" | "users" | "settings" }) { return <nav aria-label="Administration" className="mb-4 flex gap-2 overflow-x-auto lg:hidden">{[["audit", "/admin/audit-logs", "Audit"], ["users", "/admin/users", "Users"], ["settings", "/admin/settings", "Settings"], ["actions", "/corporate-actions", "Actions"]].map(([key, href, label]) => <Link key={key} href={href} aria-current={current === key ? "page" : undefined} className={`shrink-0 rounded-full border px-3 py-1.5 type-label-m ${current === key ? "border-brand bg-brand text-on-brand" : "border-border-default text-secondary"}`}>{label}</Link>)}</nav>; }
function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action: ReactNode }) { return <header className="flex items-start justify-between gap-4"><div><h1 className="text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">{title}</h1><p className="type-body-s mt-1 text-secondary">{subtitle}</p></div>{action}</header>; }
function AdminMetric(props: React.ComponentProps<typeof MetricCard>) { return <MetricCard {...props} className="h-[108px] w-auto gap-[7px] p-4 [&_[data-slot=trend-bar]]:hidden" />; }
function Search({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) { return <label><span className="sr-only">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-[10px] border border-border-default bg-surface px-[14px] outline-none placeholder:text-muted focus:border-border-focus focus:shadow-[var(--focus-accent)] lg:w-[330px]" /></label>; }
function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-raised px-3 capitalize lg:w-[148px]">{options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label.toLowerCase()}s` : option}</option>)}</select></label>; }
function timeOnly(timestamp: string) { return timestamp.split(" ")[3]?.split(".")[0] ?? timestamp; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="type-label-m uppercase text-muted">{label}</dt><dd className="type-data-s mt-1 break-words">{value}</dd></div>; }
function CodeBlock({ label, value }: { label: string; value: string }) { return <div className="rounded-[10px] bg-canvas p-3"><p className="type-label-m text-muted">{label}</p><pre className="type-data-s mt-2 whitespace-pre-wrap text-secondary">{value}</pre></div>; }
function SettingRow({ label, description, children }: { label: string; description: string; children: ReactNode }) { return <div className="flex min-h-[88px] items-center justify-between gap-4 py-3"><div><p className="font-medium">{label}</p><p className="type-body-s mt-1 text-secondary">{description}</p></div>{children}</div>; }
function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) { return <SettingRow label={label} description={description}><label className="relative inline-flex cursor-pointer"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" /><span className="h-7 w-12 rounded-full bg-border-strong transition-colors peer-checked:bg-brand peer-focus-visible:shadow-[var(--focus-accent)]" /><span className="absolute left-1 top-1 size-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" /></label></SettingRow>; }
