'use client';

import { useState, useRef, useEffect } from 'react';

interface AddProjectModalProps {
  open: boolean;
  onAdd: (name: string, color: string) => boolean;
  onClose: () => void;
}

const COLORS = [
  { value: 'blue', label: 'Blue' },
  { value: 'fuchsia', label: 'Fuchsia' },
  { value: 'purple', label: 'Purple' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'violet', label: 'Violet' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' },
];

export default function AddProjectModal({ open, onAdd, onClose }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }
    const success = onAdd(name.trim(), color);
    if (!success) {
      setError('A project with this name already exists');
      return;
    }
    setName('');
    setColor('blue');
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="rt:flex rt:items-center rt:justify-between rt:mb-4">
          <h2 className="rt:text-lg rt:font-semibold rt:text-zinc-100">New Project</h2>
          <button onClick={onClose} className="rt:text-zinc-400 rt:hover:text-zinc-200">
            <i className="fas fa-times" />
          </button>
        </div>

        {error && (
          <div className="rt:mb-3 rt:p-2 rt:bg-red-900/30 rt:border rt:border-red-800/50 rt:rounded-md rt:text-sm rt:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rt:space-y-3">
            <div>
              <label className="rt:block rt:text-sm rt:text-zinc-300 rt:mb-1">Project Name *</label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rt:w-full rt:px-3 rt:py-2 rt:bg-zinc-800 rt:border rt:border-zinc-700 rt:rounded-md rt:text-sm rt:text-zinc-100 rt:focus:outline-none rt:focus:border-blue-500"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="rt:block rt:text-sm rt:text-zinc-300 rt:mb-1">Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rt:w-full rt:px-3 rt:py-2 rt:bg-zinc-800 rt:border rt:border-zinc-700 rt:rounded-md rt:text-sm rt:text-zinc-100 rt:focus:outline-none rt:focus:border-blue-500"
              >
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rt:flex rt:justify-end rt:gap-2 rt:mt-4">
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
