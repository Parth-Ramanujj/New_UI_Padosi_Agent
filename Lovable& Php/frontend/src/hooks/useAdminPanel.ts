import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface AdminAgent {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  is_profile_approved: boolean | null;
  years_experience: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  license_number: string | null;
  show_full_profile: boolean;
  show_certificates: boolean;
  show_achievements: boolean;
  show_comments: boolean;
  show_gallery: boolean;
  show_contact_info: boolean;
  admin_notes: string | null;
  serviceable_cities: string[] | null;
  created_at: string | null;
  total_reviews: number;
  avg_rating: number;
  total_page_views: number;
  total_leads: number;
}

export interface AdminDistributor {
  id: string;
  full_name: string | null;
  email: string;
  company_name: string | null;
  region: string | null;
  target_agents: number | null;
  commission_rate: number | null;
  agent_count: number;
}

export type SortField = 'full_name' | 'created_at' | 'avg_rating' | 'total_reviews' | 'total_page_views' | 'total_leads' | 'subscription_plan' | 'is_profile_approved';
export type SortDir = 'asc' | 'desc';

export interface Filters {
  search: string;
  state: string;
  city: string;
  plan: string;
  status: string;
  sortBy: SortField;
  sortDir: SortDir;
}

export function useAdminPanel() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [distributors, setDistributors] = useState<AdminDistributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    state: '',
    city: '',
    plan: '',
    status: '',
    sortBy: 'created_at',
    sortDir: 'desc',
  });

  const fetchAgents = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      // Fetch agent profiles with their profile info
      const { data: agentProfiles, error: apError } = await supabase
        .from('agent_profiles')
        .select('*');
      if (apError) throw apError;

      // Fetch all profiles for agents
      const agentIds = (agentProfiles || []).map(a => a.id);
      if (agentIds.length === 0) { setAgents([]); return; }

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url');
      if (pError) throw pError;

      // Fetch reviews aggregates
      const { data: reviews, error: rError } = await supabase
        .from('agent_reviews')
        .select('agent_id, rating');
      if (rError) throw rError;

      // Fetch analytics aggregates
      const { data: analytics, error: anError } = await supabase
        .from('agent_analytics')
        .select('agent_id, page_views');
      if (anError) throw anError;

      // Fetch leads count
      const { data: leads, error: lError } = await supabase
        .from('leads')
        .select('agent_id');
      if (lError) throw lError;

      // Build review stats map
      const reviewMap = new Map<string, { count: number; totalRating: number }>();
      (reviews || []).forEach(r => {
        const existing = reviewMap.get(r.agent_id) || { count: 0, totalRating: 0 };
        existing.count++;
        existing.totalRating += r.rating || 0;
        reviewMap.set(r.agent_id, existing);
      });

      // Build analytics map
      const analyticsMap = new Map<string, number>();
      (analytics || []).forEach(a => {
        analyticsMap.set(a.agent_id, (analyticsMap.get(a.agent_id) || 0) + (a.page_views || 0));
      });

      // Build leads map
      const leadsMap = new Map<string, number>();
      (leads || []).forEach(l => {
        leadsMap.set(l.agent_id, (leadsMap.get(l.agent_id) || 0) + 1);
      });

      // Profile map
      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const combined: AdminAgent[] = (agentProfiles || []).map(ap => {
        const profile = profileMap.get(ap.id);
        const reviewStats = reviewMap.get(ap.id) || { count: 0, totalRating: 0 };
        return {
          id: ap.id,
          full_name: profile?.full_name || null,
          email: profile?.email || '',
          phone: profile?.phone || null,
          avatar_url: profile?.avatar_url || null,
          location: ap.location,
          subscription_plan: ap.subscription_plan,
          subscription_expires_at: ap.subscription_expires_at,
          is_profile_approved: ap.is_profile_approved,
          years_experience: ap.years_experience,
          specializations: ap.specializations,
          languages: ap.languages,
          license_number: ap.license_number,
          show_full_profile: (ap as any).show_full_profile ?? true,
          show_certificates: (ap as any).show_certificates ?? true,
          show_achievements: (ap as any).show_achievements ?? true,
          show_comments: (ap as any).show_comments ?? true,
          show_gallery: (ap as any).show_gallery ?? true,
          show_contact_info: (ap as any).show_contact_info ?? true,
          admin_notes: null, // loaded separately from agent_admin_notes
          serviceable_cities: ap.serviceable_cities,
          created_at: ap.created_at,
          total_reviews: reviewStats.count,
          avg_rating: reviewStats.count > 0 ? reviewStats.totalRating / reviewStats.count : 0,
          total_page_views: analyticsMap.get(ap.id) || 0,
          total_leads: leadsMap.get(ap.id) || 0,
        };
      });

      // Load admin notes from separate table
      const { data: adminNotesData } = await supabase
        .from('agent_admin_notes' as any)
        .select('agent_id, notes');
      const notesMap = new Map((adminNotesData || []).map((n: any) => [n.agent_id, n.notes]));
      combined.forEach(a => { a.admin_notes = notesMap.get(a.id) || null; });

      setAgents(combined);
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      toast.error('Failed to load agents');
    }
  };

  const fetchDistributors = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      const { data: distProfiles, error: dpError } = await supabase
        .from('distributor_profiles')
        .select('*');
      if (dpError) throw dpError;

      const distIds = (distProfiles || []).map(d => d.id);
      if (distIds.length === 0) { setDistributors([]); return; }

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      if (pError) throw pError;

      const { data: distAgents, error: daError } = await supabase
        .from('distributor_agents')
        .select('distributor_id');
      if (daError) throw daError;

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const agentCountMap = new Map<string, number>();
      (distAgents || []).forEach(da => {
        agentCountMap.set(da.distributor_id, (agentCountMap.get(da.distributor_id) || 0) + 1);
      });

      const combined: AdminDistributor[] = (distProfiles || []).map(dp => {
        const profile = profileMap.get(dp.id);
        return {
          id: dp.id,
          full_name: profile?.full_name || null,
          email: profile?.email || '',
          company_name: dp.company_name,
          region: dp.region,
          target_agents: dp.target_agents,
          commission_rate: dp.commission_rate ? Number(dp.commission_rate) : null,
          agent_count: agentCountMap.get(dp.id) || 0,
        };
      });

      setDistributors(combined);
    } catch (err: any) {
      console.error('Error fetching distributors:', err);
      toast.error('Failed to load distributors');
    }
  };

  const toggleAgentApproval = async (agentId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_profiles')
        .update({ is_profile_approved: approved })
        .eq('id', agentId);
      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, is_profile_approved: approved } : a));
      toast.success(approved ? 'Agent activated' : 'Agent deactivated');
    } catch (err: any) {
      toast.error('Failed to update agent status');
    }
  };

  const toggleProfileSection = async (agentId: string, section: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_profiles')
        .update({ [section]: value } as any)
        .eq('id', agentId);
      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, [section]: value } : a));
      toast.success(`Section ${value ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error('Failed to update section');
    }
  };

  const updateAdminNotes = async (agentId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('agent_admin_notes' as any)
        .upsert({ agent_id: agentId, notes, updated_by: user?.id, updated_at: new Date().toISOString() } as any, { onConflict: 'agent_id' });
      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, admin_notes: notes } : a));
      toast.success('Notes saved');
    } catch (err: any) {
      toast.error('Failed to save notes');
    }
  };

  const updateAgentDetails = async (agentId: string, updates: { full_name?: string; license_number?: string; location?: string; phone?: string }) => {
    try {
      // Update profile fields (full_name, phone)
      if (updates.full_name !== undefined || updates.phone !== undefined) {
        const profileUpdate: any = {};
        if (updates.full_name !== undefined) profileUpdate.full_name = updates.full_name;
        if (updates.phone !== undefined) profileUpdate.phone = updates.phone;
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', agentId);
        if (error) throw error;
      }

      // Update agent_profile fields (license_number, location)
      if (updates.license_number !== undefined || updates.location !== undefined) {
        const agentUpdate: any = {};
        if (updates.license_number !== undefined) agentUpdate.license_number = updates.license_number;
        if (updates.location !== undefined) agentUpdate.location = updates.location;
        const { error } = await supabase
          .from('agent_profiles')
          .update(agentUpdate)
          .eq('id', agentId);
        if (error) throw error;
      }

      setAgents(prev => prev.map(a => a.id === agentId ? {
        ...a,
        ...(updates.full_name !== undefined ? { full_name: updates.full_name } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.license_number !== undefined ? { license_number: updates.license_number } : {}),
        ...(updates.location !== undefined ? { location: updates.location } : {}),
      } : a));
      toast.success('Agent details updated');
    } catch (err: any) {
      toast.error('Failed to update agent details');
    }
  };

  const deleteReview = async (reviewId: string, agentId: string) => {
    // Admin can't delete via RLS, but can set is_approved to false to hide it
    try {
      const { error } = await supabase
        .from('agent_reviews')
        .update({ is_approved: false })
        .eq('id', reviewId);
      if (error) throw error;
      toast.success('Review hidden');
    } catch (err: any) {
      toast.error('Failed to hide review');
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('agent_reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);
      if (error) throw error;
      toast.success('Review approved');
    } catch (err: any) {
      toast.error('Failed to approve review');
    }
  };

  // Filtered + sorted agents
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(a =>
        (a.full_name?.toLowerCase().includes(s)) ||
        a.email.toLowerCase().includes(s) ||
        (a.location?.toLowerCase().includes(s)) ||
        (a.license_number?.toLowerCase().includes(s))
      );
    }
    if (filters.city) {
      result = result.filter(a =>
        a.location?.toLowerCase().includes(filters.city.toLowerCase()) ||
        a.serviceable_cities?.some(c => c.toLowerCase().includes(filters.city.toLowerCase()))
      );
    }
    if (filters.plan) {
      result = result.filter(a => a.subscription_plan === filters.plan);
    }
    if (filters.status === 'active') {
      result = result.filter(a => a.is_profile_approved);
    } else if (filters.status === 'inactive') {
      result = result.filter(a => !a.is_profile_approved);
    }

    result.sort((a, b) => {
      const field = filters.sortBy;
      let aVal: any = a[field];
      let bVal: any = b[field];
      if (typeof aVal === 'string') aVal = aVal?.toLowerCase() || '';
      if (typeof bVal === 'string') bVal = bVal?.toLowerCase() || '';
      if (aVal == null) aVal = field === 'full_name' ? '' : 0;
      if (bVal == null) bVal = field === 'full_name' ? '' : 0;
      if (aVal < bVal) return filters.sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [agents, filters]);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const planCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    let activeCount = 0;
    let inactiveCount = 0;

    agents.forEach(a => {
      const plan = a.subscription_plan || 'starter';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
      if (a.is_profile_approved) activeCount++; else inactiveCount++;
      if (a.location) {
        const city = a.location.split(',')[0]?.trim() || a.location;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    return {
      total: agents.length,
      active: activeCount,
      inactive: inactiveCount,
      planCounts,
      cityCounts,
      totalDistributors: distributors.length,
    };
  }, [agents, distributors]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAgents(), fetchDistributors()]);
      setIsLoading(false);
    };
    if (user?.role === 'admin') loadData();
  }, [user]);

  return {
    agents: filteredAgents,
    allAgents: agents,
    distributors,
    isLoading,
    filters,
    setFilters,
    dashboardStats,
    toggleAgentApproval,
    toggleProfileSection,
    updateAdminNotes,
    updateAgentDetails,
    deleteReview,
    approveReview,
    refreshData: () => Promise.all([fetchAgents(), fetchDistributors()]),
  };
}
