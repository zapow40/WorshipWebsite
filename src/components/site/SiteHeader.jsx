import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, Music4, X } from "lucide-react";

import { useAdmin } from "@/lib/AdminContext";
import { Link, useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Song Library", to: "/songs" },
  { label: "Setlist", to: "/", section: "setlist" },
  { label: "About", to: "/", section: "about" },
];

export function SiteHeader() {
  const { isAdmin, logout } = useAdmin();
  const { path: pathname } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled ? "border-b border-white/10 bg-background/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 transition group-hover:border-primary/60">
            <Music4 className="h-5 w-5 text-primary" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-medium tracking-tight text-foreground">
              Christ the Rock
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Covenant Church · Camarin
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = item.to === "/" && !item.section ? pathname === "/" : pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                section={item.section}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/20"
            >
              <LogIn className="h-4 w-4" />
              Team sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  section={item.section}
                  className="block rounded-xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <div className="hairline my-3" />
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-primary transition hover:bg-primary/10"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                </Link>
              )}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-white/5"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full rounded-xl border border-primary/40 bg-primary/10 px-3 py-3 text-left text-sm text-primary"
                >
                  Team sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
