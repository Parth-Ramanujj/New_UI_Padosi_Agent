import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useScrollAnimation from '@/hooks/useScrollAnimation';
const faqs = [{
  question: "What exactly does PadosiAgent do for me?",
  answer: "PadosiAgent helps you find your trusted, licensed insurance PadosiAgent in your neighbourhood. Whether you want to buy a new policy, need help with your claim, or want your existing policies reviewed — we connect you with your verified local PadosiAgent who specializes in your needs."
}, {
  question: "Is PadosiAgent really free for me? What's the catch?",
  answer: "Yes, 100% free for you! There's no catch. We earn a small referral fee from insurance companies when policies are purchased through your PadosiAgent. You never pay anything — not for finding your agent, not for consultations."
}, {
  question: "Will I get spam calls after using PadosiAgent?",
  answer: "Absolutely not! Unlike other platforms, we never share your phone number with your PadosiAgent. Only YOU can initiate contact via call or WhatsApp. This means zero spam calls for you — guaranteed."
}, {
  question: "How do I know if my PadosiAgent is trustworthy?",
  answer: "Every PadosiAgent is licensed and background-verified by our team. You can also see their customer ratings, reviews, years of experience, and specializations before you connect."
}, {
  question: "How quickly can I get help with my insurance claim?",
  answer: "Your claim assistance PadosiAgent typically responds within 2-3 hours. They'll guide you through every step — from filing your paperwork to following up with the insurance company until your claim is settled."
}, {
  question: "What documents do I need for my policy review?",
  answer: "Just bring your existing policy documents (health, life, motor, or any other insurance). Your PadosiAgent will review your coverage, identify gaps, check if you're overpaying, and suggest optimizations — all for free."
}, {
  question: "Can I find a PadosiAgent who speaks my language?",
  answer: "Yes! Each PadosiAgent profile shows the languages they speak. You can easily find your PadosiAgent who communicates in Hindi, English, Marathi, Tamil, Telugu, or other regional languages."
}, {
  question: "What if I don't like the PadosiAgent I connected with?",
  answer: "No problem! You can simply find and connect with another PadosiAgent. You can also leave a review about your experience to help other users make informed choices."
}];
const FAQ = () => {
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    threshold: 0.1
  });
  return <section ref={ref as React.RefObject<HTMLElement>} className={`py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-primary-lighter/50 via-primary-lighter/30 to-white border-t border-primary/10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container-content max-w-4xl">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-secondary">Got Questions?
I've Got Your Answers</h2>
          <p className="text-xs sm:text-sm md:text-base text-secondary/80 max-w-2xl mx-auto">Everything you need to know before finding your PadosiAgent</p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
          {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className={`bg-card rounded-lg sm:rounded-xl shadow-sm border border-secondary/10 px-3 sm:px-4 md:px-6 py-1 sm:py-2 hover:shadow-md hover:border-secondary/20 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{
          transitionDelay: `${index * 75}ms`
        }}>
              <AccordionTrigger className="text-left font-semibold text-sm sm:text-base md:text-lg text-secondary-dark hover:text-secondary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm md:text-base text-secondary/80 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>
      </div>
    </section>;
};
export default FAQ;