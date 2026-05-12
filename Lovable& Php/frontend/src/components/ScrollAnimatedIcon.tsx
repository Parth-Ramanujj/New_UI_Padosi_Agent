import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ScrollAnimatedIconProps {
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
  onClick?: () => void;
}

const ScrollAnimatedIcon: React.FC<ScrollAnimatedIconProps> = ({
  icon: Icon,
  iconColor = 'text-primary',
  bgColor = 'bg-primary/10',
  size = 'md',
  delay = 0,
  className,
  onClick
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Add delay before triggering animation
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
          observer.unobserve(element);
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, hasAnimated]);

  const sizeClasses = {
    sm: 'p-2 h-5 w-5',
    md: 'p-3 md:p-4 h-6 w-6 md:h-7 md:w-7',
    lg: 'p-4 md:p-5 h-7 w-7 md:h-8 md:w-8'
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-3 md:p-4',
    lg: 'p-4 md:p-5'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6 md:h-7 md:w-7',
    lg: 'h-7 w-7 md:h-8 md:w-8'
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        `${bgColor} ${containerSizes[size]} rounded-full transition-all duration-500 ease-out`,
        'group-hover:scale-105 cursor-pointer tap-feedback',
        isVisible ? 'animate-bounce-in' : 'opacity-0 scale-75',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon 
        className={cn(
          iconSizes[size],
          iconColor,
          'transition-transform duration-500 ease-out',
          isVisible && 'group-hover:animate-wiggle-smooth'
        )} 
        strokeWidth={2} 
      />
    </div>
  );
};

export default ScrollAnimatedIcon;
