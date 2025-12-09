import { useState, useEffect } from "react";
import { DBService, DBMechanism } from "../services/db.service";
import { getGeminiService } from "../services/gemini.service";
import toast from 'react-hot-toast';

interface PatternGroup {
  pattern: string;
  mechanisms: Array<{
    id: string;
    expressionName: string;
    needId: string;
    needName?: string;
    coreMechanism: string;
  }>;
  analyses?: any[]; // Array of PatternAnalysis objects from AI
  loading?: boolean;
}

export const usePatterns = () => {
  const [patterns, setPatterns] = useState<PatternGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      // Get all mechanisms from database
      const allMechanisms = await DBService.getAllMechanisms();
      
      // Get all needs to map needId to needName
      const allNeeds = await DBService.getAllNeeds();
      const needMap = new Map(allNeeds.map(n => [n.id, n.name]));

      // Group mechanisms by abstract pattern
      const patternMap = new Map<string, PatternGroup["mechanisms"]>();

      allMechanisms.forEach((mech: DBMechanism) => {
        // Handle both old single-object format and new array format
        const details = Array.isArray(mech.details) ? mech.details[0] : mech.details;
        const pattern = details?.abstractPattern || "Uncategorized";
        
        if (!patternMap.has(pattern)) {
          patternMap.set(pattern, []);
        }

        patternMap.get(pattern)!.push({
          id: mech.id,
          expressionName: mech.expressionName,
          needId: mech.needId,
          needName: needMap.get(mech.needId),
          coreMechanism: details?.coreMechanism || ""
        });
      });

      // Convert to array and sort by number of mechanisms
      const groupedPatterns: PatternGroup[] = Array.from(patternMap.entries())
        .map(([pattern, mechanisms]) => ({ pattern, mechanisms }))
        .filter(group => group.mechanisms.length >= 2) // Only show patterns with 2+ instances
        .sort((a, b) => b.mechanisms.length - a.mechanisms.length);

      setPatterns(groupedPatterns);
      
      // Trigger AI analysis for each pattern group asynchronously
      groupedPatterns.forEach(group => analyzePattern(group.pattern, group.mechanisms));
      
    } catch (e) {
      console.error("Failed to load patterns:", e);
    } finally {
      setLoading(false);
    }
  };

  const analyzePattern = async (patternName: string, mechanisms: PatternGroup["mechanisms"]) => {
    try {
      // Check cache first
      const cached = await DBService.getPatternAnalysis(patternName);
      if (cached && cached.mechanismCount === mechanisms.length) {
        // Update state with cached analyses
        setPatterns(prev => prev.map(p => 
          p.pattern === patternName 
            ? { ...p, analyses: cached.analyses, loading: false }
            : p
        ));
        return;
      }

      // Mark as loading
      setPatterns(prev => prev.map(p => 
        p.pattern === patternName ? { ...p, loading: true } : p
      ));

      // Call AI analysis
      const geminiService = getGeminiService();
      const mechanismsForAI = mechanisms.map(m => ({
        expressionName: m.expressionName,
        needName: m.needName || 'Unknown',
        coreMechanism: m.coreMechanism
      }));

      const analyses = await geminiService.analyzePatterns(patternName, mechanismsForAI);
      
      // Save to cache
      await DBService.savePatternAnalysis(patternName, analyses, mechanisms.length);
      
      // Update state with analyses
      setPatterns(prev => prev.map(p => 
        p.pattern === patternName 
          ? { ...p, analyses, loading: false }
          : p
      ));

      toast.success(`Analyzed pattern: ${patternName}`);
    } catch (error) {
      console.error(`Failed to analyze pattern ${patternName}:`, error);
      setPatterns(prev => prev.map(p => 
        p.pattern === patternName ? { ...p, loading: false } : p
      ));
      toast.error(`Failed to analyze pattern: ${patternName}`);
    }
  };

  const refreshPatterns = () => {
    loadPatterns();
  };

  return {
    patterns,
    loading,
    refreshPatterns
  };
};
