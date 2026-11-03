import { useState } from "react";
import { Database, Download, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { getLibraryExport } from "@/lib/api";
import { useAdmin } from "@/lib/AdminContext";

export function AdminSettingsPage() {
  const { logout } = useAdmin();
  const [exporting, setExporting] = useState(false);

  const exportBackup = async () => {
    setExporting(true);
    try {
      const { songs, setlists } = await getLibraryExport();
      const payload = {
        exported_at: new Date().toISOString(),
        songs,
        setlists: setlists.map(({ items, ...rest }) => rest),
        setlist_items: setlists.flatMap((setlist) => setlist.items ?? []),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `worship-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch {
      toast.error("The backup could not be created.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Backups and your session on this device.</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">Administrator</p>
            <p className="text-[11px] text-muted-foreground">Signed in with the team password</p>
          </div>
        </div>
        <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-relaxed text-muted-foreground">
          The team password is managed in the worship Apps Script project. Ask whoever maintains the backend if it needs
          to change.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Backups</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Download a complete copy of the song library and every setlist as a JSON file. Keep it somewhere safe before
          large clean-ups — it can be handed back to anyone restoring the library.
        </p>
        <button
          type="button"
          onClick={exportBackup}
          disabled={exporting}
          className="mt-4 flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-foreground transition hover:border-primary/40 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download backup
        </button>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Session</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Signing out ends this session on this device. The session also expires on its own after twelve hours.
        </p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-4 flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
