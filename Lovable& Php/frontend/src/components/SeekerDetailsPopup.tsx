import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Shield } from 'lucide-react';

interface SeekerDetailsPopupProps {
  isOpen: boolean;
  onSubmit: (data: { pincode: string; useGps: boolean }) => void;
}

const SEEKER_STORAGE_KEY = 'seekerDetails';

export const getSavedSeekerDetails = () => {
  try {
    const saved = localStorage.getItem(SEEKER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export const saveSeekerDetails = (data: {
  name?: string;
  email?: string;
  phone?: string;
  pincode?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
}) => {
  const existing = getSavedSeekerDetails() || {};
  localStorage.setItem(
    SEEKER_STORAGE_KEY,
    JSON.stringify({ ...existing, ...data, timestamp: Date.now() })
  );
};

const SeekerDetailsPopup: React.FC<SeekerDetailsPopupProps> = ({ isOpen, onSubmit }) => {
  const [pincode, setPincode] = useState('');
  const [useGps, setUseGps] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!useGps && !pincode) {
      setErrors({ pincode: 'Please enter PIN code or use GPS' });
      return;
    }

    if (!useGps && pincode && !/^\d{6}$/.test(pincode)) {
      setErrors({ pincode: 'Enter a valid 6-digit PIN code' });
      return;
    }

    saveSeekerDetails({ pincode });
    onSubmit({ pincode, useGps });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, pincode: 'GPS not supported on this device' }));
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setUseGps(true);
        setPincode('');
        setGpsLoading(false);
        setErrors(prev => { const { pincode: _, ...rest } = prev; return rest; });
      },
      () => {
        setGpsLoading(false);
        setErrors(prev => ({ ...prev, pincode: 'GPS access denied. Please enter PIN code.' }));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md mx-auto rounded-2xl border-0 shadow-2xl bg-card p-0 overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 sm:px-6 sm:py-5">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-primary-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Find Your Padosi Agent
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-xs sm:text-sm mt-1">
              Agents can serve you better when they are your Padosi! Share your location to find nearby agents.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 sm:px-6 sm:py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Your Location <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setUseGps(false);
                }}
                className={`h-11 flex-1 ${useGps ? 'opacity-50' : ''}`}
                maxLength={6}
                disabled={useGps}
              />
              <Button
                type="button"
                variant={useGps ? 'default' : 'outline'}
                className="h-11 px-3 flex-shrink-0"
                onClick={handleUseGps}
                disabled={gpsLoading}
              >
                <Navigation className={`h-4 w-4 mr-1.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading ? 'Getting...' : useGps ? 'GPS ✓' : 'Use GPS'}
              </Button>
            </div>
            {errors.pincode && <p className="text-destructive text-[11px]">{errors.pincode}</p>}
            {useGps && <p className="text-accent text-[11px] font-medium">📍 GPS location will be used</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold cta-glow tap-feedback shadow-lg"
          >
            Find Agents Near Me
          </Button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            🔒 Your location is only used to find nearby agents. We'll ask for contact details when you're ready to connect.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SeekerDetailsPopup;
