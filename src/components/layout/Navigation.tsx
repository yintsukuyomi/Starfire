import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Notebooks', path: '/notebooks' },
  { name: 'Library', path: '/library' },
  { name: 'Tasks', path: '/tasks' },
  { name: 'Playlist', path: '/playlist' },
  { name: 'Messages', path: '/messages' },
  { name: 'Time Capsule', path: '/time-capsule' },
  { name: 'Memory Tree', path: '/memory-tree' },
];

export function Navigation() {
  const { pathname } = useLocation();

  return (
    <nav className="mb-8 border-b border-border pb-4">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={pathname === item.path ? 'default' : 'ghost'}
            className={cn(
              'transition-colors',
              pathname === item.path ? 'bg-primary/90' : 'hover:bg-accent/50'
            )}
          >
            <Link to={item.path}>{item.name}</Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
