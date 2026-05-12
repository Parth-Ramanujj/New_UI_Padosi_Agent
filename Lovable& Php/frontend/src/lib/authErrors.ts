/**
 * User-friendly error messages for auth/API failures.
 * Updated for Django backend — no longer checks Supabase env vars.
 */

export interface FriendlyAuthError {
  title: string;
  description: string;
  isConfigIssue: boolean;
}

/**
 * Always returns true when using Django backend.
 * The backend is configured if the Vite dev server can proxy to Django.
 */
export function isBackendConfigured(): boolean {
  return true;
}

export function getFriendlyAuthError(error: unknown): FriendlyAuthError {
  const err = error as any;
  const status: number | undefined = err?.status ?? err?.statusCode;
  const message: string = err?.message || err?.error_description || String(error || '');
  const lower = message.toLowerCase();

  if (status === 401 || lower.includes('invalid credentials')) {
    return {
      title: 'Authentication failed',
      description:
        'Invalid email or password. Please check your credentials and try again.',
      isConfigIssue: false,
    };
  }

  if (status === 403 || lower.includes('forbidden') || lower.includes('not allowed')) {
    return {
      title: 'Access denied',
      description:
        'Your account does not have permission for this action. Please use the correct login type for your account.',
      isConfigIssue: false,
    };
  }

  if (status === 400) {
    return {
      title: 'Invalid request',
      description: message || 'Please check your input and try again.',
      isConfigIssue: false,
    };
  }

  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return {
      title: 'Network error',
      description:
        'Could not reach the server. Make sure the Django backend is running on port 8000.',
      isConfigIssue: true,
    };
  }

  return {
    title: 'Something went wrong',
    description: message || 'An unexpected error occurred. Please try again.',
    isConfigIssue: false,
  };
}
