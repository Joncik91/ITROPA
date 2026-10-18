/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        sheet: token("sheet"),
        well: token("well"),
        line: token("line"),
        ink: token("ink"),
        "ink-2": token("ink-2"),
        accent: token("accent"),
        "on-accent": token("on-accent"),
        pollen: token("pollen"),
        ok: token("ok"),
        warn: token("warn"),
        bad: token("bad"),
      },
      fontFamily: {
        sans: ["Schibsted Grotesk", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["13px", "18px"],
        base: ["15px", "22px"],
        lg: ["17px", "24px"],
        xl: ["22px", "28px"],
        "2xl": ["30px", "34px"],
      },
      borderRadius: {
        control: "10px",
        card: "12px",
        sheet: "16px",
      },
      boxShadow: {
        sheet: "0 -8px 32px rgb(0 0 0 / 0.28)",
        pop: "0 12px 32px rgb(0 0 0 / 0.24)",
      },
    },
  },
  plugins: [],
};
