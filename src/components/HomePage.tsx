/**
 * HomePage component - main exploration view with three-panel layout.
 * Split into LeftSidebar, CenterPanel, and RightSidebar components (SRP).
 */

import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import type { HomePageManager } from "../types";
import type { Theme } from "../config/theme";
import { DBService } from "../services/db.service";
import { LeftSidebar, CenterPanel, RightSidebar } from "./sidebars";

interface HomePageProps {
  theme: Theme;
  dark: boolean;
  manager: HomePageManager;
}

export const HomePage = ({ theme, dark, manager }: HomePageProps) => {
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);
  const [viewDensity, setViewDensity] = useState<"compact" | "comfortable">("comfortable");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [analyzedExpressions, setAnalyzedExpressions] = useState<{
    mechanisms: Set<string>;
    deepDives: Set<string>;
  }>({ mechanisms: new Set(), deepDives: new Set() });

  // Load analysis status when active need changes
  useEffect(() => {
    const loadAnalysisStatus = async () => {
      if (!manager.activeNeed) return;

      try {
        const mechanisms = await DBService.getMechanismsByNeed(manager.activeNeed.id);
        const deepDives = await DBService.getDeepDivesByNeed(manager.activeNeed.id);

        setAnalyzedExpressions({
          mechanisms: new Set(mechanisms.map(m => m.id)),
          deepDives: new Set(deepDives.map(d => d.id)),
        });
      } catch (e) {
        console.error("Failed to load analysis status:", e);
      }
    };

    loadAnalysisStatus();
  }, [manager.activeNeed?.id, manager.mechanism, manager.deepDive]);

  // Handle drag-and-drop cross-pollination
  useEffect(() => {
    const handleCrossPollinateDrag = (event: any) => {
      const { draggedExpr, targetExpr } = event.detail;

      // Add both items to cross-pollination
      manager.toggleCrossItem(draggedExpr);
      manager.toggleCrossItem(targetExpr);
    };

    window.addEventListener('cross-pollinate-drag', handleCrossPollinateDrag);
    return () => window.removeEventListener('cross-pollinate-drag', handleCrossPollinateDrag);
  }, [manager]);

  return (
    <div className="flex h-full relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${theme.card} border ${theme.border} shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Left Sidebar - Navigation & Context */}
      <LeftSidebar
        theme={theme}
        dark={dark}
        manager={manager}
        isOpen={leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
        scrollContainerRef={scrollContainerRef}
        analyzedExpressions={analyzedExpressions}
      />

      {/* Center Panel - Main Canvas */}
      <CenterPanel
        theme={theme}
        dark={dark}
        manager={manager}
        scrollContainerRef={scrollContainerRef}
        viewDensity={viewDensity}
        setViewDensity={setViewDensity}
        breadcrumbPath={breadcrumbPath}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        analyzedExpressions={analyzedExpressions}
      />

      {/* Right Sidebar - History + AI Assistant */}
      <RightSidebar
        theme={theme}
        manager={manager}
        isOpen={rightSidebarOpen}
        onClose={() => setRightSidebarOpen(false)}
      />

      {/* Right sidebar overlay for mobile */}
      {rightSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}
    </div>
  );
};
