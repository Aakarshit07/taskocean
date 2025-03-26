
import React, { useState } from 'react';
import { 
  Task, 
  TaskCategory, 
  TaskPriority, 
  TaskStatus,
  TaskTag,
  useTasks 
} from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon, X, Plus } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task;
  isEditing?: boolean;
}

const CATEGORY_OPTIONS: TaskCategory[] = [
  'work',
  'personal',
  'education',
  'health',
  'finance',
  'other'
];

const PRIORITY_OPTIONS: TaskPriority[] = [
  'low',
  'medium',
  'high'
];

const STATUS_OPTIONS: TaskStatus[] = [
  'todo',
  'in-progress',
  'completed'
];

// Predefined tags with colors
const PREDEFINED_TAGS: TaskTag[] = [
  { id: 'tag1', name: 'Important', color: '#EA4335' },
  { id: 'tag2', name: 'Urgent', color: '#FA7B17' },
  { id: 'tag3', name: 'Meeting', color: '#4285F4' },
  { id: 'tag4', name: 'Research', color: '#34A853' },
  { id: 'tag5', name: 'Documentation', color: '#A142F4' },
  { id: 'tag6', name: 'Planning', color: '#F44786' },
];

const TaskForm: React.FC<TaskFormProps> = ({ 
  isOpen, 
  onClose, 
  initialTask, 
  isEditing = false 
}) => {
  const { createTask, updateTask } = useTasks();
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || 'work');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'todo');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialTask?.dueDate);
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>(initialTask?.tags || []);
  const [newTagName, setNewTagName] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      category,
      priority,
      status,
      dueDate,
      tags: selectedTags,
      attachments: initialTask?.attachments || [],
    };
    
    if (isEditing && initialTask) {
      await updateTask(initialTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    
    onClose();
  };

  const handleAddTag = () => {
    if (newTagName.trim() === '') return;
    
    // Generate a random color
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#FA7B17', '#F44786'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newTag: TaskTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: randomColor
    };
    
    setSelectedTags([...selectedTags, newTag]);
    setNewTagName('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleTagSelect = (tag: TaskTag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      handleRemoveTag(tag.id);
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update your task details and preferences'
                : 'Fill in the details to create a new task'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as TaskCategory)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((pri) => (
                      <SelectItem key={pri} value={pri}>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as TaskStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="dueDate"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <div 
                    key={tag.id}
                    className="flex items-center rounded-full px-2 py-1"
                    style={{ backgroundColor: tag.color, color: '#fff' }}
                  >
                    <span className="text-xs">{tag.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4 rounded-full p-0 hover:bg-white/20"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                ))}

                {isAddingTag ? (
                  <div className="flex items-center">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag name"
                      className="h-7 w-32 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        } else if (e.key === 'Escape') {
                          setIsAddingTag(false);
                          setNewTagName('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-7 w-7"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsAddingTag(true)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Tag
                  </Button>
                )}
              </div>

              <div className="mt-2">
                <p className="mb-1 text-xs text-muted-foreground">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.filter(tag => !selectedTags.some(t => t.id === tag.id)).map(tag => (
                    <div 
                      key={tag.id}
                      className="cursor-pointer rounded-full px-2 py-1 text-xs hover:opacity-80"
                      style={{ backgroundColor: tag.color, color: '#fff' }}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
