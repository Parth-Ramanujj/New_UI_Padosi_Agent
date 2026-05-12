/**
 * AuthContext.tsx — Authentication context backed by Django REST API.
 *
 * Replaces the Supabase-based AuthContext with session-based auth
 * powered by the Django backend at /api/accounts/*.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { authApi, type UserData, ApiError } from '@/lib/api';

type UserRole = 'user' | 'agent' | 'client' | 'distributor' | 'admin';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'user' | 'agent' | 'distributor';
  subscription_plan?: string;
  company_name?: string;
  insurance_segments?: string[];
  years_experience?: string;
  client_base?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/** Map Django role strings to the frontend's UserRole type. */
function mapRole(djangoRole: string): UserRole {
  switch (djangoRole) {
    case 'agent': return 'agent';
    case 'client': return 'user';       // Django "client" → frontend "user"
    case 'admin': return 'admin';
    case 'distributor': return 'distributor';
    default: return 'user';
  }
}

/** Convert Django UserData to frontend User shape. */
function toUser(data: UserData): User {
  return {
    id: data.id,
    email: data.email,
    name: data.fullname,
    role: mapRole(data.role),
    isVerified: !!data.email_verified_at,
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Check existing session on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const data = await authApi.me();
        if (!cancelled) {
          setUser(toUser(data));
        }
      } catch {
        // Not authenticated — that's fine
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    // Safety timeout: never block the UI for longer than 4s
    const timer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 4000);

    checkSession().finally(() => clearTimeout(timer));

    return () => { cancelled = true; };
  }, []);

  // ── Login ────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setUser(toUser(res.user));
      toast.success("Login successful!");
    } catch (error: unknown) {
      const msg = error instanceof ApiError ? error.message : 'Login failed.';
      console.error('Login error:', error);
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Map frontend role to Django role
      const djangoRole = userData.role === 'user' ? 'client' : userData.role;

      const res = await authApi.register({
        fullname: userData.name,
        email: userData.email,
        password: userData.password,
        role: djangoRole as 'agent' | 'client' | 'distributor',
        phone: userData.phone,
        company_name: userData.company_name,
      });
      setUser(toUser(res.user));
      toast.success("Registration successful!");
    } catch (error: unknown) {
      const msg = error instanceof ApiError ? error.message : 'Registration failed.';
      console.error('Registration error:', error);
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.info("You have been logged out.");
    } catch (error: unknown) {
      console.error('Logout error:', error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
