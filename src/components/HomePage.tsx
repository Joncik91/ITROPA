import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, AlertCircle, Lightbulb, Shuffle, Download, ChevronDown, Sparkles, ChevronRight, BookOpen, Maximize2, Minimize2, Menu, PanelLeft, PanelRight, X } from "lucide-react";
import { getIcon, SUGGESTED_NEEDS } from "../config/constants";
import { IndustryBranch } from "./IndustryBranch";
import { NeedView } from "./NeedView";
import { MiniMap } from "./MiniMap";
import { HistoryPanel } from "./HistoryPanel";
import type { IndustryExpression, Need, Era } from "../types";
import { DBService } from "../services/db.service";
import { exportAsJSON, exportAsMarkdown, exportAsCSV } from "../utils/export";
import toast from "react-hot-toast";
import { Breadcrumb } from "./Breadcrumb";

interface HomePageProps {
  theme: any;
  dark: boolean;
  manager: any;
}

export const HomePage = ({ theme, dark, manager }: HomePageProps) => {
  const [search, setSearch] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [priorArtExpanded, setPriorArtExpanded] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);
  const [viewDensity, setViewDensity] = useState<"compact" | "comfortable">("comfortable");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
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
      manager.fetchNeed(search.trim()); 
      setSearch(""); 
    } 
  };

  const renderBranch = (expr: IndustryExpression, depth: number, needId: string): JSX.Element => {
    // Delete handler for user-added expressions
    const handleDelete = expr.userAdded ? () => {
      // Find and remove the expression from the need's predictions
      const need = manager.needs.find((n: any) => n.id === needId);
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
    <div className="flex h-full relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${theme.card} border ${theme.border} shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Left Sidebar - Navigation & Context */}
      <div className={`w-80 border-r ${theme.border} overflow-y-auto flex-shrink-0 
        md:block ${leftSidebarOpen ? 'block fixed inset-y-0 left-0 z-40 shadow-2xl' : 'hidden'}
        ${theme.card}`}>
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.muted}`} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && handleSearch()} 
              placeholder="Search needs..." 
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${theme.inputBg} border focus:outline-none focus:border-indigo-500 text-sm transition-colors`} 
            />
            {manager.loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
            )}
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
                {manager.needs.map((n: any) => (
                  <div 
                    key={n.id}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      manager.activeTab === n.id 
                        ? (dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700") 
                        : (dark ? "hover:bg-slate-700/50" : "hover:bg-slate-100")
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
                        dark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
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
            <div className="pt-4 border-t border-slate-700">
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
            <div className="pt-4 border-t border-slate-700">
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
                        JSON <span className={`${dark ? "text-slate-400" : "text-slate-500"}`}>(Full data)</span>
                      </button>
                      <button
                        onClick={() => handleExport('markdown')}
                        className={`w-full px-3 py-2 text-left text-xs ${theme.hover} transition-colors`}
                      >
                        Markdown <span className={`${dark ? "text-slate-400" : "text-slate-500"}`}>(Report)</span>
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className={`w-full px-3 py-2 text-left text-xs ${theme.hover} transition-colors`}
                      >
                        CSV <span className={`${dark ? "text-slate-400" : "text-slate-500"}`}>(Spreadsheet)</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mini-map */}
          {manager.activeNeed && manager.activeNeed.eras && (
            <div className="pt-4 border-t border-slate-700">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.muted} mb-2`}>Tree Map</h3>
              <MiniMap
                eras={manager.activeNeed.eras}
                theme={theme}
                scrollContainerRef={scrollContainerRef}
              />
            </div>
          )}
        </div>
      </div>

      {/* Center Panel - Main Canvas */}
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
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700 flex-shrink-0">
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
                      viewDensity === "comfortable" ? "bg-indigo-500/20 text-indigo-300" : theme.hover
                    }`}
                    title="Comfortable view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewDensity("compact")}
                    className={`px-2 py-1 text-xs flex items-center gap-1.5 transition-colors ${
                      viewDensity === "compact" ? "bg-indigo-500/20 text-indigo-300" : theme.hover
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

      {/* Right Sidebar - History + AI Assistant */}
      {manager.activeNeed && (
        <div className={`w-80 border-l ${theme.border} flex-shrink-0 flex flex-col
          md:block ${rightSidebarOpen ? 'block fixed inset-y-0 right-0 z-40 shadow-2xl' : 'hidden'}
          ${theme.card}`}>
          {/* Mobile close button */}
          <button
            onClick={() => setRightSidebarOpen(false)}
            className={`md:hidden absolute top-4 right-4 z-10 p-2 rounded-lg ${theme.hover}`}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>

          {/* History Panel - Top Half */}
          <div className="h-1/2 border-b border-gray-700 overflow-hidden">
            <HistoryPanel
              history={manager.history}
              theme={theme}
              onUndo={manager.undo}
              onRedo={manager.redo}
              onClear={manager.clearHistory}
            />
          </div>
          
          {/* AI Assistant - Bottom Half */}
          <div className="h-1/2 overflow-y-auto">
            <div className="p-4 space-y-4">
            {/* Context Header */}
            <div>
              <h3 className="text-sm font-semibold mb-1">AI Assistant</h3>
              <p className={`text-xs ${theme.muted}`}>Working on: {manager.selected?.name || manager.activeNeed.name}</p>
            </div>

            {/* Need-level AI Suggestions */}
            {manager.needAISuggestions && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-indigo-300">Suggested Next Steps</div>
                {manager.needAISuggestions.suggestions.map((suggestion: any) => (
                  <div key={suggestion.id} className={`p-3 rounded-lg border ${theme.border} ${theme.card}`}>
                    <div className="text-xs font-medium mb-1">{suggestion.action}</div>
                    <div className={`text-xs ${theme.muted} mb-2`}>{suggestion.reason}</div>
                    <button
                      onClick={() => manager.executeAIAction(suggestion)}
                      disabled={manager.aiLoading}
                      className={`w-full px-3 py-1.5 rounded text-xs ${theme.btn} hover:bg-indigo-500/20 transition-colors disabled:opacity-50`}
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Mechanism AI Suggestions */}
            {manager.mechanism && manager.mechanismAISuggestions && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-blue-300">Mechanism Insights</div>
                {manager.mechanismAISuggestions.suggestions.map((suggestion: any) => (
                  <div key={suggestion.id} className={`p-3 rounded-lg border ${theme.border} ${theme.card}`}>
                    <div className="text-xs font-medium mb-1">{suggestion.action}</div>
                    <div className={`text-xs ${theme.muted} mb-2`}>{suggestion.reason}</div>
                    <button
                      onClick={() => manager.executeAIAction(suggestion)}
                      disabled={manager.aiLoading}
                      className={`w-full px-3 py-1.5 rounded text-xs ${theme.btn} hover:bg-blue-500/20 transition-colors disabled:opacity-50`}
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Deep Dive AI Suggestions */}
            {manager.deepDive && manager.deepDiveAISuggestions && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-purple-300">Deep Dive Actions</div>
                {manager.deepDiveAISuggestions.suggestions.map((suggestion: any) => (
                  <div key={suggestion.id} className={`p-3 rounded-lg border ${theme.border} ${theme.card}`}>
                    <div className="text-xs font-medium mb-1">{suggestion.action}</div>
                    <div className={`text-xs ${theme.muted} mb-2`}>{suggestion.reason}</div>
                    <button
                      onClick={() => manager.executeAIAction(suggestion)}
                      disabled={manager.aiLoading}
                      className={`w-full px-3 py-1.5 rounded text-xs ${theme.btn} hover:bg-purple-500/20 transition-colors disabled:opacity-50`}
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Request AI Assistance Buttons */}
            {!manager.needAISuggestions && !manager.mechanismAISuggestions && !manager.deepDiveAISuggestions && (
              <div className="space-y-2">
                <button
                  onClick={() => manager.requestNeedAIAssist(manager.activeNeed!.id)}
                  disabled={manager.aiLoading}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.btn} hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {manager.aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Suggest Next Steps
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
      )}

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
