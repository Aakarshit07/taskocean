
import React from 'react';
import { Task, useTasks } from '@/contexts/TaskContext';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash, Edit, Clock, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showActions?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, showActions = true }) => {
  const { completeTask, deleteTask } = useTasks();

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    completeTask(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-task-red text-white';
      case 'medium':
        return 'bg-task-yellow text-black';
      case 'low':
        return 'bg-task-green text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-task-blue text-white';
      case 'personal':
        return 'bg-task-purple text-white';
      case 'education':
        return 'bg-task-green text-white';
      case 'health':
        return 'bg-task-pink text-white';
      case 'finance':
        return 'bg-task-orange text-white';
      default:
        return 'bg-task-yellow text-black';
    }
  };

  return (
    <div 
      className="task-card group cursor-pointer"
      onClick={handleEdit}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium leading-none">{task.title}</h3>
            {task.status === 'completed' && (
              <Badge variant="outline" className="bg-task-green text-white">
                Completed
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge className={getCategoryColor(task.category)}>
              {task.category}
            </Badge>
            
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            
            {task.tags.map(tag => (
              <Badge 
                key={tag.id} 
                style={{ backgroundColor: tag.color, color: '#fff' }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {showActions && task.status !== 'completed' && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleComplete}
                  >
                    <CheckCircle className="h-4 w-4 text-task-green" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as completed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit(task);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDelete}
                  >
                    <Trash className="h-4 w-4 text-task-red" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {task.dueDate && (
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          {task.status !== 'completed' ? (
            <>
              <Clock className="mr-1 h-3 w-3" />
              Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </>
          ) : (
            <>
              <Calendar className="mr-1 h-3 w-3" />
              Completed {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
            </>
          )}
        </div>
      )}
      
      {task.attachments.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {task.attachments.length} {task.attachments.length === 1 ? 'attachment' : 'attachments'}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
