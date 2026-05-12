import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisibilitySettings {
  show_experience: boolean;
  show_claims_stats: boolean;
  show_client_base: boolean;
  show_certificates: boolean;
  show_achievements: boolean;
  show_comments: boolean;
  show_ratings: boolean;
  show_social_links: boolean;
  show_languages: boolean;
  show_gallery: boolean;
  show_contact_info: boolean;
}

interface AgentProfileData {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  image: string;
  experience: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  irdaLicensed: boolean;
  planType: 'starter' | 'professional';
  coverPage: string;
  specializations: string[];
  languages: string[];
  bio: string;
  stats: {
    clientsServed: string;
    claimsProcessed: string;
    claimsSettled: number;
    claimsAmount: string;
    successRate: string;
    responseTime: string;
  };
  timeline: Array<{ year: string; month?: string; event: string; type: string }>;
  achievements: Array<{ title: string; icon: React.ReactNode }>;
  certifications: string[];
  socialLinks: { linkedin?: string; facebook?: string; twitter?: string };
  gallery: string[];
  reviews: Array<{ id: number; clientName: string; rating: number; date: string; comment: string }>;
  visibility: VisibilitySettings;
  analytics?: { page_views: number; profile_clicks: number; contact_requests: number };
  weeklyTrends?: { thisWeek: { page_views: number; profile_clicks: number; contact_requests: number }; lastWeek: { page_views: number; profile_clicks: number; contact_requests: number } };
  serviceFees?: { portfolioCharging: string; portfolioAmount: number; claimsCharging: string; claimsAmount: number };
}

const defaultVisibility: VisibilitySettings = {
  show_experience: true, show_claims_stats: true, show_client_base: true,
  show_certificates: true, show_achievements: true, show_comments: true,
  show_ratings: true, show_social_links: true, show_languages: true,
  show_gallery: true, show_contact_info: true,
};

// Mock data for demo agents
const mockAgentData: Record<string, AgentProfileData> = {
  '1': {
    id: '1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    experience: '8 years',
    rating: 4.8,
    reviewCount: 127,
    verified: true,
    irdaLicensed: true,
    planType: 'professional',
    coverPage: 'gradient-teal',
    specializations: ['Health Insurance', 'Life Insurance', 'Motor Insurance'],
    languages: ['English', 'Hindi', 'Marathi'],
    bio: 'Experienced insurance professional with a proven track record of helping clients find the right coverage.',
    stats: {
      clientsServed: '500+',
      claimsProcessed: '150+',
      claimsSettled: 145,
      claimsAmount: '₹2.5 Cr',
      successRate: '98%',
      responseTime: '< 2 hours'
    },
    timeline: [
      { year: '2024', event: 'Top Performer Award', type: 'achievement' },
      { year: '2023', event: 'Settled 50+ Health Claims', type: 'milestone' },
      { year: '2021', event: 'Life Insurance Specialist Certification', type: 'certification' },
      { year: '2016', event: 'Started Insurance Career', type: 'career' }
    ],
    achievements: [
      { title: 'Top Performer 2023', icon: null },
      { title: 'Claim Master', icon: null },
      { title: '5 Star Rating', icon: null }
    ],
    certifications: ['Licensed Certified Agent', 'Insurance Institute of India Member', 'Life Insurance Specialist'],
    socialLinks: {
      linkedin: '#',
      facebook: '#',
      twitter: '#'
    },
    gallery: [
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop',
    ],
    reviews: [
      { id: 1, clientName: 'Priya Patel', rating: 5, date: '2024-01-10', comment: 'Excellent service! Very professional.' },
      { id: 2, clientName: 'Amit Kumar', rating: 5, date: '2024-01-05', comment: 'Great experience with claim assistance.' }
    ],
    visibility: defaultVisibility,
  },
  '2': {
    id: '2',
    name: 'Priya Patel',
    phone: '+91 98876 54321',
    whatsapp: '+91 98876 54321',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    experience: '6 years',
    rating: 4.9,
    reviewCount: 98,
    verified: true,
    irdaLicensed: true,
    planType: 'starter',
    coverPage: 'gradient-navy',
    specializations: ['Health Insurance', 'Travel Insurance'],
    languages: ['English', 'Hindi', 'Kannada'],
    bio: 'Dedicated insurance advisor focusing on comprehensive coverage solutions.',
    stats: {
      clientsServed: '400+',
      claimsProcessed: '120+',
      claimsSettled: 112,
      claimsAmount: '₹1.8 Cr',
      successRate: '99%',
      responseTime: '< 3 hours'
    },
    timeline: [
      { year: '2023', event: 'Excellence Award', type: 'achievement' },
      { year: '2020', event: 'Health Insurance Expert', type: 'certification' },
      { year: '2018', event: 'Joined Insurance Industry', type: 'career' }
    ],
    achievements: [
      { title: 'Excellence Award 2023', icon: null },
      { title: 'Customer Favorite', icon: null }
    ],
    certifications: ['Licensed Certified Agent', 'Health Insurance Specialist'],
    socialLinks: { linkedin: '#', facebook: '#' },
    gallery: [
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
    ],
    reviews: [
      { id: 1, clientName: 'Rajesh Kumar', rating: 5, date: '2024-01-12', comment: 'Outstanding professional!' }
    ],
    visibility: defaultVisibility,
  }
};

