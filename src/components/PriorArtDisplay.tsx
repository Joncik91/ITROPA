import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface PriorArtDisplayProps {
  priorArt: any;
  theme: any;
}

export const PriorArtDisplay = ({ priorArt, theme }: PriorArtDisplayProps) => (
  <motion.div 
    initial={{ opacity: 0, height: 0 }} 
    animate={{ opacity: 1, height: "auto" }} 
    exit={{ opacity: 0, height: 0 }} 
    className={`mb-4 p-4 rounded-lg ${theme.sectionBg} border`}
  >
    <h3 className={`text-sm font-medium mb-3 flex items-center gap-2`}>
      <BookOpen className={`w-4 h-4 ${theme.accent}`} />
      Prior Art Research
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div>
        <p className={`font-medium ${theme.muted} mb-2`}>Current Leaders</p>
        {priorArt.currentLeaders?.map((c: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
            <p className="font-medium">{c.name} <span className={theme.muted}>({c.domain})</span></p>
            <p className={theme.muted}>Mechanism: {c.mechanism}</p>
            <p className="text-amber-400/80">Limitation: {c.limitation}</p>
          </div>
        ))}
      </div>
      <div>
        <p className={`font-medium ${theme.muted} mb-2`}>Historical Precedents</p>
        {priorArt.historicalPrecedents?.map((h: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
            <p className="font-medium">{h.name} <span className={theme.muted}>({h.era})</span></p>
            <p className={theme.muted}>Mechanism: {h.mechanism}</p>
            <p className="text-emerald-400/80">Lesson: {h.lesson}</p>
          </div>
        ))}
      </div>
      <div>
        <p className={`font-medium ${theme.muted} mb-2`}>Adjacent Domains</p>
        {priorArt.adjacentDomains?.map((a: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
            <p className="font-medium">{a.name} <span className={theme.muted}>({a.originalDomain})</span></p>
            <p className={theme.muted}>Mechanism: {a.mechanism}</p>
            <p className="text-indigo-400/80">Transfer: {a.transferPotential}</p>
          </div>
        ))}
      </div>
      <div>
        <p className={`font-medium ${theme.muted} mb-2`}>Nature's Solutions</p>
        {priorArt.natureSolutions?.map((n: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
            <p className="font-medium">{n.name}</p>
            <p className={theme.muted}>Mechanism: {n.mechanism}</p>
            <p className="text-cyan-400/80">Biomimicry: {n.biomimicryPotential}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);
