/**
 * api.ts — Central API client for the Django backend.
 *
 * Replaces all Supabase calls. Handles CSRF tokens, session cookies,
 * and provides typed wrappers for every backend endpoint.
 */

// In development, Vite proxies /api/* → Django at :8000
// In production, same origin, so just use relative URLs
const API_BASE = '/api';

// ─── CSRF Handling ──────────────────────────────────────────────────────────

/** Read a cookie by name (Django sets csrftoken cookie). */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

/** Cache for the CSRF token. */
let _csrfToken: string | null = null;

/** Fetch CSRF token from Django (sets cookie + returns JSON). */
async function ensureCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;

  // Try cookie first
  const cookie = getCookie('csrftoken');
  if (cookie) {
    _csrfToken = cookie;
    return cookie;
  }

  // Fetch from endpoint
  const res = await fetch(`${API_BASE}/csrf/`, { credentials: 'include' });
  const data = await res.json();
  _csrfToken = data.csrfToken || getCookie('csrftoken') || '';
  return _csrfToken!;
}

// ─── Core Fetch Wrapper ─────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Wrapper around `fetch` that:
 * - Prefixes URLs with /api
 * - Sends session cookies (credentials: include)
 * - Attaches CSRF token for mutating methods
 * - Parses JSON responses
 */
async function apiFetch<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await ensureCsrfToken();
    headers['X-CSRFToken'] = token;
  }

  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, fetchOptions);

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError('Request failed', response.status);
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || data.detail || 'Request failed',
      response.status,
      data,
    );
  }

  return data as T;
}

/** Custom error class for API responses. */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export interface UserData {
  id: number;
  fullname: string;
  email: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: UserData;
  dashboard_url: string;
}

export interface RegisterPayload {
  fullname: string;
  email: string;
  password: string;
  role: 'agent' | 'client' | 'distributor';
  phone?: string;
  company_name?: string;
}

export const authApi = {
  /** POST /api/accounts/login/ */
  login: (email: string, password: string, loginType?: string) =>
    apiFetch<LoginResponse>('/accounts/login/', {
      method: 'POST',
      body: { email, password, login_type: loginType || 'agent' },
    }),

  /** POST /api/accounts/logout/ */
  logout: () =>
    apiFetch<{ message: string }>('/accounts/logout/', { method: 'POST' }),

  /** POST /api/accounts/register/ */
  register: (data: RegisterPayload) =>
    apiFetch<LoginResponse>('/accounts/register/', {
      method: 'POST',
      body: data,
    }),

  /** GET /api/accounts/me/ */
  me: () => apiFetch<UserData>('/accounts/me/'),

  /** POST /api/accounts/forgot-password/ */
  forgotPassword: (email: string, loginType: string) =>
    apiFetch<{ message: string }>('/accounts/forgot-password/', {
      method: 'POST',
      body: { email, login_type: loginType },
    }),

  /** POST /api/accounts/reset-password/ */
  resetPassword: (token: string, email: string, password: string, loginType: string) =>
    apiFetch<{ message: string }>('/accounts/reset-password/', {
      method: 'POST',
      body: { token, email, password, password_confirmation: password, login_type: loginType },
    }),
};

// ─── Agents API ─────────────────────────────────────────────────────────────

export interface AgentSearchResult {
  id: number;
  fullname: string;
  display_name: string;
  experience_range: string | null;
  average_rating: number | null;
  review_count: number;
  profile_photo: string | null;
  city: string;
  segments: string[];
  slug: string;
  badge: string | null;
  client_base: string | null;
}

export interface AgentSearchResponse {
  results: AgentSearchResult[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentDetail {
  id: number;
  fullname: string;
  email: string;
  mobile: string;
  experience_range: string | null;
  client_base: string | null;
  average_rating: number | null;
  review_count: number;
  profile: {
    display_name: string;
    address: string | null;
    office_address: string | null;
    service_pincode: string | null;
    languages: string | null;
    whatsapp: string | null;
    website_url: string | null;
    social_links: string | null;
    profile_photo_path: string | null;
  } | null;
  performance_stats: {
    claims_processed: number;
    claims_settled: number;
    claims_amount: string;
    success_rate: string;
    response_time: string;
  } | null;
  insurance_segments: Array<{ segment_type: string }>;
  product_expertise: Array<{
    segment_type: string;
    product_name: string;
    expertise_level: string;
    is_custom: boolean;
  }>;
  recent_reviews: Array<{
    id: number;
    reviewer_name: string;
    rating: number;
    review: string;
    created_at: string;
  }>;
}

export interface DashboardData {
  agent: {
    id: number;
    fullname: string;
    email: string;
    display_name: string;
    profile_photo: string | null;
    plan_name: string;
    is_on_trial: boolean;
    days_left: number;
    completion: number;
    badge: string | null;
    segments: string[];
    status: string;
  };
  stats: {
    total_leads: number;
    monthly_leads: number;
    new_leads: number;
    contacted_leads: number;
    follow_up_leads: number;
    closed_leads: number;
    active_leads: number;
    conversion_rate: number;
    total_page_views: number;
    monthly_visits: number;
  };
  recent_leads: LeadData[];
}

export interface LeadData {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_pincode: string;
  interaction_type: string;
  lead_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadCapturePayload {
  agent_id: number;
  customer_name: string;
  customer_email?: string;
  customer_mobile: string;
  customer_pincode?: string;
  interaction_type?: string;
}

export const agentsApi = {
  /** GET /api/agents/search/?search=...&insurance_type=...&city=... */
  search: (params: Record<string, string | string[]>) => {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (Array.isArray(val)) {
        val.forEach(v => searchParams.append(key, v));
      } else if (val) {
        searchParams.set(key, val);
      }
    }
    return apiFetch<AgentSearchResponse>(`/agents/search/?${searchParams.toString()}`);
  },

  /** GET /api/agents/<slug>/ */
  getDetail: (slug: string) =>
    apiFetch<AgentDetail>(`/agents/${slug}/`),

  /** POST /api/agents/<slug>/review/ */
  submitReview: (slug: string, data: { reviewer_name: string; rating: number; review: string }) =>
    apiFetch<{ message: string }>(`/agents/${slug}/review/`, {
      method: 'POST',
      body: data,
    }),

  /** GET /api/agents/me/dashboard/ */
  myDashboard: () =>
    apiFetch<DashboardData>('/agents/me/dashboard/'),

  /** GET /api/agents/me/leads/?status=... */
  myLeads: (statusFilter?: string) => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    return apiFetch<{ results: LeadData[] }>(`/agents/me/leads/${qs}`);
  },

  /** POST /api/agents/leads/capture/ */
  captureLead: (data: LeadCapturePayload) =>
    apiFetch<{ message: string; lead_id: number }>('/agents/leads/capture/', {
      method: 'POST',
      body: data,
    }),
};

// ─── Clients API ────────────────────────────────────────────────────────────

export interface QuickRegisterPayload {
  fullname: string;
  email: string;
  mobile: string;
  pincode?: string;
}

export const clientsApi = {
  /** POST /api/clients/quick-register/ */
  quickRegister: (data: QuickRegisterPayload) =>
    apiFetch<{ message: string; user: UserData }>('/clients/quick-register/', {
      method: 'POST',
      body: data,
    }),
};

export default apiFetch;
