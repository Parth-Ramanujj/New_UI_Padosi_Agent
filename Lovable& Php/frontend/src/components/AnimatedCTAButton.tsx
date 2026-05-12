import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { useWizard } from '@/contexts/WizardContext';

interface AnimatedCTAButtonProps {
  onClick?: () => void;
  href?: string; // New prop for agent page navigation with loader
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'claim' | 'review' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulseOnView?: boolean;
}

const AnimatedCTAButton: React.FC<AnimatedCTAButtonProps> = ({
  onClick,
  href,
  children,
  icon: Icon = ArrowRight,
  variant = 'primary',
  size = 'md',
  className,
  pulseOnView = true
}) => {
  const { openWizard } = useWizard();
  const ref = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !pulseOnView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [pulseOnView, hasAnimated]);

  const variantClasses = {
    primary: 'bg-primary hover:bg-accent active:bg-accent text-white',
    claim: 'bg-claim hover:bg-accent active:bg-accent text-white',
    review: 'bg-review hover:bg-accent active:bg-accent text-white',
    secondary: 'bg-secondary hover:bg-accent active:bg-accent text-white'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm md:text-base',
    lg: 'px-8 py-4 text-base md:text-lg'
  };
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Open wizard instead of direct navigation
      openWizard();
    }
  };

  return (
    <Button
      ref={ref}
      onClick={handleClick}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'font-bold h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out',
        'cta-glow cta-ripple tap-feedback group relative overflow-hidden',
        'animate-pulse-glow',
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <Icon className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 ease-out group-hover:translate-x-1" />
      </span>
    </Button>
  );
};

export default AnimatedCTAButton;
