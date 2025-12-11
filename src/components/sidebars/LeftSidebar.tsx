/**
 * Left sidebar component for the HomePage.
 * Contains search, need selector, prior art, suggested needs, quick actions, and mini-map.
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, AlertCircle, Shuffle, Download, ChevronDown, ChevronRight, BookOpen, X, Settings } from "lucide-react";
import { getIcon, SUGGESTED_NEEDS } from "../../config/constants";
import { MiniMap } from "../MiniMap";
import type { Need, HomePageManager, ConstraintsProfile } from "../../types";
import type { Theme } from "../../config/theme";
import { exportAsJSON, exportAsMarkdown, exportAsCSV } from "../../utils/export";
import { ConstraintsSettingsModal } from "../modals/ConstraintsSettingsModal";
import toast from "react-hot-toast";

export interface LeftSidebarProps {
  theme: Theme;
  dark: boolean;
  manager: HomePageManager;
  isOpen: boolean;
  onClose: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  analyzedExpressions: {
    mechanisms: Set<string>;
    deepDives: Set<string>;
  };
  constraintsProfile: ConstraintsProfile;
  onSaveConstraints: (profile: ConstraintsProfile) => void;
}

export const LeftSidebar = ({
  theme,
  dark,
  manager,
  isOpen,
  onClose,
  scrollContainerRef,
  analyzedExpressions,
  constraintsProfile,
  onSaveConstraints,
}: LeftSidebarProps) => {
  const [search, setSearch] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [priorArtExpanded, setPriorArtExpanded] = useState(false);
  const [showConstraintsModal, setShowConstraintsModal] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'json' | 'markdown' | 'csv') => {
    if (!manager.activeNeed) return;

    const exportData = {
      need: manager.activeNeed,
      analyzedExpressions: {
        mechanisms: Array.from(analyzedExpressions.mechanisms),
        deepDives: Array.from(analyzedExpressions.deepDives),
      },
    };

    try {
      const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`);

      switch (format) {
        case 'json':
          exportAsJSON(exportData);
          break;
        case 'markdown':
          exportAsMarkdown(exportData);
          break;
        case 'csv':
          exportAsCSV(exportData);
          break;
      }

      toast.success(`Exported as ${format.toUpperCase()}!`, { id: toastId });
      setShowExportDropdown(false);
    } catch (error) {
      toast.error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSearch = () => {
    if (search.trim()) {
      manager.fetchNeed(search.trim(), searchDescription.trim() || undefined);
      setSearch("");
      setSearchDescription("");
    }
  };

  return (
    <div className={`w-80 border-r ${theme.border} overflow-y-auto flex-shrink-0
      md:block ${isOpen ? 'block fixed inset-y-0 left-0 z-40 shadow-2xl' : 'hidden'}
      ${theme.card}`}>
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.muted}`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSearch()}
              placeholder="Search needs (e.g., vibecoder)..."
              className={`w-full pl-10 pr-4 py-4 rounded-lg ${theme.inputBg} border focus:outline-none focus:border-gray-500 text-sm transition-colors`}
            />
            {manager.loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
          <textarea
            value={searchDescription}
            onChange={e => setSearchDescription(e.target.value)}
            placeholder="Optional: What do you mean by this? (e.g., 'A person without coding skills who uses AI to program')"
            className={`w-full px-3 py-3 rounded-lg ${theme.inputBg} border focus:outline-none focus:border-gray-500 text-sm transition-colors resize-none overflow-hidden leading-relaxed`}
            rows={3}
          />
        </div>

        {/* Formula */}
        <div className={`px-3 py-2 rounded-lg border ${theme.border} ${theme.itemBg}`}>
          <p className={`text-[11px] ${theme.muted} leading-relaxed`}>
            Innovation = Prior Art + New Context • Branch to explore • Cross to recombine
          </p>
        </div>

        {/* Error */}
        {manager.error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300">{manager.error}</span>
          </div>
        )}

        {/* Need Selector */}
        {manager.needs.length > 0 && (
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.muted} mb-2`}>Active Research</h3>
            <div className="space-y-1">
              {manager.needs.map((n: Need) => (
                <div
                  key={n.id}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    manager.activeTab === n.id
                      ? (dark ? "bg-gray-500/20 text-gray-300" : "bg-gray-100 text-gray-700")
                      : (dark ? "hover:bg-gray-700/50" : "hover:bg-gray-100")
                  }`}
                >
                  <button
                    onClick={() => manager.setActiveTab(n.id)}
                    className="flex-1 text-left font-medium"
                  >
                    {n.name}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      manager.closeNeed(n.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 md:opacity-100 p-1 rounded transition-all ${
                      dark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                    title="Close (keeps in library)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prior Art Section */}
        {manager.activeNeed?.priorArt && (
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={() => setPriorArtExpanded(!priorArtExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${theme.hover} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Prior Art</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${priorArtExpanded ? 'rotate-90' : ''}`} />
            </button>

            {priorArtExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-3"
              >
                {/* Current Leaders */}
                {manager.activeNeed.priorArt.currentLeaders && manager.activeNeed.priorArt.currentLeaders.length > 0 && (
                  <div>
                    <p className={`text-xs font-medium ${theme.muted} mb-2 px-3`}>
                      Current Leaders ({manager.activeNeed.priorArt.currentLeaders.length})
                    </p>
                    <div className="space-y-1">
                      {manager.activeNeed.priorArt.currentLeaders.map((c: any, i: number) => (
                        <div key={i} className={`px-3 py-2 rounded-lg ${theme.itemBg} text-xs`}>
                          <p className="font-medium">{c.name}</p>
                          <p className={`${theme.muted} text-xs mt-0.5`}>{c.domain}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historical Precedents */}
                {manager.activeNeed.priorArt.historicalPrecedents && manager.activeNeed.priorArt.historicalPrecedents.length > 0 && (
                  <div>
                    <p className={`text-xs font-medium ${theme.muted} mb-2 px-3`}>
                      Historical ({manager.activeNeed.priorArt.historicalPrecedents.length})
                    </p>
                    <div className="space-y-1">
                      {manager.activeNeed.priorArt.historicalPrecedents.map((h: any, i: number) => (
                        <div key={i} className={`px-3 py-2 rounded-lg ${theme.itemBg} text-xs`}>
                          <p className="font-medium">{h.name}</p>
                          <p className={`${theme.muted} text-xs mt-0.5`}>{h.era}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adjacent Domains */}
                {manager.activeNeed.priorArt.adjacentDomains && manager.activeNeed.priorArt.adjacentDomains.length > 0 && (
                  <div>
                    <p className={`text-xs font-medium ${theme.muted} mb-2 px-3`}>
                      Adjacent Domains ({manager.activeNeed.priorArt.adjacentDomains.length})
                    </p>
                    <div className="space-y-1">
                      {manager.activeNeed.priorArt.adjacentDomains.map((a: any, i: number) => (
                        <div key={i} className={`px-3 py-2 rounded-lg ${theme.itemBg} text-xs`}>
                          <p className="font-medium">{a.name}</p>
                          <p className={`${theme.muted} text-xs mt-0.5`}>{a.originalDomain}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nature Solutions */}
                {manager.activeNeed.priorArt.natureSolutions && manager.activeNeed.priorArt.natureSolutions.length > 0 && (
                  <div>
                    <p className={`text-xs font-medium ${theme.muted} mb-2 px-3`}>
                      Nature's Solutions ({manager.activeNeed.priorArt.natureSolutions.length})
                    </p>
                    <div className="space-y-1">
                      {manager.activeNeed.priorArt.natureSolutions.map((n: any, i: number) => (
                        <div key={i} className={`px-3 py-2 rounded-lg ${theme.itemBg} text-xs`}>
                          <p className="font-medium">{n.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Suggested Needs */}
        {!manager.needs.length && !manager.loading && (
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.muted} mb-2`}>Suggested Needs</h3>
            <div className="space-y-1">
              {SUGGESTED_NEEDS.map(s => {
                const Icon = getIcon(s.icon);
                return (
                  <button
                    key={s.name}
                    onClick={() => manager.fetchNeed(s.name)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.card} ${theme.border} ${theme.hover} transition-all text-sm`}
                  >
                    <Icon className={`w-4 h-4 ${theme.accent}`} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {manager.activeNeed && (
          <div className="pt-4 border-t border-gray-700">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.muted} mb-2`}>Quick Actions</h3>
            <div className="space-y-1">
              {manager.crossPollinate.items.length > 0 && (
                <button
                  onClick={() => manager.setCrossPollinate((p: any) => ({ ...p, open: true }))}
                  className="w-full px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-xs flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Cross-Pollinate ({manager.crossPollinate.items.length}/2)
                </button>
              )}
              <div ref={exportRef} className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className={`w-full px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                    dark
                      ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-auto" />
                </button>
                {showExportDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-10 ${theme.card} ${theme.border}`}
                  >
                    <button
                      onClick={() => handleExport('json')}
                      className={`w-full px-3 py-2 text-left text-xs ${theme.hover} transition-colors`}
                    >
                      JSON <span className={`${dark ? "text-gray-400" : "text-gray-500"}`}>(Full data)</span>
                    </button>
                    <button
                      onClick={() => handleExport('markdown')}
                      className={`w-full px-3 py-2 text-left text-xs ${theme.hover} transition-colors`}
                    >
                      Markdown <span className={`${dark ? "text-gray-400" : "text-gray-500"}`}>(Report)</span>
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className={`w-full px-3 py-2 text-left text-xs ${theme.hover} transition-colors`}
                    >
                      CSV <span className={`${dark ? "text-gray-400" : "text-gray-500"}`}>(Spreadsheet)</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mini-map */}
        {manager.activeNeed && manager.activeNeed.eras && (
          <div className="pt-4 border-t border-gray-700">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.muted} mb-2`}>Tree Map</h3>
            <MiniMap
              eras={manager.activeNeed.eras}
              theme={theme}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        )}

        {/* Builder Profile Settings */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.muted} mb-2`}>Builder Profile</h3>
          <button
            onClick={() => setShowConstraintsModal(true)}
            className={`w-full px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
              dark
                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            Configure Profile
          </button>
          <p className={`text-[10px] ${theme.muted} mt-1.5 px-1`}>
            Personalize AI analysis to match your skills, time, and goals.
          </p>
        </div>
      </div>

      {/* Constraints Settings Modal */}
      <ConstraintsSettingsModal
        isOpen={showConstraintsModal}
        onClose={() => setShowConstraintsModal(false)}
        theme={theme}
        profile={constraintsProfile}
        onSave={onSaveConstraints}
      />
    </div>
  );
};
