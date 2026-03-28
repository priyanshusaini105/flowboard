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
      <div className="modal-content max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Archived Tasks</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-200"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {archivedTasks.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <i className="fas fa-archive text-4xl mb-4 opacity-50" />
            <p>No archived tasks</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {archivedTasks.map((task) => {
              const statusInfo = task.status ? STATUS_MAP[task.status] : null;
              const archivedDate = task.archivedAt
                ? new Date(task.archivedAt).toLocaleDateString()
                : '';

              return (
                <div
                  key={task.id}
                  className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-100 mb-1">{task.title}</h3>
                      {statusInfo && (
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${statusInfo.className}`}
                        >
                          <i className={statusInfo.icon} /> {statusInfo.text}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onRestore(task.id)}
                        className="px-2 py-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
                      >
                        Restore
                      </button>
                      {confirmDeleteId === task.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              onDelete(task.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(task.id)}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <div className="flex items-center gap-4">
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
