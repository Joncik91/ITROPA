import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Sun, Moon, Keyboard, BookOpen, Shapes, Compass, FileText, Layers, TrendingUp, Rocket, Loader2, UserRound, Shuffle, Plus } from "lucide-react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useNeedManager } from "./hooks/useNeedManager";
import { useConstraints } from "./hooks/useConstraints";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./components/HomePage";
import { IconButton, Sheet, cx } from "./components/ui";
import { ConstraintsSettingsModal } from "./components/modals/ConstraintsSettingsModal";
import {
  MechanismModalContent,
  DeepDiveModalContent,
  CrossPollinateModalContent,
  AddPredictionModalContent,
  KeyboardShortcutsModalContent,
  AppConceptModalContent,
} from "./components/ModalContent";

// Secondary pages load on demand to keep the initial bundle small.
const LibraryView = lazy(() => import("./components/LibraryView").then(m => ({ default: m.LibraryView })));
const PatternsView = lazy(() => import("./components/PatternsView").then(m => ({ default: m.PatternsView })));

const DOCS_URL = "https://github.com/Joncik91/ITROPA/tree/main/docs";

type Page = "home" | "library" | "patterns";

const PAGES: Array<{ id: Page; label: string; icon: typeof Compass }> = [
  { id: "home", label: "Explore", icon: Compass },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "patterns", label: "Patterns", icon: Shapes },
];

const isPhone = () => typeof window !== "undefined" && !window.matchMedia?.("(min-width: 768px)").matches;

