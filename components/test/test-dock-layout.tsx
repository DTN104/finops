"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelHeaderProps,
  type IDockviewPanelProps,
  type Position,
  type SerializedDockview,
  themeDark,
  themeLight,
} from "dockview-react";
import { GripVertical, Maximize2, Minimize2, Plus, RotateCcw, Save, X } from "lucide-react";

import { saveDashboardLayoutAction } from "@/app/actions/dashboard-layout";
import { EquityBars } from "@/components/dashboard/equity-bars";
import { DataTable, type DataTableColumn } from "@/components/ui";
import type { DashboardLayout } from "@/lib/dashboard-layout";

interface Holding {
  symbol: string;
  quantity: string;
  last: string;
  value: string;
  return: string;
  direction: "up" | "down";
}

interface DashboardMetric {
  label: string;
  value: string;
  supporting: string;
  trend: "positive" | "negative" | "warning" | "neutral";
}

interface WatchQuote {
  symbol: string;
  price: string;
  change: string;
  direction: "up" | "down";
}

export interface DashboardDockData {
  netAssetValue: string;
  totalReturn: string;
  totalReturnPercent: string;
  netDirection: "up" | "down";
  metrics: DashboardMetric[];
  watchlist: WatchQuote[];
  holdings: Holding[];
}

interface EditState {
  editing: boolean;
  draggingPanelId: string | null;
  targetGroupId: string | null;
  targetPosition: Position | null;
  minimize: (panelId: string) => void;
}

const PANEL_META = {
  "account-overview": { component: "accountOverview", title: "Account overview" },
  "equity-curve": { component: "equityCurve", title: "Equity curve" },
  watchlist: { component: "watchlist", title: "Watchlist" },
  "top-holdings": { component: "topHoldings", title: "Top holdings" },
} as const;

type PanelId = keyof typeof PANEL_META;

const holdingColumns: readonly DataTableColumn<Holding>[] = [
  { key: "symbol", header: "Symbol", className: "w-[15%] text-primary", cell: (row) => row.symbol },
  { key: "quantity", header: "Quantity", className: "w-[14%]", cell: (row) => row.quantity },
  { key: "last", header: "Last", className: "w-[17%]", cell: (row) => row.last },
  { key: "value", header: "Market value", className: "w-[17%]", cell: (row) => row.value },
  {
    key: "return",
    header: "Return",
    className: "w-[12%]",
    cell: (row) => (
      <span className={row.direction === "up" ? "text-profit" : "text-loss"}>
        <span className="sr-only">{row.direction === "up" ? "Gain" : "Loss"}: </span>
        {row.return}
      </span>
    ),
  },
];

const DashboardPanelContext = createContext<{ data: DashboardDockData; edit: EditState } | null>(null);

function useDashboardPanel() {
  const context = useContext(DashboardPanelContext);
  if (!context) throw new Error("Dashboard panel rendered outside Dockview");
  return context;
}

function DockTarget({ groupId }: { groupId: string }) {
  const { edit } = useDashboardPanel();
  if (!edit.draggingPanelId || edit.targetGroupId !== groupId || !edit.targetPosition) return null;
  const label = edit.targetPosition === "center" ? "Create tab group" : `Dock ${edit.targetPosition}`;
  return (
    <div className={`finops-dock-target finops-dock-target--${edit.targetPosition}`} aria-live="polite">
      <span className="finops-dock-target__pill">{label}</span>
      <span className="sr-only">Active drop direction: {label}</span>
    </div>
  );
}

function PanelFrame({ panelId, groupId, children }: { panelId: PanelId; groupId: string; children: React.ReactNode }) {
  const { edit } = useDashboardPanel();
  const className = [
    "finops-dock-panel",
    edit.draggingPanelId === panelId ? "is-drag-source" : "",
    edit.targetGroupId === groupId ? "is-active-target" : "",
  ].filter(Boolean).join(" ");
  return (
    <div className={className} data-panel-id={panelId}>
      {children}
      <DockTarget groupId={groupId} />
    </div>
  );
}

