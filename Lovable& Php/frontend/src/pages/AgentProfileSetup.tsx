import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/components/ui/sonner";
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExpertiseGrid from '@/components/agent-profile/ExpertiseGrid';
import type { ExpertiseLevel } from '@/components/agent-profile/ExpertiseGrid';
import FamilyLicenseManager, { FamilyLicense } from '@/components/agent-profile/FamilyLicenseManager';
import ProductPortfolioManager, { SegmentPortfolio } from '@/components/agent-profile/ProductPortfolioManager';
import LeadPreferences from '@/components/agent-profile/LeadPreferences';
import MultiSelectDropdown from '@/components/agent-profile/MultiSelectDropdown';
import type { GalleryImage } from '@/components/AgentGalleryManager';
import AgentProfilePreview from '@/components/AgentProfilePreview';
import CareerTimelineManager from '@/components/agent-profile/CareerTimelineManager';
import ProfileSetupGuide from '@/components/ProfileSetupGuide';
import MobileStepProgress from '@/components/MobileStepProgress';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { 
  User, 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Users,
  MapPin,
  Phone,
  Award,
  Globe,
  Camera,
  Loader2,
  X,
  HeartPulse,
  Heart,
  Car,
  Building2,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
  Save,
  Image as ImageIcon,
  Sparkles,
  Pencil,
  Check,
  Eye,
  HelpCircle,
  ExternalLink,
  BarChart3,
  PartyPopper,
  TrendingUp,
  Navigation
} from 'lucide-react';

// GPS reverse geocode helper — returns address details from coordinates
async function gpsReverseGeocode(lat: number, lon: number): Promise<{ address: string; pincode: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'PadosiAgent/1.0' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const parts: string[] = [];
    if (addr.amenity || addr.building) parts.push(addr.amenity || addr.building);
    if (addr.road) parts.push(addr.road);
    if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
    if (addr.city || addr.town || addr.village || addr.state_district) parts.push(addr.city || addr.town || addr.village || addr.state_district);
    if (addr.state) parts.push(addr.state);
    const pincode = addr.postcode || '';
    const address = parts.length > 0 ? parts.join(', ') : (data.display_name || '');
    return { address, pincode: pincode.replace(/\D/g, '').slice(0, 6) };
  } catch {
    return null;
  }
}
import InfoTooltip from '@/components/InfoTooltip';

// Gallery Image Card Component with Caption
const GalleryImageCard: React.FC<{
  image: GalleryImage;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
}> = ({ image, onRemove, onCaptionChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(image.caption);

  const handleSave = () => {
    onCaptionChange(caption);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setCaption(image.caption);
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border bg-muted/20">
      <div className="relative aspect-[4/3] group">
        <img src={image.url} alt={image.caption || 'Gallery image'} className="w-full h-full object-cover" />
        <button 
          onClick={onRemove} 
          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="p-2 border-t bg-background">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Office, Award, Achievement..."
              className="h-7 text-xs"
              maxLength={100}
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSave}>
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between gap-1 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
            onClick={() => setIsEditing(true)}
          >
            <p className="text-xs text-muted-foreground truncate flex-1">
              {image.caption || 'Click to add caption...'}
            </p>
            <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

// Types
type Section = 'basic' | 'professional' | 'portfolio' | 'additional';

interface BasicDetails {
  fullName: string;
  displayName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  languages: string[];
  residenceAddress: string;
  residencePincode: string;
  avatarUrl: string;
}

interface ProfessionalDetails {
  panNumber: string;
  licenseNumber: string;
  officeAddress: string;
  officePincode: string;
  serviceableCities: string[];
  yearsExperience: string;
  clientBase: string;
  companyName: string;
  hasPosLicense: boolean;
  familyLicenses: FamilyLicense[];
  // Performance stats
  claimsProcessed: string;
  claimsSettled: string;
  claimsAmount: string;
  successRate: string;
  responseTime: string;
}

interface InsuranceSegments {
  health: boolean;
  life: boolean;
  motor: boolean;
  sme: boolean;
}

interface TimelineEntry {
  id: string;
  year: string;
  month?: string;
  event: string;
  type: 'career' | 'achievement' | 'certification' | 'milestone';
}

interface AdditionalDetails {
  website: string;
  googleBusiness: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  careerHighlights: string;
  careerTimeline: TimelineEntry[];
  galleryImages: GalleryImage[];
}

// Constants
const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 
  'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu'
];

const CITY_OPTIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 
  'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur'
];

const HEALTH_PRODUCTS = [
  { id: 'mediclaim', name: 'Mediclaim' },
  { id: 'personal_accident', name: 'Personal Accident' },
  { id: 'critical_illness', name: 'Critical Illness' },
  { id: 'super_topup', name: 'Super Top-Up' },
];

const LIFE_PRODUCTS = [
  { id: 'term_plan', name: 'Term Plan' },
  { id: 'pension_plan', name: 'Pension Plan' },
  { id: 'guaranteed_plan', name: 'Guaranteed Plan' },
  { id: 'saving_plan', name: 'Saving Plan' },
  { id: 'ulip_plan', name: 'ULIP Plan' },
  { id: 'others', name: 'Others' },
];

const MOTOR_PRODUCTS = [
  { id: 'private_car', name: 'Private Car' },
  { id: 'two_wheeler', name: 'Two Wheeler' },
  { id: 'commercial_vehicle', name: 'Commercial Vehicle' },
  { id: 'three_wheeler', name: '3 Wheeler' },
  { id: 'others', name: 'Others' },
];

const SME_PRODUCTS = [
  { id: 'fire', name: 'Fire' },
  { id: 'marine', name: 'Marine / Transport' },
  { id: 'workmen_comp', name: 'Workmen Compensation' },
  { id: 'gpa_gmc', name: 'GPA / GMC' },
  { id: 'group_term', name: 'Group Term Insurance' },
  { id: 'liability', name: 'Liability' },
  { id: 'cyber', name: 'Cyber' },
  { id: 'others', name: 'Others' },
];

const AgentProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isRewritingBio, setIsRewritingBio] = useState(false);
  const [bioAutoGenerated, setBioAutoGenerated] = useState(false);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoSaveRef = useRef<string>('');
  const [gpsLoadingResidence, setGpsLoadingResidence] = useState(false);
  const [gpsLoadingOffice, setGpsLoadingOffice] = useState(false);

  const handleGpsDetect = useCallback(async (target: 'residence' | 'office') => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }
    const setLoading = target === 'residence' ? setGpsLoadingResidence : setGpsLoadingOffice;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await gpsReverseGeocode(position.coords.latitude, position.coords.longitude);
        if (result) {
          if (target === 'residence') {
            setBasicDetails(prev => ({
              ...prev,
              residenceAddress: result.address,
              residencePincode: result.pincode,
            }));
          } else {
            setProfessionalDetails(prev => ({
              ...prev,
              officeAddress: result.address,
              officePincode: result.pincode,
            }));
          }
          toast.success('📍 Location detected! Please verify and edit if needed.');
        } else {
          toast.error('Could not detect address. Please enter manually.');
        }
        setLoading(false);
      },
      () => {
        toast.error('GPS access denied. Please allow location access and try again.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  // State for all sections
  const [basicDetails, setBasicDetails] = useState<BasicDetails>({
    fullName: user?.name || '',
    displayName: '',
    phone: user?.phone || '',
    whatsappNumber: '',
    email: user?.email || '',
    languages: ['English'],
    residenceAddress: '',
    residencePincode: '',
    avatarUrl: '',
  });

  const [professionalDetails, setProfessionalDetails] = useState<ProfessionalDetails>({
    panNumber: '',
    licenseNumber: '',
    officeAddress: '',
    officePincode: '',
    serviceableCities: [],
    yearsExperience: '',
    clientBase: '',
    companyName: '',
    hasPosLicense: false,
    familyLicenses: [],
    // Performance stats
    claimsProcessed: '',
    claimsSettled: '',
    claimsAmount: '',
    successRate: '',
    responseTime: '',
  });

  const [insuranceSegments, setInsuranceSegments] = useState<InsuranceSegments>({
    health: false,
    life: false,
    motor: false,
    sme: false,
  });

  const [healthExpertise, setHealthExpertise] = useState<Record<string, ExpertiseLevel>>({});
  const [lifeExpertise, setLifeExpertise] = useState<Record<string, ExpertiseLevel>>({});
  const [motorExpertise, setMotorExpertise] = useState<Record<string, ExpertiseLevel>>({});
  const [smeExpertise, setSmeExpertise] = useState<Record<string, ExpertiseLevel>>({});

  // Custom products for each segment
  const [customHealthProducts, setCustomHealthProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);
  const [customLifeProducts, setCustomLifeProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);
  const [customMotorProducts, setCustomMotorProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);
  const [customSmeProducts, setCustomSmeProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);

  // Add/remove custom products
  const addCustomProduct = (
    segment: 'health' | 'life' | 'motor' | 'sme',
    name: string
  ) => {
    const newProduct = { id: `custom_${Date.now()}`, name, isCustom: true };
    switch (segment) {
      case 'health':
        setCustomHealthProducts((prev) => [...prev, newProduct]);
        break;
      case 'life':
        setCustomLifeProducts((prev) => [...prev, newProduct]);
        break;
      case 'motor':
        setCustomMotorProducts((prev) => [...prev, newProduct]);
        break;
      case 'sme':
        setCustomSmeProducts((prev) => [...prev, newProduct]);
        break;
    }
  };

  const removeCustomProduct = (
    segment: 'health' | 'life' | 'motor' | 'sme',
    productId: string
  ) => {
    switch (segment) {
      case 'health':
        setCustomHealthProducts((prev) => prev.filter((p) => p.id !== productId));
        setHealthExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
      case 'life':
        setCustomLifeProducts((prev) => prev.filter((p) => p.id !== productId));
        setLifeExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
      case 'motor':
        setCustomMotorProducts((prev) => prev.filter((p) => p.id !== productId));
        setMotorExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
      case 'sme':
        setCustomSmeProducts((prev) => prev.filter((p) => p.id !== productId));
        setSmeExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
    }
  };

  const [productPortfolio, setProductPortfolio] = useState<Record<string, SegmentPortfolio>>({});

  const [additionalDetails, setAdditionalDetails] = useState<AdditionalDetails>({
    website: '',
    googleBusiness: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    youtube: '',
    careerHighlights: '',
    careerTimeline: [],
    galleryImages: [],
  });

  const [wantsNewBusinessLeads, setWantsNewBusinessLeads] = useState(true);
  const [newBusinessLeadCharging, setNewBusinessLeadCharging] = useState('free');
  const [newBusinessLeadAmount, setNewBusinessLeadAmount] = useState(0);
  const [wantsPortfolioLeads, setWantsPortfolioLeads] = useState(false);
  const [portfolioLeadCharging, setPortfolioLeadCharging] = useState('free');
  const [portfolioLeadAmount, setPortfolioLeadAmount] = useState(0);
  const [wantsClaimsLeads, setWantsClaimsLeads] = useState(false);
  const [claimsLeadCharging, setClaimsLeadCharging] = useState('free');
  const [claimsLeadAmount, setClaimsLeadAmount] = useState(0);

  const [declarationsAccepted, setDeclarationsAccepted] = useState(false);

  // Selected segments for portfolio
  const selectedSegments = useMemo(() => {
    const segments: string[] = [];
    if (insuranceSegments.health) segments.push('health');
    if (insuranceSegments.life) segments.push('life');
    if (insuranceSegments.motor) segments.push('motor');
    if (insuranceSegments.sme) segments.push('sme');
    return segments;
  }, [insuranceSegments]);


  // Fetch existing profile data from database
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // Fetch agent profile data
        const { data: agentProfile } = await supabase
          .from('agent_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // Fetch isolated sensitive details (PAN)
        const { data: sensitiveDetails } = await supabase
          .from('agent_sensitive_details')
          .select('pan_number')
          .eq('agent_id', user.id)
          .maybeSingle();

        // Fetch gallery images
        const { data: galleryImages } = await supabase
          .from('agent_gallery_images')
          .select('image_url, display_order')
          .eq('agent_id', user.id)
          .order('display_order');

        if (profile) {
          setBasicDetails(prev => ({
            ...prev,
            fullName: profile.full_name || prev.fullName,
            displayName: profile.display_name || '',
            phone: profile.phone || prev.phone,
            whatsappNumber: profile.whatsapp_number || '',
            email: profile.email || prev.email,
            residenceAddress: profile.residence_address || '',
            residencePincode: (profile as any).residence_pincode || '',
            avatarUrl: profile.avatar_url || '',
          }));
        }

        if (agentProfile) {
          // Parse languages from database
          const dbLanguages = agentProfile.languages || ['English'];
          setBasicDetails(prev => ({
            ...prev,
            languages: dbLanguages,
          }));

          setProfessionalDetails(prev => ({
            ...prev,
            panNumber: sensitiveDetails?.pan_number || '',
            licenseNumber: agentProfile.license_number || '',
            officeAddress: agentProfile.office_address || '',
            officePincode: (agentProfile as any).office_pincode || '',
            serviceableCities: agentProfile.serviceable_cities || [],
            yearsExperience: agentProfile.years_experience?.toString() || '',
            clientBase: agentProfile.approx_client_base || '',
            companyName: agentProfile.company_name || '',
            hasPosLicense: agentProfile.has_pos_license || false,
            familyLicenses: (agentProfile.family_licenses as any[]) || [],
            claimsProcessed: agentProfile.claims_processed || '',
            claimsSettled: agentProfile.claims_settled?.toString() || '',
            claimsAmount: agentProfile.claims_amount || '',
            successRate: agentProfile.success_rate || '',
            responseTime: agentProfile.response_time || '',
          }));
          
          // Set insurance segments
          const segments = agentProfile.insurance_segments || [];
          setInsuranceSegments({
            health: segments.includes('health'),
            life: segments.includes('life'),
            motor: segments.includes('motor'),
            sme: segments.includes('sme'),
          });
          
          // Set expertise
          if (agentProfile.health_expertise) setHealthExpertise(agentProfile.health_expertise as Record<string, ExpertiseLevel>);
          if (agentProfile.life_expertise) setLifeExpertise(agentProfile.life_expertise as Record<string, ExpertiseLevel>);
          if (agentProfile.motor_expertise) setMotorExpertise(agentProfile.motor_expertise as Record<string, ExpertiseLevel>);
          if (agentProfile.sme_expertise) setSmeExpertise(agentProfile.sme_expertise as Record<string, ExpertiseLevel>);
          
          // Set product portfolio
          if (agentProfile.product_portfolio) setProductPortfolio(agentProfile.product_portfolio as unknown as Record<string, SegmentPortfolio>);
          
          // Set additional details including career timeline
          const careerTimeline = (agentProfile as any).career_timeline || [];
          setAdditionalDetails(prev => ({
            ...prev,
            website: agentProfile.website || '',
            googleBusiness: agentProfile.google_business_profile || '',
            linkedin: agentProfile.linkedin || '',
            instagram: agentProfile.instagram || '',
            facebook: agentProfile.facebook || '',
            youtube: agentProfile.youtube || '',
            careerHighlights: agentProfile.career_highlights || '',
            careerTimeline: Array.isArray(careerTimeline) ? careerTimeline : [],
            galleryImages: galleryImages?.map(g => ({ url: g.image_url, caption: '' })) || [],
          }));
          
          // Set lead preferences
          setWantsPortfolioLeads(agentProfile.wants_portfolio_leads || false);
          setPortfolioLeadCharging(agentProfile.portfolio_lead_charging || 'free');
          setPortfolioLeadAmount(agentProfile.portfolio_lead_amount || 0);
          setWantsClaimsLeads(agentProfile.wants_claims_leads || false);
          setClaimsLeadCharging(agentProfile.claims_lead_charging || 'free');
          setClaimsLeadAmount(agentProfile.claims_lead_amount || 0);
          
          // Set declarations
          if (agentProfile.declarations_accepted) setDeclarationsAccepted(true);
        }
      } catch (error) {
        console.error('Error fetching existing profile:', error);
      }
    };
    
    fetchExistingProfile();
  }, [user?.id]);

  // Auto-save form to database with debounce
  const autoSaveToDb = useCallback(async () => {
    if (!user?.id) return;
    const savePayload = JSON.stringify({
      basicDetails, professionalDetails, insuranceSegments, additionalDetails,
      productPortfolio, wantsPortfolioLeads, wantsClaimsLeads, declarationsAccepted,
    });
    if (savePayload === lastAutoSaveRef.current) return;
    lastAutoSaveRef.current = savePayload;

    try {
      await supabase.from('profiles').update({
        full_name: basicDetails.fullName,
        display_name: basicDetails.displayName || null,
        phone: basicDetails.phone,
        whatsapp_number: basicDetails.whatsappNumber || null,
        avatar_url: basicDetails.avatarUrl || null,
        residence_address: basicDetails.residenceAddress,
        residence_pincode: basicDetails.residencePincode || null,
      }).eq('id', user.id);

      await supabase.from('agent_profiles').update({
        office_address: professionalDetails.officeAddress || null,
        office_pincode: professionalDetails.officePincode || null,
        serviceable_cities: professionalDetails.serviceableCities,
        years_experience: parseInt(professionalDetails.yearsExperience) || 0,
        approx_client_base: professionalDetails.clientBase,
        company_name: professionalDetails.companyName || null,
        has_pos_license: professionalDetails.hasPosLicense,
        family_licenses: JSON.parse(JSON.stringify(professionalDetails.familyLicenses)),
        location: basicDetails.residenceAddress,
        languages: basicDetails.languages,
        insurance_segments: selectedSegments,
        health_expertise: JSON.parse(JSON.stringify(healthExpertise)),
        life_expertise: JSON.parse(JSON.stringify(lifeExpertise)),
        motor_expertise: JSON.parse(JSON.stringify(motorExpertise)),
        sme_expertise: JSON.parse(JSON.stringify(smeExpertise)),
        product_portfolio: JSON.parse(JSON.stringify(productPortfolio)),
        website: additionalDetails.website || null,
        google_business_profile: additionalDetails.googleBusiness || null,
        linkedin: additionalDetails.linkedin || null,
        instagram: additionalDetails.instagram || null,
        facebook: additionalDetails.facebook || null,
        youtube: additionalDetails.youtube || null,
        career_highlights: additionalDetails.careerHighlights || null,
        career_timeline: JSON.parse(JSON.stringify(additionalDetails.careerTimeline)),
        bio: additionalDetails.careerHighlights || null,
        claims_processed: professionalDetails.claimsProcessed || '0',
        claims_settled: parseInt(professionalDetails.claimsSettled) || 0,
        claims_amount: professionalDetails.claimsAmount || '₹0',
        success_rate: professionalDetails.claimsProcessed && professionalDetails.claimsSettled
          ? `${Math.round((parseInt(professionalDetails.claimsSettled) / parseInt(professionalDetails.claimsProcessed)) * 100) || 0}%`
          : '0%',
        wants_portfolio_leads: wantsPortfolioLeads,
        portfolio_lead_charging: portfolioLeadCharging,
        portfolio_lead_amount: portfolioLeadAmount,
        wants_claims_leads: wantsClaimsLeads,
        claims_lead_charging: claimsLeadCharging,
        claims_lead_amount: claimsLeadAmount,
      }).eq('id', user.id);

      await supabase
        .from('agent_sensitive_details')
        .upsert(
          {
            agent_id: user.id,
            pan_number: professionalDetails.panNumber || null,
          },
          { onConflict: 'agent_id' }
        );
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [user?.id, basicDetails, professionalDetails, insuranceSegments, additionalDetails,
      productPortfolio, selectedSegments, healthExpertise, lifeExpertise, motorExpertise,
      smeExpertise, wantsPortfolioLeads, portfolioLeadCharging, portfolioLeadAmount,
      wantsClaimsLeads, claimsLeadCharging, claimsLeadAmount, declarationsAccepted]);

  useEffect(() => {
    if (!user?.id) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveToDb();
    }, 5000);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [autoSaveToDb]);

  // Auto-generate AI bio when career timeline is filled and bio is empty
  const hasEnoughDataForBio = useMemo(() => {
    return (
      basicDetails.fullName.trim() !== '' &&
      professionalDetails.yearsExperience.trim() !== '' &&
      selectedSegments.length > 0 &&
      additionalDetails.careerTimeline.length > 0
    );
  }, [basicDetails.fullName, professionalDetails.yearsExperience, selectedSegments, additionalDetails.careerTimeline]);

  useEffect(() => {
    if (!hasEnoughDataForBio || bioAutoGenerated || isRewritingBio) return;
    if (additionalDetails.careerHighlights.trim().length > 20) return; // Don't overwrite existing bio

    const generateBio = async () => {
      setIsRewritingBio(true);
      try {
        const timelineText = additionalDetails.careerTimeline
          .map(t => `${t.year}${t.month ? '/' + t.month : ''}: ${t.event} (${t.type})`)
          .join(', ');

        const { data, error } = await supabase.functions.invoke('rewrite-bio', {
          body: {
            bio: `Name: ${basicDetails.fullName}. Career timeline: ${timelineText}. Client base: ${professionalDetails.clientBase}. Company: ${professionalDetails.companyName}.`,
            segments: selectedSegments,
            experience: professionalDetails.yearsExperience,
            clientBase: professionalDetails.clientBase,
          },
        });
        if (error) throw error;
        if (data?.bio) {
          setAdditionalDetails(prev => ({ ...prev, careerHighlights: data.bio }));
          setBioAutoGenerated(true);
          toast.success('Professional bio generated based on your profile!', { duration: 3000 });
        }
      } catch (error) {
        console.error('Auto bio generation error:', error);
      } finally {
        setIsRewritingBio(false);
      }
    };

    generateBio();
  }, [hasEnoughDataForBio, bioAutoGenerated, isRewritingBio, additionalDetails.careerTimeline, additionalDetails.careerHighlights]);

  // Experience as number
  const yearsExp = parseInt(professionalDetails.yearsExperience) || 0;

  // Experience-based lead eligibility popup state
  const [showEligibilityPopup, setShowEligibilityPopup] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [lastShownEligibility, setLastShownEligibility] = useState<number>(0);
  const [showDeclarationsPopup, setShowDeclarationsPopup] = useState(false);
  const [declarationsScrolledToEnd, setDeclarationsScrolledToEnd] = useState(false);
  const [showMotorExpertisePopup, setShowMotorExpertisePopup] = useState(false);
  const [showSmeExpertisePopup, setShowSmeExpertisePopup] = useState(false);

  // Trigger eligibility popup when experience changes
  useEffect(() => {
    if (yearsExp >= 10 && lastShownEligibility < 10) {
      setEligibilityMessage('🎉 Congratulations! With 10+ years of experience, you are eligible for Policy Audit Leads AND Claims Leads!');
      setShowEligibilityPopup(true);
      setLastShownEligibility(10);
    } else if (yearsExp >= 5 && yearsExp < 10 && lastShownEligibility < 5) {
      setEligibilityMessage('🎉 Congratulations! With 5+ years of experience, you are eligible for Policy Audit Leads!');
      setShowEligibilityPopup(true);
      setLastShownEligibility(5);
    }
  }, [yearsExp]);

  // Validation
  const isBasicComplete = 
    basicDetails.fullName.trim() !== '' && 
    basicDetails.phone.trim() !== '' && 
    basicDetails.email.trim() !== '' &&
    basicDetails.languages.length > 0 &&
    basicDetails.residenceAddress.trim() !== '';

  const isProfessionalComplete = 
    (professionalDetails.panNumber.trim() !== '' || professionalDetails.licenseNumber.trim() !== '') && 
    professionalDetails.serviceableCities.length > 0 &&
    professionalDetails.yearsExperience.trim() !== '' && 
    professionalDetails.clientBase.trim() !== '';

  const isSegmentsComplete = selectedSegments.length > 0;

  const getSegmentPortfolioTotal = (seg: string): number => {
    const p = productPortfolio[seg];
    if (!p) return 0;
    let total = parseInt(p.primaryPercentage) || 0;
    total += parseInt(p.secondaryPercentage) || 0;
    if (p.additionalCompanies) {
      p.additionalCompanies.forEach((c: { name: string; percentage: string }) => {
        total += parseInt(c.percentage) || 0;
      });
    }
    return total;
  };

  const isPortfolioComplete = selectedSegments.length === 0 || 
    (wantsPortfolioLeads || wantsClaimsLeads 
      ? selectedSegments.every(seg => {
          const hasCompany = productPortfolio[seg]?.primaryCompany?.trim();
          if (!hasCompany) return false;
          // If Claims Leads opted, total % must be 100
          if (wantsClaimsLeads) {
            return getSegmentPortfolioTotal(seg) === 100;
          }
          return true;
        })
      : true);

  const isAdditionalComplete = true; // Optional section

  // Claims leads require 10+ years experience (company name is optional)
  const claimsLeadsEligible = yearsExp >= 10;

  // Calculate progress
  const getProgress = () => {
    let total = 0;
    let completed = 0;
    
    // Basic (required)
    total += 25;
    if (isBasicComplete) completed += 25;
    
    // Professional (required)
    total += 25;
    if (isProfessionalComplete) completed += 25;
    
    // Segments (required)
    total += 20;
    if (isSegmentsComplete) completed += 20;
    
    // Portfolio (required if opted for audit/claims leads)
    if (wantsPortfolioLeads || wantsClaimsLeads) {
      total += 15;
      if (isPortfolioComplete) completed += 15;
    }
    
    // Additional (optional - give points for any content)
    total += 10;
    if (additionalDetails.careerHighlights.trim() || additionalDetails.galleryImages.length > 0) {
      completed += 10;
    }
    
    // Declarations (required)
    total += 5;
    if (declarationsAccepted) completed += 5;
    
    return Math.round((completed / total) * 100);
  };

  // Avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setBasicDetails(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast.success('Profile photo uploaded!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!basicDetails.avatarUrl || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const urlParts = basicDetails.avatarUrl.split('/avatars/');
      if (urlParts.length > 1) {
        await supabase.storage.from('avatars').remove([urlParts[1]]);
      }
      setBasicDetails(prev => ({ ...prev, avatarUrl: '' }));
      toast.success('Photo removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Gallery upload
  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 10;
    const currentCount = additionalDetails.galleryImages.length;
    const remainingSlots = maxImages - currentCount;

    if (remainingSlots <= 0) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    setIsUploadingGallery(true);
    try {
      const uploadedImages: GalleryImage[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('agent-gallery')
          .upload(fileName, file, { cacheControl: '3600' });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('agent-gallery')
            .getPublicUrl(fileName);
          uploadedImages.push({ url: publicUrl, caption: '' });
        }
      }

      if (uploadedImages.length > 0) {
        setAdditionalDetails(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...uploadedImages],
        }));
        toast.success(`${uploadedImages.length} image(s) uploaded! Click to add captions.`);
      }
    } catch (error) {
      console.error('Error uploading gallery:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/agent-gallery/');
      if (urlParts.length > 1) {
        await supabase.storage.from('agent-gallery').remove([urlParts[1]]);
      }
      setAdditionalDetails(prev => ({
        ...prev,
        galleryImages: prev.galleryImages.filter(img => img.url !== imageUrl),
      }));
      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const updateGalleryCaption = (imageUrl: string, caption: string) => {
    setAdditionalDetails(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.map(img => 
        img.url === imageUrl ? { ...img, caption } : img
      ),
    }));
  };

  // Handle portfolio change
  const handlePortfolioChange = (segment: string, field: keyof SegmentPortfolio, value: string) => {
    setProductPortfolio(prev => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        [field]: value,
      },
    }));
  };

  // Additional companies management for portfolio
  const handleAddCompany = (segment: string) => {
    setProductPortfolio(prev => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        additionalCompanies: [...(prev[segment]?.additionalCompanies || []), { name: '', percentage: '' }],
      },
    }));
  };

  const handleRemoveCompany = (segment: string, index: number) => {
    setProductPortfolio(prev => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        additionalCompanies: (prev[segment]?.additionalCompanies || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const handleAdditionalCompanyChange = (segment: string, index: number, field: 'name' | 'percentage', value: string) => {
    setProductPortfolio(prev => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        additionalCompanies: (prev[segment]?.additionalCompanies || []).map((c: any, i: number) =>
          i === index ? { ...c, [field]: value } : c
        ),
      },
    }));
  };

  // AI Bio Rewrite
  const handleRewriteBio = async () => {
    if (!additionalDetails.careerHighlights.trim()) return;
    setIsRewritingBio(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-bio', {
        body: {
          bio: additionalDetails.careerHighlights,
          segments: selectedSegments,
          experience: professionalDetails.yearsExperience,
          clientBase: professionalDetails.clientBase,
        },
      });
      if (error) throw error;
      if (data?.bio) {
        setAdditionalDetails(prev => ({ ...prev, careerHighlights: data.bio }));
        toast.success('Bio rewritten professionally!');
      }
    } catch (error) {
      console.error('Bio rewrite error:', error);
      toast.error('Failed to rewrite bio. Please try again.');
    } finally {
      setIsRewritingBio(false);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!isBasicComplete || !isProfessionalComplete || !isSegmentsComplete) {
      toast.error('Please complete all mandatory sections');
      return;
    }

    // Declarations check is handled by the popup flow — if called directly, proceed

    if (wantsClaimsLeads && !claimsLeadsEligible) {
      toast.error('Minimum 10 years experience required for Claims Support leads');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: basicDetails.fullName,
          display_name: basicDetails.displayName || null,
          phone: basicDetails.phone,
          whatsapp_number: basicDetails.whatsappNumber || null,
          avatar_url: basicDetails.avatarUrl || null,
          residence_address: basicDetails.residenceAddress,
          residence_pincode: basicDetails.residencePincode || null,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update agent_profiles table
      const { error: agentError } = await supabase
        .from('agent_profiles')
        .update({
          license_number: professionalDetails.licenseNumber || null,
          office_address: professionalDetails.officeAddress || null,
          office_pincode: professionalDetails.officePincode || null,
          serviceable_cities: professionalDetails.serviceableCities,
          years_experience: parseInt(professionalDetails.yearsExperience) || 0,
          approx_client_base: professionalDetails.clientBase,
          company_name: professionalDetails.companyName || null,
          has_pos_license: professionalDetails.hasPosLicense,
          family_licenses: JSON.parse(JSON.stringify(professionalDetails.familyLicenses)),
          location: basicDetails.residenceAddress,
          languages: basicDetails.languages,
          insurance_segments: selectedSegments,
          health_expertise: JSON.parse(JSON.stringify(healthExpertise)),
          life_expertise: JSON.parse(JSON.stringify(lifeExpertise)),
          motor_expertise: JSON.parse(JSON.stringify(motorExpertise)),
          sme_expertise: JSON.parse(JSON.stringify(smeExpertise)),
          product_portfolio: JSON.parse(JSON.stringify(productPortfolio)),
          website: additionalDetails.website || null,
          google_business_profile: additionalDetails.googleBusiness || null,
          linkedin: additionalDetails.linkedin || null,
          instagram: additionalDetails.instagram || null,
          facebook: additionalDetails.facebook || null,
          youtube: additionalDetails.youtube || null,
          career_highlights: additionalDetails.careerHighlights || null,
          career_timeline: JSON.parse(JSON.stringify(additionalDetails.careerTimeline)),
          wants_portfolio_leads: wantsPortfolioLeads,
          portfolio_lead_charging: portfolioLeadCharging,
          portfolio_lead_amount: portfolioLeadAmount,
          wants_claims_leads: wantsClaimsLeads,
          claims_lead_charging: claimsLeadCharging,
          claims_lead_amount: claimsLeadAmount,
          // declarations_accepted fields are admin-restricted, saved via edge function
          bio: additionalDetails.careerHighlights || null,
          specializations: selectedSegments,
          // Performance stats
          claims_processed: professionalDetails.claimsProcessed || '0',
          claims_settled: parseInt(professionalDetails.claimsSettled) || 0,
          claims_amount: professionalDetails.claimsAmount || '₹0',
          success_rate: professionalDetails.claimsProcessed && professionalDetails.claimsSettled
            ? `${Math.round((parseInt(professionalDetails.claimsSettled) / parseInt(professionalDetails.claimsProcessed)) * 100) || 0}%`
            : '0%',
          response_time: null,
        })
        .eq('id', user?.id);

      if (agentError) throw agentError;

      const { error: sensitiveError } = await supabase
        .from('agent_sensitive_details')
        .upsert(
          {
            agent_id: user?.id,
            pan_number: professionalDetails.panNumber || null,
          },
          { onConflict: 'agent_id' }
        );

      if (sensitiveError) throw sensitiveError;

      // Save gallery images
      if (additionalDetails.galleryImages.length > 0) {
        // First delete existing
        await supabase
          .from('agent_gallery_images')
          .delete()
          .eq('agent_id', user?.id);

        // Insert new
        const galleryInserts = additionalDetails.galleryImages.map((img, index) => ({
          agent_id: user?.id,
          image_url: img.url,
          display_order: index,
        }));

        await supabase.from('agent_gallery_images').insert(galleryInserts);
      }

      toast.success('Profile saved successfully!');
      navigate('/agent-dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections: { id: Section; title: string; icon: React.ElementType; required: boolean; complete: boolean }[] = [
    { id: 'basic', title: '👤 Basic Details', icon: User, required: true, complete: isBasicComplete },
    { id: 'professional', title: '💼 Professional', icon: Briefcase, required: true, complete: isProfessionalComplete && isSegmentsComplete },
    { id: 'portfolio', title: '🏢 Portfolio', icon: Building2, required: (wantsPortfolioLeads || wantsClaimsLeads), complete: isPortfolioComplete },
    { id: 'additional', title: '📸 Profile & Photos', icon: Plus, required: false, complete: isAdditionalComplete },
  ];

  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const canGoNext = currentIndex < sections.length - 1;
  const canGoPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      setActiveSection(sections[currentIndex + 1].id);
      // Scroll to top of form on mobile
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [canGoNext, currentIndex, sections]);

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      setActiveSection(sections[currentIndex - 1].id);
      // Scroll to top of form on mobile
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [canGoPrev, currentIndex, sections]);

  // Swipe gesture for mobile navigation
  const swipeRef = useSwipeGesture<HTMLDivElement>({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    threshold: 75,
    disabled: false,
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      
      
      <div className="flex-grow container mx-auto px-4 pt-6 sm:pt-8 pb-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge className="bg-primary text-primary-foreground mb-2 text-sm px-4 py-1">Profile Setup</Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            Build Your PadosiAgent Profile
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Fill all steps below to activate your profile and start getting leads
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <ProfileSetupGuide />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-background rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-bold text-primary">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-4" />
          <p className="text-xs text-muted-foreground mt-2">
            Complete all mandatory (*) sections to activate
          </p>
        </div>

        {/* Mobile Step Progress - New visual indicator */}
        <div className="mb-6 bg-background rounded-lg p-4 border" ref={formContainerRef}>
          <MobileStepProgress
            sections={sections}
            activeSection={activeSection}
            onSectionClick={(sectionId) => setActiveSection(sectionId as Section)}
          />
        </div>

        {/* Desktop Section Navigation - Hidden on mobile, replaced by MobileStepProgress */}
        <div className="hidden sm:block relative mb-6">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((section, idx) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0 transition-all",
                  activeSection === section.id ? "ring-2 ring-primary/20" : ""
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                  activeSection === section.id ? "bg-primary-foreground/20" : "bg-muted"
                )}>
                  {idx + 1}
                </span>
                <section.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{section.title}</span>
                {section.required && <span className="text-destructive text-xs">*</span>}
                {section.complete && <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Section Content with Swipe Gesture */}
        <Card ref={swipeRef} className="mb-6 overflow-hidden touch-pan-y">
          <CardHeader className="space-y-1 pb-3 sm:pb-4">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
              {React.createElement(sections.find(s => s.id === activeSection)!.icon, { className: "h-4 w-4 sm:h-5 sm:w-5" })}
              <span className="flex-1 min-w-0">{sections.find(s => s.id === activeSection)?.title}</span>
              {sections.find(s => s.id === activeSection)?.required && (
                <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">Mandatory</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {activeSection === 'basic' && 'Your basic contact & identity info'}
              {activeSection === 'professional' && 'Your credentials, experience & insurance types'}
              {activeSection === 'portfolio' && 'Your company partnerships'}
              {activeSection === 'additional' && 'Photos, links & career story'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 sm:space-y-6 px-3 sm:px-6 pb-4 sm:pb-6">
            {/* BASIC DETAILS */}
            {activeSection === 'basic' && (
              <>
                {/* Avatar Upload with Position Adjustment */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      ) : basicDetails.avatarUrl ? (
                        <img
                          src={basicDetails.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover cursor-move"
                          style={{
                            objectPosition: `${avatarPosition.x}% ${avatarPosition.y}%`,
                            transform: `scale(${avatarZoom})`,
                          }}
                          draggable={false}
                        />
                      ) : (
                        <Camera className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    {basicDetails.avatarUrl ? (
                      <Button size="sm" variant="destructive" className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0" onClick={handleRemoveAvatar} disabled={isUploadingAvatar}>
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {basicDetails.avatarUrl && (
                    <div className="w-full max-w-xs space-y-2 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Zoom</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(avatarZoom * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.05"
                        value={avatarZoom}
                        onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs font-medium">Horizontal</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={avatarPosition.x}
                            onChange={(e) => setAvatarPosition(p => ({ ...p, x: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Vertical</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={avatarPosition.y}
                            onChange={(e) => setAvatarPosition(p => ({ ...p, y: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => { setAvatarZoom(1); setAvatarPosition({ x: 50, y: 50 }); }}>
                        Reset Position
                      </Button>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium">{basicDetails.avatarUrl ? 'Adjust your photo using the sliders' : 'Upload your professional photo'}</p>
                    <p className="text-xs text-muted-foreground">Upload your photo (Max 5MB, JPG/PNG)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-semibold">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="fullName" placeholder="e.g., Rajesh Kumar Sharma" value={basicDetails.fullName} onChange={(e) => setBasicDetails(prev => ({ ...prev, fullName: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">As per PAN / Insurance License</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-base font-semibold">
                      Display Name
                    </Label>
                    <Input id="displayName" placeholder="e.g., Rajesh Sharma" value={basicDetails.displayName} onChange={(e) => setBasicDetails(prev => ({ ...prev, displayName: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">This name shown to customers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      Mobile Number (Call) <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phone" type="tel" placeholder="e.g., 9876543210" value={basicDetails.phone} onChange={(e) => setBasicDetails(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9+\s-]/g, '') }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">Customers will call on this number</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-base font-semibold">
                      WhatsApp Number
                    </Label>
                    <Input id="whatsapp" type="tel" placeholder="Leave empty if same as call number" value={basicDetails.whatsappNumber} onChange={(e) => setBasicDetails(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/[^0-9+\s-]/g, '') }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">Leave empty if same as calling number</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email ID <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" type="email" placeholder="e.g., rajesh@gmail.com" value={basicDetails.email} onChange={(e) => setBasicDetails(prev => ({ ...prev, email: e.target.value }))} className="h-12 text-base" />
                  <p className="text-xs text-muted-foreground">Lead notifications will be sent to this email</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Languages You Speak <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelectDropdown
                    label=""
                    options={LANGUAGE_OPTIONS}
                    selected={basicDetails.languages}
                    onChange={(langs) => setBasicDetails(prev => ({ ...prev, languages: langs }))}
                    placeholder="Select languages..."
                    allowOther={true}
                  />
                  <p className="text-xs text-muted-foreground">Select all languages you speak fluently</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Residence Address <span className="text-destructive">*</span>
                  </Label>
                  <AddressAutocomplete id="residence" value={basicDetails.residenceAddress} onChange={(val) => setBasicDetails(prev => ({ ...prev, residenceAddress: val }))} onPincodeDetected={(pin) => setBasicDetails(prev => ({ ...prev, residencePincode: pin }))} />
                </div>
              </>
            )}

            {/* PROFESSIONAL DETAILS */}
            {activeSection === 'professional' && (
              <>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                      Provide either PAN Number or Insurance License Number (at least one required)
                    </p>

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pan" className="text-base font-semibold">
                      PAN Number
                    </Label>
                    <Input id="pan" placeholder="e.g., ABCDE1234F" value={professionalDetails.panNumber} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))} maxLength={10} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">10-character PAN number</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license" className="text-base font-semibold">
                      Insurance License Number
                    </Label>
                    <Input id="license" placeholder="Will be updated by admin" value={professionalDetails.licenseNumber} disabled className="h-12 text-base bg-muted/50 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Verified by admin after PAN verification</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency" className="text-base font-semibold">
                    Agency / Company Name (if any)
                  </Label>
                  <Input id="agency" placeholder="e.g., KS Agency, KS Financial, KS Insurance..." value={professionalDetails.companyName} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, companyName: e.target.value }))} className="h-12 text-base" />
                  <p className="text-xs text-muted-foreground">Use your name/surname initials — e.g., KS Agency, KS Financial, KS Insurance</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="sameAsResidence"
                    checked={professionalDetails.officeAddress === basicDetails.residenceAddress && professionalDetails.officePincode === basicDetails.residencePincode && basicDetails.residenceAddress.trim() !== ''}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProfessionalDetails(prev => ({
                          ...prev,
                          officeAddress: basicDetails.residenceAddress,
                          officePincode: basicDetails.residencePincode,
                        }));
                      } else {
                        setProfessionalDetails(prev => ({
                          ...prev,
                          officeAddress: '',
                          officePincode: '',
                        }));
                      }
                    }}
                  />
                  <Label htmlFor="sameAsResidence" className="text-sm font-medium cursor-pointer">Same as residence address</Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Office Address (optional)
                  </Label>
                  <AddressAutocomplete id="office" value={professionalDetails.officeAddress} onChange={(val) => setProfessionalDetails(prev => ({ ...prev, officeAddress: val }))} onPincodeDetected={(pin) => setProfessionalDetails(prev => ({ ...prev, officePincode: pin }))} />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Serviceable Cities <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelectDropdown
                    label=""
                    options={CITY_OPTIONS}
                    selected={professionalDetails.serviceableCities}
                    onChange={(cities) => setProfessionalDetails(prev => ({ ...prev, serviceableCities: cities }))}
                    placeholder="Select cities..."
                    allowOther={true}
                  />
                  <p className="text-xs text-muted-foreground">Select all cities where you provide insurance service</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-base font-semibold">
                      Years of Experience <span className="text-destructive">*</span>
                    </Label>
                    <Input id="experience" type="number" min="0" placeholder="e.g., 5" value={professionalDetails.yearsExperience} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, yearsExperience: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">Total years in insurance industry</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientBase" className="text-base font-semibold">
                      Active Clients <span className="text-destructive">*</span>
                    </Label>
                    <Input id="clientBase" placeholder="e.g., 500+" value={professionalDetails.clientBase} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, clientBase: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">Current active policyholders count</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-3 p-4 bg-muted/30 rounded-lg">
                  <Switch id="pos" checked={professionalDetails.hasPosLicense} onCheckedChange={(checked) => setProfessionalDetails(prev => ({ ...prev, hasPosLicense: checked }))} />
                  <div>
                    <Label htmlFor="pos" className="cursor-pointer text-base font-semibold">
                      Do you have a POS License?
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Do you have POS (Point of Sale) License with any Broker?</p>
                  </div>
                </div>

                <FamilyLicenseManager
                  licenses={professionalDetails.familyLicenses}
                  onChange={(licenses) => setProfessionalDetails(prev => ({ ...prev, familyLicenses: licenses }))}
                />

                {/* Performance Stats Section */}
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base">Performance Statistics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your track record — it builds customer trust
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="claimsProcessed" className="text-sm font-semibold">Claims Processed</Label>
                      <Input id="claimsProcessed" placeholder="e.g., 150+" value={professionalDetails.claimsProcessed} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, claimsProcessed: e.target.value }))} className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimsSettled" className="text-sm font-semibold">Claims Settled</Label>
                      <Input id="claimsSettled" type="number" min="0" placeholder="e.g., 145" value={professionalDetails.claimsSettled} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, claimsSettled: e.target.value }))} className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimsAmount" className="text-sm font-semibold">Total Claims Amount</Label>
                      <Input id="claimsAmount" type="number" placeholder="e.g., 25000000" value={professionalDetails.claimsAmount} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, claimsAmount: e.target.value }))} className="h-11 text-base" />
                      {professionalDetails.claimsAmount && !isNaN(Number(professionalDetails.claimsAmount)) && Number(professionalDetails.claimsAmount) > 0 && (
                        <p className="text-sm font-bold text-primary">
                          ₹{(() => {
                            const num = Number(professionalDetails.claimsAmount);
                            if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
                            if (num >= 100000) return `${(num / 100000).toFixed(2)} Lakh`;
                            if (num >= 1000) return `${(num / 1000).toFixed(2)} Thousand`;
                            return num.toLocaleString('en-IN');
                          })()}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="successRate" className="text-sm font-semibold">Success Rate (Auto-calculated)</Label>
                      <Input id="successRate" value={
                        professionalDetails.claimsProcessed && professionalDetails.claimsSettled
                          ? `${Math.round((parseInt(professionalDetails.claimsSettled) / parseInt(professionalDetails.claimsProcessed)) * 100) || 0}%`
                          : '0%'
                      } disabled className="h-11 text-base bg-muted/50" />
                      <p className="text-xs text-muted-foreground">Claims Settled ÷ Claims Processed × 100 = Auto calculated</p>
                    </div>
                  </div>
                </div>

                {/* Lead status indicator */}
                {yearsExp >= 5 && (
                  <div className="pt-6 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-base">Lead Preferences</h4>
                      <Badge variant="outline" className="text-xs">Unlocked</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{wantsNewBusinessLeads ? '✓' : '✗'} New Business Leads — <span className={wantsNewBusinessLeads ? "text-green-600 font-medium" : "text-muted-foreground font-medium"}>{wantsNewBusinessLeads ? 'Active' : 'Disabled'}</span></p>
                      {wantsPortfolioLeads && <p>✓ Policy Audit Leads — <span className="text-green-600 font-medium">Active</span></p>}
                      {wantsClaimsLeads && <p>✓ Claims Leads — <span className="text-green-600 font-medium">Active</span></p>}
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowEligibilityPopup(true)}>
                        Manage Lead Preferences
                      </Button>
                    </div>
                  </div>
                )}

                {/* Insurance Segments - merged into Professional */}
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base">Insurance Segments <span className="text-destructive">*</span></h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the insurance types you sell
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'health', label: '🏥 Health', icon: HeartPulse, color: 'text-emerald-500' },
                      { key: 'life', label: '❤️ Life', icon: Heart, color: 'text-pink-500' },
                      { key: 'motor', label: '🚗 Motor', icon: Car, color: 'text-blue-500' },
                      { key: 'sme', label: '🏢 SME', icon: Building2, color: 'text-orange-500' },
                    ].map((seg) => (
                      <label key={seg.key} className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${insuranceSegments[seg.key as keyof InsuranceSegments] ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted hover:border-primary/50'}`}>
                        <Checkbox
                          checked={insuranceSegments[seg.key as keyof InsuranceSegments]}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            setInsuranceSegments(prev => ({ ...prev, [seg.key]: isChecked }));
                            // Show expertise popup for Motor/SME when selected
                            if (isChecked && seg.key === 'motor') setShowMotorExpertisePopup(true);
                            if (isChecked && seg.key === 'sme') setShowSmeExpertisePopup(true);
                          }}
                        />
                        <seg.icon className={`h-7 w-7 ${seg.color}`} />
                        <span className="text-xs font-medium text-center">{seg.label}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSegments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {insuranceSegments.motor && (
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowMotorExpertisePopup(true)} className="text-xs gap-1">
                          <Car className="h-3.5 w-3.5" /> Motor Expertise
                        </Button>
                      )}
                      {insuranceSegments.sme && (
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowSmeExpertisePopup(true)} className="text-xs gap-1">
                          <Building2 className="h-3.5 w-3.5" /> SME Expertise
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* PRODUCT PORTFOLIO */}
            {activeSection === 'portfolio' && (
              <>
                <div className="mb-4">
                  <p className="text-base font-medium mb-1">
                    Which companies do you work with?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Define your company partnerships
                  </p>
                </div>
                {selectedSegments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Please select at least one insurance segment in the Professional section first</p>
                    <Button variant="outline" className="mt-3" onClick={() => setActiveSection('professional')}>
                      Go to Professional
                    </Button>
                  </div>
                ) : (
                  <>
                    <ProductPortfolioManager
                      segments={selectedSegments}
                      values={productPortfolio}
                      onChange={handlePortfolioChange}
                      onAddCompany={handleAddCompany}
                      onRemoveCompany={handleRemoveCompany}
                      onAdditionalCompanyChange={handleAdditionalCompanyChange}
                    />
                    {/* Portfolio % validation for Claims Leads */}
                    {wantsClaimsLeads && selectedSegments.map(seg => {
                      const total = getSegmentPortfolioTotal(seg);
                      const segLabel = seg === 'health' ? 'Health' : seg === 'life' ? 'Life' : seg === 'motor' ? 'Motor' : 'SME';
                      return total !== 100 ? (
                        <div key={seg} className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm mt-3">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="text-amber-700 dark:text-amber-400">
                            {segLabel}: Total portfolio is {total}% — must equal 100%
                          </span>
                        </div>
                      ) : (
                        <div key={seg} className="flex items-center gap-2 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm mt-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <span className="text-green-700 dark:text-green-400">
                            {segLabel}: Portfolio total is 100% ✓
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}

              </>
            )}

            {/* ADDITIONAL DETAILS */}
            {activeSection === 'additional' && (
              <>
                {/* Gallery Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      Achievement Photos
                      <Badge variant="secondary" className="text-xs">{additionalDetails.galleryImages.length}/10</Badge>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isUploadingGallery || additionalDetails.galleryImages.length >= 10}
                      className="h-10"
                    >
                      {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span className="ml-1">Upload</span>
                    </Button>
                    <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload awards, certificates, office photos
                  </p>

                  {additionalDetails.galleryImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {additionalDetails.galleryImages.map((img, idx) => (
                        <GalleryImageCard
                          key={idx}
                          image={img}
                          onRemove={() => removeGalleryImage(img.url)}
                          onCaptionChange={(caption) => updateGalleryCaption(img.url, caption)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    Online Profiles (Optional)
                  </h4>
                  <p className="text-sm text-muted-foreground">Add your website and social media links</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">🌍 Website</Label>
                      <Input placeholder="https://yourwebsite.com" value={additionalDetails.website} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, website: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">📍 Google Business Profile</Label>
                      <Input placeholder="Google Maps URL" value={additionalDetails.googleBusiness} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, googleBusiness: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">💼 LinkedIn</Label>
                      <Input placeholder="LinkedIn profile URL" value={additionalDetails.linkedin} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, linkedin: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">📷 Instagram</Label>
                      <Input placeholder="Instagram profile URL" value={additionalDetails.instagram} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, instagram: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">📘 Facebook</Label>
                      <Input placeholder="Facebook page URL" value={additionalDetails.facebook} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, facebook: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">🎬 YouTube</Label>
                      <Input placeholder="YouTube channel URL" value={additionalDetails.youtube} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, youtube: e.target.value }))} className="h-11" />
                    </div>
                  </div>
                </div>

                {/* Career Timeline Section */}
                <div className="space-y-4 pt-4">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    Career Timeline
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add your achievements — MDRT, awards, certifications, milestones
                  </p>
                  <CareerTimelineManager
                    entries={additionalDetails.careerTimeline}
                    onChange={(entries) => setAdditionalDetails(prev => ({ ...prev, careerTimeline: entries }))}
                    maxEntries={10}
                  />
                </div>

                {/* Bio / Summary with AI Rewrite */}
                <div className="space-y-2 pt-4">
                  <Label htmlFor="highlights" className="flex items-center gap-2 text-base font-semibold">
                    Professional Bio
                  </Label>
                  <p className="text-xs text-muted-foreground">Brief summary about your expertise for customers</p>
                  <Textarea id="highlights" placeholder="e.g., I have been an insurance agent for 10 years, specializing in health and life insurance..." value={additionalDetails.careerHighlights} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, careerHighlights: e.target.value }))} rows={4} className="text-base" />
                  {additionalDetails.careerHighlights.trim().length > 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 mt-1"
                      disabled={isRewritingBio}
                      onClick={handleRewriteBio}
                    >
                      {isRewritingBio ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {isRewritingBio ? 'Rewriting...' : 'Rewrite with AI'}
                    </Button>
                  )}
                </div>
              </>
            )}

          </CardContent>
        </Card>

        {/* Navigation Buttons - Mobile optimized sticky footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t sm:relative sm:border-t-0 sm:bg-transparent sm:backdrop-blur-none -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:py-0 z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              size="default"
              onClick={goPrev} 
              disabled={!canGoPrev}
              className="h-11 sm:h-12 text-sm sm:text-base px-4"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span>Back</span>
            </Button>

            <div className="flex gap-2">
              {/* Preview Button */}
              <AgentProfilePreview
                data={{
                  basicDetails,
                  professionalDetails,
                  insuranceSegments,
                  additionalDetails,
                }}
                trigger={
                  <Button variant="outline" size="default" className="gap-1.5 h-11 sm:h-12 text-sm sm:text-base px-4">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                }
              />

              {activeSection === 'additional' && (
                <Button 
                  size="default"
                  onClick={() => {
                    if (!isBasicComplete || !isProfessionalComplete || !isSegmentsComplete) {
                      toast.error('Please complete all mandatory sections first');
                      return;
                    }
                    setDeclarationsAccepted(false);
                    setDeclarationsScrolledToEnd(false);
                    setShowDeclarationsPopup(true);
                  }} 
                  disabled={isSubmitting || !isBasicComplete || !isProfessionalComplete || !isSegmentsComplete}
                  className="h-11 sm:h-12 text-sm sm:text-base px-5"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />}
                  <span>Save Profile</span>
                </Button>
              )}
              {canGoNext && (
                <Button 
                  size="default"
                  onClick={goNext}
                  className="h-11 sm:h-12 text-sm sm:text-base px-5"
                >
                  Next
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Spacer for mobile sticky footer */}
        <div className="h-4 sm:hidden" />
      </div>

      {/* Lead Preferences Popup */}
      <Dialog open={showEligibilityPopup} onOpenChange={setShowEligibilityPopup}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto max-h-[85vh] overflow-hidden flex flex-col rounded-lg p-4 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              {eligibilityMessage ? 'Congratulations!' : 'Lead Preferences'}
            </DialogTitle>
            {eligibilityMessage && (
              <DialogDescription className="text-sm pt-1">
                {eligibilityMessage}
              </DialogDescription>
            )}
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            <div className="space-y-3 py-2">
              {/* New Business Leads - Default on, user can disable */}
              <div className="rounded-lg border bg-muted/30 overflow-hidden">
                <div className="flex items-center justify-between p-3 sm:p-4 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-5 w-5 text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">New Business Leads</p>
                      <p className="text-xs text-muted-foreground">Available to all agents — no charge</p>
                    </div>
                  </div>
                  <Switch
                    checked={wantsNewBusinessLeads}
                    onCheckedChange={setWantsNewBusinessLeads}
                    className="shrink-0"
                  />
                </div>
              </div>

              {/* Policy Audit Leads - 5+ years */}
              {yearsExp >= 5 && (
                <div className="rounded-lg border bg-muted/30 overflow-hidden">
                  <div className="flex items-center justify-between p-3 sm:p-4 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">Policy Audit Leads</p>
                        <p className="text-xs text-muted-foreground">Portfolio review requests</p>
                      </div>
                    </div>
                    <Switch
                      checked={wantsPortfolioLeads}
                      onCheckedChange={setWantsPortfolioLeads}
                      className="shrink-0"
                    />
                  </div>
                  {wantsPortfolioLeads && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t space-y-2">
                      <Label className="text-sm font-medium">Charging Preference</Label>
                      <RadioGroup value={portfolioLeadCharging} onValueChange={setPortfolioLeadCharging} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="free" id="popup-portfolio-free" />
                          <Label htmlFor="popup-portfolio-free" className="text-sm font-normal cursor-pointer">Free consultation</Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="free_if_policy" id="popup-portfolio-conditional" className="mt-1" />
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="popup-portfolio-conditional" className="text-sm font-normal cursor-pointer leading-tight">Free if policy purchased (Otherwise Fee)</Label>
                            {portfolioLeadCharging === 'free_if_policy' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">₹</span>
                                <Input type="number" min="0" max="5000" placeholder="Amount" value={portfolioLeadAmount || ''} onChange={(e) => setPortfolioLeadAmount(parseInt(e.target.value) || 0)} className="w-24 h-9" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="paid" id="popup-portfolio-paid" className="mt-1" />
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="popup-portfolio-paid" className="text-sm font-normal cursor-pointer">Paid consultation</Label>
                            {portfolioLeadCharging === 'paid' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">₹</span>
                                <Input type="number" min="0" max="5000" placeholder="Amount" value={portfolioLeadAmount || ''} onChange={(e) => setPortfolioLeadAmount(parseInt(e.target.value) || 0)} className="w-24 h-9" />
                              </div>
                            )}
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              )}

              {/* Claims Leads - 10+ years */}
              {yearsExp >= 10 && (
                <div className="rounded-lg border bg-muted/30 overflow-hidden">
                  <div className="flex items-center justify-between p-3 sm:p-4 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">Claims Leads</p>
                        <p className="text-xs text-muted-foreground">Claims assistance requests</p>
                      </div>
                    </div>
                    <Switch
                      checked={wantsClaimsLeads}
                      onCheckedChange={setWantsClaimsLeads}
                      className="shrink-0"
                    />
                  </div>
                  {wantsClaimsLeads && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t space-y-2">
                      <Label className="text-sm font-medium">Charging Preference</Label>
                      <RadioGroup value={claimsLeadCharging} onValueChange={setClaimsLeadCharging} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="free" id="popup-claims-free" />
                          <Label htmlFor="popup-claims-free" className="text-sm font-normal cursor-pointer">Free consultation</Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="consultation_fee" id="popup-claims-fee" className="mt-1" />
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="popup-claims-fee" className="text-sm font-normal cursor-pointer">Consultation Fee</Label>
                            {claimsLeadCharging === 'consultation_fee' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">₹</span>
                                <Input type="number" min="0" max="5000" placeholder="Amount" value={claimsLeadAmount || ''} onChange={(e) => setClaimsLeadAmount(parseInt(e.target.value) || 0)} className="w-24 h-9" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="percent_of_claim" id="popup-claims-percent" className="mt-1" />
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="popup-claims-percent" className="text-sm font-normal cursor-pointer">% of Claim Amount</Label>
                            {claimsLeadCharging === 'percent_of_claim' && (
                              <div className="flex items-center gap-2">
                                <Input type="number" min="0" max="10" step="0.5" placeholder="%" value={claimsLeadAmount || ''} onChange={(e) => setClaimsLeadAmount(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-20 h-9" />
                                <span className="text-xs text-muted-foreground">% (max 10%)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="shrink-0 pt-2">
            <Button className="w-full sm:w-auto" onClick={() => { setShowEligibilityPopup(false); setEligibilityMessage(''); }}>
              {eligibilityMessage ? 'Continue' : 'Done'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motor Expertise Popup */}
      <Dialog open={showMotorExpertisePopup} onOpenChange={setShowMotorExpertisePopup}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[85vh] overflow-hidden flex flex-col rounded-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Car className="h-5 w-5 text-blue-500" />
              Motor Insurance Expertise
            </DialogTitle>
            <DialogDescription className="text-sm">
              Rate your expertise level for each motor product
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
            <ExpertiseGrid
              title="🚗 Motor Insurance"
              products={MOTOR_PRODUCTS}
              values={motorExpertise}
              onChange={(id, level) => setMotorExpertise(prev => ({ ...prev, [id]: level }))}
              onAddCustomProduct={(name) => addCustomProduct('motor', name)}
              onRemoveCustomProduct={(id) => removeCustomProduct('motor', id)}
              customProducts={customMotorProducts}
            />
          </div>
          <DialogFooter className="shrink-0 pt-2">
            <Button className="w-full sm:w-auto" onClick={() => setShowMotorExpertisePopup(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SME Expertise Popup */}
      <Dialog open={showSmeExpertisePopup} onOpenChange={setShowSmeExpertisePopup}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[85vh] overflow-hidden flex flex-col rounded-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-5 w-5 text-orange-500" />
              SME / Commercial Expertise
            </DialogTitle>
            <DialogDescription className="text-sm">
              Rate your expertise level for each SME product
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
            <ExpertiseGrid
              title="🏢 SME / Commercial Insurance"
              products={SME_PRODUCTS}
              values={smeExpertise}
              onChange={(id, level) => setSmeExpertise(prev => ({ ...prev, [id]: level }))}
              onAddCustomProduct={(name) => addCustomProduct('sme', name)}
              onRemoveCustomProduct={(id) => removeCustomProduct('sme', id)}
              customProducts={customSmeProducts}
            />
          </div>
          <DialogFooter className="shrink-0 pt-2">
            <Button className="w-full sm:w-auto" onClick={() => setShowSmeExpertisePopup(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Declarations Popup */}
      <Dialog open={showDeclarationsPopup} onOpenChange={setShowDeclarationsPopup}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[90vh] overflow-hidden flex flex-col rounded-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Declarations & Consent
            </DialogTitle>
            <DialogDescription className="text-sm">
              Please read all declarations carefully and scroll to the bottom to accept.
            </DialogDescription>
          </DialogHeader>
          <div 
            className="flex-1 min-h-0 h-[40vh] sm:h-[300px] border rounded-md p-3 sm:p-4 overflow-y-auto"
            onScroll={(e) => {
              const target = e.currentTarget;
              if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
                setDeclarationsScrolledToEnd(true);
              }
            }}
          >
            <div className="space-y-3 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground text-sm">1. Information Accuracy</h4>
              <p className="text-xs sm:text-sm">All information provided in this profile is self-declared and accurate to the best of my knowledge. I understand that providing false or misleading information may result in profile suspension or termination.</p>
              
              <h4 className="font-semibold text-foreground text-sm">2. Platform Nature</h4>
              <p className="text-xs sm:text-sm">PadosiAgent is a facilitation platform that connects insurance seekers with insurance agents. Leads and business are not guaranteed.</p>
              
              <h4 className="font-semibold text-foreground text-sm">3. Commission Policy</h4>
              <p className="text-xs sm:text-sm">No commission is charged by PadosiAgent on policies sold or claims processed through leads generated via the platform.</p>
              
              <h4 className="font-semibold text-foreground text-sm">4. Regulatory Compliance</h4>
              <p className="text-xs sm:text-sm">I confirm that I hold a valid insurance license (or am in the process of obtaining one) and comply with all applicable insurance regulations.</p>
              
              <h4 className="font-semibold text-foreground text-sm">5. Data Privacy</h4>
              <p className="text-xs sm:text-sm">I consent to the collection, storage, and processing of my personal and professional information as outlined in the Privacy Policy.</p>
              
              <h4 className="font-semibold text-foreground text-sm">6. Customer Interaction</h4>
              <p className="text-xs sm:text-sm">I agree to respond to customer inquiries in a professional and timely manner.</p>
              
              <h4 className="font-semibold text-foreground text-sm">7. Jurisdiction</h4>
              <p className="text-xs sm:text-sm">Any disputes shall be subject to the exclusive jurisdiction of courts in Ahmedabad, Gujarat, India.</p>
              
              <h4 className="font-semibold text-foreground text-sm">8. Terms & Privacy Policy</h4>
              <p className="text-xs sm:text-sm">I have read and agree to the <a href="/terms" className="text-primary underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-primary underline" target="_blank">Privacy Policy</a> of PadosiAgent.</p>
              
              <div className="h-2" />
            </div>
          </div>
          <div className="flex items-start space-x-3 pt-2 shrink-0">
            <Checkbox
              id="declarations-popup-accept"
              checked={declarationsAccepted}
              onCheckedChange={(checked) => setDeclarationsAccepted(checked === true)}
              disabled={!declarationsScrolledToEnd}
              className="mt-1"
            />
            <Label
              htmlFor="declarations-popup-accept"
              className={cn(
                "text-xs sm:text-sm font-medium cursor-pointer leading-relaxed",
                !declarationsScrolledToEnd && "text-muted-foreground cursor-not-allowed"
              )}
            >
              I agree to all declarations, Terms & Privacy Policy
              {!declarationsScrolledToEnd && (
                <span className="block text-xs text-amber-600 mt-1">↓ Scroll to read all declarations first</span>
              )}
            </Label>
          </div>
          <DialogFooter className="shrink-0 flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowDeclarationsPopup(false)}>Cancel</Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={async () => {
                try {
                  const { error } = await supabase.functions.invoke('accept-declarations');
                  if (error) {
                    toast.error("Failed to save declarations. Please try again.");
                    console.error('Declarations error:', error);
                    return;
                  }
                  setShowDeclarationsPopup(false);
                  handleSubmit();
                } catch (err) {
                  toast.error("Failed to save declarations. Please try again.");
                  console.error('Declarations error:', err);
                }
              }} 
              disabled={!declarationsAccepted || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
              Accept & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default AgentProfileSetup;
