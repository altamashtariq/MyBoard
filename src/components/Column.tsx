import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface KanbanColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (status: Task['status']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const columnStyles = {
    todo: {
      bg: 'bg-zinc-50/50 dark:bg-zinc-900/30',
      icon: <div className="w-6 h-6 rounded-full border-2 border-zinc-400 flex items-center justify-center text-zinc-400"><div className="w-2 h-2 rounded-full border-2 border-current" /></div>,
      accent: 'border-zinc-200 dark:border-zinc-800'
    },
    'in-progress': {
      bg: 'bg-blue-50/50 dark:bg-blue-900/10',
      icon: <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><div className="w-2 h-2 rounded-full border-2 border-current" /></div>,
      accent: 'border-blue-100 dark:border-blue-900/20'
    },
    done: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      icon: <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><div className="w-2 h-2 rounded-full border-2 border-current" /></div>,
      accent: 'border-emerald-100 dark:border-emerald-900/20'
    }
  };

  const style = columnStyles[column.id];

  return (
    <div className={cn(
      "flex flex-col w-full min-w-[320px] max-w-[450px] h-full rounded-3xl border transition-colors",
      style.bg,
      style.accent
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {style.icon}
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">{column.title}</h2>
          <span className="text-sm font-medium text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto scrollbar-hide min-h-[150px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-12 text-zinc-400">
            <p className="text-sm italic">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
