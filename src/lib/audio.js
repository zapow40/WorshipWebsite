import { uploadAudioFile } from "@/lib/api";
import { driveAudioUrl, normalizeAudioUrl } from "@/lib/audio-url";

export { driveAudioUrl, normalizeAudioUrl };
export const AUDIO_ACCEPT = "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/ogg,audio/aac,.mp3,.wav,.m4a,.ogg,.aac";
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ALLOWED = ["mp3", "wav", "m4a", "ogg", "aac", "mp4"];

export function validateAudioFile(file) {
  if (!file) return "Choose an audio file first.";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.includes(ext)) return "Use an MP3, WAV, M4A, OGG or AAC file.";
  if (file.size > MAX_AUDIO_BYTES) return "That file is over 25 MB. Please compress it and try again.";
  return null;
}

function probeDuration(audio) {
  return new Promise((resolve) => {
    const done = (value) => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      resolve(value);
    };
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0);
    audio.onerror = () => done(0);
  });
}

export function readAudioDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0);
    audio.onerror = () => done(0);
    audio.src = url;
  });
}

/** Best-effort duration for an already-hosted file. Never rejects. */
export function readRemoteDuration(url, timeout = 6000) {
  const clean = String(url || "").trim();
  if (!clean) return Promise.resolve(0);
  return new Promise((resolve) => {
    const audio = new Audio();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      if (audio.load) audio.load();
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(0), timeout);
    audio.preload = "metadata";
    probeDuration(audio).then(finish);
    audio.src = clean;
  });
}

export function formatFileSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.readAsDataURL(file);
  });
}

/**
 * The Apps Script `upload` action has returned different shapes over time
 * (`url`, `fileUrl`, `streamUrl`, `webContentLink`, or just `fileId`), so accept
 * all of them instead of silently saving an empty link.
 */
function uploadUrlFrom(uploaded) {
  if (!uploaded || typeof uploaded !== "object") return "";
  const keys = [
    "url",
    "fileUrl",
    "file_url",
    "downloadUrl",
    "download_url",
    "webContentLink",
    "link",
    "streamUrl",
    "stream_url",
    "webViewLink",
  ];
  for (const key of keys) {
    const value = normalizeAudioUrl(uploaded[key]);
    if (value) return value;
  }
  const id = uploaded.fileId || uploaded.file_id || uploaded.id;
  return id ? driveAudioUrl(id) : "";
}

/** Uploads an audio file to the worship Drive folder and returns its URL plus duration. */
export async function uploadAudio(file) {
  const [duration, base64] = await Promise.all([readAudioDuration(file), readAsBase64(file)]);
  const uploaded = await uploadAudioFile({
    fileName: file.name,
    mimeType: file.type || "audio/mpeg",
    base64,
  });
  const url = uploadUrlFrom(uploaded);
  if (!url) {
    throw new Error(
      "The file reached Google Drive but the backend did not return a link. Deploy the latest apps-script/Code.gs, then paste the Drive link below instead.",
    );
  }
  return { url, name: uploaded.name || file.name, duration, size: file.size };
}

/** Links an audio file that is already hosted (for example, the one already in Drive). */
export async function linkAudio({ url, name }) {
  const clean = normalizeAudioUrl(url);
  if (!/^https?:\/\//i.test(clean)) {
    throw new Error("Paste a full link, for example https://drive.google.com/file/d/FILE_ID/view");
  }
  const duration = await readRemoteDuration(clean);
  return { url: clean, name: name || "Linked audio", duration, size: 0 };
}
