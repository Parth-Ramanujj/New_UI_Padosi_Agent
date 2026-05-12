import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { getInsuranceTypeBySlug, insuranceTypeData } from '@/data/insuranceTypeData';
import { blogPosts } from '@/data/blogPosts';
import { cityData } from '@/data/cityData';

const InsuranceTypeLanding = () => {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const typeInfo = getInsuranceTypeBySlug(slug);

  if (!typeInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Insurance Type Not Found</h1>
            <Button asChild><Link to="/agents">Browse All Agents</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = typeInfo.relatedBlogIds
    .map(id => blogPosts.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 6);

  const topCities = cityData.slice(0, 12);
  const otherTypes = insuranceTypeData.filter(t => t.slug !== typeInfo.slug);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": typeInfo.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Helmet>
        <title>{typeInfo.metaTitle}</title>
        <meta name="description" content={typeInfo.metaDescription} />
        <link rel="canonical" href={`https://padosiagent.in/${typeInfo.slug}`} />
        <meta property="og:title" content={typeInfo.metaTitle} />
        <meta property="og:description" content={typeInfo.metaDescription} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{typeInfo.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/8 via-secondary/5 to-background py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="max-w-3xl">
              <Badge className="mb-4">{typeInfo.name}</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight">{typeInfo.heroTitle}</h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{typeInfo.heroDescription}</p>
              <Button size="lg" asChild className="font-semibold gap-2">
                <Link to={`/agents?type=${typeInfo.slug.replace('-insurance', '')}`}>
                  Find {typeInfo.name} Agents <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-foreground">Key Benefits of {typeInfo.name}</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeInfo.benefits.map((benefit, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 80}>
                <Card className="h-full">
                  <CardContent className="p-5 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/85">{benefit}</span>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-foreground text-center">
              Frequently Asked Questions about {typeInfo.name}
            </h2>
          </AnimatedSection>
          <Accordion type="single" collapsible className="w-full">
            {typeInfo.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-foreground font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Find by City */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Find {typeInfo.name} Agents by City</h2>
            <div className="flex flex-wrap gap-2">
              {topCities.map((city) => (
                <Link key={city.slug} to={`/insurance-agents/${city.slug}`}>
                  <Badge variant="outline" className="px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                    {city.name}
                  </Badge>
                </Link>
              ))}
              <Link to="/insurance-agents">
                <Badge variant="outline" className="px-3 py-1.5 text-sm bg-primary/5 text-primary cursor-pointer">All Cities →</Badge>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection animation="fade-up">
              <h2 className="text-2xl font-bold mb-6 text-foreground">{typeInfo.name} Articles & Guides</h2>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((post) => post && (
                <Link key={post.id} to={`/blog/${post.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                    <div className="h-36 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2">{post.readTime}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Insurance Types */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Explore Other Insurance Types</h2>
            <div className="flex flex-wrap gap-3">
              {otherTypes.map((t) => (
                <Link key={t.slug} to={`/${t.slug}`}>
                  <Badge variant="secondary" className="px-4 py-2 text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                    {t.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              Get Expert {typeInfo.name} Advice Today
            </h2>
            <p className="text-muted-foreground mb-6">Compare plans and connect with verified agents in your area.</p>
            <Button size="lg" asChild className="font-semibold gap-2">
              <Link to={`/agents?type=${typeInfo.slug.replace('-insurance', '')}`}>
                Find My PadosiAgent <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsuranceTypeLanding;
