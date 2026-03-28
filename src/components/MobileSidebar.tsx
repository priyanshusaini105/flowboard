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
    <div className="rt:fixed rt:inset-0 rt:z-[100] rt:flex">
      {/* Overlay */}
      <div className="rt:absolute rt:inset-0 rt:bg-black/50" onClick={onClose} />

      {/* Sidebar */}
      <aside className="rt:relative rt:w-72 rt:h-full rt:bg-zinc-950 rt:border-r rt:border-zinc-800 rt:flex rt:flex-col rt:transform rt:transition-transform rt:duration-300">
        {/* Header */}
        <div className="rt:p-4 rt:border-b rt:border-zinc-800 rt:flex rt:items-center rt:justify-between">
          <h1 className="rt:text-lg rt:font-bold rt:text-zinc-100">Rutics Board</h1>
          <button onClick={onClose} className="rt:p-2 rt:hover:bg-zinc-800 rt:rounded-md">
            <i className="fas fa-times rt:text-zinc-400" />
          </button>
        </div>

        {/* Actions */}
        <div className="rt:p-3 rt:flex rt:gap-2">
          <button
            onClick={() => { onOpenAddTask(); onClose(); }}
            className="rt:flex-1 rt:flex rt:items-center rt:justify-center rt:gap-1 rt:bg-blue-600 rt:hover:bg-blue-700 rt:text-white rt:text-sm rt:py-2 rt:rounded-md"
          >
            <i className="fas fa-plus" />
            Task
          </button>
          <button
            onClick={() => { onOpenAddProject(); onClose(); }}
            className="rt:flex-1 rt:flex rt:items-center rt:justify-center rt:gap-1 rt:bg-zinc-700 rt:hover:bg-zinc-600 rt:text-white rt:text-sm rt:py-2 rt:rounded-md"
          >
            <i className="fas fa-plus" />
            Project
          </button>
        </div>

        {/* Projects */}
        <div className="rt:flex-1 rt:overflow-y-auto rt:px-3">
          <h2 className="rt:text-xs rt:font-semibold rt:text-zinc-500 rt:uppercase rt:tracking-wider rt:px-2 rt:mb-2">
            Projects
          </h2>
          <ul className="rt:space-y-1">
            {sorted.map((project) => (
              <li key={project.id}>
                <div className="project-item rt:group rt:flex rt:items-center rt:justify-between rt:px-2 rt:py-2 rt:rounded-md rt:hover:bg-zinc-800 rt:text-zinc-300">
                  <div className="rt:flex rt:items-center rt:gap-2 rt:min-w-0 rt:flex-1">
                    {project.starred && <i className="fas fa-star rt:text-amber-400 rt:text-xs rt:flex-shrink-0" />}
                    <span className="project-name rt:truncate rt:text-sm">{project.name}</span>
                  </div>
                  <div className="rt:flex rt:items-center rt:gap-1 rt:opacity-0 rt:group-hover:opacity-100 rt:transition-opacity rt:flex-shrink-0">
                    <button
                      className="rt:p-1 rt:hover:bg-zinc-700 rt:rounded"
                      onClick={() => onToggleStar(project.id)}
                    >
                      <i className={`fas fa-star rt:text-xs ${project.starred ? 'rt:text-amber-400' : 'rt:text-zinc-500'}`} />
                    </button>
                    <button
                      className="rt:p-1 rt:hover:bg-red-600 rt:rounded"
                      onClick={() => onDeleteProject(project.id)}
                    >
                      <i className="fas fa-trash rt:text-xs rt:text-zinc-500" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="rt:p-3 rt:border-t rt:border-zinc-800">
          <button
            onClick={() => { onOpenArchive(); onClose(); }}
            className="rt:w-full rt:flex rt:items-center rt:gap-2 rt:px-3 rt:py-2 rt:text-sm rt:text-zinc-400 rt:hover:text-zinc-200 rt:hover:bg-zinc-800 rt:rounded-md"
          >
            <i className="fas fa-archive" />
            Archive
          </button>
        </div>
      </aside>
    </div>
  );
}
