import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Users, Award, TrendingUp, Heart, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';

// Animated counter hook
const useCountUp = (end: number, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
};

const stats = [
  { icon: Users, value: 10000, suffix: '+', label: 'Verified Agents', color: 'text-secondary' },
  { icon: Heart, value: 50000, suffix: '+', label: 'Happy Clients', color: 'text-claim' },
  { icon: Award, value: 95, suffix: '%', label: 'Claim Success Rate', color: 'text-primary' },
  { icon: TrendingUp, value: 100, suffix: '+', label: 'Cities Covered', color: 'text-review' },
];

const values = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'Every PadosiAgent is licensed and background verified. No hidden fees, no spam — just honest service.',
    gradient: 'from-primary/10 to-primary/5',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your needs come first. We match you with agents who truly understand your requirements and provide personalized solutions.',
    gradient: 'from-secondary/10 to-secondary/5',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We maintain the highest standards by continuously training our agents and improving our platform based on user feedback.',
    gradient: 'from-accent/10 to-accent/5',
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section id="about-header" className="relative bg-gradient-to-br from-primary/8 via-secondary/5 to-background pt-10 sm:pt-12 md:pt-16 pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <AnimatedSection animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              <Shield className="h-4 w-4" />
              Licensed Platform
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight text-foreground">
              About <span className="text-secondary">PadosiAgent</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connecting you with trusted insurance agents in your neighborhood — making insurance simple, transparent, and accessible for everyone
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <AnimatedSection animation="fade-up">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                Our Mission
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 tracking-tight text-foreground">
                Making Insurance <span className="text-secondary">Simple</span> for Everyone
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                At PadosiAgent, we believe everyone deserves access to quality insurance guidance without the hassle. 
                We're building India's most trusted platform to connect individuals and businesses with verified, 
                experienced insurance agents in their local area.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our mission is to make insurance simple, transparent, and accessible for everyone while empowering 
                local agents to grow their business.
              </p>
              <Button asChild className="bg-secondary hover:bg-primary font-semibold gap-2 cta-glow">
                <Link to="/agents">
                  Find My PadosiAgent
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </AnimatedSection>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const { count, ref } = useCountUp(stat.value, 2000);
                return (
                  <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                    <div ref={ref}>
                      <Card className="text-center p-5 sm:p-6 hover:shadow-lg transition-all duration-300 border border-border/50 group hover:-translate-y-1">
                        <Icon className={`h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
                        <h3 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">
                          {count.toLocaleString()}{stat.suffix}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">{stat.label}</p>
                      </Card>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight text-foreground">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">The principles that guide everything we do at PadosiAgent</p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <AnimatedSection key={index} animation="fade-up" delay={index * 150}>
                  <Card className="p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border border-border/50 group hover:-translate-y-1 h-full">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{value.description}</p>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 border-y border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Ready to Find Your PadosiAgent?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with verified, trusted insurance experts in your neighborhood — completely free, with zero spam calls
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-secondary hover:bg-primary font-bold gap-2 cta-glow cta-ripple animate-pulse-glow">
                <Link to="/agents">
                  Find My PadosiAgent
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold gap-2 border-secondary/30 text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
