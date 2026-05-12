import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart, Shield, Car, Building2, X, MapPin, Navigation, Loader2,
  ArrowRight, CheckCircle, HeartPulse, UserCheck, AlertTriangle, TrendingUp,
  Clock, PiggyBank, Landmark, BarChart3, Truck, Bike, CarFront, Flame, Ship,
  HardHat, Users, FileText, Scale, Lock, MoreHorizontal, LucideIcon,
} from "lucide-react";

/* ═══════════ TYPES ═══════════ */
type ServiceType = "new-policy" | "transfer-renew" | "claim" | "policy-review";

interface FindAgentWizardProps {
  open: boolean;
  onClose: () => void;
  /** Pre-select a service type to skip step 1 */
  defaultService?: ServiceType;
  /** Pre-select an insurance type to skip step 2 */
  defaultInsuranceType?: string;
}

/* ═══════════ DATA ═══════════ */
const serviceOptions: { key: ServiceType; label: string; description: string; color: string; bg: string }[] = [
  { key: "new-policy", label: "Buy New Policy", description: "Purchase a fresh insurance policy", color: "text-secondary", bg: "bg-secondary" },
  { key: "transfer-renew", label: "Transfer / Renew Policy", description: "Port or renew an existing policy", color: "text-primary", bg: "bg-primary" },
  { key: "policy-review", label: "Portfolio Audit", description: "Get your policies reviewed by experts", color: "text-review", bg: "bg-review" },
  { key: "claim", label: "Claim Assistance", description: "Get help with your insurance claim", color: "text-claim", bg: "bg-claim" },
];

