'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onToggleStar: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAddTask: () => void;
  onOpenAddProject: () => void;
  onOpenArchive: () => void;
  onExport: () => void;
}

export function AppSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onToggleStar,
  onDeleteProject,
  onOpenAddTask,
  onOpenAddProject,
  onOpenArchive,
  onExport,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [projectMenuOpenId, setProjectMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProjectMenuOpenId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sorted = [...projects].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return 0;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <i className="fas fa-columns text-blue-500 text-base shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-base truncate text-sidebar-foreground">
              Flowboard
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Action buttons */}
      <SidebarContent className="px-2 py-2 gap-1">
        <button
          onClick={onOpenAddTask}
          className={`flex items-center gap-2 w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 transition-colors ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          <i className="fas fa-plus text-sm shrink-0" />
          {!isCollapsed && <span>New Task</span>}
        </button>
        <button
          onClick={onOpenAddProject}
          className={`flex items-center gap-2 w-full rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground text-sm font-medium py-2 transition-colors ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          <i className="fas fa-folder-plus text-sm shrink-0" />
          {!isCollapsed && <span>New Project</span>}
        </button>
      </SidebarContent>

      <SidebarSeparator />

      {/* Projects */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Projects
          </SidebarGroupLabel>
          <SidebarMenu>
            {/* "All" project item */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeProjectId === null}
                onClick={() => onSelectProject(null)}
                tooltip="All Projects"
                className="group"
              >
                <i className="fas fa-th-large text-sm text-sidebar-foreground/70" />
                <span>All Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {sorted.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton
                  isActive={activeProjectId === project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    setProjectMenuOpenId(null);
                  }}
                  tooltip={project.name}
                  className="group"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate flex-1">{project.name}</span>
                  {project.starred && (
                    <i className="fas fa-star text-amber-400 text-xs shrink-0" />
                  )}
                </SidebarMenuButton>

                <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    className="h-5 w-5 rounded-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    aria-label={`Open actions for ${project.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setProjectMenuOpenId((prev) => (prev === project.id ? null : project.id));
                    }}
                  >
                    <i className="fas fa-ellipsis-h text-[10px]" />
                  </button>

                  {projectMenuOpenId === project.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-popover p-1 shadow-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                        onClick={() => {
                          onToggleStar(project.id);
                          setProjectMenuOpenId(null);
                        }}
                      >
                        <i className={`fas fa-star text-xs ${project.starred ? 'text-amber-500' : 'text-muted-foreground'}`} />
                        <span>{project.starred ? 'Unstar project' : 'Star project'}</span>
                      </button>
                      <button
                        className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-destructive/10 text-destructive flex items-center gap-2"
                        onClick={() => {
                          onDeleteProject(project.id);
                          setProjectMenuOpenId(null);
                        }}
                      >
                        <i className="fas fa-trash text-xs" />
                        <span>Delete project</span>
                      </button>
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer */}
      <SidebarFooter className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onOpenArchive} tooltip="Archive">
              <i className="fas fa-archive text-sm" />
              <span>Archive</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onExport} tooltip="Export Data">
              <i className="fas fa-download text-sm" />
              <span>Export Data</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Collapsible trigger button to use in header
export function SidebarToggle() {
  return <SidebarTrigger />;
}
