'use client';

import type { Task } from '@/types';
import { PROJECT_COLORS, STATUS_MAP } from '@/lib/kanbanData';

interface TaskCardProps {
  task: Task;
  isMoving?: boolean;
  onStatusClick: (taskId: string, rect: DOMRect) => void;
  onArchive: (taskId: string) => void;
}

export default function TaskCard({ task, isMoving, onStatusClick, onArchive }: TaskCardProps) {
  const projectColorClass = PROJECT_COLORS[task.projectColor] || 'bg-gray-700/40 text-gray-300';
  const statusInfo = task.status ? STATUS_MAP[task.status] : null;

  return (
    <article
      data-kanban-task="true"
      data-task-id={task.id}
      className={`task-card mx-2 rounded-lg border border-border bg-card p-3 shadow-sm hover:border-ring/40 fade-in-up ${
        isMoving ? 'opacity-60' : ''
      }`}
    >
      {/* Status row */}
      <div className="mb-2 flex items-center justify-between">
        {statusInfo ? (
          <button
            className={`inline-flex items-center gap-1 rounded border ${statusInfo.className} px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0`}
            onClick={(e) => onStatusClick(task.id, e.currentTarget.getBoundingClientRect())}
          >
            <i className={`${statusInfo.icon} text-xs`} />
            {statusInfo.text}
          </button>
        ) : (
          <button
            className="inline-flex items-center gap-1 rounded border bg-muted text-muted-foreground border-border px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:bg-accent transition-colors flex-shrink-0"
            onClick={(e) => onStatusClick(task.id, e.currentTarget.getBoundingClientRect())}
          >
            <i className="fas fa-plus text-xs" />
            Status
          </button>
        )}
        <button
          onClick={() => onArchive(task.id)}
          className="p-1 hover:bg-red-700/20 hover:text-red-400 rounded transition-all duration-200 flex-shrink-0"
          title="Archive task"
        >
          <i className="fas fa-archive text-muted-foreground hover:text-red-400 text-sm" />
        </button>
      </div>

      {/* Title */}
      <header className="flex items-start justify-between">
        <h3
          className="text-sm font-medium pr-2 break-words-force min-w-0 flex-1"
          title={task.title}
        >
          {task.title}
        </h3>
        {task.time && (
          <span className="text-[11px] text-muted-foreground flex-shrink-0">{task.time}</span>
        )}
      </header>

      {/* Footer */}
      <footer className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            className="h-5 w-5 rounded-full flex-shrink-0"
            src={task.avatar}
            alt={task.assignee}
          />
          <span
            className="task-assignee text-xs text-muted-foreground truncate"
            title={task.assignee}
          >
            {task.assignee}
          </span>
        </div>
        <span
          className={`task-project rounded ${projectColorClass} px-2 py-0.5 text-[11px] truncate max-w-24`}
          title={task.project}
        >
          {task.project}
        </span>
      </footer>
    </article>
  );
}
