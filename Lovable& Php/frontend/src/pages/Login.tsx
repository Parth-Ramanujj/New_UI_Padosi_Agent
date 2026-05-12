import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, Users, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFriendlyAuthError, isBackendConfigured } from '@/lib/authErrors';
import logo from '@/assets/padosi-agent-logo-new.png';

type LoginTab = 'user' | 'agent' | 'distributor';

const TAB_CONFIG = {
  agent: { title: 'PadosiAgent Login', description: 'Sign in to manage your leads, profile & analytics', registerLink: '/register?type=agent', registerText: 'Become a PadosiAgent', icon: Shield },
  distributor: { title: 'Distributor Login', description: 'Sign in to manage your agent network', registerLink: '/register?type=distributor', registerText: 'Become a Distributor', icon: Users },
  user: { title: 'Welcome Back', description: 'Sign in to find the best insurance agents', registerLink: '/register?type=user', registerText: 'Create an account', icon: CheckCircle },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<LoginTab>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<LoginTab | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const config = TAB_CONFIG[userType];
  const from = (location.state as any)?.from?.pathname || '/';

  const navigateByRole = (role: LoginTab) => {
    switch (role) {
      case 'agent': navigate('/agent-dashboard'); break;
      case 'distributor': navigate('/distributor-dashboard'); break;
      default: navigate('/client-dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigateByRole(userType);
    } catch (error) {
      console.error('Login error', error);
      const friendly = getFriendlyAuthError(error);
      toast.error(friendly.title, { description: friendly.description });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (type: LoginTab) => {
    if (!isBackendConfigured()) {
      const friendly = getFriendlyAuthError(new Error('missing env'));
      toast.error(friendly.title, { description: friendly.description });
      return;
    }
    setIsDemoLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke('demo-login', {
        body: { type },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data?.session) {
        await supabase.auth.setSession(data.session);
        // Verify the session actually works (catches 401 on follow-up calls)
        const { error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        toast.success(`Logged in as demo ${type}!`);
        navigateByRole(type);
      }
    } catch (error: any) {
      console.error('Demo login error:', error);
      const friendly = getFriendlyAuthError(error);
      toast.error(friendly.title, { description: friendly.description });
    } finally {
      setIsDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-6">
            <img src={logo} alt="PadosiAgent" className="h-10 sm:h-12 mx-auto mb-3 mix-blend-multiply" />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Licensed Platform</span>
              <span className="text-border">•</span>
              <span>100% Free</span>
            </div>
          </div>

          {!isBackendConfigured() && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Backend not configured in this preview</AlertTitle>
              <AlertDescription className="text-xs">
                The preview is using a placeholder API key. Hard-refresh (Cmd/Ctrl+Shift+R) or open the published URL — your code is fine, only the preview env is stale.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border border-border/60 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold">{config.title}</CardTitle>
              <CardDescription className="text-sm">{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={userType} onValueChange={(val) => setUserType(val as LoginTab)}>
                <TabsList className="grid grid-cols-3 mb-6 h-11">
                  <TabsTrigger value="user" className="text-xs sm:text-sm">End User</TabsTrigger>
                  <TabsTrigger value="agent" className="text-xs sm:text-sm">PadosiAgent</TabsTrigger>
                  <TabsTrigger value="distributor" className="text-xs sm:text-sm">Distributor</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="email" type="email" placeholder="your@email.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      required disabled={isSubmitting} className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {userType === 'user' ? 'Password (Your Mobile Number)' : 'Password'}
                      </Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" type={showPassword ? 'text' : 'password'}
                        placeholder={userType === 'user' ? 'Enter your 10-digit mobile number' : 'Enter your password'}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        required disabled={isSubmitting} className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-accent font-bold text-base shadow-lg hover:shadow-xl cta-glow cta-ripple tap-feedback animate-pulse-glow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Login'}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              {/* Demo Login */}
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-card text-muted-foreground">Or try demo account</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full">
                {(['user', 'agent', 'distributor'] as const).map((type) => (
                  <Button 
                    key={type}
                    variant="outline" size="sm"
                    onClick={() => handleDemoLogin(type)}
                    disabled={isDemoLoading !== null}
                    className="text-xs h-9 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    {isDemoLoading === type ? 'Loading...' : type === 'user' ? 'User Demo' : type === 'agent' ? 'Agent Demo' : 'Distributor'}
                  </Button>
                ))}
              </div>

              <div className="w-full pt-4 border-t">
                <p className="text-center text-sm text-muted-foreground mb-3">Don't have an account?</p>
                <Link to={config.registerLink} className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-base cta-glow tap-feedback"
                  >
                    {config.registerText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>No Spam Calls</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary" />
              <span>Data Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
