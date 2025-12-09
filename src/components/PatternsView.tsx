import { motion } from "framer-motion";
import { Loader2, Layers, ArrowRight } from "lucide-react";
import { usePatterns } from "../hooks/usePatterns";

interface PatternsViewProps {
  theme: any;
  dark: boolean;
  onLoadNeed: (need: any) => void;
}

export const PatternsView = ({ theme, dark, onLoadNeed }: PatternsViewProps) => {
  const { patterns, loading } = usePatterns();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className={`w-8 h-8 ${theme.accent} animate-spin`} />
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="text-center py-16">
        <Layers className={`w-12 h-12 ${theme.muted} mx-auto mb-4 opacity-50`} />
        <p className={`${theme.muted} mb-2`}>No patterns found</p>
        <p className={`text-xs ${theme.muted} max-w-md mx-auto`}>
          Extract mechanisms from industries to see recurring patterns across different needs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Pattern Library</h2>
        <p className={`text-sm ${theme.muted}`}>
          Recurring mechanisms and abstract patterns discovered across {patterns.reduce((sum, p) => sum + p.mechanisms.length, 0)} industries
        </p>
      </div>

      <div className="space-y-4">
        {patterns.map((patternGroup, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl ${theme.card} border ${theme.border} overflow-hidden`}
          >
            <div className={`p-4 ${dark ? "bg-indigo-500/5" : "bg-indigo-50/50"} border-b ${theme.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className={`w-4 h-4 ${theme.accent}`} />
                    <h3 className="font-bold text-sm">Abstract Pattern</h3>
                  </div>
                  <p className={`text-sm ${theme.text}`}>{patternGroup.pattern}</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"} text-xs font-medium`}>
                  {patternGroup.mechanisms.length} {patternGroup.mechanisms.length === 1 ? "instance" : "instances"}
                </div>
              </div>
            </div>

            <div className="p-4">
              <p className={`text-xs font-medium ${theme.muted} mb-3`}>Found in:</p>
              <div className="space-y-2">
                {patternGroup.mechanisms.map((mech, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${theme.itemBg} border ${theme.border} ${theme.hover} cursor-pointer transition-all`}
                    onClick={() => onLoadNeed({ id: mech.needId, name: mech.needName })}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{mech.expressionName}</span>
                          {mech.needName && (
                            <>
                              <ArrowRight className={`w-3 h-3 ${theme.muted}`} />
                              <span className={`text-xs ${theme.accent}`}>
                                {mech.needName}
                              </span>
                            </>
                          )}
                        </div>
                        <p className={`text-xs ${theme.muted}`}>{mech.coreMechanism}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
