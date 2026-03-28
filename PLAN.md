# Plan: Kanban Board - Full Next.js React Component Refactor

## Context

The project is a Kanban board (~55% assignment-ready) that needs: column renaming (To Do/In Progress/Done), mock API with 1.5s delay + 20% random failure, optimistic update + rollback, tests, and production cleanup. The 1424-line `src/main.ts` vanilla JS monolith will be **fully rewritten as proper React/Next.js components** with hooks, state, and proper component architecture.

---

## Step 1: Delete Legacy/Cleanup Files

Remove:
- `dist/`, `vite.config.ts`, `src/vite-env.d.ts`, `src/typescript.svg`, `public/vite.svg`
- `ASSIGNMENT_SUBMISSION_ANALYSIS.md`, `notes.md`
- `src/main.ts` (will be replaced entirely)
- `app/boardMarkup.ts` (will be replaced by React components)
- `app/KanbanClient.tsx` (will be replaced by proper page component)

Update `.gitignore` to include `.next/` and `dist/`.

## Step 2: Install Test Infrastructure

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`. Add `test`, `test:watch` scripts to `package.json`.

## Step 3: Create `src/types/index.ts` - TypeScript Interfaces

- `ColumnId`: `'todo' | 'in-progress' | 'done'`
- `Task`, `Column`, `Project`, `KanbanData`, `MoveTaskParams`
- `NotificationType`, `ThemeMode`

## Step 4: Create `src/api/mockApi.ts` + Tests

- `persistTaskMove(params)`: Promise, 1500ms delay, 20% random rejection with `MockApiError`
- Pure module, zero dependencies
- `src/api/mockApi.test.ts`: Test delay, failure, error messages

## Step 5: Create `src/hooks/useKanbanBoard.ts` - Core State Hook

Custom React hook managing all board state with `useState`:
- `data: KanbanData` (columns, projects, archivedTasks)
- `loadData()`, `saveData()` (localStorage persistence)
- `getDefaultData()` with new column IDs (todo, in-progress, done)
- Data migration from old column IDs in `loadData()`
- `addTask()`, `removeTask()`, `archiveTask()`, `restoreTask()`, `deleteArchivedTask()`
- `addProject()`, `deleteProject()`, `toggleProjectStar()`
- `updateTaskStatus()`
- `moveTaskOptimistic(taskId, from, to)` - the key method:
  1. Update state immediately (optimistic)
  2. Call `persistTaskMove()`
  3. On failure: rollback state + trigger error notification
  4. Return loading state for UI feedback
- `resetData()`, `exportData()`

Extract pure data helpers for testing:
- `moveTaskInData(data, taskId, from, to) -> boolean`
- `rollbackTaskInData(data, task, from, fromIndex, to) -> void`

## Step 6: Create `src/hooks/useNotifications.ts`

- `notifications` state array
- `showNotification(message, type)` - adds notification with auto-dismiss
- `removeNotification(id)`
- Notifications render as toast stack in top-right

## Step 7: Create `src/hooks/useTheme.ts`

- Theme state (dark/light) persisted in localStorage
- `toggleTheme()`
- Applies `data-theme` attribute to document root

## Step 8: Create React Components

```
src/components/
├── Board.tsx              # Main board: renders 3 columns + header
├── Column.tsx             # Single column with title, count, task list
├── TaskCard.tsx           # Individual task card with status, assignee, project
├── Sidebar.tsx            # Project list, navigation, archive link (desktop)
├── MobileSidebar.tsx      # Mobile slide-out sidebar
├── AddTaskModal.tsx       # Modal form to create new task
├── AddProjectModal.tsx    # Modal form to create new project
├── ArchiveModal.tsx       # Modal showing archived tasks with restore/delete
├── StatusMenu.tsx         # Dropdown for setting task status
├── Notification.tsx       # Toast notification component
├── ConfirmDialog.tsx      # Reusable confirm/alert dialog
└── ThemeToggle.tsx        # Theme toggle button
```

**Board.tsx**: The main component. Uses `useKanbanBoard()` hook. Renders 3 `Column` components with `DndContext` or keeps SortableJS integration. Passes drag handlers that call `moveTaskOptimistic()`.

**Column.tsx**: Renders column header (title + count) and list of `TaskCard` components. Container for SortableJS drop zone.

**TaskCard.tsx**: Displays task title, assignee avatar, project badge, status badge, time, archive button. No approval button (removed).

**Drag-and-drop approach**: Keep SortableJS (already a dependency). Wrap column containers with `useRef` + `useEffect` to initialize Sortable. The `onEnd` callback calls `moveTaskOptimistic()` from the hook.

**Rollback DOM fixup**: Since React controls rendering, on rollback we just update state and React re-renders the columns correctly. No manual DOM manipulation needed - this is much cleaner than the vanilla JS approach.

## Step 9: Update `app/page.tsx` - Main Page

Replace current minimal page with full React component tree:

```tsx
'use client';
import { Board } from '@/components/Board';

