import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * A tiny hash router. The whole site is a static bundle, so `#/songs` works on
 * any static host (and straight from disk) without server rewrites.
 */

const RouterContext = createContext(null);

function parseLocation() {
  if (typeof window === "undefined") return { path: "/", search: {} };
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart = ""] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const search = {};
  new URLSearchParams(queryPart).forEach((value, key) => {
    search[key] = value;
  });
  return { path: path || "/", search };
}

function buildHash(to = "/", search) {
  const params = new URLSearchParams();
  Object.entries(search ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return `#${to}${query ? `?${query}` : ""}`;
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(parseLocation);
  const previousPath = useRef(location.path);

  useEffect(() => {
    const onChange = () => setLocation(parseLocation());
    window.addEventListener("hashchange", onChange);
    if (!window.location.hash) window.history.replaceState(null, "", "#/");
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback(({ to = "/", search, replace = false } = {}) => {
    const next = buildHash(to, search);
    if (replace) {
      if (window.location.hash !== next) window.history.replaceState(null, "", next);
      setLocation(parseLocation());
      return;
    }
    if (window.location.hash === next) {
      setLocation(parseLocation());
      return;
    }
    window.location.hash = next;
  }, []);

  useEffect(() => {
    const pathChanged = location.path !== previousPath.current;
    previousPath.current = location.path;

    if (pathChanged && !location.search.section) window.scrollTo(0, 0);

    if (location.search.section) {
      const id = location.search.section;
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 90);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [location]);

  const value = useMemo(
    () => ({ path: location.path, search: location.search, navigate }),
    [location.path, location.search, navigate],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useRouter must be used inside <RouterProvider>");
  return context;
}

export function Link({ to = "/", search, section, onClick, children, ...rest }) {
  const { navigate } = useRouter();
  const nextSearch = section ? { ...(search ?? {}), section } : search;

  return (
    <a
      href={buildHash(to, nextSearch)}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }
        event.preventDefault();
        onClick?.(event);
        navigate({ to, search: nextSearch });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
