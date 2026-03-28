'use client';

import { useState, useCallback } from 'react';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import type { ColumnId, TaskStatus } from '@/types';
import Column from './Column';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import AddTaskModal from './AddTaskModal';
import AddProjectModal from './AddProjectModal';
import ArchiveModal from './ArchiveModal';
import StatusMenu from './StatusMenu';
import NotificationStack from './Notification';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from './ConfirmDialog';

export default function Board() {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const board = useKanbanBoard(showNotification);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [statusMenu, setStatusMenu] = useState<{ taskId: string; rect: DOMRect } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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
          setConfirmDialog(null);
        },
      });
    },
    [board]
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

  return (
    <div className="rt:flex rt:h-screen rt:overflow-hidden rt:bg-zinc-950 rt:text-zinc-100">
      <div className="rt:hidden lg:rt:block">
        <Sidebar
          projects={board.data.projects}
          onToggleStar={board.toggleProjectStar}
          onDeleteProject={handleDeleteProject}
          onOpenAddTask={() => setShowAddTask(true)}
          onOpenAddProject={() => setShowAddProject(true)}
          onOpenArchive={() => setShowArchive(true)}
          onExport={board.exportData}
        />
      </div>

      <main className="rt:flex-1 rt:flex rt:flex-col rt:overflow-hidden">
        <div className="rt:flex rt:items-center rt:justify-between rt:px-6 rt:py-4 rt:border-b rt:border-zinc-800 rt:flex-shrink-0">
          <div className="rt:flex rt:items-center rt:gap-3">
            <button
              className="lg:rt:hidden rt:p-2 rt:rounded-md rt:hover:bg-zinc-800 rt:text-zinc-400"
              onClick={() => setShowMobileSidebar(true)}
            >
              <i className="fas fa-bars" />
            </button>
            <h1 className="rt:text-lg rt:font-semibold rt:text-zinc-100">Kanban Board</h1>
          </div>
          <div className="rt:flex rt:items-center rt:gap-2">
            <button
              onClick={() => setShowAddTask(true)}
              className="rt:flex rt:items-center rt:gap-2 rt:px-3 rt:py-2 rt:text-sm rt:bg-blue-600 rt:text-white rt:hover:bg-blue-700 rt:rounded-md rt:font-medium"
            >
              <i className="fas fa-plus" />
              <span className="rt:hidden sm:rt:inline">Add Task</span>
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        <div className="rt:flex-1 rt:flex rt:gap-4 rt:p-4 rt:overflow-x-auto">
          {columnIds.map((colId) => (
            <Column
              key={colId}
              column={board.data.columns[colId]}
              tasks={board.data.columns[colId].tasks}
              movingTaskIds={board.movingTaskIds}
              onMoveTask={board.moveTaskOptimistic}
              onStatusClick={handleStatusClick}
              onArchive={handleArchive}
            />
          ))}
        </div>
      </main>

      <AddTaskModal
        open={showAddTask}
        projects={board.data.projects}
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

      {showMobileSidebar && (
        <MobileSidebar
          projects={board.data.projects}
          onToggleStar={board.toggleProjectStar}
          onDeleteProject={handleDeleteProject}
          onOpenAddTask={() => { setShowAddTask(true); setShowMobileSidebar(false); }}
          onOpenAddProject={() => { setShowAddProject(true); setShowMobileSidebar(false); }}
          onOpenArchive={() => { setShowArchive(true); setShowMobileSidebar(false); }}
          onClose={() => setShowMobileSidebar(false)}
        />
      )}

      <NotificationStack notifications={notifications} onRemove={removeNotification} />
    </div>
  );
}
