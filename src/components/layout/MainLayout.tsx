import { ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';

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
    <div className="min-h-screen min-h-dvh bg-background text-foreground">
      {/* Mobile-first full screen layout */}
      <main className="h-screen h-dvh flex flex-col pb-16">
        <div className="flex-1 overflow-auto safe-area-inset">
          {children || <Outlet />}
        </div>
      </main>
      {/* iOS-style bottom tab bar */}
      <Navigation />
    </div>
  );
}
