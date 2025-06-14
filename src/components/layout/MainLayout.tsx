import { ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

type MainLayoutProps = {
  children?: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  // Prevent iOS bounce scroll
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <div className="min-h-screen min-h-dvh bg-background text-foreground">
        {/* Mobile-first full screen layout */}
        <main className="h-screen h-dvh flex flex-col">
          <div className="flex-1 overflow-auto safe-area-inset">
            {children || <Outlet />}
          </div>
        </main>
        <Toaster 
          position="top-center"
          expand={false}
          richColors
          closeButton
          toastOptions={{
            className: 'mobile-toast safe-top',
            style: {
              marginTop: 'env(safe-area-inset-top)',
            }
          }}
        />
      </div>
    </ThemeProvider>
  );
}
