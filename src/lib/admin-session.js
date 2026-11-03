const STORAGE_KEY = "worship-admin-session";
const EVENT = "worship:session-change";

function removeQuietly() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked; the in-memory state still works for this page.
  }
}

/** Reads the stored Apps Script token, dropping it once it has expired. */
export function getSession() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getToken() {
  return getSession()?.token ?? null;
}

export function saveSession(token, expiresIn) {
  const seconds = Number(expiresIn) || 12 * 60 * 60;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, expiresAt: Date.now() + seconds * 1000 }),
    );
  } catch {
    throw new Error("This browser blocked session storage. Allow storage and try again.");
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
  removeQuietly();
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeToSession(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
