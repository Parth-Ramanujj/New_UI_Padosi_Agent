import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Sparkles, ArrowRight, X } from 'lucide-react';

interface IncompleteProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  completionPercentage: number;
  missingItems: string[];
}

const IncompleteProfilePopup: React.FC<IncompleteProfilePopupProps> = ({
  isOpen,
  onClose,
  completionPercentage,
  missingItems,
}) => {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    onClose();
    navigate('/agent-profile-setup');
  };

  const handleLater = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
              <DialogDescription className="mt-1">
                Improve your visibility to potential clients
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile Completion</span>
              <span className="text-primary font-bold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          {/* Benefits message */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">
                  Complete profiles get 5x more leads!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agents with 100% complete profiles appear higher in search results and receive more client inquiries.
                </p>
              </div>
            </div>
          </div>

          {/* Missing items */}
          {missingItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Missing items:</p>
              <ul className="space-y-1">
                {missingItems.slice(0, 4).map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
                {missingItems.length > 4 && (
                  <li className="text-sm text-muted-foreground">
                    +{missingItems.length - 4} more items
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleLater} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-1" />
            Remind Me Later
          </Button>
          <Button onClick={handleCompleteProfile} className="w-full sm:w-auto">
            Complete Profile
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncompleteProfilePopup;
