import React from 'react';
import { Search, GitCompare, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '@/contexts/WizardContext';
import AnimatedSection from '@/components/AnimatedSection';

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Tell us what you need — Buy, Claim, or Review — and we'll find licensed agents near you.",
    accent: "primary",
  },
  {
    icon: GitCompare,
    title: "Compare",
    description: "View ratings, reviews, experience & specialisations side-by-side to pick the best fit.",
    accent: "secondary",
  },
  {
    icon: MessageSquare,
    title: "Connect",
    description: "Call or WhatsApp your chosen agent directly — no middlemen, no spam.",
    accent: "accent",
  },
];

const accentMap: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
  primary: { bg: 'bg-primary/8', text: 'text-primary', ring: 'ring-primary/20', badge: 'bg-primary' },
  secondary: { bg: 'bg-secondary/8', text: 'text-secondary', ring: 'ring-secondary/20', badge: 'bg-secondary' },
  accent: { bg: 'bg-accent/8', text: 'text-accent', ring: 'ring-accent/20', badge: 'bg-accent' },
};

const HowItWorks = () => {
  const { openWizard } = useWizard();

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-transparent">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary mb-3">How It Works</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground tracking-tight">
              Find Your PadosiAgent in 3 Steps
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">From search to service — it takes just minutes</p>
          </div>
        </AnimatedSection>

        {/* Desktop: Premium horizontal cards with connector */}
        <div className="hidden md:block mb-12">
          <div className="grid grid-cols-3 gap-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = accentMap[step.accent];
              return (
                <AnimatedSection key={index} animation="fade-up" delay={index * 150}>
                  <div className="relative flex flex-col items-center px-6">
                    {/* Connector line — sits between cards, not over icons */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-12 left-[calc(50%+3.5rem)] right-[calc(-50%+3.5rem)] flex items-center z-0 pointer-events-none">
                        <div className="h-px flex-1 border-t border-dashed border-muted-foreground/25" />
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 ml-1" />
                      </div>
                    )}
                    {/* Card */}
                    <div className="relative z-10 group cursor-default">
                      <div className={`w-24 h-24 rounded-3xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center mx-auto mb-5 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300`}>
                        <Icon className={`h-10 w-10 ${colors.text}`} strokeWidth={1.5} />
                      </div>
                      <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${colors.badge} text-white text-xs font-bold flex items-center justify-center shadow-md ring-3 ring-background`}>
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2 text-center">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-[240px]">{step.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>

        {/* Mobile: Clean numbered cards */}
        <div className="md:hidden mb-8">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = accentMap[step.accent];
              return (
                <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/40 shadow-sm">
                    <div className="relative flex-shrink-0">
                      <div className={`w-14 h-14 rounded-2xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={1.7} />
                      </div>
                      <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full ${colors.badge} text-white text-[10px] font-bold flex items-center justify-center shadow-sm ring-2 ring-card`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-sm text-foreground mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="text-center">
            <Button
              onClick={() => openWizard()}
              className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 h-auto text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              Find My PadosiAgent
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default HowItWorks;
