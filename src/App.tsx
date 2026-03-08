import { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { Layout, Search, Plus, Settings2, Github, Linkedin, Moon, Sun } from 'lucide-react';
import { Task, COLUMNS } from './types';
import { KanbanColumn } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { cn } from './lib/utils';

const STORAGE_KEY = 'kanban-flow-tasks';
const THEME_KEY = 'kanban-flow-theme';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    
   
     return [
      {
        id: '1',
        title: 'evening walk',
        description: 'Take a relaxing walk in the evening',
        status: 'todo',
        priority: 'low',
        createdAt: Date.now()
      },
      {
        id: '2',
        title: 'code submission',
        description: 'Submit the final project code',
        status: 'todo',
        priority: 'high',
        createdAt: Date.now()
      },
      {
        id: '3',
        title: 'gym',
        description: 'Daily workout session',
        status: 'in-progress',
        priority: 'medium',
        createdAt: Date.now()
      },
      {
        id: '4',
        title: 'gdg submission',
        description: 'Final submission for GDG',
        status: 'done',
        priority: 'urgent',
        createdAt: Date.now()
      }
    ];
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePriorityFilter, setActivePriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('todo');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activePriorityFilter !== 'all') {
      result = result.filter(t => t.priority === activePriorityFilter);
    }

    if (activeStatusFilter !== 'all') {
      result = result.filter(t => t.status === activeStatusFilter);
    }

    return result;
  }, [tasks, searchQuery, activePriorityFilter, activeStatusFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done,
      progress
    };
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: newTasks[overIndex].status };
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over a Column
    const isOverAColumn = over.data.current?.type !== 'Task';
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex] = { ...newTasks[activeIndex], status: overId as Task['status'] };
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const addTask = (status: Task['status'] = 'todo') => {
    setDefaultStatus(status);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title!,
        description: taskData.description || '',
        status: defaultStatus,
        priority: taskData.priority || 'medium',
        createdAt: Date.now(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 bg-texture",
      isDarkMode && "dark"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://www.gstatic.com/images/branding/product/2x/google_developers_64dp.png" 
              alt="GDG Logo" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col -space-y-1 hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight dark:text-white">MyBoard</h1>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">by altamash</p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="hidden md:flex items-center gap-6 bg-zinc-100 dark:bg-zinc-800/50 px-6 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => setActiveStatusFilter(activeStatusFilter === 'todo' ? 'all' : 'todo')}
              className={cn(
                "flex items-center gap-2 transition-opacity hover:opacity-70",
                activeStatusFilter !== 'all' && activeStatusFilter !== 'todo' && "opacity-30"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{stats.todo}</span>
              <span className="text-xs text-zinc-500">To do</span>
            </button>
            <button 
              onClick={() => setActiveStatusFilter(activeStatusFilter === 'in-progress' ? 'all' : 'in-progress')}
              className={cn(
                "flex items-center gap-2 transition-opacity hover:opacity-70",
                activeStatusFilter !== 'all' && activeStatusFilter !== 'in-progress' && "opacity-30"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{stats.inProgress}</span>
              <span className="text-xs text-zinc-500">In progress</span>
            </button>
            <button 
              onClick={() => setActiveStatusFilter(activeStatusFilter === 'done' ? 'all' : 'done')}
              className={cn(
                "flex items-center gap-2 transition-opacity hover:opacity-70",
                activeStatusFilter !== 'all' && activeStatusFilter !== 'done' && "opacity-30"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{stats.done}</span>
              <span className="text-xs text-zinc-500">Done</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => addTask()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto h-full space-y-8">
          
          {/* Progress and Filters Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-600 dark:text-blue-400">{stats.progress}% complete</span>
                  <span className="text-zinc-400">{stats.done} of {tasks.length} tasks</span>
                </div>
                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500 ease-out"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-transparent focus:bg-white dark:focus:bg-zinc-700 focus:border-zinc-200 dark:focus:border-zinc-600 rounded-full text-sm transition-all outline-none dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setActivePriorityFilter('all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  activePriorityFilter === 'all' 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" 
                    : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                All <span className="ml-1 opacity-50">{tasks.length}</span>
              </button>
              {(['urgent', 'high', 'medium', 'low'] as const).map((priority) => (
                <button 
                  key={priority}
                  onClick={() => setActivePriorityFilter(priority)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                    activePriorityFilter === priority 
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" 
                      : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    priority === 'urgent' ? 'bg-rose-500' : priority === 'high' ? 'bg-orange-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  )} />
                  <span className="capitalize">{priority}</span>
                  <span className="ml-1 opacity-50">{tasks.filter(t => t.priority === priority).length}</span>
                </button>
              ))}

              {(activePriorityFilter !== 'all' || activeStatusFilter !== 'all' || searchQuery) && (
                <button 
                  onClick={() => {
                    setActivePriorityFilter('all');
                    setActiveStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all border border-rose-100 dark:border-rose-500/20"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full min-h-[calc(100vh-12rem)]">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={filteredTasks.filter(t => t.status === col.id)}
                  onAddTask={addTask}
                  onEditTask={editTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <div className="w-[300px] rotate-3 scale-105 transition-transform">
                  <TaskCard 
                    task={activeTask} 
                    onEdit={() => {}} 
                    onDelete={() => {}} 
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-6 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-medium">
          <p>built by altamash for gdg submission</p>
          <div className="flex items-center gap-6">
            <a 
              href="https://linkedin.com/in/altamash-tariq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a 
              href="https://github.com/altamashtariq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </footer>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}
