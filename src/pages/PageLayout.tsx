import { ReactNode } from 'react';
import { Navigation } from '../components/layout/Navigation';

type PageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      <Navigation />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