export default function Home() {
  return <Board />;
}
```

Or keep `app/layout.tsx` as-is and make `page.tsx` render the full client-side `Board` component.

## Step 10: Update `app/layout.tsx`

- Remove `dangerouslySetInnerHTML` pattern
- Keep metadata, CSS imports
- Clean layout wrapping the page

## Step 11: Create `src/kanbanBoard.test.ts`

Tests for pure data helpers extracted from the hook:
- `moveTaskInData()` correctly moves task
- `rollbackTaskInData()` restores original position
- Edge cases

## Step 12: Update `src/styles.css`

- Remove styles that are now handled by React component classes
- Keep: SortableJS ghost/chosen/drag classes, DaisyUI theme, custom scrollbar, animations, light theme overrides, modal base styles (if not fully replaced by React components)

## Step 13: Update README.md

Assignment-focused with:
- Requirements mapping table
- Architecture: optimistic update + rollback flow
- Tech stack: Next.js 15, React 19, TypeScript, Tailwind CSS 4, SortableJS, Vitest
- Getting started, project structure, design decisions

## Step 14: Final Verification

- `npm run build` passes
- `npm run lint` passes
- `npm run test` passes
- `npm run dev` - manual test of drag-drop + optimistic update + rollback

---

## Final File Structure

```
rutics-board-frontend/
├── app/
│   ├── layout.tsx               # Root layout with metadata + CSS imports
│   └── page.tsx                 # Renders Board component
├── src/
│   ├── types/
│   │   └── index.ts             # All TypeScript interfaces
│   ├── api/
│   │   ├── mockApi.ts           # Mock API: 1.5s delay + 20% failure
│   │   └── mockApi.test.ts      # Tests
│   ├── hooks/
│   │   ├── useKanbanBoard.ts    # Board state + optimistic move logic
│   │   ├── useNotifications.ts  # Toast notification state
│   │   └── useTheme.ts          # Dark/light theme toggle
│   ├── components/
│   │   ├── Board.tsx            # Main board layout
│   │   ├── Column.tsx           # Single kanban column
│   │   ├── TaskCard.tsx         # Task card
│   │   ├── Sidebar.tsx          # Desktop sidebar
│   │   ├── MobileSidebar.tsx    # Mobile sidebar
│   │   ├── AddTaskModal.tsx     # New task modal
│   │   ├── AddProjectModal.tsx  # New project modal
│   │   ├── ArchiveModal.tsx     # Archive modal
│   │   ├── StatusMenu.tsx       # Status dropdown
│   │   ├── Notification.tsx     # Toast component
│   │   ├── ConfirmDialog.tsx    # Confirm/alert dialog
│   │   └── ThemeToggle.tsx      # Theme toggle button
│   ├── lib/
│   │   └── kanbanData.ts        # Pure data helpers (moveTaskInData, etc.) + tests
│   ├── styles.css               # Global CSS
│   └── kanbanBoard.test.ts      # Tests for data helpers
├── public/
├── vitest.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── .gitignore
└── README.md
```

## Key Design Decisions

1. **React state for rollback**: When the mock API fails, we simply revert the React state. React re-renders the columns correctly. No manual DOM fixup needed.
2. **SortableJS retained**: Already works well. Initialized via `useRef` + `useEffect` in `Column.tsx`. The `onEnd` callback calls `moveTaskOptimistic()` from the hook.
3. **Pure data helpers in `src/lib/kanbanData.ts`**: Extracted from the hook for easy unit testing without React overhead.
4. **No approval workflow**: Removed entirely. "Done" column is a terminal state, not a review state.
5. **Data migration**: `loadData()` in the hook migrates old `up-next`/`in-review` column IDs from localStorage.