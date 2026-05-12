import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Repeat, LifeBuoy, ClipboardCheck,
  HeartPulse, Heart, Car, Building2, MapPin, Loader2, Locate, Home,
  BadgeCheck, BellOff, Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cn } from "@/lib/utils";
import logo from "@/assets/padosi-agent-logo-new.png";

const GPS_TIMEOUT_MS = 8000;

type TrustBadge = { icon: React.ElementType; short: string; aria: string; tip: string };
const trustBadges: TrustBadge[] = [
  {
    icon: BadgeCheck,
    short: "Licensed Agents",
    aria: "Licensed Agents — every agent is verified with a valid insurance license number",
    tip: "Every agent is licensed and verified by us before listing.",
  },
  {
    icon: BellOff,
    short: "No Spam",
    aria: "No Spam — your contact details are shared only with the agent you choose",
    tip: "Your number is shared only with the agent you pick. No marketing calls.",
  },
  {
    icon: Wallet,
    short: "Zero Fee",
    aria: "Zero Fee — using PadosiAgent is completely free for customers",
    tip: "Customers pay zero platform fee. You only pay your agent for their service.",
  },
];

const TrustBadgeChip = ({
  badge,
  size = "sm",
}: {
  badge: TrustBadge;
  size?: "sm" | "xs";
}) => {
  const Icon = badge.icon;
  const padding = size === "xs" ? "px-2 py-0.5 sm:px-2.5 sm:py-1" : "px-2.5 py-1 sm:px-3.5 sm:py-1.5";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={badge.aria}
          tabIndex={0}
          className={cn(
            "inline-flex cursor-help items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-full border border-border/60 bg-background/70 text-[10.5px] sm:text-[12px] font-semibold text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
            padding
          )}
        >
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" strokeWidth={2.6} aria-hidden="true" />
          {badge.short}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-center text-[11px]">
        {badge.tip}
      </TooltipContent>
    </Tooltip>
  );
};

type Intent = "buy" | "switch" | "claim" | "audit";
type Cover = "health" | "life" | "motor" | "sme";

const intents: { id: Intent; label: string; icon: React.ElementType }[] = [
  { id: "buy", label: "Buy a Policy", icon: ShoppingBag },
  { id: "switch", label: "Switch / Port", icon: Repeat },
  { id: "claim", label: "Assist my Claim", icon: LifeBuoy },
  { id: "audit", label: "Audit my Portfolio", icon: ClipboardCheck },
];

const covers: { id: Cover; label: string; icon: React.ElementType }[] = [
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "life", label: "Life", icon: Heart },
  { id: "motor", label: "Motor", icon: Car },
  { id: "sme", label: "SME", icon: Building2 },
];

const STORAGE_KEY = "padosi_start_last_session";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

