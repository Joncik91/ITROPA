import { createContext, useContext } from 'react';

export type Step = 'field' | 'industries' | 'dig' | 'build';
/** Where the user is. No need and no insights flag means Home. */
export type Place = { need?: string; step: Step; industry?: string; insights?: boolean; pins?: boolean };

interface Nav { place: Place; go: (next: Place) => void }

export const NavContext = createContext<Nav | null>(null);
export const useNav = (): Nav | null => useContext(NavContext);
