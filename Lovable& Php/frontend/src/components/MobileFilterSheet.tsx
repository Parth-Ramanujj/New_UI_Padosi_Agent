import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  CheckCircle2,
  Loader2,
  MapPin,
  Locate,
  Briefcase,
  Shield,
  FileSearch,
  Heart,
  Car,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─────────── Types & Data ─────────── */
export type ServiceType = "new-policy" | "transfer-renew" | "claim" | "policy-review";
export type CoverType = "health" | "life" | "motor" | "sme";

interface ServiceOption {
  key: ServiceType;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

interface CoverOption {
  key: CoverType;
  label: string;
  icon: LucideIcon;
}

const SERVICES: ServiceOption[] = [
  { key: "new-policy", label: "Buy New Policy", description: "Purchase a fresh insurance policy", icon: Briefcase, accent: "bg-secondary" },
  { key: "transfer-renew", label: "Transfer / Renew Policy", description: "Port or renew an existing policy", icon: Shield, accent: "bg-primary" },
  { key: "policy-review", label: "Portfolio Audit", description: "Review of your policies", icon: FileSearch, accent: "bg-review" },
  { key: "claim", label: "Claim Assistance", description: "Help with an existing claim", icon: Shield, accent: "bg-claim" },
];

const COVERS: CoverOption[] = [
  { key: "health", label: "Health", icon: Heart },
  { key: "life", label: "Life", icon: Shield },
  { key: "motor", label: "Motor", icon: Car },
  { key: "sme", label: "SME", icon: Building2 },
];

const STEP_ADVANCE_MS = 150;
const LOADER_TOTAL_MS = 1100;

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  lockService?: ServiceType;
  lockCover?: CoverType;
  onComplete?: (params: URLSearchParams) => void;
  /** If provided, navigation uses this path; defaults to /agents */
  targetPath?: string;
}

type Step = "service" | "cover" | "location" | "loader";

