import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface AgentSearchLoaderProps {
  onComplete: () => void;
}

const AgentSearchLoader = ({ onComplete }: AgentSearchLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(2), 1500),
      setTimeout(() => setCurrentStep(3), 3000),
      setTimeout(() => onComplete(), 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const steps = [
    { step: 1, text: "Matching your requirements..." },
    { step: 2, text: "Searching in your Padosi..." },
    { step: 3, text: "Found Expert PadosiAgents!" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/98 backdrop-blur-sm">
      <div className="w-full max-w-lg px-6">
        {/* Step Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                currentStep > s.step 
                  ? 'bg-primary text-primary-foreground scale-100' 
                  : currentStep === s.step 
                    ? 'bg-secondary text-secondary-foreground scale-110 animate-pulse' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > s.step ? <CheckCircle className="h-4 w-4" /> : s.step}
              </div>
              {s.step < 3 && (
                <div className={`w-12 sm:w-16 h-0.5 rounded-full transition-all duration-700 ${
                  currentStep > s.step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Text */}
        <p className={`text-center text-lg sm:text-xl font-semibold mb-8 transition-colors duration-300 ${
          currentStep === 3 ? 'text-primary' : 'text-foreground'
        }`}>
          {steps.find(s => s.step === currentStep)?.text}
        </p>

        {/* Skeleton Agent Cards Preview */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card 
              key={i} 
              className={`overflow-hidden border border-border/40 transition-all duration-500 ${
                currentStep >= 2 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex-shrink-0 ${
                    currentStep === 3 ? 'bg-primary/15' : ''
                  }`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className={`h-4 w-28 sm:w-36 ${currentStep === 3 ? 'bg-primary/15' : ''}`} />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-20 sm:w-24" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-1.5">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-6">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              currentStep === 3 ? 'bg-primary' : 'bg-secondary'
            }`}
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentSearchLoader;