const Start = () => {
  const navigate = useNavigate();
  const [isHydrating, setIsHydrating] = useState(true);
  const [intent, setIntent] = useState<Intent | "">("");
  const [cover, setCover] = useState<Cover | "">("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cachedLocation, setCachedLocation] = useState<string | null>(null);
  const [autoNavigated, setAutoNavigated] = useState(false);
  const [intentOpen, setIntentOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [gpsAutoTried, setGpsAutoTried] = useState(false);
  const [gpsTimedOut, setGpsTimedOut] = useState(false);
  const gpsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cityName, isLoading: gpsLoading, error: gpsError, requestLocation } = useUserLocation();

  /* Wrap GPS request with a hard timeout that falls back to PIN entry */
  const requestLocationWithTimeout = () => {
    setGpsTimedOut(false);
    if (gpsTimerRef.current) clearTimeout(gpsTimerRef.current);
    try { requestLocation(); } catch { /* ignore */ }
    gpsTimerRef.current = setTimeout(() => {
      setGpsTimedOut(true);
      const el = document.getElementById("start-pin-input") as HTMLInputElement | null;
      el?.focus();
    }, GPS_TIMEOUT_MS);
  };

  /* Clear timer when GPS resolves or errors */
  useEffect(() => {
    if ((cityName || gpsError) && gpsTimerRef.current) {
      clearTimeout(gpsTimerRef.current);
      gpsTimerRef.current = null;
    }
  }, [cityName, gpsError]);

  useEffect(() => () => { if (gpsTimerRef.current) clearTimeout(gpsTimerRef.current); }, []);

  /* Brief hydration window to lock card dimensions and avoid mobile layout shift */
  useEffect(() => {
    const t = setTimeout(() => setIsHydrating(false), 180);
    return () => clearTimeout(t);
  }, []);

  /* Auto-open intent dropdown on first landing (only if nothing pre-filled) */
  useEffect(() => {
    if (intent || cover) return;
    const t = setTimeout(() => setIntentOpen(true), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* When intent gets selected, auto-open cover dropdown */
  useEffect(() => {
    if (intent && !cover) {
      const t = setTimeout(() => setCoverOpen(true), 220);
      return () => clearTimeout(t);
    }
  }, [intent, cover]);

  /* When cover is selected, auto-request GPS once. If denied/failed,
     focus the PIN input so the numeric keypad opens. */
  useEffect(() => {
    if (intent && cover && !gpsAutoTried && !pin && !cityName) {
      setGpsAutoTried(true);
      const t = setTimeout(() => {
        requestLocationWithTimeout();
      }, 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, cover]);

  /* If GPS errors out or times out, focus the PIN field to pop the numeric keypad */
  useEffect(() => {
    if ((gpsError || gpsTimedOut) && intent && cover && !pin) {
      const el = document.getElementById("start-pin-input") as HTMLInputElement | null;
      el?.focus();
    }
  }, [gpsError, gpsTimedOut, intent, cover, pin]);

  /* Hydrate previous session from localStorage (intent, cover, location) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.timestamp || Date.now() - parsed.timestamp > TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (parsed.intent) setIntent(parsed.intent);
      if (parsed.cover) setCover(parsed.cover);
      if (parsed.location) setCachedLocation(parsed.location);
      if (parsed.pin) setPin(parsed.pin);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /* SEO */
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Find a Trusted Insurance Agent | PadosiAgent";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Pick what you need. Get matched instantly with licensed neighbourhood insurance agents."
    );
    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDesc);
    };
  }, []);

  const finalize = (locParam: string, pinValue?: string) => {
    if (submitting || autoNavigated) return;
    setSubmitting(true);
    setAutoNavigated(true);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          intent,
          cover,
          location: locParam,
          pin: pinValue || "",
          timestamp: Date.now(),
        })
      );
    } catch {
      /* ignore quota errors */
    }
    const params = new URLSearchParams();
    if (intent) params.set("intent", intent);
    if (cover) params.set("type", cover);
    if (locParam) params.set("location", locParam);
    setTimeout(() => navigate(`/agents?${params.toString()}`), 250);
  };

  /* When GPS resolves a city, auto-finalize (only if intent + cover already chosen) */
  useEffect(() => {
    if (intent && cover && cityName && !autoNavigated) {
      finalize(cityName.toLowerCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName, intent, cover]);

  /* Live PIN validation — Indian PINs: 6 digits, first digit 1-8 (not 0 or 9). */
  const validatePin = (value: string): string | null => {
    if (value.length === 0) return null;
    if (!/^\d+$/.test(value)) return "PIN must be digits only";
    if (value.length > 0 && /^[09]/.test(value)) return "PIN cannot start with 0 or 9";
    if (value.length < 6) return `Enter ${6 - value.length} more digit${6 - value.length === 1 ? "" : "s"}`;
    if (value.length > 6) return "PIN must be exactly 6 digits";
    if (!/^[1-8]\d{5}$/.test(value)) return "Not a valid Indian PIN code";
    return null;
  };

  const isPinValid = pin.length === 6 && validatePin(pin) === null;

  const handlePinChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 6);
    setPin(cleaned);
    setPinError(validatePin(cleaned));
  };

  /* Auto-navigate when all three are valid (intent + cover + valid pin) */
  useEffect(() => {
    if (intent && cover && isPinValid && !autoNavigated) {
      finalize(pin, pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, cover, isPinValid, pin]);

  const submitPin = () => {
    const err = validatePin(pin);
    if (err || pin.length !== 6) {
      setPinError(err || "Enter a valid 6-digit PIN code");
      return;
    }
    setPinError(null);
    finalize(pin, pin);
  };

  /* Re-use cached location instantly */
  const useCachedLocation = () => {
    if (cachedLocation) finalize(cachedLocation);
  };

  const canRequestGps = !!intent && !!cover && !submitting;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Blurred decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/15" />
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-secondary/30 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-6 sm:py-10">
        {/* Centered selection card */}
        <section className="flex w-full flex-1 items-center justify-center">
          <div className="relative w-full rounded-3xl border border-border/60 bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 animate-fade-in">
            {isHydrating && (
              <div
                className="absolute inset-0 z-20 flex flex-col gap-4 rounded-3xl bg-card/90 p-6 backdrop-blur-xl sm:p-8"
                aria-hidden="true"
              >
                {/* Logo placeholder */}
                <div className="mb-2 flex flex-col items-center gap-3">
                  <Skeleton className="h-14 w-40 sm:h-16 sm:w-44" />
                  <Skeleton className="h-7 w-64 rounded-full" />
                  <div className="flex flex-wrap justify-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                {/* Builder row placeholder — matches final 12-unit height */}
                <div className="space-y-3 sm:flex sm:flex-nowrap sm:items-center sm:gap-2 sm:space-y-0">
                  <Skeleton className="h-12 w-full rounded-xl sm:w-[150px]" />
                  <Skeleton className="h-12 w-full rounded-xl sm:w-[130px]" />
                  <Skeleton className="h-12 w-full rounded-xl sm:w-[150px]" />
                </div>
                {/* Helper text */}
                <Skeleton className="mx-auto h-4 w-3/4" />
                {/* Trust strip */}
                <Skeleton className="h-16 w-full rounded-2xl" />
                {/* Agent link placeholder */}
                <Skeleton className="mx-auto h-4 w-56 rounded" />
              </div>
            )}
            {/* Logo + tagline */}
            <div className="mb-6 flex flex-col items-center text-center">
              <img
                src={logo}
                alt="PadosiAgent"
                className="h-14 w-auto sm:h-16"
                loading="eager"
              />
              <div className="mt-4 flex items-center justify-center gap-2.5 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-4 py-2 shadow-sm backdrop-blur-sm">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                  <Home className="h-3.5 w-3.5 text-primary" strokeWidth={2.8} />
                </span>
                <p className="text-[12px] font-medium italic tracking-wide text-foreground/80 sm:text-[13px]">
                  Agents serve you better when they are your{" "}
                  <span className="relative inline-block font-extrabold not-italic uppercase tracking-wider bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                    “PADOSI”
                  </span>
                </p>
              </div>

              {/* Compact trust badges — directly under header */}
              <div
                className="mt-3 flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2 px-2"
                role="list"
                aria-label="Trust signals"
              >
                {trustBadges.map((b) => (
                  <div role="listitem" key={b.short}>
                    <TrustBadgeChip badge={b} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* One-line builder: intent · cover · location */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-nowrap sm:items-center sm:justify-center sm:gap-2 text-center">
              <span className="block text-base font-semibold text-foreground sm:inline sm:text-lg">
                I want to
              </span>

              <Select value={intent} open={intentOpen} onOpenChange={setIntentOpen} onValueChange={(v) => setIntent(v as Intent)}>
                <SelectTrigger
                  className={cn(
                    "h-12 w-full rounded-xl border-2 text-sm font-semibold sm:w-auto sm:min-w-[150px] sm:text-base sm:shrink-0",
                    intent ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background"
                  )}
                  aria-label="Choose intent"
                >
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {intents.map((it) => {
                    const Icon = it.icon;
                    return (
                      <SelectItem key={it.id} value={it.id} className="text-sm">
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                          {it.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <span className="block text-base font-semibold text-foreground sm:inline sm:text-lg">
                for
              </span>

              <Select value={cover} open={coverOpen} onOpenChange={setCoverOpen} onValueChange={(v) => setCover(v as Cover)} disabled={!intent}>
                <SelectTrigger
                  className={cn(
                    "h-12 w-full rounded-xl border-2 text-sm font-semibold sm:w-auto sm:min-w-[130px] sm:text-base sm:shrink-0",
                    cover ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background",
                    !intent && "opacity-50"
                  )}
                  aria-label="Choose insurance type"
                >
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {covers.map((c) => {
                    const Icon = c.icon;
                    return (
                      <SelectItem key={c.id} value={c.id} className="text-sm">
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                          {c.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <span className="block text-base font-semibold text-foreground sm:inline sm:text-lg">
                in
              </span>

              {/* Inline PIN input with embedded GPS icon */}
              <div className="relative w-full sm:w-auto sm:shrink-0">
                <Input
                  id="start-pin-input"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && isPinValid) submitPin(); }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="PIN code"
                  disabled={!intent || !cover}
                  aria-label="Enter your 6-digit PIN code"
                  aria-invalid={!!pinError}
                  aria-describedby="start-pin-help"
                  autoFocus={!!gpsError && !!intent && !!cover}
                  className={cn(
                    "h-12 w-full rounded-xl border-2 pr-11 text-sm font-semibold tabular-nums sm:w-[150px] sm:text-base",
                    isPinValid ? "border-primary bg-primary/5" :
                    pinError ? "border-destructive focus-visible:ring-destructive" :
                    "border-border bg-background",
                    (!intent || !cover) && "opacity-50"
                  )}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={requestLocationWithTimeout}
                      disabled={!intent || !cover || gpsLoading || submitting}
                      aria-label="Use my current GPS location"
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors",
                        "hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        "disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >
                      {gpsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Locate className="h-4 w-4" strokeWidth={2.4} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px]">
                    Use my current GPS location
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* GPS status / error / cached location helpers */}
            <div className="mt-3 flex flex-col items-center gap-1.5">
              {gpsLoading && !gpsError && (
                <p
                  className="inline-flex items-center gap-1.5 text-center text-[11px] font-semibold text-primary"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Detecting your location…
                </p>
              )}
              {gpsTimedOut && !cityName && !gpsError && (
                <p className="text-center text-[11px] text-muted-foreground" role="status">
                  Couldn't detect location — please enter your 6-digit PIN above.
                </p>
              )}
              {gpsError && (
                <p className="text-center text-[11px] text-destructive" role="alert">
                  {gpsError} — please enter your PIN above.
                </p>
              )}
              {cachedLocation && !gpsError && !gpsLoading && (
                <button
                  type="button"
                  onClick={useCachedLocation}
                  disabled={!intent || !cover || submitting}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <MapPin className="h-3 w-3" strokeWidth={2.4} />
                  Use last location · {cachedLocation}
                </button>
              )}
            </div>

            {/* PIN live validation message */}
            <p
              id="start-pin-help"
              className={cn(
                "mt-3 text-center text-[12px]",
                pinError ? "text-destructive" :
                isPinValid ? "text-primary font-semibold" :
                "text-muted-foreground"
              )}
              role={pinError ? "alert" : undefined}
              aria-live="polite"
            >
              {!intent || !cover
                ? ""
                : pinError
                ? pinError
                : isPinValid
                ? "✓ Great — finding your nearest agents…"
                : gpsLoading
                ? "Detecting GPS… you can also type your 6-digit PIN above."
                : (gpsError || gpsTimedOut)
                ? "Location unavailable — type your 6-digit PIN code above to continue."
                : "Type your 6-digit PIN code, or tap the 📍 GPS icon inside the box on the right to auto-detect. If GPS is blocked, just enter your PIN."}
            </p>


            {/* Trust strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-center">
              {[
                { v: "1,000+", l: "Verified Agents" },
                { v: "1L+", l: "Families Served" },
                { v: "4.8★", l: "Avg Rating" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-sm font-extrabold text-foreground tabular-nums sm:text-base">{s.v}</div>
                  <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Agent self-register link — subtle, like "Have a Promo Code?" */}
            <div className="mt-5 flex items-center justify-center sm:mt-6">
              <button
                type="button"
                onClick={() => navigate("/register?type=agent")}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
                <span>
                  I am an Insurance Agent —{" "}
                  <span className="font-semibold text-primary underline-offset-4 hover:underline">
                    Register here
                  </span>
                </span>
              </button>
            </div>

          </div>
        </section>

      </main>
    </div>
    </TooltipProvider>
  );
};

export default Start;
