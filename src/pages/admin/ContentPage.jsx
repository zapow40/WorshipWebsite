import { useEffect, useState } from "react";
import { Image, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { getSiteContent, saveSiteContent } from "@/lib/api";
import { DEFAULT_CONTENT, mergeContent } from "@/lib/site-defaults";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/50 focus:outline-none";

const FIELDS = [
  {
    key: "welcome_heading",
    label: "Welcome heading",
    hint: "The large headline at the top of the homepage.",
    type: "text",
  },
  {
    key: "welcome_message",
    label: "Welcome message",
    hint: "A short paragraph under the headline.",
    type: "textarea",
    rows: 3,
  },
  {
    key: "church_description",
    label: "About the church",
    hint: "Shown in the footer and the About section.",
    type: "textarea",
    rows: 4,
  },
  {
    key: "team_info",
    label: "About the worship team",
    hint: "Who serves on the team and how you prepare.",
    type: "textarea",
    rows: 4,
  },
  {
    key: "announcements",
    label: "Announcements",
    hint: "Rehearsal reminders, upcoming events, anything the team should know.",
    type: "textarea",
    rows: 3,
  },
  {
    key: "service_times",
    label: "Service times",
    hint: "Shown in the footer, for example “Sunday Worship · 8:00 AM & 10:30 AM”.",
    type: "text",
  },
  {
    key: "contact_email",
    label: "Contact email",
    hint: "Optional. Leave blank to hide it on the website.",
    type: "email",
  },
  {
    key: "hero_image_url",
    label: "Hero image URL",
    hint: "A wide photo used behind the homepage headline. Leave blank to use the artwork.",
    type: "text",
  },
];

export function AdminContentPage() {
  const [values, setValues] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getSiteContent()
      .then((record) => {
        if (alive) setValues(mergeContent(record));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const update = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveSiteContent(values);
      toast.success("Website content saved");
    } catch (error) {
      toast.error(error?.message || "The content could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Website</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">Website content</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The words and details visitors see on the public pages.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {FIELDS.map((entry) => (
              <div key={entry.key}>
                <label htmlFor={`content-${entry.key}`} className="text-sm font-medium text-foreground">
                  {entry.label}
                </label>
                <p className="mt-1 text-xs text-muted-foreground">{entry.hint}</p>
                {entry.type === "textarea" ? (
                  <textarea
                    id={`content-${entry.key}`}
                    value={values[entry.key] ?? ""}
                    onChange={(event) => update(entry.key, event.target.value)}
                    rows={entry.rows ?? 3}
                    className={cn(field, "mt-2 resize-y")}
                  />
                ) : (
                  <input
                    id={`content-${entry.key}`}
                    type={entry.type}
                    value={values[entry.key] ?? ""}
                    onChange={(event) => update(entry.key, event.target.value)}
                    className={cn(field, "mt-2")}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save content
        </button>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Image className="h-3 w-3" />
          Blank fields fall back to the default wording.
        </p>
      </div>
    </form>
  );
}
