import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

interface TrustedBadgeProps {
  variant?: 'compact' | 'default' | 'prominent';
  className?: string;
}

const TrustedBadge: React.FC<TrustedBadgeProps> = ({ variant = 'default', className = '' }) => {
  const sizeClasses = {
    compact: 'text-[9px] px-1.5 py-0.5 gap-0.5',
    default: 'text-[11px] sm:text-xs px-2 py-1 gap-1',
    prominent: 'text-sm px-3 py-1.5 gap-1.5',
  };

  const iconSize = {
    compact: 'h-2.5 w-2.5',
    default: 'h-3.5 w-3.5',
    prominent: 'h-4 w-4',
  };

  return (
    <InfoTooltip content="Trusted Professional — This agent has a Professional subscription, indicating a higher level of commitment and service quality.">
      <Badge
        className={`bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 font-bold cursor-pointer transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/30 ${sizeClasses[variant]} ${className}`}
      >
        <BadgeCheck className={`${iconSize[variant]} text-white drop-shadow-sm`} />
        <span className="drop-shadow-sm tracking-wide">Trusted</span>
      </Badge>
    </InfoTooltip>
  );
};

export default TrustedBadge;
