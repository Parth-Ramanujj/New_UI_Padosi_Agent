import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  FileSearch,
  Heart,
  Loader2,
  Locate,
  MapPin,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWizard } from "@/contexts/WizardContext";

type HeroSearchEvent =
  | { type: "service_selected"; value: ServiceType }
  | { type: "cover_selected"; value: string; service: ServiceType | null }
  | { type: "location_gps_requested"; service: ServiceType | null; cover: string | null }
  | { type: "location_gps_success"; city: string }
  | { type: "location_gps_error"; reason: string }
  | { type: "location_pin_entered"; pincode: string; service: ServiceType | null; cover: string | null }
  | { type: "tile_opened"; tile: "service" | "insurance" | "location" };

const trackHeroSearchEvent = (event: HeroSearchEvent) => {
  try {
    // Push to dataLayer if GTM/GA is available
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    if (w.dataLayer && Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: `hero_search_${event.type}`, ...event });
    }
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[HeroSearch]", event.type, event);
    }
  } catch {
    // no-op
  }
};

type ServiceType = "new-policy" | "transfer-renew" | "claim" | "policy-review";
type SearchStep = "service" | "insurance" | "location" | null;

interface ServiceOption {
  key: ServiceType;
  label: string;
  short: string;
  icon: LucideIcon;
  accent: "secondary" | "primary" | "claim" | "review";
}

interface InsuranceOption {
  slug: string;
  label: string;
  icon: LucideIcon;
}

interface HeroSearchBarProps {
  lockService?: ServiceType;
  className?: string;
}

const ALL_SERVICES: ServiceOption[] = [
  { key: "new-policy", label: "Buy New Policy", short: "Buy New", icon: Briefcase, accent: "secondary" },
  { key: "transfer-renew", label: "Transfer / Renew Policy", short: "Transfer/Renew", icon: Shield, accent: "primary" },
  { key: "policy-review", label: "Portfolio Audit", short: "Audit", icon: FileSearch, accent: "review" },
  { key: "claim", label: "Claim Assistance", short: "Claim Help", icon: Shield, accent: "claim" },
];

const INSURANCE: InsuranceOption[] = [
  { slug: "health", label: "Health", icon: Heart },
  { slug: "life", label: "Life", icon: Shield },
  { slug: "motor", label: "Motor", icon: Car },
  { slug: "sme", label: "SME", icon: Building2 },
];

