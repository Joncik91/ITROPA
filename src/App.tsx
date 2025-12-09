import { useState, useEffect } from "react";
import { Sun, Moon, Keyboard, BookOpen, Shapes, Home } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import { getTheme } from "./config/theme";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useNeedManager } from "./hooks/useNeedManager";
import { ModalWrapper } from "./components/ModalWrapper";
import { HomePage } from "./components/HomePage";
import { LibraryView } from "./components/LibraryView";
import { PatternsView } from "./components/PatternsView";
import { PasswordPrompt } from "./components/PasswordPrompt";
import { 
  MechanismModalContent, 
  DeepDiveModalContent, 
  CrossPollinateModalContent,
  AddPredictionModalContent,
  KeyboardShortcutsModalContent 
} from "./components/ModalContent";
import { Layers, TrendingUp } from "lucide-react";

export default function App() {
  const [showKeys, setShowKeys] = useState(false);
  const [page, setPage] = useState<"home" | "library" | "patterns">("home");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { dark, toggleTheme } = useTheme();
  const theme = getTheme(dark);
  
  // IMPORTANT: Always call hooks before any conditional returns
  const manager = useNeedManager();

  // Check if running in production (Vercel) or local
  const isProduction = import.meta.env.PROD;

  // Check authentication on mount
  useEffect(() => {
    if (!isProduction) {
      // Local development - no auth required
      setAuthenticated(true);
      setCheckingAuth(false);
    } else {
      // Production - check if already authenticated
      const isAuth = localStorage.getItem('authenticated') === 'true';
      setAuthenticated(isAuth);
      setCheckingAuth(false);
    }
  }, [isProduction]);

  useKeyboardShortcuts({
    needs: manager.needs,
    activeTab: manager.activeTab,
    modalOpen: manager.modal.open,
    onTabChange: manager.setActiveTab,
    onCloseModals: () => {
      manager.closeAllModals();
      setShowKeys(false);
    },
    onToggleShortcuts: () => setShowKeys(p => !p),
    onUndo: manager.undo,
    onRedo: manager.redo,
  });

  // Show loading or password prompt
  if (checkingAuth) {
    return null;
  }

  if (isProduction && !authenticated) {
    return (
      <>
        <PasswordPrompt 
          onAuthenticated={() => setAuthenticated(true)}
          theme={theme}
          dark={dark}
        />
        <Toaster position="bottom-right" />
      </>
    );
  }

  const loadNeedFromLibrary = (need: any) => {
    const existing = manager.needs.find(n => n.id === need.id);
    if (!existing) {
      manager.fetchNeed(need.name);
    } else {
      manager.setActiveTab(need.id);
    }
    setPage("home");
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-200`}>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">ITROPA</h1>
            <p className={`text-sm ${theme.muted}`}>Innovation through recombination of prior art</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage("home")} 
              className={`p-2 rounded-lg ${page === "home" ? "bg-indigo-500/20 text-indigo-300" : theme.hover}`}
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage("library")} 
              className={`p-2 rounded-lg ${page === "library" ? "bg-indigo-500/20 text-indigo-300" : theme.hover}`}
              title="Library"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage("patterns")} 
              className={`p-2 rounded-lg ${page === "patterns" ? "bg-indigo-500/20 text-indigo-300" : theme.hover}`}
              title="Pattern Library"
            >
              <Shapes className="w-4 h-4" />
            </button>
            <button onClick={() => setShowKeys(true)} className={`p-2 rounded-lg ${theme.hover}`} title="Keyboard Shortcuts"><Keyboard className="w-4 h-4" /></button>
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${theme.hover}`} title="Toggle Theme">{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {page === "library" ? (
            <div className="h-full overflow-auto px-6 py-4">
              <LibraryView theme={theme} dark={dark} onLoadNeed={loadNeedFromLibrary} />
            </div>
          ) : page === "patterns" ? (
            <div className="h-full overflow-auto px-6 py-4">
              <PatternsView theme={theme} dark={dark} onLoadNeed={loadNeedFromLibrary} />
            </div>
          ) : (
            <HomePage theme={theme} dark={dark} manager={manager} />
          )}
        </div>

        {/* Modals */}
        <ModalWrapper
          isOpen={!!manager.mechanism}
          onClose={() => manager.setMechanism(null)}
          title={`Mechanism: ${manager.mechanism?.name || ""}`}
          icon={<Layers className={`w-5 h-5 ${theme.accent}`} />}
          theme={theme}
        >
          {manager.mechanism && (
            <MechanismModalContent 
              mechanism={manager.mechanism} 
              theme={theme} 
              dark={dark}
              aiSuggestions={manager.mechanismAISuggestions}
              onAIAssist={() => manager.requestMechanismAIAssist(manager.mechanism.id)}
              aiLoading={manager.aiLoading}
              onExecuteAction={manager.executeAIAction}
            />
          )}
        </ModalWrapper>

        <ModalWrapper
          isOpen={!!manager.deepDive}
          onClose={() => manager.setDeepDive(null)}
          title={`Deep Dive: ${manager.deepDive?.name || ""}`}
          icon={<TrendingUp className={`w-5 h-5 ${theme.accent}`} />}
          theme={theme}
        >
          {manager.deepDive && (
            <DeepDiveModalContent 
              deepDive={manager.deepDive} 
              theme={theme}
              aiSuggestions={manager.deepDiveAISuggestions}
              onAIAssist={() => manager.requestDeepDiveAIAssist(manager.deepDive.id)}
              aiLoading={manager.aiLoading}
              onExecuteAction={manager.executeAIAction}
            />
          )}
        </ModalWrapper>

        <ModalWrapper
          isOpen={manager.crossPollinate.open}
          onClose={() => manager.setCrossPollinate(p => ({ ...p, open: false }))}
          title="Cross-Pollinate Industries"
          theme={theme}
        >
          <CrossPollinateModalContent
            crossPollinate={manager.crossPollinate}
            crossLoading={manager.crossLoading}
            theme={theme}
            onExecute={manager.executeCrossPollinate}
            needs={manager.needs}
            onAddToNeed={manager.addCrossPollinationResult}
          />
        </ModalWrapper>

        <ModalWrapper
          isOpen={manager.modal.open}
          onClose={() => manager.setModal({ open: false, needId: null, parentId: null })}
          title="Add Prediction"
          theme={theme}
          maxWidth="max-w-md"
        >
          <AddPredictionModalContent
            formData={manager.formData}
            theme={theme}
            isSubBranch={!!manager.modal.parentId}
            onFormChange={(updates) => manager.setFormData(f => ({ ...f, ...updates }))}
            onCancel={() => manager.setModal({ open: false, needId: null, parentId: null })}
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

        <footer className={`mt-8 text-center text-xs px-6 py-3 ${theme.muted} border-t border-slate-700 flex-shrink-0`}>Innovation = Prior Art + New Context • Branch to explore • Cross to recombine</footer>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: dark ? '#1e293b' : '#ffffff',
            color: dark ? '#e2e8f0' : '#1e293b',
            border: dark ? '1px solid #334155' : '1px solid #cbd5e1',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}
