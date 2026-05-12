import React, { useEffect, useState } from "react";
import { TrendingUp, Search, Users, Flame, AlertTriangle, Clock, Globe, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

/**
 * Conversion-focused panel shown only on the Agent tab.
 * Plays on FOMO + urgency + curiosity:
 *  - Massive market: 11 Cr / month, 38 L / day searching online
 *  - Online aggregators have 3x'd revenue while traditional agents stayed offline
 *  - June 2026 regulatory shift = a hard deadline
 */
const DEADLINE = new Date("2026-06-01T00:00:00+05:30").getTime();

const useCountdown = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, DEADLINE - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return { days, hours };
};

const AgentWhyRegister: React.FC = () => {
  const { days, hours } = useCountdown();

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ── URGENCY BADGE ── */}
      <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
        </span>
        <span className="text-[11px] sm:text-xs font-bold text-destructive uppercase tracking-wide">
          Limited window — closes June 2026
        </span>
      </div>

      {/* ── HEADLINE ── */}
      <div>
        <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-foreground leading-tight tracking-tight">
          Your customers are{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">already online.</span>
            <span className="absolute bottom-1 left-0 right-0 h-2 bg-primary/15 -z-0 rounded-sm" />
          </span>
          <br className="hidden sm:block" />
          <span className="text-foreground/80">You're still offline.</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
          Every minute you're not on PadosiAgent, an aggregator is closing a policy in your neighbourhood — using your prospects.
        </p>
      </div>

      {/* ── BIG STATS GRID ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
        <div className="rounded-2xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Search className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Per Month</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">11 Cr+</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">Indians searching insurance online</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="h-3.5 w-3.5 text-secondary" strokeWidth={2.4} />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Daily</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">38 Lakh</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">searches happen <span className="font-semibold text-foreground">every single day</span></p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Aggregators</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">
            3<span className="text-accent">×</span>
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">tripled their business in 24 months</p>
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" strokeWidth={2.4} />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-destructive">Deadline</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-destructive leading-none tabular-nums">
            {days}<span className="text-base font-bold">d</span> {hours}<span className="text-base font-bold">h</span>
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">until <span className="font-semibold text-destructive">June 2026</span> shake-up</p>
        </div>
      </div>

      {/* ── THE OPENED SECRET / CURIOSITY ── */}
      <div className="rounded-2xl border-l-4 border-l-primary bg-muted/40 p-3.5 sm:p-4 mt-1">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Flame className="h-4 w-4 text-primary" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
              From <span className="text-primary">June 2026</span>, the regulator's open-architecture push lets every aggregator chase your renewal book.
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-snug">
              Agents who built a digital footprint <span className="font-semibold text-foreground">before</span> the shift will own their <em>Padosi</em>. The rest will lose 30-40% of their renewals to call centres.
            </p>
          </div>
        </div>
      </div>

      {/* ── WHAT YOU GET (curiosity hooks) ── */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          What you unlock today
        </p>
        <ul className="space-y-1.5">
          {[
            { icon: Globe, text: "A verified profile that ranks for your neighbourhood searches" },
            { icon: Users, text: "Hot leads from people in your pincode — not random call-centre lists" },
            { icon: ShieldCheck, text: "Verified badge + reviews that build instant trust" },
            { icon: Clock, text: "Your spot before competitors in your area claim it" },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/85">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon className="h-3 w-3 text-primary" strokeWidth={2.6} />
              </div>
              <span className="leading-snug">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── SOCIAL PROOF FOOTER ── */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
        <div className="flex -space-x-2">
          {["bg-rose-400", "bg-violet-400", "bg-blue-400", "bg-emerald-400"].map((c, i) => (
            <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-card`} />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
            1,000+ agents <span className="text-primary">already secured</span> their Padosi
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            Be next — registration takes under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentWhyRegister;
