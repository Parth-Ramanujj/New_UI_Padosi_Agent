import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Shield, Heart, Car, Building2, ArrowRight, ChevronRight, Users, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { getCityBySlug, cityData } from '@/data/cityData';

const insuranceTypes = [
  { name: 'Health Insurance', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', type: 'health' },
  { name: 'Life Insurance', icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50', type: 'life' },
  { name: 'Motor Insurance', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', type: 'motor' },
  { name: 'SME Insurance', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50', type: 'sme' },
];

const CityLanding = () => {
  const { city } = useParams<{ city: string }>();
  const cityInfo = getCityBySlug(city || '');

  if (!cityInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">City Not Found</h1>
            <p className="text-muted-foreground mb-6">We don't have a dedicated page for this city yet.</p>
            <Button asChild><Link to="/agents">Browse All Agents</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `PadosiAgent - Insurance Agents in ${cityInfo.name}`,
    "description": cityInfo.description,
    "areaServed": { "@type": "City", "name": cityInfo.name },
    "url": `https://padosiagent.in/insurance-agents/${cityInfo.slug}`,
  };

  const nearbyCities = cityData
    .filter(c => c.slug !== cityInfo.slug && c.state === cityInfo.state)
    .slice(0, 6);

  const otherCities = cityData
    .filter(c => c.slug !== cityInfo.slug && c.state !== cityInfo.state)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Helmet>
        <title>{cityInfo.metaTitle}</title>
        <meta name="description" content={cityInfo.metaDescription} />
        <link rel="canonical" href={`https://padosiagent.in/insurance-agents/${cityInfo.slug}`} />
        <meta property="og:title" content={cityInfo.metaTitle} />
        <meta property="og:description" content={cityInfo.metaDescription} />
        <meta property="og:url" content={`https://padosiagent.in/insurance-agents/${cityInfo.slug}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/agents" className="hover:text-primary transition-colors">Find Agents</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Insurance Agents in {cityInfo.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/8 via-secondary/5 to-background py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="max-w-3xl">
              <Badge className="mb-4" variant="outline">
                <MapPin className="h-3 w-3 mr-1" /> {cityInfo.state}
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight">
                Find Trusted Insurance Agents in <span className="text-primary">{cityInfo.name}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{cityInfo.description}</p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="font-semibold gap-2">
                  <Link to={`/agents?location=${encodeURIComponent(cityInfo.name)}`}>
                    Find Agents in {cityInfo.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="font-semibold">
                  <Link to="/claim-assistance">Get Claim Help</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Insurance Types */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-foreground text-center">
              Insurance Services in {cityInfo.name}
            </h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {insuranceTypes.map((type, i) => (
              <AnimatedSection key={type.type} animation="fade-up" delay={i * 100}>
                <Link to={`/agents?location=${encodeURIComponent(cityInfo.name)}&type=${type.type}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`${type.bg} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                        <type.icon className={`h-8 w-8 ${type.color}`} />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">Find {type.name.toLowerCase()} agents in {cityInfo.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose PadosiAgent */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-foreground text-center">
              Why Choose PadosiAgent in {cityInfo.name}?
            </h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'Licensed Agents', desc: `All insurance agents in ${cityInfo.name} on our platform hold valid insurance licenses.` },
              { icon: MapPin, title: 'Neighborhood Agents', desc: `Find agents near you in ${cityInfo.neighborhoods.slice(0, 3).join(', ')} and more areas.` },
              { icon: Star, title: 'Rated & Reviewed', desc: `Read reviews from real customers in ${cityInfo.name} before connecting with an agent.` },
              { icon: Users, title: `${cityInfo.population} Population Served`, desc: `Insurance agents serving ${cityInfo.name}'s growing population across ${cityInfo.state}.` },
              { icon: Shield, title: 'Claim Assistance', desc: `Get expert help with insurance claim processing and settlement in ${cityInfo.name}.` },
              { icon: Heart, title: 'Free Consultation', desc: `Connect with agents in ${cityInfo.name} and get free insurance advice for your needs.` },
            ].map((item, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 80}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <item.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Highlights */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
              Insurance Market in {cityInfo.name}
            </h2>
            <ul className="space-y-3">
              {cityInfo.insuranceHighlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/85">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
              Find Agents in {cityInfo.name} Neighborhoods
            </h2>
            <div className="flex flex-wrap gap-2">
              {cityInfo.neighborhoods.map((area) => (
                <Link
                  key={area}
                  to={`/agents?location=${encodeURIComponent(area + ', ' + cityInfo.name)}`}
                  className="inline-block"
                >
                  <Badge variant="outline" className="px-3 py-1.5 text-sm hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer">
                    <MapPin className="h-3 w-3 mr-1" /> {area}
                  </Badge>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Nearby Cities */}
      {nearbyCities.length > 0 && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection animation="fade-up">
              <h2 className="text-2xl font-bold mb-6 text-foreground">
                Insurance Agents in Nearby Cities
              </h2>
              <div className="flex flex-wrap gap-3">
                {nearbyCities.map((c) => (
                  <Link key={c.slug} to={`/insurance-agents/${c.slug}`}>
                    <Badge variant="secondary" className="px-4 py-2 text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                      {c.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Other Cities */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Browse Insurance Agents Across India
            </h2>
            <div className="flex flex-wrap gap-3">
              {otherCities.map((c) => (
                <Link key={c.slug} to={`/insurance-agents/${c.slug}`}>
                  <Badge variant="outline" className="px-4 py-2 text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                    {c.name}
                  </Badge>
                </Link>
              ))}
              <Link to="/insurance-agents">
                <Badge variant="outline" className="px-4 py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary cursor-pointer">
                  View All Cities →
                </Badge>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              Ready to Find Your PadosiAgent in {cityInfo.name}?
            </h2>
            <p className="text-muted-foreground mb-6">Connect with verified, experienced insurance agents in your neighborhood today.</p>
            <Button size="lg" asChild className="font-semibold gap-2">
              <Link to={`/agents?location=${encodeURIComponent(cityInfo.name)}`}>
                Find My PadosiAgent <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Blog link for SEO */}
      <section className="py-8 px-4 sm:px-6 bg-background border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
            <span>Explore:</span>
            <Link to="/agents" className="text-primary hover:underline">Find Insurance Agents</Link>
            <span>•</span>
            <Link to="/claim-assistance" className="text-primary hover:underline">Claim Assistance</Link>
            <span>•</span>
            <Link to="/calculators" className="text-primary hover:underline">Insurance Calculators</Link>
            <span>•</span>
            <Link to="/blog" className="text-primary hover:underline">Insurance Blog</Link>
            <span>•</span>
            <Link to="/faq" className="text-primary hover:underline">FAQs</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityLanding;