const accentClasses = (accent: ServiceOption["accent"]) => {
  switch (accent) {
    case "secondary":
      return { bg: "bg-secondary", softBg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30", ring: "ring-secondary/20" };
    case "primary":
      return { bg: "bg-primary", softBg: "bg-primary/10", text: "text-primary", border: "border-primary/30", ring: "ring-primary/20" };
    case "claim":
      return { bg: "bg-claim", softBg: "bg-claim/10", text: "text-claim", border: "border-claim/30", ring: "ring-claim/20" };
    case "review":
      return { bg: "bg-review", softBg: "bg-review/10", text: "text-review", border: "border-review/30", ring: "ring-review/20" };
  }
};

const HeroSearchBar: React.FC<HeroSearchBarProps> = ({ lockService, className = "" }) => {
  const navigate = useNavigate();
  const pinInputRef = useRef<HTMLInputElement>(null);

  const [service, setService] = useState<ServiceType | null>(lockService ?? null);
  const [insurance, setInsurance] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [gpsCity, setGpsCity] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<SearchStep>(lockService ? "insurance" : null);
  const [isNavigating, setIsNavigating] = useState(false);

  const serviceOptions = useMemo(
    () => (lockService ? ALL_SERVICES.filter((option) => option.key === lockService) : ALL_SERVICES.filter((option) => option.key !== "claim")),
    [lockService]
  );

  const currentService = ALL_SERVICES.find((option) => option.key === service) ?? null;
  const currentInsurance = INSURANCE.find((option) => option.slug === insurance) ?? null;
  const accent = currentService ? accentClasses(currentService.accent) : accentClasses("secondary");
  const hasLocation = Boolean(gpsCity) || pincode.length === 6;
  const canSearch = Boolean(service && insurance && hasLocation && !isNavigating);
  const showLocationPanel = activeStep === "location" || (!!service && !!insurance && !hasLocation) || !!gpsError;

  useEffect(() => {
    if (lockService) {
      setService(lockService);
      setActiveStep((prev) => prev ?? "insurance");
    }
  }, [lockService]);

  useEffect(() => {
    if (showLocationPanel) {
      const timer = window.setTimeout(() => pinInputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
  }, [showLocationPanel]);

  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || "Your area";
    } catch {
      return null;
    }
  };

  const navigateToAgents = ({
    nextService = service,
    nextInsurance = insurance,
    nextPincode = pincode,
    nextCity = gpsCity,
  }: {
    nextService?: ServiceType | null;
    nextInsurance?: string | null;
    nextPincode?: string;
    nextCity?: string | null;
  } = {}) => {
    if (isNavigating || !nextService || !nextInsurance) return;
    if (!nextCity && nextPincode.length !== 6) return;

    const params = new URLSearchParams();
    params.set("service", nextService);
    params.set("type", nextInsurance);
    params.set("openFilter", "true");
    params.set("advanced", "true");
    if (nextPincode.length === 6) params.set("pincode", nextPincode);
    if (nextCity) params.set("city", nextCity);

    setIsNavigating(true);
    setActiveStep(null);
    window.setTimeout(() => navigate(`/agents?${params.toString()}`), 140);
  };

  const handleSelectService = (nextService: ServiceType) => {
    trackHeroSearchEvent({ type: "service_selected", value: nextService });
    setService(nextService);
    setInsurance(null);
    setGpsError(null);
    setIsNavigating(false);
    setActiveStep("insurance");
  };

  const handleSelectInsurance = (nextInsurance: string) => {
    trackHeroSearchEvent({ type: "cover_selected", value: nextInsurance, service });
    setInsurance(nextInsurance);
    setGpsError(null);
    setIsNavigating(false);

    if (gpsCity || pincode.length === 6) {
      navigateToAgents({ nextInsurance, nextPincode: pincode, nextCity: gpsCity });
      return;
    }

    setActiveStep("location");
  };

  const handlePincodeChange = (value: string) => {
    const nextPincode = value.replace(/\D/g, "").slice(0, 6);
    setPincode(nextPincode);
    setGpsCity(null);
    setGpsError(null);
    setIsNavigating(false);

    if (nextPincode.length === 6 && service && insurance) {
      trackHeroSearchEvent({ type: "location_pin_entered", pincode: nextPincode, service, cover: insurance });
      navigateToAgents({ nextPincode, nextCity: null });
    }
  };

  const handleRequestGps = () => {
    if (isNavigating) return;

    trackHeroSearchEvent({ type: "location_gps_requested", service, cover: insurance });

    if (!navigator.geolocation) {
      trackHeroSearchEvent({ type: "location_gps_error", reason: "unsupported" });
      setGpsError("Location not supported on this device. Please enter your PIN code.");
      setActiveStep("location");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const city = await reverseGeocode(coords.latitude, coords.longitude);
        setGpsLoading(false);

        if (!city) {
          trackHeroSearchEvent({ type: "location_gps_error", reason: "reverse_geocode_failed" });
          setGpsError("We could not detect your area. Please enter your PIN code.");
          setActiveStep("location");
          return;
        }

        trackHeroSearchEvent({ type: "location_gps_success", city });
        setGpsCity(city);
        setPincode("");
        setIsNavigating(false);
        navigateToAgents({ nextCity: city, nextPincode: "" });
      },
      (error) => {
        setGpsLoading(false);
        trackHeroSearchEvent({ type: "location_gps_error", reason: error.code === 1 ? "permission_denied" : "fetch_failed" });
        setGpsError(
          error.code === 1
            ? "Location permission was denied. Please enter your PIN code."
            : "We could not fetch your location. Please enter your PIN code."
        );
        setActiveStep("location");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const sectionButtonClass = (isActive: boolean, isFilled: boolean) =>
    cn(
      "group flex-1 min-w-0 flex items-center gap-2 rounded-xl sm:rounded-full px-3 sm:px-4 py-2.5 text-left transition-all border",
      isActive ? `bg-muted/70 ${accent.border} shadow-sm` : "border-border/40 bg-transparent hover:bg-muted/40",
      !isActive && isFilled && accent.ring
    );

  return (
    <div className={cn("w-full", className)}>
      <TooltipProvider delayDuration={200}>
      <div className="relative rounded-2xl border border-border/50 bg-card/95 p-1.5 shadow-[0_4px_20px_-6px_hsl(var(--foreground)/0.08)] backdrop-blur-xl">
        {/* Mobile: tap anywhere on the bar to open the bottom-sheet flow */}
        <MobileTriggerOverlay lockService={lockService} />
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch">
          {/* ─── SERVICE TILE + DROPDOWN ─── */}
          {!lockService && (
            <Popover
              open={activeStep === "service"}
              onOpenChange={(open) => {
                if (open) trackHeroSearchEvent({ type: "tile_opened", tile: "service" });
                setActiveStep(open ? "service" : null);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={sectionButtonClass(activeStep === "service", !!currentService)}
                  aria-expanded={activeStep === "service"}
                >
                  <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", currentService ? accent.bg : "bg-muted")}>
                    {currentService ? (
                      <currentService.icon className="h-4 w-4 text-white" strokeWidth={2.4} />
                    ) : (
                      <Briefcase className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">Service</p>
                    <p className={cn("truncate text-sm font-bold", currentService ? "text-foreground" : "text-muted-foreground")}>{currentService ? currentService.short : "Select service"}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", activeStep === "service" && "rotate-180")} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={8}
                className="z-[60] w-[--radix-popover-trigger-width] min-w-[240px] rounded-xl border border-border/60 bg-card p-1 shadow-lg"
              >
                {serviceOptions.map((option) => {
                  const selected = service === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelectService(option.key)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        selected ? "bg-primary/10 text-foreground" : "hover:bg-muted text-foreground"
                      )}
                    >
                      <option.icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                      <span className="font-semibold">{option.label}</span>
                      {selected && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" strokeWidth={2.4} />}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          )}

          {/* ─── COVER TILE + DROPDOWN ─── */}
          <Popover
            open={activeStep === "insurance"}
            onOpenChange={(open) => {
              if (!service) return;
              if (open) trackHeroSearchEvent({ type: "tile_opened", tile: "insurance" });
              setActiveStep(open ? "insurance" : null);
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!service}
                className={sectionButtonClass(activeStep === "insurance", !!currentInsurance)}
                aria-expanded={activeStep === "insurance"}
              >
                <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", currentInsurance ? accent.bg : "bg-muted")}>
                  {currentInsurance ? (
                    <currentInsurance.icon className="h-4 w-4 text-white" strokeWidth={2.4} />
                  ) : (
                    <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">Cover</p>
                  <p className={cn("truncate text-sm font-bold", currentInsurance ? "text-foreground" : "text-muted-foreground")}>{currentInsurance ? currentInsurance.label : "Select cover"}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", activeStep === "insurance" && "rotate-180")} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              className="z-[60] w-[--radix-popover-trigger-width] min-w-[200px] rounded-xl border border-border/60 bg-card p-1 shadow-lg"
            >
              {INSURANCE.map((option) => {
                const selected = insurance === option.slug;
                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => handleSelectInsurance(option.slug)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      selected ? "bg-primary/10 text-foreground" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <option.icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                    <span className="font-semibold">{option.label}</span>
                    {selected && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" strokeWidth={2.4} />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>

          {/* ─── LOCATION TILE + DROPDOWN ─── */}
          <Popover
            open={showLocationPanel}
            onOpenChange={(open) => {
              if (!service || !insurance) return;
              if (open) trackHeroSearchEvent({ type: "tile_opened", tile: "location" });
              setActiveStep(open ? "location" : null);
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!service || !insurance}
                className={sectionButtonClass(activeStep === "location", hasLocation)}
                aria-expanded={showLocationPanel}
              >
                <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", hasLocation ? accent.bg : "bg-muted")}>
                  <MapPin className={cn("h-4 w-4", hasLocation ? "text-white" : "text-muted-foreground")} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">Location</p>
                  <p className={cn("truncate text-sm font-bold", hasLocation ? "text-foreground" : "text-muted-foreground")}>
                    {gpsCity || (pincode.length === 6 ? pincode : "PIN / GPS")}
                  </p>
                </div>
                {hasLocation ? <CheckCircle2 className={cn("h-4 w-4", accent.text)} strokeWidth={2.4} /> : <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showLocationPanel && "rotate-180")} />}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              className="z-[60] w-[--radix-popover-trigger-width] min-w-[240px] rounded-xl border border-border/60 bg-card p-2 shadow-lg"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                window.setTimeout(() => pinInputRef.current?.focus(), 50);
              }}
            >
              <div className="relative">
                <Input
                  ref={pinInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pincode}
                  onChange={(event) => handlePincodeChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && pincode.length === 6) {
                      event.preventDefault();
                      navigateToAgents();
                    }
                  }}
                  placeholder="Enter 6-digit PIN"
                  aria-label="Enter your 6-digit PIN code"
                  className={cn(
                    "h-11 w-full rounded-lg border-2 pr-10 text-sm font-semibold tabular-nums",
                    pincode.length === 6 ? "border-primary bg-primary/5" : "border-border bg-background"
                  )}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleRequestGps}
                      disabled={gpsLoading || isNavigating}
                      aria-label="Use my current GPS location"
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                        accent.text,
                        "hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >
                      {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" strokeWidth={2.4} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px]">Use my current GPS location</TooltipContent>
                </Tooltip>
              </div>
              {gpsError && (
                <p className="mt-1.5 px-1 text-[11px] text-destructive" role="alert">{gpsError}</p>
              )}
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            disabled={isNavigating}
            onClick={() => {
              if (canSearch) {
                navigateToAgents();
                return;
              }
              if (!service) { setActiveStep("service"); return; }
              if (!insurance) { setActiveStep("insurance"); return; }
              setActiveStep("location");
            }}
            className={cn("h-auto rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md sm:rounded-full", accent.bg, "hover:opacity-90")}
          >
            {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Find PadosiAgent</span>
            <span className="ml-2 sm:hidden">Find Agent</span>
          </Button>
        </div>
      </div>
      </TooltipProvider>
    </div>
  );
};

/**
 * On mobile, layers an invisible button over the entire HeroSearchBar so that
 * any tap opens the unified MobileFilterSheet flow instead of the inline
 * tile dropdowns. Desktop is unaffected.
 */
const MobileTriggerOverlay: React.FC<{ lockService?: ServiceType }> = ({ lockService }) => {
  const isMobile = useIsMobile();
  const { openWizard } = useWizard();
  if (!isMobile) return null;
  return (
    <button
      type="button"
      aria-label="Find an agent"
      onClick={() => openWizard(lockService)}
      className="absolute inset-0 z-10 sm:hidden rounded-2xl"
    />
  );
};

export default HeroSearchBar;
