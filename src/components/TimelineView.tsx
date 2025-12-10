import { motion } from "framer-motion";
import type { Need, IndustryExpression } from "../types";
import type { Theme } from "../config/theme";

interface TimelineViewProps {
  need: Need;
  theme: Theme;
  dark: boolean;
}

export const TimelineView = ({ need, theme, dark }: TimelineViewProps) => {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${dark ? "bg-gradient-to-b from-gray-700 via-gray-500/50 to-gray-500" : "bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600"}`} />
      
      {/* Eras */}
      <div className="space-y-8">
        {need.eras.map((era, index) => {
          const isFuture = era.name.includes("2025");
          const expressions = era.expressions;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-20"
            >
              {/* Era Marker */}
              <div className="absolute left-0 top-0 flex items-center gap-3">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                  isFuture 
                    ? "bg-gray-500/20 border-gray-500" 
                    : dark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
                }`}>
                  <span className={`text-xs font-bold ${isFuture ? "text-gray-300" : theme.muted}`}>
                    {index + 1}
                  </span>
                </div>
              </div>

              {/* Era Content */}
              <div className={`p-4 rounded-xl ${isFuture ? (dark ? "bg-gray-500/10 border border-gray-500/30" : "bg-gray-50 border border-gray-200") : theme.itemBg}`}>
                <h3 className={`text-sm font-bold mb-3 ${isFuture ? theme.accent : theme.muted}`}>
                  {era.name}
                </h3>
                
                {isFuture ? (
                  // Future expressions with full details
                  <div className="space-y-3">
                    {(expressions as IndustryExpression[]).map((expr, i) => (
                      <motion.div
                        key={expr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index * 0.1) + (i * 0.05) }}
                        className={`p-3 rounded-lg ${dark ? "bg-gray-800/50" : "bg-white"} border ${theme.border}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 w-2 h-2 rounded-full ${theme.accent} bg-gray-500`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{expr.name}</p>
                            <p className={`text-xs ${theme.muted} mt-1`}>
                              <span className="font-medium">Mutation:</span> {expr.mutation}
                            </p>
                            <p className="text-xs mt-1.5">{expr.insight}</p>
                            
                            {expr.inspirations && expr.inspirations.length > 0 && (
                              <div className={`mt-2 pt-2 border-t ${theme.border}`}>
                                <p className={`text-xs font-medium ${theme.muted} mb-1`}>Inspired by:</p>
                                <div className="space-y-1">
                                  {expr.inspirations.map((insp, j) => (
                                    <div key={j} className="text-xs flex items-start gap-1">
                                      <span className={theme.accent}>→</span>
                                      <span>
                                        <span className="font-medium">{insp.source}</span>
                                        {insp.twist && <span className={theme.muted}> • {insp.twist}</span>}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {expr.crossPollinated && (
                              <div className={`mt-2 px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700"}`}>
                                <span>🔀</span> Cross-pollinated
                              </div>
                            )}

                            {expr.children && expr.children.length > 0 && (
                              <div className={`mt-2 pl-3 border-l-2 ${theme.border} space-y-2`}>
                                {expr.children.map(child => (
                                  <div key={child.id} className={`text-xs p-2 rounded ${theme.itemBgAlt}`}>
                                    <p className="font-medium">{child.name}</p>
                                    <p className={theme.muted}>{child.mutation}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Historical expressions as simple list
                  <div className="flex flex-wrap gap-2">
                    {(expressions as string[]).map((expr, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index * 0.1) + (i * 0.02) }}
                        className={`text-xs px-3 py-1.5 rounded-lg ${dark ? "bg-gray-700/50" : "bg-gray-200"}`}
                      >
                        {expr}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
