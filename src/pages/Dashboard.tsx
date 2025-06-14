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
  LucideIcon
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
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b safe-top">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshStats}
                className="h-10 w-10"
              >
                <TrendingUp className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {quickActions.map((action) => (
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            {/* Insights Grid */}
            <div className="grid gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={cn(
                    "bg-gradient-to-r rounded-xl p-4 text-white",
                    insight.gradient
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {React.createElement(insight.icon as LucideIcon, {
                          className: "h-6 w-6"
                        })}
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <p className="text-white/80 text-sm">{insight.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{insight.value}</div>
                      <div className="text-white/80 text-xs">{insight.unit}</div>
                      {insight.trend && (
                        <div className={cn(
                          "flex items-center text-xs font-medium mt-1",
                          insight.trend.isPositive ? "text-emerald-200" : "text-red-200"
                        )}>
                          {insight.trend.isPositive ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(insight.trend.value)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Notes"
                  value={stats.totalNotes}
                  subtitle={`${stats.totalNotes} total notes`}
                  icon={FileText}
                  color="from-blue-500/10 to-blue-600/5"
                  trend={{ value: 12, isPositive: true }}
                />
                
                <StatsCard
                  title="Tasks"
                  value={`${stats.completedTasks}/${stats.totalTasks}`}
                  subtitle={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% complete`}
                  icon={CheckSquare}
                  color="from-green-500/10 to-green-600/5"
                  trend={{ value: 8, isPositive: true }}
                />
                
                <StatsCard
                  title="Reading"
                  value={stats.readingBooks}
                  subtitle={`${stats.readingBooks} currently reading`}
                  icon={BookOpen}
                  color="from-purple-500/10 to-purple-600/5"
                />
                
                <StatsCard
                  title="Completed"
                  value={stats.completedBooks}
                  subtitle={`${stats.completedBooks} books finished`}
                  icon={Book}
                  color="from-orange-500/10 to-orange-600/5"
                  trend={{ value: 5, isPositive: true }}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/notebooks')}>
                  View All
                </Button>
              </div>
              
              <div className="bg-card rounded-xl border shadow-sm">
                {recentActivities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-foreground mb-2">No recent activity</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by creating a note, task, or adding a book
                    </p>
                    <Button onClick={() => navigate('/notebooks')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentActivities.map((activity) => (
                      <RecentActivityItem
                        key={activity.id}
                        type={activity.type}
                        title={activity.title}
                        subtitle={activity.subtitle || ''}
                        timestamp={activity.timestamp}
                        status={activity.status as 'completed' | 'in-progress' | 'pending'}
                        onClick={() => {
                          switch (activity.type) {
                            case 'note':
                              navigate('/notebooks');
                              break;
                            case 'task':
                              navigate('/tasks');
                              break;
                            case 'book':
                              navigate('/library');
                              break;
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
