/**
 * Center panel component for the HomePage.
 * Contains the main canvas with NeedView and toolbar.
 */

import { Lightbulb, Maximize2, Minimize2, PanelRight } from "lucide-react";
import { NeedView } from "../NeedView";
import { Breadcrumb } from "../Breadcrumb";
import { IndustryBranch } from "../IndustryBranch";
import type { IndustryExpression, Need, Era, HomePageManager } from "../../types";
import type { Theme } from "../../config/theme";
import toast from "react-hot-toast";

export interface CenterPanelProps {
  theme: Theme;
  dark: boolean;
  manager: HomePageManager;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  viewDensity: "compact" | "comfortable";
  setViewDensity: (density: "compact" | "comfortable") => void;
  breadcrumbPath: string[];
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  analyzedExpressions: {
    mechanisms: Set<string>;
    deepDives: Set<string>;
  };
}

export const CenterPanel = ({
  theme,
  dark,
  manager,
  scrollContainerRef,
  viewDensity,
  setViewDensity,
  breadcrumbPath,
  rightSidebarOpen,
  setRightSidebarOpen,
  analyzedExpressions
}: CenterPanelProps) => {
  const renderBranch = (expr: IndustryExpression, depth: number, needId: string): JSX.Element => {

    // Delete handler for user-added expressions
    const handleDelete = expr.userAdded ? () => {
      // Find and remove the expression from the need's predictions
      const need = manager.needs.find((n: Need) => n.id === needId);
      if (!need) return;

      const removeFromTree = (expressions: IndustryExpression[]): IndustryExpression[] => {
        return expressions.filter(e => e.id !== expr.id).map(e => ({
          ...e,
          children: removeFromTree(e.children || [])
        }));
      };

      const updatedEras = need.eras.map((era: Era) => ({
        ...era,
        expressions: removeFromTree(era.expressions as IndustryExpression[])
      }));

      manager.setNeeds((prev: Need[]) =>
        prev.map((n: Need) => n.id === needId ? { ...n, eras: updatedEras } : n)
      );

      toast.success("Prediction deleted");
    } : undefined;

    return (
      <IndustryBranch
        key={expr.id}
        expr={expr}
        depth={depth}
        needId={needId}
        isExpanded={!!manager.expandedBranches[expr.id]}
        isLoading={manager.branchLoading === expr.id}
        isSelected={manager.selected?.id === expr.id}
        isCrossSelected={manager.crossPollinate.items.some((i: any) => i.id === expr.id)}
        theme={theme}
        branchLoading={manager.branchLoading}
        mechanismLoading={manager.mechanismLoading}
        deepDiveLoading={manager.deepDiveLoading}
        hasMechanism={analyzedExpressions.mechanisms.has(expr.id)}
        hasDeepDive={analyzedExpressions.deepDives.has(expr.id)}
        onToggleExpand={() => manager.setExpandedBranches((p: any) => ({ ...p, [expr.id]: !p[expr.id] }))}
        onBranch={() => manager.branchIndustry(expr, needId)}
        onFetchMechanism={() => manager.fetchMechanism(expr)}
        onFetchDeepDive={() => manager.fetchDeepDive(expr)}
        onToggleCross={() => manager.toggleCrossItem(expr)}
        onAddSubIndustry={() => manager.setModal({ open: true, needId, parentId: expr.id })}
        onDelete={handleDelete}
        viewDensity={viewDensity}
        renderBranch={renderBranch}
      />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {!manager.needs.length && !manager.loading ? (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md">
            <Lightbulb className={`w-16 h-16 ${theme.muted} mx-auto mb-4 opacity-50`} />
            <h2 className="text-xl font-semibold mb-2">Innovation = Prior Art + New Context</h2>
            <p className={`text-sm ${theme.muted} mb-6`}>
              Research the "best known art" for any human need, then generate future industries as recombinations of existing solutions.
            </p>
            <p className={`text-xs ${theme.muted}`}>
              Choose a suggested need from the sidebar to get started.
            </p>
          </div>
        </div>
      ) : manager.activeNeed ? (
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              {breadcrumbPath.length > 0 && (
                <Breadcrumb path={breadcrumbPath} theme={theme} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center rounded-lg border ${theme.border} overflow-hidden`}>
                <button
                  onClick={() => setViewDensity("comfortable")}
                  className={`px-2 py-1 text-xs flex items-center gap-1.5 transition-colors ${
                    viewDensity === "comfortable" ? "bg-gray-500/20 text-gray-300" : theme.hover
                  }`}
                  title="Comfortable view"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewDensity("compact")}
                  className={`px-2 py-1 text-xs flex items-center gap-1.5 transition-colors ${
                    viewDensity === "compact" ? "bg-gray-500/20 text-gray-300" : theme.hover
                  }`}
                  title="Compact view"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Right Sidebar Toggle */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`md:hidden px-3 py-1.5 rounded flex items-center gap-2 ${theme.btn} transition-colors text-xs`}
            >
              <PanelRight className="w-3.5 h-3.5" />
              {rightSidebarOpen ? 'Hide' : 'Show'} Assistant
            </button>
          </div>

          {/* Content */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            <NeedView
              need={manager.activeNeed}
              theme={theme}
              dark={dark}
              renderBranch={renderBranch}
              onAddPrediction={() => manager.setModal({ open: true, needId: manager.activeNeed!.id, parentId: null })}
              onFetchNeed={manager.fetchNeed}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
