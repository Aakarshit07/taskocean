
import React from 'react';
import { useTasks, TaskStatus } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, ListTodo, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TaskItem from '@/components/tasks/TaskItem';

const Dashboard = () => {
  const { tasks, loading } = useTasks();

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) > new Date() && task.status !== 'completed';
  }).length;
  
  // Get upcoming tasks (due in the next 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const upcomingTasksList = tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= threeDaysFromNow && dueDate >= new Date() && task.status !== 'completed';
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  // Get recently completed tasks
  const recentlyCompletedTasks = tasks
    .filter(task => task.status === 'completed')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  // Get tasks by status for the small preview
  const todoTasks = tasks
    .filter(task => task.status === 'todo')
    .slice(0, 3);
  
  const inProgressTasks = tasks
    .filter(task => task.status === 'in-progress')
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your tasks overview at a glance</p>
      </header>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'todo').length} todo, {tasks.filter(t => t.status === 'in-progress').length} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks > 0 
                ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate` 
                : 'No tasks completed yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingTasks > 0 
                ? 'Tasks due soon' 
                : 'No upcoming deadlines'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(tasks.map(task => task.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different task categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming tasks */}
        <Card className="glass col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 3 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasksList.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasksList.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {upcomingTasks > 5 && (
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/tasks">
                      View all {upcomingTasks} upcoming tasks
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No upcoming tasks</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/tasks">Create a new task</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status columns preview */}
        <Card className="glass col-span-3">
          <CardHeader>
            <CardTitle>Task Board Preview</CardTitle>
            <CardDescription>Your current task workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">To Do</h3>
                {todoTasks.length > 0 ? (
                  <div className="space-y-2">
                    {todoTasks.map(task => (
                      <div key={task.id} className="rounded-md bg-secondary p-2 text-sm">
                        {task.title}
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'todo').length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link to="/tasks">
                          +{tasks.filter(t => t.status === 'todo').length - 3} more
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="rounded-md bg-secondary p-2 text-center text-sm text-muted-foreground">
                    No tasks
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">In Progress</h3>
                {inProgressTasks.length > 0 ? (
                  <div className="space-y-2">
                    {inProgressTasks.map(task => (
                      <div key={task.id} className="rounded-md bg-secondary p-2 text-sm">
                        {task.title}
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'in-progress').length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link to="/tasks">
                          +{tasks.filter(t => t.status === 'in-progress').length - 3} more
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="rounded-md bg-secondary p-2 text-center text-sm text-muted-foreground">
                    No tasks
                  </p>
                )}
              </div>
            </div>

            <Button className="mt-4 w-full" asChild>
              <Link to="/tasks">Go to Task Board</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recently completed */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Recently Completed</CardTitle>
          <CardDescription>Your latest achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {recentlyCompletedTasks.length > 0 ? (
            <div className="space-y-4">
              {recentlyCompletedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {completedTasks > 3 && (
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/completed">
                    View all {completedTasks} completed tasks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No completed tasks yet</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/tasks">Start completing tasks</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
