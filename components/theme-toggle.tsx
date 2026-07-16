"use client";

import { SunMoon } from "lucide-react";

export function ThemeToggle() {
  const toggleTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("finops-theme", nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      className="flex size-10 items-center justify-center rounded-[10px] border border-border-default bg-surface-raised text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]"
    >
      <SunMoon aria-hidden="true" size={18} />
    </button>
  );
}
