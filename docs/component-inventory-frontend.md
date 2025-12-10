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

#### 6. **ModalWrapper**
- **Location**: `src/components/ModalWrapper.tsx`
- **Purpose**: Container for all modal dialogs
- **Features**:
  - Modal overlay management
  - Animation transitions
  - Close button handling
  - Keyboard escape support
- **Props**: isOpen, onClose, children
- **Children**: Modal content components

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

### Sidebar Components (4 components)

Layout panels for navigation and information.

#### 12. **LeftSidebar**
- **Location**: `src/components/sidebars/LeftSidebar.tsx`
- **Purpose**: Navigation and controls panel
- **Features**:
  - Needs list navigation
  - Industry search
  - Filter controls
  - Favorite/bookmark management
  - View mode toggles (list/grid)
- **Props**: Data, selection callbacks
- **State**: Active selections, search filters
- **Used in**: App layout

#### 13. **RightSidebar**
- **Location**: `src/components/sidebars/RightSidebar.tsx`
- **Purpose**: Details and metadata display
- **Features**:
  - Selected item details
  - Related items list
  - Export options
  - Metadata display
- **Props**: Selected data
- **Used in**: App layout

#### 14. **CenterPanel**
- **Location**: `src/components/sidebars/CenterPanel.tsx`
- **Purpose**: Main content area
- **Features**:
  - Current view container
  - Breadcrumb navigation
  - View switching logic
- **Props**: Current view, data
- **Used in**: App layout

#### 15. **HistoryPanel**
- **Location**: `src/components/HistoryPanel.tsx`
- **Purpose**: User action history
- **Features**:
  - Timeline of recent actions
  - Action revert capability
  - Search history
  - Clear history button
- **Props**: History items, onSelect
- **State**: History list from custom hook

### Display Components (5 components)

Data visualization and presentation components.

#### 16. **PriorArtDisplay**
- **Location**: `src/components/PriorArtDisplay.tsx`
- **Purpose**: Prior art and competitive intelligence
- **Features**:
  - Competitive landscape mapping
  - Market segments visualization
  - Leader profiles
  - Market dynamics analysis
  - Gap analysis results
  - Evolution pattern timeline
  - Innovation opportunity matrix
  - Strategic positioning recommendations
  - Actionable insights for entrepreneurs/investors
- **Props**: Industry data, analysis results
- **AI Integration**: 5-framework analysis

#### 17. **TimelineView**
- **Location**: `src/components/TimelineView.tsx`
- **Purpose**: Historical and predictive timeline
- **Features**:
  - Timeline visualization
  - Event markers
  - Date labels
  - Connective lines between events
  - Interactive event details
- **Props**: Timeline data
- **Animation**: Framer Motion transitions

#### 18. **IndustryBranch**
- **Location**: `src/components/IndustryBranch.tsx`
- **Purpose**: Industry hierarchy tree display
- **Features**:
  - Tree node rendering
  - Parent-child relationships
  - Collapsible branches
  - Expand/collapse animations
  - Selection highlighting
- **Props**: Branch data, onSelect
- **Animation**: Smooth expand/collapse

#### 19. **Breadcrumb**
- **Location**: `src/components/Breadcrumb.tsx`
- **Purpose**: Navigation path indicator
- **Features**:
  - Current location display
  - Clickable path segments
  - Separator icons
- **Props**: Path items, onNavigate
- **Used in**: CenterPanel

#### 20. **MiniMap**
- **Location**: `src/components/MiniMap.tsx`
- **Purpose**: Overview map of current data
- **Features**:
  - Compact data visualization
  - Navigation helper
  - Zoom/pan overview
  - Highlighted current view
- **Props**: Data tree, viewPort
- **Used in**: App layout

### Interaction Components (3 components)

Components for user interactions and system feedback.

#### 21. **AIAssistant**
- **Location**: `src/components/AIAssistant.tsx`
- **Purpose**: AI chat interface
- **Features**:
  - Message input field
  - Chat history display
  - Typing indicators
  - Response streaming (if supported)
  - Quick action buttons
- **Props**: onQuery, assistantState
- **State**: Message history, loading state
- **AI Integration**: Calls ai-assistant.service

#### 22. **ContextMenu**
- **Location**: `src/components/ContextMenu.tsx`
- **Purpose**: Right-click context menu
- **Features**:
  - Dynamic menu items
  - Click handling
  - Mouse position tracking
  - Auto-close on selection
- **Props**: Items, onSelect, position
- **Interaction**: Right-click trigger

#### 23. **PasswordPrompt**
- **Location**: `src/components/PasswordPrompt.tsx`
- **Purpose**: Authentication in production
- **Features**:
  - Password input field
  - Submit button
  - Error messages
  - Submission handler
- **Props**: onSubmit, error
- **Security**: Client-side submission only
- **Used in**: App wrapper (production only)

#### 24. **ModalContent**
- **Location**: `src/components/ModalContent.tsx`
- **Purpose**: Base modal content wrapper
- **Features**:
  - Title display
  - Content container
  - Footer/action area
- **Props**: title, children, actions
- **Used in**: Other modal components

---

## Design System

### Styling Approach

All components follow a consistent design system:

**Framework**: Tailwind CSS 3.4.1
- Utility-first CSS
- Responsive design classes (sm, md, lg, xl)
- Custom color palette
- Spacing and sizing scale

**Colors**:
- Primary: Blue shades
- Secondary: Gray scale
- Status: Green (success), Red (error), Yellow (warning)
- Backgrounds: Light/dark themes

**Typography**:
- Font Stack: System fonts + Inclusive Sans (custom)
- Sizes: 12px to 48px scale
- Weights: Regular, Medium, Semibold, Bold

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
