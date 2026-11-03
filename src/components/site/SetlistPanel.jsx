import { CalendarDays, Download, Music2, Pause, Play, Sparkles } from "lucide-react";

import { usePlayer } from "@/components/audio/PlayerProvider";
import { Link } from "@/lib/router";
import { formatServiceDate, formatTime, themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

export function SetlistPanel({ setlist, items = [], isAdmin }) {
  const { play, isActive, isPlaying } = usePlayer();
  const regular = items.filter((item) => !item.is_closing);
  const closing = items.find((item) => item.is_closing);

  return (
    <section id="setlist" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-1 shadow-[0_40px_120px_-60px_rgba(0,0,0,1)]">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-primary/15 blur-[90px]" />
        <div className="relative rounded-[1.85rem] bg-background/40 px-5 py-7 backdrop-blur-xl sm:px-9 sm:py-9">
          <div className="flex flex-col gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary/50" />
                <p className="eyebrow text-primary/80">Sunday Setlist</p>
                {setlist?.status === "published" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-breathe" /> Live
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.7rem)] font-medium leading-tight tracking-tight text-foreground">
                {setlist?.title || "This Sunday's Worship"}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary/70" />
                {formatServiceDate(setlist?.service_date) || "Date to be announced"}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="font-display text-2xl text-foreground">{String(items.length).padStart(2, "0")}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Songs</p>
              </div>
              <div className="h-9 w-px bg-white/10" />
              <div>
                <p className="font-display text-2xl text-foreground">
                  {regular.length}
                  <span className="text-muted-foreground/50">+</span>
                  {closing ? 1 : 0}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Flow / Close</p>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptySetlist isAdmin={isAdmin} />
          ) : (
            <ol className="mt-2 divide-y divide-white/5">
              {items.map((item) => {
                const theme = themeFor(item.category);
                const active = isActive(item.reference_audio_url);
                const playing = active && isPlaying;
                return (
                  <li key={item.id} className="group relative">
                    <div className="flex flex-wrap items-center gap-4 py-5 transition-colors sm:flex-nowrap">
                      <div className="flex w-8 shrink-0 flex-col items-center">
                        <span
                          className={cn(
                            "font-mono text-sm tabular-nums",
                            item.is_closing ? "text-primary" : "text-muted-foreground/60",
                          )}
                        >
                          {String(item.position).padStart(2, "0")}
                        </span>
                        <span className={cn("mt-1 h-6 w-px", item.is_closing ? "bg-primary/40" : "bg-white/10")} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg tracking-tight text-foreground sm:text-xl">{item.song_title}</h3>
                          {item.is_closing && (
                            <span className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
                              <Sparkles className="h-2.5 w-2.5" /> Closing
                            </span>
                          )}
                          <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]", theme.chip)}>
                            {theme.label}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{item.artist || "—"}</p>
                      </div>

                      <div className="flex items-center gap-5 font-mono text-xs">
                        <div className="text-center">
                          <p className="led text-sm text-primary">{item.song_key || "—"}</p>
                          <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Key</p>
                        </div>
                        <div className="text-center">
                          <p className="led text-sm text-foreground">{item.bpm || "—"}</p>
                          <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">BPM</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!item.reference_audio_url}
                          onClick={() =>
                            play({
                              url: item.reference_audio_url,
                              title: item.song_title,
                              subtitle: `Setlist reference${item.reference_duration ? ` · ${formatTime(item.reference_duration)}` : ""}`,
                              category: item.category,
                            })
                          }
                          aria-label={`Play reference for ${item.song_title}`}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border transition",
                            playing
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-white/12 text-foreground hover:border-primary/60 hover:text-primary",
                            !item.reference_audio_url && "cursor-not-allowed opacity-30",
                          )}
                        >
                          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
                        </button>
                        {item.backing_track_url ? (
                          <a
                            href={item.backing_track_url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Download backing track for ${item.song_title}`}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 text-muted-foreground/30">
                            <Download className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <Link
                          to={`/songs/${encodeURIComponent(item.song_id)}`}
                          className="hidden rounded-full px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground sm:block"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptySetlist({ isAdmin }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <Music2 className="h-6 w-6 text-primary/60" />
      </div>
      <p className="mt-5 font-display text-xl text-foreground">The next setlist is being prayerfully prepared</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        As soon as the worship leader publishes this Sunday&apos;s flow, it will appear right here.
      </p>
      {isAdmin && (
        <Link
          to="/admin/setlist"
          className="mt-6 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm text-primary transition hover:bg-primary/20"
        >
          Build this Sunday&apos;s setlist
        </Link>
      )}
    </div>
  );
}