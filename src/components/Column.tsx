'use client';

import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import type { Column as ColumnType, Task } from '@/types';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  movingTaskIds: Set<string>;
  onMoveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  onStatusClick: (taskId: string, rect: DOMRect) => void;
  onArchive: (taskId: string) => void;
}

export default function Column({
  column,
  tasks,
  movingTaskIds,
  onMoveTask,
  onStatusClick,
  onArchive,
}: ColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (!listRef.current) return;

    sortableRef.current = new Sortable(listRef.current, {
      group: 'kanban-tasks',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        const taskId = evt.item.getAttribute('data-task-id');
        const fromColumnId = evt.from.getAttribute('data-kanban-column');
        const toColumnId = evt.to.getAttribute('data-kanban-column');

        if (!taskId || !fromColumnId || !toColumnId) return;

        // CRITICAL: Revert SortableJS's DOM move before React re-renders.
        // SortableJS physically moved evt.item into evt.to. If we let React
        // reconcile while the DOM is in SortableJS's modified state, React
        // will fail trying to removeChild a node that's no longer where it
        // expects it to be. We put the node back so React's virtual DOM matches
        // the real DOM at the point React takes control again.
        if (fromColumnId !== toColumnId) {
          // Remove from destination (where SortableJS placed it)
          if (evt.item.parentNode === evt.to) {
            evt.to.removeChild(evt.item);
          }
          // Re-insert into source at original index
          const siblings = evt.from.children;
          const refNode = siblings[evt.oldIndex!] ?? null;
          evt.from.insertBefore(evt.item, refNode);

          // Now hand off to React state — React re-render will produce correct DOM
          onMoveTask(taskId, fromColumnId, toColumnId);
        } else {
          // Same-column reorder: revert to original position, React controls order
          const siblings = evt.from.children;
          const refNode = siblings[evt.oldIndex!] ?? null;
          if (evt.item !== refNode) {
            evt.from.insertBefore(evt.item, refNode);
          }
          // No state change needed for same-column reorder (not implemented)
        }
      },
    });

    return () => {
      sortableRef.current?.destroy();
    };
  }, [onMoveTask]);

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task list */}
      <div
        ref={listRef}
        data-kanban-column={column.id}
        className="kanban-column custom-scrollbar space-y-2 min-h-[100px] rounded-lg bg-card/70 border border-border p-2"
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isMoving={movingTaskIds.has(task.id)}
            onStatusClick={onStatusClick}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
  );
}
