/**
 * Keyboard shortcuts reference.
 */

import { KEYBOARD_SHORTCUTS } from "../../config/constants";

export type KeyboardShortcutsModalContentProps = Record<string, never>;

export const KeyboardShortcutsModalContent = () => (
  <dl className="divide-y divide-line">
    {KEYBOARD_SHORTCUTS.map(([k, d]) => (
      <div key={k} className="flex items-center justify-between gap-4 py-2.5">
        <dt>
          <kbd className="px-2 py-1 rounded-control bg-well border border-line text-sm font-medium whitespace-nowrap">{k}</kbd>
        </dt>
        <dd className="text-sm text-ink-2 text-right">{d}</dd>
      </div>
    ))}
  </dl>
);
