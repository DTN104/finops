import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  FormField,
  LoadingSkeleton,
  MetricCard,
  StatusBadge,
  type ButtonSize,
  type ButtonState,
  type ButtonVariant,
  type FormFieldState,
  type FormFieldType,
  type MetricCardTrend,
  type StatusBadgeTone,
  type StatusBadgeVariant,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const render = (node: React.ReactNode) => renderToStaticMarkup(node);

test("cn merges conditional and conflicting Tailwind classes", () => {
  assert.equal(cn("px-2", false && "hidden", "px-4"), "px-4");
});

test("Button renders every Figma size, style, and state combination", () => {
  const sizes: ButtonSize[] = ["small", "medium", "large"];
  const variants: ButtonVariant[] = ["primary", "secondary", "danger"];
  const states: ButtonState[] = ["default", "hover", "disabled"];

  for (const size of sizes) {
    for (const variant of variants) {
      for (const state of states) {
        const markup = render(
          <Button size={size} variant={variant} state={state}>
            Button
          </Button>,
        );

        assert.match(markup, new RegExp(`data-size="${size}"`));
        assert.match(markup, new RegExp(`data-style="${variant}"`));
        assert.match(markup, new RegExp(`data-state="${state}"`));
        assert.equal(markup.includes("disabled=\"\""), state === "disabled");
      }
    }
  }
});

test("FormField renders every Figma type and state combination", () => {
  const types: FormFieldType[] = ["text", "search", "select"];
  const states: FormFieldState[] = [
    "default",
    "focus",
    "error",
    "disabled",
  ];

  for (const type of types) {
    for (const state of states) {
      const markup = render(
        <FormField
          type={type}
          state={state}
          label="Label"
          value={type === "select" ? "input" : "Input value"}
          helper="Helper text"
          options={[{ label: "Input value", value: "input" }]}
        />,
      );

      assert.match(markup, new RegExp(`data-type="${type}"`));
      assert.match(markup, new RegExp(`data-state="${state}"`));
      assert.match(markup, /<label for="[^"]+"/);
      assert.match(markup, />Label<\/label>/);
      assert.match(markup, type === "select" ? /<select/ : /<input/);
      assert.equal(markup.includes("aria-invalid=\"true\""), state === "error");
      assert.equal(markup.includes("disabled=\"\""), state === "disabled");
    }
  }
});

test("StatusBadge renders all tone and style combinations", () => {
  const tones: StatusBadgeTone[] = [
    "neutral",
    "info",
    "success",
    "warning",
    "danger",
  ];
  const variants: StatusBadgeVariant[] = ["soft", "solid"];

  for (const tone of tones) {
    for (const variant of variants) {
      const markup = render(
        <StatusBadge tone={tone} variant={variant} label="STATUS" />,
      );

      assert.match(markup, new RegExp(`data-tone="${tone}"`));
      assert.match(markup, new RegExp(`data-style="${variant}"`));
      assert.match(markup, /data-slot="dot"/);
      assert.match(markup, />STATUS<\/span>/);
    }
  }
});

test("MetricCard renders all trend variants with non-color labels", () => {
  const trends: MetricCardTrend[] = [
    "neutral",
    "positive",
    "negative",
    "warning",
  ];

  for (const trend of trends) {
    const markup = render(<MetricCard trend={trend} />);

    assert.match(markup, new RegExp(`data-trend="${trend}"`));
    assert.match(markup, new RegExp(`${trend[0].toUpperCase()}${trend.slice(1)} trend`));
    assert.match(markup, /data-slot="trend-bar"/);
  }
});

test("LoadingSkeleton renders line, page, and table patterns", () => {
  const line = render(<LoadingSkeleton />);
  const page = render(<LoadingSkeleton variant="page" />);
  const table = render(<LoadingSkeleton variant="table" rows={3} />);

  assert.match(line, /data-variant="line"/);
  assert.match(line, /aria-label="Loading"/);
  assert.match(page, /data-variant="page"/);
  assert.match(page, />Page loading<\/p>/);
  assert.match(table, /data-variant="table"/);
  assert.match(table, />Table skeleton<\/p>/);
  assert.equal((table.match(/grid h-\[14px\]/g) ?? []).length, 3);
});

test("EmptyState and ErrorState expose their authored content accessibly", () => {
  const empty = render(
    <EmptyState
      title="Empty portfolio"
      description="No positions yet."
      metadata="₫500M buying power"
    />,
  );
  const error = render(
    <ErrorState
      title="API error"
      description="The request failed."
      metadata="TRACE MOCK-7F21"
    />,
  );

  assert.match(empty, /aria-labelledby="[^"]+"/);
  assert.match(empty, /Empty portfolio/);
  assert.match(empty, /₫500M buying power/);
  assert.match(error, /role="alert"/);
  assert.match(error, /API error/);
  assert.match(error, /TRACE MOCK-7F21/);
});

test("DataTable shares semantic markup and accessible row interaction", () => {
  const markup = render(
    <DataTable
      caption="Market instruments"
      columns={[{ key: "symbol", header: <button type="button">Symbol</button>, cell: (row) => row.symbol }]}
      rows={[{ symbol: "FPT" }]}
      getRowKey={(row) => row.symbol}
      getRowProps={() => ({ role: "link", tabIndex: 0 })}
    />,
  );

  assert.match(markup, /<caption class="sr-only">Market instruments<\/caption>/);
  assert.match(markup, /<th scope="col"/);
  assert.match(markup, /<tr role="link" tabindex="0"/);
});
