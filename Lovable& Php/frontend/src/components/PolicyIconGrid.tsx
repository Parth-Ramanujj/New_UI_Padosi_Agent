import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Car, Building2, UserCheck, AlertTriangle, HeartPulse, TrendingUp, Clock, PiggyBank, Landmark, BarChart3, Truck, Bike, CarFront, Flame, Ship, HardHat, Users, FileText, Scale, Lock, MoreHorizontal, X, LucideIcon } from 'lucide-react';

interface SubOption {
  title: string;
  icon: LucideIcon;
  link: string;
}

interface PolicyCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  bgColor: string;
  hoverBg: string;
  subOptions: SubOption[];
}

const policyCategories: PolicyCategory[] = [
  {
    id: 'health', title: 'Health Insurance', icon: Heart, color: 'text-secondary', iconColor: 'text-secondary', bgColor: 'bg-secondary/8', hoverBg: 'hover:bg-secondary/5',
    subOptions: [
      { title: 'Mediclaim', icon: HeartPulse, link: '/agents?service=new-policy&type=health&sub=mediclaim' },
      { title: 'Personal Accident', icon: UserCheck, link: '/agents?service=new-policy&type=health&sub=personal-accident' },
      { title: 'Critical Illness', icon: AlertTriangle, link: '/agents?service=new-policy&type=health&sub=critical-illness' },
      { title: 'Super Top-up', icon: TrendingUp, link: '/agents?service=new-policy&type=health&sub=super-topup' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=health&sub=others' },
    ],
  },
  {
    id: 'life', title: 'Life Insurance', icon: Shield, color: 'text-secondary', iconColor: 'text-secondary', bgColor: 'bg-secondary/8', hoverBg: 'hover:bg-secondary/5',
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
    id: 'motor', title: 'Motor Insurance', icon: Car, color: 'text-secondary', iconColor: 'text-secondary', bgColor: 'bg-secondary/8', hoverBg: 'hover:bg-secondary/5',
    subOptions: [
      { title: 'Private Car', icon: CarFront, link: '/agents?service=new-policy&type=motor&sub=private-car' },
      { title: 'Two Wheeler', icon: Bike, link: '/agents?service=new-policy&type=motor&sub=two-wheeler' },
      { title: 'Commercial Vehicle', icon: Truck, link: '/agents?service=new-policy&type=motor&sub=commercial' },
      { title: '3 Wheeler', icon: Car, link: '/agents?service=new-policy&type=motor&sub=three-wheeler' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=motor&sub=others' },
    ],
  },
  {
    id: 'sme', title: 'SME Insurance', icon: Building2, color: 'text-secondary', iconColor: 'text-secondary', bgColor: 'bg-secondary/8', hoverBg: 'hover:bg-secondary/5',
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




const PolicyIconGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const subOptionsRef = React.useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryId: string) => {
    const newActive = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActive);
    if (newActive) {
      setTimeout(() => {
        subOptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div className="relative py-2">
      {/* Main Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
        {policyCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`relative flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 md:p-8 rounded-2xl transition-all duration-300 cursor-pointer group border aspect-square ${
                isActive 
                  ? 'bg-secondary/5 border-secondary/20 shadow-md' 
                  : 'bg-card border-border/40 hover:bg-secondary/5 hover:border-secondary/20 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'bg-secondary/12' 
                  : 'bg-secondary/8 group-hover:bg-secondary/12'
              }`}>
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 ${
                  isActive ? 'text-secondary' : 'text-secondary/70 group-hover:text-secondary'
                }`} strokeWidth={1.8} />
              </div>
              
              <span className={`text-xs sm:text-sm font-semibold text-center leading-tight transition-all duration-300 ${
                isActive ? 'text-secondary-dark' : 'text-foreground/70 group-hover:text-secondary-dark'
              }`}>
                {category.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-options Panel */}
      {activeCategory && (
        <div ref={subOptionsRef} className="mt-6 sm:mt-8">
          {policyCategories
            .filter((cat) => cat.id === activeCategory)
            .map((category) => (
              <div 
                key={category.id}
                className="relative max-w-3xl mx-auto rounded-2xl bg-card p-5 sm:p-6 md:p-8 shadow-lg border border-border/50 animate-scale-in"
              >
                <button
                  onClick={() => setActiveCategory(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4 sm:mb-5 text-center">
                  Select {category.title} Type
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {category.subOptions.map((subOption, index) => {
                    const SubIcon = subOption.icon;
                    return (
                      <Link
                        key={subOption.title}
                        to={subOption.link}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group/sub opacity-0 animate-[bounce-in_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl hover:bg-primary/5 hover:shadow-sm transition-all duration-300 cursor-pointer">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-secondary/8 flex items-center justify-center group-hover/sub:bg-primary/10 group-hover/sub:scale-105 transition-all duration-300">
                            <SubIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary/70 group-hover/sub:text-primary transition-colors duration-300" strokeWidth={1.8} />
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium text-center leading-tight text-muted-foreground group-hover/sub:text-primary transition-colors">
                            {subOption.title}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PolicyIconGrid;
