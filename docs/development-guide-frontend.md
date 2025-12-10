# Frontend Development Guide

## Prerequisites

Before starting development, ensure you have the following installed:

### Required Software

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (included with Node.js)
- **Git**: For version control

### Optional Tools

- **Visual Studio Code**: Recommended editor
- **TypeScript**: Installed via npm (included in project)
- **Vite DevTools**: Browser extension for debugging

### Verify Installation

```bash
node --version      # Should show v18.0.0 or higher
npm --version       # Should show 9.0.0 or higher
git --version       # Should show 2.x.x or higher
```

---

## Project Setup

### 1. Clone/Navigate to Project

```bash
cd C:\Users\Jonci\Desktop\Apps\industry-family-tree
```

### 2. Install Dependencies

```bash
npm install
```

This command:
- Reads `package.json`
- Downloads all dependencies to `node_modules/`
- Creates `package-lock.json` for version consistency
- Typically takes 2-5 minutes on first install

**Troubleshooting**:
- If install fails, try clearing npm cache: `npm cache clean --force`
- On Windows, you may need to run as Administrator
- Check Node.js version compatibility

### 3. Environment Configuration

ITROPA requires the Gemini API key for AI features.

#### Option A: Local Development (No API Key Required for Backend)

1. Copy the example file:
```bash
cp .env.example .env
```

2. Open `.env` in your editor:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

3. Get your API key:
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key
   - Paste into `.env` file

4. Save the file

**Important**: The `.env` file is local-only. Don't commit it to Git.

#### Option B: Using Backend API (Vercel)

For production or testing with the backend:
- API key is stored on Vercel as environment variable
- Frontend doesn't need `.env` for API calls
- Backend handles all Gemini API requests

---

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

**What this does**:
- Starts Vite development server
- Watches for file changes
- Hot Module Replacement (HMR) - instant reload
- Accessible at: http://localhost:5173

**Output**:
```
  VITE v7.2.7  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

### Accessing the App

1. Open browser to: http://localhost:5173
2. App loads with hot reload enabled
3. Changes to code files auto-refresh browser

### Stopping the Server

Press `Ctrl+C` in the terminal

---

## Project Structure for Development

### Key Directories

```
src/
├── components/          # UI components (edit here most)
├── hooks/              # Custom React hooks
├── services/           # Business logic
├── config/             # Configuration
├── types.ts            # TypeScript types
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

### Common Development Tasks

#### Adding a New Component

1. Create file in `src/components/MyComponent.tsx`:
```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="p-4">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
}
```

2. Export from components barrel:
```tsx
// In src/components/index.ts (if exists)
export { MyComponent } from './MyComponent';
```

3. Import and use in other components:
```tsx
import { MyComponent } from './MyComponent';

export function ParentComponent() {
  return <MyComponent title="Example" />;
}
```

#### Adding a Custom Hook

1. Create file in `src/hooks/useMyHook.ts`:
```tsx
import { useState, useCallback } from 'react';

export function useMyHook() {
  const [state, setState] = useState(null);

  const updateState = useCallback((value) => {
    setState(value);
  }, []);

  return { state, updateState };
}
```

2. Use in components:
```tsx
import { useMyHook } from '../hooks/useMyHook';

export function MyComponent() {
  const { state, updateState } = useMyHook();
  // ...
}
```

#### Adding a Service

1. Create file in `src/services/myService.ts`:
```tsx
class MyService {
  async fetchData(id: string) {
    // Implementation
  }
}

export const myService = new MyService();
```

2. Use in components or hooks:
```tsx
import { myService } from '../services/myService';

export function MyComponent() {
  const handleClick = async () => {
    const data = await myService.fetchData('123');
  };
}
```

---

## Code Standards

### TypeScript

All code uses TypeScript for type safety:

```tsx
// Good - types explicit
interface UserData {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserData> {
  // ...
}

// Avoid - implicit any
function getUser(id) {  // id is 'any'
  // ...
}
```

### React Best Practices

```tsx
// Good - functional component with hooks
export function MyComponent({ items }: Props) {
  const [selected, setSelected] = useState<string>('');

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// Avoid - class components in new code
class MyComponent extends React.Component {
  // Older pattern
}
```

### Styling with Tailwind

```tsx
// Good - Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// Avoid - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  {/* Harder to maintain */}
</div>
```

### File Naming

