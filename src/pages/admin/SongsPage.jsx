import { useEffect, useMemo, useState } from "react";
import { Download, Headphones, Loader2, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SongForm } from "@/components/admin/SongForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteSong, listSongs, saveSong } from "@/lib/api";
import { Link } from "@/lib/router";
import { themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

export function AdminSongsPage() {
  const [songs, setSongs] = useState(null);
  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const result = await listSongs({});
      setSongs(result.songs);
    } catch {
      setSongs([]);
      toast.error("The library could not be loaded.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!songs) return [];
    const needle = term.trim().toLowerCase();
    if (!needle) return songs;
    return songs.filter((song) => `${song.title} ${song.artist ?? ""}`.toLowerCase().includes(needle));
  }, [songs, term]);

  const saveEdit = async (values) => {
    setBusy(true);
    try {
      await saveSong({ ...values, id: editing.id });
      toast.success("Song updated");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error?.message || "That song could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteSong({ id: deleting.id });
      toast.success("Song deleted");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(error?.message || "That song could not be deleted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Library</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">Manage songs</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {songs ? `${songs.length} songs · audio, keys and tempos` : "Loading the library…"}
          </p>
        </div>
        <Link
          to="/admin/new-song"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          Add new song
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search songs…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
      </div>

      {!songs && (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      )}

      {songs && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
          <p className="font-display text-lg text-foreground">
            {songs.length === 0 ? "No songs yet" : "No songs match that search"}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {songs.length === 0 ? "Add your first song with its reference recording and backing track." : "Try a different title."}
          </p>
        </div>
      )}

      {songs && filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <div className="hidden grid-cols-[1.6fr_0.6fr_0.5fr_0.6fr_0.5fr_auto] gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground md:grid">
            <span>Song</span>
            <span>Category</span>
            <span>Key</span>
            <span>BPM</span>
            <span>Audio</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((song) => {
              const theme = themeFor(song.category);
              return (
                <div
                  key={song.id}
                  className="grid gap-2 px-4 py-3 transition hover:bg-white/[0.02] md:grid-cols-[1.6fr_0.6fr_0.5fr_0.6fr_0.5fr_auto] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{song.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{song.artist || "—"}</p>
                  </div>
                  <span className={cn("w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]", theme.chip)}>
                    {theme.label}
                  </span>
                  <span className="led font-mono text-xs text-primary">{song.song_key || "—"}</span>
                  <span className="font-mono text-xs text-muted-foreground">{song.bpm || "—"}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Headphones className={cn("h-3.5 w-3.5", song.reference_audio_url ? "text-primary/80" : "opacity-25")} />
                    <Download className={cn("h-3.5 w-3.5", song.backing_track_url ? "text-primary/80" : "opacity-25")} />
                  </div>
                  <div className="flex items-center gap-1 md:justify-end">
                    <button
                      type="button"
                      onClick={() => setEditing(song)}
                      aria-label={`Edit ${song.title}`}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(song)}
                      aria-label={`Delete ${song.title}`}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit song</DialogTitle>
          </DialogHeader>
          {editing && (
            <SongForm
              initial={editing}
              onSubmit={saveEdit}
              submitting={busy}
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="border-white/10 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the song, its reference recording and backing track from the library, and from any setlist
              using it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10">Keep song</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete song"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
