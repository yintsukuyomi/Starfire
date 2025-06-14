export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId: string | null;
  createdAt: string;  // Changed from Date to string for ISO dates
  updatedAt: string;  // Changed from Date to string for ISO dates
  version: number;
  isArchived: boolean;
  isPinned: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;  // Changed from Date to string for ISO dates
  updatedAt: string;  // Changed from Date to string for ISO dates
}

export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  tags: string[];
  folderId?: string;
  isArchived: boolean;
  isPinned: boolean;
  version: number;
  updatedBy?: string;
  updatedAt: string;
  changeSummary?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;  // Changed from Date to string for ISO dates
  updatedAt: string;  // Changed from Date to string for ISO dates
}
