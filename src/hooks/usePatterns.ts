import { useState, useEffect } from "react";
import { DBService, DBMechanism } from "../services/db.service";

interface PatternGroup {
  pattern: string;
  mechanisms: Array<{
    id: string;
    expressionName: string;
    needId: string;
    needName?: string;
    coreMechanism: string;
  }>;
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
        const pattern = mech.details?.abstractPattern || "Uncategorized";
        
        if (!patternMap.has(pattern)) {
          patternMap.set(pattern, []);
        }

        patternMap.get(pattern)!.push({
          id: mech.id,
          expressionName: mech.expressionName,
          needId: mech.needId,
          needName: needMap.get(mech.needId),
          coreMechanism: mech.details?.coreMechanism || ""
        });
      });

      // Convert to array and sort by number of mechanisms
      const groupedPatterns: PatternGroup[] = Array.from(patternMap.entries())
        .map(([pattern, mechanisms]) => ({ pattern, mechanisms }))
        .sort((a, b) => b.mechanisms.length - a.mechanisms.length);

      setPatterns(groupedPatterns);
    } catch (e) {
      console.error("Failed to load patterns:", e);
    } finally {
      setLoading(false);
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
