import type { MoveTaskParams } from '@/types';

const API_DELAY_MS = 1500;
const FAILURE_RATE = 0.2;

export class MockApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MockApiError';
  }
}

export function persistTaskMove(params: MoveTaskParams): Promise<{ success: true }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(
          new MockApiError(
            `Failed to move task "${params.taskId}" from ${params.fromColumnId} to ${params.toColumnId}. Network error.`
          )
        );
      } else {
        resolve({ success: true });
      }
    }, API_DELAY_MS);
  });
}
