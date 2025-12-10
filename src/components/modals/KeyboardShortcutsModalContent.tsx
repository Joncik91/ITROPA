/**
 * Modal content for displaying keyboard shortcuts reference.
 */

import { KEYBOARD_SHORTCUTS } from "../../config/constants";
import type { Theme } from "../../config/theme";

export interface KeyboardShortcutsModalContentProps {
  theme: Theme;
}

export const KeyboardShortcutsModalContent = ({ theme }: KeyboardShortcutsModalContentProps) => (
  <div className="space-y-2 text-sm">
    {KEYBOARD_SHORTCUTS.map(([k, d]) => (
      <div key={k} className="flex justify-between">
        <kbd className={`px-2 py-0.5 rounded ${theme.itemBg} text-xs`}>{k}</kbd>
        <span className={theme.muted}>{d}</span>
      </div>
    ))}
  </div>
);
