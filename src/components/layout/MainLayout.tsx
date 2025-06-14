import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

type MainLayoutProps = {
  children?: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-8">
          {children || <Outlet />}
        </main>
        <Toaster position="top-center" />
      </div>
    </ThemeProvider>
  );
}
