import { clearSession, getToken } from "@/lib/admin-session";

/**
 * The song library lives in the church's Google Sheet, reached through the
 * Apps Script backend in `apps-script/Code.gs`. Reads are public; every change
 * needs the admin token returned by the password login.
 */
const API_URL =
  "https://script.google.com/macros/s/AKfycbyQbm-W01vSqVnFQvq7rDWy-sh7aBeZjfEonsVmD5tIvZtGBRTp_Km3SL5YRUeJHvy5/exec";

const asArray = (value) => (Array.isArray(value) ? value : []);

function unwrap(payload) {
  if (!payload || payload.ok !== true) {
    throw new Error((payload && payload.error) || "The worship backend did not answer.");
  }
  return payload.data;
}

async function parse(response) {
  const payload = await response.json().catch(() => null);
  if (!payload) throw new Error("The worship backend returned an unexpected response.");
  return payload;
}

/** Public read. */
async function getJson(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });

  let response;
  try {
    response = await fetch(url.toString(), { redirect: "follow" });
  } catch {
    throw new Error("Could not reach the worship backend. Check your connection and try again.");
  }
  return unwrap(await parse(response));
}

/** Admin write — sends the Apps Script token and ends the session if it expired. */
async function postJson(action, payload = {}, { auth = true } = {}) {
  const token = auth ? getToken() : null;
  if (auth && !token) {
    clearSession();
    throw Object.assign(new Error("Sign in first."), { code: "UNAUTHORIZED" });
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, token, payload }),
    });
  } catch {
    throw new Error("Could not reach the worship backend. Check your connection and try again.");
  }

  const parsed = await parse(response);
  if (parsed.ok !== true) {
    const message = parsed.error || "The worship backend refused that change.";
    if (/sign in|expired/i.test(message)) {
      clearSession();
      throw Object.assign(new Error(message), { code: "UNAUTHORIZED" });
    }
    throw new Error(message);
  }
  return parsed.data;
}

/* ------------------------------------------------------------------- auth */

export async function loginAdmin(password) {
  return postJson("login", { password }, { auth: false });
}

/* ------------------------------------------------------------ public reads */

export const EMPTY_HOME = {
  content: null,
  songs: [],
  recentSongs: [],
  praiseCount: 0,
  worshipCount: 0,
  keys: [],
  setlist: null,
  setlistItems: [],
};

export async function getSiteContent() {
  try {
    return await getJson("content");
  } catch {
    return null;
  }
}

export async function getHomeData() {
  try {
    return { ...EMPTY_HOME, ...(await getJson("bootstrap")) };
  } catch {
    return EMPTY_HOME;
  }
}

export async function listSongs({ q, category, key, sort } = {}) {
  try {
    const result = await getJson("songs", { q, category, key, sort });
    const songs = asArray(result.songs);
    const keys = asArray(result.keys);
    const availableKeys = keys.length
      ? keys
      : [...new Set(songs.map((song) => song.song_key).filter(Boolean))].sort();
    return { songs, keys: availableKeys };
  } catch {
    return { songs: [], keys: [] };
  }
}

export async function getSongDetail(id) {
  try {
    return await getJson("song", { id });
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- admin reads */

export async function getAdminOverview() {
  const [home, library] = await Promise.all([getJson("bootstrap"), postJson("setlists.list")]);
  return {
    songs: asArray(home.songs),
    praiseCount: home.praiseCount ?? 0,
    worshipCount: home.worshipCount ?? 0,
    setlists: asArray(library.setlists),
  };
}

export async function getSetlistLibrary() {
  const [songs, library] = await Promise.all([getJson("songs"), postJson("setlists.list")]);
  return { songs: asArray(songs.songs), setlists: asArray(library.setlists) };
}

export async function getLibraryExport() {
  const [songs, library] = await Promise.all([getJson("songs"), postJson("setlists.list")]);
  return { songs: asArray(songs.songs), setlists: asArray(library.setlists) };
}

/* ------------------------------------------------------------ admin writes */

export async function saveSong(song) {
  return postJson("song.save", song);
}

export async function deleteSong({ id }) {
  return postJson("song.delete", { id });
}

export async function saveSetlist(setlist) {
  return postJson("setlist.save", setlist);
}

export async function deleteSetlist({ id }) {
  return postJson("setlist.delete", { id });
}

export async function saveSiteContent(content) {
  return postJson("content.save", content);
}

export async function uploadAudioFile({ fileName, mimeType, base64 }) {
  return postJson("upload", { fileName, mimeType, base64 });
}
