import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Plus, ListFilter, Search, Grid, List } from 'lucide-react';
import TaskItem from '@/components/tasks/TaskItem';
import TaskForm from '@/components/tasks/TaskForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const Tasks = () => {
  const { tasks, loading, getTasksByStatus } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<{
    todo: Task[];
    'in-progress': Task[];
    completed: Task[];
  }>({
    todo: [],
    'in-progress': [],
    completed: []
  });

  useEffect(() => {
    const filterTasks = () => {
      const todo = getTasksByStatus('todo').filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      const inProgress = getTasksByStatus('in-progress').filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      const completed = getTasksByStatus('completed').filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setFilteredTasks({
        todo,
        'in-progress': inProgress,
        completed
      });
    };
    
    filterTasks();
  }, [tasks, searchQuery, getTasksByStatus]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== status) {
      const { moveTask } = useTasks();
      moveTask(taskId, status);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and organize your tasks</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ListFilter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  By Category
                </DropdownMenuItem>
                <DropdownMenuItem>
                  By Priority
                </DropdownMenuItem>
                <DropdownMenuItem>
                  By Due Date
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-md border border-input">
            <Button
              variant={view === 'board' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setView('board')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            className="glass rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'todo')}
          >
            <h2 className="mb-4 text-lg font-semibold">To Do</h2>
            <div className="space-y-4">
              {filteredTasks.todo.length > 0 ? (
                filteredTasks.todo.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <motion.div
                      layoutId={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TaskItem task={task} onEdit={handleEditTask} />
                    </motion.div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-6 text-center">
                  <p className="text-muted-foreground">No tasks to do</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div
            className="glass rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'in-progress')}
          >
            <h2 className="mb-4 text-lg font-semibold">In Progress</h2>
            <div className="space-y-4">
              {filteredTasks['in-progress'].length > 0 ? (
                filteredTasks['in-progress'].map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <motion.div
                      layoutId={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TaskItem task={task} onEdit={handleEditTask} />
                    </motion.div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-6 text-center">
                  <p className="text-muted-foreground">No tasks in progress</p>
                </div>
              )}
            </div>
          </div>

          <div
            className="glass rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'completed')}
          >
            <h2 className="mb-4 text-lg font-semibold">Completed</h2>
            <div className="space-y-4">
              {filteredTasks.completed.length > 0 ? (
                filteredTasks.completed.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <motion.div
                      layoutId={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TaskItem task={task} onEdit={handleEditTask} />
                    </motion.div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-6 text-center">
                  <p className="text-muted-foreground">No completed tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass space-y-4 rounded-lg p-4">
          <h2 className="text-lg font-semibold">All Tasks</h2>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks
                .filter(task => 
                  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .sort((a, b) => {
                  const statusOrder = { 'todo': 0, 'in-progress': 1, 'completed': 2 };
                  const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                  if (statusDiff !== 0) return statusDiff;
                  
                  if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  } else if (a.dueDate) {
                    return -1;
                  } else if (b.dueDate) {
                    return 1;
                  }
                  
                  return a.createdAt.getTime() - b.createdAt.getTime();
                })
                .map(task => (
                  <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
                ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-6 text-center">
                <p className="text-muted-foreground">No tasks found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialTask={editingTask}
        isEditing={!!editingTask}
      />
    </div>
  );
};

export default Tasks;
