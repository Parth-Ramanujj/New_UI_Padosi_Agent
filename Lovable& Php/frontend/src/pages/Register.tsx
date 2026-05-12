import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "@/components/ui/sonner";
import { Progress } from '@/components/ui/progress';
import PlanSelector from '@/components/PlanSelector';
import { supabase } from '@/integrations/supabase/client';
import DummyPaymentDialog from '@/components/DummyPaymentDialog';
import Navbar from '@/components/Navbar';

import { ArrowLeft, ArrowRight, CheckCircle2, Shield, Tag, CheckCircle, Heart, Car, Building2, Mail } from 'lucide-react';
import logo from '@/assets/padosi-agent-logo-new.png';
import AgentWhyRegister from '@/components/AgentWhyRegister';

type RegisterTab = 'user' | 'agent' | 'distributor';
type AgentStep = 'details' | 'plan' | 'payment';

const SEGMENT_OPTIONS = [
  { id: 'health', label: 'Health', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', activeBorder: 'border-rose-400', activeBg: 'bg-rose-100 dark:bg-rose-500/20' },
  { id: 'life', label: 'Life', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', activeBorder: 'border-blue-400', activeBg: 'bg-blue-100 dark:bg-blue-500/20' },
  { id: 'motor', label: 'Motor', icon: Car, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', activeBorder: 'border-amber-400', activeBg: 'bg-amber-100 dark:bg-amber-500/20' },
  { id: 'sme', label: 'SME / General', icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', activeBorder: 'border-emerald-400', activeBg: 'bg-emerald-100 dark:bg-emerald-500/20' },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<RegisterTab>('user');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional');
  const [agentStep, setAgentStep] = useState<AgentStep>('details');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [insuranceSegments, setInsuranceSegments] = useState<string[]>([]);
  const [clientBase, setClientBase] = useState('');
  
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const hasValidPromoCode = isPromoApplied;

  // Close promo dialog when code is successfully applied
  useEffect(() => {
    if (isPromoApplied) setShowPromoDialog(false);
  }, [isPromoApplied]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { code: promoCode },
      });
      if (error) throw error;
      if (data?.valid) {
        setIsPromoApplied(true);
        setPromoError('');
        toast.success('Promo code applied! You now have access to special pricing.');
      } else {
        setIsPromoApplied(false);
        setPromoError('Invalid promo code. Please try again.');
        toast.error('Invalid promo code');
      }
    } catch (err: any) {
      setPromoError('Failed to validate promo code. Please try again.');
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setIsPromoApplied(false);
    setPromoError('');
  };
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'agent' || typeParam === 'distributor' || typeParam === 'user') {
      setUserType(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userType !== 'agent') {
      setAgentStep('details');
    }
  }, [userType]);

  // Agent form validation — no password needed
  const hasAgentBasicDetails =
    name.trim() !== '' &&
    email.trim() !== '' &&
    phone.trim() !== '';

  const canAgentProceed = hasAgentBasicDetails && agreeTerms;

  // Regular user/distributor validation
  const hasRegularDetails =
    name.trim() !== '' &&
    email.trim() !== '' &&
    phone.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  const canRegularSubmit = hasRegularDetails && agreeTerms && password === confirmPassword && password.length >= 6;

  const getAgentStepProgress = () => {
    switch (agentStep) {
      case 'details': return 50;
      case 'plan': return 100;
      default: return 0;
    }
  };

  const handleAgentDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    setAgentStep('plan');
  };

  const handlePlanContinue = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentDialog(false);
    setIsSubmitting(true);
    
    // Generate a random password — agent will receive credentials via email
    const autoPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

    try {
      await register({
        name,
        email,
        phone,
        password: autoPassword,
        role: 'agent',
        subscription_plan: selectedPlan,
        insurance_segments: insuranceSegments,
        years_experience: yearsExperience,
        client_base: clientBase,
      });
      
      // Send password reset so agent receives login credentials via email
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      toast.success('Registration successful! Check your email to set your password.');
      navigate('/agent-profile-setup');
    } catch (error) {
      console.error('Registration error', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role: userType,
        company_name: userType === 'distributor' ? companyName : undefined,
      });
      switch (userType) {
        case 'distributor':
          navigate('/distributor-dashboard');
          break;
        default:
          navigate('/client-dashboard');
      }
    } catch (error) {
      console.error('Registration error', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTabConfig = (tab: RegisterTab) => {
    switch (tab) {
      case 'agent':
        return {
          title: 'Become a PadosiAgent',
          description: 'Register to start getting leads and grow your business',
        };
      case 'distributor':
        return {
          title: 'Become a Distributor',
          description: 'Register to onboard agents and earn commissions',
        };
      default:
        return {
          title: 'Create Your Account',
          description: 'Register to find and connect with the best insurance agents',
        };
    }
  };

  const config = getTabConfig(userType);

  const renderAgentStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Registration Progress</span>
        <span className="text-sm text-muted-foreground">
          Step {agentStep === 'details' ? 1 : 2} of 2
        </span>
      </div>
      <Progress value={getAgentStepProgress()} className="h-2" />
      
      <div className="flex justify-between mt-3">
        <div className={`flex items-center gap-1.5 text-xs ${agentStep === 'details' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            agentStep === 'details' ? 'bg-primary text-primary-foreground' : 'bg-accent text-white'
          }`}>
            {agentStep === 'details' ? '1' : <CheckCircle2 className="h-4 w-4" />}
          </div>
          Your Details
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${agentStep === 'plan' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            agentStep === 'plan' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          Choose Plan
        </div>
      </div>
    </div>
  );

  const toggleSegment = (id: string) => {
    setInsuranceSegments(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <Navbar />
      
      <div className="flex-grow flex items-start lg:items-center justify-center pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className={`w-full ${userType === 'agent' ? 'max-w-lg lg:max-w-6xl' : 'max-w-lg lg:max-w-2xl'}`}>
          {/* Logo */}
          <div className="text-center mb-5 sm:mb-6">
            <img src={logo} alt="PadosiAgent" className="h-9 sm:h-11 mx-auto mb-2 mix-blend-multiply" />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Licensed Platform</span>
              <span className="text-border">•</span>
              <span>100% Free</span>
            </div>
          </div>

          <div className={userType === 'agent' ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-5 lg:gap-7 items-start' : ''}>
            {/* Why Register? — only on Agent tab */}
            {userType === 'agent' && (
              <aside className="lg:sticky lg:top-24 order-1 lg:order-none">
                <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg p-4 sm:p-5 lg:p-6">
                  <AgentWhyRegister />
                </div>
              </aside>
            )}


            <div className="order-2 lg:order-none min-w-0">
              <Card className="border border-border/60 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">{config.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{config.description}</CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <Tabs value={userType} onValueChange={(value) => {
                setUserType(value as RegisterTab);
                setAgentStep('details');
              }}>
                <TabsList className="grid grid-cols-3 mb-5 sm:mb-6 h-10 sm:h-11">
                  <TabsTrigger value="user" className="text-xs sm:text-sm">End User</TabsTrigger>
                  <TabsTrigger value="agent" className="text-xs sm:text-sm">PadosiAgent</TabsTrigger>
                  <TabsTrigger value="distributor" className="text-xs sm:text-sm">Distributor</TabsTrigger>
                </TabsList>

                {/* ── Agent Registration Flow ── */}
                {userType === 'agent' && (
                  <>
                    {renderAgentStepIndicator()}

                    {/* Step 1: Details */}
                    {agentStep === 'details' && (
                      <form onSubmit={handleAgentDetailsSubmit} className="space-y-4 sm:space-y-5">
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="agent-name" className="text-xs sm:text-sm font-medium">Full Name <span className="text-destructive">*</span></Label>
                            <Input 
                              id="agent-name" 
                              type="text" 
                              placeholder="Your full name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required 
                              disabled={isSubmitting}
                              className="h-11 sm:h-12 text-sm sm:text-base"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="agent-phone" className="text-xs sm:text-sm font-medium">Mobile Number <span className="text-destructive">*</span></Label>
                            <Input 
                              id="agent-phone" 
                              type="tel"
                              inputMode="numeric"
                              placeholder="9876543210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              required 
                              disabled={isSubmitting}
                              className="h-11 sm:h-12 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                        
                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="agent-email" className="text-xs sm:text-sm font-medium">Email <span className="text-destructive">*</span></Label>
                          <Input 
                            id="agent-email" 
                            type="email" 
                            inputMode="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            disabled={isSubmitting}
                            className="h-11 sm:h-12 text-sm sm:text-base"
                          />
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Your login credentials will be sent to this email
                          </p>
                        </div>

                        {/* Experience & Client Base — numeric inputs */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="agent-experience" className="text-xs sm:text-sm font-medium">Years of Experience</Label>
                            <Input
                              id="agent-experience"
                              type="number"
                              inputMode="numeric"
                              placeholder="e.g. 5"
                              min={0}
                              max={60}
                              value={yearsExperience}
                              onChange={(e) => setYearsExperience(e.target.value.replace(/\D/g, '').slice(0, 2))}
                              disabled={isSubmitting}
                              className="h-11 sm:h-12 text-sm sm:text-base"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="agent-clients" className="text-xs sm:text-sm font-medium">Approx. Client Base</Label>
                            <Input
                              id="agent-clients"
                              type="number"
                              inputMode="numeric"
                              placeholder="e.g. 200"
                              min={0}
                              value={clientBase}
                              onChange={(e) => setClientBase(e.target.value.replace(/\D/g, ''))}
                              disabled={isSubmitting}
                              className="h-11 sm:h-12 text-sm sm:text-base"
                            />
                          </div>
                        </div>

                        {/* Insurance Segments */}
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm font-medium">Insurance Segments</Label>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {SEGMENT_OPTIONS.map((seg) => {
                              const Icon = seg.icon;
                              const isActive = insuranceSegments.includes(seg.id);
                              return (
                                <button
                                  key={seg.id}
                                  type="button"
                                  onClick={() => toggleSegment(seg.id)}
                                  className={`relative flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                                    isActive
                                      ? `${seg.activeBorder} ${seg.activeBg} shadow-sm`
                                      : 'border-border/60 hover:border-border bg-card hover:shadow-sm'
                                  }`}
                                >
                                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? seg.activeBg : seg.bg}`}>
                                    <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${seg.color}`} strokeWidth={2} />
                                  </div>
                                  <span className={`text-xs sm:text-sm font-semibold leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {seg.label}
                                  </span>
                                  {isActive && (
                                    <CheckCircle2 className="h-4 w-4 text-primary absolute top-1.5 right-1.5 sm:top-2 sm:right-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Promo Code — clickable link */}
                        <div className="flex items-center justify-center">
                          {isPromoApplied ? (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <CheckCircle className="h-3.5 w-3.5 text-accent" />
                              <span className="font-medium text-accent">Promo "{promoCode}" applied</span>
                              <button type="button" onClick={handleRemovePromoCode} className="text-muted-foreground hover:text-destructive underline text-xs ml-1">
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowPromoDialog(true)}
                              className="flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                              <Tag className="h-3.5 w-3.5" />
                              Have a Promo Code?
                            </button>
                          )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2.5 pt-1">
                          <input 
                            id="agent-terms" 
                            type="checkbox"
                            className="w-4 h-4 mt-0.5 rounded border-border accent-primary"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            required 
                            disabled={isSubmitting}
                          />
                          <Label htmlFor="agent-terms" className="text-xs sm:text-sm leading-snug">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                          </Label>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 sm:h-[52px] bg-primary hover:bg-accent font-bold text-sm sm:text-base shadow-lg cta-glow cta-ripple tap-feedback"
                          disabled={!canAgentProceed || isSubmitting}
                        >
                          Continue to Plan Selection
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </form>
                    )}

                    {/* Step 2: Plan Selection */}
                    {agentStep === 'plan' && (
                      <div className="space-y-5 sm:space-y-6">
                        <PlanSelector 
                          selectedPlan={selectedPlan} 
                          onPlanSelect={setSelectedPlan}
                          hasValidPromoCode={hasValidPromoCode}
                        />

                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => setAgentStep('details')}
                            className="flex-1 h-11 sm:h-12"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button 
                            onClick={handlePlanContinue}
                            className="flex-1 h-11 sm:h-12 bg-primary hover:bg-primary/90 font-bold"
                          >
                            {selectedPlan === 'starter' && hasValidPromoCode ? 'Start Free Trial' : 'Proceed to Payment'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>Secure checkout • 100% money-back guarantee</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── Regular User / Distributor Registration ── */}
                {userType !== 'agent' && (
                  <form onSubmit={handleRegularSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Full Name</Label>
                        <Input 
                          id="name" type="text" placeholder="Your name"
                          value={name} onChange={(e) => setName(e.target.value)}
                          required disabled={isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">Phone Number</Label>
                        <Input 
                          id="phone" type="tel" inputMode="numeric" placeholder="9876543210"
                          value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          required disabled={isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email</Label>
                      <Input 
                        id="email" type="email" inputMode="email" placeholder="your@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        required disabled={isSubmitting}
                        className="h-11 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    {userType === 'distributor' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="companyName" className="text-xs sm:text-sm font-medium">Company Name (Optional)</Label>
                        <Input 
                          id="companyName" type="text" placeholder="Your company name"
                          value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                          disabled={isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Password</Label>
                        <Input 
                          id="password" type="password" placeholder="Min 6 characters"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          required disabled={isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium">Confirm Password</Label>
                        <Input 
                          id="confirmPassword" type="password" placeholder="Confirm your password"
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          required disabled={isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input 
                        id="terms" type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded border-border accent-primary"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required disabled={isSubmitting}
                      />
                      <Label htmlFor="terms" className="text-xs sm:text-sm leading-snug">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 sm:h-[52px] bg-primary hover:bg-accent font-bold text-sm sm:text-base shadow-lg cta-glow cta-ripple tap-feedback"
                      disabled={!canRegularSubmit || isSubmitting}
                    >
                      {isSubmitting ? 'Creating account...' : 'Register'}
                    </Button>
                  </form>
                )}
              </Tabs>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-3 sm:pt-4 px-4 sm:px-6">
              <div className="w-full pt-3 border-t">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-2.5">
                  Already have an account?
                </p>
                <Link to="/login" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 sm:h-11 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-sm"
                  >
                    Login here
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardFooter>
              </Card>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>No Spam Calls</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span>Data Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Tag className="h-5 w-5 text-primary" />
              Enter Promo Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                className={`flex-1 h-11 text-sm ${promoError ? 'border-destructive' : ''}`}
                autoFocus
              />
              <Button 
                onClick={() => handleApplyPromoCode()}
                disabled={!promoCode.trim() || isValidatingPromo}
                className="h-11"
              >
                {isValidatingPromo ? 'Validating...' : 'Apply'}
              </Button>
            </div>
            {promoError && <p className="text-xs text-destructive">{promoError}</p>}
          </div>
        </DialogContent>
      </Dialog>

      <DummyPaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
        plan={selectedPlan}
      />
    </div>
  );
};

export default Register;
