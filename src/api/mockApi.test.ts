import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { persistTaskMove, MockApiError } from './mockApi';

import type { MoveTaskParams } from '@/types';

describe('mockApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after 1500ms when random check passes', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const promise = persistTaskMove({
      taskId: 'task-1',
      fromColumnId: 'todo',
      toColumnId: 'in-progress',
    });

    vi.advanceTimersByTime(1500);
    const result = await promise;
    expect(result).toEqual({ success: true });
    vi.restoreAllMocks();
  });

  it('rejects with MockApiError when random check fails', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const promise = persistTaskMove({
      taskId: 'task-1',
      fromColumnId: 'todo',
      toColumnId: 'in-progress',
    });

    vi.advanceTimersByTime(1500);

    await expect(promise).rejects.toThrow(MockApiError);
    vi.restoreAllMocks();
  });

  it('includes task info in error message', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    const promise = persistTaskMove({
      taskId: 'task-42',
      fromColumnId: 'todo',
      toColumnId: 'done',
    });

    vi.advanceTimersByTime(1500);
    await expect(promise).rejects.toThrow('task-42');
    vi.restoreAllMocks();
  });
});
