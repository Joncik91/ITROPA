import { useEffect, useState } from "react";

const STORAGE_KEY = "itropa-theme";

function initialDark(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored === "dark";
  } catch {
    /* storage unavailable */
  }
  return true; // dark-first design; light is opt-in
}

/** Dark/light theme, persisted per browser. */
export const useTheme = () => {
  const [dark, setDark] = useState(initialDark);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    // Drives the light-mode contrast overrides in index.css.
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  return { dark, toggleTheme };
};
