/**
 * What each action on a predicted industry does. Shared by the inline buttons (desktop
 * tooltips), the mobile action sheet and the context menu, so the explanation a user reads
 * before acting is the same everywhere.
 */
export type IndustryActionId = "branch" | "mechanism" | "deepDive" | "apps" | "cross" | "addChild" | "delete";

export interface IndustryActionInfo {
  label: string;
  description: string;
  /** Calls the AI unless a saved result exists. */
  ai: boolean;
}

export const INDUSTRY_ACTIONS: Record<IndustryActionId, IndustryActionInfo> = {
  branch: {
    label: "Branch",
    description: "Generate 3 more specific industries that grow out of this one and add them underneath.",
    ai: true,
  },
  mechanism: {
    label: "Mechanism",
    description: "Break down how it works through five lenses: function, structure, cause and effect, constraints, and how it transfers to other scales.",
    ai: true,
  },
  deepDive: {
    label: "Deep dive",
    description: "Size the market, map competitors, barriers and timing, tailored to your builder profile. The result also scores how well it fits you.",
    ai: true,
  },
  apps: {
    label: "App ideas",
    description: "Turn this industry into products you could build, sized to your builder profile: stack, MVP scope and pricing.",
    ai: true,
  },
  cross: {
    label: "Cross-pollinate",
    description: "Pick two industries to combine into hybrids. Select this one, then a second; or drag one card onto another.",
    ai: false,
  },
  addChild: {
    label: "Add your own",
    description: "Write a sub-industry by hand under this one.",
    ai: false,
  },
  delete: {
    label: "Delete",
    description: "Remove this industry and everything under it. Undo is available from History.",
    ai: false,
  },
};
