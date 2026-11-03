import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileAudio, Headphones, Music2, Pause, Play } from "lucide-react";

import { usePlayer } from "@/components/audio/PlayerProvider";
import { getSongDetail } from "@/lib/api";
import { isDriveAudio } from "@/lib/audio-url";
import { Link } from "@/lib/router";
import { formatTime, themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

export function SongPage({ songId }) {
  const [song, setSong] = useState(undefined);
  const { play, isActive, isPlaying } = usePlayer();

  useEffect(() => {
    let alive = true;
    getSongDetail(songId)
      .then((record) => {
        if (alive) setSong(record);
      })
      .catch(() => {
        if (alive) setSong(null);
      });
    return () => {
      alive = false;
    };
  }, [songId]);

  useEffect(() => {
    if (song?.title) document.title = `${song.title} · Worship Library`;
  }, [song]);

  if (song === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-40 sm:px-8">
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/5" />
        <div className="mt-6 h-14 max-w-lg animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-20 pt-40 text-center">
        <p className="font-display text-3xl text-foreground">This song is no longer in the library</p>
        <Link to="/songs" className="mt-6 inline-block text-sm text-primary transition hover:text-primary/80">
          Back to the library
        </Link>
      </div>
    );
  }

  const theme = themeFor(song.category);
  const active = isActive(song.reference_audio_url);
  const playing = active && isPlaying;
  const backingPlaying = isActive(song.backing_track_url) && isPlaying;

  return (
    <div className="relative pb-20 pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(50%_100%_at_50%_0%,hsl(46_65%_52%/0.12),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <Link
          to="/songs"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Song library
        </Link>

        <div className="mt-7 animate-fade-up">
          <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em]", theme.chip)}>
            {theme.label} · {theme.short}
          </span>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.08] tracking-tight text-foreground">
            {song.title}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{song.artist || "Original arrangement"}</p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Musical key", value: song.song_key || "—" },
            { label: "Tempo", value: song.bpm ? `${song.bpm} BPM` : "—" },
            { label: "Category", value: theme.label },
          ].map((meta) => (
            <div key={meta.label} className="rounded-2xl border border-white/8 bg-white/[0.025] px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{meta.label}</p>
              <p className="led mt-2 font-display text-2xl text-primary">{meta.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" />
              <p className="eyebrow text-primary/80">Reference recording</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The original song, used to learn arrangement, feel, and vocal phrasing.
            </p>
            {song.reference_audio_url ? (
              <div className="mt-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    play({
                      url: song.reference_audio_url,
                      title: song.title,
                      subtitle: "Reference recording",
                      category: song.category,
                    })
                  }
                  aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-105"
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                </button>
                <div>
                  <p className="text-sm text-foreground">{song.reference_file_name || "Reference audio"}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {formatTime(song.reference_duration)} ·{" "}
                    {isDriveAudio(song.reference_audio_url) ? "opens the Drive player" : "plays in the player below"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted-foreground">
                No reference recording uploaded yet.
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-primary" />
              <p className="eyebrow text-primary/80">Backing track</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The instrumental used in the service — free to download, no account needed.
            </p>
            {song.backing_track_url ? (
              <div className="mt-5">
                <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-background/50 p-3">
                  <Music2 className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">{song.backing_track_name || "Backing track"}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatTime(song.backing_track_duration)}</p>
                  </div>
                </div>
                <a
                  href={song.backing_track_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download backing track
                </a>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted-foreground">
                No backing track uploaded yet.
              </p>
            )}
          </div>
        </div>

        {song.description && (
          <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-6">
            <p className="eyebrow text-primary/80">Notes for the team</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{song.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
