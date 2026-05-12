import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { useToast } from "@/hooks/use-toast";

const contactCards = [
  { icon: MapPin, title: 'Office Address', content: 'Ahmedabad - 380009\nGujarat, India', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Phone, title: 'Phone Number', content: '+91 9601271988', href: 'tel:+919601271988', color: 'text-secondary', bg: 'bg-secondary/10' },
  { icon: Mail, title: 'Email', content: 'support@padosiagent.com', href: 'mailto:support@padosiagent.com', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Clock, title: 'Working Hours', content: 'Mon - Sat: 9:00 AM - 6:00 PM\nSunday: Closed', color: 'text-claim', bg: 'bg-claim/10' },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Message Sent! ✉️",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section - Uses semantic tokens */}
      <section id="contact-header" className="relative bg-gradient-to-br from-secondary/15 via-primary/8 to-secondary/10 pt-10 sm:pt-12 md:pt-16 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-primary/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <AnimatedSection animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <MessageCircle className="h-4 w-4" />
              Get In Touch
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground animate-fade-in">Contact Us</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions? We're here to help you find the perfect insurance solution
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Cards + Form */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 bg-background flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Contact Info Cards - Horizontal on desktop */}
          <AnimatedSection animation="fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
              {contactCards.map((card, index) => {
                const Icon = card.icon;
                const Wrapper = card.href ? 'a' : 'div';
                return (
                  <Wrapper
                    key={index}
                    {...(card.href ? { href: card.href } : {})}
                    className="group"
                  >
                    <Card className="p-4 sm:p-5 hover:shadow-lg transition-all duration-300 border border-border/50 hover:-translate-y-1 h-full text-center sm:text-left">
                      <div className={`${card.bg} p-3 rounded-xl w-fit mx-auto sm:mx-0 mb-3 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 text-foreground">{card.title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm whitespace-pre-line">{card.content}</p>
                    </Card>
                  </Wrapper>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-lg border border-border/50">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Send Us a Message</CardTitle>
                  <p className="text-muted-foreground text-sm">Fill out the form and we'll respond within 24 hours</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Full Name *</label>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required className="h-11" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Email Address *</label>
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className="h-11" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Phone Number *</label>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required className="h-11" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Subject *</label>
                        <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required className="h-11" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">Message *</label>
                      <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more about your inquiry..." rows={5} required />
                    </div>

                    <Button type="submit" size="lg" className="w-full sm:w-auto font-semibold gap-2 h-12" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      {!isSubmitting && <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
