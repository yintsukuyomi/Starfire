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
      className="rounded-2xl shadow-ios bg-gradient-to-br from-white/10 to-black/10 dark:from-black/30 dark:to-black/10 p-4 flex flex-col items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
      style={{ minHeight: 110 }}
    >
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-2 bg-white/20 dark:bg-black/20",
        color.includes('blue') && "bg-ios-blue/15",
        color.includes('green') && "bg-ios-green/15",
        color.includes('purple') && "bg-ios-purple/15",
        color.includes('orange') && "bg-ios-orange/15"
      )}>
        <Icon className={cn(
          "h-8 w-8",
          color.includes('blue') && "text-ios-blue",
          color.includes('green') && "text-ios-green",
          color.includes('purple') && "text-ios-purple",
          color.includes('orange') && "text-ios-orange"
        )} />
      </div>
      <h3 className="text-base font-bold text-foreground mb-0.5 text-center">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground text-center">{subtitle}</p>}
    </button>
  );
}
