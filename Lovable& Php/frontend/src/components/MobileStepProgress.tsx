import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  required: boolean;
  complete: boolean;
}

interface MobileStepProgressProps {
  sections: Section[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

const MobileStepProgress: React.FC<MobileStepProgressProps> = ({
  sections,
  activeSection,
  onSectionClick,
}) => {
  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const completedCount = sections.filter(s => s.complete).length;
  const requiredCount = sections.filter(s => s.required).length;
  const completedRequiredCount = sections.filter(s => s.required && s.complete).length;

  return (
    <div className="sm:hidden">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={cn(
              "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              "touch-manipulation",
              idx === currentIndex
                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary/30"
                : section.complete
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label={`Go to ${section.title}`}
          >
            {section.complete && idx !== currentIndex ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <span className="text-xs font-bold">{idx + 1}</span>
            )}
            
            {/* Required indicator */}
            {section.required && !section.complete && idx !== currentIndex && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Current section info */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          {React.createElement(sections[currentIndex]?.icon, { 
            className: "h-4 w-4 text-primary" 
          })}
          <h3 className="font-semibold text-sm">
            {sections[currentIndex]?.title}
          </h3>
          {sections[currentIndex]?.required && (
            <span className="text-destructive text-xs">*</span>
          )}
        </div>
        
        {/* Swipe hint */}
        <p className="text-[10px] text-muted-foreground animate-pulse">
          ← Swipe to navigate →
        </p>
      </div>

      {/* Completion stats */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-muted">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">
            {completedRequiredCount}/{requiredCount}
          </p>
          <p className="text-[10px] text-muted-foreground">Required</p>
        </div>
        <div className="h-8 w-px bg-muted" />
        <div className="text-center">
          <p className="text-lg font-bold text-green-500">
            {completedCount}/{sections.length}
          </p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  );
};

export default MobileStepProgress;
