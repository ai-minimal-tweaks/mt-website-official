"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/ui";
import { Button, Field, inputCls } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Only same-site admin paths are allowed as a post-login destination.
  const raw = params.get("next") ?? "";
  const next = raw.startsWith("/admin") && !raw.startsWith("//") ? raw : "/admin";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/cms/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace(next);
      router.refresh();
      return;
    }
    setBusy(false);
    setError(res ? ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Could not log in." : "Network error. Try again.");
  };

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-[#0b0b0b] px-4 py-10">
      {/* The site's ember light, as a static backdrop */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(55%_60%_at_80%_15%,#f26a1b_0%,#7a1c05_40%,transparent_72%),radial-gradient(45%_55%_at_15%_90%,#c2410c_0%,transparent_70%)] opacity-80" />
      <div className="relative w-full max-w-[24rem]">
        <div className="mb-6 flex flex-col items-center gap-3 text-white">
          <LogoMark className="size-14" title="Minimal Tweaks" />
          <p className="text-lg font-semibold tracking-tight">Minimal Tweaks · CMS</p>
        </div>
        <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white p-7 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]">
          <h1 className="text-xl font-semibold text-[#181b25]">Log in</h1>
          <p className="mt-1 text-sm text-[#6b7080]">Manage case studies shown on /work.</p>
          <div className="mt-6 space-y-4">
            <Field label="Username">
              <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
            </Field>
            <Field label="Password">
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </Field>
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-md border border-[#f3c4c2] bg-[#fdecea] px-3 py-2 text-sm text-[#ba0517]">
              {error}
            </p>
          )}
          <Button type="submit" variant="brand" disabled={busy} className="mt-6 h-10 w-full">
            {busy ? "Logging in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-white/50">Sessions last 12 hours.</p>
      </div>
    </main>
  );
}
