/**
 * Service-specific Matching & Sorting Algorithm
 * 
 * NEW POLICY: Insurance Type (30%) + Location/Distance (30%) + Base (30%) + Bundle [Exp+Lang+Rating+Professional] (10%)
 * CLAIMS ASSISTANCE: Claims opt-in (25%) + Professional (20%) + Claims Settled (15%) + Claims Amount (15%) + Base (15%) + Bundle [Exp+Location+Rating+ClientBase] (10%)
 * POLICY REVIEW: Portfolio opt-in (20%) + Professional (20%) + Multi-product (20%) + Experience (15%) + Client Base (15%) + Bundle [ClaimsSettled+Location+Rating] (10%)
 * 
 * Goal: Top 5 agents should score 95%+
 */

export type ServiceType = 'New Policy' | 'Transfer/Renew Policy' | 'Claim Assistance' | 'Policy Review' | 'all';

export interface MatchingInput {
  agentLocation: string;
  agentSpecializations: string[];
  agentLanguages?: string[];
  agentExperience: number;
  agentRating: number;
  agentReviewCount?: number;
  agentClaimsSettled?: number;
  agentClaimsAmountCr?: number;
  agentClientBase?: number;
  agentInsuranceCompanies?: string[];
  isProfessionalPlan?: boolean;
  wantsClaimsLeads?: boolean;
  wantsPortfolioLeads?: boolean;

  userCity?: string;
  userInsuranceType?: string;
  userInsuranceTypes?: string[];
  userLanguages?: string[];
  userInsuranceCompany?: string;
  distanceKm?: number | null;

  serviceType?: ServiceType;
}

// ─── NEW POLICY SCORING (total 100) ───
// Insurance Type (30) + Location (30) + Base (30) + Bundle (10)
function calculateNewPolicyScore(input: MatchingInput): number {
  let score = 0;

  // 1. Insurance Type Match (30 pts)
  score += getInsuranceTypeScore(input.agentSpecializations, input.userInsuranceType, 30);

  // 2. Location / Distance (30 pts)
  score += getDistanceScore(input.distanceKm, input.agentLocation, input.userCity, 30);

  // 3. Base score — all agents get this (30 pts)
  score += 30;

  // 4. Bundle: Experience + Language + Rating + Professional (10 pts total, 2.5 each)
  score += getExperienceScore(input.agentExperience, 2.5);
  score += getLanguageScore(input.agentLanguages, input.userLanguages, 2.5);
  score += getRatingReviewScore(input.agentRating, input.agentReviewCount, 2.5);
  score += input.isProfessionalPlan ? 2.5 : 0;

  return Math.min(Math.round(score), 99);
}

// ─── CLAIMS ASSISTANCE SCORING (total 100) ───
// Claims opt-in (25) + Professional (20) + Claims Settled (15) + Claims Amount (15) + Base (15) + Bundle (10)
function calculateClaimsScore(input: MatchingInput): number {
  let score = 0;

  // 1. Opted for claims leads (25 pts)
  if (input.wantsClaimsLeads) score += 25;

  // 2. Professional plan (20 pts)
  if (input.isProfessionalPlan) score += 20;

  // 3. Claims Settled number (15 pts)
  score += getClaimsSettledScore(input.agentClaimsSettled, 15);

  // 4. Claims Amount (15 pts)
  score += getClaimsAmountScore(input.agentClaimsAmountCr, 15);

  // 5. Base score (15 pts)
  score += 15;

  // 6. Bundle: Experience + Location + Rating + Client Base (10 pts total, 2.5 each)
  score += getExperienceScore(input.agentExperience, 2.5);
  score += getDistanceScore(input.distanceKm, input.agentLocation, input.userCity, 2.5);
  score += getRatingReviewScore(input.agentRating, input.agentReviewCount, 2.5);
  score += getClientBaseScore(input.agentClientBase, 2.5);

  return Math.min(Math.round(score), 99);
}

// ─── POLICY REVIEW SCORING (total 100) ───
// Portfolio opt-in (20) + Professional (20) + Multi-product (20) + Experience (15) + Client Base (15) + Bundle (10)
function calculatePolicyReviewScore(input: MatchingInput): number {
  let score = 0;

  // 1. Opted for portfolio leads (20 pts)
  if (input.wantsPortfolioLeads) score += 20;

  // 2. Professional plan (20 pts)
  if (input.isProfessionalPlan) score += 20;

  // 3. Multi-product match (20 pts)
  score += getMultiProductMatchScore(input.agentSpecializations, input.userInsuranceTypes, 20);

  // 4. Experience (15 pts)
  score += getExperienceScore(input.agentExperience, 15);

  // 5. Client Base (15 pts)
  score += getClientBaseScore(input.agentClientBase, 15);

  // 6. Bundle: Claims Settled + Location + Rating (10 pts total, ~3.33 each)
  score += getClaimsSettledScore(input.agentClaimsSettled, 3.33);
  score += getDistanceScore(input.distanceKm, input.agentLocation, input.userCity, 3.33);
  score += getRatingReviewScore(input.agentRating, input.agentReviewCount, 3.34);

  return Math.min(Math.round(score), 99);
}

// ─── MAIN ENTRY ───
export function calculateMatchingScore(input: MatchingInput): number {
  switch (input.serviceType) {
    case 'New Policy':
      return calculateNewPolicyScore(input);
    case 'Transfer/Renew Policy':
      return calculateNewPolicyScore(input);
    case 'Claim Assistance':
      return calculateClaimsScore(input);
    case 'Policy Review':
      return calculatePolicyReviewScore(input);
    default:
      return calculateNewPolicyScore(input);
  }
}

