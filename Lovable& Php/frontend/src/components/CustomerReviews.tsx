import React, { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedSection from '@/components/AnimatedSection';

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;
  const emptyStars = 5 - Math.ceil(rating);
  return (
    <div className="flex gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
      ))}
      {partialFill > 0 && (
        <div className="relative" style={{ width: size, height: size }}>
          <Star className="absolute text-amber-400" style={{ width: size, height: size }} />
          <div className="absolute overflow-hidden" style={{ width: `${partialFill * 100}%`, height: size }}>
            <Star className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="text-amber-400/40" style={{ width: size, height: size }} />
      ))}
    </div>
  );
};

const reviews = [
  { name: "Sneha Patel", service: "Policy Purchase", rating: 5, comment: "Found my perfect health insurance through my PadosiAgent. They were professional and explained everything clearly.", image: "https://randomuser.me/api/portraits/women/32.jpg" },
  { name: "Rahul Verma", service: "Claim Assistance", rating: 4.5, comment: "My claim was rejected initially, but my PadosiAgent helped me get it approved. Highly recommended!", image: "https://randomuser.me/api/portraits/men/45.jpg" },
  { name: "Anjali Desai", service: "Policy Review", rating: 4, comment: "Got my policy reviewed and discovered I was overpaying. Saved ₹15,000 annually. Thank you!", image: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Vikram Singh", service: "Policy Purchase", rating: 5, comment: "Bought term insurance for my family. My PadosiAgent was patient and helped me understand all the terms.", image: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Priya Iyer", service: "Claim Assistance", rating: 4.5, comment: "My medical claim process was smooth thanks to my PadosiAgent. They handled all the documentation.", image: "https://randomuser.me/api/portraits/women/54.jpg" },
  { name: "Amit Kapoor", service: "Policy Review", rating: 4, comment: "Professional service. My PadosiAgent reviewed all my policies and suggested better coverage options.", image: "https://randomuser.me/api/portraits/men/67.jpg" },
];

const ReviewCard = ({ review, size = 'md' }: { review: typeof reviews[0]; size?: 'sm' | 'md' }) => {
  const isSmall = size === 'sm';
  return (
    <Card className="border-border/40 bg-card hover:shadow-md transition-all duration-500 rounded-2xl h-full">
      <CardContent className={`${isSmall ? 'p-4' : 'p-5 sm:p-6'} flex flex-col h-full`}>
        <div className={`flex items-start ${isSmall ? 'gap-2.5 mb-3' : 'gap-3 mb-4'}`}>
          <img src={review.image} alt={review.name} className={`${isSmall ? 'w-10 h-10' : 'w-11 h-11'} rounded-full object-cover border-2 border-border shadow-sm flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-bold text-foreground truncate`}>{review.name}</h4>
            <p className={`${isSmall ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>{review.service}</p>
          </div>
          <Quote className={`${isSmall ? 'h-4 w-4 text-primary/15' : 'h-5 w-5 text-primary/20'} flex-shrink-0 mt-0.5`} />
        </div>
        <div className={isSmall ? 'mb-2' : 'mb-3'}>
          <StarRating rating={review.rating} size={isSmall ? 12 : 13} />
        </div>
        <p className={`${isSmall ? 'text-[11px]' : 'text-sm'} text-muted-foreground leading-relaxed flex-1`}>"{review.comment}"</p>
      </CardContent>
    </Card>
  );
};

const CustomerReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    const speed = 0.8;

    const scroll = () => {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
        // Calculate active dot based on scroll position
        const cardWidth = el.querySelector('div')?.offsetWidth || 320;
        const gap = 20;
        const idx = Math.round(el.scrollLeft / (cardWidth + gap)) % reviews.length;
        setActiveIndex(idx);
      }
      raf = requestAnimationFrame(scroll);
    };
    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [isPaused]);

  const infiniteReviews = [...reviews, ...reviews];

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('div')?.offsetWidth || 320;
    const gap = 20;
    el.scrollLeft = index * (cardWidth + gap);
    setActiveIndex(index);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary mb-3">Testimonials</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground tracking-tight">What Users Say About Their PadosiAgent</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">Real experiences from users who found their PadosiAgent</p>
          </div>
        </AnimatedSection>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {infiniteReviews.map((review, index) => (
            <div key={index} className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px]">
              <ReviewCard review={review} size={typeof window !== 'undefined' && window.innerWidth < 640 ? 'sm' : 'md'} />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-7 h-2.5 bg-primary'
                  : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
