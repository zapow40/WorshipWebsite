import { FileText, LayoutDashboard, Library, ListMusic, LogOut, PlusCircle, Settings } from "lucide-react";

import { useAdmin } from "@/lib/AdminContext";
import { Link, useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/songs", label: "Manage Songs", icon: Library },
  { to: "/admin/new-song", label: "Add New Song", icon: PlusCircle },
  { to: "/admin/setlist", label: "Sunday Setlist", icon: ListMusic },
  { to: "/admin/content", label: "Website Content", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const { logout } = useAdmin();
  const { path: pathname } = useRouter();

  return (
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-white/8 lg:bg-background/60">
      <div className="flex items-center justify-between gap-3 px-5 py-5 lg:flex-col lg:items-start lg:gap-6 lg:px-5 lg:py-7">
        <Link to="/" className="group">
          <p className="font-display text-sm text-foreground">Christ the Rock</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Worship Admin</p>
        </Link>
        <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary lg:inline">
          Administrator
        </span>
      </div>

      <nav
        aria-label="Admin"
        className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6"
      >
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden px-3 lg:block">
        <div className="hairline mb-3" />
        <div className="mb-3 px-2">
          <p className="truncate text-xs text-foreground">Signed in</p>
          <p className="truncate text-[10px] text-muted-foreground">Team password session</p>
        </div>
        <Link
          to="/"
          className="mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        >
          View website
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
