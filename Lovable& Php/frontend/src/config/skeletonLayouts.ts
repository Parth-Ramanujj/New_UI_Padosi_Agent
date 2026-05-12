/**
 * Route → Skeleton layout mapping configuration.
 * Layouts are referenced by string keys; the actual components live in PageSkeleton.
 * Admin can override defaults via the Skeleton Mapping dashboard (persisted in localStorage).
 */

export type SkeletonLayoutKey =
  | "listing"
  | "article"
  | "form"
  | "content"
  | "hero-grid"
  | "start";

export const SKELETON_LAYOUTS: { key: SkeletonLayoutKey; label: string; description: string }[] = [
  { key: "hero-grid", label: "Hero + Grid", description: "Centered hero with card grid below" },
  { key: "listing", label: "Listing", description: "Search bar + result cards (agents, blogs, cities)" },
  { key: "article", label: "Article", description: "Long-form content with hero image" },
  { key: "form", label: "Form", description: "Centered card with input fields (auth pages)" },
  { key: "content", label: "Content", description: "Stacked text sections (about, contact, FAQ)" },
  { key: "start", label: "Start Wizard", description: "Centered wizard card (mirrors /start page)" },
];

/** Public routes that show a skeleton during lazy chunk load. */
export const PUBLIC_ROUTES: { path: string; label: string; default: SkeletonLayoutKey }[] = [
  { path: "/", label: "Home", default: "hero-grid" },
  { path: "/start", label: "Start Wizard", default: "start" },
  { path: "/login", label: "Login", default: "form" },
  { path: "/register", label: "Register", default: "form" },
  { path: "/admin-login", label: "Admin Login", default: "form" },
  { path: "/agents", label: "Agents Listing", default: "listing" },
  { path: "/blog", label: "Blog Index", default: "listing" },
  { path: "/blog/:id", label: "Blog Article", default: "article" },
  { path: "/about", label: "About Us", default: "content" },
  { path: "/contact", label: "Contact Us", default: "content" },
  { path: "/faq", label: "FAQ", default: "content" },
  { path: "/privacy-policy", label: "Privacy Policy", default: "content" },
  { path: "/terms-of-service", label: "Terms of Service", default: "content" },
  { path: "/claim-assistance", label: "Claim Assistance", default: "content" },
  { path: "/calculators", label: "Calculators", default: "hero-grid" },
  { path: "/blacklisted-agents", label: "Blacklisted Agents", default: "hero-grid" },
  { path: "/insurance-agents", label: "City Index", default: "listing" },
  { path: "/insurance-agents/:city", label: "City Landing", default: "listing" },
  { path: "/health-insurance", label: "Health Insurance", default: "listing" },
  { path: "/life-insurance", label: "Life Insurance", default: "listing" },
  { path: "/motor-insurance", label: "Motor Insurance", default: "listing" },
  { path: "/sme-insurance", label: "SME Insurance", default: "listing" },
  { path: "/travel-insurance", label: "Travel Insurance", default: "listing" },
  { path: "/home-insurance", label: "Home Insurance", default: "listing" },
];

const STORAGE_KEY = "skeleton-route-overrides";

export type SkeletonOverrides = Record<string, SkeletonLayoutKey>;

export const loadSkeletonOverrides = (): SkeletonOverrides => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveSkeletonOverrides = (overrides: SkeletonOverrides) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent("skeleton-overrides-changed"));
  } catch {
    /* ignore */
  }
};

/** Resolve a pathname to its layout key, applying overrides on top of defaults. */
export const resolveLayoutKey = (
  pathname: string,
  overrides: SkeletonOverrides = loadSkeletonOverrides()
): SkeletonLayoutKey => {
  // Exact match first
  const exact = PUBLIC_ROUTES.find((r) => r.path === pathname);
  if (exact) return overrides[exact.path] ?? exact.default;

  // Pattern matches for dynamic segments
  if (pathname.startsWith("/blog/")) {
    return overrides["/blog/:id"] ?? "article";
  }
  if (pathname.startsWith("/insurance-agents/")) {
    return overrides["/insurance-agents/:city"] ?? "listing";
  }
  return "hero-grid";
};
