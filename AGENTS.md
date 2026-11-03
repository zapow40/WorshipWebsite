# AGENTS.md

## Project Context

This is the worship team music library for Christ the Rock Covenant Church Camarin. It is a **standalone static Vite + React 19 single-page app** (plain JavaScript, no TypeScript) built from the root `index.html`. It has no Base44, TanStack Start, server functions or server routes. Everything runs in the browser.

Read `README.md` for setup and deployment.

## Key Files

- `index.html`: the HTML document and `<script src="/src/main.jsx">` entry.
- `src/main.jsx`: mounts `AdminProvider` → `RouterProvider` → `App` and the toast host.
- `src/App.jsx`: hash-route mapping (`#/`, `#/songs`, `#/songs/:id`, `#/login`, `#/admin/...`) and the public/admin layout choice.
- `src/lib/router.jsx`: custom hash router. Exports `RouterProvider`, `useRouter()` (`path`, `search`, `navigate`) and `Link` (`to`, `search`, `section` for scrolling to an id). Keep URLs hash-based so the build works on any static host without rewrite rules.
- `src/lib/api.js`: the only module that calls the Apps Script backend. Reads are public `GET`s; writes `POST` with the admin token. It clears the session when the backend says the token expired.
- `src/lib/AdminContext.jsx` + `src/lib/admin-session.js`: password login and `sessionStorage` token. `useAdmin()` exposes `isAdmin`, `login(password)`, `logout()`.
- `src/lib/site-defaults.js`: fallback copy for the public site and placeholder library data. Local artwork lives in `public/images/`.
- `src/lib/audio.js`: audio validation, duration probing and the base64 upload through `uploadAudioFile`. `src/lib/audio-url.js` normalises Drive share links into playable URLs and is shared with `api.js`.
- `src/pages/admin/`: Overview, Songs, NewSong, Setlist, Content, Settings. `src/layouts/AdminLayout.jsx` redirects signed-out visitors to `#/login`.
- `apps-script/Code.gs`: the Google Apps Script backend. Keep its action names and payload shapes in sync with `src/lib/api.js`.

## Conventions

- JavaScript/JSX only. Do not add `.ts`/`.tsx` files or type annotations.
- Use the `@/` alias for imports from `src/`.
- Public pages use `SiteLayout`; admin pages use `AdminLayout`. Do not render the site header inside the admin area.
- Admin pages read and write through `src/lib/api.js`; never call the Apps Script URL directly from a component.
- Server and first render are the same page here (no SSR), but still read `window`, `document` and storage only in effects or handlers.
- Keep `index.html` as the single HTML entry; do not introduce Base44, TanStack Start, Cloudflare or Wrangler files.
- Run `npm run lint` and `npm run build` before finishing changes.
