import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl border p-4",
      color
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">{title}</h3>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-xs font-medium",
            trend.isPositive ? "text-emerald-500" : "text-red-500"
          )}>
            {trend.isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
