
import React, { useState } from 'react';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import TaskForm from '@/components/tasks/TaskForm';
import TaskItem from '@/components/tasks/TaskItem';

const Calendar = () => {
  const { tasks, loading } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  // Get all dates that have tasks due
  const taskDates = tasks.reduce<{ [key: string]: number }>((dates, task) => {
    if (task.dueDate) {
      const dateStr = format(new Date(task.dueDate), 'yyyy-MM-dd');
      if (!dates[dateStr]) {
        dates[dateStr] = 0;
      }
      dates[dateStr]++;
    }
    return dates;
  }, {});

  // Filter tasks for the selected date
  const selectedDateTasks = selectedDate 
    ? tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
    : [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View your tasks by due date</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                // Highlight dates with tasks
                hasTasks: Object.keys(taskDates).map(date => new Date(date)),
              }}
              modifiersStyles={{
                hasTasks: {
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(66, 133, 244, 0.1)',
                }
              }}
              components={{
                DayContent: ({ date, ...props }) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const hasTask = taskDates[dateStr];
                  
                  return (
                    <div className="relative" {...props}>
                      {date.getDate()}
                      {hasTask && (
                        <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"></div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle>
              Tasks for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}
            </CardTitle>
            <CardDescription>
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} due on this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-4">
                {selectedDateTasks.map(task => (
                  <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-6 text-center">
                <p className="text-muted-foreground">No tasks due on this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialTask={editingTask}
        isEditing={!!editingTask}
      />
    </div>
  );
};

export default Calendar;
