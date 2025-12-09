import { useState } from "react";

export const useTheme = () => {
  const [dark, setDark] = useState(true);
  
  const toggleTheme = () => setDark(prev => !prev);
  
  return { dark, toggleTheme };
};
