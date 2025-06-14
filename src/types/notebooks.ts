export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId: string | null;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  tags: string[];
  folderId: string | null;
  isArchived: boolean;
  isPinned: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
  changeSummary: string;
}
