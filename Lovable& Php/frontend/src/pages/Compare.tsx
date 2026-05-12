import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Minus, ShieldCheck, ArrowRight, Crown, Globe, Building2, Sparkles, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { useWizard } from '@/contexts/WizardContext';
import { detailedFeatures, type ComparisonStatus, type ComparisonFeature } from '@/data/comparisonData';

const GRID = 'grid grid-cols-[1.5fr_1fr_1fr_1fr]';

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

const Compare = () => {
  const { openWizard } = useWizard();

  const grouped = useMemo(() => {
    const map = new Map<string, ComparisonFeature[]>();
    detailedFeatures.forEach((f) => {
      const key = f.category || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-10 sm:pt-14 md:pt-20 pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 group">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </Link>

            <AnimatedSection animation="fade-up">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary">Full Comparison</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-[1.1]">
                  PadosiAgent vs Online vs Banks
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  A complete, side-by-side breakdown across advisory, claims, trust and pricing — so you can choose with confidence.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Detailed grouped tables */}
        <section className="pb-12 sm:pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            {grouped.map(([category, items], gIdx) => (
              <AnimatedSection key={category} animation="fade-up" delay={100 + gIdx * 50}>
                <div className="rounded-2xl md:rounded-3xl border border-border/60 bg-card overflow-hidden shadow-lg shadow-foreground/[0.04]">
                  {/* Category header */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-primary">{category}</h3>
                  </div>

                  {/* Provider headers */}
                  <div className={`${GRID} bg-muted/15 border-b border-border/40`}>
                    <div className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Feature</div>
                    {providers.map((p) => (
                      <div
                        key={p.key}
                        className={`p-2.5 sm:p-4 text-center relative ${p.recommended ? 'bg-primary/[0.06] border-l border-r border-primary/15' : ''}`}
                      >
                        {p.recommended && (
                          <div className="absolute -top-px left-1/2 -translate-x-1/2 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider rounded-b flex items-center gap-1">
                            <Crown className="h-2 w-2" strokeWidth={3} /> Best
                          </div>
                        )}
                        <span className={`text-[10px] sm:text-xs font-bold ${p.recommended ? 'text-primary' : 'text-foreground/70'}`}>{p.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {items.map((f, i) => (
                    <div
                      key={f.label}
                      className={`${GRID} items-center hover:bg-muted/15 transition-colors ${
                        i < items.length - 1 ? 'border-b border-border/30' : ''
                      }`}
                    >
                      <div className="p-3 sm:p-4">
                        <p className="text-[12px] sm:text-sm font-semibold text-foreground leading-tight">{f.label}</p>
                        <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 leading-snug">{f.description}</p>
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
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 sm:pb-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fade-up">
              <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 sm:p-12 text-center shadow-2xl shadow-primary/20">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                  Ready to meet your PadosiAgent?
                </h2>
                <p className="text-sm sm:text-base text-primary-foreground/85 max-w-lg mx-auto mb-6 leading-relaxed">
                  Get matched with a verified, licensed neighbourhood expert in seconds. Free, no spam, no obligation.
                </p>
                <Button
                  onClick={() => openWizard()}
                  className="bg-card text-primary hover:bg-card/90 font-bold px-8 py-4 h-auto text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]"
                >
                  Find My PadosiAgent
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <p className="text-[11px] text-primary-foreground/70 mt-3">Free service • No spam • Licensed agents</p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Compare;
