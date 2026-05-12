export type ComparisonStatus = 'yes' | 'no' | 'partial';

export interface ComparisonFeature {
  label: string;
  description: string;
  padosi: ComparisonStatus;
  online: ComparisonStatus;
  bank: ComparisonStatus;
  category?: string;
}

// Simplified, headline features shown on the home page
export const coreFeatures: ComparisonFeature[] = [
  { label: 'Personalised Advice', description: 'Tailored to your family needs', padosi: 'yes', online: 'no', bank: 'partial' },
  { label: 'Claim Assistance', description: 'Hands-on help when it matters', padosi: 'yes', online: 'no', bank: 'no' },
  { label: 'No Spam Calls', description: 'You initiate contact, always', padosi: 'yes', online: 'no', bank: 'no' },
  { label: 'Neighbourhood Trust', description: 'A local who knows your area', padosi: 'yes', online: 'no', bank: 'no' },
  { label: 'Zero Platform Fee', description: 'No hidden service charges', padosi: 'yes', online: 'yes', bank: 'yes' },
];

// Full detailed comparison shown on the dedicated compare page
export const detailedFeatures: ComparisonFeature[] = [
  // Advisory
  { category: 'Advisory & Guidance', label: 'Personalised Advice', description: 'Recommendations based on your family, income & goals', padosi: 'yes', online: 'no', bank: 'partial' },
  { category: 'Advisory & Guidance', label: 'Need Analysis', description: 'In-depth assessment before suggesting a policy', padosi: 'yes', online: 'no', bank: 'partial' },
  { category: 'Advisory & Guidance', label: 'Regional Language Support', description: 'Hindi & local languages for clear understanding', padosi: 'yes', online: 'partial', bank: 'partial' },
  { category: 'Advisory & Guidance', label: 'Face-to-Face Meetings', description: 'In-person consultation when you need one', padosi: 'yes', online: 'no', bank: 'partial' },

  // Claims
  { category: 'Claims & Service', label: 'Claim Assistance', description: 'End-to-end help during claim processing', padosi: 'yes', online: 'no', bank: 'no' },
  { category: 'Claims & Service', label: 'Documentation Help', description: 'Guidance on forms, proofs & follow-ups', padosi: 'yes', online: 'partial', bank: 'no' },
  { category: 'Claims & Service', label: 'Hospital Coordination', description: 'Cashless & reimbursement coordination', padosi: 'yes', online: 'no', bank: 'no' },
  { category: 'Claims & Service', label: 'Post-Sale Service', description: 'Renewals, endorsements & queries handled', padosi: 'yes', online: 'no', bank: 'partial' },

  // Trust
  { category: 'Trust & Transparency', label: 'No Spam Calls', description: 'You reach out — never the other way around', padosi: 'yes', online: 'no', bank: 'no' },
  { category: 'Trust & Transparency', label: 'Neighbourhood Trust', description: 'A local expert who knows your community', padosi: 'yes', online: 'no', bank: 'no' },
  { category: 'Trust & Transparency', label: 'Verified Reviews', description: 'Real reviews from neighbours & clients', padosi: 'yes', online: 'partial', bank: 'no' },
  { category: 'Trust & Transparency', label: 'Licensed Professionals', description: 'Qualified & licensed advisors only', padosi: 'yes', online: 'partial', bank: 'yes' },

  // Cost
  { category: 'Cost & Pricing', label: 'Zero Platform Fee', description: 'No hidden service charges', padosi: 'yes', online: 'yes', bank: 'yes' },
  { category: 'Cost & Pricing', label: 'Same Premium as Direct', description: 'You pay the same, get personal service free', padosi: 'yes', online: 'yes', bank: 'yes' },
  { category: 'Cost & Pricing', label: 'Unbiased Recommendations', description: 'Not pushed to sell only one company\u2019s product', padosi: 'yes', online: 'partial', bank: 'no' },
];

export const computeScore = (
  list: ComparisonFeature[],
  key: 'padosi' | 'online' | 'bank'
) => {
  const total = list.length;
  const score = list.reduce(
    (acc, f) => acc + (f[key] === 'yes' ? 1 : f[key] === 'partial' ? 0.5 : 0),
    0
  );
  return { score, total };
};
