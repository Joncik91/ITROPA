/**
 * HomePage component - main exploration view with three-panel layout.
 * Split into LeftSidebar, CenterPanel, and RightSidebar components (SRP).
 */

import { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import type { NeedManager } from "../hooks/useNeedManager";
import type { Theme } from "../config/theme";
import { LeftSidebar, CenterPanel, RightSidebar } from "./sidebars";
import { useConstraints } from "../hooks/useConstraints";

interface HomePageProps {
  theme: Theme;
  dark: boolean;
  manager: NeedManager;
}

export const HomePage = ({ theme, dark, manager }: HomePageProps) => {
  const [viewDensity, setViewDensity] = useState<"compact" | "comfortable">("comfortable");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { profile: constraintsProfile, setProfile: setConstraintsProfile, filterEnabled, setFilterEnabled } = useConstraints();

  return (
    <div className="flex h-full relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${theme.card} border ${theme.border} shadow-lg`}
        aria-label={leftSidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={leftSidebarOpen}
      >
        {leftSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <LeftSidebar
        theme={theme}
        dark={dark}
        manager={manager}
        isOpen={leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
        scrollContainerRef={scrollContainerRef}
        constraintsProfile={constraintsProfile}
        onSaveConstraints={setConstraintsProfile}
      />
      {leftSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setLeftSidebarOpen(false)} aria-hidden="true" />
      )}

      <CenterPanel
        theme={theme}
        dark={dark}
        manager={manager}
        scrollContainerRef={scrollContainerRef}
        viewDensity={viewDensity}
        setViewDensity={setViewDensity}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        constraintsProfile={constraintsProfile}
        filterEnabled={filterEnabled}
        setFilterEnabled={setFilterEnabled}
      />

      <RightSidebar
        theme={theme}
        manager={manager}
        isOpen={rightSidebarOpen}
        onClose={() => setRightSidebarOpen(false)}
      />
      {rightSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setRightSidebarOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
};
