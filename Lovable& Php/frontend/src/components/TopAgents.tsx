import React from 'react';
import { Star, MapPin, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from '@/components/AnimatedSection';
import { useWizard } from '@/contexts/WizardContext';

interface AgentCard {
  name: string;
  location: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  image: string;
  verified: boolean;
}

const topAgents: AgentCard[] = [
  { name: "Rajesh Sharma", location: "Mumbai", specialization: "Health & Life Insurance", experience: "12 yrs", rating: 4.9, reviews: 48, image: "https://randomuser.me/api/portraits/men/32.jpg", verified: true },
  { name: "Priya Mehta", location: "Delhi", specialization: "Motor & SME Insurance", experience: "8 yrs", rating: 4.8, reviews: 35, image: "https://randomuser.me/api/portraits/women/44.jpg", verified: true },
  { name: "Amit Patel", location: "Ahmedabad", specialization: "Life & Health Insurance", experience: "15 yrs", rating: 4.9, reviews: 62, image: "https://randomuser.me/api/portraits/men/45.jpg", verified: true },
  { name: "Sneha Iyer", location: "Bangalore", specialization: "Health & Critical Illness", experience: "10 yrs", rating: 4.7, reviews: 29, image: "https://randomuser.me/api/portraits/women/68.jpg", verified: true },
  { name: "Vikram Reddy", location: "Hyderabad", specialization: "SME & Commercial", experience: "18 yrs", rating: 4.8, reviews: 51, image: "https://randomuser.me/api/portraits/men/67.jpg", verified: true },
  { name: "Anita Desai", location: "Pune", specialization: "Life Insurance & ULIPs", experience: "7 yrs", rating: 4.6, reviews: 22, image: "https://randomuser.me/api/portraits/women/54.jpg", verified: true },
];

const TopAgents = () => {
  const { openWizard } = useWizard();

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary mb-2">Top PadosiAgents</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Meet Our Top Rated Experts</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => openWizard()}
              className="font-semibold text-sm rounded-xl border-primary/30 text-primary hover:bg-primary/5 group hidden sm:flex"
            >
              View All Agents
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </AnimatedSection>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6">
          {topAgents.map((agent, i) => (
            <AnimatedSection key={i} animation="fade-up" delay={i * 80}>
              <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
                onClick={() => openWizard()}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <img src={agent.image} alt={agent.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-border shadow-sm" />
                      {agent.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-card">
                          <ShieldCheck className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{agent.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{agent.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-foreground">{agent.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({agent.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-secondary/8 text-secondary border border-secondary/15">{agent.specialization}</span>
                    <span className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-primary/8 text-primary border border-primary/15">{agent.experience} exp</span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5 group/btn h-9">
                    <Phone className="h-3 w-3 mr-1.5" /> View Profile
                    <ArrowRight className="ml-auto h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">
            {topAgents.map((agent, i) => (
              <div key={i} className="flex-shrink-0 w-[260px] snap-start">
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm cursor-pointer"
                  onClick={() => openWizard()}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative flex-shrink-0">
                        <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-xl object-cover border-2 border-border" />
                        {agent.verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-2 ring-card">
                            <ShieldCheck className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-foreground truncate">{agent.name}</h3>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{agent.location}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold">{agent.rating}</span>
                          <span className="text-[9px] text-muted-foreground">({agent.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="px-2 py-0.5 text-[9px] font-medium rounded-md bg-secondary/8 text-secondary">{agent.specialization}</span>
                      <span className="px-2 py-0.5 text-[9px] font-medium rounded-md bg-primary/8 text-primary">{agent.experience}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-lg text-[10px] font-semibold border-primary/30 text-primary h-8">
                      View Profile <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button
            onClick={() => openWizard()}
            className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-6 py-3 h-auto text-sm rounded-xl shadow-md group"
          >
            View All PadosiAgents
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopAgents;
