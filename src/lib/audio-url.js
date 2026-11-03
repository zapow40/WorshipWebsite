const DRIVE_LINK = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([A-Za-z0-9_-]{10,})/i;
const BARE_DRIVE_ID = /^[A-Za-z0-9_-]{25,}$/;

/**
 * Google Drive refuses to serve files as media (`<audio src>`) to browsers:
 * the request comes back as a 403 page, which the media element reports as a
 * format error. Drive-hosted tracks therefore play through Drive's own embedded
 * preview player instead of the custom audio engine.
 */
export function driveFileId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(DRIVE_LINK);
  if (match) return match[1];
  if (BARE_DRIVE_ID.test(raw)) return raw;
  return "";
}

/** The playable/downloadable URL for a file stored in the church Drive folder. */
export function driveAudioUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/** The URL for Drive's embeddable player. */
export function drivePreviewUrl(value) {
  const id = driveFileId(value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : "";
}

/** True when the link points at Google Drive rather than a direct audio file. */
export function isDriveAudio(value) {
  return Boolean(driveFileId(value));
}

/**
 * Turns a Drive share link, a bare Drive id or any audio URL into a URL that can
 * be downloaded. Safe to call on empty or unknown values.
 */
export function normalizeAudioUrl(value) {
  const id = driveFileId(value);
  if (id) return driveAudioUrl(id);
  return String(value || "").trim();
}
