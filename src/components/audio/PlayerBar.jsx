import { AnimatePresence, motion } from "framer-motion";
import { Music2, Pause, Play, Volume2, X } from "lucide-react";
import { usePlayer } from "@/components/audio/PlayerProvider";
import { formatTime, themeFor } from "@/lib/song-theme";

export function PlayerBar() {
  const { track, isPlaying, currentTime, duration, toggle, seek, close, error } = usePlayer();
  const theme = themeFor(track?.category);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-5 sm:pb-5"
        >
          <div className="glass mx-auto flex max-w-5xl items-center gap-3 rounded-2xl px-3 py-2.5 shadow-[0_-10px_60px_-20px_rgba(0,0,0,0.9)] sm:gap-5 sm:px-5 sm:py-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-secondary sm:h-12 sm:w-12">
              <Music2 className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{track.title}</p>
                <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest sm:inline ${theme.chip}`}>
                  {theme.label}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {error ? error : (track.subtitle || "Reference recording")}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="w-9 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
                <input
                  aria-label="Seek in reference recording"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[hsl(var(--primary))]"
                />
                <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause reference recording" : "Play reference recording"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={close}
              aria-label="Close player"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground sm:flex"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mx-auto mt-1 hidden max-w-5xl items-center justify-end gap-1 text-[10px] text-muted-foreground sm:flex">
            <Volume2 className="h-3 w-3" />
            <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}