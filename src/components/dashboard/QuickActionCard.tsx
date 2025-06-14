import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export function QuickActionCard({
  title,
  subtitle,
  icon: Icon,
  color,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all duration-200 hover:shadow-md active:scale-95",
        color
      )}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        color
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="rounded-lg bg-background/50 p-2 mb-3 inline-block">
          <Icon className="h-5 w-5 text-foreground/70" />
        </div>
        <h3 className="font-medium text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}
