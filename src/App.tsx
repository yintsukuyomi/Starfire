import { Toaster as SonnerToaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { router } from '@/lib/router';

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <SonnerToaster position="top-right" richColors />
    </ThemeProvider>
  );
}

export default App;
