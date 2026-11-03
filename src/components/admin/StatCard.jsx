import { cn } from "@/lib/utils";

export function StatCard({ icon: Icon, label, value, note, accent = "gold" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.04]">
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-40 transition group-hover:opacity-70",
          accent === "crimson" ? "bg-[hsl(var(--worship))]/25" : "bg-primary/20",
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-display text-3xl leading-none text-foreground">{value}</p>
          {note && <p className="mt-2 text-[11px] text-muted-foreground">{note}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border",
              accent === "crimson"
                ? "border-[hsl(var(--worship))]/30 bg-[hsl(var(--worship))]/10 text-[hsl(var(--worship))]"
                : "border-primary/25 bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}