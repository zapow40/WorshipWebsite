import { Link } from "@/lib/router";
import { ArrowUpRight, Flame, Heart } from "lucide-react";

const DOORS = [
  {
    category: "praise",
    title: "Praise",
    subtitle: "Fast · Upbeat · Declarative",
    blurb: "High-energy anthems that open the service with thanksgiving and joy.",
    icon: Flame,
    image: "images/praise.svg",
  },
  {
    category: "worship",
    title: "Worship",
    subtitle: "Slow · Intimate · Reflective",
    blurb: "Quiet songs that make room for stillness and surrender before God.",
    icon: Heart,
    image: "images/worship.svg",
  },
];

export function CategoryDoors({ images }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {DOORS.map((door) => {
        const Icon = door.icon;
        const isPraise = door.category === "praise";
        return (
          <Link
            key={door.category}
            to="/songs"
            search={{ category: door.category }}
            className="group relative isolate flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-white/10 p-7 transition duration-500 hover:-translate-y-1 hover:border-white/20"
          >
            <img
              src={images?.[door.category] || door.image}
              alt={`${door.title} worship atmosphere`}
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40 transition duration-700 group-hover:scale-105 group-hover:opacity-55"
            />
            <div
              className={`absolute inset-0 -z-10 bg-gradient-to-t ${
                isPraise
                  ? "from-background via-background/80 to-background/20"
                  : "from-background via-[hsl(356_45%_12%)]/80 to-background/20"
              }`}
            />
            <div className="flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  isPraise
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-[hsl(var(--worship))]/40 bg-[hsl(var(--worship))]/15 text-[hsl(var(--worship))]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition group-hover:border-white/40 group-hover:text-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">{door.subtitle}</p>
            <h3 className="mt-2 font-display text-3xl tracking-tight text-foreground">{door.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{door.blurb}</p>
          </Link>
        );
      })}
    </div>
  );
}