import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

interface LicensedBadgeProps {
  variant?: 'default' | 'compact' | 'prominent';
  className?: string;
  themeColor?: 'primary' | 'secondary' | 'claim' | 'review' | 'accent';
  showDescription?: boolean;
}

const LicensedBadge: React.FC<LicensedBadgeProps> = ({ 
  variant = 'default', 
  className = '',
  themeColor = 'accent',
  showDescription = false,
}) => {
  const tooltipContent = "Licensed insurance agent — verified by our team with a valid license number";
  
  const getColorClasses = () => {
    switch (themeColor) {
      case 'secondary':
        return 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20';
      case 'claim':
        return 'bg-claim/10 text-claim border-claim/20 hover:bg-claim/20';
      case 'review':
        return 'bg-review/10 text-review border-review/20 hover:bg-review/20';
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
      case 'accent':
      default:
        return 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20';
    }
  };

  const getSizeClasses = () => {
    switch (variant) {
      case 'compact':
        return 'text-[10px] px-1.5 py-0.5';
      case 'prominent':
        return 'text-sm px-3 py-1.5';
      default:
        return 'text-xs px-2 py-0.5';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'h-2.5 w-2.5';
      case 'prominent':
        return 'h-4 w-4';
      default:
        return 'h-3 w-3';
    }
  };

  const badgeContent = (
    <Badge 
      className={`${getColorClasses()} ${getSizeClasses()} border font-medium transition-all duration-200 cursor-pointer group inline-flex items-center whitespace-nowrap ${className}`}
      aria-label="Licensed insurance agent — verified by our team"
    >
      <ShieldCheck className={`${getIconSize()} mr-1 transition-transform group-hover:scale-110 shrink-0`} />
      <span>Licensed Agent</span>
    </Badge>
  );

  if (showDescription) {
    return (
      <InfoTooltip content={tooltipContent}>
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 max-w-full">
          {badgeContent}
          <span className="text-[11px] sm:text-xs text-muted-foreground leading-snug break-words">
            Verified by our team
          </span>
        </span>
      </InfoTooltip>
    );
  }

  return (
    <InfoTooltip content={tooltipContent}>
      {badgeContent}
    </InfoTooltip>
  );
};

export default LicensedBadge;
