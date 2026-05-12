import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, CheckCircle, TrendingUp, Heart, Star, Users, MapPin, Award,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import HeroSearchBar from "@/components/HeroSearchBar";

/* ═══════════ Track lg breakpoint (1024px) ═══════════ */
const useIsLargeScreen = () => {
  const [isLg, setIsLg] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isLg;
};

import heroInsurance from "@/assets/hero-insurance.jpg";
import heroAudit from "@/assets/hero-audit.jpg";

/* ═══════════ TYPES ═══════════ */
type ServiceType = "new-policy" | "transfer-renew" | "claim" | "policy-review";

/* ═══════════ SLIDE DATA ═══════════ */
const slides = [
  {
    doodle: heroInsurance,
    eyebrow: "Buy / Port / Renew Insurance",
    headline: "Find a Trusted Insurance Expert in your Padosi",
    subline: "Personalised advice from licensed neighbourhood agents — not call centres.",
    color: "secondary" as const,
    accentHsl: "hsl(212,79%,33%)",
  },
  {
    doodle: heroAudit,
    eyebrow: "Free Insurance Audit",
    headline: "Is your Insurance Portfolio Adequate?",
    subline: "Get a complimentary policy health-check by certified experts in your area.",
    color: "review" as const,
    accentHsl: "hsl(245,50%,48%)",
  },
];

/* ═══════════ ANIMATED COUNTER HOOK ═══════════ */
const useAnimatedCounter = (end: number, duration = 1800, start = 0) => {
  const [count, setCount] = useState(start);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [triggered, end, duration, start]);

  return { ref, count };
};

