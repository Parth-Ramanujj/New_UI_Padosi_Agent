/**
 * Supabase Client Compatibility Shim
 *
 * This file replaces the original Supabase client. Components that
 * still import `supabase` from this module will get a mock/proxy object
 * that redirects common operations to the Django REST API.
 *
 * This is a transitional layer — over time, components should migrate
 * to importing from '@/lib/api' directly.
 */

import apiFetch, { ApiError } from '@/lib/api';

// ─── Mock Supabase-like query builder ────────────────────────────────────────

interface MockQueryResult<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/**
 * Returns a no-op chain that resolves to empty data.
 * Components calling supabase.from('table').select() will get empty results
 * instead of crashing. Real data comes from the Django API hooks.
 */
function createMockQueryBuilder(table: string) {
  const noop = (): typeof builder => builder;

  const builder = {
    select: noop,
    insert: noop,
    update: noop,
    delete: noop,
    upsert: noop,
    eq: noop,
    neq: noop,
    gt: noop,
    gte: noop,
    lt: noop,
    lte: noop,
    in: noop,
    is: noop,
    ilike: noop,
    like: noop,
    order: noop,
    limit: noop,
    range: noop,
    match: noop,
    filter: noop,
    single: noop,
    maybeSingle: noop,
    textSearch: noop,
    or: noop,
    not: noop,

    // Terminal — resolves the chain
    then(resolve: (value: MockQueryResult) => void) {
      console.warn(
        `[supabase-shim] Query to "${table}" was intercepted. ` +
        `Migrate this component to use @/lib/api instead.`
      );
      resolve({ data: null, error: null });
    },
  };

  return builder;
}

// ─── Mock Supabase Auth ──────────────────────────────────────────────────────

const mockAuth = {
  getSession: async () => {
    try {
      const user = await apiFetch('/accounts/me/');
      return {
        data: {
          session: {
            user: { id: (user as any).id, email: (user as any).email },
            access_token: 'django-session',
          },
        },
        error: null,
      };
    } catch {
      return { data: { session: null }, error: null };
    }
  },

  getUser: async () => {
    try {
      const user = await apiFetch('/accounts/me/');
      return { data: { user }, error: null };
    } catch {
      return { data: { user: null }, error: null };
    }
  },

  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    try {
      const result = await apiFetch('/accounts/login/', {
        method: 'POST',
        body: { email, password },
      });
      return {
        data: { user: (result as any).user, session: { access_token: 'django-session' } },
        error: null,
      };
    } catch (e) {
      return { data: { user: null, session: null }, error: { message: (e as Error).message } };
    }
  },

  signUp: async ({ email, password, options }: any) => {
    try {
      const result = await apiFetch('/accounts/register/', {
        method: 'POST',
        body: {
          fullname: options?.data?.full_name || email.split('@')[0],
          email,
          password,
          role: options?.data?.role || 'client',
          phone: options?.data?.phone || '',
        },
      });
      return {
        data: { user: (result as any).user, session: { access_token: 'django-session' } },
        error: null,
      };
    } catch (e) {
      return { data: { user: null, session: null }, error: { message: (e as Error).message } };
    }
  },

  signOut: async () => {
    try {
      await apiFetch('/accounts/logout/', { method: 'POST' });
      return { error: null };
    } catch (e) {
      return { error: { message: (e as Error).message } };
    }
  },

  onAuthStateChange: (_callback: any) => {
    // No real-time auth state in Django sessions — return no-op
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },

  resetPasswordForEmail: async (email: string) => {
    try {
      await apiFetch('/accounts/forgot-password/', {
        method: 'POST',
        body: { email, login_type: 'agent' },
      });
      return { data: {}, error: null };
    } catch (e) {
      return { data: null, error: { message: (e as Error).message } };
    }
  },
};

// ─── Mock RPC ────────────────────────────────────────────────────────────────

const mockRpc = async (fnName: string, _params?: any) => {
  console.warn(
    `[supabase-shim] RPC call "${fnName}" intercepted. ` +
    `Migrate this to a Django API endpoint.`
  );

  if (fnName === 'get_current_user_role') {
    try {
      const user = await apiFetch('/accounts/me/');
      return { data: (user as any).role, error: null };
    } catch {
      return { data: null, error: { message: 'Not authenticated' } };
    }
  }

  return { data: null, error: null };
};

// ─── Mock Storage ────────────────────────────────────────────────────────────

const mockStorage = {
  from: (bucket: string) => ({
    upload: async () => {
      console.warn(`[supabase-shim] Storage upload to "${bucket}" not available — use Django media upload.`);
      return { data: null, error: { message: 'Storage not available in Django mode' } };
    },
    getPublicUrl: (path: string) => ({
      data: { publicUrl: `/media/${bucket}/${path}` },
    }),
    remove: async () => ({ data: null, error: null }),
    list: async () => ({ data: [], error: null }),
  }),
};

// ─── Export the mock Supabase client ─────────────────────────────────────────

export const supabase = {
  from: (table: string) => createMockQueryBuilder(table),
  auth: mockAuth,
  rpc: mockRpc,
  storage: mockStorage,
} as any;