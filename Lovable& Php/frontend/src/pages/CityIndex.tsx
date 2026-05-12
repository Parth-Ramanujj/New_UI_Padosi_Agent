import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { cityData } from '@/data/cityData';

const CityIndex = () => {
  const citiesByState = cityData.reduce<Record<string, typeof cityData>>((acc, city) => {
    if (!acc[city.state]) acc[city.state] = [];
    acc[city.state].push(city);
    return acc;
  }, {});

  const sortedStates = Object.keys(citiesByState).sort();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Helmet>
        <title>Insurance Agents Across India | Find PadosiAgent in Your City</title>
        <meta name="description" content="Find licensed insurance agents in 50+ Indian cities. Browse by city to connect with trusted PadosiAgents for health, life, motor, and business insurance." />
        <link rel="canonical" href="https://padosiagent.in/insurance-agents" />
      </Helmet>

      <div className="bg-muted/30 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Insurance Agents by City</span>
          </nav>
        </div>
      </div>

      <section className="bg-gradient-to-br from-primary/8 via-secondary/5 to-background py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Find Insurance Agents in <span className="text-primary">{cityData.length}+ Cities</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with licensed insurance agents across India. Browse by state and city to find your trusted PadosiAgent.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-10 sm:py-14 px-4 sm:px-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          {sortedStates.map((state) => (
            <AnimatedSection key={state} animation="fade-up">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> {state}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {citiesByState[state].map((city) => (
                    <Link key={city.slug} to={`/insurance-agents/${city.slug}`}>
                      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-sm text-foreground">{city.name}</p>
                            <p className="text-xs text-muted-foreground">Pop: {city.population}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityIndex;
