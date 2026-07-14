import type { Metadata } from "next";

import { ComponentPreview } from "./component-preview";

export const metadata: Metadata = {
  title: "Components | FinOps Dev",
  description: "FinOps Phase 1 component preview",
};

export default function ComponentsPage() {
  return <ComponentPreview />;
}
