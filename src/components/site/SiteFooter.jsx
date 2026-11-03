import { Clock, Mail, MapPin, Music4 } from "lucide-react";

import { Link } from "@/lib/router";

export function SiteFooter({ content }) {
  const year = 2026;
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Music4 className="h-5 w-5 text-primary" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base text-foreground">Christ the Rock</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Covenant Church · Camarin
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {content?.church_description ||
              "A community of worshipers in Camarin, called to lift one voice to Jesus — every Sunday and every day between."}
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow">Gather</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <span>Camarin, Caloocan City</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <span>{content?.service_times || "Sunday Worship · 8:00 AM & 10:30 AM"}</span>
            </li>
            {content?.contact_email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <a className="transition hover:text-foreground" href={`mailto:${content.contact_email}`}>
                  {content.contact_email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow">Library</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/songs" className="transition hover:text-foreground">
                All songs
              </Link>
            </li>
            <li>
              <Link to="/songs" search={{ category: "praise" }} className="transition hover:text-foreground">
                Praise
              </Link>
            </li>
            <li>
              <Link to="/songs" search={{ category: "worship" }} className="transition hover:text-foreground">
                Worship
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow">Team</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/" section="setlist" className="transition hover:text-foreground">
                Sunday setlist
              </Link>
            </li>
            <li>
              <Link to="/" section="about" className="transition hover:text-foreground">
                Our team
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-foreground">
                Admin sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-white/5 px-5 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {year} Christ the Rock Covenant Church Camarin · Worship Ministry</p>
        <p className="font-mono uppercase tracking-[0.2em]">Soli Deo Gloria</p>
      </div>
    </footer>
  );
}