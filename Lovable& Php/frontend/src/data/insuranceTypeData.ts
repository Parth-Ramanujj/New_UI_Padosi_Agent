export interface InsuranceTypeData {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  benefits: string[];
  faqs: { q: string; a: string }[];
  relatedBlogIds: number[];
}

export const insuranceTypeData: InsuranceTypeData[] = [
  {
    slug: 'health-insurance',
    name: 'Health Insurance',
    metaTitle: 'Health Insurance Agents in India | Compare Plans with PadosiAgent',
    metaDescription: 'Find verified health insurance agents near you. Compare family floater, individual, senior citizen & critical illness plans. Get expert guidance from PadosiAgents.',
    heroTitle: 'Find the Best Health Insurance with Expert PadosiAgents',
    heroDescription: 'Health insurance protects you and your family from the financial burden of medical expenses. Connect with licensed health insurance experts who can help you choose the right plan.',
    benefits: ['Cashless hospitalization at 10,000+ network hospitals', 'Coverage for pre and post hospitalization expenses', 'Tax benefits under Section 80D up to ₹75,000', 'No Claim Bonus increases sum insured annually', 'Day care procedures covered without 24-hour hospitalization', 'AYUSH treatments now covered under Licensed mandate'],
    faqs: [
      { q: 'What is the best health insurance plan in India?', a: 'The best plan depends on your age, family size, and budget. Popular options include Star Health, Care Health, and Niva Bupa. A PadosiAgent can analyze your needs and recommend the ideal plan.' },
      { q: 'Is health insurance mandatory in India?', a: 'While not legally mandatory for individuals, it is highly recommended. Companies with 10+ employees must provide group health insurance under the Social Security Code 2020.' },
      { q: 'What is the waiting period for pre-existing diseases?', a: 'Most health insurance policies have a 2-4 year waiting period for pre-existing conditions. Some insurers offer policies with shorter waiting periods at slightly higher premiums.' },
      { q: 'Can I port my health insurance to another company?', a: 'Yes, Licensed allows health insurance portability. You can switch insurers without losing continuity benefits during the renewal period.' },
    ],
    relatedBlogIds: [1, 2, 3, 4, 5, 6, 7, 10, 11, 14],
  },
  {
    slug: 'life-insurance',
    name: 'Life Insurance',
    metaTitle: 'Life Insurance Agents in India | Term, ULIP & Endowment Plans',
    metaDescription: 'Connect with verified life insurance agents. Compare term insurance, ULIPs, endowment & pension plans. Get expert advice from licensed PadosiAgents.',
    heroTitle: 'Secure Your Family\'s Future with Expert Life Insurance Agents',
    heroDescription: 'Life insurance provides financial security for your loved ones. Connect with experienced agents who can help you choose between term plans, ULIPs, endowments, and pension plans.',
    benefits: ['Tax-free death benefit to nominees', 'Tax deduction under Section 80C up to ₹1.5 lakh', 'Maturity benefits exempt under Section 10(10D)', 'Rider options for comprehensive coverage', 'Loan facility against life insurance policies', 'Long-term wealth creation with market-linked plans'],
    faqs: [
      { q: 'How much life insurance coverage do I need?', a: 'Financial experts recommend coverage of 10-15 times your annual income. A PadosiAgent can help calculate your exact requirement using the Human Life Value method.' },
      { q: 'Is term insurance better than endowment?', a: 'Term insurance offers higher coverage at lower premiums but has no maturity benefit. Endowment plans provide both protection and savings. Your choice depends on your financial goals.' },
      { q: 'Can I buy life insurance after 50?', a: 'Yes, many insurers offer term plans up to age 65 and whole life plans beyond that. Premiums will be higher, and medical tests may be required.' },
      { q: 'What happens if I stop paying premiums?', a: 'Your policy may lapse after the grace period. However, you can revive it within the revival period (usually 2-5 years) by paying outstanding premiums with interest.' },
    ],
    relatedBlogIds: [26, 27, 28, 29, 30, 31, 34, 36, 37, 39],
  },
  {
    slug: 'motor-insurance',
    name: 'Motor Insurance',
    metaTitle: 'Motor Insurance Agents | Car & Bike Insurance Plans in India',
    metaDescription: 'Find motor insurance agents for car, bike & commercial vehicles. Compare comprehensive, third-party & own damage policies. licensed PadosiAgents.',
    heroTitle: 'Get the Best Motor Insurance from Trusted PadosiAgents',
    heroDescription: 'Motor insurance is mandatory by law in India. Whether you need car insurance, two-wheeler coverage, or commercial vehicle policies, our agents provide the best deals.',
    benefits: ['Third-party liability coverage (mandatory by law)', 'Own damage protection against accidents and theft', 'Cashless repairs at 10,000+ network garages', 'No Claim Bonus up to 50% premium discount', 'Personal accident cover for owner-driver', 'Add-ons: Zero depreciation, engine protect, roadside assistance'],
    faqs: [
      { q: 'Is comprehensive motor insurance necessary?', a: 'While only third-party insurance is mandatory, comprehensive coverage protects your vehicle against accidents, theft, fire, and natural disasters. It is highly recommended.' },
      { q: 'What is No Claim Bonus (NCB)?', a: 'NCB is a discount on your renewal premium for every claim-free year. It ranges from 20% to 50% and can be transferred when switching insurers.' },
      { q: 'Can I get motor insurance after my policy has lapsed?', a: 'Yes, but you will lose your NCB benefits. If the gap exceeds 90 days, you may need vehicle inspection before getting new coverage.' },
      { q: 'Does motor insurance cover flood damage?', a: 'Comprehensive policies cover flood damage. However, engine damage due to water ingress may require an engine protection add-on.' },
    ],
    relatedBlogIds: [51, 52, 53, 54, 55, 57, 59, 60, 63, 68],
  },
  {
    slug: 'sme-insurance',
    name: 'SME & Business Insurance',
    metaTitle: 'Business Insurance Agents | SME, Fire & Liability Insurance India',
    metaDescription: 'Find business insurance agents for fire, marine, liability & professional indemnity coverage. Protect your SME with licensed PadosiAgents.',
    heroTitle: 'Protect Your Business with Expert SME Insurance Agents',
    heroDescription: 'Small and medium enterprises face unique risks. From fire and marine to cyber and liability insurance, our agents provide comprehensive business protection.',
    benefits: ['Fire and property damage coverage', 'Marine insurance for goods in transit', 'Professional indemnity for service providers', 'Workmen compensation as per legal requirements', 'Business interruption coverage', 'Cyber insurance for digital businesses'],
    faqs: [
      { q: 'What insurance does my business need?', a: 'At minimum, consider fire insurance, liability insurance, and workmen compensation. Depending on your industry, you may also need marine, cyber, or professional indemnity coverage.' },
      { q: 'Is business insurance mandatory?', a: 'Workmen compensation is mandatory for all employers. Other types like fire and liability are not mandatory but strongly recommended to protect against financial losses.' },
      { q: 'How much does SME insurance cost?', a: 'Premiums vary based on business type, size, revenue, and coverage needed. A PadosiAgent can get you competitive quotes from multiple insurers.' },
      { q: 'Does business insurance cover natural disasters?', a: 'Standard fire insurance covers specific natural perils. For comprehensive natural disaster coverage, you may need an all-risk policy or specific add-ons.' },
    ],
    relatedBlogIds: [71, 72, 73, 74, 75, 77, 79, 81, 82, 83],
  },
  {
    slug: 'travel-insurance',
    name: 'Travel Insurance',
    metaTitle: 'Travel Insurance Agents | International & Domestic Travel Plans',
    metaDescription: 'Find travel insurance agents for international, domestic & student travel. Compare plans for medical coverage, trip cancellation & lost baggage.',
    heroTitle: 'Travel Worry-Free with Expert Travel Insurance Agents',
    heroDescription: 'Don\'t let unexpected events ruin your trip. Travel insurance covers medical emergencies, trip cancellations, lost baggage, and more.',
    benefits: ['Medical emergency coverage up to $500,000', 'Trip cancellation and interruption coverage', 'Lost, stolen, or delayed baggage compensation', 'Emergency evacuation and repatriation', 'Flight delay compensation', '24/7 worldwide assistance helpline'],
    faqs: [
      { q: 'Is travel insurance required for visa?', a: 'Yes, many countries including all Schengen nations require travel insurance with minimum €30,000 medical coverage for visa approval.' },
      { q: 'Does travel insurance cover COVID-19?', a: 'Most updated travel insurance plans now cover COVID-19 related hospitalization and quarantine expenses. Check the specific policy terms.' },
      { q: 'Can I buy travel insurance after booking flights?', a: 'Yes, you can buy travel insurance anytime before your trip departure date. However, buying early gives you better trip cancellation coverage.' },
      { q: 'What does travel insurance NOT cover?', a: 'Common exclusions include pre-existing conditions, adventure sports (without add-on), intoxication-related incidents, and travel to war zones.' },
    ],
    relatedBlogIds: [86, 87, 88, 89, 90, 91, 92, 93, 94, 95],
  },
  {
    slug: 'home-insurance',
    name: 'Home Insurance',
    metaTitle: 'Home Insurance Agents | Protect Your Property in India',
    metaDescription: 'Find home insurance agents to protect your property. Coverage for fire, theft, natural disasters & home contents. licensed PadosiAgents.',
    heroTitle: 'Protect Your Biggest Asset with Home Insurance Experts',
    heroDescription: 'Your home is your most valuable asset. Home insurance protects your property and belongings against fire, theft, natural disasters, and more.',
    benefits: ['Building structure protection against fire and disasters', 'Contents coverage for furniture and electronics', 'Theft and burglary protection', 'Natural disaster coverage including earthquakes and floods', 'Temporary accommodation during repairs', 'Landlord liability coverage for rental properties'],
    faqs: [
      { q: 'Is home insurance mandatory in India?', a: 'Home insurance is not legally mandatory in India. However, some home loan providers may require it as part of their terms.' },
      { q: 'Does home insurance cover earthquakes?', a: 'Standard home insurance covers earthquake damage as it falls under natural perils. Check your policy for specific coverage limits.' },
      { q: 'How is the sum insured calculated?', a: 'For the building, it\'s based on reconstruction cost. For contents, it\'s the replacement value of your belongings. A PadosiAgent can help you calculate accurately.' },
      { q: 'Can tenants get home insurance?', a: 'Yes, tenants can buy renter\'s insurance to protect their personal belongings, even if the landlord has building insurance.' },
    ],
    relatedBlogIds: [116, 117, 118, 119, 120, 121, 122, 123, 124, 125],
  },
];

export const getInsuranceTypeBySlug = (slug: string): InsuranceTypeData | undefined => {
  return insuranceTypeData.find(t => t.slug === slug);
};