const insuranceTypes: { label: string; icon: LucideIcon; slug: string; color: string }[] = [
  { label: "Health", icon: Heart, slug: "health", color: "bg-rose-50 text-rose-600 border-rose-200" },
  { label: "Life", icon: Shield, slug: "life", color: "bg-violet-50 text-violet-600 border-violet-200" },
  { label: "Motor", icon: Car, slug: "motor", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { label: "SME", icon: Building2, slug: "sme", color: "bg-amber-50 text-amber-600 border-amber-200" },
];

/* Sub-products per insurance type (for new-policy) */
const subProducts: Record<string, { title: string; icon: LucideIcon }[]> = {
  health: [
    { title: "Mediclaim", icon: HeartPulse },
    { title: "Personal Accident", icon: UserCheck },
    { title: "Critical Illness", icon: AlertTriangle },
    { title: "Super Top-up", icon: TrendingUp },
    { title: "Others", icon: MoreHorizontal },
  ],
  life: [
    { title: "Term Plan", icon: Clock },
    { title: "Pension Plan", icon: Landmark },
    { title: "Guaranteed Plan", icon: Shield },
    { title: "Saving Plan", icon: PiggyBank },
    { title: "ULIP Plan", icon: BarChart3 },
    { title: "Others", icon: MoreHorizontal },
  ],
  motor: [
    { title: "Private Car", icon: CarFront },
    { title: "Two Wheeler", icon: Bike },
    { title: "Commercial Vehicle", icon: Truck },
    { title: "3 Wheeler", icon: Car },
    { title: "Others", icon: MoreHorizontal },
  ],
  sme: [
    { title: "Fire", icon: Flame },
    { title: "Marine/Transport", icon: Ship },
    { title: "Workmen Comp", icon: HardHat },
    { title: "GPA/GMC", icon: Users },
    { title: "Group Term", icon: FileText },
    { title: "Liability", icon: Scale },
    { title: "Cyber", icon: Lock },
    { title: "Others", icon: MoreHorizontal },
  ],
};

/* Companies per insurance type (for claim) */
const companiesByType: Record<string, string[]> = {
  health: [
    "Star Health", "Care Health", "HDFC ERGO Health", "ICICI Lombard", "Bajaj Allianz",
    "New India Assurance", "Max Bupa", "Niva Bupa", "Aditya Birla Health", "Tata AIG",
    "Reliance General", "Manipal Cigna", "National Insurance", "United India",
    "Oriental Insurance", "Cholamandalam MS", "Royal Sundaram", "SBI General",
    "Iffco Tokio", "MediBuddy Health", "Zuno General (formerly Edelweiss)",
    "Kotak Mahindra General", "Raheja QBE", "Liberty General", "Magma HDI",
    "Universal Sompo", "Go Digit", "Acko", "Future Generali", "Other",
  ],
  life: [
    "LIC", "HDFC Life", "ICICI Prudential", "SBI Life", "Max Life", "Bajaj Allianz Life",
    "Tata AIA", "Kotak Life", "Aditya Birla Sun Life", "PNB MetLife", "Canara HSBC",
    "Future Generali Life", "Exide Life (now HDFC Life)", "Aegon Life",
    "Bharti AXA Life (now HDFC Life)", "Edelweiss Tokio Life", "India First Life",
    "Pramerica Life", "Sahara Life", "Shriram Life", "Star Union Dai-ichi Life",
    "Aviva Life", "IDBI Federal Life", "Ageas Federal Life", "Bandhan Life", "Other",
  ],
  motor: [
    "Bajaj Allianz", "ICICI Lombard", "HDFC ERGO", "Tata AIG", "New India Assurance",
    "United India", "National Insurance", "Oriental Insurance", "Reliance General",
    "Cholamandalam MS", "Royal Sundaram", "Iffco Tokio", "SBI General",
    "Future Generali", "Bharti AXA (now ICICI Lombard)", "Kotak Mahindra General",
    "Liberty General", "Magma HDI", "Raheja QBE", "Shriram General",
    "Universal Sompo", "Acko", "Go Digit", "Zuno General", "Navi General", "Other",
  ],
  sme: [
    "ICICI Lombard", "HDFC ERGO", "Bajaj Allianz", "Tata AIG", "New India Assurance",
    "United India", "National Insurance", "Oriental Insurance", "Reliance General",
    "Cholamandalam MS", "Royal Sundaram", "Iffco Tokio", "SBI General",
    "Future Generali", "Kotak Mahindra General", "Liberty General",
    "Universal Sompo", "Magma HDI", "Go Digit", "Navi General", "Other",
  ],
};

const complaintTypes = [
  { value: "rejection", label: "Claim Rejection" },
  { value: "delay", label: "Claim Delay" },
  { value: "short-settled", label: "Short Settled" },
  { value: "mis-selling", label: "Mis-selling" },
];

const loaderSteps = [
  { text: "Matching your requirements..." },
  { text: "Searching in your Padosi..." },
  { text: "Found Expert PadosiAgents!" },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/,"");

/* ═══════════ COMPONENT ═══════════ */
const FindAgentWizard: React.FC<FindAgentWizardProps> = ({
  open, onClose, defaultService, defaultInsuranceType,
}) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // State
  const [service, setService] = useState<ServiceType | null>(defaultService || null);
  const [insuranceType, setInsuranceType] = useState<string | null>(defaultInsuranceType || null);
  const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>(defaultInsuranceType ? [defaultInsuranceType] : []);
  const [subProduct, setSubProduct] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [complaint, setComplaint] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCity, setGpsCity] = useState<string | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);

  // Reset on open
  useEffect(() => {
    if (open) {
      setService(defaultService || null);
      setInsuranceType(defaultInsuranceType || null);
      setSelectedReviewTypes(defaultInsuranceType ? [defaultInsuranceType] : []);
      setSubProduct(null);
      setCompany(null);
      setCompanySearch("");
      setComplaint(null);
      setPincode("");
      setGpsCity(null);
      setReviewConfirmed(false);
      setLoaderStep(0);
      setShowLoader(false);
    }
  }, [open, defaultService, defaultInsuranceType]);

  // Click outside to close (when not loading)
  useEffect(() => {
    if (!open || showLoader) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, showLoader, onClose]);

  // Loader timer
  useEffect(() => {
    if (!showLoader) return;
    const timers = [
      setTimeout(() => setLoaderStep(1), 1200),
      setTimeout(() => setLoaderStep(2), 2400),
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("service", service!);
        if (service === "policy-review" && selectedReviewTypes.length > 0) {
          params.set("type", selectedReviewTypes.join(","));
        } else if (insuranceType) {
          params.set("type", insuranceType);
        }
        if (subProduct) params.set("sub", slugify(subProduct));
        if (company) params.set("company", company);
        if (complaint) params.set("complaintType", complaint);
        if (pincode) params.set("pincode", pincode);
        if (gpsCity) params.set("city", gpsCity);
        params.set("openFilter", "true");
        navigate(`/agents?${params.toString()}`);
        onClose();
      }, 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showLoader, service, insuranceType, selectedReviewTypes, subProduct, company, complaint, pincode, gpsCity, navigate, onClose]);

  if (!open) return null;

  /* ── Determine current step ── */
  const getStep = () => {
    if (!service) return "service";
    if (service === "policy-review") {
      if (selectedReviewTypes.length === 0 || !reviewConfirmed) return "insurance-type";
      return "location";
    }
    if (!insuranceType) return "insurance-type";
    if (service === "new-policy") {
      if (!subProduct) return "sub-product";
      return "location";
    }
    if (service === "claim") {
      if (!company) return "company";
      if (!complaint) return "complaint";
      return "location";
    }
    // transfer-renew: service → type → location
    return "location";
  };

  const currentStep = getStep();

  const getTotalSteps = () => {
    if (!service) return 4;
    if (service === "new-policy") return 4; // service → type → sub → location
    if (service === "claim") return 5; // service → type → company → complaint → location
    return 3; // service → type(multi) → location  (transfer-renew & policy-review)
  };

  const getStepNumber = () => {
    if (currentStep === "service") return 1;
    if (currentStep === "insurance-type") return 2;
    if (service === "new-policy") return currentStep === "sub-product" ? 3 : 4;
    if (service === "claim") {
      if (currentStep === "company") return 3;
      if (currentStep === "complaint") return 4;
      return 5;
    }
    return 3; // policy-review / transfer-renew location
  };

  const goBack = () => {
    if (currentStep === "location") {
      if (service === "claim") { setComplaint(null); return; }
      if (service === "new-policy") { setSubProduct(null); return; }
      if (service === "policy-review") { setReviewConfirmed(false); return; }
      if (service === "transfer-renew") { setInsuranceType(null); return; }
    }
    if (currentStep === "complaint") { setCompany(null); setCompanySearch(""); return; }
    if (currentStep === "company") { setInsuranceType(null); return; }
    if (currentStep === "sub-product") { setInsuranceType(null); return; }
    if (currentStep === "insurance-type") { setService(null); return; }
  };

  const startSearch = () => setShowLoader(true);

  const handleGps = async () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.state_district || "Your area";
          setGpsCity(city);
          setPincode("");
          setGpsLoading(false);
          startSearch();
        } catch { setGpsLoading(false); }
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const accentBg = service === "new-policy" ? "bg-secondary" : service === "transfer-renew" ? "bg-primary" : service === "claim" ? "bg-claim" : service === "policy-review" ? "bg-review" : "bg-primary";

  /* ── Loader screen ── */
  if (showLoader) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/98 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-lg px-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            {loaderSteps.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${loaderStep > i ? "bg-primary text-primary-foreground" : loaderStep === i ? `${accentBg} text-white scale-110 animate-pulse` : "bg-muted text-muted-foreground"}`}>
                  {loaderStep > i ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-14 sm:w-20 h-0.5 rounded-full transition-all duration-700 ${loaderStep > i ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <p className={`text-center text-lg sm:text-xl font-semibold mb-8 transition-colors duration-300 ${loaderStep === 2 ? "text-primary" : "text-foreground"}`}>
            {loaderSteps[loaderStep]?.text}
          </p>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className={`overflow-hidden border border-border/40 transition-all duration-500 ${loaderStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Skeleton className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex-shrink-0 ${loaderStep === 2 ? "bg-primary/15" : ""}`} />
                    <div className="flex-1 space-y-2">
                      <Skeleton className={`h-4 w-28 sm:w-36 ${loaderStep === 2 ? "bg-primary/15" : ""}`} />
                      <Skeleton className="h-3 w-20 sm:w-24" />
                      <div className="flex gap-1.5"><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-5 w-12 rounded-full" /></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-6">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${loaderStep === 2 ? "bg-primary" : accentBg}`} style={{ width: `${((loaderStep + 1) / 3) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Main popup ── */
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div ref={ref} className="relative bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`${accentBg} px-5 py-4 sm:py-5 text-white flex-shrink-0`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10"><X className="h-5 w-5" /></button>
          <p className="text-xs font-medium text-white/80 mb-1">Step {getStepNumber()} of {getTotalSteps()}</p>
          <h3 className="text-lg sm:text-xl font-bold pr-8">Find Your PadosiAgent</h3>
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Back button */}
          {currentStep !== "service" && !defaultService && (
            <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
              <ArrowRight className="h-3 w-3 rotate-180" /> Back
            </button>
          )}
          {currentStep === "service" && defaultService && null}
          {currentStep !== "service" && defaultService && currentStep !== "insurance-type" && (
            <button onClick={goBack} className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
              <ArrowRight className="h-3 w-3 rotate-180" /> Back
            </button>
          )}

          {/* Step: Service Type */}
          {currentStep === "service" && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground mb-4">What do you need?</p>
              <div className="space-y-3">
                {serviceOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setService(opt.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] text-left ${
                      service === opt.key ? `border-current ${opt.color} bg-current/5` : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${opt.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-sm font-bold">{opt.label.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground">{opt.label}</span>
                      <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Insurance Type */}
          {currentStep === "insurance-type" && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground mb-1">
                {service === "policy-review" ? "Select insurance types to audit" : "What type of insurance?"}
              </p>
              {service === "policy-review" && (
                <p className="text-[11px] text-muted-foreground mb-4">You can select multiple types</p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {insuranceTypes
                  .filter((t) => service !== "transfer-renew" || t.slug !== "life")
                  .map((t) => {
                  const Icon = t.icon;
                  const isSelected = service === "policy-review"
                    ? selectedReviewTypes.includes(t.slug)
                    : insuranceType === t.slug;

                  return (
                    <button
                      key={t.slug}
                      onClick={() => {
                        if (service === "policy-review") {
                          setSelectedReviewTypes((prev) =>
                            prev.includes(t.slug) ? prev.filter((s) => s !== t.slug) : [...prev, t.slug]
                          );
                        } else {
                          setInsuranceType(t.slug);
                        }
                      }}
                      className={`relative flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] ${
                        isSelected ? `${t.color} border-current shadow-md` : `${t.color} border-transparent`
                      }`}
                    >
                      {isSelected && service === "policy-review" && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-review flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.6} />
                      <span className="text-sm font-bold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              {service === "policy-review" && selectedReviewTypes.length > 0 && !reviewConfirmed && (
                <Button
                  onClick={() => setReviewConfirmed(true)}
                  className="w-full mt-4 bg-review hover:bg-review/90 text-white font-bold rounded-xl"
                >
                  Continue with {selectedReviewTypes.length} type{selectedReviewTypes.length > 1 ? "s" : ""}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Step: Sub-product (new-policy only) */}
          {currentStep === "sub-product" && insuranceType && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground mb-4">Select product type</p>
              <div className="grid grid-cols-3 gap-2.5">
                {subProducts[insuranceType]?.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.title}
                      onClick={() => setSubProduct(sub.title)}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-border/40 hover:bg-secondary/5 hover:border-secondary/30 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary/8 flex items-center justify-center">
                        <SubIcon className="h-4 w-4 text-secondary/70" strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight text-muted-foreground">{sub.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Company (claim only) */}
          {currentStep === "company" && insuranceType && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground mb-1">Which insurance company?</p>
              <p className="text-[11px] text-muted-foreground mb-4">Type to search or browse the full list</p>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Start typing company name..."
                  value={companySearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCompanySearch(val);
                    // Auto-select if typed name matches exactly
                    const exactMatch = (companiesByType[insuranceType] || []).find(
                      (c) => c.toLowerCase() === val.toLowerCase()
                    );
                    if (exactMatch) {
                      setCompany(exactMatch);
                      setCompanySearch(exactMatch);
                    } else {
                      setCompany(null);
                    }
                  }}
                  className="w-full h-12 text-sm rounded-xl"
                  autoFocus
                />
                {!company && (() => {
                  const allCompanies = companiesByType[insuranceType] || [];
                  const filtered = companySearch.length > 0
                    ? allCompanies.filter((c) => c.toLowerCase().includes(companySearch.toLowerCase()))
                    : allCompanies;
                  return filtered.length > 0 ? (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filtered.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCompany(c);
                            setCompanySearch(c);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg p-3 text-center text-sm text-muted-foreground">
                      No companies found
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Step: Complaint Type (claim only) */}
          {currentStep === "complaint" && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground mb-1">What is your complaint?</p>
              <p className="text-[11px] text-muted-foreground mb-4">Select the type of issue you're facing</p>
              <div className="grid grid-cols-2 gap-3">
                {complaintTypes.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setComplaint(ct.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border hover:border-claim/40 hover:bg-claim/5 hover:shadow-md transition-all duration-300"
                  >
                    <span className="text-sm font-semibold text-foreground">{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Location */}
          {currentStep === "location" && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground mb-1">Where are you located?</p>
              <p className="text-xs text-muted-foreground mb-4">Help us find agents near you</p>
              <button
                onClick={handleGps}
                disabled={gpsLoading}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08] transition-all duration-300 mb-3 ${gpsLoading ? "opacity-70" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {gpsLoading ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <Navigation className="h-5 w-5 text-primary" />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-foreground">{gpsLoading ? "Detecting..." : "Use My Location"}</span>
                  <p className="text-[10px] text-muted-foreground">Auto-detect via GPS</p>
                </div>
              </button>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="pl-9 h-11 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && pincode.length >= 5 && startSearch()}
                  />
                </div>
                <Button
                  onClick={() => pincode.length >= 5 && startSearch()}
                  disabled={pincode.length < 5}
                  className={`${accentBg} text-white h-11 px-5 font-bold`}
                >
                  Go
                </Button>
              </div>
              <button
                onClick={startSearch}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-4 underline underline-offset-2"
              >
                Skip, show all agents
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindAgentWizard;

/* ═══════════ HOOK for easy usage ═══════════ */
export const useFindAgentWizard = () => {
  const [wizardState, setWizardState] = useState<{
    open: boolean;
    defaultService?: ServiceType;
    defaultInsuranceType?: string;
  }>({ open: false });

  const openWizard = (defaultService?: ServiceType, defaultInsuranceType?: string) => {
    setWizardState({ open: true, defaultService, defaultInsuranceType });
  };

  const closeWizard = () => {
    setWizardState({ open: false });
  };

  return { wizardState, openWizard, closeWizard };
};
