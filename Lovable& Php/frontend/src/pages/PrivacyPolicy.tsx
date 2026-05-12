import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Helmet>
        <title>Privacy Policy | PadosiAgent</title>
        <meta name="description" content="PadosiAgent privacy policy - how we collect, use, and protect your personal information." />
        <link rel="canonical" href="https://padosiagent.in/privacy-policy" />
      </Helmet>

      <div className="bg-muted/30 border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-grow">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: March 2026</p>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground/85">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p>At PadosiAgent, we collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and location when you register or contact agents.</li>
              <li><strong>Profile Data:</strong> Insurance preferences, policy interests, and communication preferences.</li>
              <li><strong>Usage Data:</strong> Pages visited, search queries, interaction patterns, and device information.</li>
              <li><strong>Agent Data:</strong> License details, professional credentials, and business information for registered agents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Connect you with verified insurance agents in your neighborhood.</li>
              <li>Personalize your experience and show relevant insurance options.</li>
              <li>Process claim assistance requests and policy reviews.</li>
              <li>Send important updates about your inquiries and connected agents.</li>
              <li>Improve our platform, services, and user experience.</li>
              <li>Comply with legal obligations under Licensed regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Information Sharing</h2>
            <p>We share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>With Insurance Agents:</strong> When you initiate contact or request assistance, we share your contact details with the selected agent.</li>
              <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (hosting, analytics, communication).</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
            </ul>
            <p className="mt-3">We never sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits. Agent profiles are verified against Licensed records to ensure authenticity.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze platform usage. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and download your personal data.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Delete your account and associated data.</li>
              <li>Opt out of marketing communications.</li>
              <li>Withdraw consent for data processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for up to 90 days for legal and business purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">8. Children's Privacy</h2>
            <p>Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">9. Contact Us</h2>
            <p>For privacy-related questions or requests, contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> <a href="mailto:privacy@padosiagent.com" className="text-primary hover:underline">privacy@padosiagent.com</a></p>
            <p><strong>Address:</strong> Ahmedabad, Gujarat, India</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
