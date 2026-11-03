import { useEffect } from "react";

import { AdminLayout } from "@/layouts/AdminLayout";
import { SiteLayout } from "@/layouts/SiteLayout";
import { AdminContentPage } from "@/pages/admin/ContentPage";
import { AdminNewSongPage } from "@/pages/admin/NewSongPage";
import { AdminOverviewPage } from "@/pages/admin/OverviewPage";
import { AdminSetlistPage } from "@/pages/admin/SetlistPage";
import { AdminSettingsPage } from "@/pages/admin/SettingsPage";
import { AdminSongsPage } from "@/pages/admin/SongsPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SongPage } from "@/pages/SongPage";
import { SongsPage } from "@/pages/SongsPage";
import { useRouter } from "@/lib/router";

const TITLES = {
  "/": "Worship Team Music Library · Christ the Rock Covenant Church Camarin",
  "/songs": "Song Library · Christ the Rock Covenant Church Camarin",
  "/login": "Admin sign in · Christ the Rock Camarin",
  "/admin": "Worship Admin · Christ the Rock Camarin",
  "/admin/songs": "Manage songs · Worship Admin",
  "/admin/new-song": "Add a new song · Worship Admin",
  "/admin/setlist": "Sunday setlist · Worship Admin",
  "/admin/content": "Website content · Worship Admin",
  "/admin/settings": "Settings · Worship Admin",
};

function PublicRoute({ path }) {
  if (path === "/" || path === "") return <HomePage />;
  if (path === "/songs" || path === "/songs/") return <SongsPage />;

  const match = path.match(/^\/songs\/([^/]+)\/?$/);
  if (match) {
    const songId = decodeURIComponent(match[1]);
    return <SongPage key={songId} songId={songId} />;
  }

  return <NotFoundPage />;
}

function AdminRoute({ path }) {
  if (path === "/admin" || path === "/admin/") return <AdminOverviewPage />;
  if (path === "/admin/songs") return <AdminSongsPage />;
  if (path === "/admin/new-song") return <AdminNewSongPage />;
  if (path === "/admin/setlist") return <AdminSetlistPage />;
  if (path === "/admin/content") return <AdminContentPage />;
  if (path === "/admin/settings") return <AdminSettingsPage />;
  return <NotFoundPage />;
}

export default function App() {
  const { path } = useRouter();

  useEffect(() => {
    document.title = TITLES[path] || "Worship Library · Christ the Rock Camarin";
  }, [path]);

  if (path === "/login" || path === "/login/") return <LoginPage />;

  if (path === "/admin" || path.startsWith("/admin/")) {
    return (
      <AdminLayout>
        <AdminRoute path={path} />
      </AdminLayout>
    );
  }

  return (
    <SiteLayout>
      <PublicRoute path={path} />
    </SiteLayout>
  );
}
