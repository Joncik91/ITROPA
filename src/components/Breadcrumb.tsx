import { ChevronRight, Home } from "lucide-react";
import type { Theme } from "../config/theme";

interface BreadcrumbProps {
  path: string[];
  theme: Theme;
  onNavigate?: (index: number) => void;
}

export const Breadcrumb = ({ path, theme, onNavigate }: BreadcrumbProps) => {
  if (path.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 text-xs ${theme.muted} mb-3 px-2 py-1.5 rounded-lg ${theme.card} border ${theme.border}`}>
      <Home className="w-3 h-3" />
      <ChevronRight className="w-3 h-3" />
      {path.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {onNavigate ? (
            <button
              onClick={() => onNavigate(index)}
              className={`hover:text-gray-400 transition-colors ${
                index === path.length - 1 ? "text-gray-300 font-medium" : ""
              }`}
            >
              {item}
            </button>
          ) : (
            <span className={index === path.length - 1 ? "text-gray-300 font-medium" : ""}>
              {item}
            </span>
          )}
          {index < path.length - 1 && <ChevronRight className="w-3 h-3" />}
        </div>
      ))}
    </div>
  );
};
