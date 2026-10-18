/**
 * Workspace layout. lg+: research/tools column | canvas | assistant column.
 * Below lg the side columns open as bottom sheets from the canvas toolbar.
 */
import { useRef, useState } from "react";
import { History, PanelRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import type { NeedManager } from "../hooks/useNeedManager";
import { useMatchScores } from "../hooks/useMatchScores";
import { useMediaQuery, WIDE_QUERY } from "../hooks/useMediaQuery";
import type { ConstraintsProfile } from "../types";
import { AssistantSection, CenterPanel, HistorySection, NeedTools, OpenNeeds, ResearchForm, type ViewDensity } from "./sidebars";
import { Segmented, Sheet } from "./ui";

interface HomePageProps {
  manager: NeedManager;
  constraintsProfile: ConstraintsProfile;
  filterEnabled: boolean;
  setFilterEnabled: (on: boolean) => void;
}

type MobileSheet = "research" | "tools" | "assistant" | null;
type AssistantTab = "assistant" | "history";

export const HomePage = ({ manager, constraintsProfile, filterEnabled, setFilterEnabled }: HomePageProps) => {
  const [viewDensity, setViewDensity] = useState<ViewDensity>("comfortable");
  const [sheet, setSheet] = useState<MobileSheet>(null);
  const [assistantTab, setAssistantTab] = useState<AssistantTab>("assistant");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const close = () => setSheet(null);
  const wide = useMediaQuery(WIDE_QUERY);

  const { getMatchScore, scoredCount } = useMatchScores(manager.activeNeed?.id, manager.analyzed.deepDives, constraintsProfile);

  const toolsProps = {
    manager,
    scrollContainerRef,
    viewDensity,
    setViewDensity,
    filterEnabled,
    setFilterEnabled,
    scoredCount,
  };

  return (
    <div className="flex h-full relative">
      {/* Desktop left column */}
      {wide && <aside className="w-80 xl:w-[22rem] shrink-0 border-r border-line overflow-y-auto" aria-label="Research and tools">
        <div className="p-5 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">New research</h2>
            <ResearchForm manager={manager} />
          </section>
          <OpenNeeds manager={manager} variant="list" />
          {manager.activeNeed && <NeedTools {...toolsProps} />}
        </div>
      </aside>}

      <div className="flex-1 flex min-w-0 relative">
        <CenterPanel
          manager={manager}
          scrollContainerRef={scrollContainerRef}
          wide={wide}
          viewDensity={viewDensity}
          filterEnabled={filterEnabled}
          getMatchScore={getMatchScore}
          onNewResearch={() => setSheet("research")}
          onOpenTools={() => setSheet("tools")}
          onOpenAssistant={() => setSheet("assistant")}
        />
      </div>

      {/* Desktop right column */}
      {wide && manager.activeNeed && (
        <aside className="flex w-80 xl:w-[22rem] shrink-0 border-l border-line flex-col" aria-label="Assistant and history">
          <div className="flex-[3] min-h-0 overflow-y-auto p-5 border-b border-line">
            <AssistantSection manager={manager} />
          </div>
          <div className="flex-[2] min-h-0">
            <HistorySection manager={manager} />
          </div>
        </aside>
      )}

      {/* Narrow-layout sheets */}
      {!wide && <>
      <Sheet
        isOpen={sheet === "research"}
        onClose={close}
        title="New research"
        description="Research another need. It opens next to the ones you have open."
        icon={<Search className="w-5 h-5" />}
      >
        <ResearchForm manager={manager} onStarted={close} autoFocus />
      </Sheet>

      <Sheet
        isOpen={sheet === "tools" && !!manager.activeNeed}
        onClose={close}
        title="Tools"
        description="View settings, export and the tree map for this need."
        icon={<SlidersHorizontal className="w-5 h-5" />}
      >
        <NeedTools {...toolsProps} onNavigate={close} />
      </Sheet>

      <Sheet
        isOpen={sheet === "assistant" && !!manager.activeNeed}
        onClose={close}
        title="Assistant"
        icon={<PanelRight className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <Segmented
            label="Panel"
            asTabs
            value={assistantTab}
            onChange={setAssistantTab}
            options={[
              { value: "assistant", label: "Next steps", icon: <Sparkles className="w-4 h-4" />, description: "AI-suggested steps for this need. You choose which to run." },
              { value: "history", label: "History", icon: <History className="w-4 h-4" />, description: "What changed in this session. Undo or redo from here." },
            ]}
          />
          {assistantTab === "assistant" ? (
            <AssistantSection manager={manager} />
          ) : (
            <div className="-mx-4 md:-mx-6 border-t border-line"><HistorySection manager={manager} /></div>
          )}
        </div>
      </Sheet>
      </>}
    </div>
  );
};
