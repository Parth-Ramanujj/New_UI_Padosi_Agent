import React, { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface AutoSlideCarouselProps {
  children: React.ReactNode[];
  autoplayDelay?: number;
  hideControls?: boolean;
  itemsPerView?: number;
}

const AutoSlideCarousel: React.FC<AutoSlideCarouselProps> = ({ 
  children, 
  autoplayDelay = 3000,
  hideControls = false,
  itemsPerView = 1
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      containScroll: 'trimSnaps',
      duration: 40
    },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, playOnInit: true }) as any]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    const onScroll = () => {
      const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
      setScrollProgress(progress * 100);
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 items-center">
          {children.map((child, index) => (
            <div 
              key={index} 
              className="flex-[0_0_auto] flex items-center justify-center"
              style={{ 
                minWidth: itemsPerView > 1 
                  ? `calc(${100 / itemsPerView}% - ${(4 * (itemsPerView - 1)) / itemsPerView}px)` 
                  : '200px' 
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      {!hideControls && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${((selectedIndex + 1) / children.length) * 100}%` 
            }}
          />
        </div>
      )}
      
      {/* Dots Indicator */}
      {!hideControls && (
        <div className="flex justify-center gap-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex ? 'bg-primary w-8' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoSlideCarousel;
