import { useState } from "react";
import { Flame, Heart, Loader2 } from "lucide-react";
import { AudioField } from "@/components/admin/AudioField";
import { MUSICAL_KEYS } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/50 focus:outline-none";

export function SongForm({ initial, onSubmit, submitting, submitLabel = "Save song", onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const [category, setCategory] = useState(initial?.category ?? "praise");
  const [songKey, setSongKey] = useState(initial?.song_key ?? "");
  const [bpm, setBpm] = useState(initial?.bpm ? String(initial.bpm) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [reference, setReference] = useState(
    initial?.reference_audio_url
      ? { url: initial.reference_audio_url, name: initial.reference_file_name, duration: initial.reference_duration }
      : null,
  );
  const [backing, setBacking] = useState(
    initial?.backing_track_url
      ? { url: initial.backing_track_url, name: initial.backing_track_name, duration: initial.backing_track_duration }
      : null,
  );
  const [errors, setErrors] = useState({});
  const [uploads, setUploads] = useState({ reference: false, backing: false });
  const uploading = uploads.reference || uploads.backing;

  const markUpload = (slot) => (working) => {
    setUploads((current) => (current[slot] === working ? current : { ...current, [slot]: working }));
    setErrors((current) => (current.form ? { ...current, form: undefined } : current));
  };

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (uploading) {
      next.form = "An audio upload is still running. Wait for it to finish, then save.";
    }
    if (!title.trim()) next.title = "A song title is required.";
    const bpmNumber = bpm === "" ? null : Number(bpm);
    if (bpmNumber !== null && (!Number.isFinite(bpmNumber) || bpmNumber < 20 || bpmNumber > 300)) {
      next.bpm = "Tempo should be between 20 and 300 BPM.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      title: title.trim(),
      artist: artist.trim(),
      category,
      song_key: songKey,
      bpm: bpmNumber,
      description: description.trim(),
      search_text: `${title} ${artist} ${description}`.toLowerCase().trim(),
      reference_audio_url: reference?.url ?? "",
      reference_file_name: reference?.name ?? "",
      reference_duration: reference?.duration ?? 0,
      backing_track_url: backing?.url ?? "",
      backing_track_name: backing?.name ?? "",
      backing_track_duration: backing?.duration ?? 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="song-title" className="text-sm font-medium text-foreground">
            Song title *
          </label>
          <input
            id="song-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Way Maker"
            className={cn(field, "mt-2", errors.title && "border-destructive/60")}
          />
          {errors.title && <p className="mt-1.5 text-xs text-destructive">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="song-artist" className="text-sm font-medium text-foreground">
            Artist / writer
          </label>
          <input
            id="song-artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Sinach"
            className={cn(field, "mt-2")}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Category *</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { value: "praise", label: "Praise", note: "Fast & upbeat", icon: Flame },
            { value: "worship", label: "Worship", note: "Slow & intimate", icon: Heart },
          ].map((option) => {
            const Icon = option.icon;
            const active = category === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                  active
                    ? option.value === "praise"
                      ? "border-primary/50 bg-primary/10"
                      : "border-[hsl(var(--worship))]/50 bg-[hsl(var(--worship))]/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active
                      ? option.value === "praise"
                        ? "text-primary"
                        : "text-[hsl(var(--worship))]"
                      : "text-muted-foreground",
                  )}
                />
                <span>
                  <span className="block text-sm text-foreground">{option.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{option.note}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="song-key" className="text-sm font-medium text-foreground">
            Musical key
          </label>
          <select
            id="song-key"
            value={songKey}
            onChange={(e) => setSongKey(e.target.value)}
            className={cn(field, "mt-2 appearance-none")}
          >
            <option value="">Not set</option>
            {MUSICAL_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="song-bpm" className="text-sm font-medium text-foreground">
            BPM
          </label>
          <input
            id="song-bpm"
            type="number"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="72"
            className={cn(field, "mt-2", errors.bpm && "border-destructive/60")}
          />
          {errors.bpm && <p className="mt-1.5 text-xs text-destructive">{errors.bpm}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="song-description" className="text-sm font-medium text-foreground">
          Description / notes
        </label>
        <textarea
          id="song-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Arrangement notes, transitions, who leads…"
          className={cn(field, "mt-2 resize-none")}
        />
      </div>

      <div className="grid gap-5 rounded-2xl border border-white/8 bg-background/40 p-4 sm:grid-cols-2">
        <AudioField
          label="Reference song"
          hint="The original recording the team learns from."
          value={reference}
          onChange={setReference}
          onBusyChange={markUpload("reference")}
        />
        <AudioField
          label="Backing track"
          hint="Instrumental used in the service. Visitors can download this."
          value={backing}
          onChange={setBacking}
          onBusyChange={markUpload("backing")}
        />
      </div>

      {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {(submitting || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? "Waiting for upload…" : submitLabel}
        </button>
      </div>
    </form>
  );
}