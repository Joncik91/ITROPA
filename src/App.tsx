import { useState, useCallback, lazy, Suspense } from "react";
import { Sun, Moon, Keyboard, BookOpen, Shapes, Home, FileText, Layers, TrendingUp, Rocket, Loader2 } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import { getTheme } from "./config/theme";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useNeedManager } from "./hooks/useNeedManager";
import { ModalWrapper } from "./components/ModalWrapper";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./components/HomePage";
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

export default function App() {
  const [showKeys, setShowKeys] = useState(false);
  const [page, setPage] = useState<Page>("home");

  const { dark, toggleTheme } = useTheme();
  const theme = getTheme(dark);
  const manager = useNeedManager();

  const closeAll = useCallback(() => {
    manager.closeAllModals();
    setShowKeys(false);
  }, [manager.closeAllModals]);

  useKeyboardShortcuts({
    needs: manager.needs,
    activeTab: manager.activeTab,
    modalOpen: manager.anyModalOpen || showKeys,
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
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: dark ? '#1e293b' : '#ffffff',
          color: dark ? '#e2e8f0' : '#1e293b',
          border: dark ? '1px solid #334155' : '1px solid #cbd5e1',
          maxWidth: 420,
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
        error: { duration: 6000, iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        loading: { iconTheme: { primary: '#6366f1', secondary: '#ffffff' } },
      }}
    />
  );

  if (!manager.ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg} ${theme.text}`} aria-busy="true">
        <Loader2 className={`w-8 h-8 animate-spin ${theme.accent}`} aria-label="Loading" />
      </div>
    );
  }

  const navButton = (target: Page, label: string, Icon: typeof Home) => (
    <button
      onClick={() => setPage(target)}
      className={`p-2 rounded-lg ${page === target ? "bg-gray-500/20 text-gray-300" : theme.hover}`}
      title={label}
      aria-label={label}
      aria-current={page === target ? "page" : undefined}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const { mechanism, deepDive, appConcepts } = manager;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-200`}>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between pl-16 md:pl-6 pr-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-2xl font-bold">ITROPA</h1>
          <nav className="flex gap-2" aria-label="Main">
            {navButton("home", "Home", Home)}
            {navButton("library", "Library", BookOpen)}
            {navButton("patterns", "Pattern Library", Shapes)}
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg ${theme.hover}`} title="Documentation" aria-label="Documentation">
              <FileText className="w-4 h-4" />
            </a>
            <button onClick={() => setShowKeys(true)} className={`p-2 rounded-lg ${theme.hover}`} title="Keyboard Shortcuts" aria-label="Keyboard shortcuts">
              <Keyboard className="w-4 h-4" />
            </button>
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${theme.hover}`} title="Toggle Theme" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>
        </header>

        <main className="flex-1 overflow-hidden">
          <ErrorBoundary label={page === "home" ? "the workspace" : page === "library" ? "the library" : "the pattern library"} resetKey={page}>
            <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className={`w-6 h-6 animate-spin ${theme.accent}`} /></div>}>
              {page === "library" ? (
                <div className="h-full overflow-auto px-6 py-4">
                  <LibraryView theme={theme} dark={dark} onOpenNeed={openFromLibrary} onDeleteNeed={manager.removeNeed} onClearAll={manager.clearAllData} />
                </div>
              ) : page === "patterns" ? (
                <div className="h-full overflow-auto px-6 py-4">
                  <PatternsView theme={theme} dark={dark} onOpenNeed={openFromLibrary} />
                </div>
              ) : (
                <HomePage theme={theme} dark={dark} manager={manager} />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>

        <ModalWrapper
          isOpen={!!mechanism}
          onClose={() => manager.setMechanism(null)}
          title={`Mechanism: ${mechanism?.expressionName ?? ""}`}
          icon={<Layers className={`w-5 h-5 ${theme.accent}`} />}
          theme={theme}
        >
          {mechanism && (
            <MechanismModalContent
              mechanism={mechanism.details}
              theme={theme}
              dark={dark}
              aiSuggestions={manager.mechanismSuggestions?.targetId === mechanism.expressionId ? manager.mechanismSuggestions.response : null}
              onAIAssist={() => manager.requestMechanismAIAssist(mechanism.expressionId)}
              aiLoading={manager.isAILoading("mechanism")}
              onExecuteAction={manager.executeAIAction}
            />
          )}
        </ModalWrapper>

        <ModalWrapper
          isOpen={!!deepDive}
          onClose={() => manager.setDeepDive(null)}
          title={`Deep Dive: ${deepDive?.expressionName ?? ""}`}
          icon={<TrendingUp className={`w-5 h-5 ${theme.accent}`} />}
          theme={theme}
        >
          {deepDive && (
            <DeepDiveModalContent
              deepDive={deepDive.details}
              theme={theme}
              aiSuggestions={manager.deepDiveSuggestions?.targetId === deepDive.expressionId ? manager.deepDiveSuggestions.response : null}
              onAIAssist={() => manager.requestDeepDiveAIAssist(deepDive.expressionId)}
              aiLoading={manager.isAILoading("deepDive")}
              onExecuteAction={manager.executeAIAction}
            />
          )}
        </ModalWrapper>

        <ModalWrapper
          isOpen={!!appConcepts}
          onClose={() => manager.setAppConcepts(null)}
          title={`App Concepts: ${appConcepts?.expressionName ?? ""}`}
          icon={<Rocket className={`w-5 h-5 ${theme.accent}`} />}
          theme={theme}
          maxWidth="max-w-2xl"
        >
          {appConcepts && (
            <AppConceptModalContent
              concepts={appConcepts.details}
              industryName={appConcepts.expressionName}
              theme={theme}
              dark={dark}
            />
          )}
        </ModalWrapper>

        <ModalWrapper
          isOpen={manager.crossPollinate.open}
          onClose={manager.closeCrossPollinate}
          title="Cross-Pollinate Industries"
          theme={theme}
        >
          <CrossPollinateModalContent
            crossPollinate={manager.crossPollinate}
            crossLoading={manager.crossLoading}
            theme={theme}
            onExecute={manager.executeCrossPollinate}
            onRegenerate={() => manager.executeCrossPollinate({ regenerate: true })}
            onReset={manager.resetCrossPollinate}
            needs={manager.needs}
            activeNeedId={manager.activeTab}
            onAddToNeed={(result, needId) => manager.addCrossPollinationResult(result, needId, manager.crossPollinate.items)}
          />
        </ModalWrapper>

        <ModalWrapper
          isOpen={manager.modal.open}
          onClose={manager.closeAddModal}
          title="Add Prediction"
          theme={theme}
          maxWidth="max-w-md"
        >
          <AddPredictionModalContent
            formData={manager.formData}
            theme={theme}
            isSubBranch={!!manager.modal.parentId}
            onFormChange={(updates) => manager.setFormData(f => ({ ...f, ...updates }))}
            onCancel={manager.closeAddModal}
            onSubmit={manager.addPrediction}
          />
        </ModalWrapper>

        <ModalWrapper
          isOpen={showKeys}
          onClose={() => setShowKeys(false)}
          title="Keyboard Shortcuts"
          theme={theme}
          maxWidth="max-w-sm"
        >
          <KeyboardShortcutsModalContent theme={theme} />
        </ModalWrapper>
      </div>
      {toaster}
    </div>
  );
}
