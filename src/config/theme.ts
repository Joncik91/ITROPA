// Theme configuration for consistent styling across the app

export const theme = {
  dark: {
    bg: "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800",
    text: "text-gray-100",
    card: "bg-gray-900/90 border-gray-600",
    muted: "text-gray-400",
    accent: "text-indigo-400",
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
    bg: "bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200",
    text: "text-gray-900",
    card: "bg-gray-100/90 border-gray-400",
    muted: "text-gray-600",
    accent: "text-indigo-600",
    btn: "bg-gray-300 hover:bg-gray-400",
    hover: "hover:bg-gray-300",
    border: "border-gray-400",
    borderDashed: "border-gray-500 text-gray-600",
    cardHover: "bg-gray-100 border-gray-400 hover:border-gray-500",
    cardBg: "bg-gray-100",
    inputBg: "bg-gray-100 border-gray-400",
    modalBg: "bg-gray-100 border-gray-400",
    sectionBg: "bg-gray-200 border-gray-400",
    itemBg: "bg-gray-200",
    itemBgAlt: "bg-gray-300 text-gray-700",
  },
};

export const getTheme = (isDark: boolean) => isDark ? theme.dark : theme.light;
