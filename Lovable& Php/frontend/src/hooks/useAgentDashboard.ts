/**
 * useAgentDashboard.ts — Dashboard hook backed by Django REST API.
 *
 * Replaces the Supabase-based dashboard hook with calls to
 * /api/agents/me/dashboard/ and /api/agents/me/leads/.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { agentsApi, type DashboardData, type LeadData } from '@/lib/api';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  product_interest: string | null;
  location: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentProfile {
  id: string;
  license_number: string | null;
  location: string | null;
  bio: string | null;
  specializations: string[] | null;
  years_experience: number;
  subscription_plan: string;
  subscription_expires_at: string | null;
  is_profile_approved: boolean;
  cover_page: string | null;
}

export interface AgentAnalytics {
  total_page_views: number;
  total_profile_clicks: number;
  total_contact_requests: number;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  followup: number;
  closed: number;
}

/** Convert Django LeadData to the shape the dashboard UI expects. */
function mapLead(d: LeadData): Lead {
  return {
    id: String(d.id),
    name: d.customer_name,
    email: d.customer_email || null,
    phone: d.customer_mobile || null,
    product_interest: d.interaction_type || null,
    location: d.customer_pincode || null,
    status: d.lead_status === 'follow_up' ? 'followup' : d.lead_status,
    notes: d.notes,
    created_at: d.created_at,
    updated_at: d.updated_at,
  };
}

export function useAgentDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [analytics, setAnalytics] = useState<AgentAnalytics>({
    total_page_views: 0,
    total_profile_clicks: 0,
    total_contact_requests: 0,
  });
  const [leadStats, setLeadStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    followup: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all dashboard data in one call ──────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (!user) return;

    try {
      const data: DashboardData = await agentsApi.myDashboard();

      // Map leads
      const mappedLeads = data.recent_leads.map(mapLead);
      setLeads(mappedLeads);

      // Lead stats from the backend
      setLeadStats({
        total: data.stats.total_leads,
        new: data.stats.new_leads,
        contacted: data.stats.contacted_leads,
        followup: data.stats.follow_up_leads,
        closed: data.stats.closed_leads,
      });

      // Analytics
      setAnalytics({
        total_page_views: data.stats.total_page_views,
        total_profile_clicks: data.stats.monthly_visits,
        total_contact_requests: data.stats.active_leads,
      });

      // Agent profile (mapped to the old shape for backwards compat)
      setAgentProfile({
        id: String(data.agent.id),
        license_number: null,
        location: null,
        bio: null,
        specializations: data.agent.segments,
        years_experience: 0,
        subscription_plan: data.agent.plan_name,
        subscription_expires_at: null,
        is_profile_approved: data.agent.status === 'active',
        cover_page: data.agent.profile_photo,
      });
    } catch (err: unknown) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    }
  }, [user]);

  // ── Refresh leads only ────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    if (!user) return;
    try {
      const data = await agentsApi.myLeads();
      const mapped = (data.results || []).map(mapLead);
      setLeads(mapped);

      // Recalculate stats
      setLeadStats({
        total: mapped.length,
        new: mapped.filter(l => l.status === 'new').length,
        contacted: mapped.filter(l => l.status === 'contacted').length,
        followup: mapped.filter(l => l.status === 'followup').length,
        closed: mapped.filter(l => l.status === 'closed').length,
      });
    } catch (err: unknown) {
      console.error('Error fetching leads:', err);
    }
  }, [user]);

  // Placeholder stubs — these operations will be added later
  const updateLeadStatus = async (_leadId: string, _newStatus: string) => {
    console.warn('updateLeadStatus: not yet wired to Django API');
    await fetchLeads();
  };

  const addLead = async (_leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    console.warn('addLead: not yet wired to Django API');
    await fetchLeads();
  };

  const deleteLead = async (_leadId: string) => {
    console.warn('deleteLead: not yet wired to Django API');
    await fetchLeads();
  };

  // ── Initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchDashboard();
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchDashboard]);

  return {
    leads,
    agentProfile,
    analytics,
    leadStats,
    isLoading,
    error,
    updateLeadStatus,
    addLead,
    deleteLead,
    refreshLeads: fetchLeads,
  };
}
