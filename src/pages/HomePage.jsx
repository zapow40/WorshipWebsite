import { useEffect, useState } from "react";
import { ArrowRight, Library, Quote, Sparkles, Users } from "lucide-react";

import { CategoryDoors } from "@/components/site/CategoryDoors";
import { Hero } from "@/components/site/Hero";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SetlistPanel } from "@/components/site/SetlistPanel";
import { SongCard } from "@/components/site/SongCard";
import { useAdmin } from "@/lib/AdminContext";
import { EMPTY_HOME, getHomeData } from "@/lib/api";
import { mergeContent } from "@/lib/site-defaults";
import { Link } from "@/lib/router";

export function HomePage() {
  const { isAdmin } = useAdmin();
  const [data, setData] = useState(EMPTY_HOME);

  useEffect(() => {
    let alive = true;
    getHomeData()
      .then((home) => {
        if (alive) setData(home);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const content = mergeContent(data.content);
  const recent = data.recentSongs ?? [];

  return (
    <div className="pb-10">
      <Hero
        content={content}
        heroImage={content.hero_image_url || null}
        praiseCount={data.praiseCount ?? 0}
        worshipCount={data.worshipCount ?? 0}
        setlistLabel={data.setlist?.title}
      />

      <div className="-mt-10 sm:-mt-16">
        <SetlistPanel setlist={data.setlist} items={data.setlistItems ?? []} isAdmin={isAdmin} />
      </div>

      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Two heartbeats"
            title="Find the sound for the moment"
            description="Praise lifts the room with energy and thanksgiving. Worship makes space for stillness and surrender. Every song is filed, keyed, and ready."
          />
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <CategoryDoors />
        </Reveal>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Fresh in the vault"
            title="New in the library"
            description="Fresh arrangements ready for the team to learn and lead."
            action={
              <Link
                to="/songs"
                className="group inline-flex items-center gap-2 text-sm text-primary transition hover:text-primary/80"
              >
                Browse all {data.songs?.length ? `${data.songs.length} songs` : "songs"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>

        {recent.length === 0 ? (
          <Reveal className="mt-10">
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <Library className="h-5 w-5 text-primary/60" />
              </span>
              <p className="mt-5 font-display text-xl text-foreground">The library is waiting for its first song</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Administrators can add songs, upload reference recordings, and attach backing tracks from the dashboard.
              </p>
              {isAdmin ? (
                <Link
                  to="/admin/new-song"
                  className="mt-6 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm text-primary transition hover:bg-primary/20"
                >
                  Add the first song
                </Link>
              ) : (
                <Link to="/login" className="mt-6 text-sm text-primary transition hover:text-primary/80">
                  Team sign in
                </Link>
              )}
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((song, index) => (
              <Reveal key={song.id} delay={index * 90}>
                <SongCard song={song} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section id="about" className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="glass h-full rounded-[1.75rem] p-8 sm:p-10">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <p className="eyebrow text-primary/80">Our worship team</p>
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-tight tracking-tight text-foreground">
                Prepared hearts, one voice
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{content.team_info}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{content.church_description}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Vocalists", "Keys", "Guitars", "Bass", "Drums", "Audio & Media"].map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/12 via-transparent to-transparent p-8">
                <Quote className="h-6 w-6 text-primary/70" />
                <p className="mt-5 font-display text-xl leading-relaxed text-foreground/95">
                  &ldquo;Sing to the Lord a new song; sing to the Lord, all the earth.&rdquo;
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Psalm 96:1</p>
                <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-primary/15 blur-[70px]" />
              </div>

              <div className="glass flex-1 rounded-[1.75rem] p-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <p className="eyebrow text-primary/80">Announcements</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{content.announcements}</p>
                <p className="mt-5 border-t border-white/8 pt-4 text-xs text-muted-foreground">{content.service_times}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
