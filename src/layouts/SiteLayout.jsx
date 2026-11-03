import { useEffect, useState } from "react";

import { PlayerBar } from "@/components/audio/PlayerBar";
import { PlayerProvider } from "@/components/audio/PlayerProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getSiteContent } from "@/lib/api";
import { mergeContent } from "@/lib/site-defaults";

export function SiteLayout({ children }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let alive = true;
    getSiteContent()
      .then((record) => {
        if (alive) setContent(record);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PlayerProvider>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter content={mergeContent(content)} />
        <PlayerBar />
      </div>
    </PlayerProvider>
  );
}
