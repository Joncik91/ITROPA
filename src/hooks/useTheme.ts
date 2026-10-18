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
    // Switches the color tokens in index.css.
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0E1C2B" : "#F2F5F7");
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  return { dark, toggleTheme };
};
