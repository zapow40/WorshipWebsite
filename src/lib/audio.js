import { uploadAudioFile } from "@/lib/api";

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

/** Uploads an audio file to the worship Drive folder and returns its URL plus duration. */
export async function uploadAudio(file) {
  const [duration, base64] = await Promise.all([readAudioDuration(file), readAsBase64(file)]);
  const uploaded = await uploadAudioFile({
    fileName: file.name,
    mimeType: file.type || "audio/mpeg",
    base64,
  });
  return { url: uploaded.url, name: uploaded.name || file.name, duration, size: file.size };
}
