'use client';

import type { Project } from '@/types';

interface MobileSidebarProps {
  projects: Project[];
  onToggleStar: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAddTask: () => void;
  onOpenAddProject: () => void;
  onOpenArchive: () => void;
  onClose: () => void;
}

export default function MobileSidebar({
  projects,
  onToggleStar,
  onDeleteProject,
  onOpenAddTask,
  onOpenAddProject,
  onOpenArchive,
  onClose,
}: MobileSidebarProps) {
  const sorted = [...projects].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sidebar */}
      <aside className="relative w-72 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-lg font-bold text-zinc-100">Flowboard</h1>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-md">
            <i className="fas fa-times text-zinc-400" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-3 flex gap-2">
          <button
            onClick={() => { onOpenAddTask(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md"
          >
            <i className="fas fa-plus" />
            Task
          </button>
          <button
            onClick={() => { onOpenAddProject(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm py-2 rounded-md"
          >
            <i className="fas fa-plus" />
            Project
          </button>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto px-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2">
            Projects
          </h2>
          <ul className="space-y-1">
            {sorted.map((project) => (
              <li key={project.id}>
                <div className="project-item group flex items-center justify-between px-2 py-2 rounded-md hover:bg-zinc-800 text-zinc-300">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {project.starred && <i className="fas fa-star text-amber-400 text-xs flex-shrink-0" />}
                    <span className="project-name truncate text-sm">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      className="p-1 hover:bg-zinc-700 rounded"
                      onClick={() => onToggleStar(project.id)}
                    >
                      <i className={`fas fa-star text-xs ${project.starred ? 'text-amber-400' : 'text-zinc-500'}`} />
                    </button>
                    <button
                      className="p-1 hover:bg-red-600 rounded"
                      onClick={() => onDeleteProject(project.id)}
                    >
                      <i className="fas fa-trash text-xs text-zinc-500" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={() => { onOpenArchive(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md"
          >
            <i className="fas fa-archive" />
            Archive
          </button>
        </div>
      </aside>
    </div>
  );
}
