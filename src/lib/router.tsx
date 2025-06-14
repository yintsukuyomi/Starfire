import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Notebooks } from '@/pages/Notebooks';
import { Library } from '@/pages/Library';
import { Tasks } from '@/pages/Tasks';
import { Playlist } from '@/pages/Playlist';
import { Messages } from '@/pages/Messages';
import { TimeCapsule } from '@/pages/TimeCapsule';
import { MemoryTree } from '@/pages/MemoryTree';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'notebooks',
        element: <Notebooks />,
      },
      {
        path: 'library',
        element: <Library />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'playlist',
        element: <Playlist />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'time-capsule',
        element: <TimeCapsule />,
      },
      {
        path: 'memory-tree',
        element: <MemoryTree />,
      },
    ],
  },
]);
