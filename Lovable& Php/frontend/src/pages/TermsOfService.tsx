import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Helmet>
        <title>Terms of Service | PadosiAgent</title>
        <meta name="description" content="PadosiAgent terms of service - rules and guidelines for using our insurance agent platform." />
        <link rel="canonical" href="https://padosiagent.in/terms-of-service" />
      </Helmet>

      <div className="bg-muted/30 border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Terms of Service</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-grow">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mb-6">Last updated: March 2026</p>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground/85">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using PadosiAgent ("Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Description of Services</h2>
            <p>PadosiAgent is a platform that connects insurance seekers with verified, licensed insurance agents in their neighborhood. Our services include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Agent discovery and search based on location, specialization, and insurance type.</li>
              <li>Claim assistance by connecting users with experienced claim experts.</li>
              <li>Insurance portfolio review and audit services.</li>
              <li>Educational content through our insurance blog.</li>
              <li>Insurance calculators and planning tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 18 years old to create an account.</li>
              <li>One person may not maintain more than one account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Agent Responsibilities</h2>
            <p>Insurance agents registered on PadosiAgent must:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Hold a valid insurance license and keep it current.</li>
              <li>Provide accurate information about qualifications, experience, and specializations.</li>
              <li>Respond to client inquiries in a timely and professional manner.</li>
              <li>Not engage in mis-selling or misrepresentation of insurance products.</li>
              <li>Comply with all applicable Licensed regulations and guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. User Conduct</h2>
            <p>Users must not:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Provide false or misleading information.</li>
              <li>Harass, abuse, or threaten agents or other users.</li>
              <li>Attempt to circumvent platform security measures.</li>
              <li>Use automated tools to scrape or collect data from the platform.</li>
              <li>Post fake reviews or manipulate agent ratings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Disclaimer</h2>
            <p>PadosiAgent acts as a connector between insurance seekers and agents. We do not:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Sell, underwrite, or guarantee any insurance policy.</li>
              <li>Provide financial or insurance advice.</li>
              <li>Guarantee the quality of service provided by individual agents.</li>
              <li>Take responsibility for disputes between users and agents.</li>
            </ul>
            <p className="mt-3">All insurance decisions should be made after careful evaluation and directly with the concerned insurance agent and/or company.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. Intellectual Property</h2>
            <p>All content on PadosiAgent, including text, graphics, logos, and software, is the property of PadosiAgent and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">8. Subscription Plans</h2>
            <p>Agent subscription plans are subject to separate subscription terms. Plan features, pricing, and renewal terms are outlined during the registration process. Cancellation and refund policies apply as specified during purchase.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">9. Limitation of Liability</h2>
            <p>PadosiAgent shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform. Our total liability shall not exceed the amount paid by you for our services in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">11. Contact</h2>
            <p>For questions about these Terms of Service, contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> <a href="mailto:legal@padosiagent.com" className="text-primary hover:underline">legal@padosiagent.com</a></p>
            <p><strong>Address:</strong> Ahmedabad, Gujarat, India</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
