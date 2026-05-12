import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BarChart, PieChart, ChevronUp, Users, Star, Activity, UserPlus, ArrowUpRight, Loader2, CheckCircle, Phone, Mail, MapPin, Building2, Globe, CreditCard, Briefcase, IndianRupee } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DistributorDashboard = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboardDialog, setShowOnboardDialog] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardedAgents, setOnboardedAgents] = useState<any[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  const [formStep, setFormStep] = useState(1);

  // Onboard form state - full agent profile
  const [agentForm, setAgentForm] = useState({
    name: '', email: '', phone: '', location: '', company_name: '',
    subscription_plan: 'starter', insurance_segments: [] as string[],
    languages: ['English'], bio: '', years_experience: 0,
    // Extended fields
    pan_number: '', office_address: '', serviceable_cities: '',
    approx_client_base: '', claims_processed: '0', claims_amount: '0',
    claims_settled: 0,
    wants_portfolio_leads: false, portfolio_lead_amount: 0, portfolio_lead_charging: 'per_lead',
    wants_claims_leads: false, claims_lead_amount: 0, claims_lead_charging: 'per_lead',
    career_highlights: '',
    website: '', linkedin: '', instagram: '', facebook: '', youtube: '',
    whatsapp_number: '',
  });

  // Fetch onboarded agents
  useEffect(() => {
    const fetchAgents = async () => {
      if (!user?.id) return;
      setIsLoadingAgents(true);
      try {
        const { data: relationships } = await supabase
          .from('distributor_agents')
          .select('agent_id, onboarded_at, status')
          .eq('distributor_id', user.id);

        if (relationships && relationships.length > 0) {
          const agentIds = relationships.map(r => r.agent_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, avatar_url')
            .in('id', agentIds);

          const { data: agentProfiles } = await supabase
            .from('agent_profiles')
            .select('id, location, subscription_plan, insurance_segments, is_profile_approved')
            .in('id', agentIds);

          const merged = relationships.map(rel => {
            const profile = profiles?.find(p => p.id === rel.agent_id);
            const agentProfile = agentProfiles?.find(ap => ap.id === rel.agent_id);
            return {
              ...rel,
              ...profile,
              ...agentProfile,
            };
          });
          setOnboardedAgents(merged);
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setIsLoadingAgents(false);
      }
    };
    fetchAgents();
  }, [user?.id]);

  const handleOnboardAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.name || !agentForm.email || !agentForm.phone) {
      toast({ title: 'Missing fields', description: 'Name, email and phone are required', variant: 'destructive' });
      return;
    }
    setIsOnboarding(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/onboard-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          ...agentForm,
          serviceable_cities: agentForm.serviceable_cities ? agentForm.serviceable_cities.split(',').map(c => c.trim()).filter(Boolean) : [],
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to onboard agent');

      toast({ title: 'Agent Onboarded!', description: result.message });
      setShowOnboardDialog(false);
      setFormStep(1);
      setAgentForm({
        name: '', email: '', phone: '', location: '', company_name: '',
        subscription_plan: 'starter', insurance_segments: [] as string[],
        languages: ['English'], bio: '', years_experience: 0,
        pan_number: '', office_address: '', serviceable_cities: '',
        approx_client_base: '', claims_processed: '0', claims_amount: '0',
        claims_settled: 0,
        wants_portfolio_leads: false, portfolio_lead_amount: 0, portfolio_lead_charging: 'per_lead',
        wants_claims_leads: false, claims_lead_amount: 0, claims_lead_charging: 'per_lead',
        career_highlights: '',
        website: '', linkedin: '', instagram: '', facebook: '', youtube: '',
        whatsapp_number: '',
      });
      // Refresh agents
      setOnboardedAgents(prev => [...prev, {
        agent_id: result.agent_id,
        full_name: agentForm.name,
        email: agentForm.email,
        phone: agentForm.phone,
        location: agentForm.location,
        subscription_plan: agentForm.subscription_plan,
        status: 'active',
        onboarded_at: new Date().toISOString(),
      }]);
    } catch (err: any) {
      toast({ title: 'Onboarding Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsOnboarding(false);
    }
  };

  const toggleSegment = (segment: string) => {
    setAgentForm(prev => ({
      ...prev,
      insurance_segments: prev.insurance_segments.includes(segment)
        ? prev.insurance_segments.filter(s => s !== segment)
        : [...prev.insurance_segments, segment],
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to view your distributor dashboard</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild><Link to="/login">Login</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-muted/30 pt-6 sm:pt-8 pb-10 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-16 w-16 border-2 border-card">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <Badge className="ml-2 bg-accent text-accent-foreground">Distributor</Badge>
                </div>
                <p className="text-muted-foreground">Insurance Distributor</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showOnboardDialog} onOpenChange={setShowOnboardDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <UserPlus className="h-4 w-4 mr-1" /> Onboard Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Onboard New Agent — Step {formStep} of 4
                    </DialogTitle>
                  </DialogHeader>
                  
                  {/* Step indicators */}
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4].map(s => (
                      <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= formStep ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                  </div>

                  <form onSubmit={handleOnboardAgent} className="space-y-4 mt-2">
                    {/* Step 1: Basic Info */}
                    {formStep === 1 && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Basic Information</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                            <Input placeholder="Agent's full name" value={agentForm.name} onChange={e => setAgentForm(prev => ({ ...prev, name: e.target.value }))} required maxLength={100} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email <span className="text-destructive">*</span></Label>
                            <Input type="email" placeholder="agent@email.com" value={agentForm.email} onChange={e => setAgentForm(prev => ({ ...prev, email: e.target.value }))} required maxLength={255} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Phone <span className="text-destructive">*</span></Label>
                            <Input placeholder="10-digit mobile" value={agentForm.phone} onChange={e => setAgentForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} required maxLength={10} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">WhatsApp Number</Label>
                            <Input placeholder="WhatsApp number" value={agentForm.whatsapp_number} onChange={e => setAgentForm(prev => ({ ...prev, whatsapp_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))} maxLength={10} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Location</Label>
                            <Input placeholder="City, State" value={agentForm.location} onChange={e => setAgentForm(prev => ({ ...prev, location: e.target.value }))} maxLength={200} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Office Address</Label>
                            <Input placeholder="Full office address" value={agentForm.office_address} onChange={e => setAgentForm(prev => ({ ...prev, office_address: e.target.value }))} maxLength={500} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Company Name</Label>
                            <Input placeholder="Agency / Company" value={agentForm.company_name} onChange={e => setAgentForm(prev => ({ ...prev, company_name: e.target.value }))} maxLength={200} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">PAN Number</Label>
                            <Input placeholder="ABCDE1234F" value={agentForm.pan_number} onChange={e => setAgentForm(prev => ({ ...prev, pan_number: e.target.value.toUpperCase().slice(0, 10) }))} maxLength={10} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Experience (Years)</Label>
                            <Input type="number" min={0} max={50} value={agentForm.years_experience} onChange={e => setAgentForm(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Approx. Client Base</Label>
                            <Input placeholder="e.g. 500+" value={agentForm.approx_client_base} onChange={e => setAgentForm(prev => ({ ...prev, approx_client_base: e.target.value }))} maxLength={50} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Serviceable Cities</Label>
                          <Input placeholder="Mumbai, Pune, Thane (comma separated)" value={agentForm.serviceable_cities} onChange={e => setAgentForm(prev => ({ ...prev, serviceable_cities: e.target.value }))} maxLength={500} />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Professional Details */}
                    {formStep === 2 && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Professional Details</p>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Insurance Segments</Label>
                          <div className="flex flex-wrap gap-2">
                            {['Health', 'Life', 'Motor', 'SME', 'Travel', 'Fire', 'Marine'].map(seg => (
                              <button key={seg} type="button" onClick={() => toggleSegment(seg)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${agentForm.insurance_segments.includes(seg) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/50'}`}>
                                {seg}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Languages</Label>
                          <div className="flex flex-wrap gap-2">
                            {['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi'].map(lang => (
                              <button key={lang} type="button" onClick={() => setAgentForm(prev => ({
                                ...prev,
                                languages: prev.languages.includes(lang) ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang]
                              }))}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${agentForm.languages.includes(lang) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/50'}`}>
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Professional Bio</Label>
                          <Textarea placeholder="Brief description of the agent..." value={agentForm.bio} onChange={e => setAgentForm(prev => ({ ...prev, bio: e.target.value }))} rows={3} maxLength={500} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Career Highlights</Label>
                          <Textarea placeholder="Key achievements, awards, certifications..." value={agentForm.career_highlights} onChange={e => setAgentForm(prev => ({ ...prev, career_highlights: e.target.value }))} rows={2} maxLength={500} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Claims Processed</Label>
                            <Input placeholder="e.g. 500" value={agentForm.claims_processed} onChange={e => setAgentForm(prev => ({ ...prev, claims_processed: e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Claims Settled</Label>
                            <Input type="number" min={0} value={agentForm.claims_settled} onChange={e => setAgentForm(prev => ({ ...prev, claims_settled: parseInt(e.target.value) || 0 }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Total Claims Amount</Label>
                            <Input placeholder="e.g. ₹1 Crore" value={agentForm.claims_amount} onChange={e => setAgentForm(prev => ({ ...prev, claims_amount: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Lead Preferences & Payment */}
                    {formStep === 3 && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Lead Preferences & Service Fees</p>
                        
                        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Wants Portfolio Leads</Label>
                            <Switch checked={agentForm.wants_portfolio_leads} onCheckedChange={v => setAgentForm(prev => ({ ...prev, wants_portfolio_leads: v }))} />
                          </div>
                          {agentForm.wants_portfolio_leads && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs">Lead Amount (₹)</Label>
                                <Input type="number" min={0} value={agentForm.portfolio_lead_amount} onChange={e => setAgentForm(prev => ({ ...prev, portfolio_lead_amount: parseInt(e.target.value) || 0 }))} />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Charging Model</Label>
                                <Select value={agentForm.portfolio_lead_charging} onValueChange={v => setAgentForm(prev => ({ ...prev, portfolio_lead_charging: v }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="per_lead">Per Lead</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="flat_monthly">Flat Monthly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Wants Claims Leads</Label>
                            <Switch checked={agentForm.wants_claims_leads} onCheckedChange={v => setAgentForm(prev => ({ ...prev, wants_claims_leads: v }))} />
                          </div>
                          {agentForm.wants_claims_leads && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs">Lead Amount (₹)</Label>
                                <Input type="number" min={0} value={agentForm.claims_lead_amount} onChange={e => setAgentForm(prev => ({ ...prev, claims_lead_amount: parseInt(e.target.value) || 0 }))} />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Charging Model</Label>
                                <Select value={agentForm.claims_lead_charging} onValueChange={v => setAgentForm(prev => ({ ...prev, claims_lead_charging: v }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="per_lead">Per Lead</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="flat_monthly">Flat Monthly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Subscription Plan</Label>
                          <Select value={agentForm.subscription_plan} onValueChange={v => setAgentForm(prev => ({ ...prev, subscription_plan: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">Starter — Free</SelectItem>
                              <SelectItem value="professional">Professional — Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Social & Online Presence */}
                    {formStep === 4 && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Social & Online Presence</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Website</Label>
                            <Input placeholder="https://..." value={agentForm.website} onChange={e => setAgentForm(prev => ({ ...prev, website: e.target.value }))} maxLength={500} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">LinkedIn</Label>
                            <Input placeholder="LinkedIn profile URL" value={agentForm.linkedin} onChange={e => setAgentForm(prev => ({ ...prev, linkedin: e.target.value }))} maxLength={500} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Instagram</Label>
                            <Input placeholder="Instagram handle or URL" value={agentForm.instagram} onChange={e => setAgentForm(prev => ({ ...prev, instagram: e.target.value }))} maxLength={500} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Facebook</Label>
                            <Input placeholder="Facebook profile URL" value={agentForm.facebook} onChange={e => setAgentForm(prev => ({ ...prev, facebook: e.target.value }))} maxLength={500} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">YouTube</Label>
                          <Input placeholder="YouTube channel URL" value={agentForm.youtube} onChange={e => setAgentForm(prev => ({ ...prev, youtube: e.target.value }))} maxLength={500} />
                        </div>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex gap-3 pt-2">
                      {formStep > 1 && (
                        <Button type="button" variant="outline" onClick={() => setFormStep(s => s - 1)} className="flex-1">
                          Back
                        </Button>
                      )}
                      {formStep < 4 ? (
                        <Button type="button" onClick={() => {
                          if (formStep === 1 && (!agentForm.name || !agentForm.email || !agentForm.phone)) {
                            toast({ title: 'Missing fields', description: 'Name, email and phone are required', variant: 'destructive' });
                            return;
                          }
                          setFormStep(s => s + 1);
                        }} className="flex-1">
                          Next Step
                        </Button>
                      ) : (
                        <Button type="submit" disabled={isOnboarding} className="flex-1">
                          {isOnboarding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Onboarding...</> : <><UserPlus className="h-4 w-4 mr-2" /> Onboard Agent</>}
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      The agent can login with their email and phone number as password.
                    </p>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:w-auto bg-card">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agents">My Agents</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <Users className="h-8 w-8 text-primary" />
                      <Badge variant="secondary" className="text-xs">Total</Badge>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">{onboardedAgents.length}</p>
                    <p className="text-sm text-muted-foreground">Onboarded Agents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">{onboardedAgents.filter(a => a.status === 'active').length}</p>
                    <p className="text-sm text-muted-foreground">Active Agents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <Star className="h-8 w-8 text-amber-500" />
                      <Badge variant="secondary" className="text-xs">Approved</Badge>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">{onboardedAgents.filter(a => a.is_profile_approved).length}</p>
                    <p className="text-sm text-muted-foreground">Verified Profiles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Agents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Onboarded Agents</CardTitle>
                  <CardDescription>Latest agents you've onboarded</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAgents ? (
                    <div className="py-8 text-center text-muted-foreground">Loading agents...</div>
                  ) : onboardedAgents.length === 0 ? (
                    <div className="py-8 text-center">
                      <UserPlus className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">No agents onboarded yet</p>
                      <Button onClick={() => setShowOnboardDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Onboard Your First Agent
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {onboardedAgents.slice(0, 5).map((agent, idx) => (
                        <div key={agent.agent_id || idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={agent.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {(agent.full_name || '?').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-foreground">{agent.full_name || 'Agent'}</p>
                              <p className="text-xs text-muted-foreground">{agent.location || agent.email || 'No location set'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={agent.is_profile_approved ? 'default' : 'secondary'} className="text-xs">
                              {agent.is_profile_approved ? 'Verified' : 'Pending'}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{agent.subscription_plan || 'starter'}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>My Agents</CardTitle>
                      <CardDescription>All agents onboarded by you</CardDescription>
                    </div>
                    <Button onClick={() => setShowOnboardDialog(true)} size="sm">
                      <UserPlus className="h-4 w-4 mr-1" /> Add Agent
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAgents ? (
                    <div className="py-8 text-center text-muted-foreground">Loading...</div>
                  ) : onboardedAgents.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No agents onboarded yet. Click "Add Agent" to get started.</div>
                  ) : (
                    <div className="space-y-3">
                      {onboardedAgents.map((agent, idx) => (
                        <div key={agent.agent_id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={agent.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(agent.full_name || '?').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{agent.full_name || 'Agent'}</p>
                              <p className="text-xs text-muted-foreground">{agent.email}</p>
                              {agent.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{agent.location}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {agent.insurance_segments && agent.insurance_segments.map((seg: string) => (
                              <Badge key={seg} variant="secondary" className="text-xs">{seg}</Badge>
                            ))}
                            <Badge variant={agent.is_profile_approved ? 'default' : 'outline'} className="text-xs">
                              {agent.is_profile_approved ? '✓ Verified' : 'Pending Verification'}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{agent.subscription_plan || 'starter'}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Reports</CardTitle>
                  <CardDescription>Comprehensive business analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    Detailed reports and analytics will be available as your agent network grows.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
