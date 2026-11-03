import { useEffect, useState } from "react";

import { SetlistBuilder } from "@/components/admin/SetlistBuilder";
import { getSetlistLibrary } from "@/lib/api";

export function AdminSetlistPage() {
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      setData(await getSetlistLibrary());
    } catch {
      setData({ songs: [], setlists: [] });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Planning</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">Sunday setlist</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Build the flow, adjust key and tempo for the service, then publish it straight to the homepage.
        </p>
      </div>

      {!data ? (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
          <div className="h-72 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      ) : (
        <SetlistBuilder songs={data.songs} setlists={data.setlists} onRefresh={load} />
      )}
    </div>
  );
}
