import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lock, LogIn, Music4 } from "lucide-react";

import { useAdmin } from "@/lib/AdminContext";
import { Link, useRouter } from "@/lib/router";

export function LoginPage() {
  const { isAdmin, login } = useAdmin();
  const { navigate } = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate({ to: "/admin", replace: true });
  }, [isAdmin, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    if (!password) return;
    setError("");
    setBusy(true);
    try {
      await login(password);
      navigate({ to: "/admin", replace: true });
    } catch (problem) {
      setError(problem?.message || "That password did not work.");
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[hsl(219_70%_45%)]/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the library
        </Link>

        <div className="glass rounded-[1.75rem] p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Music4 className="h-5 w-5 text-primary" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base text-foreground">Christ the Rock</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Covenant Church · Camarin
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <LogIn className="h-4 w-4 text-primary" />
            <p className="eyebrow text-primary/80">Worship team admin</p>
          </div>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the worship admin password to manage songs, setlists and website content.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative mt-2">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 border-t border-white/8 pt-4 text-[11px] leading-relaxed text-muted-foreground">
            The password is the <span className="font-mono text-foreground/80">ADMIN_PASSWORD</span> property of the
            Google Apps Script backend. Sessions end automatically after a few hours or when you sign out.
          </p>
        </div>
      </div>
    </div>
  );
}
