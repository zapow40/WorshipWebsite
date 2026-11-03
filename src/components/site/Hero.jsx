import { ArrowRight, Headphones, Play } from "lucide-react";

import { Link } from "@/lib/router";

export function Hero({ content, praiseCount, worshipCount, setlistLabel, heroImage }) {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      {heroImage && (
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt="Stage lights falling through haze over a worship microphone"
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_20%,hsl(46_65%_52%/0.16),transparent_65%)]" />
        </div>
      )}

      <div className="pointer-events-none absolute -left-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-[100px] animate-glow" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-80 w-80 rounded-full bg-[hsl(219_70%_45%)]/25 blur-[110px] animate-float" />

      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-32 sm:px-8">
        <div className="max-w-3xl">
          <div className="animate-fade-up flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-primary/70 to-transparent" />
            <p className="eyebrow text-primary/80">Christ the Rock Covenant Church Camarin</p>
          </div>

          <h1 className="animate-fade-up mt-7 font-display text-[clamp(2.9rem,7.4vw,5.6rem)] font-medium leading-[1.02] tracking-tight text-balance [animation-delay:80ms]">
            <span className="text-foreground">Worship Team</span>
            <span className="block gold-text">Music Library</span>
          </h1>

          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground [animation-delay:160ms]">
            {content?.welcome_message ||
              "Every song, every key, every heartbeat — gathered in one place so our team can prepare with excellence and lead with one voice."}
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Link
              to="/songs"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:shadow-[0_18px_50px_-18px_hsl(46_65%_52%/0.8)]"
            >
              Explore the library
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/"
              section="setlist"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm text-foreground/90 backdrop-blur transition hover:border-primary/40 hover:bg-white/5"
            >
              <Play className="h-3.5 w-3.5 text-primary" />
              This Sunday&apos;s setlist
            </Link>
          </div>

          <div className="animate-fade-up mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-7 [animation-delay:320ms]">
            <Stat value={praiseCount ?? 0} label="Praise songs" />
            <Stat value={worshipCount ?? 0} label="Worship songs" />
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
                <Headphones className="h-3 w-3" /> Live now
              </p>
              <p className="mt-2 text-sm text-foreground/90">{setlistLabel || "No setlist yet"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-3xl text-foreground">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}