export default function App() {
  const [showKeys, setShowKeys] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [page, setPage] = useState<Page>("home");

  const { dark, toggleTheme } = useTheme();
  const manager = useNeedManager();
  const { profile, setProfile, filterEnabled, setFilterEnabled } = useConstraints();

  // Stacked toasts cover the top of the screen on phones; keep only the newest few.
  const { toasts } = useToasterStore();
  useEffect(() => {
    const limit = isPhone() ? 1 : 3;
    toasts.filter((t) => t.visible).slice(limit).forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  const closeAll = useCallback(() => {
    manager.closeAllModals();
    setShowKeys(false);
    setShowProfile(false);
  }, [manager.closeAllModals]);

  useKeyboardShortcuts({
    needs: manager.needs,
    activeTab: manager.activeTab,
    modalOpen: manager.anyModalOpen || showKeys || showProfile,
    onTabChange: manager.setActiveTab,
    onCloseModals: closeAll,
    onToggleShortcuts: () => setShowKeys(p => !p),
    onUndo: manager.undo,
    onRedo: manager.redo,
  });

  const openFromLibrary = useCallback(async (needId: string) => {
    if (await manager.openNeed(needId)) setPage("home");
  }, [manager.openNeed]);

  const toaster = (
    <Toaster
      position={isPhone() ? "top-center" : "bottom-right"}
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgb(var(--sheet))",
          color: "rgb(var(--ink))",
          border: "1px solid rgb(var(--line))",
          borderRadius: 12,
          fontSize: 14,
          maxWidth: 420,
        },
        success: { iconTheme: { primary: "rgb(var(--ok))", secondary: "rgb(var(--sheet))" } },
        error: { duration: 6000, iconTheme: { primary: "rgb(var(--bad))", secondary: "rgb(var(--sheet))" } },
        loading: { iconTheme: { primary: "rgb(var(--accent))", secondary: "rgb(var(--sheet))" } },
      }}
    />
  );

  if (!manager.ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center" aria-busy="true">
        <Loader2 className="w-8 h-8 animate-spin text-accent" aria-label="Loading your research" />
      </div>
    );
  }

  const { mechanism, deepDive, appConcepts } = manager;
  const themeLabel = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-dvh flex flex-col">
        <header className="flex items-center gap-2 pl-4 pr-2 md:px-6 h-14 border-b border-line shrink-0">
          <h1 className="text-lg font-extrabold tracking-tight mr-4 flex items-center gap-2">
            <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden>
              <path d="M16 4v24M16 13l-7-6M16 19l7-6" stroke="rgb(var(--accent))" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="16" cy="28" r="3" fill="rgb(var(--pollen))" />
            </svg>
            ITROPA
          </h1>
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {PAGES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPage(id)}
                aria-current={page === id ? "page" : undefined}
                className={cx(
                  "inline-flex items-center gap-2 px-3 h-9 rounded-control text-sm font-medium transition-colors",
                  page === id ? "bg-accent/10 text-accent" : "text-ink-2 hover:text-ink hover:bg-ink/5",
                )}
              >
                <Icon className="w-4 h-4" aria-hidden />
                {label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-control text-sm text-ink-2 hover:text-ink hover:bg-ink/5"
            >
              <UserRound className="w-4 h-4" aria-hidden /> Builder profile
            </button>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" title="Documentation (opens GitHub)" aria-label="Documentation (opens GitHub)"
              className="inline-flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-control text-ink-2 hover:text-ink hover:bg-ink/5">
              <FileText className="w-4 h-4" />
            </a>
            <IconButton label="Keyboard shortcuts (?)" onClick={() => setShowKeys(true)} className="hidden md:inline-flex"><Keyboard className="w-4 h-4" /></IconButton>
            <IconButton label={themeLabel} onClick={toggleTheme}>{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</IconButton>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-hidden">
          <ErrorBoundary label={page === "home" ? "the workspace" : page === "library" ? "the library" : "the pattern library"} resetKey={page}>
            <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>}>
              {page === "library" ? (
                <div className="h-full overflow-y-auto px-4 md:px-6 py-5 pb-24 md:pb-8">
                  <LibraryView onOpenNeed={openFromLibrary} onDeleteNeed={manager.removeNeed} onClearAll={manager.clearAllData} />
                </div>
              ) : page === "patterns" ? (
                <div className="h-full overflow-y-auto px-4 md:px-6 py-5 pb-24 md:pb-8">
                  <PatternsView onOpenNeed={openFromLibrary} />
                </div>
              ) : (
                <HomePage manager={manager} constraintsProfile={profile} filterEnabled={filterEnabled} setFilterEnabled={setFilterEnabled} />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Phone navigation */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-sheet/95 backdrop-blur pb-safe" aria-label="Main">
          <div className="grid grid-cols-4">
            {[...PAGES, { id: "profile" as const, label: "Profile", icon: UserRound }].map(({ id, label, icon: Icon }) => {
              const on = id === "profile" ? showProfile : page === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => (id === "profile" ? setShowProfile(true) : setPage(id))}
                  aria-current={id !== "profile" && on ? "page" : undefined}
                  className={cx("flex flex-col items-center justify-center gap-0.5 h-16 text-xs font-medium", on ? "text-accent" : "text-ink-2")}
                >
                  <span className={cx("px-4 py-1 rounded-full transition-colors", on && "bg-accent/15")}>
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        <ConstraintsSettingsModal isOpen={showProfile} onClose={() => setShowProfile(false)} profile={profile} onSave={setProfile} />

        <Sheet
          isOpen={!!mechanism}
          onClose={() => manager.setMechanism(null)}
          title={mechanism?.expressionName ?? ""}
          description="Mechanism: how this industry works, through five lenses."
          icon={<Layers className="w-5 h-5" />}
          size="lg"
          label="the mechanism analysis"
        >
          {mechanism && (
            <MechanismModalContent
              mechanism={mechanism.details}
              aiSuggestions={manager.mechanismSuggestions?.targetId === mechanism.expressionId ? manager.mechanismSuggestions.response : null}
              onAIAssist={() => manager.requestMechanismAIAssist(mechanism.expressionId)}
              aiLoading={manager.isAILoading("mechanism")}
              onExecuteAction={manager.executeAIAction}
            />
          )}
        </Sheet>

        <Sheet
          isOpen={!!deepDive}
          onClose={() => manager.setDeepDive(null)}
          title={deepDive?.expressionName ?? ""}
          description="Deep dive: market, competition, barriers and timing."
          icon={<TrendingUp className="w-5 h-5" />}
          size="lg"
          label="the deep dive"
        >
          {deepDive && (
            <DeepDiveModalContent
              deepDive={deepDive.details}
              aiSuggestions={manager.deepDiveSuggestions?.targetId === deepDive.expressionId ? manager.deepDiveSuggestions.response : null}
              onAIAssist={() => manager.requestDeepDiveAIAssist(deepDive.expressionId)}
              aiLoading={manager.isAILoading("deepDive")}
              onExecuteAction={manager.executeAIAction}
            />
          )}
        </Sheet>

        <Sheet
          isOpen={!!appConcepts}
          onClose={() => manager.setAppConcepts(null)}
          title={appConcepts?.expressionName ?? ""}
          description="App ideas: products you could build in this industry."
          icon={<Rocket className="w-5 h-5" />}
          size="lg"
          label="the app ideas"
        >
          {appConcepts && <AppConceptModalContent concepts={appConcepts.details} industryName={appConcepts.expressionName} />}
        </Sheet>

        <Sheet
          isOpen={manager.crossPollinate.open}
          onClose={manager.closeCrossPollinate}
          title="Cross-pollinate"
          description="Combine two industries into hybrids that borrow from both."
          icon={<Shuffle className="w-5 h-5" />}
        >
          <CrossPollinateModalContent
            crossPollinate={manager.crossPollinate}
            crossLoading={manager.crossLoading}
            onExecute={manager.executeCrossPollinate}
            onRegenerate={() => manager.executeCrossPollinate({ regenerate: true })}
            onReset={manager.resetCrossPollinate}
            needs={manager.needs}
            activeNeedId={manager.activeTab}
            onAddToNeed={(result, needId) => manager.addCrossPollinationResult(result, needId, manager.crossPollinate.items)}
          />
        </Sheet>

        <Sheet
          isOpen={manager.modal.open}
          onClose={manager.closeAddModal}
          title="Add your own prediction"
          description={manager.modal.parentId ? "Adds a sub-industry under the one you picked." : "Adds a new industry to the future era."}
          icon={<Plus className="w-5 h-5" />}
          size="sm"
        >
          <AddPredictionModalContent
            formData={manager.formData}
            isSubBranch={!!manager.modal.parentId}
            onFormChange={(updates) => manager.setFormData(f => ({ ...f, ...updates }))}
            onCancel={manager.closeAddModal}
            onSubmit={manager.addPrediction}
          />
        </Sheet>

        <Sheet isOpen={showKeys} onClose={() => setShowKeys(false)} title="Keyboard shortcuts" icon={<Keyboard className="w-5 h-5" />} size="sm">
          <KeyboardShortcutsModalContent />
        </Sheet>
      </div>
      {toaster}
    </MotionConfig>
  );
}