- Components: PascalCase (`HomePage.tsx`, `UserCard.tsx`)
- Hooks: camelCase, prefix with `use` (`useUserData.ts`, `useModal.ts`)
- Services: camelCase (`apiClient.ts`, `database.ts`)
- Utils: camelCase (`stringHelpers.ts`, `dateUtils.ts`)
- Types: PascalCase interfaces/types (`UserData.ts`, `ApiResponse.ts`)

---

## Building for Production

### Build Command

```bash
npm run build
```

**What this does**:
- Compiles TypeScript to JavaScript
- Minifies and optimizes code
- Processes Tailwind CSS
- Creates `dist/` folder with production build
- Optimizes bundle size

**Output**:
```
dist/
├── index.html
├── assets/
│   ├── main-xyz123.js
│   └── style-abc456.css
└── ...
```

### Preview Build Locally

```bash
npm run preview
```

Serves the production build locally for testing before deployment.

---

## Hot Module Replacement (HMR)

Vite provides instant feedback without full page reload:

### How HMR Works

1. You save a file in `src/`
2. Vite detects the change
3. Browser automatically updates
4. Component state may be preserved

### HMR Limitations

- Changing component props structure may require refresh
- Changing hook dependencies may require refresh
- Some state management changes may require refresh
- Hard refresh with `Ctrl+Shift+R` if issues arise

---

## Debugging

### Browser DevTools

1. Open DevTools: `F12` or `Ctrl+Shift+I`
2. Navigate to "Sources" tab
3. Breakpoints can be set on TypeScript source files (in `src/`)
4. Console shows runtime errors

### Console Logging

```tsx
// Helpful debugging
console.log('Component rendered', props);
console.error('Error occurred:', error);
console.warn('Warning:', message);
console.table(arrayData);  // Pretty-print arrays/objects
```

### React DevTools Extension

Install "React Developer Tools" browser extension:
- Inspect component tree
- View component props and state
- Trigger state updates manually
- Profile component performance

### Vite Debugging

Enable debug logging:
```bash
DEBUG=vite:* npm run dev
```

---

## Troubleshooting

### Port Already in Use

If http://localhost:5173 shows "Connection refused":

```bash
# On Windows, find and kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors

```
Error: Cannot find module 'react'
```

Solution:
```bash
npm install
```

### TypeScript Errors

```
Type 'string' is not assignable to type 'number'
```

Solution:
- Check type annotations in `types.ts`
- Fix function parameter/return types
- Use `as` casting if intentional: `value as number`

### HMR Not Working

1. Refresh browser manually: `Ctrl+F5`
2. Stop dev server: `Ctrl+C`
3. Clear node_modules cache: `rm -rf node_modules/.vite`
4. Restart: `npm run dev`

### Build Errors

1. Check for TypeScript errors: `npx tsc --noEmit`
2. Clear dist folder: `rm -rf dist`
3. Rebuild: `npm run build`

---

## Environment Variables

### Available Variables

```bash
# .env file (local only)
GEMINI_API_KEY=your_api_key  # For local development
```

### Using Environment Variables

```tsx
// In component or service
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Note: Only variables prefixed with VITE_ are exposed to frontend
```

### For Production (Vercel)

See [deployment-guide.md](./deployment-guide.md) for setting Vercel environment variables.

---

## Performance Tips

### Code Splitting

Components are automatically code-split by Vite:
- Faster initial load
- Lazy loading of routes/features
- Smaller bundle per page

### Image Optimization

Use Lucide React icons instead of image files:
```tsx
import { Heart, Star, Settings } from 'lucide-react';

<Heart className="w-6 h-6" />  // Lightweight SVG
```

### Component Optimization

```tsx
// Memoize expensive components
import { memo } from 'react';

export const ExpensiveComponent = memo(function({ data }) {
  // Only re-renders if props change
  return <div>{data}</div>;
});

// Or use useCallback for callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm install` | Install dependencies |
| `npm update` | Update dependencies |
| `npx tsc --noEmit` | Check TypeScript errors |

---

## Useful Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **Lucide Icons**: https://lucide.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## Next Steps

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173 in your browser
3. Explore the codebase in `src/`
4. Make a small change and see HMR in action
5. Refer to [component-inventory-frontend.md](./component-inventory-frontend.md) to understand components
6. Read [source-tree-analysis.md](./source-tree-analysis.md) for deeper understanding

---

## Git Workflow (Optional)

```bash
# Create a feature branch
git checkout -b feature/new-feature

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

For deployment to production, see [deployment-guide.md](./deployment-guide.md).
