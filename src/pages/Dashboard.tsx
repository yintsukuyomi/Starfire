import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckSquare, 
  Book, 
  BookOpen, 
  TrendingUp,
  Plus,
  Sparkles,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
  Bell,
  User
} from 'lucide-react';
import { useDashboardStore } from '../stores/useDashboardStore';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { RecentActivityItem } from '../components/dashboard/RecentActivityItem';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { PageLayout } from './PageLayout';

export function Dashboard() {
  const navigate = useNavigate();
  const {
    stats,
    recentActivities,
    quickActions,
    insights,
    isLoading,
    fetchDashboardData,
    refreshStats,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case '1': // New Note
        navigate('/notebooks');
        break;
      case '2': // Add Task
        navigate('/tasks');
        break;
      case '3': // Add Book
        navigate('/library');
        break;
      case '4': // Random Task
        // Implement random task logic
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ios-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ios-body text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* iOS-style large header */}
      <header className="ios-nav-bar ios-blur">
        <div className="px-6 pt-4 pb-4 flex flex-col">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-ios-large-title font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
        </div>
      </header>
      {/* Minimal Quick Actions */}
      <div className="flex-1 overflow-auto px-4 pt-8 flex flex-col items-center justify-start">
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {quickActions.slice(0, 3).map((action) => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon as LucideIcon}
              color={action.color}
              onClick={() => handleQuickAction(action.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
