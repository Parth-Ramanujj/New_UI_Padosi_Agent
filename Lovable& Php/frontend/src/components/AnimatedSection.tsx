import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  threshold?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  const animationClasses = {
    'fade-up': 'translate-y-6 opacity-0',
    'fade-left': 'translate-x-6 opacity-0',
    'fade-right': '-translate-x-6 opacity-0',
    'scale': 'scale-[0.97] opacity-0',
    'fade': 'opacity-0'
  };

  const visibleClasses = 'translate-y-0 translate-x-0 scale-100 opacity-100';

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isVisible ? visibleClasses : animationClasses[animation],
        className
      )}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        transitionDuration: '600ms'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
