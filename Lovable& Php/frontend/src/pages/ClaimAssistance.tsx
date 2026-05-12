import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '@/contexts/WizardContext';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Heart, Car, Plane, Building2, Shield, FileCheck,
  CheckCircle2, MapPin, Search, FileText, MessageSquare, TrendingUp,
  Clock, Award, Users, ShieldCheck, ArrowRight, X, Phone, AlertTriangle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSearchBar from '@/components/HeroSearchBar';

/* ────── Animated counter (lightweight, no libs) ────── */
const useCounter = (end: number, duration = 1600) => {
  const [val, setVal] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    let s: number;
    const tick = (t: number) => {
      if (!s) s = t;
      const p = Math.min((t - s) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(end * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, end, duration]);
  return { ref, val };
};

const StatCard: React.FC<{ end: number; suffix?: string; label: string }> = ({ end, suffix = '', label }) => {
  const { ref, val } = useCounter(end);
  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-claim to-claim-dark bg-clip-text text-transparent tabular-nums">
        {val.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground font-medium mt-1">{label}</div>
    </div>
  );
};

const claimTypes = [
  { icon: Heart, title: 'Health Insurance', desc: 'Hospital, mediclaim & critical illness claims', type: 'health' },
  { icon: Shield, title: 'Life Insurance', desc: 'Death, maturity & term plan claims', type: 'life' },
  { icon: Car, title: 'Motor Insurance', desc: 'Accident, theft & own-damage claims', type: 'motor' },
  { icon: Building2, title: 'Fire & Property', desc: 'Fire, burglary & shop insurance claims', type: 'sme' },
  { icon: Plane, title: 'Travel Insurance', desc: 'Trip, baggage & medical emergency abroad', type: 'travel' },
  { icon: FileCheck, title: 'Other Claims', desc: 'Marine, liability, group & all other claims', type: 'other' },
];

const steps = [
  { icon: MapPin, title: 'Tell us your claim', desc: 'Share the claim type, insurer & a brief problem in 30 seconds.' },
  { icon: Users, title: 'Match a local PadosiAgent', desc: 'We find a verified expert in your neighbourhood specialising in your claim type.' },
  { icon: FileText, title: 'Submit documents together', desc: 'Your PadosiAgent guides you on every document, hospital code, surveyor visit & follow-up.' },
  { icon: TrendingUp, title: 'Track till settlement', desc: 'Real-time updates, escalations & rightful settlement — no more chasing helplines.' },
];

const issues = [
  { q: 'My claim got rejected unfairly', a: 'Your PadosiAgent reviews the rejection letter, identifies the policy clause being misused, drafts a structured representation, and pushes it through the insurer\'s grievance cell — most unjust rejections get reversed within 2–3 weeks.' },
  { q: 'Insurer is delaying my settlement', a: 'Licensed mandates 30-day TAT. We track every day past it, file an escalation with the Grievance Redressal Officer, and if needed, take it to the Insurance Ombudsman with a complete paper trail.' },
  { q: 'I got a much lower settlement than expected', a: 'PadosiAgents audit the deduction breakup line-by-line — non-payable items, room-rent capping, co-pay misapplication, depreciation errors. We file a reconsideration with cost calculations attached.' },
  { q: 'Hospital is denying cashless approval', a: 'Real-time intervention: your local agent calls the TPA helpdesk, escalates to the insurer\'s 24x7 desk and ensures pre-authorisation gets cleared while you are still at admission.' },
  { q: 'I lost my policy / KYC documents', a: 'We help you retrieve duplicate policy copies, hospital discharge summaries, FIR copies and reconstruct the documentation needed to file a fresh claim.' },
  { q: 'My agent has stopped responding', a: 'Switch to a verified PadosiAgent in your area — we take over your existing claim file and continue the process without restarting from scratch.' },
];

const faqs = [
  { q: 'Does PadosiAgent charge for claim assistance?', a: 'No platform fee. The PadosiAgent may charge a transparent service fee only on successful claim settlement — disclosed upfront before you engage.' },
  { q: 'Will you handle claims for any insurer?', a: 'Yes — life, health, motor, fire, travel, marine and SME claims across all Licensed-registered insurers in India.' },
  { q: 'How fast can a PadosiAgent reach me?', a: 'Local agents typically respond within 30 minutes and can meet you in person on the same or next day for hospital cashless or surveyor situations.' },
  { q: 'Is my policy data safe?', a: 'Yes. We never sell data and only share what your assigned PadosiAgent needs. Read our Privacy Policy for full details.' },
  { q: 'Can you help if my agent is unresponsive?', a: 'Absolutely. We assign a fresh PadosiAgent who picks up your existing claim file and runs it to closure.' },
];

const ClaimAssistance: React.FC = () => {
  const navigate = useNavigate();
  const { openWizard } = useWizard();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-claim/40 text-background pt-10 sm:pt-12 md:pt-16 pb-16 md:pb-24">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--background)) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-20 -right-32 w-[28rem] h-[28rem] rounded-full bg-claim/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[24rem] h-[24rem] rounded-full bg-claim/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 backdrop-blur-md border border-background/15 text-[11px] sm:text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-claim animate-pulse" />
              Claim Help by PadosiAgent
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5">
              Stuck on an insurance claim?
              <span className="block mt-2 bg-gradient-to-r from-claim to-background bg-clip-text text-transparent">
                A local PadosiAgent will fight for your settlement.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-background/75 leading-relaxed mb-8 max-w-2xl">
              Hyperlocal, licensed insurance experts in your neighbourhood — handling rejections, delays and lowballed settlements end-to-end. No call centres. No runaround.
            </p>

            {/* Inline search bar locked to Claim service */}
            <div className="mb-5">
              <HeroSearchBar lockService="claim" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/contact')}
                className="bg-background/5 backdrop-blur-md border-background/25 text-background hover:bg-background/15 font-semibold text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 rounded-xl"
              >
                <Phone className="mr-2 h-4 w-4" /> Talk to Us
              </Button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
              {[
                { icon: ShieldCheck, label: 'Licensed Agents' },
                { icon: MapPin, label: 'Hyperlocal — agents in your city' },
                { icon: Award, label: 'Free guidance, success-fee only' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2 text-[12px] sm:text-sm text-background/85">
                  <Icon className="h-4 w-4 text-claim" strokeWidth={2.2} />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ STATS BAND ════════ */}
      <section className="bg-card border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            <StatCard end={12500} suffix="+" label="Claims Assisted" />
            <StatCard end={94} suffix="%" label="Success Rate" />
            <StatCard end={18} suffix=" days" label="Avg. Settlement" />
            <StatCard end={50} suffix="+" label="Cities Covered" />
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-claim mb-3">How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              Claim help, the neighbourhood way
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Four steps. One local expert. Zero runaround.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative p-6 rounded-2xl bg-card border border-border/40 hover:border-claim/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-claim/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-claim" strokeWidth={1.8} />
                    </div>
                    <span className="text-3xl font-extrabold text-claim/15 leading-none tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ CLAIM CATEGORIES ════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-claim mb-3">Claim Categories</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              Pick your claim type to get matched
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              We handle every major insurance claim category in India.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {claimTypes.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.title}
                  onClick={() => openWizard('claim', c.type)}
                  className="group text-left p-5 sm:p-6 rounded-2xl bg-card border border-border/40 hover:border-claim/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-claim/10 group-hover:bg-claim/15 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="h-6 w-6 text-claim" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-1.5">{c.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-claim group-hover:gap-2 transition-all">
                    Find PadosiAgent <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ COMPARISON TABLE ════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-claim mb-3">Why Local Agents Win</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              DIY vs Helpline vs PadosiAgent
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Hyperlocal beats anonymous call centres — every single time.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/40 shadow-sm bg-card">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border/40">
                  <th className="text-left font-semibold text-foreground p-4">What you get</th>
                  <th className="text-center font-semibold text-muted-foreground p-4">DIY</th>
                  <th className="text-center font-semibold text-muted-foreground p-4">Insurer Helpline</th>
                  <th className="text-center font-semibold text-claim p-4 bg-claim/5">PadosiAgent</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Local in-person support', false, false, true],
                  ['Licensed clause expertise', false, true, true],
                  ['Hospital cashless escalation', false, true, true],
                  ['Rejection representation drafted', false, false, true],
                  ['Independent (not insurer-biased)', true, false, true],
                  ['Same-day response', false, false, true],
                  ['Ombudsman filing support', false, false, true],
                ].map(([feat, a, b, c], i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-foreground font-medium">{feat as string}</td>
                    <td className="p-4 text-center">{a ? <CheckCircle2 className="h-5 w-5 text-claim mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />}</td>
                    <td className="p-4 text-center">{b ? <CheckCircle2 className="h-5 w-5 text-claim mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />}</td>
                    <td className="p-4 text-center bg-claim/5">{c ? <CheckCircle2 className="h-5 w-5 text-claim mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════ COMMON ISSUES (Insurance Samadhan style) ════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claim/10 text-claim text-[11px] font-semibold mb-3">
              <AlertTriangle className="h-3.5 w-3.5" /> Common claim issues we solve
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              If any of these sound familiar — we can help.
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {issues.map((it, i) => (
              <AccordionItem
                key={i}
                value={`issue-${i}`}
                className="bg-card border border-border/40 rounded-xl px-4 sm:px-5 data-[state=open]:border-claim/30 data-[state=open]:shadow-md transition-all"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base text-foreground hover:no-underline py-4">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-claim mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-border/40 last:border-0"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base text-foreground hover:no-underline py-4 hover:text-claim transition-colors">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative overflow-hidden py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-foreground via-foreground to-claim/30 text-background">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-claim/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Don't fight your claim alone.
          </h2>
          <p className="text-base sm:text-lg text-background/75 leading-relaxed mb-8">
            A verified PadosiAgent in your neighbourhood is one tap away.
          </p>
          <Button
            size="lg"
            onClick={() => openWizard('claim')}
            className="bg-claim hover:bg-claim-dark text-white font-bold text-sm sm:text-base px-8 h-12 sm:h-14 rounded-xl shadow-xl shadow-claim/30 group"
          >
            Find My Claim PadosiAgent
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* ════════ MOBILE STICKY CTA ════════ */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_16px_-4px_rgb(0_0_0/0.08)] px-4 py-3">
        <Button
          onClick={() => openWizard('claim')}
          className="w-full bg-claim hover:bg-claim-dark text-white font-bold text-sm h-12 rounded-xl shadow-md group"
        >
          Find Claim PadosiAgent Near Me
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="md:hidden h-20" />

      <Footer />
    </div>
  );
};

export default ClaimAssistance;
