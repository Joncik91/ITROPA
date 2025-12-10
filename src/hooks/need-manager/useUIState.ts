import { useState } from 'react';
import type { IndustryExpression, FormData, CrossPollinateState } from '../../types';

/**
 * UI state management
 * Handles modals, form data, selections, expansions, and UI toggles
 */
export function useUIState() {
  const [selected, setSelected] = useState<IndustryExpression | null>(null);
  const [deepDive, setDeepDive] = useState<any>(null);
  const [mechanism, setMechanism] = useState<any>(null);
  const [crossPollinate, setCrossPollinate] = useState<CrossPollinateState>({ open: false, items: [], result: null });
  const [modal, setModal] = useState({ open: false, needId: null as string | null, parentId: null as string | null });
  const [formData, setFormData] = useState<FormData>({ name: "", mutation: "", insight: "" });
  const [showPriorArt, setShowPriorArt] = useState<Record<string, boolean>>({});
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  // Loading states specific to operations
  const [branchLoading, setBranchLoading] = useState<string | null>(null);
  const [mechanismLoading, setMechanismLoading] = useState(false);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [crossLoading, setCrossLoading] = useState(false);

  const closeAllModals = () => {
    setDeepDive(null);
    setMechanism(null);
    setCrossPollinate({ open: false, items: [], result: null });
    setModal({ open: false, needId: null, parentId: null });
  };

  const toggleCrossItem = (item: IndustryExpression) => {
    setCrossPollinate(prev => {
      const exists = prev.items.find(i => i.id === item.id);
      if (exists) {
        return { ...prev, items: prev.items.filter(i => i.id !== item.id) };
      } else if (prev.items.length < 2) {
        return { ...prev, items: [...prev.items, item] };
      }
      return prev;
    });
  };

  return {
    // Selection state
    selected,
    setSelected,
    deepDive,
    setDeepDive,
    mechanism,
    setMechanism,
    crossPollinate,
    setCrossPollinate,

    // Modal state
    modal,
    setModal,
    formData,
    setFormData,

    // Expansion state
    showPriorArt,
    setShowPriorArt,
    expandedBranches,
    setExpandedBranches,

    // Loading states
    branchLoading,
    setBranchLoading,
    mechanismLoading,
    setMechanismLoading,
    deepDiveLoading,
    setDeepDiveLoading,
    crossLoading,
    setCrossLoading,

    // Actions
    closeAllModals,
    toggleCrossItem,
  };
}