const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  open,
  onClose,
  lockService,
  lockCover,
  onComplete,
  targetPath = "/agents",
}) => {
  const navigate = useNavigate();
  const pinRef = useRef<HTMLInputElement>(null);

  const [service, setService] = useState<ServiceType | null>(lockService ?? null);
  const [cover, setCover] = useState<CoverType | null>(lockCover ?? null);
  const [pin, setPin] = useState("");
  const [gpsCity, setGpsCity] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsTried, setGpsTried] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const initialStep: Step = lockService
    ? lockCover
      ? "location"
      : "cover"
    : "service";
  const [step, setStep] = useState<Step>(initialStep);

  /* Reset on open */
  useEffect(() => {
    if (!open) return;
    setService(lockService ?? null);
    setCover(lockCover ?? null);
    setPin("");
    setGpsCity(null);
    setGpsLoading(false);
    setGpsTried(false);
    setGpsError(null);
    setStep(lockService ? (lockCover ? "location" : "cover") : "service");
  }, [open, lockService, lockCover]);

  /* Lock body scroll when open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* When entering location step, auto-attempt GPS once */
  useEffect(() => {
    if (step !== "location" || gpsTried || gpsCity) return;
    setGpsTried(true);
    requestGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* If GPS fails, focus PIN input to open numeric keypad */
  useEffect(() => {
    if (step !== "location") return;
    if ((gpsError || (gpsTried && !gpsLoading && !gpsCity)) && !pin) {
      const t = setTimeout(() => pinRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [step, gpsError, gpsTried, gpsLoading, gpsCity, pin]);

  /* Auto-advance to loader when PIN is 6 digits */
  useEffect(() => {
    if (step === "location" && pin.length === 6 && service && cover) {
      const t = setTimeout(() => goToLoader(pin, null), STEP_ADVANCE_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step, service, cover]);

  /* Loader → navigate */
  useEffect(() => {
    if (step !== "loader") return;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (service) params.set("service", service);
      if (cover) params.set("type", cover);
      if (pin.length === 6) params.set("pincode", pin);
      if (gpsCity) params.set("city", gpsCity);
      params.set("openFilter", "true");
      params.set("advanced", "true");
      onClose();
      if (onComplete) onComplete(params);
      else navigate(`${targetPath}?${params.toString()}`);
    }, LOADER_TOTAL_MS);
    return () => clearTimeout(t);
  }, [step, service, cover, pin, gpsCity, navigate, onClose, onComplete, targetPath]);

  const goToLoader = (pinValue: string, city: string | null) => {
    if (city) setGpsCity(city);
    setStep("loader");
  };

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported on this device.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            "Your area";
          setGpsLoading(false);
          setGpsCity(city);
          setTimeout(() => goToLoader("", city), STEP_ADVANCE_MS);
        } catch {
          setGpsLoading(false);
          setGpsError("Could not detect your area. Please enter PIN.");
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Please enter PIN."
            : "Could not get GPS. Please enter PIN."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const handleSelectService = (key: ServiceType) => {
    setService(key);
    setTimeout(() => setStep("cover"), STEP_ADVANCE_MS);
  };

  const handleSelectCover = (key: CoverType) => {
    setCover(key);
    setTimeout(() => setStep("location"), STEP_ADVANCE_MS);
  };

  const handlePinChange = (raw: string) => {
    setPin(raw.replace(/\D/g, "").slice(0, 6));
  };

  if (!open) return null;

  const stepTitle =
    step === "service"
      ? "What do you need?"
      : step === "cover"
      ? "Select cover"
      : step === "location"
      ? "Where do you need help?"
      : "Finding agents…";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "loader") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Find an agent"
    >
      <div className="relative w-full max-w-md rounded-t-3xl bg-card shadow-2xl animate-slide-in-right sm:rounded-3xl sm:mb-4">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h3 className="text-lg font-bold text-foreground">{stepTitle}</h3>
          {step !== "loader" && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/70"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto px-5 pb-6">
          {/* SERVICE */}
          {step === "service" && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {SERVICES.map((opt) => {
                const selected = service === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectService(opt.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white",
                        opt.accent
                      )}
                    >
                      <opt.icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                    </div>
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.4} />
                    ) : (
                      <span className="h-5 w-5 rounded-full border-2 border-border" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* COVER */}
          {step === "cover" && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {COVERS.filter((opt) => service !== "transfer-renew" || opt.key !== "life").map((opt) => {
                const selected = cover === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectCover(opt.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    )}
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <opt.icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{opt.label}</p>
                    </div>
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.4} />
                    ) : (
                      <span className="h-5 w-5 rounded-full border-2 border-border" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* LOCATION */}
          {step === "location" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* GPS state */}
              <div className="rounded-2xl border-2 border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {gpsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <MapPin className="h-5 w-5" strokeWidth={2.4} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {gpsLoading
                        ? "Detecting your location…"
                        : gpsCity
                        ? gpsCity
                        : "Use my current location"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {gpsError ?? "We use GPS to match nearby agents."}
                    </p>
                  </div>
                  {!gpsLoading && !gpsCity && (
                    <button
                      type="button"
                      onClick={requestGps}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      aria-label="Use GPS"
                    >
                      <Locate className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Or */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Or
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* PIN */}
              <div>
                <label htmlFor="mfs-pin" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Enter PIN code
                </label>
                <Input
                  id="mfs-pin"
                  ref={pinRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="postal-code"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="6-digit PIN"
                  className={cn(
                    "h-14 rounded-xl border-2 text-center text-lg font-bold tabular-nums",
                    pin.length === 6 ? "border-primary bg-primary/5" : "border-border"
                  )}
                />
              </div>

              {pin.length > 0 && pin.length < 6 && (
                <Button
                  type="button"
                  disabled
                  className="h-12 w-full rounded-xl bg-muted text-muted-foreground"
                >
                  Enter {6 - pin.length} more digit{6 - pin.length === 1 ? "" : "s"}
                </Button>
              )}
            </div>
          )}

          {/* LOADER */}
          {step === "loader" && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 animate-fade-in">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Finding agents in your area…
              </p>
              <p className="text-[11px] text-muted-foreground">Hold on a second</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileFilterSheet;
