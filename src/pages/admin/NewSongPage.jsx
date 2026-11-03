import { useState } from "react";
import { toast } from "sonner";

import { SongForm } from "@/components/admin/SongForm";
import { saveSong } from "@/lib/api";
import { useRouter } from "@/lib/router";

export function AdminNewSongPage() {
  const { navigate } = useRouter();
  const [saving, setSaving] = useState(false);

  const create = async (values) => {
    setSaving(true);
    try {
      await saveSong(values);
      toast.success("Song added to the library");
      navigate({ to: "/admin/songs" });
    } catch (error) {
      toast.error(error?.message || "The song could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Library</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">Add a new song</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Add the details, then upload the reference recording and the backing track.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6">
        <SongForm
          onSubmit={create}
          submitting={saving}
          submitLabel="Save song"
          onCancel={() => navigate({ to: "/admin/songs" })}
        />
      </div>
    </div>
  );
}
