import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Shield, Car, Building2, HeartPulse, UserCheck, AlertTriangle, TrendingUp,
  Clock, PiggyBank, Landmark, BarChart3, Truck, Bike, CarFront, Flame, Ship,
  HardHat, Users, FileText, Scale, Lock, MoreHorizontal, X,
  ShieldCheck, PieChart, ClipboardCheck, Lightbulb, LucideIcon, ArrowRight,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import AgentLink from '@/components/AgentLink';
import AnimatedCTAButton from '@/components/AnimatedCTAButton';

/* ═══════════ TYPES ═══════════ */
interface SubOption { title: string; icon: LucideIcon; link: string; }
interface ServiceCategory {
  id: string; title: string; icon: LucideIcon;
  subOptions?: SubOption[];
  link?: string;
}

/* ═══════════ TABS ═══════════ */
type TabKey = 'new-policy' | 'transfer-renew' | 'policy-review';

const tabs: { key: TabKey; label: string; mobileLabel: string; color: string; activeBg: string; activeText: string; }[] = [
  { key: 'new-policy', label: 'Buy New Policy', mobileLabel: 'Buy New', color: 'border-secondary', activeBg: 'bg-secondary', activeText: 'text-white' },
  { key: 'transfer-renew', label: 'Transfer / Renew', mobileLabel: 'Transfer', color: 'border-primary', activeBg: 'bg-primary', activeText: 'text-white' },
  { key: 'policy-review', label: 'Portfolio Audit', mobileLabel: 'Audit', color: 'border-review', activeBg: 'bg-review', activeText: 'text-white' },
];

