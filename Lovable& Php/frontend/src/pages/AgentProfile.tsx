import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, Star, Award, CheckCircle, Heart, Car, Shield, Clock, Plane, 
  Building2, MessageSquare, ArrowLeft, Trophy, Medal, Target, TrendingUp, Languages,
  Calendar, FileCheck, Briefcase, Facebook, Linkedin, Eye, Users, Search, BarChart3, Sparkles, ArrowUpRight, Percent, Share2
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from "@/hooks/use-toast";
import WriteReviewForm from '@/components/WriteReviewForm';
import EditAgentProfileDialog from '@/components/EditAgentProfileDialog';
import { useAuth } from '@/contexts/AuthContext';
import { coverPageOptions } from '@/components/CoverPageSelector';
import { cn } from '@/lib/utils';
import { useAgentProfile, trackAgentPageView, trackContactRequest } from '@/hooks/useAgentProfile';
import AgentProfileSkeleton from '@/components/skeletons/AgentProfileSkeleton';
import ShareProfileButton from '@/components/ShareProfileButton';
import ContactDetailsPopup from '@/components/ContactDetailsPopup';
import { getSavedSeekerDetails } from '@/components/SeekerDetailsPopup';

import LicensedBadge from '@/components/LicensedBadge';
import TrustedBadge from '@/components/TrustedBadge';
import { calculateMatchingScore } from '@/lib/matchingAlgorithm';

const AgentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  // Contact details popup state
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactMethod, setContactMethod] = useState<'call' | 'whatsapp' | 'social' | 'review'>('call');
  const [pendingSocialLink, setPendingSocialLink] = useState<string | null>(null);
  const [showReviewAfterPopup, setShowReviewAfterPopup] = useState(false);
  
  const { agent, isLoading, error, updateAgent } = useAgentProfile(id);
  
  // Check if logged-in user is viewing their own profile (agent role)
  const isOwnProfile = user?.role === 'agent' && String(agent?.id) === String(user?.id);

  // Check if user has provided contact details
  const hasContactDetails = () => {
    if (user) return true; // Logged in users already have details
    const saved = getSavedSeekerDetails();
    return !!(saved?.name && saved?.email && saved?.phone);
  };

  // Calculate matching percentage using full algorithm
  const matchingPercentage = useMemo(() => {
    if (!agent) return 0;
    const yearsMatch = agent.experience?.match(/(\d+)/);
    const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    return calculateMatchingScore({
      agentLocation: (agent as any).location || '',
      agentSpecializations: agent.specializations || [],
      agentLanguages: agent.languages || ['English'],
      agentExperience: years,
      agentRating: agent.rating || 0,
      agentReviewCount: agent.reviewCount || 0,
    });
  }, [agent]);

  // Track scroll for sticky bar animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickyBar(scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page view when visiting the profile
  useEffect(() => {
    if (id && !isOwnProfile) {
      trackAgentPageView(id);
    }
  }, [id, isOwnProfile]);

  useEffect(() => {
    if (location.hash === '#reviews') {
      const reviewsElement = document.getElementById('reviews-section');
      if (reviewsElement) {
        reviewsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const captureLeadForProfile = (agentId: string, agentName: string, contactMethod: string) => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(agentId)) return;

    // Client-side 5-minute dedup guard per agent
    try {
      const dedupKey = `lead_dedup_${agentId}`;
      const lastCapture = sessionStorage.getItem(dedupKey);
      if (lastCapture && Date.now() - parseInt(lastCapture) < 5 * 60 * 1000) return;
      sessionStorage.setItem(dedupKey, String(Date.now()));
    } catch { /* ignore */ }

    // Try localStorage seeker details (non-authenticated visitors)
    let seekerData: any = null;
    try {
      const saved = localStorage.getItem('seekerDetails');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
          seekerData = parsed;
        }
      }
    } catch { /* ignore */ }

    if (!seekerData?.phone) return;

    // Try to read filter context from localStorage
    let filterContext: any = {};
    try {
      const savedFilters = localStorage.getItem('agentFilters');
      if (savedFilters) filterContext = JSON.parse(savedFilters);
    } catch { /* ignore */ }

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    fetch(`https://${projectId}.supabase.co/functions/v1/capture-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({
        agent_id: agentId,
        name: seekerData.name,
        email: seekerData.email,
        phone: seekerData.phone,
        location: seekerData.pincode || '',
        contact_method: contactMethod,
        service_type: filterContext.serviceType || '',
        insurance_type: filterContext.insuranceType || '',
        insurance_company: filterContext.insuranceCompany || '',
        complaint_type: filterContext.complaintType || '',
        sub_product: filterContext.subProduct || '',
      }),
    }).then(() => {
      toast({ title: `Your details shared with ${agent?.name}`, description: 'The agent will get back to you soon.' });
    }).catch(() => { /* silent fail */ });
  };

  // Gate an action behind contact details popup
  const requireContactDetails = (method: 'call' | 'whatsapp' | 'social' | 'review', socialLink?: string) => {
    if (hasContactDetails()) {
      // Already have details, proceed directly
      if (method === 'call' || method === 'whatsapp') {
        executeContact(method);
      } else if (method === 'social' && socialLink) {
        window.open(socialLink, '_blank', 'noopener,noreferrer');
      } else if (method === 'review') {
        setShowReviewAfterPopup(true);
      }
      return;
    }
    // Show popup
    setContactMethod(method);
    if (method === 'social' && socialLink) {
      setPendingSocialLink(socialLink);
    }
    setShowContactPopup(true);
  };

  const executeContact = (method: string) => {
    if (!agent || !id) return;
    trackContactRequest(id);
    
    if (method === 'call') {
      window.location.href = `tel:${agent.phone}`;
      toast({ title: `Calling ${agent.name}` });
      captureLeadForProfile(id, agent.name, 'call');
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
      toast({ title: `WhatsApp ${agent.name}` });
      captureLeadForProfile(id, agent.name, 'whatsapp');
    }
  };

  const handleContactDetailsSubmit = () => {
    setShowContactPopup(false);
    if (contactMethod === 'call' || contactMethod === 'whatsapp') {
      executeContact(contactMethod);
    } else if (contactMethod === 'social' && pendingSocialLink) {
      window.open(pendingSocialLink, '_blank', 'noopener,noreferrer');
      setPendingSocialLink(null);
    } else if (contactMethod === 'review') {
      setShowReviewAfterPopup(true);
    }
  };

  // Achievement icons map
  const achievementIcons: Record<string, React.ReactNode> = {
    'Top Performer 2023': <Trophy className="h-5 w-5" />,
    'Claim Master': <Award className="h-5 w-5" />,
    '5 Star Rating': <Star className="h-5 w-5" />,
    'Excellence Award 2023': <Medal className="h-5 w-5" />,
    'Customer Favorite': <Heart className="h-5 w-5" />,
  };

  if (isLoading) {
    return <AgentProfileSkeleton />;
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">{error || 'Agent not found'}</p>
              <Button asChild>
                <Link to="/agents"><ArrowLeft className="mr-2 h-4 w-4" />Back to Agents</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Whether to show review form (only after contact details provided or user is logged in)
  const canReview = hasContactDetails() || showReviewAfterPopup;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      {/* Contact Details Popup */}
      <ContactDetailsPopup
        isOpen={showContactPopup}
        onClose={() => { setShowContactPopup(false); setPendingSocialLink(null); }}
        onSubmit={handleContactDetailsSubmit}
        agentName={agent.name}
        contactMethod={contactMethod}
      />
      
      <div className="flex-grow">
        {/* Two Rectangle Layout - Cover + Info */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10">
          {/* Rectangle 1: Cover Page */}
          <div className={cn(
            "h-32 sm:h-44 md:h-52 lg:h-60 w-full relative overflow-hidden rounded-t-xl sm:rounded-t-2xl",
            coverPageOptions.find(c => c.id === agent.coverPage)?.className || coverPageOptions[0].className
          )}>
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4)_0%,transparent_50%)]" />
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.3)_0%,transparent_40%)]" />
            </div>
            
            {/* Matching Percentage Stamp - Top Right Corner (hidden for own profile) */}
            {!isOwnProfile && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
                <div className={cn(
                  "flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-sm",
                  matchingPercentage > 90 ? 'bg-green-500/90 text-white' :
                  matchingPercentage >= 70 ? 'bg-amber-500/90 text-white' :
                  'bg-red-500/90 text-white'
                )}>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  {matchingPercentage}% Match
                </div>
              </div>
            )}
            
            {/* Back Button on Cover */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
              <Button variant="ghost" size="sm" className="bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
                <Link to="/agents"><ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />Back</Link>
              </Button>
            </div>
            
            {/* Edit Button below Match stamp (for own profile) */}
            {isOwnProfile && (
              <div className="absolute top-12 sm:top-16 right-2 sm:right-4 z-20">
                <EditAgentProfileDialog 
                  agent={{...agent, id: agent.id as any}} 
                  onSave={(updatedAgent) => updateAgent({...updatedAgent, id: String(updatedAgent.id)})} 
                />
              </div>
            )}
          </div>
          
          {/* Rectangle 2: Info Section with Profile Photo */}
          <Card className="bg-card shadow-xl border-0 rounded-t-none rounded-b-xl sm:rounded-b-2xl relative">
            <CardContent className="p-3 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-3 md:gap-8">
                {/* Left Side: Avatar centered-left with social links */}
                <div className="flex flex-col items-center md:items-start -mt-16 sm:-mt-24 md:-mt-28">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Avatar className="h-24 w-24 sm:h-36 sm:w-36 md:h-40 md:w-40 border-4 border-card shadow-2xl rounded-full">
                      <AvatarImage src={agent.image} alt={agent.name} className="object-cover" />
                      <AvatarFallback className="text-3xl sm:text-4xl md:text-5xl bg-primary text-primary-foreground">{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {agent.verified && (
                      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-primary text-white rounded-full p-1.5 sm:p-2 shadow-lg border-2 sm:border-3 border-card">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      </div>
                    )}
                  </div>
                  
                  {/* Social Links - Below Avatar (gated behind contact details) */}
                  {agent.visibility.show_social_links && agent.socialLinks && (
                    <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                      {agent.socialLinks.linkedin && (
                        <button 
                          onClick={() => requireContactDetails('social', agent.socialLinks.linkedin)}
                          className="p-2 sm:p-2.5 rounded-full bg-muted hover:bg-primary/10 transition-colors shadow-sm"
                        >
                          <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A66C2]" />
                        </button>
                      )}
                      {agent.socialLinks.facebook && (
                        <button 
                          onClick={() => requireContactDetails('social', agent.socialLinks.facebook)}
                          className="p-2 sm:p-2.5 rounded-full bg-muted hover:bg-primary/10 transition-colors shadow-sm"
                        >
                          <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-[#1877F2]" />
                        </button>
                      )}
                      {agent.socialLinks.twitter && (
                        <button 
                          onClick={() => requireContactDetails('social', agent.socialLinks.twitter)}
                          className="p-2 sm:p-2.5 rounded-full bg-muted hover:bg-primary/10 transition-colors shadow-sm"
                        >
                          <FaXTwitter className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons - Below Social on Mobile/Tablet, Side on Desktop */}
                  <div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-4 w-full md:w-auto">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-md flex-1 sm:flex-none sm:w-full h-9 sm:h-10 text-xs sm:text-sm" onClick={() => requireContactDetails('whatsapp')}>
                      <MessageSquare className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="border-2 border-muted-foreground/20 hover:bg-muted flex-1 sm:flex-none sm:w-full h-9 sm:h-10 text-xs sm:text-sm" onClick={() => requireContactDetails('call')}>
                      <Phone className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />Call Now
                    </Button>
                  </div>
                </div>
                
                {/* Right Side: Info Section */}
                <div className="flex-grow text-center md:text-left pt-1 sm:pt-2 md:pt-8">
                  {/* Name & Badges Row */}
                  <div className="flex flex-col md:flex-row md:items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{agent.name}</h1>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center md:justify-start">
                      {agent.verified && (
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px] sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1">
                          <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />Verified
                        </Badge>
                      )}
                      {agent.irdaLicensed && (
                        <LicensedBadge variant="prominent" themeColor="accent" />
                      )}
                      {agent.planType === 'professional' && (
                        <TrustedBadge variant="default" />
                      )}
                    </div>
                  </div>
                  
                  {/* Bio/Headline */}
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-3 sm:mb-4 max-w-2xl line-clamp-2 sm:line-clamp-none">{agent.bio}</p>
                  
                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4 justify-center md:justify-start">
                    {agent.visibility.show_experience && (
                      <span className="flex items-center gap-1 sm:gap-1.5 bg-muted/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                        <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                        {agent.experience}
                      </span>
                    )}
                    {agent.visibility.show_client_base && (
                      <span className="flex items-center gap-1 sm:gap-1.5 bg-muted/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        {agent.stats.clientsServed} clients
                      </span>
                    )}
                    {agent.visibility.show_languages && (
                      <span className="hidden sm:flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Languages className="h-4 w-4" />
                        {agent.languages.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  {/* Specializations Pills */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center md:justify-start mb-3 sm:mb-5">
                    {agent.specializations.map((spec: string, i: number) => {
                      const iconMap: Record<string, any> = {
                        'Health Insurance': <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
                        'Life Insurance': <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
                        'Motor Insurance': <Car className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
                        'Travel Insurance': <Plane className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      };
                      return (
                        <Badge key={i} variant="secondary" className="bg-secondary/10 text-secondary border-0 text-[10px] sm:text-sm gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1">
                          {iconMap[spec] || null}
                          {spec}
                        </Badge>
                      );
                    })}
                  </div>
                  
                  {/* Rating & Reviews - Clickable */}
                  {!isOwnProfile && agent.visibility.show_ratings && (
                    <button 
                      onClick={() => {
                        const reviewsElement = document.getElementById('reviews-section');
                        if (reviewsElement) {
                          reviewsElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(agent.rating) ? 'fill-amber-500 text-amber-500' : 'text-amber-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-amber-700 text-xs sm:text-base">{agent.rating}</span>
                      <span className="text-amber-600 text-[10px] sm:text-sm">({agent.reviewCount} reviews)</span>
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 group-hover:text-amber-700 transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Sidebar - Timeline & Certifications */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
              {/* Timeline Card */}
              <Card className="shadow-sm border bg-card rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-muted/20 py-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Career Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="relative space-y-4">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20"></div>
                    
                    {agent.timeline.map((item: any, i: number) => {
                      const isLatest = i === 0;
                      
                      return (
                        <div key={i} className="flex gap-4 relative">
                          {/* Timeline Dot */}
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0",
                            isLatest 
                              ? "bg-primary border-primary" 
                              : "bg-card border-muted-foreground/30"
                          )}>
                            {item.type === 'achievement' && <Trophy className={cn("h-3 w-3", isLatest ? "text-white" : "text-amber-500")} />}
                            {item.type === 'milestone' && <Target className={cn("h-3 w-3", isLatest ? "text-white" : "text-primary")} />}
                            {item.type === 'certification' && <FileCheck className={cn("h-3 w-3", isLatest ? "text-white" : "text-secondary")} />}
                            {item.type === 'career' && <Briefcase className={cn("h-3 w-3", isLatest ? "text-white" : "text-muted-foreground")} />}
                          </div>
                          
                          {/* Content */}
                          <div className={cn(
                            "flex-grow pb-4",
                            i === agent.timeline.length - 1 && "pb-0"
                          )}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-primary">
                                {item.month ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(item.month) - 1] || ''} ${item.year}` : item.year}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm",
                              isLatest ? "font-medium text-foreground" : "text-muted-foreground"
                            )}>{item.event}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications Card */}
              {agent.visibility.show_certificates && (
                <Card className="shadow-sm border bg-card rounded-xl overflow-hidden">
                  <CardHeader className="border-b bg-muted/20 py-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <FileCheck className="h-4 w-4 text-secondary" />
                      <span>Certifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {agent.certifications.map((cert: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <Award className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Achievements - Small badges */}
              {agent.visibility.show_achievements && agent.achievements && agent.achievements.length > 0 && (
                <Card className="shadow-sm border bg-card rounded-xl overflow-hidden">
                  <CardHeader className="border-b bg-muted/20 py-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span>Achievements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {agent.achievements.map((achievement: any, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1.5 px-2 py-1">
                          {achievementIcons[achievement.title] || <Star className="h-3 w-3" />}
                          {achievement.title}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Content - Stats, Gallery, Reviews */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Stats Grid - 2x3 */}
              {agent.visibility.show_claims_stats && (
                <Card className="shadow-sm border bg-card rounded-xl overflow-hidden">
                  <CardHeader className="border-b bg-muted/20 py-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>Performance Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {agent.visibility.show_client_base && (
                        <div className="p-2 sm:p-3 bg-primary/5 rounded-lg text-center">
                          <p className="text-base sm:text-lg font-bold text-primary">{agent.stats.clientsServed}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Clients Served</p>
                        </div>
                      )}
                      <div className="p-2 sm:p-3 bg-secondary/5 rounded-lg text-center">
                        <p className="text-base sm:text-lg font-bold text-secondary">{agent.stats.claimsProcessed}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Claims Processed</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-accent/5 rounded-lg text-center">
                        <p className="text-base sm:text-lg font-bold text-accent">{agent.stats.successRate}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-base sm:text-lg font-bold text-foreground">{agent.stats.claimsAmount}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Claims Settled</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-base sm:text-lg font-bold text-foreground">{agent.stats.responseTime}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Response Time</p>
                      </div>
                      {agent.visibility.show_ratings && (
                        <div className="p-2 sm:p-3 bg-muted/50 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                            <p className="text-base sm:text-lg font-bold text-foreground">{agent.rating}</p>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Rating</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Your Profile Analytics - Only for own profile */}
              {isOwnProfile && (
                <Card className="shadow-sm border bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl overflow-hidden">
                  <CardHeader className="border-b bg-muted/20 py-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Your Profile Analytics</span>
                      <Badge variant="secondary" className="ml-auto text-xs">This Week</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {[
                        { label: 'Profile Views', icon: <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />, value: agent.analytics?.page_views || 0, lastWeek: agent.weeklyTrends?.lastWeek.page_views || 0, thisWeek: agent.weeklyTrends?.thisWeek.page_views || 0, color: 'text-primary' },
                        { label: 'Search Appearances', icon: <Search className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />, value: agent.analytics?.profile_clicks || 0, lastWeek: agent.weeklyTrends?.lastWeek.profile_clicks || 0, thisWeek: agent.weeklyTrends?.thisWeek.profile_clicks || 0, color: 'text-secondary' },
                        { label: 'Contact Requests', icon: <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />, value: agent.analytics?.contact_requests || 0, lastWeek: agent.weeklyTrends?.lastWeek.contact_requests || 0, thisWeek: agent.weeklyTrends?.thisWeek.contact_requests || 0, color: 'text-accent' },
                      ].map((stat, i) => {
                        const diff = stat.thisWeek - stat.lastWeek;
                        const pctChange = stat.lastWeek > 0 ? Math.round((diff / stat.lastWeek) * 100) : (stat.thisWeek > 0 ? 100 : 0);
                        return (
                          <div key={i} className="text-center p-2 sm:p-4 bg-card rounded-xl shadow-sm">
                            <div className="flex items-center justify-center mb-1 sm:mb-2">
                              {stat.icon}
                            </div>
                            <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[9px] sm:text-xs text-muted-foreground">{stat.label}</p>
                            {(stat.thisWeek > 0 || stat.lastWeek > 0) && (
                              <p className={`text-[9px] sm:text-[10px] mt-1 font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {diff > 0 ? '↑' : diff < 0 ? '↓' : '→'} {Math.abs(pctChange)}% vs last week
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-card/80 rounded-lg border border-dashed border-primary/20">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">Tip:</span> Complete your gallery to increase profile views by up to 40%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Pricing Card */}
              <Card className="shadow-sm border bg-card rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-muted/20 py-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Service Fees</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-accent/5 rounded-lg text-center">
                      <p className="text-base sm:text-lg font-bold text-accent">
                        {agent.serviceFees?.portfolioCharging === 'free' || !agent.serviceFees?.portfolioAmount ? 'Free' : `₹${agent.serviceFees.portfolioAmount}`}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground">New Policy</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-base sm:text-lg font-bold text-foreground">
                        {agent.serviceFees?.claimsCharging === 'free' || !agent.serviceFees?.claimsAmount ? 'Free' : `₹${agent.serviceFees.claimsAmount}`}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground">Claim Help</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-primary/5 rounded-lg text-center">
                      <p className="text-base sm:text-lg font-bold text-primary">Free</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground">Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Section */}
              {agent.visibility.show_gallery && agent.gallery && agent.gallery.length > 0 && (
                <Card className="shadow-sm border bg-card rounded-xl overflow-hidden">
                  <CardHeader className="border-b bg-muted/20 py-3 px-4">
                    <CardTitle className="flex items-center justify-between text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-accent" />
                        Media
                      </div>
                      <span className="text-xs text-muted-foreground font-normal">
                        {agent.planType === 'professional' ? '10 max' : '5 max'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {agent.gallery.slice(0, agent.planType === 'professional' ? 10 : 5).map((img: string, i: number) => (
                        <div key={i} className="aspect-square rounded-md sm:rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity cursor-pointer">
                          <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              {agent.visibility.show_comments && (
                <Card className="shadow-sm border bg-card rounded-xl overflow-hidden" id="reviews-section">
                  <CardHeader className="border-b bg-muted/20 py-3 px-4">
                    <CardTitle className="flex items-center justify-between text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Reviews
                      </div>
                      <span className="text-xs text-muted-foreground font-normal">{agent.reviewCount} total</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-4">
                      {/* Add Review - Gated behind contact details */}
                      {!isOwnProfile && (
                        <>
                          {canReview ? (
                            <WriteReviewForm agentId={agent.id} onReviewSubmitted={() => {}} />
                          ) : (
                            <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed border-primary/20">
                              <Star className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                              <p className="text-sm font-medium text-foreground mb-1">Share your experience</p>
                              <p className="text-xs text-muted-foreground mb-3">Provide your details to write a review</p>
                              <Button size="sm" onClick={() => requireContactDetails('review')}>
                                Write a Review
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      {isOwnProfile && (
                        <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed">
                          <p className="text-sm text-muted-foreground">You cannot review your own profile</p>
                        </div>
                      )}
                      
                      {/* Existing Reviews */}
                      <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
                        {agent.reviews.map((review: any) => (
                          <div key={review.id} className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border shrink-0">
                                <AvatarFallback className="text-xs sm:text-sm bg-primary/10 text-primary">
                                  {review.clientName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1 gap-2">
                                  <span className="font-semibold text-xs sm:text-sm truncate">{review.clientName}</span>
                                  <div className="flex gap-0.5 shrink-0">
                                    {[...Array(review.rating)].map((_: any, i: number) => (
                                      <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-500 text-amber-500" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">{review.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Contact Bar for Mobile */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] safe-area-bottom transition-all duration-300 ease-out",
          showStickyBar 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0"
        )}
      >
        <div className="flex items-center gap-2 p-3 max-w-lg mx-auto">
          <Button 
            size="lg" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md h-11 text-sm font-medium"
            onClick={() => requireContactDetails('whatsapp')}
          >
            <MessageSquare className="mr-1.5 h-4 w-4" />
            WhatsApp
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="flex-1 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 h-11 text-sm font-medium"
            onClick={() => requireContactDetails('call')}
          >
            <Phone className="mr-1.5 h-4 w-4" />
            Call
          </Button>
          <ShareProfileButton 
            agentName={agent.name} 
            agentId={agent.id} 
            variant="compact"
          />
        </div>
      </div>

      <div className="h-20 md:hidden" />

      <Footer />
    </div>
  );
};

export default AgentProfile;
