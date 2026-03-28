import type { KanbanData, Task, ColumnId } from '@/types';

const STORAGE_KEY = 'kanban-board-data';

export function getDefaultData(): KanbanData {
  return {
    projects: [
      { id: 'mast', name: 'Mast', starred: true, color: 'fuchsia' },
      { id: 'bluejay', name: 'Bluejay', starred: true, color: 'blue' },
      { id: 'dabble', name: 'Dabble', starred: false, color: 'purple' },
      { id: 'highlight', name: 'Highlight', starred: false, color: 'cyan' },
      { id: 'figmate', name: 'Figmate', starred: false, color: 'orange' },
      { id: 'gwp', name: 'GWP', starred: false, color: 'green' },
      { id: 'launchpad', name: 'LaunchPad', starred: false, color: 'violet' },
      { id: 'rev', name: 'Rev', starred: false, color: 'red' },
    ],
    archivedTasks: [],
    columns: {
      todo: {
        id: 'todo',
        title: 'To Do',
        tasks: [
          {
            id: 'task-1',
            title: 'Update ticket designs in modal.',
            assignee: 'Brantley Mathis',
            project: 'Mast',
            projectColor: 'fuchsia',
            time: '20h',
            status: 'blocked',
            avatar: 'https://picsum.photos/20?6',
          },
          {
            id: 'task-2',
            title: 'Create page layout for onboarding.',
            assignee: 'Sarah Wilson',
            project: 'Bluejay',
            projectColor: 'blue',
            time: '15h',
            status: 'paused',
            avatar: 'https://picsum.photos/20?1',
          },
          {
            id: 'task-3',
            title: 'Polish designs and reach out to dev.',
            assignee: 'Alex Chen',
            project: 'Dabble',
            projectColor: 'purple',
            time: '8h',
            avatar: 'https://picsum.photos/20?2',
          },
          {
            id: 'task-4',
            title: 'Remote user approvals/comments',
            assignee: 'Jordan Taylor',
            project: 'GWP',
            projectColor: 'green',
            time: '12h',
            avatar: 'https://picsum.photos/20?3',
          },
          {
            id: 'task-5',
            title: 'Redo landing page for Sono Dojo',
            assignee: 'Morgan Davis',
            project: 'Figmate',
            projectColor: 'orange',
            time: '25h',
            status: 'cancelled',
            avatar: 'https://picsum.photos/20?4',
          },
        ],
      },
      'in-progress': {
        id: 'in-progress',
        title: 'In Progress',
        tasks: [
          {
            id: 'task-6',
            title: 'Include lien waiver questionnaire statement.',
            assignee: 'Ivan Erickson',
            project: 'Bluejay',
            projectColor: 'blue',
            time: '5h',
            avatar: 'https://picsum.photos/20?7',
          },
          {
            id: 'task-7',
            title: 'Button Styling Concepts',
            assignee: 'Tori Bates',
            project: 'Mast',
            projectColor: 'fuchsia',
            time: '10h',
            status: 'done',
            avatar: 'https://picsum.photos/20?8',
          },
        ],
      },
      done: {
        id: 'done',
        title: 'Done',
        tasks: [
          {
            id: 'task-8',
            title: 'Add Search Bar.',
            assignee: 'Sabrina Dobson',
            project: 'Highlight',
            projectColor: 'cyan',
            status: 'done',
            avatar: 'https://picsum.photos/20?9',
            time: '',
          },
          {
            id: 'task-9',
            title: 'Update Material Editor Info.',
            assignee: 'Ellis Ochoa',
            project: 'LaunchPad',
            projectColor: 'violet',
            avatar: 'https://picsum.photos/20?10',
            time: '',
          },
          {
            id: 'task-10',
            title: 'Add Membership Renewal Button.',
            assignee: 'Glenn Jones',
            project: 'Rev',
            projectColor: 'red',
            status: 'blocked',
            avatar: 'https://picsum.photos/20?11',
            time: '',
          },
        ],
      },
    },
  };
}

