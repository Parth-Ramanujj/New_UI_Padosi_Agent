import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { useAgentSearchNavigation } from "@/contexts/AgentSearchContext";
import heroNewPolicyDoodle from "@/assets/hero-new-policy-doodle.png";
import heroClaimAssistanceDoodle from "@/assets/hero-claim-assistance-doodle.png";
import heroPolicyReviewDoodle from "@/assets/hero-policy-review-doodle.png";

const ctaCards = [
  {
    title: "Buy/Port/Renew Insurance",
    subtitle: "Connect with your local PadosiAgent for expert guidance on policies tailored to your needs.",
    image: heroNewPolicyDoodle,
    cta: "Find My PadosiAgent",
    ctaLink: "/agents?service=new-policy",
    accentColor: "bg-secondary",
    hoverColor: "hover:bg-secondary-dark",
    textColor: "text-secondary-dark",
    subtitleColor: "text-foreground/60",
    bgGradient: "from-secondary/8 via-secondary/3 to-transparent",
    dotColor: "bg-secondary",
  },
  {
    title: "Get My Claim Assisted",
    subtitle: "Struggling with your claim? Let a verified expert handle the paperwork and follow-ups.",
    image: heroClaimAssistanceDoodle,
    cta: "Find Claims Expert",
    ctaLink: "/agents?service=claim",
    accentColor: "bg-claim",
    hoverColor: "hover:bg-claim-dark",
    textColor: "text-claim-dark",
    subtitleColor: "text-foreground/60",
    bgGradient: "from-claim/8 via-claim/3 to-transparent",
    dotColor: "bg-claim",
  },
  {
    title: "Review My Policy",
    subtitle: "Unsure if you're covered? Get a portfolio audit from an insurance expert near you.",
    image: heroPolicyReviewDoodle,
    cta: "Find Insurance Expert",
    ctaLink: "/agents?service=policy-review",
    accentColor: "bg-review",
    hoverColor: "hover:bg-review-dark",
    textColor: "text-review-dark",
    subtitleColor: "text-foreground/60",
    bgGradient: "from-review/8 via-review/3 to-transparent",
    dotColor: "bg-review",
  },
];

const HeroCarousel = () => {
  const { navigateWithLoader } = useAgentSearchNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const extendedCards = [ctaCards[ctaCards.length - 1], ...ctaCards, ctaCards[0]];
  const totalSlides = ctaCards.length;

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  }, [isTransitioning]);

  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      if (currentSlide >= totalSlides) setCurrentSlide(0);
      if (currentSlide < 0) setCurrentSlide(totalSlides - 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [currentSlide, isTransitioning, totalSlides]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setIsAutoPlaying(false);
      diff > 0 ? nextSlide() : prevSlide();
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const getTransformOffset = () => (currentSlide + 1) * (100 / extendedCards.length);
  const activeIndex = ((currentSlide % totalSlides) + totalSlides) % totalSlides;

  return (
    <div
      className="relative w-full h-[100vh] overflow-hidden bg-background"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Sliding backgrounds */}
      <div
        className={`absolute inset-0 flex ${isTransitioning ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
        style={{
          width: `${extendedCards.length * 100}%`,
          transform: `translateX(-${getTransformOffset()}%)`
        }}
      >
        {extendedCards.map((card, index) => (
          <div
            key={index}
            className={`h-full bg-gradient-to-br ${card.bgGradient}`}
            style={{ width: `${100 / extendedCards.length}%` }}
          />
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[15%] w-[300px] h-[300px] rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-[250px] h-[250px] rounded-full bg-secondary/3 blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 md:px-8 h-full flex flex-col pb-6">
        <div className="max-w-7xl mx-auto flex-1 flex flex-col w-full">
          {/* Static Tagline */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-foreground mb-4 sm:mb-5 leading-[1.15] tracking-tight px-2 max-w-4xl mx-auto">
              Find your <span className="text-secondary">Trusted & Verified</span> Insurance Experts in your{" "}
              <span className="text-accent">Padosi</span>
            </h1>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              {[
                { icon: CheckCircle, label: 'Licensed', tooltip: 'Verified by our team' },
                { icon: Shield, label: 'No Spam Calls' },
                { icon: TrendingUp, label: '100% Free' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-card/60 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-border/40 shadow-sm"
                  title={badge.tooltip}
                >
                  <badge.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-[11px] sm:text-xs md:text-sm text-foreground/80">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sliding Content */}
          <div
            className="flex-1 relative overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`flex h-full ${isTransitioning ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""}`}
              style={{
                width: `${extendedCards.length * 100}%`,
                transform: `translateX(-${getTransformOffset()}%)`
              }}
            >
              {extendedCards.map((slideCard, index) => (
                <div
                  key={index}
                  className="h-full flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 px-4 sm:px-8 md:px-16 lg:px-20 py-4 cursor-pointer group"
                  style={{ width: `${100 / extendedCards.length}%` }}
                  onClick={() => navigateWithLoader(slideCard.ctaLink)}
                >
                  {/* Doodle Image */}
                  <div className="flex-shrink-0 relative order-1 md:order-2">
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80">
                      <img
                        src={slideCard.image}
                        alt={slideCard.title}
                        className="relative w-full h-full animate-[float_4s_ease-in-out_infinite] drop-shadow-md rounded-3xl object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-lg order-2 md:order-1">
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${slideCard.textColor} mb-3 sm:mb-4 md:mb-5 leading-[1.15] tracking-tight`}>
                      {slideCard.title}
                    </h2>
                    <p className={`text-sm sm:text-base md:text-lg ${slideCard.subtitleColor} mb-5 sm:mb-6 md:mb-8 leading-relaxed max-w-sm md:max-w-md`}>
                      {slideCard.subtitle}
                    </p>
                    <Button
                      className={`${slideCard.accentColor} ${slideCard.hoverColor} text-white font-semibold text-sm sm:text-base md:text-lg py-3 sm:py-3.5 px-6 sm:px-8 h-auto shadow-md hover:shadow-lg transition-all duration-300 rounded-xl group/btn`}
                      size="lg"
                    >
                      {slideCard.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 py-4 sm:py-5">
            {ctaCards.map((card, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-500 ${
                  activeIndex === index
                    ? `w-8 h-2.5 ${card.dotColor} shadow-sm`
                    : 'w-2.5 h-2.5 bg-foreground/15 hover:bg-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
