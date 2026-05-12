export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
}

type BlogPostInput = Pick<BlogPost, 'id' | 'title' | 'excerpt' | 'category'> & Partial<BlogPost>;

const authorPool = [
  { name: 'Priya Sharma', img: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { name: 'Rajesh Kumar', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Anita Desai', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Vikram Patel', img: 'https://randomuser.me/api/portraits/men/78.jpg' },
  { name: 'Meera Singh', img: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Arjun Mehta', img: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { name: 'Kavita Joshi', img: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { name: 'Suresh Nair', img: 'https://randomuser.me/api/portraits/men/55.jpg' },
  { name: 'Deepa Rao', img: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { name: 'Amit Verma', img: 'https://randomuser.me/api/portraits/men/18.jpg' },
  { name: 'Sneha Kulkarni', img: 'https://randomuser.me/api/portraits/women/56.jpg' },
  { name: 'Rohit Gupta', img: 'https://randomuser.me/api/portraits/men/63.jpg' },
];

const imagePool = [
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
];

function getAuthor(i: number) {
  return authorPool[i % authorPool.length];
}
function getImage(i: number) {
  return imagePool[i % imagePool.length];
}
function getDate(i: number) {
  const base = new Date('2024-12-30');
  base.setDate(base.getDate() - i * 2);
  return base.toISOString().split('T')[0];
}
function getReadTime(i: number) {
  return `${4 + (i % 8)} min read`;
}

const blogPostsData: BlogPostInput[] = [
  // === HEALTH INSURANCE (25 articles) ===
  { id: 1, title: 'Understanding Health Insurance: A Complete Guide for 2025', excerpt: 'Learn everything about health insurance policies, coverage options, and how to choose the right plan for your family in India.', category: 'Health Insurance', featured: true },
  { id: 2, title: 'Family Floater vs Individual Health Insurance: Which Is Better?', excerpt: 'Compare family floater and individual health insurance plans to find the most cost-effective coverage for your household.', category: 'Health Insurance' },
  { id: 3, title: 'Top 10 Health Insurance Plans in India for 2025', excerpt: 'A detailed comparison of the best health insurance plans available in India, ranked by coverage, premiums, and claim settlement ratio.', category: 'Health Insurance' },
  { id: 4, title: 'How to Claim Health Insurance: Step-by-Step Process', excerpt: 'Navigate the health insurance claim process with ease using our detailed step-by-step guide for cashless and reimbursement claims.', category: 'Health Insurance' },
  { id: 5, title: 'Critical Illness Insurance: Why You Need It Beyond Health Cover', excerpt: 'Understand the difference between critical illness insurance and standard health policies, and why you may need both.', category: 'Health Insurance' },
  { id: 6, title: 'Health Insurance for Senior Citizens: Best Plans & Tips', excerpt: 'Find the best health insurance options for parents and senior citizens with comprehensive coverage and affordable premiums.', category: 'Health Insurance' },
  { id: 7, title: 'Pre-Existing Disease Cover in Health Insurance Explained', excerpt: 'Learn how pre-existing disease waiting periods work and which insurers offer the shortest waiting times.', category: 'Health Insurance' },
  { id: 8, title: 'Group Health Insurance for Employees: A Complete Guide', excerpt: 'Everything employers need to know about providing group health insurance benefits to their workforce.', category: 'Health Insurance' },
  { id: 9, title: 'Health Insurance Tax Benefits Under Section 80D', excerpt: 'Maximize your tax savings with health insurance premiums under Section 80D of the Income Tax Act.', category: 'Health Insurance' },
  { id: 10, title: 'Cashless vs Reimbursement Claims: Pros and Cons', excerpt: 'Understand the differences between cashless hospitalization and reimbursement claims to make informed decisions.', category: 'Health Insurance' },
  { id: 11, title: 'Top-Up and Super Top-Up Health Insurance Plans Explained', excerpt: 'Save on premiums by adding a top-up or super top-up plan over your existing health insurance coverage.', category: 'Health Insurance' },
  { id: 12, title: 'Maternity Health Insurance: Coverage, Waiting Period & Best Plans', excerpt: 'Plan for maternity expenses with the right health insurance that covers delivery, prenatal, and postnatal care.', category: 'Health Insurance' },
  { id: 13, title: 'Day Care Procedures Covered Under Health Insurance', excerpt: 'Know which day care treatments are covered under your health insurance policy without 24-hour hospitalization.', category: 'Health Insurance' },
  { id: 14, title: 'Health Insurance Portability: How to Switch Your Insurer', excerpt: 'Switch your health insurance provider without losing continuity benefits using portability guidelines.', category: 'Health Insurance' },
  { id: 15, title: 'No Claim Bonus in Health Insurance: How It Works', excerpt: 'Earn increased sum insured every claim-free year with no claim bonus benefits in health insurance.', category: 'Health Insurance' },
  { id: 16, title: 'Health Insurance for Diabetics: Options and Tips', excerpt: 'Find suitable health insurance coverage if you have diabetes, including plans with minimal exclusions.', category: 'Health Insurance' },
  { id: 17, title: 'Room Rent Capping in Health Insurance: What You Must Know', excerpt: 'Avoid claim deductions by understanding room rent sub-limits and choosing policies without capping.', category: 'Health Insurance' },
  { id: 18, title: 'OPD Coverage in Health Insurance: Is It Worth It?', excerpt: 'Evaluate whether OPD cover add-ons in health insurance plans provide real value for your medical expenses.', category: 'Health Insurance' },
  { id: 19, title: 'Personal Accident Insurance vs Health Insurance: Key Differences', excerpt: 'Understand how personal accident insurance complements your health cover for accidental injuries and disabilities.', category: 'Health Insurance' },
  { id: 20, title: 'Health Insurance Claim Rejection: Common Reasons & Solutions', excerpt: 'Avoid claim rejections by understanding the most common reasons insurers deny health insurance claims.', category: 'Health Insurance' },
  { id: 21, title: 'AYUSH Treatment Coverage in Health Insurance', excerpt: 'Learn which health insurance plans cover Ayurveda, Yoga, Unani, Siddha, and Homeopathy treatments.', category: 'Health Insurance' },
  { id: 22, title: 'Health Insurance for NRIs: Coverage Options in India', excerpt: 'NRIs can still get health insurance coverage in India. Learn about the best plans and eligibility criteria.', category: 'Health Insurance' },
  { id: 23, title: 'Mental Health Coverage in Insurance: What Licensed Mandates', excerpt: 'Licensed now mandates mental health coverage in health insurance. Know your rights and what is covered.', category: 'Health Insurance' },
  { id: 24, title: 'Waiting Period in Health Insurance: Types and How to Minimize', excerpt: 'Understand initial, specific disease, and PED waiting periods and strategies to minimize their impact.', category: 'Health Insurance' },
  { id: 25, title: 'Coronavirus and Health Insurance: Coverage Updates for 2025', excerpt: 'Updated information on COVID-19 coverage, testing, vaccination, and related hospitalization in health insurance plans.', category: 'Health Insurance' },

  // === LIFE INSURANCE (25 articles) ===
  { id: 26, title: 'Term Insurance vs Whole Life Insurance: Detailed Comparison', excerpt: 'Choose between term and whole life insurance by understanding their features, benefits, and ideal use cases.', category: 'Life Insurance' },
  { id: 27, title: 'Top 5 Mistakes to Avoid When Buying Term Insurance', excerpt: 'Discover the common pitfalls people make when purchasing term insurance and how to avoid them.', category: 'Life Insurance' },
  { id: 28, title: 'How Much Life Insurance Coverage Do You Really Need?', excerpt: 'Calculate the ideal life insurance sum assured using the Human Life Value and income replacement methods.', category: 'Life Insurance' },
  { id: 29, title: 'ULIPs vs Mutual Funds: Which Investment Is Better?', excerpt: 'Compare ULIPs and mutual funds on returns, charges, tax benefits, and flexibility to make the right choice.', category: 'Life Insurance' },
  { id: 30, title: 'Endowment Plans: Are They Still Worth Buying in 2025?', excerpt: 'Evaluate whether traditional endowment plans offer competitive returns compared to other investment options.', category: 'Life Insurance' },
  { id: 31, title: 'Child Insurance Plans: Securing Your Child\'s Future', excerpt: 'Plan your child\'s education and future milestones with the right child insurance plan from top insurers.', category: 'Life Insurance' },
  { id: 32, title: 'Pension Plans and Annuity: Planning for Retirement', excerpt: 'Build a secure retirement corpus with pension plans and understand how annuity payouts work.', category: 'Life Insurance' },
  { id: 33, title: 'Money Back Policy: How It Works and Who Should Buy', excerpt: 'Understand the survival benefits, maturity benefits, and suitability of money back insurance policies.', category: 'Life Insurance' },
  { id: 34, title: 'Life Insurance Riders: Add-Ons That Enhance Your Coverage', excerpt: 'Boost your life insurance with riders like accidental death, critical illness, and waiver of premium.', category: 'Life Insurance' },
  { id: 35, title: 'Life Insurance for Women: Special Plans and Benefits', excerpt: 'Explore life insurance plans designed for women with lower premiums and additional maternity benefits.', category: 'Life Insurance' },
  { id: 36, title: 'Term Insurance With Return of Premium: Is It Worth It?', excerpt: 'Evaluate TROP plans that refund all premiums at maturity versus pure term plans with lower costs.', category: 'Life Insurance' },
  { id: 37, title: 'LIC vs Private Life Insurers: Which Should You Choose?', excerpt: 'Compare LIC with private life insurance companies on claim settlement, returns, and customer service.', category: 'Life Insurance' },
  { id: 38, title: 'Life Insurance Claim Settlement Process Explained', excerpt: 'Know the complete life insurance claim process including documents required, timelines, and nominee rights.', category: 'Life Insurance' },
  { id: 39, title: 'Tax Benefits on Life Insurance Under Section 80C and 10(10D)', excerpt: 'Maximize tax deductions with life insurance premiums and enjoy tax-free maturity proceeds.', category: 'Life Insurance' },
  { id: 40, title: 'Joint Life Insurance Plans for Couples', excerpt: 'Cover both spouses under a single life insurance policy with joint life plans at lower premiums.', category: 'Life Insurance' },
  { id: 41, title: 'Increasing and Decreasing Term Insurance Explained', excerpt: 'Choose between increasing and decreasing sum assured term plans based on your financial obligations.', category: 'Life Insurance' },
  { id: 42, title: 'Life Insurance for Smokers: Higher Premiums and Alternatives', excerpt: 'Understand how smoking affects your life insurance premiums and tips to get better rates.', category: 'Life Insurance' },
  { id: 43, title: 'Freelancers and Self-Employed: Why You Need Life Insurance', excerpt: 'Protect your family\'s financial future as a freelancer with adequate life insurance coverage.', category: 'Life Insurance' },
  { id: 44, title: 'Surrendering Life Insurance: When and How to Do It', excerpt: 'Learn about surrender values, penalties, and alternatives before surrendering your life insurance policy.', category: 'Life Insurance' },
  { id: 45, title: 'Nomination vs Assignment in Life Insurance', excerpt: 'Understand the legal differences between nomination and assignment and their impact on claim payouts.', category: 'Life Insurance' },
  { id: 46, title: 'Group Term Life Insurance for Employers', excerpt: 'Offer affordable group term life insurance benefits to employees and understand the tax advantages.', category: 'Life Insurance' },
  { id: 47, title: 'Life Insurance Premium Calculator: How Premiums Are Determined', excerpt: 'Learn the factors that affect life insurance premiums including age, health, lifestyle, and coverage amount.', category: 'Life Insurance' },
  { id: 48, title: 'Micro Insurance: Affordable Coverage for Low-Income Families', excerpt: 'Licensed-regulated micro insurance products provide essential coverage at premiums as low as ₹50 per month.', category: 'Life Insurance' },
  { id: 49, title: 'Life Insurance Policy Revival: How to Revive a Lapsed Policy', excerpt: 'Don\'t lose your life insurance benefits. Learn how to revive a lapsed policy within the revival period.', category: 'Life Insurance' },
  { id: 50, title: 'Key Man Insurance: Protecting Your Business from Key Person Loss', excerpt: 'Safeguard your business against financial loss if a key employee or founder passes away unexpectedly.', category: 'Life Insurance' },

  // === MOTOR INSURANCE (20 articles) ===
  { id: 51, title: 'Motor Insurance Claims: Step-by-Step Process Explained', excerpt: 'A comprehensive guide to filing motor insurance claims efficiently and getting the maximum settlement.', category: 'Motor Insurance' },
  { id: 52, title: 'Comprehensive vs Third-Party Car Insurance: Full Comparison', excerpt: 'Understand the differences between comprehensive and third-party car insurance to choose the right coverage.', category: 'Motor Insurance' },
  { id: 53, title: 'No Claim Bonus in Motor Insurance: How to Maximize Savings', excerpt: 'Save up to 50% on your car insurance premium by maintaining a claims-free record and transferring NCB.', category: 'Motor Insurance' },
  { id: 54, title: 'Two-Wheeler Insurance: Everything You Need to Know', excerpt: 'Protect your bike or scooter with the right two-wheeler insurance plan. Compare top policies here.', category: 'Motor Insurance' },
  { id: 55, title: 'Add-On Covers in Car Insurance You Shouldn\'t Miss', excerpt: 'Enhance your car insurance with essential add-ons like zero depreciation, engine protect, and roadside assistance.', category: 'Motor Insurance' },
  { id: 56, title: 'How to Transfer Motor Insurance When Buying a Used Car', excerpt: 'Step-by-step guide to transferring car insurance from the previous owner when purchasing a second-hand vehicle.', category: 'Motor Insurance' },
  { id: 57, title: 'Electric Vehicle Insurance: Coverage and Premium Guide', excerpt: 'Insure your EV correctly with specialized electric vehicle insurance that covers battery and charging equipment.', category: 'Motor Insurance' },
  { id: 58, title: 'Motor Insurance for Commercial Vehicles: Fleet Coverage', excerpt: 'Comprehensive guide to insuring trucks, buses, and commercial fleets with the right motor insurance policies.', category: 'Motor Insurance' },
  { id: 59, title: 'IDV in Car Insurance: What Is Insured Declared Value?', excerpt: 'Understand how IDV affects your car insurance premium and claim payout, and how to set the right IDV.', category: 'Motor Insurance' },
  { id: 60, title: 'Cashless Car Repair: How Network Garages Work', excerpt: 'Get your car repaired without paying upfront at network garages under your comprehensive car insurance.', category: 'Motor Insurance' },
  { id: 61, title: 'Motor Insurance Renewal: Don\'t Let Your Policy Lapse', excerpt: 'Renew your motor insurance on time to avoid losing NCB benefits and driving without valid insurance.', category: 'Motor Insurance' },
  { id: 62, title: 'Hit and Run Accident: Insurance Claim Process in India', excerpt: 'Know your rights and the claim process if you\'re a victim of a hit-and-run accident in India.', category: 'Motor Insurance' },
  { id: 63, title: 'Depreciation in Car Insurance: How It Affects Your Claim', excerpt: 'Understand how depreciation reduces your claim amount and why zero-depreciation cover is important.', category: 'Motor Insurance' },
  { id: 64, title: 'Long-Term Motor Insurance: 3-Year vs Annual Policy', excerpt: 'Compare multi-year and annual motor insurance policies for cost savings and convenience.', category: 'Motor Insurance' },
  { id: 65, title: 'Motor Insurance for Vintage and Classic Cars', excerpt: 'Special insurance considerations for vintage and classic car owners including agreed value policies.', category: 'Motor Insurance' },
  { id: 66, title: 'Drunk Driving and Insurance: Will Your Claim Be Rejected?', excerpt: 'Learn the legal implications of drunk driving on your motor insurance claim and policy validity.', category: 'Motor Insurance' },
  { id: 67, title: 'Motor Insurance Premium Calculator: Factors That Affect Cost', excerpt: 'Understand the key factors that determine your car or bike insurance premium amount.', category: 'Motor Insurance' },
  { id: 68, title: 'Third-Party Motor Insurance: Legal Requirements in India', excerpt: 'Third-party motor insurance is mandatory by law in India. Know the minimum coverage requirements.', category: 'Motor Insurance' },
  { id: 69, title: 'Own Damage Cover: When You Need It Most', excerpt: 'Protect your vehicle against accidental damage, theft, fire, and natural disasters with own damage insurance.', category: 'Motor Insurance' },
  { id: 70, title: 'Motor Insurance Fraud: How to Protect Yourself', excerpt: 'Identify common motor insurance frauds and protect yourself from fake agents and inflated claims.', category: 'Motor Insurance' },

  // === SME INSURANCE (15 articles) ===
  { id: 71, title: 'Why Every Business Needs SME Insurance in 2025', excerpt: 'Protect your business from unexpected risks with comprehensive SME insurance coverage options.', category: 'SME Insurance' },
  { id: 72, title: 'Fire Insurance for Businesses: Complete Coverage Guide', excerpt: 'Safeguard your business premises, inventory, and equipment against fire damage with the right policy.', category: 'SME Insurance' },
  { id: 73, title: 'Professional Indemnity Insurance: Who Needs It?', excerpt: 'Doctors, lawyers, consultants, and other professionals need PI insurance to protect against liability claims.', category: 'SME Insurance' },
  { id: 74, title: 'Workmen Compensation Insurance: Employer\'s Legal Obligation', excerpt: 'Understand your legal duty to provide workmen compensation insurance and the coverage it offers.', category: 'SME Insurance' },
  { id: 75, title: 'Marine Insurance: Protecting Goods in Transit', excerpt: 'Cover your goods against loss or damage during transportation by sea, air, rail, or road.', category: 'SME Insurance' },
  { id: 76, title: 'Product Liability Insurance for Manufacturers', excerpt: 'Protect your manufacturing business against claims arising from defective products causing injury or damage.', category: 'SME Insurance' },
  { id: 77, title: 'Cyber Insurance for Small Businesses: A Must-Have in 2025', excerpt: 'Protect your business from data breaches, ransomware, and cyber attacks with comprehensive cyber insurance.', category: 'SME Insurance' },
  { id: 78, title: 'Directors and Officers (D&O) Liability Insurance', excerpt: 'Protect company directors and officers from personal liability arising from their management decisions.', category: 'SME Insurance' },
  { id: 79, title: 'Shop Insurance: Comprehensive Cover for Retail Businesses', excerpt: 'All-in-one insurance for shop owners covering fire, theft, burglary, and liability in a single policy.', category: 'SME Insurance' },
  { id: 80, title: 'Construction Insurance: Covering Project Risks', excerpt: 'Contractor all-risk and erection all-risk policies for construction companies and project developers.', category: 'SME Insurance' },
  { id: 81, title: 'Business Interruption Insurance: Recovery from Disasters', excerpt: 'Recover lost revenue and fixed costs when your business operations are disrupted by insured events.', category: 'SME Insurance' },
  { id: 82, title: 'Startup Insurance: Essential Policies for New Businesses', excerpt: 'The must-have insurance policies every startup founder should consider from day one.', category: 'SME Insurance' },
  { id: 83, title: 'Public Liability Insurance for Businesses', excerpt: 'Protect against third-party bodily injury or property damage claims at your business premises.', category: 'SME Insurance' },
  { id: 84, title: 'Equipment Breakdown Insurance for Businesses', excerpt: 'Cover the cost of repairing or replacing business equipment that breaks down due to mechanical failure.', category: 'SME Insurance' },
  { id: 85, title: 'Trade Credit Insurance: Protecting Against Bad Debts', excerpt: 'Secure your accounts receivable against customer defaults and insolvency with trade credit insurance.', category: 'SME Insurance' },

  // === TRAVEL INSURANCE (10 articles) ===
  { id: 86, title: 'Travel Insurance: Essential Coverage for International Trips', excerpt: 'Planning to travel abroad? Understand the importance of travel insurance and what coverage you need.', category: 'Travel Insurance' },
  { id: 87, title: 'Domestic Travel Insurance: Is It Worth Buying?', excerpt: 'Explore whether domestic travel insurance provides value for trips within India and what it covers.', category: 'Travel Insurance' },
  { id: 88, title: 'Student Travel Insurance for Study Abroad Programs', excerpt: 'Essential travel insurance coverage for students going abroad for higher education.', category: 'Travel Insurance' },
  { id: 89, title: 'Senior Citizen Travel Insurance: Best Plans for Elderly Travelers', excerpt: 'Find travel insurance plans that cater to elderly travelers with pre-existing condition coverage.', category: 'Travel Insurance' },
  { id: 90, title: 'Travel Insurance for Schengen Visa: Requirements & Best Plans', excerpt: 'Mandatory travel insurance requirements for Schengen visa applications and recommended plans.', category: 'Travel Insurance' },
  { id: 91, title: 'Adventure Sports Travel Insurance: Coverage for Thrill Seekers', excerpt: 'Standard travel insurance may not cover adventure sports. Know what specialized coverage you need.', category: 'Travel Insurance' },
  { id: 92, title: 'Flight Delay and Trip Cancellation Insurance Explained', excerpt: 'Get compensated for flight delays, cancellations, and trip interruptions with the right travel insurance.', category: 'Travel Insurance' },
  { id: 93, title: 'Lost Baggage Insurance: How to File a Claim', excerpt: 'Step-by-step process for claiming compensation for lost, stolen, or delayed baggage during travel.', category: 'Travel Insurance' },
  { id: 94, title: 'Multi-Trip Annual Travel Insurance: Save on Frequent Travel', excerpt: 'Frequent travelers can save significantly with annual multi-trip travel insurance policies.', category: 'Travel Insurance' },
  { id: 95, title: 'COVID-19 Travel Insurance: Updated Coverage in 2025', excerpt: 'Travel insurance policies covering COVID-19 related medical expenses, quarantine, and trip cancellation.', category: 'Travel Insurance' },

  // === INSURANCE TIPS (20 articles) ===
  { id: 96, title: 'How to Choose the Right Insurance Agent for Your Needs', excerpt: 'Tips and criteria for selecting a trustworthy insurance agent who can guide you through policy selection.', category: 'Insurance Tips' },
  { id: 97, title: '10 Insurance Mistakes That Can Cost You Lakhs', excerpt: 'Avoid these common insurance mistakes that could leave you underinsured or with rejected claims.', category: 'Insurance Tips' },
  { id: 98, title: 'Insurance Glossary: 50 Terms Every Policyholder Must Know', excerpt: 'Demystify insurance jargon with our comprehensive glossary of common insurance terms and definitions.', category: 'Insurance Tips' },
  { id: 99, title: 'How to Read Your Insurance Policy Document', excerpt: 'A guide to understanding the key sections of your insurance policy including exclusions and conditions.', category: 'Insurance Tips' },
  { id: 100, title: 'Insurance for Millennials: Why You Should Start Early', excerpt: 'Lock in lower premiums and build long-term financial security by buying insurance in your 20s and 30s.', category: 'Insurance Tips' },
  { id: 101, title: 'Online vs Offline Insurance: Which Is Better?', excerpt: 'Compare buying insurance online versus through an agent on price, service, and claim support.', category: 'Insurance Tips' },
  { id: 102, title: 'Insurance Claim Settlement Ratio: How to Interpret It', excerpt: 'Understand what claim settlement ratio means and how to use it when choosing an insurance company.', category: 'Insurance Tips' },
  { id: 103, title: 'Free Look Period in Insurance: Your 15-Day Safety Net', excerpt: 'Cancel your insurance policy within the free look period if you\'re not satisfied, with a full refund.', category: 'Insurance Tips' },
  { id: 104, title: 'Insurance Ombudsman: How to File a Complaint', excerpt: 'Step-by-step guide to approaching the Insurance Ombudsman when your insurer doesn\'t resolve your grievance.', category: 'Insurance Tips' },
  { id: 105, title: 'Bundling Insurance Policies: How to Save Money', excerpt: 'Combine multiple insurance policies from the same insurer to get loyalty discounts and simplified management.', category: 'Insurance Tips' },
  { id: 106, title: 'Insurance Audit: Reviewing Your Existing Coverage', excerpt: 'Conduct an annual insurance audit to ensure your coverage keeps pace with your evolving life needs.', category: 'Insurance Tips' },
  { id: 107, title: 'Licensed Consumer Rights Every Policyholder Should Know', excerpt: 'Know your rights as an insurance consumer under Licensed regulations for fair treatment and claim processing.', category: 'Insurance Tips' },
  { id: 108, title: 'Insurance During Recession: Should You Cut Coverage?', excerpt: 'Why cutting insurance during economic downturns is risky and how to optimize coverage affordably.', category: 'Insurance Tips' },
  { id: 109, title: 'Digital Insurance: How Technology Is Transforming the Industry', excerpt: 'From AI-powered underwriting to instant claims, discover how insurtech is revolutionizing insurance.', category: 'Insurance Tips' },
  { id: 110, title: 'Insurance for Gig Workers and Freelancers in India', excerpt: 'Non-traditional workers need insurance too. Explore coverage options for the gig economy workforce.', category: 'Insurance Tips' },
  { id: 111, title: 'How Inflation Affects Your Insurance Coverage', excerpt: 'Rising costs can erode your insurance coverage. Learn how to adjust your sum insured for inflation.', category: 'Insurance Tips' },
  { id: 112, title: 'Insurance Fraud in India: Red Flags and Prevention', excerpt: 'Recognize common insurance fraud schemes and protect yourself from fake policies and agents.', category: 'Insurance Tips' },
  { id: 113, title: 'Comparing Insurance Quotes: What to Look Beyond Price', excerpt: 'Price isn\'t everything. Learn to compare insurance policies on coverage, exclusions, and service quality.', category: 'Insurance Tips' },
  { id: 114, title: 'Insurance Planning for Newlyweds: Building Financial Security', excerpt: 'Essential insurance plans every newly married couple should consider for a secure future together.', category: 'Insurance Tips' },
  { id: 115, title: 'Understanding Insurance Premium Payment Modes', excerpt: 'Monthly, quarterly, half-yearly, or annual — choose the right premium payment frequency for your budget.', category: 'Insurance Tips' },

  // === HOME INSURANCE (10 articles) ===
  { id: 116, title: 'Home Insurance in India: Protecting Your Biggest Asset', excerpt: 'Safeguard your home against fire, natural disasters, theft, and more with comprehensive home insurance.', category: 'Home Insurance' },
  { id: 117, title: 'Renter\'s Insurance: Coverage for Tenants in India', excerpt: 'Even as a tenant, your belongings need protection. Explore renter\'s insurance options in India.', category: 'Home Insurance' },
  { id: 118, title: 'Home Insurance vs Home Loan Insurance: Key Differences', excerpt: 'Don\'t confuse home insurance with home loan protection. Understand what each covers and why you need both.', category: 'Home Insurance' },
  { id: 119, title: 'Natural Disaster Coverage in Home Insurance', excerpt: 'Are earthquakes, floods, and cyclones covered under your home insurance? Know the details.', category: 'Home Insurance' },
  { id: 120, title: 'How to Calculate the Right Sum Insured for Home Insurance', excerpt: 'Avoid under-insurance by correctly calculating the replacement cost of your home and belongings.', category: 'Home Insurance' },
  { id: 121, title: 'Home Insurance Claim Process: Documentation & Timeline', excerpt: 'File your home insurance claim smoothly with the right documentation and within required timelines.', category: 'Home Insurance' },
  { id: 122, title: 'Smart Home Devices and Insurance Premium Discounts', excerpt: 'Installing security cameras, smoke detectors, and smart locks can lower your home insurance premium.', category: 'Home Insurance' },
  { id: 123, title: 'Landlord Insurance: Protecting Your Rental Property', excerpt: 'Cover your rental property against damage, liability, and loss of rental income with landlord insurance.', category: 'Home Insurance' },
  { id: 124, title: 'Home Contents Insurance: Protecting Valuables Inside Your Home', excerpt: 'Insure your furniture, electronics, jewelry, and other valuables against theft, fire, and damage.', category: 'Home Insurance' },
  { id: 125, title: 'Affordable Home Insurance Plans Under ₹5,000 Per Year', excerpt: 'Budget-friendly home insurance options that provide essential coverage without breaking the bank.', category: 'Home Insurance' },

  // === FINANCIAL PLANNING (10 articles) ===
  { id: 126, title: 'Insurance as Part of Financial Planning: The Foundation', excerpt: 'Why insurance is the first building block of any sound financial plan before investments.', category: 'Financial Planning' },
  { id: 127, title: 'Emergency Fund + Insurance: The Ultimate Safety Net', excerpt: 'Build a 6-month emergency fund and pair it with the right insurance for complete financial protection.', category: 'Financial Planning' },
  { id: 128, title: 'Retirement Planning: Insurance Products for Your Golden Years', excerpt: 'Combine pension plans, annuities, and health insurance for a worry-free retirement.', category: 'Financial Planning' },
  { id: 129, title: 'Child Education Planning: Insurance + Investment Strategy', excerpt: 'Create a structured plan to fund your child\'s education using child plans and systematic investments.', category: 'Financial Planning' },
  { id: 130, title: 'Tax Planning with Insurance: Maximize Your Savings', excerpt: 'Strategically use insurance premiums to save taxes under Sections 80C, 80D, and 10(10D).', category: 'Financial Planning' },
  { id: 131, title: 'Estate Planning: How Insurance Simplifies Wealth Transfer', excerpt: 'Use life insurance as a tool for smooth wealth transfer and estate planning for your heirs.', category: 'Financial Planning' },
  { id: 132, title: 'Insurance for Single Parents: Essential Coverage Guide', excerpt: 'Single parents need robust insurance coverage. Here are the must-have policies and recommended amounts.', category: 'Financial Planning' },
  { id: 133, title: 'Financial Planning Checklist: Insurance Edition', excerpt: 'A comprehensive checklist to ensure you have all essential insurance policies in place at every life stage.', category: 'Financial Planning' },
  { id: 134, title: 'How Much of Your Income Should Go Toward Insurance?', excerpt: 'Financial experts recommend allocating 10-15% of income to insurance premiums. Learn how to optimize.', category: 'Financial Planning' },
  { id: 135, title: 'Insurance Gap Analysis: Are You Adequately Covered?', excerpt: 'Identify gaps in your current insurance portfolio and take steps to close them before it\'s too late.', category: 'Financial Planning' },
];

// Enrich with computed fields
export const blogPosts: BlogPost[] = blogPostsData.map((post, i) => {
  const author = getAuthor(i);
  return {
    ...post,
    author: post.author || author.name,
    authorImage: post.authorImage || author.img,
    date: post.date || getDate(i),
    readTime: post.readTime || getReadTime(i),
    image: post.image || getImage(i),
    featured: post.featured ?? false,
  };
});

export const blogCategories = [
  'All',
  'Health Insurance',
  'Life Insurance',
  'Motor Insurance',
  'SME Insurance',
  'Travel Insurance',
  'Home Insurance',
  'Insurance Tips',
  'Financial Planning',
];
