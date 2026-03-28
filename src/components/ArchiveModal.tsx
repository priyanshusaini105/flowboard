'use client';

import { useState } from 'react';
import type { Task } from '@/types';
import { STATUS_MAP } from '@/lib/kanbanData';

interface ArchiveModalProps {
  open: boolean;
  archivedTasks: Task[];
  onRestore: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

export default function ArchiveModal({
  open,
  archivedTasks,
  onRestore,
  onDelete,
  onClose,
}: ArchiveModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content rt:max-w-2xl">
        <div className="rt:flex rt:items-center rt:justify-between rt:mb-4">
          <h2 className="rt:text-lg rt:font-semibold rt:text-zinc-100">Archived Tasks</h2>
          <button
            onClick={onClose}
            className="rt:p-1 rt:hover:bg-zinc-700 rt:rounded rt:text-zinc-400 rt:hover:text-zinc-200"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {archivedTasks.length === 0 ? (
          <div className="rt:text-center rt:py-8 rt:text-zinc-400">
            <i className="fas fa-archive rt:text-4xl rt:mb-4 rt:opacity-50" />
            <p>No archived tasks</p>
          </div>
        ) : (
          <div className="rt:space-y-3 rt:max-h-[60vh] rt:overflow-y-auto">
            {archivedTasks.map((task) => {
              const statusInfo = task.status ? STATUS_MAP[task.status] : null;
              const archivedDate = task.archivedAt
                ? new Date(task.archivedAt).toLocaleDateString()
                : '';

              return (
                <div
                  key={task.id}
                  className="rt:bg-zinc-800/60 rt:border rt:border-zinc-700 rt:rounded-lg rt:p-4"
                >
                  <div className="rt:flex rt:justify-between rt:items-start rt:mb-2">
                    <div className="rt:flex-1">
                      <h3 className="rt:font-medium rt:text-zinc-100 rt:mb-1">{task.title}</h3>
                      {statusInfo && (
                        <span
                          className={`rt:inline-flex rt:items-center rt:gap-1 rt:rounded rt:border rt:px-2 rt:py-0.5 rt:text-[10px] rt:font-medium ${statusInfo.className}`}
                        >
                          <i className={statusInfo.icon} /> {statusInfo.text}
                        </span>
                      )}
                    </div>
                    <div className="rt:flex rt:gap-2 rt:ml-4">
                      <button
                        onClick={() => onRestore(task.id)}
                        className="rt:px-2 rt:py-1 rt:text-xs rt:bg-blue-600 rt:hover:bg-blue-700 rt:text-white rt:rounded rt:transition-colors"
                      >
                        Restore
                      </button>
                      {confirmDeleteId === task.id ? (
                        <div className="rt:flex rt:gap-1">
                          <button
                            onClick={() => {
                              onDelete(task.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rt:px-2 rt:py-1 rt:text-xs rt:bg-red-600 rt:hover:bg-red-700 rt:text-white rt:rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rt:px-2 rt:py-1 rt:text-xs rt:bg-zinc-700 rt:hover:bg-zinc-600 rt:text-white rt:rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(task.id)}
                          className="rt:px-2 rt:py-1 rt:text-xs rt:bg-red-600 rt:hover:bg-red-700 rt:text-white rt:rounded rt:transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="rt:flex rt:justify-between rt:items-center rt:text-xs rt:text-zinc-400">
                    <div className="rt:flex rt:items-center rt:gap-4">
                      <span>
                        <i className="fas fa-user" /> {task.assignee}
                      </span>
                      <span>
                        <i className="fas fa-folder" /> {task.project}
                      </span>
                      {task.time && (
                        <span>
                          <i className="fas fa-clock" /> {task.time}
                        </span>
                      )}
                    </div>
                    {archivedDate && <span>Archived {archivedDate}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
