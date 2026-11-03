import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const PlayerContext = createContext(null);

/**
 * One persistent audio engine for the whole public site, so a reference track
 * keeps playing while the visitor browses between songs.
 */
export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null);
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
        setCurrentTime(0);
        setDuration(0);
      },
      isActive: (url) => !!url && track?.url === url,
    }),
    [track, isPlaying, currentTime, duration, error],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}