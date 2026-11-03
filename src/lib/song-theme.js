export const categoryThemes = {
  praise: {
    label: "Praise",
    short: "Fast",
    chip: "border-primary/35 bg-primary/12 text-primary",
    dot: "bg-primary",
    ring: "group-hover:border-primary/45",
    glow: "bg-primary/20",
  },
  worship: {
    label: "Worship",
    short: "Slow",
    chip: "border-[hsl(var(--worship))]/35 bg-[hsl(var(--worship))]/12 text-[hsl(var(--worship))]",
    dot: "bg-[hsl(var(--worship))]",
    ring: "group-hover:border-[hsl(var(--worship))]/45",
    glow: "bg-[hsl(var(--worship))]/20",
  },
};

export function themeFor(category) {
  return categoryThemes[String(category || "").toLowerCase()] ?? categoryThemes.praise;
}

export function formatServiceDate(value) {
  if (!value) return "";
  const date = new Date(value.length <= 10 ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const MUSICAL_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];

export function formatTime(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const total = Math.floor(value);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}