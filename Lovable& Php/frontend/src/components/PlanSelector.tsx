import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: 'starter' | 'professional';
  onPlanSelect: (plan: 'starter' | 'professional') => void;
  hasValidPromoCode?: boolean;
}

// Promo code validation is now handled server-side via edge function

const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlan, onPlanSelect, hasValidPromoCode = false }) => {
  const plans = [
    {
      id: 'starter' as const,
      name: "Starter's Plan",
      regularPrice: '₹2,359',
      discountedPrice: '₹589',
      period: '1st Year Only',
      discount: '75% OFF',
      description: 'Perfect for New Agents',
      icon: <Zap className="h-5 w-5" />,
      features: [
        { name: 'Organic Lead Inquiries', value: 'Yes' },
        { name: 'Service Lead Inquiries', value: 'Yes' },
        { name: 'Referral Lead Inquiries', value: 'Yes' },
        { name: 'Webpage', value: 'Lifetime' },
        { name: 'Social Media Integration', value: 'Lifetime' },
        { name: 'Digital Business Card', value: 'Lifetime' },
        { name: 'Digital Gallery', value: '5 Images' },
        { name: 'Profile Review & Rating', value: 'Lifetime' },
        { name: 'Profile Analytics', value: 'Basic' },
        { name: 'Retention Tools', value: 'Limited Access' },
      ]
    },
    {
      id: 'professional' as const,
      name: "Professional's Plan",
      regularPrice: '₹8,258',
      discountedPrice: '₹2,359',
      period: '1st Year Only',
      discount: '71% OFF',
      description: 'For Established Professionals',
      recommended: true,
      icon: <Crown className="h-5 w-5" />,
      features: [
        { name: 'Organic Lead Inquiries', value: 'Priority' },
        { name: 'Service Lead Inquiries', value: 'Priority' },
        { name: 'Referral Lead Inquiries', value: 'Lifetime' },
        { name: 'Paid Lead Inquiries', value: '90 Days' },
        { name: 'Webpage', value: 'Lifetime' },
        { name: 'Social Media Integration', value: 'Lifetime' },
        { name: 'Digital Business Card', value: 'Lifetime' },
        { name: 'Digital Gallery', value: '10 Images' },
        { name: 'Profile Review & Rating', value: 'Lifetime' },
        { name: 'Trusted Badge', value: 'Yes' },
        { name: 'Profile Analytics', value: 'Advanced 90 Days' },
        { name: 'Retention Tools', value: 'Full Access 90 Days' },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        {hasValidPromoCode ? (
          <Badge className="bg-accent text-white mb-2">🎉 Pre-Launch Discount Applied!</Badge>
        ) : (
          <Badge variant="outline" className="mb-2">Enter promo code for special pricing</Badge>
        )}
        <h3 className="text-lg font-semibold text-foreground">Choose Your Plan</h3>
        <p className="text-sm text-muted-foreground">
          {hasValidPromoCode 
            ? "Once in a lifetime offer! Get started at special introductory prices."
            : "Select a plan to get started with your PadosiAgent profile."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const displayPrice = hasValidPromoCode ? plan.discountedPrice : plan.regularPrice;
          const showStrikethrough = hasValidPromoCode;
          
          return (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPlan === plan.id 
                  ? 'border-2 border-primary ring-2 ring-primary/20' 
                  : 'border hover:border-primary/50'
              } ${plan.recommended ? 'md:-mt-2 md:mb-2' : ''}`}
              onClick={() => onPlanSelect(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-md">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    RECOMMENDED
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${plan.recommended ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  {hasValidPromoCode && (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs">
                      {plan.discount}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Pricing */}
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">{displayPrice}</span>
                    {showStrikethrough && (
                      <span className="text-sm text-muted-foreground line-through">{plan.regularPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.period}</p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {plan.features.slice(0, 8).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{feature.name}</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-accent" />
                        {feature.value}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 8 && (
                    <p className="text-xs text-primary font-medium">+{plan.features.length - 8} more features</p>
                  )}
                </div>

                {/* Select Button */}
                <Button 
                  className={`w-full mt-4 ${
                    selectedPlan === plan.id 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                  size="sm"
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        All prices are in Indian Rupees (₹) and inclusive of GST.
      </p>
    </div>
  );
};

export default PlanSelector;
