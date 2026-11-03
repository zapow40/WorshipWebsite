import { useEffect, useState } from "react";
import { ArrowUpRight, Flame, Heart, Library, ListMusic, PlusCircle, Send } from "lucide-react";

import { LibraryChart } from "@/components/admin/LibraryChart";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminOverview } from "@/lib/api";
import { Link } from "@/lib/router";
import { formatServiceDate, themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

export function AdminOverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    getAdminOverview()
      .then((overview) => {
        if (!alive) return;
        setData({
          songs: overview.songs,
          praiseCount: overview.praiseCount,
          worshipCount: overview.worshipCount,
          setlists: overview.setlists,
          publishedCount: overview.setlists.filter((entry) => entry.status === "published").length,
        });
      })
      .catch(() => {
        if (alive) {
          setData({ songs: [], praiseCount: 0, worshipCount: 0, setlists: [], publishedCount: 0 });
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">Good to see you</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Everything the worship team needs, at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/new-song"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            Add song
          </Link>
          <Link
            to="/admin/setlist"
            className="flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-foreground transition hover:border-primary/40"
          >
            <ListMusic className="h-4 w-4" />
            Setlist builder
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Library} label="Total songs" value={data ? data.songs.length : "—"} note="In the library" />
        <StatCard icon={Flame} label="Praise" value={data ? data.praiseCount : "—"} note="Fast songs" />
        <StatCard icon={Heart} label="Worship" value={data ? data.worshipCount : "—"} note="Slow songs" accent="crimson" />
        <StatCard
          icon={Send}
          label="Published setlists"
          value={data ? data.publishedCount : "—"}
          note="Live on the homepage"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Library by key</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Where the team sings most often</p>
            </div>
            <Link to="/admin/songs" className="text-[11px] text-muted-foreground transition hover:text-foreground">
              Manage songs
            </Link>
          </div>
          <div className="mt-3">
            <LibraryChart songs={data?.songs ?? []} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Recent setlists</p>
            <Link to="/admin/setlist" className="text-[11px] text-muted-foreground transition hover:text-foreground">
              Open builder
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {!data && <div className="h-32 animate-pulse rounded-xl bg-white/5" />}
            {data?.setlists.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted-foreground">
                No setlists yet — build this Sunday&apos;s flow.
              </p>
            )}
            {data?.setlists.slice(0, 5).map((setlist) => (
              <Link
                key={setlist.id}
                to="/admin/setlist"
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 transition hover:border-primary/30"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    setlist.status === "published" ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-foreground">{setlist.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{formatServiceDate(setlist.service_date)}</p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {setlist.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Recently added songs</p>
          <Link to="/admin/songs" className="text-[11px] text-muted-foreground transition hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {data?.songs.slice(0, 4).map((song) => {
            const theme = themeFor(song.category);
            return (
              <Link
                key={song.id}
                to={`/songs/${encodeURIComponent(song.id)}`}
                className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 transition hover:border-primary/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-foreground">{song.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {song.artist || "—"} · {theme.label} · {song.song_key || "—"} · {song.bpm || "—"} BPM
                  </p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
              </Link>
            );
          })}
          {data?.songs.length === 0 && (
            <p className="col-span-2 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted-foreground">
              The library is empty. Add your first song to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
