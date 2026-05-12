import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Phone, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWizard } from '@/contexts/WizardContext';

interface InlineCTAProps {
  variant?: 'agent' | 'claim' | 'calculator' | 'contact';
}

const ctaData = {
  agent: {
    icon: Shield,
    title: 'Need Help Choosing the Right Policy?',
    description: 'Connect with a verified insurance expert near you for free, personalized advice.',
    buttonText: 'Find a PadosiAgent',
    useWizard: true,
    wizardService: undefined as undefined,
    link: '/agents',
    gradient: 'from-primary/10 to-accent/10 border-primary/20',
  },
  claim: {
    icon: Phone,
    title: 'Struggling With a Claim?',
    description: 'Our claim assistance experts can help you get your rightful settlement faster.',
    buttonText: 'Get Claim Assistance',
    useWizard: true,
    wizardService: 'claim' as const,
    link: '/claim-assistance',
    gradient: 'from-destructive/5 to-secondary/10 border-destructive/15',
  },
  calculator: {
    icon: Calculator,
    title: 'Calculate Your Insurance Needs',
    description: 'Use our free calculators to find the right coverage amount for your family.',
    buttonText: 'Try Our Calculators',
    useWizard: false,
    wizardService: undefined as undefined,
    link: '/calculators',
    gradient: 'from-secondary/10 to-primary/5 border-secondary/20',
  },
  contact: {
    icon: Phone,
    title: 'Have Questions? We\'re Here to Help',
    description: 'Reach out to our insurance experts for guidance on any insurance-related query.',
    buttonText: 'Contact Us',
    useWizard: false,
    wizardService: undefined as undefined,
    link: '/contact',
    gradient: 'from-muted to-accent/5 border-border',
  },
};

const InlineCTA: React.FC<InlineCTAProps> = ({ variant = 'agent' }) => {
  const data = ctaData[variant];
  const Icon = data.icon;
  const { openWizard } = useWizard();

  return (
    <Card className={`my-8 bg-gradient-to-r ${data.gradient} shadow-sm`}>
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="font-bold text-foreground mb-1">{data.title}</h4>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
        {data.useWizard ? (
          <Button size="sm" className="shrink-0 gap-1.5 font-semibold" onClick={() => openWizard(data.wizardService)}>
            {data.buttonText} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button asChild size="sm" className="shrink-0 gap-1.5 font-semibold">
            <Link to={data.link}>{data.buttonText} <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InlineCTA;
