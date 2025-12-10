/**
 * Modal content components - re-exported from modals/ directory for backwards compatibility.
 * Each modal type is now in its own file following Single Responsibility Principle.
 *
 * @see ./modals/ for individual modal component implementations
 */

export {
  MechanismModalContent,
  DeepDiveModalContent,
  CrossPollinateModalContent,
  AddPredictionModalContent,
  KeyboardShortcutsModalContent
} from './modals';

export type {
  MechanismModalContentProps,
  DeepDiveModalContentProps,
  CrossPollinateModalContentProps,
  AddPredictionModalContentProps,
  KeyboardShortcutsModalContentProps
} from './modals';
