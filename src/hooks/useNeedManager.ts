import { useState, useCallback, useEffect } from "react";
import toast from 'react-hot-toast';
import type { Need, IndustryExpression, FormData, CrossPollinateState, AIActionSuggestion, AIAssistantResponse, HistoryAction, HistoryState } from "../types";
import { getGeminiService } from "../services/gemini.service";
import { DBService } from "../services/db.service";
import { getAIAssistant } from "../services/ai-assistant.service";

export const useNeedManager = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selected, setSelected] = useState<IndustryExpression | null>(null);
  const [deepDive, setDeepDive] = useState<any>(null);
  const [mechanism, setMechanism] = useState<any>(null);
  const [crossPollinate, setCrossPollinate] = useState<CrossPollinateState>({ open: false, items: [], result: null });
  const [modal, setModal] = useState({ open: false, needId: null as string | null, parentId: null as string | null });
  const [formData, setFormData] = useState<FormData>({ name: "", mutation: "", insight: "" });
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [branchLoading, setBranchLoading] = useState<string | null>(null);
  const [mechanismLoading, setMechanismLoading] = useState(false);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [crossLoading, setCrossLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, Need>>({});
  const [showPriorArt, setShowPriorArt] = useState<Record<string, boolean>>({});
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  
  // AI Assistant state
  const [mechanismAISuggestions, setMechanismAISuggestions] = useState<AIAssistantResponse | null>(null);
  const [deepDiveAISuggestions, setDeepDiveAISuggestions] = useState<AIAssistantResponse | null>(null);
  const [needAISuggestions, setNeedAISuggestions] = useState<AIAssistantResponse | null>(null);
  const [aiLoading, setAILoading] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
  });

  const MAX_HISTORY = 50; // Limit history size

  const geminiService = getGeminiService();
  const activeNeed = needs.find(n => n.id === activeTab);

  // Load needs from database on mount
  useEffect(() => {
    const loadNeeds = async () => {
      try {
        const dbNeeds = await DBService.getAllNeeds();
        if (dbNeeds.length > 0) {
          setNeeds(dbNeeds);
          setActiveTab(dbNeeds[0].id);
          // Rebuild cache
          const cacheData: Record<string, Need> = {};
          dbNeeds.forEach(need => {
            const key = need.name.toLowerCase().trim();
            cacheData[key] = need;
          });
          setCache(cacheData);
        }
      } catch (e) {
        console.error('Failed to load needs from database:', e);
      }
    };
    loadNeeds();
  }, []);

  // History tracking functions
  const addToHistory = (action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const historyAction: HistoryAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const newPast = [...prev.past, historyAction].slice(-MAX_HISTORY);
      return {
        past: newPast,
        future: [], // Clear redo stack on new action
        canUndo: true,
        canRedo: false,
      };
    });
  };

  const undo = () => {
    if (history.past.length === 0) return;

    const action = history.past[history.past.length - 1];
    
    // Restore previous state based on action type
    switch (action.type) {
      case 'add_need':
        if (action.data.needId) {
          setNeeds(prev => prev.filter(n => n.id !== action.data.needId));
          toast.success('Undid: Add need');
        }
        break;
      
      case 'delete_need':
        if (action.data.previousState) {
          setNeeds(prev => [...prev, action.data.previousState]);
          toast.success('Undid: Delete need');
        }
        break;
      
      case 'close_need':
        if (action.data.previousState) {
          setNeeds(prev => [...prev, action.data.previousState]);
          setActiveTab(action.data.needId);
          toast.success('Undid: Close need');
        }
        break;
      
      case 'branch':
      case 'add_child':
      case 'delete_expression':
        if (action.data.needId && action.data.previousState) {
          setNeeds(prev => prev.map(n => 
            n.id === action.data.needId ? action.data.previousState : n
          ));
          toast.success(`Undid: ${action.description}`);
        }
        break;
    }

    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [action, ...prev.future],
      canUndo: prev.past.length > 1,
      canRedo: true,
    }));
  };

  const redo = () => {
    if (history.future.length === 0) return;

    const action = history.future[0];
    
    // Reapply action
    switch (action.type) {
      case 'add_need':
        if (action.data.newState) {
          setNeeds(prev => [...prev, action.data.newState]);
          toast.success('Redid: Add need');
        }
        break;
      
      case 'delete_need':
        if (action.data.needId) {
          setNeeds(prev => prev.filter(n => n.id !== action.data.needId));
          toast.success('Redid: Delete need');
        }
        break;
      
      case 'close_need':
        if (action.data.needId) {
          setNeeds(prev => prev.filter(n => n.id !== action.data.needId));
          if (activeTab === action.data.needId) {
            const remainingNeeds = needs.filter(n => n.id !== action.data.needId);
            setActiveTab(remainingNeeds[0]?.id || null);
          }
          toast.success('Redid: Close need');
        }
        break;
      
      case 'branch':
      case 'add_child':
      case 'delete_expression':
        if (action.data.needId && action.data.newState) {
          setNeeds(prev => prev.map(n => 
            n.id === action.data.needId ? action.data.newState : n
          ));
          toast.success(`Redid: ${action.description}`);
        }
        break;
    }

    setHistory(prev => ({
      past: [...prev.past, action],
      future: prev.future.slice(1),
      canUndo: true,
      canRedo: prev.future.length > 1,
    }));
  };

  const clearHistory = () => {
    setHistory({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  };

  const fetchNeed = useCallback(async (needName: string) => {
    const key = needName.toLowerCase().trim();
    if (cache[key]) {
      if (!needs.find(n => n.id === cache[key].id)) {
        setNeeds(p => [...p, cache[key]]);
        setActiveTab(cache[key].id);
      } else setActiveTab(cache[key].id);
      toast.success(`Switched to: ${needName}`);
      return;
    }
    setLoading(true); 
    setError(null);
    const toastId = toast.loading(`Researching prior art for: ${needName}...`);
    try {
      setLoadingStage("Researching prior art...");
      const priorArt = await geminiService.fetchPriorArt(needName);
      
      // Run prior art analysis in background (don't block need generation)
      geminiService.analyzePriorArt(needName, priorArt)
        .then(analyses => {
          if (analyses.length > 0) {
            DBService.savePriorArtAnalysis(needName, analyses);
            console.log(`Cached ${analyses.length} prior art analyses for: ${needName}`);
          }
        })
        .catch(err => console.warn('Prior art analysis failed:', err));
      
      toast.loading("Generating predictions from prior art...", { id: toastId });
      setLoadingStage("Generating predictions from prior art...");
      const parsed = await geminiService.generateNeed(needName, priorArt);
      setCache(p => ({ ...p, [key]: parsed }));
      setNeeds(p => [...p, parsed]);
      setActiveTab(parsed.id);
      setShowPriorArt(p => ({ ...p, [parsed.id]: false }));
      // Save to database
      await DBService.saveNeed(parsed);
      await DBService.saveSearchCache(needName, priorArt);
      toast.success(`Created: ${needName} with ${parsed.eras.find(e => e.name.includes('2025'))?.expressions?.length || 0} predictions`, { id: toastId });
    } catch (e: any) { 
      setError(e.message);
      toast.error(`Failed to create need: ${e.message}`, { id: toastId });
    } finally { 
      setLoading(false); 
      setLoadingStage(""); 
    }
  }, [cache, needs, geminiService]);

  const branchIndustry = async (expr: IndustryExpression, needId: string) => {
    const need = needs.find(n => n.id === needId);
    if (!need) return;
    console.log('Branching:', expr.id, 'in need:', needId);
    setBranchLoading(expr.id);
    const toastId = toast.loading(`Branching deeper into: ${expr.name}...`);
    try {
      // Save previous state for undo
      const previousNeed = needs.find(n => n.id === needId);
      
      const children = await geminiService.branchIndustry(expr);
      console.log('Generated children:', children.map(c => c.id));
      const updatedNeeds = needs.map(n => {
        if (n.id !== needId) return n;
        const updateChildren = (expressions: any[]): any[] => expressions.map(e => {
          if (e.id === expr.id) {
            console.log('Found target expression:', e.id, '- adding children');
            return { ...e, children: [...(e.children || []), ...children] };
          }
          if (e.children?.length) return { ...e, children: updateChildren(e.children) };
          return e;
        });
        return { 
          ...n, 
          eras: n.eras.map(era => 
            era.name.includes("2025") 
              ? { ...era, expressions: updateChildren(era.expressions as IndustryExpression[]) } 
              : era
          ) 
        };
      });
      
      const updatedNeed = updatedNeeds.find(n => n.id === needId);
      
      // Add to history
      addToHistory({
        type: 'branch',
        description: `Branch: ${expr.name}`,
        data: {
          needId,
          expressionId: expr.id,
          previousState: previousNeed,
          newState: updatedNeed,
        },
      });
      
      setNeeds(updatedNeeds);
      setExpandedBranches(p => ({ ...p, [expr.id]: true }));
      console.log('Branch complete - auto-expanded:', expr.id);
      // Save updated need to database
      if (updatedNeed) await DBService.updateNeed(updatedNeed);
      toast.success(`Added ${children.length} predictions to: ${expr.name}`, { id: toastId });
    } catch (e) { 
      console.error('Branch error:', e);
      setError("Failed to generate branches");
      toast.error(`Failed to branch: ${expr.name}`, { id: toastId });
    } finally { 
      setBranchLoading(null); 
    }
  };

  const fetchMechanism = async (expr: IndustryExpression) => {
    setMechanismLoading(true);
    const toastId = toast.loading(`Extracting mechanism from: ${expr.name}...`);
    try {
      // Check cache first
      const cached = await DBService.getMechanism(expr.id);
      if (cached) {
        setMechanism({ ...expr, details: cached.details });
        setSelected(expr);
        setMechanismLoading(false);
        toast.success(`Loaded mechanism: ${expr.name}`, { id: toastId });
        return;
      }
      const detailsArray = await geminiService.extractMechanism(expr);
      // Store the array of mechanism analyses
      setMechanism({ ...expr, details: detailsArray });
      setSelected(expr);
      // Save to database - store the first analysis as primary, but include all analyses
      const needId = activeNeed?.id || '';
      await DBService.saveMechanism(expr.id, expr.name, needId, detailsArray);
      toast.success(`Extracted mechanism with ${detailsArray.length} analyses: ${expr.name}`, { id: toastId });
    } catch (e) { 
      setError("Failed to extract mechanism");
      toast.error(`Failed to extract mechanism: ${expr.name}`, { id: toastId });
    } finally { 
      setMechanismLoading(false); 
    }
  };

  const fetchDeepDive = async (expr: IndustryExpression) => {
    setDeepDiveLoading(true);
    const toastId = toast.loading(`Analyzing business opportunity: ${expr.name}...`);
    try {
      // Check cache first
      const cached = await DBService.getDeepDive(expr.id);
      if (cached) {
        setDeepDive({ ...expr, details: cached.details });
        setSelected(expr);
        setDeepDiveLoading(false);
        toast.success(`Loaded deep dive: ${expr.name}`, { id: toastId });
        return;
      }
      const details = await geminiService.deepDive(expr);
      setDeepDive({ ...expr, details });
      setSelected(expr);
      // Save to database
      const needId = activeNeed?.id || '';
      await DBService.saveDeepDive(expr.id, expr.name, needId, details);
      toast.success(`Analyzed: ${expr.name}`, { id: toastId });
    } catch (e) { 
      setError("Failed to fetch deep dive");
      toast.error(`Failed to analyze: ${expr.name}`, { id: toastId });
    } finally { 
      setDeepDiveLoading(false); 
    }
  };

  const executeCrossPollinate = async () => {
    setCrossLoading(true);
    const toastId = toast.loading(`Cross-pollinating: ${crossPollinate.items[0].name} × ${crossPollinate.items[1].name}...`);
    try {
      // Check cache first
      const cached = await DBService.getCrossPollinate(crossPollinate.items[0].id, crossPollinate.items[1].id);
      if (cached) {
        setCrossPollinate(p => ({ ...p, result: cached.result }));
        setCrossLoading(false);
        toast.success("Loaded cross-pollination result", { id: toastId });
        return;
      }
      const result = await geminiService.crossPollinate(crossPollinate.items[0], crossPollinate.items[1]);
      setCrossPollinate(p => ({ ...p, result }));
      // Save to database
      await DBService.saveCrossPollinate(crossPollinate.items[0], crossPollinate.items[1], result);
      toast.success(`Generated ${result.length} hybrid prediction(s)`, { id: toastId });
    } catch (e) { 
      setError("Failed to cross-pollinate");
      toast.error("Failed to cross-pollinate", { id: toastId });
    } finally { 
      setCrossLoading(false); 
    }
  };

  const toggleCrossItem = (expr: IndustryExpression) => {
    setCrossPollinate(p => {
      const exists = p.items.find(i => i.id === expr.id);
      if (exists) return { ...p, items: p.items.filter(i => i.id !== expr.id), result: null };
      if (p.items.length >= 2) return p;
      const newItems = [...p.items, expr];
      // Auto-open modal when 2 items are selected
      return { ...p, items: newItems, result: null, open: newItems.length === 2 };
    });
  };

  const closeNeed = (id: string) => {
    // Close need (remove from workspace but keep in DB)
    const needToClose = needs.find(n => n.id === id);
    if (!needToClose) return;

    // Add to history for undo
    addToHistory({
      type: 'close_need',
      description: `Closed: ${needToClose.name}`,
      data: {
        needId: id,
        previousState: needToClose,
      },
    });

    // Remove from workspace
    setNeeds(p => p.filter(n => n.id !== id));
    
    // Switch active tab if closing the active need
    if (activeTab === id) {
      const remainingNeeds = needs.filter(n => n.id !== id);
      const currentIndex = needs.findIndex(n => n.id === id);
      const nextNeed = remainingNeeds[Math.min(currentIndex, remainingNeeds.length - 1)];
      setActiveTab(nextNeed?.id || null);
    }

    toast.success(`Closed: ${needToClose.name}`);
  };

  const removeNeed = async (id: string) => {
    setNeeds(p => p.filter(n => n.id !== id));
    if (activeTab === id) setActiveTab(needs.find(n => n.id !== id)?.id || null);
    // Delete from database
    await DBService.deleteNeed(id);
  };

  const clearAll = async () => {
    setNeeds([]);
    setActiveTab(null);
    setCache({});
    setShowPriorArt({});
    setExpandedBranches({});
    // Clear database
    await DBService.clearAllNeeds();
  };

  const addPrediction = async () => {
    if (!formData.name.trim()) return;
    const newExpr: IndustryExpression = {
      id: `expr-${Date.now()}`,
      name: formData.name,
      mutation: formData.mutation,
      insight: formData.insight,
      type: "future",
      inspirations: [],
      children: [],
      userAdded: true
    };

    let updatedNeeds: Need[];
    if (modal.parentId) {
      updatedNeeds = needs.map(n => {
        if (n.id !== modal.needId) return n;
        const addToParent = (expressions: any[]): any[] => expressions.map(e => {
          if (e.id === modal.parentId) return { ...e, children: [...(e.children || []), newExpr] };
          if (e.children?.length) return { ...e, children: addToParent(e.children) };
          return e;
        });
        return { 
          ...n, 
          eras: n.eras.map(era => 
            era.name.includes("2025") 
              ? { ...era, expressions: addToParent(era.expressions as IndustryExpression[]) } 
              : era
          ) 
        };
      });
      setNeeds(updatedNeeds);
      setExpandedBranches(p => ({ ...p, [modal.parentId!]: true }));
      toast.success(`Added child prediction: ${formData.name}`);
    } else {
      updatedNeeds = needs.map(n => 
        n.id === modal.needId 
          ? { 
              ...n, 
              eras: n.eras.map(era => 
                era.name.includes("2025") 
                  ? { ...era, expressions: [...(era.expressions as IndustryExpression[]), newExpr] } 
                  : era
              ) 
            } 
          : n
      );
      setNeeds(updatedNeeds);
      toast.success(`Added prediction: ${formData.name}`);
    }

    // Save updated need to database
    const updatedNeed = updatedNeeds.find(n => n.id === modal.needId);
    if (updatedNeed) await DBService.updateNeed(updatedNeed);

    setFormData({ name: "", mutation: "", insight: "" });
    setModal({ open: false, needId: null, parentId: null });
  };

  const addCrossPollinationResult = async (result: IndustryExpression, targetNeedId: string) => {
    // Create new expression with cross-pollination metadata
    const newExpr: IndustryExpression = {
      ...result,
      id: `cross-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      crossPollinated: true,
      sourceExpressions: crossPollinate.items.map(item => item.id)
    };

    // Add to target need's Post-AI era
    const updatedNeeds = needs.map(n => 
      n.id === targetNeedId
        ? {
            ...n,
            eras: n.eras.map(era =>
              era.name.includes("2025")
                ? { ...era, expressions: [...(era.expressions as IndustryExpression[]), newExpr] }
                : era
            )
          }
        : n
    );

    setNeeds(updatedNeeds);

    // Save updated need to database
    const updatedNeed = updatedNeeds.find(n => n.id === targetNeedId);
    if (updatedNeed) await DBService.updateNeed(updatedNeed);
  };

  const closeAllModals = () => {
    setModal({ open: false, needId: null, parentId: null });
    setSelected(null);
    setDeepDive(null);
    setMechanism(null);
    setCrossPollinate(p => ({ ...p, open: false }));
    setMechanismAISuggestions(null);
    setDeepDiveAISuggestions(null);
    setNeedAISuggestions(null);
  };

  // AI Assistant functions
  const requestMechanismAIAssist = async (mechanismId: string) => {
    setAILoading(true);
    try {
      const aiAssistant = getAIAssistant();
      const response = await aiAssistant.suggestMechanismActions(mechanismId);
      setMechanismAISuggestions(response);
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      setError(e.message);
    } finally {
      setAILoading(false);
    }
  };

  const requestDeepDiveAIAssist = async (deepDiveId: string) => {
    setAILoading(true);
    try {
      const aiAssistant = getAIAssistant();
      const response = await aiAssistant.suggestDeepDiveActions(deepDiveId);
      setDeepDiveAISuggestions(response);
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      setError(e.message);
    } finally {
      setAILoading(false);
    }
  };

  const requestNeedAIAssist = async (needId: string) => {
    setAILoading(true);
    try {
      const aiAssistant = getAIAssistant();
      const response = await aiAssistant.suggestNeedActions(needId);
      setNeedAISuggestions(response);
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      setError(e.message);
    } finally {
      setAILoading(false);
    }
  };

  const executeAIAction = async (suggestion: AIActionSuggestion) => {
    console.log("=== EXECUTING AI ACTION ===");
    console.log("Suggestion:", JSON.stringify(suggestion, null, 2));
    
    const toastId = toast.loading(`${suggestion.action}...`);
    
    try {
      switch (suggestion.actionType) {
        case 'create_need':
          console.log("Creating need with params:", suggestion.params);
          if (suggestion.params.title) {
            await fetchNeed(suggestion.params.title);
            toast.success(`Created need: ${suggestion.params.title}`, { id: toastId });
          } else if (suggestion.params.gap) {
            await fetchNeed(suggestion.params.gap);
            toast.success(`Created need from gap`, { id: toastId });
          } else {
            toast.error("No title or gap provided", { id: toastId });
          }
          break;
        
      case 'branch':
        // Find expression by ID and branch it automatically
        console.log("Branch action - searching for expression");
        
        // Try finding by expressionId first
        if (suggestion.params.expressionId && suggestion.params.needId) {
          const need = needs.find(n => n.id === suggestion.params.needId);
          if (need) {
            const expr = findExpressionById(need, suggestion.params.expressionId);
            if (expr) {
              console.log("Found expression by ID:", expr.name);
              await branchIndustry(expr, suggestion.params.needId);
              return;
            }
          }
        }
        
        // Fallback: find by predictionPath (name matching)
        if (suggestion.params.predictionPath && activeNeed) {
          // Extract prediction name from path (e.g., "Era > Security" -> "Security")
          const predictionName = suggestion.params.predictionPath.split('>').pop()?.trim();
          if (predictionName) {
            console.log("Searching for prediction by name:", predictionName);
              const expr = findExpressionByName(activeNeed, predictionName);
            if (expr) {
              console.log("Found expression by name:", expr.name);
              await branchIndustry(expr, activeNeed.id);
              toast.success(`Branched: ${expr.name}`, { id: toastId });
              return;
            } else {
              console.warn("Could not find expression with name:", predictionName);
              toast.error(`Could not find prediction: ${predictionName}`, { id: toastId });
            }
          }
        }
        
        console.warn("Branch action failed - could not find expression");
        toast.error("Could not find expression to branch", { id: toastId });
        break;      case 'extract':
        // Extract enablers/challenges into new needs
        console.log("Extract action:", suggestion.params);
        
        let itemsToExtract: string[] = [];
        
        // Handle different parameter formats
        if (suggestion.params.items && Array.isArray(suggestion.params.items)) {
          itemsToExtract = suggestion.params.items.filter((item: any) => typeof item === 'string');
        } else if (suggestion.params.enablers && Array.isArray(suggestion.params.enablers)) {
          itemsToExtract = suggestion.params.enablers;
        } else if (suggestion.params.challenges && Array.isArray(suggestion.params.challenges)) {
          itemsToExtract = suggestion.params.challenges;
        } else if (suggestion.params.title) {
          itemsToExtract = [suggestion.params.title];
        } else if (suggestion.params.gap) {
          itemsToExtract = [suggestion.params.gap];
        }
        
        console.log("Items to extract:", itemsToExtract);
        
        if (itemsToExtract.length === 0) {
          toast.error("No items to extract", { id: toastId });
          break;
        }
        
        for (const item of itemsToExtract) {
          if (item && typeof item === 'string' && item.length > 0) {
            console.log("Creating need from:", item);
            await fetchNeed(item);
          }
        }
        toast.success(`Extracted ${itemsToExtract.length} need(s)`, { id: toastId });
        break;
        
      case 'compare':
        // Open side-by-side comparison
        if (suggestion.params.expressionIds && Array.isArray(suggestion.params.expressionIds)) {
          const exprs = suggestion.params.expressionIds
            .map((id: string) => {
              for (const need of needs) {
                const expr = findExpressionById(need, id);
                if (expr) return expr;
              }
              return null;
            })
            .filter((expr): expr is IndustryExpression => expr !== null);
          
          if (exprs.length >= 2) {
            // Set up cross-pollinate for comparison
            setCrossPollinate({
              open: true,
              items: exprs.slice(0, 2),
              result: null
            });
            toast.success(`Opening comparison view`, { id: toastId });
          } else {
            toast.error(`Found only ${exprs.length} expression(s), need 2`, { id: toastId });
          }
        } else {
          toast.error("No expression IDs provided", { id: toastId });
        }
        break;
        
      case 'find_similar':
        // Search pattern library or related needs
        console.log("Find similar action:", suggestion.params);
        
        const searchTerm = suggestion.params.pattern || suggestion.params.gap || suggestion.params.query || '';
        
        if (searchTerm) {
          console.log("Searching for:", searchTerm);
          
          // Extract key terms from the search string
          const keywords = searchTerm.toLowerCase()
            .split(/[\s,]+/)
            .filter((word: string) => word.length > 3); // Filter out short words
          
          console.log("Keywords:", keywords);
          
          // Search in existing needs
          const relevantNeeds = needs.filter(n => 
            keywords.some((kw: string) => n.name.toLowerCase().includes(kw) || n.description.toLowerCase().includes(kw))
          );
          
          console.log("Found relevant needs:", relevantNeeds.map(n => n.name));
          
          if (relevantNeeds.length > 0 && relevantNeeds[0].id !== activeTab) {
            // Switch to most relevant need
            console.log("Switching to need:", relevantNeeds[0].name);
            setActiveTab(relevantNeeds[0].id);
            toast.success(`Found related need: ${relevantNeeds[0].name}`, { id: toastId });
          } else {
            // If no existing needs match, suggest creating one
            console.log("No matching needs found, creating new need");
            const newNeedName = searchTerm.split(/(?:related to|for|of|in)/i)[0].trim();
            if (newNeedName && newNeedName.length < 100) {
              await fetchNeed(newNeedName);
              toast.success(`Created new need: ${newNeedName}`, { id: toastId });
            } else {
              toast.error("Invalid search term for creating need", { id: toastId });
            }
          }
        } else {
          console.warn("Find similar action has no search term");
          toast.error("No search term provided", { id: toastId });
        }
        break;
        
      case 'analyze':
        // Trigger mechanism or deep dive analysis
        console.log("Analyze action:", suggestion.params);
        
        // Try finding by expressionId first
        if (suggestion.params.expressionId && suggestion.params.needId) {
          const need = needs.find(n => n.id === suggestion.params.needId);
          if (need) {
            const expr = findExpressionById(need, suggestion.params.expressionId);
            if (expr) {
              const analysisType = suggestion.params.analysisType || 'mechanism';
              if (analysisType === 'mechanism') {
                await fetchMechanism(expr);
              } else if (analysisType === 'deepdive') {
                await fetchDeepDive(expr);
              }
              return;
            }
          }
        }
        
        // Fallback: find by predictionPath (name matching)
        if (suggestion.params.predictionPath && activeNeed) {
          const predictionName = suggestion.params.predictionPath.split('>').pop()?.trim();
          if (predictionName) {
            console.log("Searching for prediction to analyze:", predictionName);
            const expr = findExpressionByName(activeNeed, predictionName);
            if (expr) {
              console.log("Found expression, triggering analysis:", expr.name);
              const analysisType = suggestion.params.analysisType || 'mechanism';
              if (analysisType === 'mechanism' || analysisType === 'deepdive') {
                if (analysisType === 'mechanism') {
                  await fetchMechanism(expr);
                } else {
                  await fetchDeepDive(expr);
                }
                toast.success(`Analyzed: ${expr.name}`, { id: toastId });
                return;
              }
            }
          }
        }
        
        console.warn("Analyze action failed - could not find expression");
        toast.error("Could not find expression to analyze", { id: toastId });
        break;
        
      case 'apply_pattern':
        // Apply pattern to current need
        if (suggestion.params.pattern && suggestion.params.targetNeedId) {
          // Generate new predictions based on pattern
          const patternName = suggestion.params.pattern;
          const targetNeed = needs.find(n => n.id === suggestion.params.targetNeedId);
          if (targetNeed) {
            // Create a user-added prediction with pattern application
            const newExpr: IndustryExpression = {
              id: `pattern-${Date.now()}`,
              name: `${patternName} applied to ${targetNeed.name}`,
              mutation: suggestion.params.mutation || `Applying ${patternName} pattern`,
              insight: suggestion.params.insight || suggestion.reasoning,
              type: "future",
              inspirations: [],
              children: [],
              userAdded: true
            };
            
            const updatedNeeds = needs.map(n => 
              n.id === targetNeed.id
                ? {
                    ...n,
                    eras: n.eras.map(era =>
                      era.name.includes("2025")
                        ? { ...era, expressions: [...(era.expressions as IndustryExpression[]), newExpr] }
                        : era
                    )
                  }
                : n
            );
            setNeeds(updatedNeeds);
            
            // Save to database
            const updatedNeed = updatedNeeds.find(n => n.id === targetNeed.id);
            if (updatedNeed) await DBService.updateNeed(updatedNeed);
            toast.success(`Applied pattern: ${patternName}`, { id: toastId });
          } else {
            toast.error("Target need not found", { id: toastId });
          }
        } else {
          toast.error("Missing pattern or target need", { id: toastId });
        }
        break;
        
      default:
        console.log("Action not yet implemented:", suggestion.actionType);
        toast.error(`Action not implemented: ${suggestion.actionType}`, { id: toastId });
    }
    } catch (error: any) {
      console.error("Failed to execute AI action:", error);
      setError(`Action failed: ${error.message}`);
      toast.error(`Action failed: ${error.message}`, { id: toastId });
      throw error;
    }
  };
  
  // Helper function to find expression by ID recursively
  const findExpressionById = (need: Need, expressionId: string): IndustryExpression | null => {
    for (const era of need.eras) {
      const expressions = era.expressions as IndustryExpression[];
      for (const expr of expressions) {
        if (expr.id === expressionId) return expr;
        if (expr.children?.length) {
          const found = findInChildren(expr.children, expressionId);
          if (found) return found;
        }
      }
    }
    return null;
  };
  
  // Helper function to find expression by name recursively
  const findExpressionByName = (need: Need, name: string): IndustryExpression | null => {
    const searchName = name.toLowerCase().trim();
    
    for (const era of need.eras) {
      const expressions = era.expressions as IndustryExpression[];
      for (const expr of expressions) {
        if (expr.name.toLowerCase().trim() === searchName) return expr;
        if (expr.children?.length) {
          const found = findInChildrenByName(expr.children, searchName);
          if (found) return found;
        }
      }
    }
    return null;
  };
  
  const findInChildren = (children: IndustryExpression[], expressionId: string): IndustryExpression | null => {
    for (const child of children) {
      if (child.id === expressionId) return child;
      if (child.children?.length) {
        const found = findInChildren(child.children, expressionId);
        if (found) return found;
      }
    }
    return null;
  };
  
  const findInChildrenByName = (children: IndustryExpression[], name: string): IndustryExpression | null => {
    for (const child of children) {
      if (child.name.toLowerCase().trim() === name) return child;
      if (child.children?.length) {
        const found = findInChildrenByName(child.children, name);
        if (found) return found;
      }
    }
    return null;
  };

  return {
    // State
    needs,
    activeTab,
    activeNeed,
    selected,
    deepDive,
    mechanism,
    crossPollinate,
    modal,
    formData,
    loading,
    loadingStage,
    branchLoading,
    mechanismLoading,
    deepDiveLoading,
    crossLoading,
    error,
    showPriorArt,
    expandedBranches,
    
    // AI Assistant state
    mechanismAISuggestions,
    deepDiveAISuggestions,
    needAISuggestions,
    aiLoading,
    
    // History state
    history,
    
    // Setters
    setActiveTab,
    setFormData,
    setError,
    setShowPriorArt,
    setExpandedBranches,
    setModal,
    setMechanism,
    setDeepDive,
    setCrossPollinate,
    setNeeds,
    
    // Actions
    fetchNeed,
    branchIndustry,
    fetchMechanism,
    fetchDeepDive,
    executeCrossPollinate,
    toggleCrossItem,
    closeNeed,
    removeNeed,
    clearAll,
    addPrediction,
    addCrossPollinationResult,
    closeAllModals,
    
    // History actions
    undo,
    redo,
    clearHistory,
    
    // AI Assistant actions
    requestMechanismAIAssist,
    requestDeepDiveAIAssist,
    requestNeedAIAssist,
    executeAIAction,
  };
};
