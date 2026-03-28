'use client';

import { useState, useRef, useEffect } from 'react';
import type { Project } from '@/types';
import ConfirmDialog from './ConfirmDialog';

interface AddTaskModalProps {
  open: boolean;
  projects: Project[];
  onAdd: (
    columnId: string,
    taskData: {
      title: string;
      assignee: string;
      project: string;
      time: string;
      status?: string;
      avatar: string;
    }
  ) => void;
  onClose: () => void;
}

export default function AddTaskModal({ open, projects, onAdd, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [project, setProject] = useState(projects[0]?.id || '');
  const [time, setTime] = useState('');
  const [column, setColumn] = useState('todo');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    onAdd(column, {
      title: title.trim(),
      assignee: assignee.trim() || 'Unassigned',
      project,
      time: time.trim(),
      status: status || undefined,
      avatar: 'https://picsum.photos/20?' + Date.now(),
    });
    setTitle('');
    setAssignee('');
    setTime('');
    setStatus('');
    setError('');
    onClose();
  };

  const inputClass =
    'rt:w-full rt:px-3 rt:py-2 rt:bg-zinc-800 rt:border rt:border-zinc-700 rt:rounded-md rt:text-sm rt:text-zinc-100 rt:focus:outline-none rt:focus:border-blue-500';
  const labelClass = 'rt:block rt:text-sm rt:text-zinc-300 rt:mb-1';

  return (
    <>
      <ConfirmDialog
        open={!!error}
        title="Missing title"
        description={error}
        onConfirm={() => setError('')}
        onCancel={() => setError('')}
      />
      {open && (
        <div
          className="modal-overlay show"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="modal-content">
            <div className="rt:flex rt:items-center rt:justify-between rt:mb-4">
              <h2 className="rt:text-lg rt:font-semibold rt:text-zinc-100">New Task</h2>
              <button onClick={onClose} className="rt:text-zinc-400 rt:hover:text-zinc-200">
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="rt:space-y-3">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className={labelClass}>Assignee</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className={inputClass}
                  placeholder="Enter assignee name"
                />
              </div>
              <div>
                <label className={labelClass}>Project</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className={inputClass}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Time Estimate</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 5h"
                />
              </div>
              <div>
                <label className={labelClass}>Column</label>
                <select
                  value={column}
                  onChange={(e) => setColumn(e.target.value)}
                  className={inputClass}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No Status</option>
                  <option value="blocked">Blocked</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="rt:flex rt:justify-end rt:gap-2 rt:pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rt:px-4 rt:py-2 rt:text-sm rt:text-zinc-300 rt:hover:bg-zinc-800 rt:rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rt:px-4 rt:py-2 rt:text-sm rt:bg-blue-600 rt:text-white rt:hover:bg-blue-700 rt:rounded-md rt:font-medium"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
