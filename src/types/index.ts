export enum BookStatus {
  TO_READ = 'TO_READ',
  READING = 'READING',
  COMPLETED = 'COMPLETED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  supabaseId: string;
  createdAt: string;
  updatedAt: string;
  spotifyId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: Priority;
  category?: string | null;
  dueDate?: string | null;
  createdBy: string;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  coverUrl?: string | null;
  isbn?: string | null;
  googleId?: string | null;
  createdAt: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: BookStatus;
  rating?: number | null;
  notes?: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  book?: Book;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  spotifyId?: string | null;
  imageUrl?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
