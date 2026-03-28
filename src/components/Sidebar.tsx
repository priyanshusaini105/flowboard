'use client';

import type { Project } from '@/types';

interface SidebarProps {
  projects: Project[];
  onToggleStar: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAddTask: () => void;
  onOpenAddProject: () => void;
  onOpenArchive: () => void;
  onExport: () => void;
}

export default function Sidebar({
  projects,
  onToggleStar,
  onDeleteProject,
  onOpenAddTask,
  onOpenAddProject,
  onOpenArchive,
  onExport,
}: SidebarProps) {
  const sorted = [...projects].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return 0;
  });

  return (
    <aside className="rt:w-64 rt:h-screen rt:border-r rt:border-zinc-800 rt:bg-zinc-950 rt:flex rt:flex-col rt:flex-shrink-0 rt:overflow-hidden">
      {/* Logo area */}
      <div className="rt:p-4 rt:border-b rt:border-zinc-800">
        <div className="rt:flex rt:items-center rt:gap-2">
          <i className="fas fa-columns rt:text-blue-400" />
          <h1 className="rt:text-lg rt:font-bold rt:text-zinc-100">Rutics Board</h1>
        </div>
      </div>

      {/* Action buttons */}
      <div className="rt:p-3 rt:border-b rt:border-zinc-800 rt:flex rt:flex-col rt:gap-2">
        <button
          onClick={onOpenAddTask}
          className="rt:w-full rt:flex rt:items-center rt:justify-center rt:gap-2 rt:bg-blue-600 rt:hover:bg-blue-700 rt:text-white rt:text-sm rt:font-medium rt:py-2 rt:rounded-md rt:transition-colors"
        >
          <i className="fas fa-plus" />
          New Task
        </button>
        <button
          onClick={onOpenAddProject}
          className="rt:w-full rt:flex rt:items-center rt:justify-center rt:gap-2 rt:bg-zinc-800 rt:hover:bg-zinc-700 rt:text-zinc-200 rt:text-sm rt:font-medium rt:py-2 rt:rounded-md rt:transition-colors"
        >
          <i className="fas fa-folder-plus" />
          New Project
        </button>
      </div>

      {/* Projects list */}
      <div className="rt:flex-1 rt:overflow-y-auto custom-scrollbar rt:p-3">
        <h3 className="rt:text-xs rt:font-semibold rt:text-zinc-500 rt:uppercase rt:tracking-wider rt:mb-2 rt:px-2">
          Projects
        </h3>
        <ul id="project-list" className="rt:space-y-0.5">
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
                    title={project.starred ? 'Unstar' : 'Star'}
                  >
                    <i className={`fas fa-star rt:text-xs ${project.starred ? 'rt:text-amber-400' : 'rt:text-zinc-500'}`} />
                  </button>
                  <button
                    className="rt:p-1 rt:hover:bg-red-600 rt:rounded"
                    onClick={() => onDeleteProject(project.id)}
                    title="Delete project"
                  >
                    <i className="fas fa-trash rt:text-xs rt:text-zinc-500" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer actions */}
      <div className="rt:p-3 rt:border-t rt:border-zinc-800 rt:flex rt:flex-col rt:gap-1">
        <button
          onClick={onOpenArchive}
          className="rt:flex rt:items-center rt:gap-2 rt:px-3 rt:py-2 rt:text-sm rt:text-zinc-400 rt:hover:text-zinc-200 rt:hover:bg-zinc-800 rt:rounded-md rt:transition-colors"
        >
          <i className="fas fa-archive" />
          Archive
        </button>
        <button
          onClick={onExport}
          className="rt:flex rt:items-center rt:gap-2 rt:px-3 rt:py-2 rt:text-sm rt:text-zinc-400 rt:hover:text-zinc-200 rt:hover:bg-zinc-800 rt:rounded-md rt:transition-colors"
        >
          <i className="fas fa-download" />
          Export Data
        </button>
      </div>
    </aside>
  );
}