function AccountOverviewPanel({ api }: IDockviewPanelProps) {
  const { data } = useDashboardPanel();
  return (
    <PanelFrame panelId="account-overview" groupId={api.group.id}>
      <div className="h-full overflow-auto px-4 pb-3">
        <div className="flex h-10 items-center justify-end"><Link href="/market" className="text-secondary hover:text-profit focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]">View market</Link></div>
        {data.watchlist.map((quote) => (
          <div key={quote.symbol} className="grid min-h-11 grid-cols-3 items-center border-t border-[var(--color-rule)] type-data-s">
            <span className="type-data-m text-primary">{quote.symbol}</span>
            <span className="text-center text-secondary">{quote.price}</span>
            <span className={`text-right ${quote.direction === "up" ? "text-profit" : "text-loss"}`}><span className="sr-only">{quote.direction === "up" ? "Gain" : "Loss"}: </span>{quote.change}</span>
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

function EquityCurvePanel({ api }: IDockviewPanelProps) {
  return (
    <PanelFrame panelId="equity-curve" groupId={api.group.id}>
      <figure className="flex h-full min-h-0 flex-col p-4">
        <div className="flex items-center justify-between type-data-s"><span className="text-secondary">Simulated close values</span><span className="text-profit">30D</span></div>
        <div className="mt-2 min-h-0 flex-1 rounded-[var(--radius-md)] bg-[var(--color-paper)]"><EquityBars className="h-full" /></div>
        <figcaption className="mt-2 flex justify-between type-data-s text-secondary"><span>30 trading days</span><span>500 ms feed</span></figcaption>
      </figure>
    </PanelFrame>
  );
}

function WatchlistPanel({ api }: IDockviewPanelProps) {
  const { data } = useDashboardPanel();
  return (
    <PanelFrame panelId="watchlist" groupId={api.group.id}>
      <div className="h-full overflow-auto px-4 pb-3">
        <div className="flex h-10 items-center justify-end"><Link href="/market" className="text-secondary hover:text-profit focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]">View market</Link></div>
        {data.watchlist.map((quote) => (
          <div key={quote.symbol} className="grid min-h-11 grid-cols-3 items-center border-t border-[var(--color-rule)] type-data-s">
            <span className="type-data-m text-primary">{quote.symbol}</span>
            <span className="text-center text-secondary">{quote.price}</span>
            <span className={`text-right ${quote.direction === "up" ? "text-profit" : "text-loss"}`}><span className="sr-only">{quote.direction === "up" ? "Gain" : "Loss"}: </span>{quote.change}</span>
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

function TopHoldingsPanel({ api }: IDockviewPanelProps) {
  const { data } = useDashboardPanel();
  return (
    <PanelFrame panelId="top-holdings" groupId={api.group.id}>
      <div className="h-full overflow-auto px-4 pb-3">
        <div className="flex h-10 items-center justify-end"><Link href="/portfolio" className="text-secondary hover:text-profit focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]">View portfolio →</Link></div>
        <DataTable caption="Top portfolio holdings" columns={holdingColumns} rows={data.holdings} getRowKey={(row) => row.symbol} hideHeader />
      </div>
    </PanelFrame>
  );
}

function DashboardTab({ api, containerApi }: IDockviewPanelHeaderProps) {
  const { edit } = useDashboardPanel();
  const [isMaximized, setIsMaximized] = useState(api.isMaximized());
  const panelId = api.id as PanelId;
  useEffect(() => {
    const subscription = containerApi.onDidMaximizedGroupChange(() => setIsMaximized(api.isMaximized()));
    return () => subscription.dispose();
  }, [api, containerApi]);
  return (
    <div className="finops-dock-tab" onPointerDown={(event) => {
      if (!(event.target as Element).closest("[data-dock-grip]")) event.stopPropagation();
    }}>
      <span data-dock-grip className="finops-dock-tab__grip" role="button" tabIndex={edit.editing ? 0 : -1} aria-label={`Drag ${api.title ?? "panel"}`}>
        <GripVertical aria-hidden="true" size={16} />
      </span>
      <button type="button" className="finops-dock-tab__title" onClick={(event) => { event.stopPropagation(); api.setActive(); }}>{api.title}</button>
      <span className="finops-dock-tab__actions">
        <button type="button" aria-label={`Close ${api.title}`} onClick={(event) => { event.stopPropagation(); edit.minimize(panelId); }}><X aria-hidden="true" size={15} /></button>
        <button type="button" aria-label={isMaximized ? `Restore ${api.title}` : `Maximize ${api.title}`} onClick={(event) => {
          event.stopPropagation();
          if (isMaximized) api.exitMaximized();
          else api.maximize();
        }}>{isMaximized ? <Minimize2 aria-hidden="true" size={15} /> : <Maximize2 aria-hidden="true" size={15} />}</button>
      </span>
    </div>
  );
}

const components = {
  accountOverview: AccountOverviewPanel,
  equityCurve: EquityCurvePanel,
  watchlist: WatchlistPanel,
  topHoldings: TopHoldingsPanel,
};

const finopsDockviewThemes = {
  dark: { ...themeDark, gap: 12 },
  light: { ...themeLight, gap: 12 },
};

function addDefaultPanels(api: DockviewApi) {
  api.clear();
  const account = api.addPanel({ id: "account-overview", component: "accountOverview", title: "Account overview" });
  const equity = api.addPanel({ id: "equity-curve", component: "equityCurve", title: "Equity curve", position: { referencePanel: account, direction: "below" } });
  const watchlist = api.addPanel({ id: "watchlist", component: "watchlist", title: "Watchlist", position: { referencePanel: equity, direction: "right" } });
  const holdings = api.addPanel({ id: "top-holdings", component: "topHoldings", title: "Top holdings", position: { direction: "below" } });
  requestAnimationFrame(() => {
    account.group.api.setSize({ height: 190 });
    watchlist.group.api.setSize({ width: 390 });
    holdings.group.api.setSize({ height: 210 });
  });
}

function createDragGhost(event: DragEvent, title: string, targetTitle: string) {
  const ghost = document.createElement("div");
  ghost.className = "finops-dock-drag-ghost";
  const grip = document.createElement("span");
  grip.textContent = "⋮⋮";
  const copy = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = title;
  const small = document.createElement("small");
  small.textContent = `Move beside ${targetTitle}`;
  copy.append(strong, small);
  ghost.append(grip, copy);
  document.body.append(ghost);
  event.dataTransfer?.setDragImage(ghost, 24, 24);
  requestAnimationFrame(() => ghost.remove());
}

export function TestDockLayout({ data, initialLayout }: { data: DashboardDockData; initialLayout: DashboardLayout | null }) {
  const [api, setApi] = useState<DockviewApi | null>(null);
  const [dockviewTheme, setDockviewTheme] = useState(finopsDockviewThemes.dark);
  const [editing, setEditing] = useState(false);
  const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);
  const [target, setTarget] = useState<{ groupId: string | null; position: Position | null }>({ groupId: null, position: null });
  const [minimizedPanelIds, setMinimizedPanelIds] = useState<PanelId[]>((initialLayout?.minimizedPanelIds ?? []).filter((id): id is PanelId => id in PANEL_META));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const beforeEdit = useRef<{ dockview: SerializedDockview; minimized: PanelId[] } | null>(null);

  const minimize = useCallback((panelId: string) => {
    if (!api || !(panelId in PANEL_META)) return;
    const panel = api.getPanel(panelId);
    if (panel) api.removePanel(panel);
    setMinimizedPanelIds((current) => current.includes(panelId as PanelId) ? current : [...current, panelId as PanelId]);
  }, [api]);

  const editState = useMemo<EditState>(() => ({ editing, draggingPanelId, targetGroupId: target.groupId, targetPosition: target.position, minimize }), [draggingPanelId, editing, minimize, target]);

  const restorePanel = useCallback((panelId: PanelId) => {
    if (!api || api.getPanel(panelId)) return;
    const meta = PANEL_META[panelId];
    api.addPanel({ id: panelId, component: meta.component, title: meta.title, position: { direction: "right" } });
    setMinimizedPanelIds((current) => current.filter((id) => id !== panelId));
  }, [api]);

  const cancelEdit = useCallback(() => {
    if (api && beforeEdit.current) {
      api.fromJSON(beforeEdit.current.dockview);
      setMinimizedPanelIds(beforeEdit.current.minimized);
    }
    setEditing(false);
    setDraggingPanelId(null);
    setTarget({ groupId: null, position: null });
    setMessage("");
  }, [api]);

  useEffect(() => {
    api?.updateOptions({ locked: !editing });
  }, [api, editing]);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setDockviewTheme(root.dataset.theme === "light" ? finopsDockviewThemes.light : finopsDockviewThemes.dark);
    const observer = new MutationObserver(updateTheme);
    updateTheme();
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelEdit();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cancelEdit, editing]);

  const onReady = useCallback((event: DockviewReadyEvent) => {
    const nextApi = event.api;
    try {
      if (initialLayout) nextApi.fromJSON(initialLayout.dockview as unknown as SerializedDockview);
      else addDefaultPanels(nextApi);
    } catch {
      addDefaultPanels(nextApi);
    }
    nextApi.updateOptions({ locked: true });
    nextApi.onWillDragPanel((dragEvent) => {
      setDraggingPanelId(dragEvent.panel.id);
      if (dragEvent.nativeEvent instanceof DragEvent) {
        const targetTitle = nextApi.activePanel?.id === dragEvent.panel.id ? "Equity curve" : (nextApi.activePanel?.title ?? "panel");
        createDragGhost(dragEvent.nativeEvent, dragEvent.panel.title ?? "Panel", targetTitle);
      }
      const clear = () => {
        setDraggingPanelId(null);
        setTarget({ groupId: null, position: null });
        document.removeEventListener("dragend", clear, true);
        document.removeEventListener("pointerup", clear, true);
      };
      document.addEventListener("dragend", clear, true);
      document.addEventListener("pointerup", clear, true);
    });
    nextApi.onWillShowOverlay((overlayEvent) => {
      setTarget({ groupId: overlayEvent.group?.id ?? null, position: overlayEvent.position });
    });
    nextApi.onDidDrop(() => {
      setDraggingPanelId(null);
      setTarget({ groupId: null, position: null });
    });
    setApi(nextApi);
  }, [initialLayout]);

  const enterEdit = () => {
    if (!api) return;
    beforeEdit.current = { dockview: api.toJSON(), minimized: minimizedPanelIds };
    setEditing(true);
    setMessage("");
  };

  const resetLayout = () => {
    if (!api) return;
    addDefaultPanels(api);
    setMinimizedPanelIds([]);
    setMessage("Default layout restored. Save to keep it.");
  };

  const saveLayout = () => {
    if (!api) return;
    const layout: DashboardLayout = { version: 1, dockview: api.toJSON() as unknown as Record<string, unknown>, minimizedPanelIds };
    startTransition(async () => {
      const result = await saveDashboardLayoutAction(layout);
      if (result.success) {
        setEditing(false);
        setMessage("Layout saved");
      } else setMessage(result.error);
    });
  };

  return (
    <main className={`finops-dock-dashboard ${editing ? "is-editing" : ""}`}>
      <header className="finops-dock-dashboard__header">
        <div className="min-w-0">
          <h1 className="type-heading-h1">Portfolio overview</h1>
          <p className="type-body-s text-secondary">{editing ? "Editing layout • Drag panels, resize groups, or create tabs" : "15 July 2026 · Simulated prices update every 500 ms"}</p>
        </div>
        {editing ? (
          <div className="finops-edit-toolbar" role="toolbar" aria-label="Edit dashboard layout">
            <span className="finops-edit-toolbar__status"><span aria-hidden="true">●</span> Editing layout</span>
            <button type="button" className="finops-edit-toolbar__reset" onClick={resetLayout}><RotateCcw aria-hidden="true" size={15} />Reset</button>
            <button type="button" className="finops-edit-toolbar__cancel" onClick={cancelEdit}><X aria-hidden="true" size={15} />Cancel</button>
            <button type="button" className="finops-edit-toolbar__save" onClick={saveLayout} disabled={isPending}><Save aria-hidden="true" size={15} />{isPending ? "Saving…" : "Save layout"}</button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <details className="finops-add-widget">
              <summary className="finops-secondary-button"><Plus aria-hidden="true" size={15} />Add Widget</summary>
              <div className="finops-add-widget__menu">
                {minimizedPanelIds.length > 0 ? minimizedPanelIds.map((panelId) => (
                  <button type="button" key={panelId} onClick={() => restorePanel(panelId)}>{PANEL_META[panelId].title}</button>
                )) : <span>All widgets added</span>}
              </div>
            </details>
            <button type="button" className="finops-secondary-button" onClick={enterEdit}>Customize layout</button>
          </div>
        )}
      </header>
      {message && <p className="finops-dock-message" role="status">{message}</p>}
      <section className="finops-dock-workspace" aria-label="Customizable dashboard panels">
        <DashboardPanelContext value={{ data, edit: editState }}>
          <DockviewReact
            className="finops-dockview"
            components={components}
            defaultTabComponent={DashboardTab}
            onReady={onReady}
            keyboardNavigation
            disableFloatingGroups
            singleTabMode="fullwidth"
            tabGroupAccent="off"
            theme={dockviewTheme}
          />
        </DashboardPanelContext>
        {editing && <div className="finops-edit-help">Drag from grip <span aria-hidden="true">•</span> Drop to dock <span aria-hidden="true">•</span> Esc cancels</div>}
      </section>
    </main>
  );
}
