import { Link } from "@/lib/router";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-display text-7xl text-primary/80">404</p>
      <p className="mt-4 font-display text-2xl text-foreground">This page is not in the library</p>
      <p className="mt-2 text-sm text-muted-foreground">
        The link may be old, or the page may have moved. Head back to the music.
      </p>
      <Link
        to="/"
        className="mt-7 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm text-primary transition hover:bg-primary/20"
      >
        Back home
      </Link>
    </div>
  );
}
