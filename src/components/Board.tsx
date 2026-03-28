'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import type { ColumnId, TaskStatus } from '@/types';
import Column from './Column';
import { AppSidebar } from './Sidebar';
import AddTaskModal from './AddTaskModal';
import AddProjectModal from './AddProjectModal';
import ArchiveModal from './ArchiveModal';
import StatusMenu from './StatusMenu';
import NotificationStack from './Notification';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from './ConfirmDialog';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function Board() {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const board = useKanbanBoard(showNotification);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [statusMenu, setStatusMenu] = useState<{ taskId: string; rect: DOMRect } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const updateProjectInUrl = useCallback(
    (projectId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('projectId');
      params.delete('projectid');

      if (projectId) {
        params.set('projectID', projectId);
      } else {
        params.delete('projectID');
      }

      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleSelectProject = useCallback(
    (projectId: string | null) => {
      setActiveProjectId(projectId);
      updateProjectInUrl(projectId);
    },
    [updateProjectInUrl]
  );

  useEffect(() => {
    const projectIdFromUrl =
      searchParams.get('projectID') || searchParams.get('projectId') || searchParams.get('projectid');

    if (!projectIdFromUrl) {
      setActiveProjectId((prev) => (prev === null ? prev : null));
      return;
    }

    const exists = board.data.projects.some((p) => p.id === projectIdFromUrl);
    if (!exists) {
      setActiveProjectId((prev) => (prev === null ? prev : null));
      updateProjectInUrl(null);
      return;
    }

    if (!searchParams.get('projectID')) {
      updateProjectInUrl(projectIdFromUrl);
    }

    setActiveProjectId((prev) => (prev === projectIdFromUrl ? prev : projectIdFromUrl));
  }, [searchParams, board.data.projects, updateProjectInUrl]);

  const handleStatusClick = useCallback((taskId: string, rect: DOMRect) => {
    setStatusMenu({ taskId, rect });
  }, []);

  const handleStatusSelect = useCallback(
    (taskId: string, status: string | null) => {
      board.updateTaskStatus(taskId, status);
      setStatusMenu(null);
    },
    [board]
  );

  const handleArchive = useCallback(
    (taskId: string) => {
      const found = board.findTaskById(taskId);
      if (!found) return;
      setConfirmDialog({
        title: 'Archive task',
        message: 'Are you sure you want to archive "' + found.task.title + '"?',
        onConfirm: () => {
          board.archiveTask(taskId);
          setConfirmDialog(null);
        },
      });
    },
    [board]
  );

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      const project = board.data.projects.find((p) => p.id === projectId);
      if (!project) return;
      setConfirmDialog({
        title: 'Delete project',
        message: 'Delete "' + project.name + '"? This removes it from all tasks.',
        onConfirm: () => {
          board.deleteProject(projectId);
          if (activeProjectId === projectId) handleSelectProject(null);
          setConfirmDialog(null);
        },
      });
    },
    [board, activeProjectId, handleSelectProject]
  );

  const handleAddTask = useCallback(
    (
      columnId: string,
      taskData: {
        title: string;
        assignee: string;
        project: string;
        time: string;
        status?: string;
        avatar: string;
      }
    ) => {
      board.addTask(columnId, {
        ...taskData,
        status: taskData.status as TaskStatus | undefined,
      });
    },
    [board]
  );

  const handleAddProject = useCallback(
    (name: string, color: string) => {
      const success = board.addProject(name, color);
      if (!success) {
        showNotification('A project with this name already exists', 'error');
      }
      return success;
    },
    [board, showNotification]
  );

  const columnIds: ColumnId[] = ['todo', 'in-progress', 'done'];

  // Filter tasks by active project
  const filteredColumns = useMemo(() => {
    if (!activeProjectId) return board.data.columns;
    const activeProject = board.data.projects.find((p) => p.id === activeProjectId);
    if (!activeProject) return board.data.columns;

    const filtered: typeof board.data.columns = {} as typeof board.data.columns;
    for (const colId of columnIds) {
      filtered[colId] = {
        ...board.data.columns[colId],
        tasks: board.data.columns[colId].tasks.filter(
          (t) => t.project === activeProject.name
        ),
      };
    }
    return filtered;
  }, [board.data.columns, board.data.projects, activeProjectId]);

  const activeProjectName = activeProjectId
    ? board.data.projects.find((p) => p.id === activeProjectId)?.name ?? 'Kanban Board'
    : 'Kanban Board';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar
          projects={board.data.projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onToggleStar={board.toggleProjectStar}
          onDeleteProject={handleDeleteProject}
          onOpenAddTask={() => setShowAddTask(true)}
          onOpenAddProject={() => setShowAddProject(true)}
          onOpenArchive={() => setShowArchive(true)}
          onExport={board.exportData}
        />

        <SidebarInset className="flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 h-14">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <h1 className="text-base font-semibold text-foreground">
                {activeProjectName}
                {activeProjectId && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    filtered
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors"
              >
                <i className="fas fa-plus text-xs" />
                <span className="hidden sm:inline">Add Task</span>
              </button>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </header>

          {/* Board columns */}
          <div className="flex-1 flex gap-4 p-4 overflow-x-auto overflow-y-hidden">
            {columnIds.map((colId) => (
              <Column
                key={colId}
                column={filteredColumns[colId]}
                tasks={filteredColumns[colId].tasks}
                movingTaskIds={board.movingTaskIds}
                onMoveTask={board.moveTaskOptimistic}
                onStatusClick={handleStatusClick}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </SidebarInset>
      </div>

      <AddTaskModal
        open={showAddTask}
        projects={board.data.projects}
        activeProjectId={activeProjectId}
        onAdd={handleAddTask}
        onClose={() => setShowAddTask(false)}
      />
      <AddProjectModal
        open={showAddProject}
        onAdd={handleAddProject}
        onClose={() => setShowAddProject(false)}
      />
      <ArchiveModal
        open={showArchive}
        archivedTasks={board.data.archivedTasks}
        onRestore={(id) => board.restoreTask(id)}
        onDelete={(id) => board.deleteArchivedTask(id)}
        onClose={() => setShowArchive(false)}
      />

      {statusMenu && (
        <StatusMenu
          taskId={statusMenu.taskId}
          anchorRect={statusMenu.rect}
          onSelect={handleStatusSelect}
          onClose={() => setStatusMenu(null)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title || ''}
        description={confirmDialog?.message || ''}
        variant="confirm"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onCancel={() => setConfirmDialog(null)}
      />

      <NotificationStack notifications={notifications} onRemove={removeNotification} />
    </SidebarProvider>
  );
}
