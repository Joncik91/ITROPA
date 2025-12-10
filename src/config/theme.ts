// Theme configuration for consistent styling across the app

/** Theme object interface for type-safe theme usage */
export interface Theme {
  bg: string;
  text: string;
  card: string;
  muted: string;
  accent: string;
  btn: string;
  hover: string;
  border: string;
  borderDashed: string;
  cardHover: string;
  cardBg: string;
  inputBg: string;
  modalBg: string;
  sectionBg: string;
  itemBg: string;
  itemBgAlt: string;
}

/** Full theme configuration with dark and light modes */
export interface ThemeConfig {
  dark: Theme;
  light: Theme;
}

export const theme: ThemeConfig = {
  dark: {
    bg: "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800",
    text: "text-gray-100",
    card: "bg-gray-900/90 border-gray-600",
    muted: "text-gray-400",
    accent: "text-gray-300",
    btn: "bg-gray-700 hover:bg-gray-600",
    hover: "hover:bg-gray-700",
    border: "border-gray-600",
    borderDashed: "border-gray-500 text-gray-400",
    cardHover: "bg-gray-900 border-gray-600 hover:border-gray-500",
    cardBg: "bg-gray-900",
    inputBg: "bg-gray-900 border-gray-600",
    modalBg: "bg-gray-900 border-gray-600",
    sectionBg: "bg-gray-800 border-gray-600",
    itemBg: "bg-gray-800",
    itemBgAlt: "bg-gray-700 text-gray-300",
  },
  light: {
    bg: "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50",
    text: "text-gray-900",
    card: "bg-gray-50/90 border-gray-300",
    muted: "text-gray-500",
    accent: "text-gray-700",
    btn: "bg-gray-200 hover:bg-gray-300",
    hover: "hover:bg-gray-200",
    border: "border-gray-300",
    borderDashed: "border-gray-400 text-gray-500",
    cardHover: "bg-white border-gray-300 hover:border-gray-400",
    cardBg: "bg-gray-50",
    inputBg: "bg-gray-50 border-gray-300",
    modalBg: "bg-gray-50 border-gray-300",
    sectionBg: "bg-gray-100 border-gray-300",
    itemBg: "bg-gray-100",
    itemBgAlt: "bg-gray-200 text-gray-700",
  },
};

export const getTheme = (isDark: boolean): Theme => isDark ? theme.dark : theme.light;