/* ═══════════ DATA ═══════════ */
const newPolicyCategories: ServiceCategory[] = [
  {
    id: 'health', title: 'Health Insurance', icon: Heart,
    subOptions: [
      { title: 'Mediclaim', icon: HeartPulse, link: '/agents?service=new-policy&type=health&sub=mediclaim' },
      { title: 'Personal Accident', icon: UserCheck, link: '/agents?service=new-policy&type=health&sub=personal-accident' },
      { title: 'Critical Illness', icon: AlertTriangle, link: '/agents?service=new-policy&type=health&sub=critical-illness' },
      { title: 'Super Top-up', icon: TrendingUp, link: '/agents?service=new-policy&type=health&sub=super-topup' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=health&sub=others' },
    ],
  },
  {
    id: 'life', title: 'Life Insurance', icon: Shield,
    subOptions: [
      { title: 'Term Plan', icon: Clock, link: '/agents?service=new-policy&type=life&sub=term' },
      { title: 'Pension Plan', icon: Landmark, link: '/agents?service=new-policy&type=life&sub=pension' },
      { title: 'Guaranteed Plan', icon: Shield, link: '/agents?service=new-policy&type=life&sub=guaranteed' },
      { title: 'Saving Plan', icon: PiggyBank, link: '/agents?service=new-policy&type=life&sub=saving' },
      { title: 'ULIP Plan', icon: BarChart3, link: '/agents?service=new-policy&type=life&sub=ulip' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=life&sub=others' },
    ],
  },
  {
    id: 'motor', title: 'Motor Insurance', icon: Car,
    subOptions: [
      { title: 'Private Car', icon: CarFront, link: '/agents?service=new-policy&type=motor&sub=private-car' },
      { title: 'Two Wheeler', icon: Bike, link: '/agents?service=new-policy&type=motor&sub=two-wheeler' },
      { title: 'Commercial Vehicle', icon: Truck, link: '/agents?service=new-policy&type=motor&sub=commercial' },
      { title: '3 Wheeler', icon: Car, link: '/agents?service=new-policy&type=motor&sub=three-wheeler' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=motor&sub=others' },
    ],
  },
  {
    id: 'sme', title: 'SME Insurance', icon: Building2,
    subOptions: [
      { title: 'Fire', icon: Flame, link: '/agents?service=new-policy&type=sme&sub=fire' },
      { title: 'Marine/Transport', icon: Ship, link: '/agents?service=new-policy&type=sme&sub=marine' },
      { title: 'Workmen Comp', icon: HardHat, link: '/agents?service=new-policy&type=sme&sub=workmen' },
      { title: 'GPA/GMC', icon: Users, link: '/agents?service=new-policy&type=sme&sub=gpa-gmc' },
      { title: 'Group Term', icon: FileText, link: '/agents?service=new-policy&type=sme&sub=group-term' },
      { title: 'Liability', icon: Scale, link: '/agents?service=new-policy&type=sme&sub=liability' },
      { title: 'Cyber', icon: Lock, link: '/agents?service=new-policy&type=sme&sub=cyber' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=sme&sub=others' },
    ],
  },
];

const reviewCategories: ServiceCategory[] = [
  { id: 'health', title: 'Health Insurance', icon: Heart, link: '/agents?service=policy-review&type=health&openFilter=true' },
  { id: 'life', title: 'Life Insurance', icon: Shield, link: '/agents?service=policy-review&type=life&openFilter=true' },
  { id: 'motor', title: 'Motor Insurance', icon: Car, link: '/agents?service=policy-review&type=motor&openFilter=true' },
  { id: 'sme', title: 'SME Insurance', icon: Building2, link: '/agents?service=policy-review&type=sme&openFilter=true' },
];

// Transfer / Renew — Life excluded per product requirement
const transferRenewCategories: ServiceCategory[] = [
  { id: 'health', title: 'Health Insurance', icon: Heart, link: '/agents?service=transfer-renew&type=health&openFilter=true' },
  { id: 'motor', title: 'Motor Insurance', icon: Car, link: '/agents?service=transfer-renew&type=motor&openFilter=true' },
  { id: 'sme', title: 'SME Insurance', icon: Building2, link: '/agents?service=transfer-renew&type=sme&openFilter=true' },
];

/* ═══════════ COMPONENT ═══════════ */
const InsuranceServicesHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('new-policy');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
  const subRef = React.useRef<HTMLDivElement>(null);

  const categories =
    activeTab === 'new-policy' ? newPolicyCategories
    : activeTab === 'transfer-renew' ? transferRenewCategories
    : reviewCategories;
  const accentColor =
    activeTab === 'new-policy' ? 'secondary'
    : activeTab === 'transfer-renew' ? 'primary'
    : 'review';

  const handleCategoryClick = (cat: ServiceCategory) => {
    if (activeTab === 'policy-review') {
      // Multi-select toggle for review tab
      setSelectedReviewTypes(prev =>
        prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
      );
      return;
    }
    if (cat.link) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const newId = expandedCategory === cat.id ? null : cat.id;
    setExpandedCategory(newId);
    if (newId) setTimeout(() => subRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const reviewCTALink = `/agents?service=policy-review&type=${selectedReviewTypes.join(',')}&openFilter=true`;

  const iconBg = `bg-${accentColor}/8`;
  const iconHoverBg = `bg-${accentColor}/12`;
  const iconColor = `text-${accentColor}/70`;
  const iconActiveColor = `text-${accentColor}`;
  const textActiveColor = `text-${accentColor}-dark`;
  const activeBorderColor = `border-${accentColor}/20`;
  const activeCardBg = `bg-${accentColor}/5`;

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight">
              Explore Our Insurance Services
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Find trusted experts and comprehensive care across multiple insurance services.
            </p>
          </div>
        </AnimatedSection>

        {/* Tab Switcher — HexaHealth style outlined pills */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex gap-2 sm:gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setExpandedCategory(null); setSelectedReviewTypes([]); }}
                className={`min-w-[90px] sm:min-w-[120px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border text-center ${
                  activeTab === tab.key
                    ? `${tab.activeBg} ${tab.activeText} border-transparent shadow-sm`
                    : 'bg-transparent border-border text-foreground/70 hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.mobileLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div className={`grid grid-cols-2 gap-4 sm:gap-6 mx-auto ${
          activeTab === 'transfer-renew' ? 'sm:grid-cols-3 max-w-2xl' : 'sm:grid-cols-4 max-w-3xl'
        }`}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategory === cat.id;
            const isReviewSelected = activeTab === 'policy-review' && selectedReviewTypes.includes(cat.id);
            const isActive = isExpanded || isReviewSelected;
            const hasSubOptions = !!cat.subOptions;
            const isMultiSelect = activeTab === 'policy-review';

            const card = (
              <div
                className={`flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 md:p-8 rounded-2xl transition-all duration-300 cursor-pointer group border relative ${
                  isActive
                    ? `${activeCardBg} ${activeBorderColor} shadow-md`
                    : `bg-card border-border/40 hover:${activeCardBg} hover:${activeBorderColor} hover:shadow-md`
                }`}
                onClick={isMultiSelect || hasSubOptions ? () => handleCategoryClick(cat) : undefined}
              >
                {isReviewSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-review flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? iconHoverBg : `${iconBg} group-hover:${iconHoverBg}`
                }`}>
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 ${
                    isActive ? iconActiveColor : `${iconColor} group-hover:${iconActiveColor}`
                  }`} strokeWidth={1.8} />
                </div>
                <span className={`text-xs sm:text-sm font-semibold text-center leading-tight transition-all duration-300 ${
                  isActive ? textActiveColor : `text-foreground/70 group-hover:${textActiveColor}`
                }`}>
                  {cat.title}
                </span>
              </div>
            );

            return (hasSubOptions || isMultiSelect) ? (
              <div key={cat.id}>{card}</div>
            ) : (
              <AgentLink key={cat.id} to={cat.link!} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                {card}
              </AgentLink>
            );
          })}
        </div>

        {/* Sub-options Panel (for new-policy tab) */}
        {expandedCategory && activeTab === 'new-policy' && (
          <div ref={subRef} className="mt-6 sm:mt-8">
            {newPolicyCategories.filter(c => c.id === expandedCategory).map((cat) => (
              <div key={cat.id} className="relative max-w-3xl mx-auto rounded-2xl bg-card p-5 sm:p-6 md:p-8 shadow-lg border border-border/50 animate-scale-in">
                <button onClick={() => setExpandedCategory(null)} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-all duration-200 hover:scale-110 hover:rotate-90">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4 sm:mb-5 text-center">Select {cat.title} Type</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {cat.subOptions?.map((sub, i) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link key={sub.title} to={sub.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group/sub opacity-0 animate-[bounce-in_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                        style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl hover:bg-primary/5 hover:shadow-sm transition-all duration-300">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-secondary/8 flex items-center justify-center group-hover/sub:bg-primary/10 group-hover/sub:scale-105 transition-all duration-300">
                            <SubIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary/70 group-hover/sub:text-primary transition-colors duration-300" strokeWidth={1.8} />
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium text-center leading-tight text-muted-foreground group-hover/sub:text-primary transition-colors">{sub.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA for claim/review tabs */}
        {activeTab === 'policy-review' && (
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="text-center mt-8">
              {activeTab === 'policy-review' && (
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedReviewTypes.length === 0
                    ? 'Select one or more insurance types above'
                    : `${selectedReviewTypes.length} type${selectedReviewTypes.length > 1 ? 's' : ''} selected`}
                </p>
              )}
              {activeTab === 'policy-review' && selectedReviewTypes.length === 0 ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground text-sm font-semibold opacity-60 cursor-not-allowed">
                  Find Insurance Expert <ArrowRight className="w-4 h-4" />
                </div>
              ) : (
                <AnimatedCTAButton
                  variant="review"
                  icon={ArrowRight}
                  href={activeTab === 'policy-review' ? reviewCTALink : `/agents?service=${activeTab}&openFilter=true`}
                >
                  Find Insurance Expert
                </AnimatedCTAButton>
              )}
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
};

export default InsuranceServicesHub;
