# Worship Team Music Library

The public song library and admin dashboard for Christ the Rock Covenant Church Camarin. It is a static single-page app built with **Vite + React 19** from the root `index.html`. Songs, setlists and website content live in a Google Sheet, reached through the Google Apps Script backend in `apps-script/Code.gs`.

There is no Base44 dependency, no server to run, and no build-time secret. The site can be hosted on any static host (GitHub Pages, Netlify, Cloudflare Pages, or a subfolder of an existing site).

## Run locally

```bash
npm install
npm run dev
```

Build and preview the production bundle:

```bash
npm run build     # -> dist/
npm run preview
```

`npm run lint` checks the JavaScript and JSX.

## How it works

- **Routing** uses the hash so every page works without server rewrites: `#/`, `#/songs`, `#/songs/:id`, `#/login`, `#/admin`, `#/admin/songs`, `#/admin/new-song`, `#/admin/setlist`, `#/admin/content`, `#/admin/settings`. The router is a small custom implementation in `src/lib/router.jsx`.
- **Data** is read straight from the Apps Script web app (`src/lib/api.js`). Reads are public; writes require the admin token returned by the password login.
- **Admin access** is the team password. `src/lib/AdminContext.jsx` signs in through the Apps Script `login` action and keeps the token in `sessionStorage` for its 12-hour lifetime. There are no user accounts.
- **Audio uploads** are base64-encoded in the browser and posted to the Apps Script `upload` action, which stores the file in a Google Drive folder and returns a public URL.
- **Artwork** is local SVG in `public/images/`, so no remote image host is required.

### Files

| Path | Purpose |
| --- | --- |
| `index.html` | The HTML document and app entry |
| `src/main.jsx` | Mounts the app with the admin and router providers |
| `src/App.jsx` | Maps `#/…` paths to pages and picks the public or admin layout |
| `src/pages/` | Public pages and the admin dashboard pages |
| `src/components/site/` | Home, song library and setlist UI |
| `src/components/admin/` | Song form, setlist builder, sidebar and stat cards |
| `src/lib/api.js` | The only place that talks to the Apps Script backend |
| `apps-script/Code.gs` | Paste into the Google Sheet's Apps Script editor to run the backend |

## Backend setup

1. Create a Google Sheet and open **Extensions → Apps Script**.
2. Paste `apps-script/Code.gs`, then run `setup()` once and approve the permissions.
3. In **Project Settings → Script properties**, set `ADMIN_PASSWORD` to the team password.
4. Deploy as a web app: **Execute as: Me**, **Who has access: Anyone**.
5. Put the deployment URL in `API_URL` at the top of `src/lib/api.js`.

The available actions are documented at the top of `apps-script/Code.gs`. The API answers `{ ok: true, data }` or `{ ok: false, error }`.

## Deploy

`npm run build` writes everything to `dist/`. Upload that folder to any static host. Assets are relative, so it also works from a subfolder. Because routing is hash-based, no redirect rules are needed.

### GitHub Pages

Never publish the repository root — `index.html` there is the Vite source and points at `/src/main.jsx`, which GitHub Pages serves as plain text, giving a blank/black page. Publish the build instead:

1. Push the repository, including `.github/workflows/deploy.yml`.
2. In the repository open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds `dist/` and deploys it to `https://<user>.github.io/<repo>/`.

The workflow can also be run by hand from the **Actions** tab (`Deploy to GitHub Pages` → **Run workflow**). If the site still shows the old page, check that the latest workflow run finished and hard-refresh the browser.

### Audio files

Reference recordings and backing tracks are uploaded through Apps Script into the Drive folder owned by the backend. Uploads are size-limited to 25 MB and the file is shared as "anyone with the link can view". If a file is already in Drive, open the song in **Manage songs → edit** and use **Already in Drive? Paste the link** — any Drive share link (`https://drive.google.com/file/d/FILE_ID/view`) is converted to a playable URL automatically.
