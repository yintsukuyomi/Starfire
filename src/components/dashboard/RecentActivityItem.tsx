import { FileText, CheckSquare, Book, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RecentActivityItemProps {
  type: 'note' | 'task' | 'book';
  title: string;
  subtitle: string;
  timestamp: string;
  status?: 'completed' | 'in-progress' | 'pending';
  onClick: () => void;
}

export function RecentActivityItem({
  type,
  title,
  subtitle,
  timestamp,
  status,
  onClick,
}: RecentActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'note':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case 'book':
        return <Book className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-ios-blue dark:text-ios-blue';
      case 'in-progress':
        return 'text-ios-orange dark:text-ios-orange';
      case 'pending':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex items-start space-x-4">
        <div className="rounded-lg bg-muted/50 p-2">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-foreground truncate">
              {title}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {timestamp}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground truncate">
            {subtitle}
          </p>
          
          {status && (
            <div className={cn(
              "inline-flex items-center text-xs font-medium mt-2",
              getStatusColor()
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
