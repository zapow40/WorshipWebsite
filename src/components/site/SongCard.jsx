import { ArrowUpRight, Download, Pause, Play } from "lucide-react";

import { usePlayer } from "@/components/audio/PlayerProvider";
import { Link } from "@/lib/router";
import { formatTime, themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

export function SongCard({ song, className }) {
  const { play, isActive, isPlaying } = usePlayer();
  const theme = themeFor(song.category);
  const active = isActive(song.reference_audio_url);
  const playing = active && isPlaying;
  const backingPlaying = isActive(song.backing_track_url) && isPlaying;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.05]",
        theme.ring,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          theme.glow,
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em]", theme.chip)}>
          {theme.label} · {theme.short}
        </span>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="led text-primary">{song.song_key || "—"}</span>
          <span className="h-3 w-px bg-white/15" />
          <span className="led">{song.bpm ? `${song.bpm} BPM` : "—"}</span>
        </div>
      </div>

      <h3 className="mt-5 font-display text-xl leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
        {song.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{song.artist || "Original arrangement"}</p>

      {song.description && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground/80">{song.description}</p>
      )}

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!song.reference_audio_url}
            onClick={() =>
              play({
                url: song.reference_audio_url,
                title: song.title,
                subtitle: `Reference recording${song.reference_duration ? ` · ${formatTime(song.reference_duration)}` : ""}`,
                category: song.category,
              })
            }
            aria-label={playing ? `Pause reference recording of ${song.title}` : `Play reference recording of ${song.title}`}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition",
              playing
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/15 text-foreground hover:border-primary/60 hover:bg-primary/15 hover:text-primary",
              !song.reference_audio_url && "cursor-not-allowed opacity-35 hover:border-white/15 hover:bg-transparent",
            )}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>

          {song.backing_track_url ? (
            <>
              <button
                type="button"
                onClick={() =>
                  play({
                    url: song.backing_track_url,
                    title: song.title,
                    subtitle: `Backing track${song.backing_track_duration ? ` · ${formatTime(song.backing_track_duration)}` : ""}`,
                    category: song.category,
                  })
                }
                aria-label={backingPlaying ? `Pause backing track of ${song.title}` : `Play backing track of ${song.title}`}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition",
                  backingPlaying
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/15 text-foreground hover:border-primary/60 hover:bg-primary/15 hover:text-primary",
                )}
              >
                {backingPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>
              <a
                href={song.backing_track_url}
                download
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/12 px-3 py-2.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                Backing
              </a>
            </>
          ) : (
            <span className="flex flex-1 items-center justify-center rounded-full border border-white/8 px-4 py-2.5 text-xs text-muted-foreground/50">
              No track yet
            </span>
          )}

          <Link
            to={`/songs/${encodeURIComponent(song.id)}`}
            aria-label={`View details for ${song.title}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}