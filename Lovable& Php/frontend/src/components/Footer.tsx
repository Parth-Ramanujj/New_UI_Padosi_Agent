import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import logo from '@/assets/padosi-agent-logo-new.png';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<string[]>([]);

  // Function to navigate and scroll to section
  const handleNavigateAndScroll = (path: string, sectionId?: string) => {
    navigate(path);
    setTimeout(() => {
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const toggleProduct = (product: string) => {
    setExpandedProducts(prev => 
      prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
    );
  };

  const toggleCompany = (category: string) => {
    setExpandedCompanies(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Link data for reusability
  const footerLinks = {
    quickLinks: [
      { label: 'Home', path: '/' },
      { label: 'Find My PadosiAgent', path: '/agents', sectionId: 'agents-header' },
      { label: 'About Us', path: '/about', sectionId: 'about-header' },
      { label: 'Insurance Blogs', path: '/blog', sectionId: 'blog-header' },
      { label: 'Contact Us', path: '/contact', sectionId: 'contact-header' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Blacklisted Agents', path: '/blacklisted-agents' },
    ],
    forAgent: [
      { label: 'PadosiAgent Login', path: '/login' },
      { label: 'Register as PadosiAgent', path: '/register' },
      { label: 'Calculators', path: '/calculators', sectionId: 'calculators-header' },
    ],
  };

  const insuranceServices = [
    { label: 'Buy New Policy', path: '/agents?service=new-policy', sectionId: 'agents-header' },
    { label: 'Transfer / Renew Policy', path: '/agents?service=transfer-renew', sectionId: 'agents-header' },
    { label: 'Insurance Portfolio Audit', path: '/agents?service=policy-review', sectionId: 'agents-header' },
  ];

  const insuranceProducts = {
    life: {
      label: 'Life Insurance',
      typeParam: 'life',
      subPlans: [
        { name: 'Term Insurance', product: 'term' },
        { name: 'Endowment Plans', product: 'endowment' },
        { name: 'ULIPs', product: 'ulip' },
        { name: 'Whole Life Insurance', product: 'whole-life' },
        { name: 'Money Back Plans', product: 'money-back' },
        { name: 'Child Plans', product: 'child' },
        { name: 'Pension Plans', product: 'pension' }
      ]
    },
    health: {
      label: 'Health Insurance',
      typeParam: 'health',
      subPlans: [
        { name: 'Individual Health', product: 'individual' },
        { name: 'Family Floater', product: 'family-floater' },
        { name: 'Senior Citizen', product: 'senior-citizen' },
        { name: 'Critical Illness', product: 'critical-illness' },
        { name: 'Personal Accident', product: 'personal-accident' },
        { name: 'Group Health', product: 'group-health' }
      ]
    },
    motor: {
      label: 'Motor Insurance',
      typeParam: 'motor',
      subPlans: [
        { name: 'Car Insurance', product: 'car' },
        { name: 'Two Wheeler', product: 'two-wheeler' },
        { name: 'Commercial Vehicle', product: 'commercial' },
        { name: 'Third Party', product: 'third-party' },
        { name: 'Comprehensive', product: 'comprehensive' },
        { name: 'Own Damage', product: 'own-damage' }
      ]
    },
    sme: {
      label: 'SME Insurance',
      typeParam: 'sme',
      subPlans: [
        { name: 'Fire Insurance', product: 'fire' },
        { name: 'Marine Insurance', product: 'marine' },
        { name: 'Liability Insurance', product: 'liability' },
        { name: 'Professional Indemnity', product: 'professional-indemnity' },
        { name: 'Workmen Compensation', product: 'workmen-compensation' },
        { name: 'Group Health', product: 'group-health' }
      ]
    }
  };

  const insuranceCompanies = {
    life: {
      label: 'Life Insurance',
      companies: [
        { name: 'LIC', param: 'lic' },
        { name: 'HDFC Life', param: 'hdfc-life' },
        { name: 'ICICI Prudential', param: 'icici-prudential' },
        { name: 'SBI Life', param: 'sbi-life' },
        { name: 'Max Life', param: 'max-life' },
        { name: 'Bajaj Allianz Life', param: 'bajaj-allianz-life' },
        { name: 'Tata AIA', param: 'tata-aia' },
        { name: 'Kotak Life', param: 'kotak-life' },
        { name: 'Aditya Birla Sun Life', param: 'aditya-birla-sun-life' },
        { name: 'PNB MetLife', param: 'pnb-metlife' }
      ]
    },
    general: {
      label: 'General Insurance',
      companies: [
        { name: 'New India Assurance', param: 'new-india-assurance' },
        { name: 'United India', param: 'united-india' },
        { name: 'National Insurance', param: 'national-insurance' },
        { name: 'Oriental Insurance', param: 'oriental-insurance' },
        { name: 'ICICI Lombard', param: 'icici-lombard' },
        { name: 'HDFC ERGO', param: 'hdfc-ergo' },
        { name: 'Bajaj Allianz General', param: 'bajaj-allianz-general' },
        { name: 'Tata AIG', param: 'tata-aig' },
        { name: 'Reliance General', param: 'reliance-general' },
        { name: 'SBI General', param: 'sbi-general' }
      ]
    },
    sahi: {
      label: 'SAHI Insurance',
      companies: [
        { name: 'Star Health', param: 'star-health' },
        { name: 'Care Health', param: 'care-health' },
        { name: 'Niva Bupa', param: 'niva-bupa' },
        { name: 'ManipalCigna', param: 'manipal-cigna' },
        { name: 'Aditya Birla Health', param: 'aditya-birla-health' },
        { name: 'Reliance Health', param: 'reliance-health' },
        { name: 'Galaxy Health', param: 'galaxy-health' },
        { name: 'Narayana Health', param: 'narayana-health' }
      ]
    }
  };

  // Reusable link list component
  const LinkList = ({ links }: { links: typeof footerLinks.quickLinks }) => (
    <ul className="space-y-2 sm:space-y-2.5">
      {links.map((link) => (
        <li key={link.path + link.label}>
          <button
            onClick={() => handleNavigateAndScroll(link.path, link.sectionId)}
            className="text-muted text-sm hover:text-accent transition-colors text-left py-1"
          >
            {link.label}
          </button>
        </li>
      ))}
    </ul>
  );

  // Contact info component
  const ContactInfo = () => (
    <div className="space-y-3">
      <a
        href="mailto:support@padosiagent.com"
        className="flex items-center gap-2 text-muted text-sm hover:text-background transition-colors group py-1"
      >
        <Mail size={14} className="text-background/70 flex-shrink-0" />
        <span className="truncate">support@padosiagent.com</span>
      </a>
      <a
        href="tel:+919601271988"
        className="flex items-center gap-2 text-muted text-sm hover:text-background transition-colors group py-1"
      >
        <Phone size={14} className="text-background/70 flex-shrink-0" />
        +91 9601271988
      </a>
      <div className="flex items-start gap-2 text-muted text-sm py-1">
        <MapPin size={14} className="text-background/70 mt-0.5 flex-shrink-0" />
        <span>Ahmedabad, Gujarat</span>
      </div>
    </div>
  );

  // Expandable product section component
  const ProductSection = ({ productKey, product }: { productKey: string; product: typeof insuranceProducts.life }) => (
    <div className="mb-2">
      <button
        onClick={() => toggleProduct(productKey)}
        className="flex items-center justify-between w-full text-muted text-sm hover:text-accent transition-colors py-1 text-left"
      >
        <span>{product.label}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${expandedProducts.includes(productKey) ? 'rotate-180' : ''}`} 
        />
      </button>
      {expandedProducts.includes(productKey) && (
        <ul className="pl-3 mt-1 space-y-1 border-l border-background/20">
          {product.subPlans.map((plan) => (
            <li key={plan.name}>
              <button
                onClick={() => handleNavigateAndScroll(`/agents?service=new-policy&type=${product.typeParam}&product=${plan.product}`, 'agents-header')}
                className="text-muted/70 text-xs hover:text-accent transition-colors text-left"
              >
                {plan.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Expandable company section component
  const CompanySection = ({ categoryKey, category }: { categoryKey: string; category: typeof insuranceCompanies.life }) => (
    <div className="mb-2">
      <button
        onClick={() => toggleCompany(categoryKey)}
        className="flex items-center justify-between w-full text-muted text-sm hover:text-accent transition-colors py-1 text-left"
      >
        <span>{category.label}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${expandedCompanies.includes(categoryKey) ? 'rotate-180' : ''}`} 
        />
      </button>
      {expandedCompanies.includes(categoryKey) && (
        <ul className="pl-3 mt-1 space-y-1 border-l border-background/20">
          {category.companies.map((company) => (
            <li key={company.name}>
              <button
                onClick={() => handleNavigateAndScroll(`/agents?company=${company.param}`, 'agents-header')}
                className="text-muted/70 text-xs hover:text-accent transition-colors text-left"
              >
                {company.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <footer>
      {/* Main Footer - Dark Background */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">

        {/* Logo, Tagline & Social Icons */}
        <div className="flex flex-col items-center mb-10 sm:mb-12 pb-8 sm:pb-10 border-b border-background/8">
          <Link
            to="/"
            className="inline-block"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={logo}
              alt="PadosiAgent"
              className="h-14 sm:h-16 lg:h-20 brightness-0 invert"
            />
          </Link>
          <p className="text-muted text-sm mt-2 leading-relaxed text-center">
            Connecting you with your trusted PadosiAgent in your neighborhood.
          </p>
          {/* Social Icons */}
          <div className="flex gap-9 justify-center mt-4">
            <a href="https://facebook.com/padosiagent" target="_blank" rel="noopener noreferrer" className="p-3 sm:p-2.5 bg-background/10 rounded-xl hover:bg-background/20 hover:scale-110 transition-all duration-300 group" aria-label="Facebook">
              <Facebook size={20} className="sm:w-[18px] sm:h-[18px] text-background group-hover:text-accent transition-colors" />
            </a>
            <a href="https://x.com/padosiagent" target="_blank" rel="noopener noreferrer" className="p-3 sm:p-2.5 bg-background/10 rounded-xl hover:bg-background/20 hover:scale-110 transition-all duration-300 group" aria-label="Twitter">
              <FaXTwitter size={20} className="sm:w-[18px] sm:h-[18px] text-background group-hover:text-accent transition-colors" />
            </a>
            <a href="https://instagram.com/padosiagent" target="_blank" rel="noopener noreferrer" className="p-3 sm:p-2.5 bg-background/10 rounded-xl hover:bg-background/20 hover:scale-110 transition-all duration-300 group" aria-label="Instagram">
              <Instagram size={20} className="sm:w-[18px] sm:h-[18px] text-background group-hover:text-accent transition-colors" />
            </a>
            <a href="https://linkedin.com/company/padosiagent" target="_blank" rel="noopener noreferrer" className="p-3 sm:p-2.5 bg-background/10 rounded-xl hover:bg-background/20 hover:scale-110 transition-all duration-300 group" aria-label="LinkedIn">
              <Linkedin size={20} className="sm:w-[18px] sm:h-[18px] text-background group-hover:text-accent transition-colors" />
            </a>
          </div>
        </div>

        {/* Mobile Accordion Links */}
        <div className="sm:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="quick-links" className="border-background/10">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider py-3 hover:no-underline text-background">
                Quick Links
              </AccordionTrigger>
              <AccordionContent>
                <LinkList links={footerLinks.quickLinks} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance-services" className="border-background/10">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider py-3 hover:no-underline text-background">
                Insurance Services
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {insuranceServices.map((service) => (
                    <li key={service.path}>
                      <button
                        onClick={() => handleNavigateAndScroll(service.path, service.sectionId)}
                        className="text-muted text-sm hover:text-accent transition-colors text-left py-1"
                      >
                        {service.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance-products" className="border-background/10">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider py-3 hover:no-underline text-background">
                Insurance Products
              </AccordionTrigger>
              <AccordionContent>
                {Object.entries(insuranceProducts).map(([key, product]) => (
                  <ProductSection key={key} productKey={key} product={product} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance-companies" className="border-background/10">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider py-3 hover:no-underline text-background">
                Insurance Companies
              </AccordionTrigger>
              <AccordionContent>
                {Object.entries(insuranceCompanies).map(([key, category]) => (
                  <CompanySection key={key} categoryKey={key} category={category} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="for-agent" className="border-background/10">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider py-3 hover:no-underline text-background">
                For PadosiAgent
              </AccordionTrigger>
              <AccordionContent>
                <LinkList links={footerLinks.forAgent} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact" className="border-background/10">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider py-3 hover:no-underline text-background">
                Contact
              </AccordionTrigger>
              <AccordionContent>
                <ContactInfo />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Desktop Links Grid */}
        <div className="hidden sm:grid sm:grid-cols-6 gap-6 lg:gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <LinkList links={footerLinks.quickLinks} />
          </div>

          {/* Insurance Services */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Insurance Services</h3>
            <ul className="space-y-2.5">
              {insuranceServices.map((service) => (
                <li key={service.path}>
                  <button
                    onClick={() => handleNavigateAndScroll(service.path, service.sectionId)}
                    className="text-muted text-sm hover:text-accent transition-colors text-left py-1"
                  >
                    {service.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Insurance Products */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Insurance Products</h3>
            {Object.entries(insuranceProducts).map(([key, product]) => (
              <ProductSection key={key} productKey={key} product={product} />
            ))}
          </div>

          {/* Insurance Companies */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Insurance Companies</h3>
            {Object.entries(insuranceCompanies).map(([key, category]) => (
              <CompanySection key={key} categoryKey={key} category={category} />
            ))}
          </div>

          {/* For PadosiAgent */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">For PadosiAgent</h3>
            <LinkList links={footerLinks.forAgent} />
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ContactInfo />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/8 mt-8 sm:mt-10 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-muted/70 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} PadosiAgent. All rights reserved.
          </p>
          <div className="flex gap-5 sm:gap-6 text-xs sm:text-sm">
            <Link to="/privacy-policy" className="text-muted/70 hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-muted/70 hover:text-background transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