function migrateData(data: Record<string, unknown>): KanbanData {
  const columns = data.columns as Record<string, unknown>;

  // Migrate up-next -> todo
  if (columns['up-next'] && !columns['todo']) {
    const col = columns['up-next'] as Record<string, unknown>;
    columns['todo'] = { ...col, id: 'todo', title: 'To Do' };
    delete columns['up-next'];
  }

  // Migrate in-review -> done
  if (columns['in-review'] && !columns['done']) {
    const col = columns['in-review'] as Record<string, unknown>;
    columns['done'] = { ...col, id: 'done', title: 'Done' };
    delete columns['in-review'];
  }

  // Migrate archivedFrom references
  const archived = (data.archivedTasks as Task[] | undefined) ?? [];
  archived.forEach((task) => {
    if (task.archivedFrom === 'up-next') task.archivedFrom = 'todo';
    if (task.archivedFrom === 'in-review') task.archivedFrom = 'done';
  });

  if (!data.archivedTasks) {
    data.archivedTasks = [];
  }

  return data as unknown as KanbanData;
}

export function loadData(): KanbanData {
  if (typeof window === 'undefined') return getDefaultData();

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return migrateData(JSON.parse(stored));
    } catch {
      return getDefaultData();
    }
  }
  return getDefaultData();
}

export function saveData(data: KanbanData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function findTask(
  data: KanbanData,
  taskId: string
): { task: Task; columnId: ColumnId; index: number } | null {
  for (const columnId of Object.keys(data.columns) as ColumnId[]) {
    const idx = data.columns[columnId].tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      return { task: data.columns[columnId].tasks[idx], columnId, index: idx };
    }
  }
  return null;
}

export function moveTaskInData(
  data: KanbanData,
  taskId: string,
  fromColumnId: string,
  toColumnId: string
): { task: Task; fromIndex: number } | null {
  const from = data.columns[fromColumnId as ColumnId];
  const to = data.columns[toColumnId as ColumnId];
  if (!from || !to) return null;

  const idx = from.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;

  const [task] = from.tasks.splice(idx, 1);
  to.tasks.push(task);
  return { task, fromIndex: idx };
}

export function rollbackTaskInData(
  data: KanbanData,
  task: Task,
  fromColumnId: string,
  fromIndex: number,
  toColumnId: string
): void {
  const to = data.columns[toColumnId as ColumnId];
  const from = data.columns[fromColumnId as ColumnId];
  if (!to || !from) return;

  const idx = to.tasks.findIndex((t) => t.id === task.id);
  if (idx !== -1) {
    to.tasks.splice(idx, 1);
  }
  from.tasks.splice(fromIndex, 0, task);
}

export const PROJECT_COLORS: Record<string, string> = {
  fuchsia: 'rt:bg-fuchsia-700/40 rt:text-fuchsia-300',
  blue: 'rt:bg-blue-700/40 rt:text-blue-300',
  purple: 'rt:bg-purple-700/40 rt:text-purple-300',
  green: 'rt:bg-green-700/40 rt:text-green-300',
  orange: 'rt:bg-orange-700/40 rt:text-orange-300',
  cyan: 'rt:bg-cyan-700/40 rt:text-cyan-300',
  violet: 'rt:bg-violet-700/40 rt:text-violet-300',
  red: 'rt:bg-red-700/40 rt:text-red-300',
  yellow: 'rt:bg-yellow-700/40 rt:text-yellow-300',
  pink: 'rt:bg-pink-700/40 rt:text-pink-300',
};

export const STATUS_MAP: Record<
  string,
  { className: string; text: string; icon: string }
> = {
  blocked: {
    className: 'rt:bg-red-900/50 rt:text-red-300 rt:border-red-800/60',
    text: 'Blocked',
    icon: 'fas fa-ban',
  },
  paused: {
    className: 'rt:bg-yellow-900/50 rt:text-yellow-300 rt:border-yellow-800/60',
    text: 'Paused',
    icon: 'fas fa-pause',
  },
  cancelled: {
    className: 'rt:bg-gray-900/50 rt:text-gray-400 rt:border-gray-800/60',
    text: 'Cancelled',
    icon: 'fas fa-times',
  },
  done: {
    className: 'rt:bg-green-900/50 rt:text-green-300 rt:border-green-800/60',
    text: 'Done',
    icon: 'fas fa-check',
  },
};

export const AVAILABLE_STATUSES = [
  { value: '', label: 'No Status', icon: '' },
  { value: 'blocked', label: 'Blocked', icon: 'fas fa-ban' },
  { value: 'paused', label: 'Paused', icon: 'fas fa-pause' },
  { value: 'cancelled', label: 'Cancelled', icon: 'fas fa-times' },
  { value: 'done', label: 'Done', icon: 'fas fa-check' },
];
