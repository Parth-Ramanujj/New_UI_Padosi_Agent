import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Users, Lock, HelpCircle } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

interface LeadPreferencesProps {
  yearsExperience: number;
  wantsNewBusinessLeads: boolean;
  newBusinessLeadCharging: string;
  newBusinessLeadAmount: number;
  wantsPortfolioLeads: boolean;
  portfolioLeadCharging: string;
  portfolioLeadAmount: number;
  wantsClaimsLeads: boolean;
  claimsLeadCharging: string;
  claimsLeadAmount: number;
  onNewBusinessLeadsChange: (wants: boolean) => void;
  onNewBusinessChargingChange: (charging: string) => void;
  onNewBusinessAmountChange: (amount: number) => void;
  onPortfolioLeadsChange: (wants: boolean) => void;
  onPortfolioChargingChange: (charging: string) => void;
  onPortfolioAmountChange: (amount: number) => void;
  onClaimsLeadsChange: (wants: boolean) => void;
  onClaimsChargingChange: (charging: string) => void;
  onClaimsAmountChange: (amount: number) => void;
}

const LeadPreferences: React.FC<LeadPreferencesProps> = ({
  yearsExperience,
  wantsNewBusinessLeads,
  newBusinessLeadCharging,
  newBusinessLeadAmount,
  wantsPortfolioLeads,
  portfolioLeadCharging,
  portfolioLeadAmount,
  wantsClaimsLeads,
  claimsLeadCharging,
  claimsLeadAmount,
  onNewBusinessLeadsChange,
  onNewBusinessChargingChange,
  onNewBusinessAmountChange,
  onPortfolioLeadsChange,
  onPortfolioChargingChange,
  onPortfolioAmountChange,
  onClaimsLeadsChange,
  onClaimsChargingChange,
  onClaimsAmountChange,
}) => {
  const canEnablePortfolio = yearsExperience >= 5;
  const canEnableClaims = yearsExperience >= 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Lead Preferences</h3>
        <InfoTooltip content="Configure which types of customer inquiries you want to receive. Different lead types help you grow your business in various ways">
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
        </InfoTooltip>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure the types of leads you want to receive. Some lead types require minimum experience.
      </p>

      {/* New Business Leads - Available to all, no charging preferences */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">New Business Leads</CardTitle>
              <Badge variant="outline" className="text-xs">All Agents</Badge>
              <InfoTooltip content="Leads from customers looking to purchase new insurance policies. Great for growing your client base">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
              </InfoTooltip>
            </div>
            <Switch
              checked={wantsNewBusinessLeads}
              onCheckedChange={onNewBusinessLeadsChange}
            />
          </div>
          <CardDescription>
            Receive leads from customers looking for new insurance policies
          </CardDescription>
        </CardHeader>
        
        {wantsNewBusinessLeads && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ✓ You will receive new business leads at no additional charge
            </p>
          </CardContent>
        )}
      </Card>

      {/* Portfolio Analysis Leads - 5+ years */}
      <Card className={`border-primary/20 ${!canEnablePortfolio ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Portfolio Analysis Leads</CardTitle>
              <Badge variant="secondary" className="text-xs">5+ Years Experience</Badge>
              {!canEnablePortfolio && <Lock className="h-4 w-4 text-muted-foreground" />}
              <InfoTooltip content="Leads from customers wanting expert review of their existing insurance portfolio. Requires 5+ years experience to ensure quality advice">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
              </InfoTooltip>
            </div>
            <Switch
              checked={wantsPortfolioLeads}
              onCheckedChange={onPortfolioLeadsChange}
              disabled={!canEnablePortfolio}
            />
          </div>
          <CardDescription>
            Receive leads from customers seeking portfolio review services
            {!canEnablePortfolio && (
              <span className="block text-amber-600 mt-1">
                🔒 Requires {5 - yearsExperience} more year(s) of experience to unlock
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        {wantsPortfolioLeads && canEnablePortfolio && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Charging Preference</Label>
              <RadioGroup
                value={portfolioLeadCharging}
                onValueChange={onPortfolioChargingChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="portfolio-free" />
                  <Label htmlFor="portfolio-free" className="text-sm font-normal cursor-pointer">
                    Free consultation
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="free_if_policy" id="portfolio-conditional" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="portfolio-conditional" className="text-sm font-normal cursor-pointer">
                      Free if policy purchased (Otherwise Consultation Fee)
                    </Label>
                    {portfolioLeadCharging === 'free_if_policy' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Consultation Fee: ₹</span>
                        <Input
                          type="number"
                          min="0"
                          max="5000"
                          placeholder="Enter amount"
                          value={portfolioLeadAmount || ''}
                          onChange={(e) => onPortfolioAmountChange(parseInt(e.target.value) || 0)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="paid" id="portfolio-paid" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="portfolio-paid" className="text-sm font-normal cursor-pointer">
                      Paid consultation
                    </Label>
                    {portfolioLeadCharging === 'paid' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">₹</span>
                        <Input
                          type="number"
                          min="0"
                          max="5000"
                          placeholder="Enter amount"
                          value={portfolioLeadAmount || ''}
                          onChange={(e) => onPortfolioAmountChange(parseInt(e.target.value) || 0)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Claims Support Leads - 10+ years */}
      <Card className={`border-primary/20 ${!canEnableClaims ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Claims Support Leads</CardTitle>
              <Badge variant="secondary" className="text-xs">10+ Years Experience</Badge>
              {!canEnableClaims && <Lock className="h-4 w-4 text-muted-foreground" />}
              <InfoTooltip content="Leads from customers needing help with insurance claims. Requires 10+ years experience for handling complex claim situations">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
              </InfoTooltip>
            </div>
            <Switch
              checked={wantsClaimsLeads}
              onCheckedChange={onClaimsLeadsChange}
              disabled={!canEnableClaims}
            />
          </div>
          <CardDescription>
            Receive leads from customers needing claims assistance
            {!canEnableClaims && (
              <span className="block text-amber-600 mt-1">
                🔒 Requires {10 - yearsExperience} more year(s) of experience to unlock
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        {wantsClaimsLeads && canEnableClaims && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Charging Preference</Label>
              <RadioGroup
                value={claimsLeadCharging}
                onValueChange={onClaimsChargingChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="claims-free" />
                  <Label htmlFor="claims-free" className="text-sm font-normal cursor-pointer">
                    Free consultation
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="consultation_fee" id="claims-fee" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="claims-fee" className="text-sm font-normal cursor-pointer">
                      Consultation Fee
                    </Label>
                    {claimsLeadCharging === 'consultation_fee' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">₹</span>
                        <Input
                          type="number"
                          min="0"
                          max="5000"
                          placeholder="Enter amount"
                          value={claimsLeadAmount || ''}
                          onChange={(e) => onClaimsAmountChange(parseInt(e.target.value) || 0)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="percent_of_claim" id="claims-percent" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="claims-percent" className="text-sm font-normal cursor-pointer">
                      % of Claim Amount
                    </Label>
                    {claimsLeadCharging === 'percent_of_claim' && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          placeholder="Enter %"
                          value={claimsLeadAmount || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            onClaimsAmountChange(Math.min(10, Math.max(0, value)));
                          }}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">% (max 10%)</span>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LeadPreferences;
