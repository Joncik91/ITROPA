import { Users, Zap, Brain, Heart, Shield, Leaf, Sparkles, TrendingUp, Lightbulb } from "lucide-react";
import type { SuggestedNeed } from "../types";

export const iconMap = { 
  Users, 
  Zap, 
  Brain, 
  Heart, 
  Shield, 
  Leaf, 
  Sparkles, 
  TrendingUp, 
  Lightbulb 
};

export const getIcon = (iconName: string) => iconMap[iconName as keyof typeof iconMap] || Sparkles;

export const SUGGESTED_NEEDS: SuggestedNeed[] = [
  { name: "Belonging", icon: "Users" },
  { name: "Status", icon: "Zap" },
  { name: "Mastery", icon: "Brain" },
  { name: "Security", icon: "Shield" },
  { name: "Love", icon: "Heart" },
  { name: "Sustainability", icon: "Leaf" },
];

export const KEYBOARD_SHORTCUTS = [
  ["←/→", "Switch needs"],
  ["Ctrl/⌘ + Z", "Undo"],
  ["Ctrl/⌘ + Y, Ctrl/⌘ + ⇧ + Z", "Redo"],
  ["Esc", "Close dialogs"],
  ["?", "Toggle shortcuts"],
  ["Enter", "Research need (in search box)"],
  ["Right-click a card", "More actions"],
];
