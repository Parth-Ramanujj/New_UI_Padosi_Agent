import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Search, HelpCircle, Shield, Heart, FileText, Users, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const faqs = [
  {
    category: 'General',
    icon: HelpCircle,
    questions: [
      {
        question: "What exactly does PadosiAgent do for me?",
        answer: "PadosiAgent helps you find your trusted, licensed insurance PadosiAgent in your neighbourhood. Whether you want to buy a new policy, need help with your claim, or want your existing policies reviewed — we connect you with your verified local PadosiAgent who specializes in your needs."
      },
      {
        question: "Is PadosiAgent really free for me? What's the catch?",
        answer: "Yes, 100% free for you! There's no catch. We earn a small referral fee from insurance companies when policies are purchased through your PadosiAgent. You never pay anything — not for finding your agent, not for consultations."
      },
      {
        question: "Will I get spam calls after using PadosiAgent?",
        answer: "Absolutely not! Unlike other platforms, we never share your phone number with your PadosiAgent. Only YOU can initiate contact via call or WhatsApp. This means zero spam calls for you — guaranteed."
      },
    ]
  },
  {
    category: 'Trust & Verification',
    icon: Shield,
    questions: [
      {
        question: "How do I know if my PadosiAgent is trustworthy?",
        answer: "Every PadosiAgent is licensed and background-verified by our team. You can also see their customer ratings, reviews, years of experience, and specializations before you connect."
      },
      {
        question: "Can I find a PadosiAgent who speaks my language?",
        answer: "Yes! Each PadosiAgent profile shows the languages they speak. You can easily find your PadosiAgent who communicates in Hindi, English, Marathi, Tamil, Telugu, or other regional languages."
      },
    ]
  },
  {
    category: 'Claims',
    icon: FileText,
    questions: [
      {
        question: "How quickly can I get help with my insurance claim?",
        answer: "Your claim assistance PadosiAgent typically responds within 2-3 hours. They'll guide you through every step — from filing your paperwork to following up with the insurance company until your claim is settled."
      },
    ]
  },
  {
    category: 'Policy Review',
    icon: Heart,
    questions: [
      {
        question: "What documents do I need for my policy review?",
        answer: "Just bring your existing policy documents (health, life, motor, or any other insurance). Your PadosiAgent will review your coverage, identify gaps, check if you're overpaying, and suggest optimizations — all for free."
      },
    ]
  },
  {
    category: 'Support',
    icon: MessageCircle,
    questions: [
      {
        question: "What if I don't like the PadosiAgent I connected with?",
        answer: "No problem! You can simply find and connect with another PadosiAgent. You can also leave a review about your experience to help other users make informed choices."
      },
    ]
  },
];

const allQuestions = faqs.flatMap(cat => cat.questions.map(q => ({ ...q, category: cat.category })));

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredQuestions = allQuestions.filter(q => {
    const matchesSearch = !searchQuery || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || q.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 sm:pt-28 pb-10 sm:pb-14 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
        <div className="container-content max-w-4xl text-center px-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Everything you need to know about finding your trusted PadosiAgent
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search your question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl text-base shadow-sm border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="sticky sticky-below-navbar py-4 border-b bg-background z-10">
        <div className="container-content max-w-4xl px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {faqs.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.category ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-8 sm:py-12 px-4 flex-grow bg-gradient-to-b from-background to-muted/20">
        <div className="container-content max-w-3xl">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No questions found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term or category</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredQuestions.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl shadow-sm border px-4 sm:px-6 py-1 hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline gap-3">
                    <div className="flex-1">
                      <span className="text-xs text-primary font-medium">{faq.category}</span>
                      <p className="mt-0.5">{faq.question}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-14 bg-primary/5 border-t">
        <div className="container-content max-w-2xl text-center px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground text-sm mb-6">Our team is happy to help you with anything</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
