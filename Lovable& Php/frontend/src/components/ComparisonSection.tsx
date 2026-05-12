import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Minus, ShieldCheck, ArrowRight, Crown, Globe, Building2, Sparkles } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { useWizard } from '@/contexts/WizardContext';
import { Button } from '@/components/ui/button';
import { coreFeatures, type ComparisonStatus } from '@/data/comparisonData';

const StatusCell = ({ status, recommended = false }: { status: ComparisonStatus; recommended?: boolean }) => {
  if (status === 'yes') return (
    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${
      recommended ? 'bg-primary text-primary-foreground' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70'
    }`}>
      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
    </div>
  );
  if (status === 'no') return (
    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-muted/60 flex items-center justify-center ring-1 ring-border/40">
      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60" strokeWidth={2.5} />
    </div>
  );
  return (
    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-50 flex items-center justify-center ring-1 ring-amber-200/70">
      <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" strokeWidth={3} />
    </div>
  );
};

const providers = [
  { name: 'PadosiAgent', key: 'padosi' as const, recommended: true, icon: ShieldCheck },
  { name: 'Online', key: 'online' as const, icon: Globe },
  { name: 'Banks', key: 'bank' as const, icon: Building2 },
];

// Minimal headline features for the home page
const minimalFeatures = coreFeatures.slice(0, 4);

const GRID = 'grid grid-cols-[1.5fr_1fr_1fr_1fr]';

const ComparisonSection = () => {
  const { openWizard } = useWizard();

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary">Why PadosiAgent</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3 max-w-3xl mx-auto">
              The smarter way to buy insurance
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              How your neighbourhood expert compares — at a glance.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={150}>
          <div className="rounded-2xl md:rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xl shadow-foreground/[0.04]">
            {/* Header */}
            <div className={`${GRID} bg-gradient-to-br from-muted/30 via-card to-card`}>
              <div className="p-3 sm:p-5 flex items-end">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Compare</span>
              </div>
              {providers.map((p) => (
                <div
                  key={p.key}
                  className={`p-3 pt-5 sm:p-5 sm:pt-7 flex flex-col items-center justify-end relative ${
                    p.recommended ? 'bg-primary/[0.06] border-l border-r border-primary/15' : ''
                  }`}
                >
                  {p.recommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-b-md flex items-center gap-1">
                      <Crown className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={2.5} />
                      Best
                    </div>
                  )}
                  <div className={`w-7 h-7 sm:w-10 sm:h-10 mb-1 sm:mb-2 rounded-lg sm:rounded-xl flex items-center justify-center ${
                    p.recommended ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/70'
                  }`}>
                    <p.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" strokeWidth={2.2} />
                  </div>
                  <span className={`text-[10px] sm:text-sm font-extrabold tracking-tight text-center leading-tight ${p.recommended ? 'text-primary' : 'text-foreground/85'}`}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="border-t border-border/40">
              {minimalFeatures.map((f, i) => (
                <div
                  key={f.label}
                  className={`${GRID} items-center transition-colors hover:bg-muted/15 ${
                    i < minimalFeatures.length - 1 ? 'border-b border-border/30' : ''
                  }`}
                >
                  <div className="p-3 sm:p-4 sm:pl-5">
                    <p className="text-[12px] sm:text-sm font-semibold text-foreground leading-tight">{f.label}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-primary/[0.04] border-l border-r border-primary/10 flex items-center justify-center">
                    <StatusCell status={f.padosi} recommended />
                  </div>
                  <div className="p-2 sm:p-3 flex items-center justify-center">
                    <StatusCell status={f.online} />
                  </div>
                  <div className="p-2 sm:p-3 flex items-center justify-center">
                    <StatusCell status={f.bank} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={250}>
          <div className="text-center mt-8 sm:mt-10 flex flex-col items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 font-semibold rounded-xl px-6 py-3 h-auto text-sm group"
            >
              <Link to="/compare">
                See full detailed comparison
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <div className="flex flex-col items-center gap-2 pt-2">
              <Button
                onClick={() => openWizard()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 h-auto text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]"
              >
                Find My PadosiAgent
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <p className="text-xs text-muted-foreground">Free service • No spam • Licensed agents</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ComparisonSection;
