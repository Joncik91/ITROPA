import { useEffect, useState } from "react";

/** Live result of a CSS media query. */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** The three-column workspace layout (Tailwind `lg`). */
export const WIDE_QUERY = "(min-width: 1024px)";
