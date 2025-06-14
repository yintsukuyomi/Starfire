import { Folder, Plus, MoreVertical, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface FolderListProps {
  folders: {
    id: string;
    name: string;
    parentId: string | null;
    noteCount: number;
  }[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: () => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function FolderList({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  searchQuery = '',
  onSearchChange,
}: FolderListProps) {
  // Get root folders (no parent)
  const rootFolders = folders.filter(folder => !folder.parentId);

  // Get child folders for a parent
  const getChildFolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const renderFolder = (folder: typeof folders[0], level = 0) => {
    const childFolders = getChildFolders(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className={cn(
            "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/50",
            isSelected && "bg-accent text-accent-foreground"
          )}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <button
            className="flex items-center flex-1 text-left"
            onClick={() => onSelectFolder(folder.id)}
          >
            <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate">{folder.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({folder.noteCount})
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRenameFolder(folder.id)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteFolder(folder.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {childFolders.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateFolder}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-1">
          {rootFolders.map(folder => renderFolder(folder))}
        </div>
      </ScrollArea>
    </div>
  );
} 