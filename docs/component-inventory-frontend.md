# Frontend Component Inventory

## Overview

ITROPA features **24 React components** built with TypeScript, organized by function and responsibility. All components use the unified design system with Tailwind CSS, Framer Motion animations, and Lucide React icons.

---

## Component Catalog

### View Components (5 components)

Main page views that display different aspects of the application.

#### 1. **HomePage**
- **Location**: `src/components/HomePage.tsx`
- **Purpose**: Landing page and main entry point
- **Features**:
  - Welcome message and introduction
  - Quick start instructions
  - Featured needs carousel
  - Call-to-action buttons
- **Props**: Navigation callbacks
- **Used in**: App root

#### 2. **LibraryView**
- **Location**: `src/components/LibraryView.tsx`
- **Purpose**: Browse and search industries
- **Features**:
  - Grid layout of all industries
  - Search and filter functionality
  - Category grouping
  - Industry cards with metadata
- **Props**: Industry data, selection handlers
- **Used in**: Main app view

#### 3. **NeedView**
- **Location**: `src/components/NeedView.tsx`
- **Purpose**: Display human needs and related industries
- **Features**:
  - Need description
  - Industry tree specific to need
  - AI-generated predictions
  - Related needs navigation
- **Props**: Selected need, needs data
- **Used in**: Main app view

#### 4. **PatternsView**
- **Location**: `src/components/PatternsView.tsx`
- **Purpose**: Pattern analysis and insights
- **Features**:
  - Pattern list with analytics
  - Frequency and distribution metrics
  - Transfer potential scores
  - Pattern comparison tools
- **Props**: Pattern data, analysis results
- **Used in**: Modal or sidebar

#### 5. **ChainAnalyticsView**
- **Location**: `src/components/ChainAnalyticsView.tsx`
- **Purpose**: Inspiration chain visualization
- **Features**:
  - Chain lineage display
  - Influence mapping visualization
  - Divergence pattern analysis
  - Innovation velocity metrics
  - Coherence assessment
- **Props**: Chain data, analytics data
- **Used in**: Deep dive analysis

### Modal Dialog Components (6 components)

Dialog components for specific operations and information display.

#### 6. **Sheet** (`src/components/ui/Sheet.tsx`)
- Responsive dialog: bottom sheet on phones, centered dialog from `md`.
- Escape closes; focus moves in, is trapped and restored; background scroll locks.
- Props: isOpen, onClose, title, description, icon, footer, size.

#### 7. **AddPredictionModalContent**
- **Location**: `src/components/modals/AddPredictionModalContent.tsx`
- **Purpose**: Form for adding new industry predictions
- **Features**:
  - Text input for prediction
  - Category selector
  - Confidence rating slider
  - Submit/cancel buttons
- **Props**: onSubmit, onCancel
- **Validation**: Required fields check

#### 8. **CrossPollinateModalContent**
- **Location**: `src/components/modals/CrossPollinateModalContent.tsx`
- **Purpose**: Industry combination strategies
- **Features**:
  - Industry pair selector
  - 5 strategy selection (Additive, Substitution, etc.)
  - Results display with synergy scores
  - Novelty rating
- **Props**: Industries data, onSelect
- **AI Integration**: Calls gemini.service for combinations

#### 9. **DeepDiveModalContent**
- **Location**: `src/components/modals/DeepDiveModalContent.tsx`
- **Purpose**: Deep market analysis
- **Features**:
  - Competitive landscape mapping
  - Gap analysis results
  - Evolution pattern recognition
  - Innovation opportunity assessment
  - Strategic positioning recommendations
- **Props**: Industry data, analysis results
- **AI Integration**: Multi-framework analysis

#### 10. **MechanismModalContent**
- **Location**: `src/components/modals/MechanismModalContent.tsx`
- **Purpose**: Mechanism extraction and analysis
- **Features**:
  - Functional decomposition display
  - Structural analysis charts
  - Causal chain mapping visualization
  - Constraint-opportunity analysis
  - Scale-context transfer analysis
  - Transfer potential scoring
  - Historical applications
  - Untapped domain recommendations
