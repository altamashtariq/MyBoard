export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: Priority;
  createdAt: number;
}

export interface Column {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To do' },
  { id: 'in-progress', title: 'In progress' },
  { id: 'done', title: 'Done' },
];