/* ═══════════ TRUST STAT ═══════════ */
const AnimatedStat: React.FC<{ value: string; label: string; icon: React.ElementType }> = ({ value, label, icon: Icon }) => {
  const numMatch = value.match(/^([\d,]+)/);
  const num = numMatch ? parseInt(numMatch[1].replace(/,/g, ''), 10) : 0;
  const suffix = value.replace(/^[\d,]+/, '');
  const { ref, count } = useAnimatedCounter(num, 1800);

  const formatted = useMemo(() => {
    if (num >= 1000) return count.toLocaleString('en-IN');
    return String(count);
  }, [count, num]);

  return (
    <div ref={ref} className="flex items-center gap-2 sm:gap-2.5 min-w-0">
      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-sm sm:text-base font-bold text-foreground leading-none tabular-nums">
          {formatted}{suffix}
        </div>
        <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{label}</div>
      </div>
    </div>
  );
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ═══════════ HERO SECTION ═══════════ */
const HeroSection = () => {
  const isMobile = useIsMobile();
  const isLg = useIsLargeScreen();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidePhase, setSlidePhase] = useState<"entering" | "visible" | "exiting">("visible");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setTimeout(() => setHeaderVisible(true), 80); }, []);

  /* Parallax — throttled with rAF */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      setSlidePhase("exiting");
      setTimeout(() => {
        setCurrentSlide((p) => (p + 1) % slides.length);
        setSlidePhase("entering");
        // Allow next paint before transitioning to visible for a clean crossfade
        requestAnimationFrame(() => requestAnimationFrame(() => setSlidePhase("visible")));
      }, 700);
    }, 6500);
  }, []);

  useEffect(() => { scheduleNext(); return () => clearTimeout(autoTimer.current); }, [currentSlide, slidePhase, scheduleNext]);

  const goToSlide = (idx: number) => {
    if (idx === currentSlide) return;
    clearTimeout(autoTimer.current);
    setSlidePhase("exiting");
    setTimeout(() => {
      setCurrentSlide(idx);
      setSlidePhase("entering");
      requestAnimationFrame(() => requestAnimationFrame(() => setSlidePhase("visible")));
    }, 650);
  };

  const slide = slides[currentSlide];
  const accentText = slide.color === "secondary" ? "text-secondary" : "text-review";
  const accentBg = slide.color === "secondary" ? "bg-secondary" : "bg-review";

  return (
    <section className="relative bg-transparent overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-secondary/[0.04] blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] rounded-full bg-primary/[0.03] blur-3xl -translate-x-1/3 translate-y-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 sm:pt-10 sm:pb-12 lg:pt-8 lg:pb-10">
        {/* ═══ MOBILE COMPACT HEADER (visible <lg) ═══ */}
        <div className="lg:hidden">
          {/* Trust badges — centered between Navbar and Hero text */}
          <div
            className={`flex items-center justify-center gap-3 sm:gap-5 mb-3 sm:mb-5 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            style={{ transitionTimingFunction: EASE }}
          >
            {[
              { icon: CheckCircle, label: "Licensed", color: "text-primary" },
              { icon: Shield, label: "No Spam", color: "text-secondary" },
              { icon: TrendingUp, label: "Zero Fee", color: "text-accent" },
            ].map((b, i) => (
              <div key={i} className="inline-flex items-center gap-1 sm:gap-1.5 text-foreground/70 text-[10px] sm:text-xs">
                <b.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${b.color}`} strokeWidth={2.4} />
                <span className="font-semibold whitespace-nowrap">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Side-by-side: copy left, image right — fixed heights to prevent reshape */}
          <div className="grid grid-cols-[1fr_38%] gap-3 sm:gap-6 items-stretch mb-3 sm:mb-6">
            <div className="min-h-[112px] sm:min-h-[200px] flex flex-col justify-center">
              {/* Eyebrow */}
              <div
                key={`m-eyebrow-${currentSlide}`}
                className={`inline-flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3 transition-opacity duration-700 ${slidePhase === "visible" ? "opacity-100" : "opacity-0"}`}
              >
                <div className={`h-0.5 sm:h-1 w-3 sm:w-5 rounded-full ${accentBg}`} />
                <span className={`text-[9px] sm:text-xs font-bold uppercase tracking-wider ${accentText}`}>
                  {slide.eyebrow}
                </span>
              </div>

              {/* Headline — scales up on tablet */}
              <h1
                key={`m-headline-${currentSlide}`}
                className={`text-[19px] sm:text-[34px] leading-[1.15] font-extrabold text-foreground tracking-tight mb-1.5 sm:mb-3 line-clamp-3 min-h-[66px] sm:min-h-[120px] transition-all duration-[900ms] ${slidePhase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{ transitionTimingFunction: EASE }}
              >
                {slide.headline.split(" ").map((word, i) => {
                  const highlighted = ["Trusted", "Padosi", "Adequate?", "Insurance"].includes(word.replace(/[?,.]/g, ""));
                  return (
                    <span key={i} className={highlighted && i > 1 ? accentText : ""}>
                      {word}{i < slide.headline.split(" ").length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </h1>

              {/* Subline */}
              <p
                key={`m-sub-${currentSlide}`}
                className={`text-[11px] sm:text-base text-muted-foreground leading-snug sm:leading-relaxed line-clamp-2 min-h-[28px] sm:min-h-[48px] transition-all duration-[900ms] delay-150 ${slidePhase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{ transitionTimingFunction: EASE }}
              >
                {slide.subline}
              </p>
            </div>

            {/* Compact image with subtle parallax */}
            <div
              className={`relative aspect-[4/5] w-full transition-all duration-700 delay-150 ${headerVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"}`}
              style={{ transitionTimingFunction: EASE }}
            >
              <div
                className="absolute inset-2 rounded-full blur-2xl opacity-30 transition-colors duration-700"
                style={{ background: slide.accentHsl }}
              />
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translate3d(0, ${Math.min(scrollY * 0.18, 80)}px, 0) scale(${1 + Math.min(scrollY * 0.0004, 0.06)})` }}
              >
                {slides.map((s, idx) => (
                  <img
                    key={idx}
                    src={s.doodle}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover rounded-2xl shadow-xl border border-border/30 transition-all duration-[900ms] ${idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                    style={{ transitionTimingFunction: EASE }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div
            className={`mb-3 transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            style={{ transitionTimingFunction: EASE }}
          >
            {isLg !== true && <HeroSearchBar />}
          </div>


          {/* Compact stats strip — clickable */}
          <div
            className={`grid grid-cols-4 gap-1.5 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-card/70 backdrop-blur-md border border-border/40 shadow-sm transition-all duration-700 delay-300 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            style={{ transitionTimingFunction: EASE }}
          >
            {[
              { value: "1K+", label: "Agents", to: "/agents", interactive: true },
              { value: "1L+", label: "Families", to: null, interactive: false },
              { value: "50+", label: "Cities", to: "/insurance-agents", interactive: true },
              { value: "4.8★", label: "Rating", to: null, interactive: false },
            ].map((s, i) => {
              const content = (
                <>
                  <div className="text-[12px] sm:text-lg font-extrabold text-foreground leading-none tabular-nums">{s.value}</div>
                  <div className={`text-[8px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 truncate ${s.interactive ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}{s.interactive && " ›"}
                  </div>
                </>
              );
              return s.interactive && s.to ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigate(s.to!)}
                  aria-label={`View ${s.label}`}
                  className="text-center min-w-0 rounded-lg py-1 -my-1 transition-colors active:bg-primary/10 hover:bg-primary/5"
                >
                  {content}
                </button>
              ) : (
                <div key={i} className="text-center min-w-0">
                  {content}
                </div>
              );
            })}
          </div>

          {/* Slide indicators (moved below content) */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-500 bg-foreground/10"
                style={{ width: i === currentSlide ? "1.5rem" : "0.5rem" }}
              >
                {i === currentSlide && (
                  <div className={`absolute inset-0 ${accentBg} rounded-full`} style={{ animation: "hero-progress 6.5s linear" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ DESKTOP / TABLET LAYOUT (lg+) ═══ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* LEFT: Editorial copy + search */}
          <div
            className={`lg:col-span-7 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            style={{ transitionTimingFunction: EASE }}
          >
            {/* Eyebrow */}
            <div
              key={`d-eyebrow-${currentSlide}`}
              className={`inline-flex items-center gap-2 mb-3 transition-opacity duration-700 ${slidePhase === "visible" ? "opacity-100" : "opacity-0"}`}
            >
              <div className={`h-1 w-6 rounded-full ${accentBg}`} />
              <span className={`text-sm font-bold uppercase tracking-widest ${accentText}`}>
                {slide.eyebrow}
              </span>
            </div>

            {/* Headline — fixed min-height across slides */}
            <h1
              key={`d-headline-${currentSlide}`}
              className={`text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1] font-extrabold text-foreground tracking-tight mb-4 min-h-[7.2rem] lg:min-h-[7.5rem] transition-all duration-[900ms] ${slidePhase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              style={{ transitionTimingFunction: EASE }}
            >
              {slide.headline.split(" ").map((word, i) => {
                const highlighted = ["Trusted", "Padosi", "Adequate?", "Insurance"].includes(word.replace(/[?,.]/g, ""));
                return (
                  <span key={i} className={highlighted && i > 1 ? accentText : ""}>
                    {word}{i < slide.headline.split(" ").length - 1 ? " " : ""}
                  </span>
                );
              })}
            </h1>

            {/* Subline — fixed min-height */}
            <p
              key={`d-sub-${currentSlide}`}
              className={`text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl mb-7 min-h-[3.25rem] transition-all duration-[900ms] delay-150 ${slidePhase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              style={{ transitionTimingFunction: EASE }}
            >
              {slide.subline}
            </p>

            {/* Search bar */}
            <div className="mb-6">
              {isLg === true && <HeroSearchBar />}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              {[
                { icon: CheckCircle, label: "Licensed", color: "text-primary" },
                { icon: Shield, label: "No Spam Calls", color: "text-secondary" },
                { icon: TrendingUp, label: "Zero Platform Fee", color: "text-accent" },
              ].map((b, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 text-foreground/70">
                  <b.icon className={`h-3.5 w-3.5 ${b.color}`} strokeWidth={2.4} />
                  <span className="font-semibold">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-2 mt-6">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="group relative h-1.5 rounded-full overflow-hidden transition-all duration-500 bg-foreground/10"
                  style={{ width: i === currentSlide ? "2.25rem" : "0.75rem" }}
                >
                  {i === currentSlide && (
                    <div className={`absolute inset-0 ${accentBg} rounded-full`} style={{ animation: "hero-progress 6.5s linear" }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual */}
          <div
            className={`lg:col-span-5 transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionTimingFunction: EASE }}
          >
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-[22rem] xl:max-w-[24rem]">
              <div
                className="absolute inset-8 rounded-full blur-3xl opacity-25 transition-colors duration-700"
                style={{ background: slide.accentHsl }}
              />

              <div className="relative w-full h-full">
                {slides.map((s, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-700 ${idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                    style={{ transitionTimingFunction: EASE }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={s.doodle}
                        alt=""
                        width={640}
                        height={640}
                        className="relative w-full h-full object-cover rounded-3xl shadow-2xl border border-border/30"
                      />

                      <div className="absolute top-6 left-6 bg-card/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-border/40 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold leading-none">Verified</p>
                          <p className="text-xs font-bold text-foreground leading-none mt-0.5">Licensed</p>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip — desktop only (mobile/tablet have their own compact strip above) */}
        <div
          className={`hidden lg:block mt-6 sm:mt-10 lg:mt-8 transition-all duration-700 delay-500 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionTimingFunction: EASE }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 shadow-sm">
            {[
              { value: "1,000+", label: "Verified Agents", icon: Users },
              { value: "1,00,000+", label: "Families Served", icon: Heart },
              { value: "50+", label: "Cities Covered", icon: MapPin },
              { value: "4.8", label: "Average Rating", icon: Star },
            ].map((s, i) => (
              <div key={i} className={`${i < 3 ? "sm:border-r sm:border-border/40" : ""} sm:pr-4`}>
                <AnimatedStat value={s.value} label={s.label} icon={s.icon} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes hero-progress { from { width: 0%; } to { width: 100%; } }`}</style>
    </section>
  );
};

export default HeroSection;
