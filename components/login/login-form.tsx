"use client";

import { useState } from "react";

interface LoginFormProps {
  action: (formData: FormData) => Promise<void>;
}

export function LoginForm({ action }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4 lg:mt-5 lg:gap-5">
      <label className="flex flex-col gap-2">
        <span className="type-label-m text-muted">EMAIL</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          defaultValue="demo.trader@finops.local"
          className="h-12 rounded-[10px] border border-border-default bg-canvas px-[14px] text-primary outline-none focus:border-border-focus focus:shadow-[var(--focus-accent)]"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="type-label-m text-muted">PASSWORD</span>
        <span className="flex h-12 items-center rounded-[10px] border border-border-default bg-canvas px-[14px] focus-within:border-border-focus focus-within:shadow-[var(--focus-accent)]">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            defaultValue="finops-demo"
            aria-label="Password"
            className="min-w-0 flex-1 bg-transparent text-primary outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="type-label-m rounded text-muted focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]"
            aria-pressed={showPassword}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </span>
      </label>
      <div className="hidden lg:block">
        <label className="type-body-s flex items-center gap-2 text-secondary">
          <input type="checkbox" name="remember" className="size-4 accent-[var(--finops-bg-brand)]" />
          Remember this device
        </label>
      </div>
      <button name="role" value="trader" className="type-label-l mt-[2px] h-12 rounded-[var(--radius-sm)] bg-brand text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]">
        Continue as Demo Trader
      </button>
      <button name="role" value="viewer" className="type-label-l h-12 rounded-[var(--radius-sm)] border border-border-default bg-surface-raised text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]">
        Continue as Viewer
      </button>
      <button name="role" value="admin" className="type-label-l h-12 rounded-[var(--radius-sm)] border border-border-default bg-surface-raised text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]">
        Continue as Admin
      </button>
      <p className="type-body-s mt-1 hidden text-muted lg:mt-0 lg:block">Credentials are prefilled for portfolio review.</p>
      <p className="type-body-s mt-0 text-muted lg:hidden">All funds, orders and prices are fictional.</p>
    </form>
  );
}
