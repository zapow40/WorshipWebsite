import { useEffect, useState } from "react";
import { CalendarDays, Eye, FilePlus2, Loader2, Save, Send, Undo2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SetlistFlowList } from "@/components/admin/SetlistFlowList";
import { SetlistSongPicker } from "@/components/admin/SetlistSongPicker";
import { deleteSetlist as deleteSetlistRequest, saveSetlist } from "@/lib/api";
import { formatServiceDate, themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none";

function nextSunday() {
  const date = new Date();
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return date.toISOString().slice(0, 10);
}

function makeItem(song) {
  return {
    key: globalThis.crypto?.randomUUID?.() ?? `${song.id}-${Math.random()}`,
    song_id: song.id,
    song_title: song.title,
    artist: song.artist ?? "",
    category: song.category,
    song_key: song.song_key ?? "",
    bpm: song.bpm ?? null,
    reference_audio_url: song.reference_audio_url ?? "",
    reference_duration: song.reference_duration ?? 0,
    backing_track_url: song.backing_track_url ?? "",
  };
}

export function SetlistBuilder({ songs, setlists, onRefresh }) {
  const [setlistId, setSetlistId] = useState("");
  const [title, setTitle] = useState("Sunday Worship Gathering");
  const [serviceDate, setServiceDate] = useState(nextSunday);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [regular, setRegular] = useState([]);
  const [closing, setClosing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedIds = new Set([...regular.map((item) => item.song_id), ...(closing ? [closing.song_id] : [])]);
  const atLimit = regular.length >= 4;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const resetForm = () => {
    setSetlistId("");
    setTitle("Sunday Worship Gathering");
    setServiceDate(nextSunday());
    setNotes("");
    setStatus("draft");
    setRegular([]);
    setClosing(null);
    setPreview(false);
    setNotice("");
  };

  const loadSetlist = (setlist) => {
    setSetlistId(setlist.id);
    setTitle(setlist.title);
    setServiceDate(setlist.service_date);
    setNotes(setlist.notes ?? "");
    setStatus(setlist.status);
    setPreview(false);
    const mapped = (setlist.items ?? []).map((row) => ({ ...row, key: row.id }));
    setClosing(mapped.find((row) => row.is_closing) ?? null);
    setRegular(mapped.filter((row) => !row.is_closing));
  };

  const addSong = (song) => {
    if (selectedIds.has(song.id)) return;
    if (atLimit) {
      setNotice("A setlist holds up to 4 regular songs plus one closing song.");
      return;
    }
    setRegular((prev) => [...prev, makeItem(song)]);
    setNotice("");
  };

  const removeItem = (key) => setRegular((prev) => prev.filter((item) => item.key !== key));

  const updateItem = (key, patch) => {
    setRegular((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
    setClosing((prev) => (prev?.key === key ? { ...prev, ...patch } : prev));
  };

  const setAsClosing = (key) => {
    const item = regular.find((entry) => entry.key === key);
    if (!item) return;
    setRegular((prev) => {
      const remaining = prev.filter((entry) => entry.key !== key);
      return closing ? [...remaining, closing] : remaining;
    });
    setClosing(item);
  };

  const clearClosing = () => {
    if (closing && regular.length < 4) setRegular((prev) => [...prev, closing]);
    setClosing(null);
  };

  const reorder = (from, to) => {
    if (to === undefined || to === null || from === to) return;
    setRegular((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const persist = async (nextStatus) => {
    if (!title.trim()) {
      setNotice("Give this setlist a title.");
      return;
    }
    if (!serviceDate) {
      setNotice("Choose the Sunday this setlist is for.");
      return;
    }
    if (nextStatus === "published" && regular.length + (closing ? 1 : 0) === 0) {
      setNotice("Add at least one song before publishing.");
      return;
    }

    setSaving(true);
    try {
      const items = [
        ...regular.map((item, index) => ({ ...item, position: index + 1, is_closing: false })),
        ...(closing ? [{ ...closing, position: regular.length + 1, is_closing: true }] : []),
      ].map(({ key, created_date, updated_date, ...rest }) => rest);

      const saved = await saveSetlist({
        id: setlistId || undefined,
        title: title.trim(),
        service_date: serviceDate,
        status: nextStatus,
        notes: notes.trim(),
        items,
      });

      setSetlistId(saved.setlist.id);
      setStatus(nextStatus);
      toast.success(nextStatus === "published" ? "Setlist published to the homepage" : "Draft saved");
      onRefresh?.();
    } catch (error) {
      toast.error(error?.message || "The setlist could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSetlist = async () => {
    if (!setlistId) return;
    setSaving(true);
    try {
      await deleteSetlistRequest({ id: setlistId });
      toast.success("Setlist deleted");
      resetForm();
      onRefresh?.();
    } catch (error) {
      toast.error(error?.message || "The setlist could not be deleted.");
    } finally {
      setSaving(false);
    }
  };

  const totalSongs = regular.length + (closing ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
        <p className="mr-auto px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {setlists.length} saved {setlists.length === 1 ? "setlist" : "setlists"}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          New setlist
        </button>
        {setlists.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => loadSetlist(entry)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition",
              setlistId === entry.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", entry.status === "published" ? "bg-primary" : "bg-muted-foreground/50")}
            />
            {entry.title}
            <span className="font-mono text-[9px] opacity-70">{entry.service_date}</span>
          </button>
        ))}
      </div>

      {notice && (
        <div className="animate-fade-up rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {notice}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Service details</p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]",
                  status === "published"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/10 text-muted-foreground",
                )}
              >
                {status}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="setlist-title" className="text-xs text-muted-foreground">
                  Title
                </label>
                <input
                  id="setlist-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(field, "mt-1.5")}
                />
              </div>
              <div>
                <label htmlFor="setlist-date" className="text-xs text-muted-foreground">
                  Service date
                </label>
                <input
                  id="setlist-date"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className={cn(field, "mt-1.5")}
                />
              </div>
              <div>
                <label htmlFor="setlist-notes" className="text-xs text-muted-foreground">
                  Notes for the team
                </label>
                <input
                  id="setlist-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                  className={cn(field, "mt-1.5")}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
                Flow · {regular.length}/4 + {closing ? 1 : 0}/1
              </p>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
              >
                <Eye className="h-3 w-3" />
                {preview ? "Edit flow" : "Preview"}
              </button>
            </div>

            <div className="mt-4">
              {preview ? (
                <PreviewFlow title={title} serviceDate={serviceDate} regular={regular} closing={closing} />
              ) : (
                <SetlistFlowList
                  items={regular}
                  closing={closing}
                  onReorder={reorder}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onSetClosing={setAsClosing}
                  onClearClosing={clearClosing}
                />
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => persist("draft")}
                className="flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-foreground transition hover:border-primary/40 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save as draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => persist("published")}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {status === "published" ? "Update published setlist" : "Publish setlist"}
              </button>
              {status === "published" && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => persist("draft")}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <Undo2 className="h-4 w-4" />
                  Unpublish
                </button>
              )}
              {setlistId && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={deleteSetlist}
                  className="ml-auto rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:text-destructive"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <UploadCloud className="h-3 w-3" />
              {totalSongs} song{totalSongs === 1 ? "" : "s"} · Changing a key or tempo here never edits the song in the library.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 lg:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Song library</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Click + to add a song to the flow.</p>
          <div className="mt-4">
            <SetlistSongPicker songs={songs} selectedIds={selectedIds} onAdd={addSong} atLimit={atLimit} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewFlow({ title, serviceDate, regular, closing }) {
  const items = [...regular, ...(closing ? [closing] : [])];
  return (
    <div className="rounded-2xl border border-white/8 bg-background/60 p-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
        {formatServiceDate(serviceDate) || "No date"}
      </p>
      <h3 className="mt-2 font-display text-xl text-foreground">{title || "Untitled setlist"}</h3>
      <ol className="mt-4 space-y-2">
        {items.length === 0 && <li className="text-xs text-muted-foreground">No songs yet.</li>}
        {items.map((item, index) => {
          const theme = themeFor(item.category);
          return (
            <li
              key={item.key}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2",
                item.is_closing || item === closing ? "border-primary/30 bg-primary/[0.06]" : "border-white/8",
              )}
            >
              <span className="font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.song_title}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{theme.label}</span>
              <span className="font-mono text-[10px] text-primary">{item.song_key || "—"}</span>
              <span className="font-mono text-[10px] text-foreground">{item.bpm || "—"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}