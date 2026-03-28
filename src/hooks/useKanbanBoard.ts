'use client';

import { useState, useCallback, useRef } from 'react';
import type { KanbanData, Task, ColumnId } from '@/types';
import {
  loadData,
  saveData,
  getDefaultData,
  moveTaskInData,
  rollbackTaskInData,
  findTask,
} from '@/lib/kanbanData';
import { persistTaskMove, MockApiError } from '@/api/mockApi';

export function useKanbanBoard(showNotification: (msg: string, type: 'success' | 'error' | 'info') => void) {
  const [data, setData] = useState<KanbanData>(loadData);
  const [movingTaskIds, setMovingTaskIds] = useState<Set<string>>(new Set());
  const dataRef = useRef(data);
  dataRef.current = data;

  const persist = useCallback((newData: KanbanData) => {
    saveData(newData);
    setData(newData);
  }, []);

  const addTask = useCallback(
    (columnId: string, taskData: { title: string; assignee?: string; project?: string; time?: string; status?: string; avatar?: string }) => {
      const newData = { ...dataRef.current };
      const column = newData.columns[columnId as ColumnId];
      if (!column) return;

      const project = newData.projects.find((p) => p.id === taskData.project);
      const newTask: Task = {
        id: 'task-' + Date.now(),
        title: taskData.title,
        assignee: taskData.assignee || 'Unassigned',
        project: project ? project.name : 'General',
        projectColor: project ? project.color : 'gray',
        time: taskData.time || '',
        status: taskData.status as Task['status'],
        avatar: taskData.avatar || `https://picsum.photos/20?${Date.now()}`,
      };

      column.tasks = [...column.tasks, newTask];
      persist({ ...newData, columns: { ...newData.columns } });
    },
    [persist]
  );

  const removeTask = useCallback(
    (taskId: string) => {
      const newData = { ...dataRef.current };
      for (const colId of Object.keys(newData.columns) as ColumnId[]) {
        const idx = newData.columns[colId].tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          newData.columns[colId] = {
            ...newData.columns[colId],
            tasks: newData.columns[colId].tasks.filter((_, i) => i !== idx),
          };
          persist({ ...newData, columns: { ...newData.columns } });
          return;
        }
      }
    },
    [persist]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, newStatus: string | null) => {
      const newData = { ...dataRef.current };
      for (const colId of Object.keys(newData.columns) as ColumnId[]) {
        const tasks = [...newData.columns[colId].tasks];
        const idx = tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          const task = { ...tasks[idx] };
          if (newStatus) {
            task.status = newStatus as Task['status'];
          } else {
            delete task.status;
          }
          tasks[idx] = task;
          newData.columns[colId] = { ...newData.columns[colId], tasks };
          persist({ ...newData, columns: { ...newData.columns } });
          return;
        }
      }
    },
    [persist]
  );

  const archiveTask = useCallback(
    (taskId: string) => {
      const newData = { ...dataRef.current };
      for (const colId of Object.keys(newData.columns) as ColumnId[]) {
        const tasks = [...newData.columns[colId].tasks];
        const idx = tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          const [task] = tasks.splice(idx, 1);
          task.archivedAt = new Date().toISOString();
          task.archivedFrom = colId;
          newData.columns[colId] = { ...newData.columns[colId], tasks };
          newData.archivedTasks = [...newData.archivedTasks, task];
          persist({
            ...newData,
            columns: { ...newData.columns },
            archivedTasks: newData.archivedTasks,
          });
          showNotification(`Task "${task.title}" archived`, 'success');
          return;
        }
      }
    },
    [persist, showNotification]
  );

  const restoreTask = useCallback(
    (taskId: string, targetColumnId?: string) => {
      const newData = { ...dataRef.current };
      const archived = [...newData.archivedTasks];
      const idx = archived.findIndex((t) => t.id === taskId);
      if (idx === -1) return;

      const task = { ...archived[idx] };
      archived.splice(idx, 1);
      const restoreCol = (targetColumnId || task.archivedFrom || 'todo') as ColumnId;
      delete task.archivedAt;
      delete task.archivedFrom;

      if (newData.columns[restoreCol]) {
        newData.columns[restoreCol] = {
          ...newData.columns[restoreCol],
          tasks: [...newData.columns[restoreCol].tasks, task],
        };
        newData.archivedTasks = archived;
        persist({ ...newData, columns: { ...newData.columns }, archivedTasks: archived });
        showNotification(`Task "${task.title}" restored`, 'success');
      }
    },
    [persist, showNotification]
  );

  const deleteArchivedTask = useCallback(
    (taskId: string) => {
      const newData = { ...dataRef.current };
      newData.archivedTasks = newData.archivedTasks.filter((t) => t.id !== taskId);
      persist({ ...newData, archivedTasks: newData.archivedTasks });
      showNotification('Task permanently deleted', 'info');
    },
    [persist, showNotification]
  );

  const addProject = useCallback(
    (name: string, color: string) => {
      const newData = { ...dataRef.current };
      const exists = newData.projects.some(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) return false;

      const uid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

      newData.projects = [
        ...newData.projects,
        { id: `proj-${uid}`, name, starred: false, color },
      ];
      persist(newData);
      return true;
    },
    [persist]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      const newData = { ...dataRef.current };
      const project = newData.projects.find((p) => p.id === projectId);
      if (!project) return;

      newData.projects = newData.projects.filter((p) => p.id !== projectId);

      // Clear project from tasks
      const newColumns = { ...newData.columns };
      for (const colId of Object.keys(newColumns) as ColumnId[]) {
        newColumns[colId] = {
          ...newColumns[colId],
          tasks: newColumns[colId].tasks.map((t) =>
            t.project === project.name ? { ...t, project: '', projectColor: 'gray' } : t
          ),
        };
      }
      newData.columns = newColumns;
      newData.archivedTasks = newData.archivedTasks.map((t) =>
        t.project === project.name ? { ...t, project: '', projectColor: 'gray' } : t
      );
      persist(newData);
    },
    [persist]
  );

  const toggleProjectStar = useCallback(
    (projectId: string) => {
      const newData = { ...dataRef.current };
      newData.projects = newData.projects.map((p) =>
        p.id === projectId ? { ...p, starred: !p.starred } : p
      );
      persist(newData);
    },
    [persist]
  );

  const moveTaskOptimistic = useCallback(
    async (taskId: string, fromColumnId: string, toColumnId: string) => {
      const snapshot: KanbanData =
        typeof structuredClone === 'function'
          ? structuredClone(dataRef.current)
          : JSON.parse(JSON.stringify(dataRef.current));
      const result = moveTaskInData(snapshot, taskId, fromColumnId, toColumnId);
      if (!result) return;

      // Optimistic update
      setMovingTaskIds((prev) => new Set(prev).add(taskId));
      persist({ ...snapshot, columns: { ...snapshot.columns } });

      try {
        await persistTaskMove({ taskId, fromColumnId: fromColumnId as ColumnId, toColumnId: toColumnId as ColumnId });
      } catch (error) {
        if (error instanceof MockApiError) {
          // Rollback
          rollbackTaskInData(snapshot, result.task, fromColumnId, result.fromIndex, toColumnId);
          persist({ ...snapshot, columns: { ...snapshot.columns } });
          showNotification(
            `Move failed: "${result.task.title}" returned to ${dataRef.current.columns[fromColumnId as ColumnId]?.title || fromColumnId}`,
            'error'
          );
        }
      } finally {
        setMovingTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }
    },
    [persist, showNotification]
  );

  const resetData = useCallback(() => {
    persist(getDefaultData());
  }, [persist]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(dataRef.current, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kanban-board-data.json';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    data,
    movingTaskIds,
    addTask,
    removeTask,
    updateTaskStatus,
    archiveTask,
    restoreTask,
    deleteArchivedTask,
    addProject,
    deleteProject,
    toggleProjectStar,
    moveTaskOptimistic,
    resetData,
    exportData,
    findTaskById: (taskId: string) => findTask(dataRef.current, taskId),
  };
}
