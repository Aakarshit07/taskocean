
import React, { useState } from 'react';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Trash, RefreshCw } from 'lucide-react';
import TaskItem from '@/components/tasks/TaskItem';
import TaskForm from '@/components/tasks/TaskForm';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Completed = () => {
  const { tasks, loading, deleteMultipleTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const completedTasks = tasks
    .filter(task => task.status === 'completed')
    .filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleClearCompleted = async () => {
    const completedTaskIds = completedTasks.map(task => task.id);
    await deleteMultipleTasks(completedTaskIds);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading completed tasks...</p>
        </div>
      </div>
    );
  }

  // Group completed tasks by completion date
  const groupedTasks: { [key: string]: Task[] } = {};
  completedTasks.forEach(task => {
    const dateKey = format(task.updatedAt, 'PP');
    if (!groupedTasks[dateKey]) {
      groupedTasks[dateKey] = [];
    }
    groupedTasks[dateKey].push(task);
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Completed Tasks</h1>
          <p className="text-muted-foreground">Your accomplished tasks</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search completed tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {completedTasks.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Completed Tasks</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all completed tasks. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCompleted}>
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {completedTasks.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([date, tasks]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-medium">{date}</h2>
              </div>
              
              <div className="space-y-4">
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass flex flex-col items-center justify-center rounded-lg p-12 text-center">
          <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-medium">No completed tasks</h2>
          <p className="mt-2 text-muted-foreground">
            Tasks you complete will appear here for your reference
          </p>
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

export default Completed;
