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
  const projectColorClass = PROJECT_COLORS[task.projectColor] || 'rt:bg-gray-700/40 rt:text-gray-300';
  const statusInfo = task.status ? STATUS_MAP[task.status] : null;

  return (
    <article
      data-kanban-task="true"
      data-task-id={task.id}
      className={`task-card rt:mx-2 rt:rounded-lg rt:border rt:border-zinc-800 rt:bg-zinc-800/60 rt:p-3 rt:shadow-sm rt:hover:border-zinc-700 fade-in-up ${
        isMoving ? 'rt:opacity-60' : ''
      }`}
    >
      {/* Status row */}
      <div className="rt:mb-2 rt:flex rt:items-center rt:justify-between">
        {statusInfo ? (
          <button
            className={`rt:inline-flex rt:items-center rt:gap-1 rt:rounded rt:border ${statusInfo.className} rt:px-2 rt:py-0.5 rt:text-[10px] rt:font-medium rt:cursor-pointer rt:hover:opacity-80 rt:transition-opacity rt:flex-shrink-0`}
            onClick={(e) => onStatusClick(task.id, e.currentTarget.getBoundingClientRect())}
          >
            <i className={`${statusInfo.icon} rt:text-xs`} />
            {statusInfo.text}
          </button>
        ) : (
          <button
            className="rt:inline-flex rt:items-center rt:gap-1 rt:rounded rt:border rt:bg-zinc-800/60 rt:text-zinc-400 rt:border-zinc-700/60 rt:px-2 rt:py-0.5 rt:text-[10px] rt:font-medium rt:cursor-pointer rt:hover:bg-zinc-700/60 rt:transition-colors rt:flex-shrink-0"
            onClick={(e) => onStatusClick(task.id, e.currentTarget.getBoundingClientRect())}
          >
            <i className="fas fa-plus rt:text-xs" />
            Status
          </button>
        )}
        <button
          onClick={() => onArchive(task.id)}
          className="rt:p-1 rt:hover:bg-red-700/20 rt:hover:text-red-400 rt:rounded rt:transition-all rt:duration-200 rt:flex-shrink-0"
          title="Archive task"
        >
          <i className="fas fa-archive rt:text-zinc-500 rt:hover:text-red-400 rt:text-sm" />
        </button>
      </div>

      {/* Title */}
      <header className="rt:flex rt:items-start rt:justify-between">
        <h3
          className="rt:text-sm rt:font-medium rt:pr-2 break-words-force rt:min-w-0 rt:flex-1"
          title={task.title}
        >
          {task.title}
        </h3>
        {task.time && (
          <span className="rt:text-[11px] rt:text-zinc-400 rt:flex-shrink-0">{task.time}</span>
        )}
      </header>

      {/* Footer */}
      <footer className="rt:mt-2 rt:flex rt:items-center rt:justify-between">
        <div className="rt:flex rt:items-center rt:gap-2 rt:min-w-0 rt:flex-1">
          <img
            className="rt:h-5 rt:w-5 rt:rounded-full rt:flex-shrink-0"
            src={task.avatar}
            alt={task.assignee}
          />
          <span
            className="task-assignee rt:text-xs rt:text-zinc-300 rt:truncate"
            title={task.assignee}
          >
            {task.assignee}
          </span>
        </div>
        <span
          className={`task-project rt:rounded ${projectColorClass} rt:px-2 rt:py-0.5 rt:text-[11px] rt:truncate rt:max-w-24`}
          title={task.project}
        >
          {task.project}
        </span>
      </footer>
    </article>
  );
}