export const useAgentProfile = (agentId: string | undefined) => {
  const [agent, setAgent] = useState<AgentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setIsLoading(false);
      return;
    }

    const fetchAgentProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if it's a numeric ID (mock data)
        if (/^\d+$/.test(agentId)) {
          const mockData = mockAgentData[agentId];
          if (mockData) {
            setAgent(mockData);
            setIsLoading(false);
            return;
          }
        }

        // Fetch from public_profiles view to avoid exposing PII to anonymous users
        interface PublicProfile {
          id: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          is_verified: boolean | null;
        }
        const { data: profileRaw, error: profileError } = await supabase
          .from('public_profiles' as any)
          .select('*')
          .eq('id', agentId)
          .maybeSingle();
        const profile = profileRaw as unknown as PublicProfile | null;

        if (profileError) throw profileError;

        // Use the public_agent_info view to avoid exposing sensitive fields like PAN numbers
        const { data: agentProfile, error: agentError } = await supabase
          .from('public_agent_info')
          .select('*')
          .eq('id', agentId)
          .maybeSingle();

        if (agentError) throw agentError;

        const { data: galleryImages } = await supabase
          .from('agent_gallery_images')
          .select('image_url')
          .eq('agent_id', agentId)
          .order('display_order');

        // Fetch visibility settings + career timeline + social links from agent_profiles
        const { data: visibilityData } = await supabase
          .from('agent_profiles')
          .select('show_experience, show_claims_stats, show_client_base, show_certificates, show_achievements, show_comments, show_ratings, show_social_links, show_languages, show_gallery, show_contact_info, career_timeline, linkedin, facebook, youtube, instagram, portfolio_lead_charging, portfolio_lead_amount, claims_lead_charging, claims_lead_amount')
          .eq('id', agentId)
          .maybeSingle();

        // Use public_agent_reviews view to avoid exposing user_id
        // Define interface for the view data
        interface PublicReview {
          id: string;
          agent_id: string;
          rating: number | null;
          comment: string | null;
          created_at: string | null;
          is_approved: boolean | null;
        }
        
        const { data: reviewsData } = await supabase
          .from('public_agent_reviews' as any)
          .select('*')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false });
        
        const reviews = reviewsData as unknown as PublicReview[] | null;

        if (profile) {
          // Fetch agent's average rating from reviews
          const { data: ratingData } = await supabase
            .from('public_agent_reviews')
            .select('rating')
            .eq('agent_id', agentId)
            .eq('is_approved', true);
          
          const avgRating = ratingData && ratingData.length > 0 
            ? ratingData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingData.length 
            : 4.5;

           // Fetch analytics data for own profile
          const { data: analyticsData } = await supabase
            .from('agent_analytics')
            .select('page_views, profile_clicks, contact_requests, date')
            .eq('agent_id', agentId);

          const analyticsTotals = (analyticsData || []).reduce(
            (acc, row) => ({
              page_views: acc.page_views + (row.page_views || 0),
              profile_clicks: acc.profile_clicks + (row.profile_clicks || 0),
              contact_requests: acc.contact_requests + (row.contact_requests || 0),
            }),
            { page_views: 0, profile_clicks: 0, contact_requests: 0 }
          );

          // Calculate weekly trends (this week vs last week)
          const now = new Date();
          const startOfThisWeek = new Date(now);
          startOfThisWeek.setDate(now.getDate() - now.getDay());
          startOfThisWeek.setHours(0, 0, 0, 0);
          const startOfLastWeek = new Date(startOfThisWeek);
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

          const thisWeekData = { page_views: 0, profile_clicks: 0, contact_requests: 0 };
          const lastWeekData = { page_views: 0, profile_clicks: 0, contact_requests: 0 };

          (analyticsData || []).forEach(row => {
            const rowDate = new Date(row.date);
            if (rowDate >= startOfThisWeek) {
              thisWeekData.page_views += row.page_views || 0;
              thisWeekData.profile_clicks += row.profile_clicks || 0;
              thisWeekData.contact_requests += row.contact_requests || 0;
            } else if (rowDate >= startOfLastWeek && rowDate < startOfThisWeek) {
              lastWeekData.page_views += row.page_views || 0;
              lastWeekData.profile_clicks += row.profile_clicks || 0;
              lastWeekData.contact_requests += row.contact_requests || 0;
            }
          });

          // Parse career timeline from DB (fetched via visibilityData query)
          const rawTimeline = visibilityData?.career_timeline;
          const careerTimeline = Array.isArray(rawTimeline) 
            ? (rawTimeline as any[]).map((item: any) => ({
                year: item.year || '',
                month: item.month || '',
                event: item.event || '',
                type: item.type || 'career',
              }))
            : [{ year: new Date().getFullYear().toString(), event: 'Joined PadosiAgent', type: 'career' }];

          // Parse achievements and certifications from career timeline
          const achievements = careerTimeline
            .filter((item: any) => item.type === 'achievement')
            .map((item: any) => ({ title: item.event, icon: null }));

          const certifications = careerTimeline
            .filter((item: any) => item.type === 'certification')
            .map((item: any) => item.event);
          if (agentProfile?.license_number && !certifications.includes('Licensed Certified Agent')) {
            certifications.unshift('Licensed Certified Agent');
          }

          // Build agent data from database
          const agentData: AgentProfileData = {
            id: agentId,
            name: profile.full_name || profile.display_name || 'Agent',
            phone: '', // Contact details served only via authenticated paths
            whatsapp: '',
            image: profile.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg',
            experience: agentProfile?.years_experience ? `${agentProfile.years_experience} years` : 'New',
            rating: Number(avgRating.toFixed(1)),
            reviewCount: reviews?.length || 0,
            verified: profile.is_verified || false,
            irdaLicensed: !!agentProfile?.license_number,
            planType: agentProfile?.subscription_plan === 'professional' ? 'professional' : 'starter',
            coverPage: agentProfile?.cover_page || 'gradient-teal',
            specializations: agentProfile?.specializations || agentProfile?.insurance_segments || [],
            languages: agentProfile?.languages || ['English'],
            bio: agentProfile?.bio || 'Insurance professional helping clients find the right coverage.',
            stats: {
              clientsServed: agentProfile?.approx_client_base || '0',
              claimsProcessed: agentProfile?.claims_processed || '0',
              claimsSettled: agentProfile?.claims_settled || 0,
              claimsAmount: agentProfile?.claims_amount || '₹0',
              successRate: agentProfile?.success_rate || '0%',
              responseTime: agentProfile?.response_time || 'N/A',
            },
            timeline: careerTimeline,
            achievements,
            certifications,
            socialLinks: {
              linkedin: visibilityData?.linkedin || undefined,
              facebook: visibilityData?.facebook || undefined,
              twitter: visibilityData?.youtube || undefined,
            },
            gallery: galleryImages?.map(g => g.image_url) || [],
            reviews: reviews?.map((r, i) => ({
              id: i + 1,
              clientName: 'Anonymous',
              rating: r.rating || 5,
              date: new Date(r.created_at || '').toLocaleDateString(),
              comment: r.comment || ''
            })) || [],
            visibility: visibilityData ? (visibilityData as unknown as VisibilitySettings) : defaultVisibility,
            analytics: analyticsTotals,
            weeklyTrends: { thisWeek: thisWeekData, lastWeek: lastWeekData },
            serviceFees: {
              portfolioCharging: (visibilityData as any)?.portfolio_lead_charging || 'free',
              portfolioAmount: (visibilityData as any)?.portfolio_lead_amount || 0,
              claimsCharging: (visibilityData as any)?.claims_lead_charging || 'free',
              claimsAmount: (visibilityData as any)?.claims_lead_amount || 0,
            },
          };
          setAgent(agentData);
        } else {
          // Fallback to mock data if no profile found
          const mockData = mockAgentData[agentId];
          if (mockData) {
            setAgent(mockData);
          } else {
            setError('Agent not found');
          }
        }
      } catch (err) {
        console.error('Error fetching agent profile:', err);
        // Try mock data as fallback
        const mockData = mockAgentData[agentId];
        if (mockData) {
          setAgent(mockData);
        } else {
          setError('Failed to load agent profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentProfile();
  }, [agentId]);

  const updateAgent = (updatedData: Partial<AgentProfileData>) => {
    if (agent) {
      setAgent({ ...agent, ...updatedData });
    }
  };

  return { agent, isLoading, error, updateAgent };
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const trackView = async (agentId: string, viewType: string) => {
  if (!agentId || !UUID_REGEX.test(agentId)) return;
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    fetch(`https://${projectId}.supabase.co/functions/v1/track-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ agent_id: agentId, view_type: viewType }),
    }).catch(() => { /* silent */ });
  } catch { /* silent */ }
};

export const trackAgentPageView = async (agentId: string) => {
  trackView(agentId, 'page_view');
};

export const trackAgentCardView = async (agentId: string) => {
  trackView(agentId, 'card_view');
};

export const trackProfileClick = async (agentId: string) => {
  trackView(agentId, 'profile_click');
};

export const trackContactRequest = async (_agentId: string) => {
  console.debug('Contact request tracking is handled by database trigger');
};
