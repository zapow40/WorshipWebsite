import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

export function SetlistSongPicker({ songs, selectedIds, onAdd, atLimit }) {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return songs.filter((song) => {
      if (category !== "all" && song.category !== category) return false;
      if (!needle) return true;
      return `${song.title} ${song.artist ?? ""}`.toLowerCase().includes(needle);
    });
  }, [songs, term, category]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search the library…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex gap-1.5">
        {[
          { value: "all", label: "All" },
          { value: "praise", label: "Praise" },
          { value: "worship", label: "Worship" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCategory(option.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] transition",
              category === option.value
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-[26rem] flex-1 space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">No songs match that search.</p>
        )}
        {filtered.map((song) => {
          const theme = themeFor(song.category);
          const selected = selectedIds.has(song.id);
          return (
            <div
              key={song.id}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-foreground">{song.title}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {song.song_key || "—"} · {song.bpm || "—"} BPM · {theme.label}
                </p>
              </div>
              <button
                type="button"
                disabled={selected || atLimit}
                onClick={() => onAdd(song)}
                aria-label={`Add ${song.title} to the setlist`}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg border transition",
                  selected
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : atLimit
                      ? "border-white/8 text-muted-foreground/40"
                      : "border-white/12 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}