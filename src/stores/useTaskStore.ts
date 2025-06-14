import { create } from 'zustand';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  categories: string[];
  selectedCategory: string | null;
  
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'creator' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  getRandomTask: () => Task | null;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  categories: [],
  selectedCategory: null,

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/tasks');
      const tasks = await response.json();
      
      // Extract unique categories
      const categories = [...new Set(
        tasks
          .map((task: Task) => task.category)
          .filter((category: string | undefined): category is string => Boolean(category))
      )] as string[];
      
      set({ tasks, categories });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const task = await response.json();
      
      set(state => ({
        tasks: [task, ...state.tasks],
        categories: taskData.category && !state.categories.includes(taskData.category)
          ? [...state.categories, taskData.category]
          : state.categories
      }));
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedTask = await response.json();
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? updatedTask : task
        )
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  deleteTask: async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },

  toggleTask: async (id: string) => {
    const { tasks, updateTask } = get();
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  getRandomTask: () => {
    const { tasks } = get();
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    if (incompleteTasks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * incompleteTasks.length);
    return incompleteTasks[randomIndex];
  },
}));
