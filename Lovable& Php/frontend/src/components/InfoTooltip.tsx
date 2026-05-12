import React, { useState, useEffect, useRef, useLayoutEffect, useId } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

// Global state for managing active tooltip - only one tooltip can be open at a time
let activeTooltipCloseCallback: (() => void) | null = null;
let currentActiveTooltipId: string | null = null;

const setGlobalActiveTooltip = (id: string | null, closeCallback: () => void) => {
  // Close previous tooltip if different
  if (activeTooltipCloseCallback && currentActiveTooltipId !== id) {
    activeTooltipCloseCallback();
  }
  activeTooltipCloseCallback = closeCallback;
  currentActiveTooltipId = id;
};

interface InfoTooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

interface TooltipPosition {
  horizontal: 'left' | 'center' | 'right';
  vertical: 'top' | 'bottom';
  arrowOffset: number;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ children, content, className = '' }) => {
  const isMobile = useIsMobile();
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition>({ 
    horizontal: 'center', 
    vertical: 'top',
    arrowOffset: 50 
  });

  // Handle global tooltip management
  const handleOpen = () => {
    setGlobalActiveTooltip(tooltipId, () => setIsOpen(false));
    setIsOpen(true);
  };

  const handleClose = () => {
    if (currentActiveTooltipId === tooltipId) {
      currentActiveTooltipId = null;
      activeTooltipCloseCallback = null;
    }
    setIsOpen(false);
  };

  // Auto-close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;
    
    const handleScroll = () => {
      handleClose();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    // Delay adding listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Calculate optimal position to avoid screen edge overflow
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // max-w-[200px]
    const padding = 8; // minimum distance from screen edge
    const screenWidth = window.innerWidth;

    // Calculate horizontal position
    let horizontal: 'left' | 'center' | 'right' = 'center';
    let arrowOffset = 50; // percentage from left

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const tooltipHalfWidth = tooltipWidth / 2;

    // Check left overflow
    if (triggerCenterX - tooltipHalfWidth < padding) {
      horizontal = 'left';
      const tooltipLeft = padding;
      arrowOffset = Math.max(10, Math.min(90, ((triggerCenterX - tooltipLeft) / tooltipWidth) * 100));
    }
    // Check right overflow
    else if (triggerCenterX + tooltipHalfWidth > screenWidth - padding) {
      horizontal = 'right';
      const tooltipRight = screenWidth - padding;
      const tooltipLeft = tooltipRight - tooltipWidth;
      arrowOffset = Math.max(10, Math.min(90, ((triggerCenterX - tooltipLeft) / tooltipWidth) * 100));
    }

    // Calculate vertical position - show below if not enough space above
    const vertical: 'top' | 'bottom' = triggerRect.top < 80 ? 'bottom' : 'top';

    setPosition({ horizontal, vertical, arrowOffset });
  }, [isOpen]);

  // Get tooltip classes based on position
  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 px-2.5 py-1.5 bg-foreground/95 backdrop-blur-sm text-background text-[10px] font-normal rounded-md shadow-lg max-w-[200px] text-center leading-normal animate-in fade-in-0 zoom-in-95 pointer-events-none";
    
    let positionClasses = '';
    
    // Vertical positioning
    if (position.vertical === 'top') {
      positionClasses += ' bottom-full mb-2';
    } else {
      positionClasses += ' top-full mt-2';
    }
    
    // Horizontal positioning
    if (position.horizontal === 'center') {
      positionClasses += ' left-1/2 -translate-x-1/2';
    } else if (position.horizontal === 'left') {
      positionClasses += ' left-0 -translate-x-0';
    } else {
      positionClasses += ' right-0 translate-x-0';
    }
    
    return `${baseClasses}${positionClasses}`;
  };

  // Get arrow classes and style
  const getArrowStyle = () => {
    if (position.vertical === 'top') {
      return {
        className: "absolute top-full border-4 border-transparent border-t-foreground/95",
        style: { left: `${position.arrowOffset}%`, transform: 'translateX(-50%)' }
      };
    } else {
      return {
        className: "absolute bottom-full border-4 border-transparent border-b-foreground/95",
        style: { left: `${position.arrowOffset}%`, transform: 'translateX(-50%)' }
      };
    }
  };

  // On mobile, use click to toggle
  if (isMobile) {
    const arrowProps = getArrowStyle();
    
    return (
      <div 
        ref={triggerRef}
        className={`relative ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            handleOpen();
          } else {
            handleClose();
          }
        }}
      >
        {children}
        {isOpen && (
          <div ref={tooltipRef} className={getTooltipClasses()}>
            {content}
            <div className={arrowProps.className} style={arrowProps.style} />
          </div>
        )}
      </div>
    );
  }

  // On desktop, use hover tooltip with auto-close
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={(open) => {
        if (open) {
          handleOpen();
        } else {
          handleClose();
        }
      }}>
        <TooltipTrigger asChild>
          <div 
            className={`cursor-pointer ${className}`}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top"
          align="center"
          avoidCollisions={true}
          collisionPadding={8}
          className="max-w-[220px] text-center bg-foreground/95 backdrop-blur-sm text-background border-foreground/95 font-normal text-xs leading-normal pointer-events-none"
        >
          <p className="font-normal">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
