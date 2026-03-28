import { describe, it, expect } from 'vitest';
import { moveTaskInData, rollbackTaskInData, getDefaultData } from './lib/kanbanData';

describe('KanbanBoard data helpers', () => {
  it('should correctly move task between columns', () => {
    const data = getDefaultData();
    const taskId = 'task-1';
    const originalTodoLen = data.columns['todo'].tasks.length;
    const originalInProgressLen = data.columns['in-progress'].tasks.length;

    const result = moveTaskInData(data, taskId, 'todo', 'in-progress');

    expect(result).not.toBeNull();
    expect(data.columns['todo'].tasks).toHaveLength(originalTodoLen - 1);
    expect(data.columns['in-progress'].tasks).toHaveLength(originalInProgressLen + 1);

    const movedTask = data.columns['in-progress'].tasks.find((t) => t.id === taskId);
    expect(movedTask).toBeDefined();
  });

  it('should return null when task not found', () => {
    const data = getDefaultData();
    const result = moveTaskInData(data, 'non-existent-task', 'todo', 'in-progress');

    expect(result).toBeNull();
  });

  it('should rollback task to original position', () => {
    const data = getDefaultData();
    const taskId = data.columns['todo'].tasks[0].id;
    const originalTitle = data.columns['todo'].tasks[0].title;
    const originalTodoLen = data.columns['todo'].tasks.length;
    const originalInProgressLen = data.columns['in-progress'].tasks.length;

    // First, move the task
    const moveResult = moveTaskInData(data, taskId, 'todo', 'in-progress');
    expect(moveResult).not.toBeNull();

    const task = moveResult!.task;

    // Now rollback
    rollbackTaskInData(data, task, 'todo', moveResult!.fromIndex, 'in-progress');

    // Verify rollback worked
    expect(data.columns['todo'].tasks[0].id).toBe(taskId);
    expect(data.columns['todo'].tasks[0].title).toBe(originalTitle);
    expect(data.columns['todo'].tasks).toHaveLength(originalTodoLen);
    expect(data.columns['in-progress'].tasks).toHaveLength(originalInProgressLen);
  });

  it('should preserve task position after rollback', () => {
    const data = getDefaultData();
    const task1 = data.columns['todo'].tasks[0];
    const task2 = data.columns['todo'].tasks[1];
    const task3 = data.columns['todo'].tasks[2];

    // Move middle task
    const moveResult = moveTaskInData(data, task2.id, 'todo', 'in-progress');
    const task = moveResult!.task;

    // Rollback - should insert back at position 1
    rollbackTaskInData(data, task, 'todo', moveResult!.fromIndex, 'in-progress');

    expect(data.columns['todo'].tasks[0].id).toBe(task1.id);
    expect(data.columns['todo'].tasks[1].id).toBe(task2.id);
    expect(data.columns['todo'].tasks[2].id).toBe(task3.id);
  });

  it('should handle edge case when task removed from destination during rollback', () => {
    const data = getDefaultData();
    const taskId = data.columns['todo'].tasks[0].id;
    const originalTodoLen = data.columns['todo'].tasks.length;

    // Move the task
    const moveResult = moveTaskInData(data, taskId, 'todo', 'in-progress');
    const task = moveResult!.task;

    // Manually remove task from destination (simulating another move)
    data.columns['in-progress'].tasks = [];

    // Rollback - task no longer exists in destination, should still insert back at original index
    rollbackTaskInData(data, task, 'todo', moveResult!.fromIndex, 'in-progress');

    expect(data.columns['todo'].tasks[0].id).toBe(taskId);
    expect(data.columns['todo'].tasks).toHaveLength(originalTodoLen);
  });
});
