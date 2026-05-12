import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ComparisonSection from '@/components/ComparisonSection';
import InsuranceServicesHub from '@/components/InsuranceServicesHub';
import WhyChooseUs from '@/components/WhyChooseUs';
import HowItWorks from '@/components/HowItWorks';
import TopAgents from '@/components/TopAgents';
import CustomerReviews from '@/components/CustomerReviews';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <HeroSection />
      <InsuranceServicesHub />
      <ComparisonSection />
      <WhyChooseUs />
      <HowItWorks />
      <TopAgents />
      <CustomerReviews />
      <Footer />
    </div>
  );
};

export default Index;
