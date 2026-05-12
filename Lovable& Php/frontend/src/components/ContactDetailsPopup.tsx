import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, PhoneCall, Loader2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { z } from 'zod';
import { getSavedSeekerDetails, saveSeekerDetails } from './SeekerDetailsPopup';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

interface ContactDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  agentName: string;
  contactMethod: 'call' | 'whatsapp' | 'social' | 'review';
}

const ContactDetailsPopup: React.FC<ContactDetailsPopupProps> = ({
  isOpen, onClose, onSubmit, agentName, contactMethod
}) => {
  const saved = getSavedSeekerDetails();
  const { user } = useAuth();
  const [name, setName] = useState(saved?.name || user?.name || '');
  const [email, setEmail] = useState(saved?.email || user?.email || '');
  const [phone, setPhone] = useState(saved?.phone || user?.phone || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Auto-login returning user: if saved details match, try silent login
  useEffect(() => {
    if (!isOpen || user) return;
    const savedDetails = getSavedSeekerDetails();
    if (savedDetails?.email && savedDetails?.phone && savedDetails?.name) {
      // Try auto-login with saved credentials
      setIsRegistering(true);
      supabase.auth.signInWithPassword({
        email: savedDetails.email,
        password: savedDetails.phone,
      }).then(({ error }) => {
        if (!error) {
          toast.success(`Welcome back, ${savedDetails.name}! 👋`);
          // Pre-fill and auto-submit
          onSubmit({ name: savedDetails.name, email: savedDetails.email, phone: savedDetails.phone });
        }
      }).catch(() => {}).finally(() => setIsRegistering(false));
    }
  }, [isOpen]);

  const getTitle = () => {
    switch (contactMethod) {
      case 'whatsapp': return `WhatsApp ${agentName}`;
      case 'call': return `Call ${agentName}`;
      case 'social': return `View ${agentName}'s Profile`;
      case 'review': return `Review ${agentName}`;
    }
  };

  const getIcon = () => {
    switch (contactMethod) {
      case 'whatsapp': return <FaWhatsapp className="h-5 w-5" />;
      case 'review': return <User className="h-5 w-5" />;
      default: return <PhoneCall className="h-5 w-5" />;
    }
  };

  const getButtonText = () => {
    switch (contactMethod) {
      case 'whatsapp': return 'Open WhatsApp';
      case 'call': return 'Call Now';
      case 'social': return 'Continue';
      case 'review': return 'Continue to Review';
    }
  };

  const getGradient = () => {
    return contactMethod === 'whatsapp'
      ? 'bg-gradient-to-r from-green-600 to-green-500'
      : 'bg-gradient-to-r from-primary to-primary/80';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse({ name, email, phone });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Save contact details to seeker storage
    saveSeekerDetails({ name, email, phone, pincode: saved?.pincode || '' });

    // Auto-register or auto-login user if not logged in
    if (!user) {
      setIsRegistering(true);
      try {
        // First try to sign in (returning user)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: phone,
        });

        if (signInError) {
          // Not an existing user or wrong password — try signup
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: phone,
            options: {
              data: {
                full_name: name,
                phone: phone,
                role: 'user',
              },
            },
          });

          if (signUpError) {
            if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
              // User exists but with different password — silent continue
              console.warn('User exists with different credentials');
            } else {
              console.warn('Auto-register failed:', signUpError.message);
            }
          } else if (signUpData.session) {
            toast.success(`Account created! Welcome, ${name}! 🎉`);
          }
        } else {
          // Successfully signed in — returning user
          toast.success(`Welcome back, ${name}! 👋`);
        }
      } catch (err) {
        console.warn('Auto-register error:', err);
      } finally {
        setIsRegistering(false);
      }
    }

    onSubmit({ name, email, phone });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md mx-auto rounded-2xl border-0 shadow-2xl bg-card p-0 overflow-hidden">
        <div className={`px-5 py-4 sm:px-6 sm:py-5 ${getGradient()}`}>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs sm:text-sm mt-1">
              Share your details so the agent can serve you better
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 sm:px-6 sm:py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              maxLength={100}
            />
            {errors.name && <p className="text-destructive text-[11px]">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              maxLength={255}
            />
            {errors.email && <p className="text-destructive text-[11px]">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                +91
              </span>
              <Input
                id="contact-phone"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="h-11 rounded-l-none"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="text-destructive text-[11px]">{errors.phone}</p>}
          </div>

          <Button
            type="submit"
            disabled={isRegistering}
            className={`w-full h-12 text-base font-bold shadow-lg ${contactMethod === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isRegistering ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Setting up...</>
            ) : contactMethod === 'whatsapp' ? (
              <><FaWhatsapp className="h-5 w-5 mr-2" /> {getButtonText()}</>
            ) : (
              <><PhoneCall className="h-5 w-5 mr-2" /> {getButtonText()}</>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            🔒 Your details are shared only with {agentName} to help serve you better.
            {!user && ' An account will be created for you automatically.'}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsPopup;
