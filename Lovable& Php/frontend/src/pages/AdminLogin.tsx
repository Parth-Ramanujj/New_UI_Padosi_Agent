import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFriendlyAuthError, isBackendConfigured } from '@/lib/authErrors';
import logo from '@/assets/padosi-agent-logo-new.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Verify the user actually has admin role via the current-user RPC
      const { data: currentRole, error: roleError } = await supabase
        .rpc('get_current_user_role');

      if (roleError) throw roleError;

      if (currentRole !== 'admin') {
        await supabase.auth.signOut();
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error: any) {
      console.error('Admin login error:', error.message);
      const friendly = getFriendlyAuthError(error);
      toast.error(friendly.title, { description: friendly.description });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setIsDemoLoading(true);
    if (!isBackendConfigured()) {
      const friendly = getFriendlyAuthError(new Error('missing env'));
      toast.error(friendly.title, { description: friendly.description });
      setIsDemoLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('demo-login', {
        body: { type: 'admin' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.session) {
        await supabase.auth.setSession(data.session);
        const { error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        toast.success('Demo admin login successful!');
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Demo admin login error:', error);
      const friendly = getFriendlyAuthError(error);
      toast.error(friendly.title, { description: friendly.description });
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-destructive/5 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="PadosiAgent" className="h-10 mx-auto mb-3 mix-blend-multiply" />
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-destructive" />
            <span>Restricted Access</span>
          </div>
        </div>

        {!isBackendConfigured() && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Backend not configured</AlertTitle>
            <AlertDescription className="text-xs">
              Preview is using a placeholder API key. Hard-refresh (Cmd/Ctrl+Shift+R) or use the published URL.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border border-destructive/20 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold">Admin Portal</CardTitle>
            <CardDescription className="text-sm">Sign in with admin credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-destructive hover:bg-destructive/90 font-bold text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Sign In'}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            
            {/* Demo Admin Login */}
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground">Or use demo</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 h-10 border-destructive/30 text-destructive hover:bg-destructive/5"
              onClick={handleDemoAdminLogin}
              disabled={isDemoLoading || isSubmitting}
            >
              {isDemoLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
              {isDemoLoading ? 'Loading Demo...' : 'Demo Admin Login'}
            </Button>
            </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          This page is for authorized administrators only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
