import React from 'react';
import { ShieldCheck, IndianRupee, LockKeyhole, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InfoTooltip from '@/components/InfoTooltip';
import { useWizard } from '@/contexts/WizardContext';
import AnimatedSection from '@/components/AnimatedSection';
import whyPadosiImg from '@/assets/why-padosiagent.jpg';

const features = [{
  title: "No Spam Calls",
  icon: ShieldCheck,
  description: "Only you can contact agents — they can't call you first. Your privacy, your control.",
  definition: "Only you can contact agents. They can't call you first.",
  accent: "primary",
}, {
  title: "100% Free Service",
  icon: IndianRupee,
  description: "No charges, no hidden fees. Completely free for insurance seekers, always.",
  definition: "Completely free. No hidden fees or charges.",
  accent: "secondary",
}, {
  title: "Data Safe & Secure",
  icon: LockKeyhole,
  description: "Your data is encrypted and never sold to third parties. Complete privacy guaranteed.",
  definition: "Your data is encrypted and never sold.",
  accent: "accent",
}, {
  title: "Nearby Verified Agents",
  icon: MapPin,
  description: "Licensed agents in your neighbourhood who understand your local needs.",
  definition: "Verified agents nearby who know your area.",
  accent: "accent",
}];

const stats = [
  { value: '0', label: 'Spam Calls' },
  { value: '₹0', label: 'Platform Fee' },
  { value: '100%', label: 'Licensed Agents' },
];

const WhyChooseUs = () => {
  const { openWizard } = useWizard();

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header — all viewports */}
        <AnimatedSection animation="fade-up">
          <div className="text-center lg:text-left mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary mb-3">Why PadosiAgent</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-foreground tracking-tight">Why Users Trust Their PadosiAgent</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0">The safest way to find your insurance expert — No Spam, No Fees, just trusted service</p>
          </div>
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-14">
          {/* Feature cards */}
          <div className="flex-1 w-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                    <InfoTooltip content={feature.definition}>
                      <div className="group flex flex-col p-5 sm:p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                        <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-300">
                          <Icon className="h-6 w-6 text-primary" strokeWidth={1.7} />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">{feature.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </InfoTooltip>
                  </AnimatedSection>
                );
              })}
            </div>

            <AnimatedSection animation="fade-up" delay={500}>
              <div className="mt-6 sm:mt-8 text-center lg:text-left">
                <Button onClick={() => openWizard()} className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 h-auto text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
                  Find My PadosiAgent Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Image + stats — visible on all viewports */}
          <AnimatedSection animation="fade-up" delay={200} className="hidden lg:block flex-shrink-0 w-full lg:w-[380px] xl:w-[420px]">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-border/20">
              <img
                src={whyPadosiImg}
                alt="Insurance agent meeting a family at their doorstep"
                loading="lazy"
                width={800}
                height={600}
                className="w-full h-52 sm:h-64 lg:h-full object-cover"
              />
              {/* Gradient overlay with stats */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-5 pt-12">
                <div className="flex justify-center gap-6 sm:gap-10">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <span className="text-lg sm:text-xl font-extrabold text-white">{stat.value}</span>
                      <p className="text-[10px] sm:text-xs text-white/70 font-medium mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