// ─── SCORING HELPERS (generous thresholds so top agents hit 95%+) ───

function getInsuranceTypeScore(specializations: string[], userType?: string, maxPts: number = 30): number {
  if (!userType || userType === 'all') return maxPts; // No filter = full score
  const normalizedUser = userType.toLowerCase();
  const hasMatch = specializations.some(s => s.toLowerCase().includes(normalizedUser));
  return hasMatch ? maxPts : maxPts * 0.1;
}

function getDistanceScore(
  distanceKm: number | null | undefined,
  agentLocation: string,
  userCity?: string,
  maxPts: number = 30
): number {
  // Actual distance: linear decay 0→50km
  if (distanceKm != null && distanceKm >= 0) {
    if (distanceKm <= 5) return maxPts;
    if (distanceKm >= 50) return maxPts * 0.1;
    const ratio = 1 - ((distanceKm - 5) / 45);
    return maxPts * Math.max(ratio, 0.1);
  }

  // Fallback: text matching — generous when no user location
  if (!userCity) return maxPts; // No location = full score
  const agentLoc = agentLocation.toLowerCase();
  const userLoc = userCity.toLowerCase();

  if (agentLoc.includes(userLoc) || userLoc.includes(agentLoc.split(',')[0].trim())) return maxPts;

  const metroGroups = [
    ['mumbai', 'pune', 'thane', 'navi mumbai'],
    ['delhi', 'ncr', 'gurgaon', 'noida', 'faridabad', 'ghaziabad'],
    ['bangalore', 'bengaluru', 'mysore'],
    ['chennai', 'coimbatore'],
    ['hyderabad', 'secunderabad'],
    ['kolkata', 'howrah'],
  ];
  for (const group of metroGroups) {
    if (group.some(c => agentLoc.includes(c)) && group.some(c => userLoc.includes(c))) return maxPts * 0.75;
  }

  const agentState = agentLoc.split(',').pop()?.trim() || '';
  const userState = userLoc.split(',').pop()?.trim() || '';
  if (agentState && userState && agentState === userState) return maxPts * 0.6;

  return maxPts * 0.2;
}

function getExperienceScore(years: number, maxPts: number = 10): number {
  if (years >= 12) return maxPts;
  if (years >= 9) return maxPts * 0.9;
  if (years >= 7) return maxPts * 0.8;
  if (years >= 5) return maxPts * 0.65;
  if (years >= 3) return maxPts * 0.5;
  return maxPts * 0.3;
}

function getLanguageScore(agentLangs?: string[], userLangs?: string[], maxPts: number = 10): number {
  if (!userLangs?.length || !agentLangs?.length) return maxPts; // No preference = full score
  const overlap = agentLangs.filter(l =>
    userLangs.some(ul => ul.toLowerCase() === l.toLowerCase())
  ).length;
  if (overlap >= 2) return maxPts;
  if (overlap === 1) return maxPts * 0.8;
  return maxPts * 0.3;
}

function getRatingReviewScore(rating: number, reviewCount?: number, maxPts: number = 10): number {
  const ratingPts = (rating / 5) * (maxPts * 0.6);
  const reviews = reviewCount || 0;
  let reviewPts = 0;
  if (reviews >= 80) reviewPts = maxPts * 0.4;
  else if (reviews >= 40) reviewPts = maxPts * 0.3;
  else if (reviews >= 15) reviewPts = maxPts * 0.2;
  else reviewPts = maxPts * 0.1;
  return Math.min(ratingPts + reviewPts, maxPts);
}

function getClaimsSettledScore(claimsSettled?: number, maxPts: number = 15): number {
  const claims = claimsSettled || 0;
  if (claims >= 200) return maxPts;
  if (claims >= 150) return maxPts * 0.9;
  if (claims >= 100) return maxPts * 0.75;
  if (claims >= 50) return maxPts * 0.5;
  return maxPts * 0.25;
}

function getClaimsAmountScore(amountCr?: number, maxPts: number = 10): number {
  const amt = amountCr || 0;
  if (amt >= 4) return maxPts;
  if (amt >= 2.5) return maxPts * 0.85;
  if (amt >= 1.5) return maxPts * 0.65;
  if (amt >= 0.5) return maxPts * 0.4;
  return maxPts * 0.15;
}

function getClientBaseScore(clientBase?: number, maxPts: number = 10): number {
  const base = clientBase || 0;
  if (base >= 500) return maxPts;
  if (base >= 250) return maxPts * 0.8;
  if (base >= 100) return maxPts * 0.6;
  if (base >= 50) return maxPts * 0.4;
  return maxPts * 0.2;
}

function getMultiProductMatchScore(agentSpecs: string[], userTypes?: string[], maxPts: number = 15): number {
  if (!userTypes?.length) return maxPts; // No filter = full score
  const matchCount = userTypes.filter(ut =>
    agentSpecs.some(as => as.toLowerCase().includes(ut.toLowerCase()))
  ).length;
  if (matchCount === 0) return maxPts * 0.1;
  const ratio = matchCount / userTypes.length;
  return Math.round(maxPts * ratio);
}

// ─── PARSE HELPERS ───
export function parseClaimsAmountCr(amountStr?: string): number {
  if (!amountStr) return 0;
  const match = amountStr.match(/([\d.]+)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (amountStr.toLowerCase().includes('cr')) return num;
  if (amountStr.toLowerCase().includes('lakh') || amountStr.toLowerCase().includes('lac')) return num / 100;
  return num;
}

export function parseClientBase(clientBaseStr?: string | null): number {
  if (!clientBaseStr) return 0;
  const match = clientBaseStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}
