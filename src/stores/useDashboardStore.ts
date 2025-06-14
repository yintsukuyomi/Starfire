import { create } from 'zustand';
import { FileText, CheckSquare, Book, Sparkles, Clock, Plus, Dice1 } from 'lucide-react';

interface DashboardStats {
  totalNotes: number;
  totalTasks: number;
  completedTasks: number;
  totalBooks: number;
  readingBooks: number;
  completedBooks: number;
  focusTime: number;
  streak: number;
  productivityScore: number;
}

interface RecentActivity {
  id: string;
  type: 'note' | 'task' | 'book';
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: string;
  icon?: any;
  color?: string;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  color: string;
  gradient: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  value: number | string;
  unit: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  icon: any;
}

interface DashboardState {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  addQuickAction: (action: QuickAction) => void;
  removeQuickAction: (id: string) => void;
  refreshStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: {
    totalNotes: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalBooks: 0,
    readingBooks: 0,
    completedBooks: 0,
    focusTime: 0,
    streak: 0,
    productivityScore: 0,
  },
  recentActivities: [],
  quickActions: [],
  insights: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalNotes: 24,
        totalTasks: 18,
        completedTasks: 12,
        totalBooks: 8,
        readingBooks: 3,
        completedBooks: 5,
        focusTime: 4.2,
        streak: 7,
        productivityScore: 85,
      };

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'note',
          title: 'Meeting Notes',
          subtitle: 'Project discussion with team',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          icon: FileText,
          color: 'text-blue-500',
        },
        {
          id: '2',
          type: 'task',
          title: 'Review PR',
          subtitle: 'Frontend improvements',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'completed',
          icon: CheckSquare,
          color: 'text-green-500',
        },
        {
          id: '3',
          type: 'book',
          title: 'Clean Code',
          subtitle: 'Robert C. Martin',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          status: 'reading',
          icon: Book,
          color: 'text-purple-500',
        },
        {
          id: '4',
          type: 'note',
          title: 'Ideas for App',
          subtitle: 'Feature brainstorming',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          icon: Sparkles,
          color: 'text-yellow-500',
        },
      ];

      const mockQuickActions: QuickAction[] = [
        {
          id: '1',
          title: 'New Note',
          subtitle: 'Quick note',
          icon: FileText,
          action: () => {/* Navigate to notes */},
          color: 'from-blue-500 to-blue-600',
          gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
          id: '2',
          title: 'Add Task',
          subtitle: 'To-do item',
          icon: CheckSquare,
          action: () => {/* Navigate to tasks */},
          color: 'from-green-500 to-green-600',
          gradient: 'bg-gradient-to-br from-green-500 to-green-600',
        },
        {
          id: '3',
          title: 'Add Book',
          subtitle: 'Reading list',
          icon: Book,
          action: () => {/* Navigate to library */},
          color: 'from-purple-500 to-purple-600',
          gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
        {
          id: '4',
          title: 'Random Task',
          subtitle: 'Pick one for me',
          icon: Dice1,
          action: () => {/* Get random task */},
          color: 'from-orange-500 to-orange-600',
          gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
        },
      ];

      const mockInsights: Insight[] = [
        {
          id: '1',
          title: 'Productivity Streak',
          description: 'You\'re on a roll!',
          value: 7,
          unit: 'days',
          trend: { value: 2, isPositive: true },
          gradient: 'from-emerald-500 to-emerald-600',
          icon: Sparkles,
        },
        {
          id: '2',
          title: 'Focus Time',
          description: 'Deep work sessions',
          value: 4.2,
          unit: 'hours',
          trend: { value: 0.8, isPositive: true },
          gradient: 'from-violet-500 to-violet-600',
          icon: Clock,
        },
      ];

      set({
        stats: mockStats,
        recentActivities: mockActivities,
        quickActions: mockQuickActions,
        insights: mockInsights,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard data', isLoading: false });
    }
  },

  addQuickAction: (action) => {
    set((state) => ({
      quickActions: [...state.quickActions, action],
    }));
  },

  removeQuickAction: (id) => {
    set((state) => ({
      quickActions: state.quickActions.filter((action) => action.id !== id),
    }));
  },

  refreshStats: async () => {
    const { fetchDashboardData } = get();
    await fetchDashboardData();
  },
}));
