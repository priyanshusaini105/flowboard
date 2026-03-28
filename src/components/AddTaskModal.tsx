'use client';

import { useState, useRef, useEffect } from 'react';
import type { Project } from '@/types';
import ConfirmDialog from './ConfirmDialog';

interface AddTaskModalProps {
  open: boolean;
  projects: Project[];
  activeProjectId?: string | null;
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

export default function AddTaskModal({
  open,
  projects,
  activeProjectId = null,
  onAdd,
  onClose,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [project, setProject] = useState('');
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

  useEffect(() => {
    const hasActiveProject = !!activeProjectId && projects.some((p) => p.id === activeProjectId);
    if (open && hasActiveProject) {
      setProject(activeProjectId as string);
      return;
    }

    if (!project || !projects.some((p) => p.id === project)) {
      setProject(projects[0]?.id || '');
    }
  }, [open, activeProjectId, projects, project]);

  const isProjectLocked = !!activeProjectId && projects.some((p) => p.id === activeProjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    const selectedProjectId =
      project || (activeProjectId && projects.some((p) => p.id === activeProjectId) ? activeProjectId : '') || projects[0]?.id || '';

    onAdd(column, {
      title: title.trim(),
      assignee: assignee.trim() || 'Unassigned',
      project: selectedProjectId,
      time: time.trim(),
      status: status || undefined,
      avatar: 'https://picsum.photos/20?' + Date.now(),
    });
    setTitle('');
    setAssignee('');
    setTime('');
    setStatus('');
    if (isProjectLocked && activeProjectId) {
      setProject(activeProjectId);
    }
    setError('');
    onClose();
  };

  const inputClass =
    'w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm text-muted-foreground mb-1';

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">New Task</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
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
                  disabled={isProjectLocked}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {isProjectLocked && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Task will be added to the currently open project.
                  </p>
                )}
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
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium"
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
