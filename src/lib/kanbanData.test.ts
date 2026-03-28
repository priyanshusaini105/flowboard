import { describe, it, expect, beforeEach } from 'vitest';
import type { KanbanData } from '@/types';
import {
  getDefaultData,
  findTask,
  moveTaskInData,
  rollbackTaskInData,
} from './kanbanData';

describe('kanbanData', () => {
  describe('getDefaultData', () => {
    it('returns valid KanbanData structure', () => {
      const data = getDefaultData();

      expect(data.projects).toHaveLength(8);
      expect(data.archivedTasks).toEqual([]);
      expect(Object.keys(data.columns)).toEqual(['todo', 'in-progress', 'done']);
      expect(data.columns.todo.title).toBe('To Do');
      expect(data.columns['in-progress'].title).toBe('In Progress');
      expect(data.columns.done.title).toEqual('Done');
    });

    it('has todo column with 5 sample tasks', () => {
      const data = getDefaultData();
      expect(data.columns.todo.tasks).toHaveLength(5);
    });

    it('has in-progress column with 2 sample tasks', () => {
      const data = getDefaultData();
      expect(data.columns['in-progress'].tasks).toHaveLength(2);
    });

    it('has done column with 3 sample tasks', () => {
      const data = getDefaultData();
      expect(data.columns.done.tasks).toHaveLength(3);
    });

    it('all tasks have required fields', () => {
      const data = getDefaultData();

      for (const column of Object.values(data.columns)) {
        for (const task of column.tasks) {
          expect(task).toHaveProperty('id');
          expect(task).toHaveProperty('title');
          expect(task).toHaveProperty('assignee');
          expect(task).toHaveProperty('project');
          expect(task).toHaveProperty('avatar');
        }
      }
    });
  });

  describe('findTask', () => {
    const data = getDefaultData();

    it('finds an existing task', () => {
      const result = findTask(data, 'task-1');
      expect(result).not.toBeNull();
      expect(result!.task.id).toBe('task-1');
      expect(result!.columnId).toBe('todo');
    });

    it('returns null for non-existent task', () => {
      const result = findTask(data, 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('moveTaskInData', () => {
    let data: KanbanData;

    beforeEach(() => {
      data = getDefaultData();
    });

    it('moves a task from todo to done', () => {
      const result = moveTaskInData(data, 'task-1', 'todo', 'done');
      expect(result).not.toBeNull();
      expect(result!.task.id).toEqual('task-1');
      expect(result!.fromIndex).toBe(0);

      // Task should be removed from todo and added to done
      expect(data.columns.todo.tasks.find((t) => t.id === 'task-1')).toBeUndefined();
      expect(data.columns.done.tasks.find((t) => t.id === 'task-1')).toBeDefined();
    });

    it('returns null for non-existent column', () => {
      const result = moveTaskInData(data, 'task-1', 'todo', 'non-existent');
      expect(result).toBeNull();
    });

    it('returns null for non-existent task', () => {
      const result = moveTaskInData(data, 'non-existent', 'todo', 'done');
      expect(result).toBeNull();
    });
  });

  describe('rollbackTaskInData', () => {
    let data: KanbanData;

    beforeEach(() => {
      data = getDefaultData();
    });

    it('rolls back a task to original position', () => {
      // First move task-1 from todo (index 0) to done
      moveTaskInData(data, 'task-1', 'todo', 'done');

      const task = data.columns.todo.tasks.find((t) => t.id === 'task-1');
      expect(task).toBeUndefined();

      // Now rollback
      rollbackTaskInData(data, { id: 'task-1', title: 'Test' } as any, 'todo', 0, 'done');

      // Task should be back in todo at original index
      expect(data.columns.todo.tasks[0].id).toEqual('task-1');
      expect(data.columns.done.tasks.find((t) => t.id === 'task-1')).toBeUndefined();
    });
  });
});
