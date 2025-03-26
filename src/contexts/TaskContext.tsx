
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  writeBatch,
  serverTimestamp
} from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

export type TaskCategory = 'work' | 'personal' | 'education' | 'health' | 'finance' | 'other';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskHistory {
  id: string;
  timestamp: Date;
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'moved';
  details?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: TaskTag[];
  history: TaskHistory[];
  attachments: TaskAttachment[];
  order: number;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'history' | 'order'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteMultipleTasks: (ids: string[]) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>;
  getTags: () => TaskTag[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  reorderTasks: (taskId: string, sourceStatus: TaskStatus, destinationStatus: TaskStatus, newOrder: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const tasksData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
            history: data.history ? data.history.map((h: any) => ({
              ...h,
              timestamp: h.timestamp ? h.timestamp.toDate() : new Date()
            })) : [],
            attachments: data.attachments ? data.attachments.map((a: any) => ({
              ...a,
              uploadedAt: a.uploadedAt ? a.uploadedAt.toDate() : new Date()
            })) : [],
          } as Task;
        });
        
        setTasks(tasksData.sort((a, b) => a.order - b.order));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
        toast.error("Failed to load tasks");
      }
    );
    
    return unsubscribe;
  }, [currentUser]);

  const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'history' | 'order'>) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      // Find the highest order number for tasks with the same status
      const tasksWithSameStatus = tasks.filter(t => t.status === task.status);
      const highestOrder = tasksWithSameStatus.reduce((max, t) => Math.max(max, t.order), -1);
      
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: 'created' as const,
      };
      
      await addDoc(collection(db, 'tasks'), {
        ...task,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        history: [historyEntry],
        order: highestOrder + 1,
      });
      
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
      toast.error("Failed to create task");
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const taskRef = doc(db, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      
      if (!task) throw new Error("Task not found");
      
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: 'updated' as const,
        details: Object.keys(updates).join(', ')
      };
      
      // Add the new history entry to the history array
      const updatedHistory = [...task.history, historyEntry];
      
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        history: updatedHistory,
      });
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      await deleteDoc(doc(db, 'tasks', id));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
      toast.error("Failed to delete task");
    }
  };

  const deleteMultipleTasks = async (ids: string[]) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const batch = writeBatch(db);
      
      ids.forEach(id => {
        const taskRef = doc(db, 'tasks', id);
        batch.delete(taskRef);
      });
      
      await batch.commit();
      toast.success(`${ids.length} tasks deleted successfully`);
    } catch (error) {
      console.error("Error deleting multiple tasks:", error);
      setError("Failed to delete tasks. Please try again.");
      toast.error("Failed to delete tasks");
    }
  };

  const completeTask = async (id: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const taskRef = doc(db, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      
      if (!task) throw new Error("Task not found");
      
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: 'completed' as const,
      };
      
      const updatedHistory = [...task.history, historyEntry];
      
      await updateDoc(taskRef, {
        status: 'completed',
        updatedAt: serverTimestamp(),
        history: updatedHistory,
      });
      
      toast.success("Task marked as completed");
    } catch (error) {
      console.error("Error completing task:", error);
      setError("Failed to complete task. Please try again.");
      toast.error("Failed to complete task");
    }
  };

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const taskRef = doc(db, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      
      if (!task) throw new Error("Task not found");
      
      // Find the highest order number for tasks with the new status
      const tasksWithNewStatus = tasks.filter(t => t.status === newStatus);
      const highestOrder = tasksWithNewStatus.reduce((max, t) => Math.max(max, t.order), -1);
      
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: 'moved' as const,
        details: `from ${task.status} to ${newStatus}`
      };
      
      const updatedHistory = [...task.history, historyEntry];
      
      await updateDoc(taskRef, {
        status: newStatus,
        order: highestOrder + 1,
        updatedAt: serverTimestamp(),
        history: updatedHistory,
      });
      
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      console.error("Error moving task:", error);
      setError("Failed to move task. Please try again.");
      toast.error("Failed to move task");
    }
  };

  const reorderTasks = async (
    taskId: string, 
    sourceStatus: TaskStatus, 
    destinationStatus: TaskStatus, 
    newOrder: number
  ) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const batch = writeBatch(db);
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) throw new Error("Task not found");
      
      // If the status is changing, we need to update it
      if (sourceStatus !== destinationStatus) {
        const historyEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          action: 'moved' as const,
          details: `from ${sourceStatus} to ${destinationStatus}`
        };
        
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, {
          status: destinationStatus,
          order: newOrder,
          updatedAt: serverTimestamp(),
          history: [...task.history, historyEntry],
        });
      } else {
        // Just update the order
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, {
          order: newOrder,
          updatedAt: serverTimestamp(),
        });
      }
      
      // Update the order of all other affected tasks
      const affectedTasks = tasks.filter(t => 
        t.id !== taskId && 
        t.status === destinationStatus && 
        t.order >= newOrder
      );
      
      affectedTasks.forEach(t => {
        const ref = doc(db, 'tasks', t.id);
        batch.update(ref, {
          order: t.order + 1,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error reordering tasks:", error);
      setError("Failed to reorder tasks. Please try again.");
      toast.error("Failed to reorder tasks");
    }
  };

  const getTags = () => {
    // Get unique tags from all tasks
    const allTags: TaskTag[] = [];
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        if (!allTags.some(t => t.id === tag.id)) {
          allTags.push(tag);
        }
      });
    });
    return allTags;
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const value = {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    deleteMultipleTasks,
    completeTask,
    moveTask,
    getTags,
    getTasksByStatus,
    reorderTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
