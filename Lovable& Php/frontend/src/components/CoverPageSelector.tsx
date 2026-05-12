import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// 5 cover page options for agents
export const coverPageOptions = [
  {
    id: 'gradient-teal',
    name: 'Professional Teal',
    preview: 'bg-gradient-to-br from-primary via-primary-light to-accent',
    className: 'bg-gradient-to-br from-primary via-primary-light to-accent'
  },
  {
    id: 'gradient-navy',
    name: 'Corporate Navy',
    preview: 'bg-gradient-to-br from-secondary-dark via-secondary to-secondary-light',
    className: 'bg-gradient-to-br from-secondary-dark via-secondary to-secondary-light'
  },
  {
    id: 'gradient-forest',
    name: 'Forest Green',
    preview: 'bg-gradient-to-br from-accent-dark via-accent to-primary',
    className: 'bg-gradient-to-br from-accent-dark via-accent to-primary'
  },
  {
    id: 'gradient-warm',
    name: 'Warm Sunset',
    preview: 'bg-gradient-to-br from-claim-dark via-claim to-claim-light',
    className: 'bg-gradient-to-br from-claim-dark via-claim to-claim-light'
  },
  {
    id: 'gradient-royal',
    name: 'Royal Purple',
    preview: 'bg-gradient-to-br from-review-dark via-review to-review-light',
    className: 'bg-gradient-to-br from-review-dark via-review to-review-light'
  }
];

interface CoverPageSelectorProps {
  selectedCover: string;
  onSelect: (coverId: string) => void;
}

const CoverPageSelector: React.FC<CoverPageSelectorProps> = ({ selectedCover, onSelect }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Cover Page Style</h3>
      <p className="text-sm text-muted-foreground">Choose a background style for your profile header</p>
      <div className="grid grid-cols-5 gap-3">
        {coverPageOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "relative aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
              selectedCover === option.id 
                ? "border-primary ring-2 ring-primary/30" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn("absolute inset-0", option.preview)} />
            {selectedCover === option.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              </div>
            )}
            <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium text-center drop-shadow-md truncate">
              {option.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CoverPageSelector;