- **Props**: Mechanism data, industry context
- **AI Integration**: Multi-framework extraction

#### 11. **KeyboardShortcutsModalContent**
- **Location**: `src/components/modals/KeyboardShortcutsModalContent.tsx`
- **Purpose**: Display keyboard shortcuts
- **Features**:
  - Organized shortcut list
  - Platform-specific (Ctrl vs Cmd)
  - Search/filter shortcuts
- **Props**: onClose
- **Used in**: Help menu

### Workspace panels (`src/components/sidebars/`)

On `lg` and up these are static columns; below `lg` they open as bottom sheets from the
canvas toolbar.

- **ResearchForm**: need name and optional meaning, each with a hint; suggested needs.
- **OpenNeeds**: open needs as a list (desktop) or horizontal strip (phone).
- **NeedTools**: fit filter, card density, cross-pollination status, export, prior art summary, tree map.
- **AssistantPanel**: next-step suggestions and the undo history.
- **CenterPanel**: the canvas and the cross-pollination bar.

### Styling Approach

See [ui-design.md](./ui-design.md): color tokens as CSS variables exposed to Tailwind
(`paper`, `sheet`, `well`, `line`, `ink`, `ink-2`, `accent`, `pollen`, `ok`, `warn`, `bad`),
Schibsted Grotesk, mobile-first layout, and the rule that every input and selection explains
itself before the user commits.

### Animation Library

**Framework**: Framer Motion 11.0.0

Common animations:
- Fade in/out transitions
- Slide animations for modals/sidebars
- Expand/collapse for tree nodes
- Hover effects on interactive elements
- Page transitions between views

Example usage:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### Icon Library

**Framework**: Lucide React 0.344.0

Used for:
- Navigation icons (chevrons, arrows)
- Action icons (plus, delete, edit)
- Status indicators (checkmark, warning)
- Category icons
- UI controls (menu, close, settings)

Example:
```tsx
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

<Plus className="w-4 h-4" />
```

---

## State Management

### Hook-Based Architecture

Components use custom React hooks for state:

**Main Orchestration Hook**:
- `useNeedManager` - Coordinates all state and operations

**Specialized Hooks**:
- `useNeedState` - Core state (needs, industries, selections)
- `useAIAssistant` - AI operations and responses
- `useCrossPollination` - Cross-pollination logic
- `usePatterns` - Pattern analysis state
- `useHistory` - Action history
- `useKeyboardShortcuts` - Keyboard event handling

### Data Flow

```
Component Props
    ↓
Custom Hooks (useNeedManager)
    ↓
Services (API Client, Gemini, Database)
    ↓
External APIs / IndexedDB
    ↓
State Update
    ↓
Component Re-render
```

---

## Component Categories Summary

| Category | Count | Purpose |
|----------|-------|---------|
| View Components | 5 | Main page views |
| Modals | 6 | Dialog operations |
| Sidebars | 4 | Layout panels |
| Display | 5 | Data visualization |
| Interaction | 3 | User interactions |
| **Total** | **23** | **+ 1 wrapper (ModalContent)** |

---

## Common Props Pattern

Most components follow this pattern:

```tsx
interface ComponentProps {
  // Data
  data?: SomeDataType;

  // Callbacks
  onSelect?: (item: Item) => void;
  onClose?: () => void;
  onSubmit?: (data: any) => void;

  // State
  isLoading?: boolean;
  error?: string;

  // UI Customization
  className?: string;
  variant?: 'default' | 'compact' | 'large';
}
```

---

## Accessibility Features

Components implement:
- Semantic HTML (buttons, headers, lists)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance
- Screen reader friendly content

---

## Performance Optimizations

- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Lazy loading for modals
- Image optimization with Lucide icons
- CSS-in-JS with Tailwind (no bloat)

---

## Testing Approach

Components are designed for testability:
- Props-driven behavior
- Clear separation of concerns
- Pure component functions
- Minimal side effects
- Hook dependencies isolated

---

## Browser Support

All components support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

Components use CSS Grid, Flexbox, and CSS Variables for layouts.
