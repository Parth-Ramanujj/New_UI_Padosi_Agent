import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RotateCcw, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RestoreDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lastSavedTime: Date | null;
  onRestore: () => void;
  onDiscard: () => void;
}

const RestoreDraftDialog: React.FC<RestoreDraftDialogProps> = ({
  open,
  onOpenChange,
  lastSavedTime,
  onRestore,
  onDiscard,
}) => {
  const timeAgo = lastSavedTime 
    ? formatDistanceToNow(lastSavedTime, { addSuffix: true })
    : 'recently';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Restore Your Progress?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              We found a saved draft from <strong>{timeAgo}</strong>. 
              Would you like to continue where you left off?
            </p>
            <p className="text-xs text-muted-foreground">
              Your progress was automatically saved. Discarding will start fresh.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            onClick={onDiscard}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Start Fresh
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRestore}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restore Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreDraftDialog;
