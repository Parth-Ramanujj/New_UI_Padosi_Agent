import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Icon3DProps {
  Icon: LucideIcon;
  color: 'primary' | 'orange' | 'purple' | 'emerald' | 'amber' | 'indigo' | 'blue' | 'rose' | 'secondary' | 'accent' | 'claim' | 'review' | 'muted';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const colorMap = {
  primary: {
    icon: 'text-primary',
    gradient: 'from-primary/20 to-primary/5',
    shadow: 'shadow-primary/30',
    glow: 'bg-primary/25',
  },
  orange: {
    icon: 'text-orange-500',
    gradient: 'from-orange-500/20 to-orange-500/5',
    shadow: 'shadow-orange-500/30',
    glow: 'bg-orange-500/25',
  },
  purple: {
    icon: 'text-purple-500',
    gradient: 'from-purple-500/20 to-purple-500/5',
    shadow: 'shadow-purple-500/30',
    glow: 'bg-purple-500/25',
  },
  emerald: {
    icon: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    shadow: 'shadow-emerald-500/30',
    glow: 'bg-emerald-500/25',
  },
  amber: {
    icon: 'text-amber-500',
    gradient: 'from-amber-500/20 to-amber-500/5',
    shadow: 'shadow-amber-500/30',
    glow: 'bg-amber-500/25',
  },
  indigo: {
    icon: 'text-indigo-500',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    shadow: 'shadow-indigo-500/30',
    glow: 'bg-indigo-500/25',
  },
  blue: {
    icon: 'text-blue-500',
    gradient: 'from-blue-500/20 to-blue-500/5',
    shadow: 'shadow-blue-500/30',
    glow: 'bg-blue-500/25',
  },
  rose: {
    icon: 'text-rose-500',
    gradient: 'from-rose-500/20 to-rose-500/5',
    shadow: 'shadow-rose-500/30',
    glow: 'bg-rose-500/25',
  },
  secondary: {
    icon: 'text-secondary',
    gradient: 'from-secondary/20 to-secondary/5',
    shadow: 'shadow-secondary/30',
    glow: 'bg-secondary/25',
  },
  accent: {
    icon: 'text-accent',
    gradient: 'from-accent/20 to-accent/5',
    shadow: 'shadow-accent/30',
    glow: 'bg-accent/25',
  },
  claim: {
    icon: 'text-claim',
    gradient: 'from-claim/20 to-claim/5',
    shadow: 'shadow-claim/30',
    glow: 'bg-claim/25',
  },
  review: {
    icon: 'text-review',
    gradient: 'from-review/20 to-review/5',
    shadow: 'shadow-review/30',
    glow: 'bg-review/25',
  },
  muted: {
    icon: 'text-muted-foreground',
    gradient: 'from-muted-foreground/20 to-muted-foreground/5',
    shadow: 'shadow-muted-foreground/30',
    glow: 'bg-muted-foreground/25',
  }
};

const sizeMap = {
  xs: {
    container: 'w-8 h-8',
    icon: 'h-4 w-4',
    blur: 'blur-[6px]',
  },
  sm: {
    container: 'w-10 h-10',
    icon: 'h-5 w-5',
    blur: 'blur-[8px]',
  },
  md: {
    container: 'w-12 h-12',
    icon: 'h-6 w-6',
    blur: 'blur-[10px]',
  },
  lg: {
    container: 'w-14 h-14',
    icon: 'h-7 w-7',
    blur: 'blur-[12px]',
  },
  xl: {
    container: 'w-16 h-16',
    icon: 'h-8 w-8',
    blur: 'blur-[14px]',
  }
};

const Icon3D: React.FC<Icon3DProps> = ({ Icon, color, size = 'md', className = '', animate = false }) => {
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <div className={`relative group ${className}`}>
      {/* Bottom shadow/depth layer - smoother transitions */}
      <div 
        className={`absolute inset-0 ${sizes.container} ${colors.glow} ${sizes.blur} transform translate-y-2 rounded-full opacity-50 group-hover:opacity-70 group-hover:translate-y-2.5 transition-all duration-500 ease-out`}
      />
      
      {/* Middle glow layer - smoother */}
      <div 
        className={`absolute inset-0 ${sizes.container} ${colors.glow} ${sizes.blur} transform translate-y-1 rounded-full opacity-30 group-hover:opacity-50 transition-all duration-500 ease-out`}
      />
      
      {/* Gradient background circle - smoother */}
      <div 
        className={`absolute inset-0 ${sizes.container} bg-gradient-to-br ${colors.gradient} rounded-full transform group-hover:scale-105 transition-all duration-500 ease-out`}
      />
      
      {/* Main Icon - smoother hover */}
      <div 
        className={`relative ${sizes.container} flex items-center justify-center transform group-hover:-translate-y-0.5 group-hover:scale-105 transition-all duration-500 ease-out ${animate ? 'animate-float-gentle' : ''}`}
      >
        <Icon 
          className={`${sizes.icon} ${colors.icon} transition-all duration-500 ease-out`} 
          strokeWidth={2} 
          style={{
            filter: 'drop-shadow(0 3px 4px rgba(0, 0, 0, 0.08)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04))'
          }}
        />
      </div>
    </div>
  );
};

export default Icon3D;