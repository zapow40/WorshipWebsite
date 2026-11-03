import { useRef, useState } from "react";
import { Loader2, Music2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { AUDIO_ACCEPT, formatFileSize, uploadAudio, validateAudioFile } from "@/lib/audio";
import { formatTime } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

/** One audio slot: upload, preview, replace, remove. */
export function AudioField({ label, hint, value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    const problem = validateAudioFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setBusy(true);
    try {
      const uploaded = await uploadAudio(file);
      onChange(uploaded);
      toast.success(`${label} uploaded`);
    } catch {
      toast.error("Upload failed. Please check the file and try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value?.url && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {formatTime(value.duration)}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value?.url ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
              <Music2 className="h-4 w-4 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-foreground">{value.name || "Audio file"}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {formatFileSize(value.size)} {value.duration ? `· ${formatTime(value.duration)}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              aria-label={`Replace ${label}`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
              aria-label={`Remove ${label}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <audio controls preload="none" src={value.url} className="mt-3 h-9 w-full" />
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-7 text-center transition",
            busy
              ? "border-primary/40 bg-primary/5"
              : "border-white/12 bg-white/[0.02] hover:border-primary/50 hover:bg-primary/[0.06]",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Uploading…</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5 text-primary/70" />
              <span className="text-xs text-foreground">Upload audio</span>
              <span className="text-[10px] text-muted-foreground">MP3, WAV or M4A · up to 25 MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}