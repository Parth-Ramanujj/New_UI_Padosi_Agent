import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface FullAgentProfile {
  // From profiles table
  fullName: string;
  displayName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  residenceAddress: string;
  avatarUrl: string;
  
  // From agent_profiles table
  panNumber: string;
  licenseNumber: string;
  officeAddress: string;
  serviceableCities: string[];
  yearsExperience: number;
  clientBase: string;
  companyName: string;
  hasPosLicense: boolean;
  familyLicenses: any[];
  languages: string[];
  insuranceSegments: string[];
  healthExpertise: Record<string, number>;
  lifeExpertise: Record<string, number>;
  motorExpertise: Record<string, number>;
  smeExpertise: Record<string, number>;
  productPortfolio: Record<string, any>;
  website: string;
  googleBusiness: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  careerHighlights: string;
  wantsPortfolioLeads: boolean;
  portfolioLeadCharging: string;
  portfolioLeadAmount: number;
  wantsClaimsLeads: boolean;
  claimsLeadCharging: string;
  claimsLeadAmount: number;
  declarationsAccepted: boolean;
  subscriptionPlan: string;
  isProfileApproved: boolean;
  bio: string;
  coverPage: string;
}

export interface ProfileCompletionSection {
  id: string;
  title: string;
  weight: number;
  isComplete: boolean;
  missingFields: string[];
}

export interface ProfileTip {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  section?: string;
}

const parseJsonField = (field: Json | null): any => {
  if (!field) return {};
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return {};
    }
  }
  return field;
};

