import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, ArrowLeft, RefreshCw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteVersion } from '@/types/notebooks';

interface VersionHistoryProps {
  versions: NoteVersion[];
  currentVersion: number;
  onRestore: (version: NoteVersion) => void;
  onClose: () => void;
}

export function VersionHistory({
  versions = [],
  currentVersion,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Sort versions by version number (newest first)
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => b.version - a.version);
  }, [versions]);

  const handleRestore = () => {
    if (!selectedVersion) return;
    onRestore(selectedVersion);
    setIsRestoring(false);
    onClose();
  };

  if (isRestoring && selectedVersion) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Confirm Restore</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRestoring(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4 flex-1">
          <p className="text-sm">
            Are you sure you want to restore this version? This will create a new version with the
            restored content.
          </p>
          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Version {selectedVersion.version}</span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(selectedVersion.updatedAt), { addSuffix: true })}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {selectedVersion.changeSummary}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRestoring(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRestore}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Restore
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">Version History</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {versions.length} version{versions.length !== 1 ? 's' : ''} available
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedVersions.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">
              No versions available
            </div>
          ) : (
            sortedVersions.map((version) => (
              <button
                key={version.id}
                className={cn(
                  'w-full text-left p-3 rounded-md text-sm transition-colors',
                  selectedVersion?.id === version.id
                    ? 'bg-accent'
                    : 'hover:bg-accent/50',
                  version.version === currentVersion && 'border-l-2 border-primary'
                )}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span>Version {version.version}</span>
                    {version.version === currentVersion && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(version.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                {version.changeSummary && (
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {version.changeSummary}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      
      {selectedVersion && selectedVersion.version !== currentVersion && (
        <div className="p-3 border-t flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRestoring(true)}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restore this version
          </Button>
        </div>
      )}
    </div>
  );
}
