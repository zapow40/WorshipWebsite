import { useEffect, useState } from "react";
import { Library, Search, SlidersHorizontal, X } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { SongCard } from "@/components/site/SongCard";
import { listSongs } from "@/lib/api";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "A → Z" },
];

export function SongsPage() {
  const { search, navigate } = useRouter();

  const q = typeof search.q === "string" ? search.q : "";
  const category = search.category === "praise" || search.category === "worship" ? search.category : "";
  const key = typeof search.key === "string" ? search.key : "";
  const sort = SORTS.some((option) => option.value === search.sort) ? search.sort : "recent";

  const [term, setTerm] = useState(q);
  const [songs, setSongs] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listSongs({ q: q || undefined, category: category || undefined, key: key || undefined, sort })
      .then((result) => {
        if (!alive) return;
        setSongs(result.songs);
        setKeys(result.keys);
      })
      .catch(() => {
        if (!alive) return;
        setSongs([]);
        setKeys([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [q, category, key, sort]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = term.trim();
      if (next === q) return;
      const nextSearch = { ...search };
      if (next) nextSearch.q = next;
      else delete nextSearch.q;
      navigate({ to: "/songs", search: nextSearch, replace: true });
    }, 320);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const update = (patch) => {
    const next = { ...search, ...patch };
    Object.keys(next).forEach((name) => {
      if (next[name] === undefined || next[name] === null || next[name] === "") delete next[name];
    });
    navigate({ to: "/songs", search: next, replace: true });
  };

  const accent = category === "worship" ? "hsl(356 60% 45% / 0.16)" : "hsl(46 65% 52% / 0.14)";
  const activeFilters = [category, key, q].filter(Boolean).length;

  return (
    <div className="relative pb-16 pt-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 transition-colors duration-700"
        style={{ background: `radial-gradient(60% 100% at 50% 0%, ${accent}, transparent 70%)` }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary/50" />
          <p className="eyebrow text-primary/80">The vault</p>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(2.4rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-tight text-foreground">
              Song Library
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Every song our team leads, with its key, tempo, reference recording and backing track.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {loading ? "Loading…" : `${songs.length} ${songs.length === 1 ? "song" : "songs"}`}
            {!loading && activeFilters > 0 && ` · ${activeFilters} filter${activeFilters === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search by song title or artist…"
                aria-label="Search songs"
                className="w-full rounded-xl border border-white/10 bg-background/60 py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-white/10 bg-background/40 p-1">
                {[
                  { value: "", label: "All" },
                  { value: "praise", label: "Praise" },
                  { value: "worship", label: "Worship" },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => update({ category: option.value })}
                    className={cn(
                      "rounded-lg px-3.5 py-2 text-xs transition",
                      category === option.value
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  aria-label="Filter by key"
                  value={key}
                  onChange={(event) => update({ key: event.target.value })}
                  className="appearance-none rounded-xl border border-white/10 bg-background/40 py-2.5 pl-3 pr-8 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                >
                  <option value="">All keys</option>
                  {keys.map((musicalKey) => (
                    <option key={musicalKey} value={musicalKey}>
                      Key of {musicalKey}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>

              <select
                aria-label="Sort songs"
                value={sort}
                onChange={(event) => update({ sort: event.target.value === "recent" ? "" : event.target.value })}
                className="appearance-none rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!loading && songs.length === 0 ? (
          <div className="mt-14 flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Library className="h-5 w-5 text-primary/60" />
            </span>
            <p className="mt-5 font-display text-xl text-foreground">Nothing matches that search yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try a different title, clear the filters, or browse the whole library.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/songs", search: {} })}
              className="mt-6 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm text-primary transition hover:bg-primary/20"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song, index) => (
              <Reveal key={song.id} delay={Math.min(index, 6) * 60}>
                <SongCard song={song} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