export function useAgentProfileCompletion() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FullAgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Fetch from agent_profiles table
      const { data: agentData, error: agentError } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (agentError && agentError.code !== 'PGRST116') throw agentError;

      // Fetch sensitive details from isolated table
      const { data: sensitiveData, error: sensitiveError } = await supabase
        .from('agent_sensitive_details')
        .select('pan_number')
        .eq('agent_id', user.id)
        .maybeSingle();

      if (sensitiveError && sensitiveError.code !== 'PGRST116') throw sensitiveError;

      const fullProfile: FullAgentProfile = {
        // Profiles data
        fullName: profileData?.full_name || '',
        displayName: profileData?.display_name || '',
        phone: profileData?.phone || '',
        whatsappNumber: profileData?.whatsapp_number || '',
        email: profileData?.email || user.email || '',
        residenceAddress: profileData?.residence_address || '',
        avatarUrl: profileData?.avatar_url || '',
        
        // Agent profiles data
        panNumber: sensitiveData?.pan_number || '',
        licenseNumber: agentData?.license_number || '',
        officeAddress: agentData?.office_address || '',
        serviceableCities: agentData?.serviceable_cities || [],
        yearsExperience: agentData?.years_experience || 0,
        clientBase: agentData?.approx_client_base || '',
        companyName: agentData?.company_name || '',
        hasPosLicense: agentData?.has_pos_license || false,
        familyLicenses: parseJsonField(agentData?.family_licenses) || [],
        languages: agentData?.languages || [],
        insuranceSegments: agentData?.insurance_segments || [],
        healthExpertise: parseJsonField(agentData?.health_expertise),
        lifeExpertise: parseJsonField(agentData?.life_expertise),
        motorExpertise: parseJsonField(agentData?.motor_expertise),
        smeExpertise: parseJsonField(agentData?.sme_expertise),
        productPortfolio: parseJsonField(agentData?.product_portfolio),
        website: agentData?.website || '',
        googleBusiness: agentData?.google_business_profile || '',
        linkedin: agentData?.linkedin || '',
        instagram: agentData?.instagram || '',
        facebook: agentData?.facebook || '',
        youtube: agentData?.youtube || '',
        careerHighlights: agentData?.career_highlights || '',
        wantsPortfolioLeads: agentData?.wants_portfolio_leads || false,
        portfolioLeadCharging: agentData?.portfolio_lead_charging || 'free',
        portfolioLeadAmount: agentData?.portfolio_lead_amount || 0,
        wantsClaimsLeads: agentData?.wants_claims_leads || false,
        claimsLeadCharging: agentData?.claims_lead_charging || 'free',
        claimsLeadAmount: agentData?.claims_lead_amount || 0,
        declarationsAccepted: agentData?.declarations_accepted || false,
        subscriptionPlan: agentData?.subscription_plan || 'starter',
        isProfileApproved: agentData?.is_profile_approved || false,
        bio: agentData?.bio || '',
        coverPage: agentData?.cover_page || '',
      };

      setProfile(fullProfile);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Calculate section completeness
  const sections = useMemo((): ProfileCompletionSection[] => {
    if (!profile) return [];

    const basicMissing: string[] = [];
    if (!profile.fullName) basicMissing.push('Full Name');
    if (!profile.phone) basicMissing.push('Phone');
    if (!profile.email) basicMissing.push('Email');
    if (!profile.languages?.length) basicMissing.push('Languages');
    if (!profile.residenceAddress) basicMissing.push('Address');

    const professionalMissing: string[] = [];
    if (!profile.panNumber && !profile.licenseNumber) professionalMissing.push('PAN or License Number');
    if (!profile.serviceableCities?.length) professionalMissing.push('Serviceable Cities');
    if (!profile.yearsExperience) professionalMissing.push('Years of Experience');
    if (!profile.clientBase) professionalMissing.push('Client Base');

    const segmentsMissing: string[] = [];
    if (!profile.insuranceSegments?.length) segmentsMissing.push('Insurance Segments');

    const portfolioMissing: string[] = [];
    const hasPortfolio = profile.insuranceSegments?.some(seg => 
      profile.productPortfolio?.[seg]?.primaryCompany
    );
    if (profile.insuranceSegments?.length && !hasPortfolio) {
      portfolioMissing.push('Product Portfolio');
    }

    const additionalMissing: string[] = [];
    if (!profile.avatarUrl) additionalMissing.push('Profile Photo');
    if (!profile.careerHighlights && !profile.bio) additionalMissing.push('Bio/Career Highlights');

    const declarationsMissing: string[] = [];
    if (!profile.declarationsAccepted) declarationsMissing.push('Accept Declarations');

    return [
      {
        id: 'basic',
        title: 'Basic Details',
        weight: 20,
        isComplete: basicMissing.length === 0,
        missingFields: basicMissing,
      },
      {
        id: 'professional',
        title: 'Professional Details',
        weight: 20,
        isComplete: professionalMissing.length === 0,
        missingFields: professionalMissing,
      },
      {
        id: 'segments',
        title: 'Insurance Segments',
        weight: 15,
        isComplete: segmentsMissing.length === 0,
        missingFields: segmentsMissing,
      },
      {
        id: 'portfolio',
        title: 'Product Portfolio',
        weight: 15,
        isComplete: portfolioMissing.length === 0,
        missingFields: portfolioMissing,
      },
      {
        id: 'additional',
        title: 'Profile Enhancement',
        weight: 20,
        isComplete: additionalMissing.length === 0,
        missingFields: additionalMissing,
      },
      {
        id: 'declarations',
        title: 'Declarations',
        weight: 10,
        isComplete: declarationsMissing.length === 0,
        missingFields: declarationsMissing,
      },
    ];
  }, [profile]);

  // Calculate overall completion percentage with partial credit per section
  const completionPercentage = useMemo(() => {
    if (!sections.length) return 0;
    
    // Define total expected fields per section for partial scoring
    const sectionFieldCounts: Record<string, number> = {
      basic: 5,       // fullName, phone, email, languages, address
      professional: 4, // PAN/License, cities, experience, clientBase
      segments: 1,     // insuranceSegments
      portfolio: 1,    // productPortfolio
      additional: 2,   // avatar, bio/career
      declarations: 1, // declarations
    };

    let totalWeightedScore = 0;
    
    sections.forEach((section) => {
      const totalFields = sectionFieldCounts[section.id] || 1;
      const completedFields = totalFields - section.missingFields.length;
      const sectionScore = Math.max(0, completedFields / totalFields);
      totalWeightedScore += sectionScore * section.weight;
    });
    
    return Math.round(totalWeightedScore);
  }, [sections]);

  // Generate tips based on profile status
  const tips = useMemo((): ProfileTip[] => {
    if (!profile) return [];

    const generatedTips: ProfileTip[] = [];

    // High priority tips
    if (!profile.avatarUrl) {
      generatedTips.push({
        id: 'add-photo',
        title: 'Add a Profile Photo',
        description: 'Profiles with photos get 3x more views. Upload a professional headshot to build trust.',
        priority: 'high',
        actionLabel: 'Add Photo',
        section: 'basic',
      });
    }

    if (!profile.declarationsAccepted) {
      generatedTips.push({
        id: 'accept-declarations',
        title: 'Complete Declarations',
        description: 'Accept the terms and declarations to activate your profile visibility.',
        priority: 'high',
        actionLabel: 'Complete Now',
        section: 'declarations',
      });
    }

    if (!profile.insuranceSegments?.length) {
      generatedTips.push({
        id: 'add-segments',
        title: 'Select Insurance Segments',
        description: 'Choose your areas of expertise to appear in relevant searches.',
        priority: 'high',
        actionLabel: 'Add Segments',
        section: 'segments',
      });
    }

    // Medium priority tips
    if (!profile.careerHighlights && !profile.bio) {
      generatedTips.push({
        id: 'add-bio',
        title: 'Write Your Bio',
        description: 'A compelling bio helps customers understand your expertise and approach.',
        priority: 'medium',
        actionLabel: 'Add Bio',
        section: 'additional',
      });
    }

    if (!profile.linkedin && !profile.website) {
      generatedTips.push({
        id: 'add-social',
        title: 'Add Social Links',
        description: 'Connect your LinkedIn or website to build credibility.',
        priority: 'medium',
        actionLabel: 'Add Links',
        section: 'additional',
      });
    }

    if (profile.yearsExperience >= 5 && !profile.wantsPortfolioLeads) {
      generatedTips.push({
        id: 'enable-portfolio-leads',
        title: 'Enable Portfolio Analysis Leads',
        description: 'With 5+ years experience, you can receive portfolio review leads.',
        priority: 'medium',
        actionLabel: 'Enable',
        section: 'leads',
      });
    }

    // Low priority tips
    if (!profile.googleBusiness) {
      generatedTips.push({
        id: 'add-google-business',
        title: 'Link Google Business Profile',
        description: 'Improve your local search visibility with a Google Business link.',
        priority: 'low',
        actionLabel: 'Add Link',
        section: 'additional',
      });
    }

    if (profile.serviceableCities?.length < 3) {
      generatedTips.push({
        id: 'add-cities',
        title: 'Expand Service Area',
        description: 'Add more serviceable cities to reach more potential clients.',
        priority: 'low',
        actionLabel: 'Add Cities',
        section: 'professional',
      });
    }

    return generatedTips;
  }, [profile]);

  const isProfileComplete = completionPercentage >= 80;
  const hasCompletedSetup = profile?.declarationsAccepted || false;

  return {
    profile,
    isLoading,
    error,
    sections,
    completionPercentage,
    tips,
    isProfileComplete,
    hasCompletedSetup,
    refreshProfile: fetchProfile,
  };
}
