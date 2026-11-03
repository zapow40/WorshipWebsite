import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { driveFileId, drivePreviewUrl } from "@/lib/audio-url";

const PlayerContext = createContext(null);

/**
 * One persistent audio engine for the whole public site, so a reference track
 * keeps playing while the visitor browses between songs.
 *
 * Direct audio files stream through this engine. Google Drive blocks media
 * requests (403 / ERR_BLOCKED_BY_ORB), so Drive-hosted tracks open Drive's own
 * embedded player in a dialog instead.
 */
export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [embed, setEmbed] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!track?.url) {
      el.pause();
      el.removeAttribute("src");
      setIsPlaying(false);
      return;
    }
    setError(null);
    el.src = track.url;
    el.load();
    const attempt = el.play();
    if (attempt?.catch) {
      attempt.catch(() => {
        setIsPlaying(false);
        setError("Tap play to start the audio.");
      });
    }
  }, [track]);

  const value = useMemo(
    () => ({
      track,
      isPlaying,
      currentTime,
      duration,
      error,
      play: (next) => {
        if (!next?.url) return;
        if (driveFileId(next.url)) {
          setTrack(null);
          setEmbed(next);
          return;
        }
        setEmbed(null);
        if (track?.url === next.url) {
          const el = audioRef.current;
          if (!el) return;
          if (el.paused) el.play().catch(() => {});
          else el.pause();
          return;
        }
        setCurrentTime(0);
        setDuration(0);
        setTrack(next);
      },
      toggle: () => {
        const el = audioRef.current;
        if (!el || !track) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
      },
      seek: (seconds) => {
        const el = audioRef.current;
        if (!el) return;
        el.currentTime = seconds;
        setCurrentTime(seconds);
      },
      close: () => {
        setTrack(null);
        setEmbed(null);
        setCurrentTime(0);
        setDuration(0);
      },
      isActive: (url) => !!url && track?.url === url,
    }),
    [track, embed, isPlaying, currentTime, duration, error],
  );

  const embedId = embed ? driveFileId(embed.url) : "";

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onError={() => {
          if (!track?.url) return;
          setIsPlaying(false);
          setError("This recording could not be loaded. Check that the file is shared with anyone with the link.");
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <Dialog open={!!embed} onOpenChange={(open) => !open && setEmbed(null)}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden border-white/10 bg-card p-0">
          <DialogHeader className="px-5 pb-3 pr-12 pt-5">
            <DialogTitle className="font-display text-lg text-foreground">{embed?.title || "Recording"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {embed?.subtitle || "Streaming from the church Google Drive"}
            </DialogDescription>
          </DialogHeader>
          <div className="border-y border-white/8 bg-black">
            {embedId && (
              <iframe
                key={embedId}
                title={`${embed?.title || "Recording"} player`}
                src={drivePreviewUrl(embed?.url)}
                allow="autoplay; encrypted-media"
                className="h-[300px] w-full sm:h-[340px]"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <p className="text-[11px] text-muted-foreground">Recordings are streamed from the church Drive.</p>
            <a
              href={embed?.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/12 px-3 py-1.5 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              Open in Drive
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
