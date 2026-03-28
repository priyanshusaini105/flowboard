export type ColumnId = 'todo' | 'in-progress' | 'done';
export type TaskStatus = 'blocked' | 'paused' | 'cancelled' | 'done';
export type NotificationType = 'success' | 'error' | 'info';
export type ThemeMode = 'dark' | 'light';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  project: string;
  projectColor: string;
  time: string;
  status?: TaskStatus;
  avatar: string;
  archivedAt?: string;
  archivedFrom?: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  starred: boolean;
  color: string;
}

export interface KanbanData {
  projects: Project[];
  archivedTasks: Task[];
  columns: Record<ColumnId, Column>;
}

export interface MoveTaskParams {
  taskId: string;
  fromColumnId: ColumnId;
  toColumnId: ColumnId;
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}
