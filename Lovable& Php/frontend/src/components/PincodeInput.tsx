import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPinned, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveSeekerDetails } from '@/components/SeekerDetailsPopup';

export interface PincodeDetails {
  pincode: string;
  area: string;      // Post office name
  city: string;      // District
  state: string;
  country: string;
  branchType?: string;
  deliveryStatus?: string;
}

interface PincodeInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (pincode: string) => void;
  onResolved?: (details: PincodeDetails | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showAreaList?: boolean; // Show all post offices for that pincode
  disabled?: boolean;
  /** Persist resolved pincode/area/city/state to shared seekerDetails store. Default true. */
  persist?: boolean;
}

interface PostOffice {
  Name: string;
  BranchType: string;
  DeliveryStatus: string;
  District: string;
  State: string;
  Country: string;
  Pincode: string;
}

const cache = new Map<string, PostOffice[] | null>();

/**
 * Standalone Pincode input for India.
 * Validates 6-digit pincode and resolves area/city/state via India Post API.
 * Free, no API key required.
 */
const PincodeInput: React.FC<PincodeInputProps> = ({
  id,
  label = 'Pin Code',
  value,
  onChange,
  onResolved,
  placeholder = 'e.g., 400058',
  className,
  required,
  showAreaList = false,
  disabled,
  persist = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPo, setSelectedPo] = useState<string>('');
  const lastFetched = useRef<string>('');

  const lookup = useCallback(async (pin: string) => {
    if (cache.has(pin)) {
      const cached = cache.get(pin) || [];
      setPostOffices(cached);
      handleResolve(cached, cached[0]?.Name || '');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length) {
        const offices: PostOffice[] = data[0].PostOffice;
        cache.set(pin, offices);
        setPostOffices(offices);
        handleResolve(offices, offices[0].Name);
      } else {
        cache.set(pin, null);
        setPostOffices([]);
        setError('Invalid pincode');
        onResolved?.(null);
      }
    } catch {
      setError('Could not verify pincode');
      onResolved?.(null);
    } finally {
      setLoading(false);
    }
  }, [onResolved]);

  const handleResolve = (offices: PostOffice[], poName: string) => {
    const po = offices.find(o => o.Name === poName) || offices[0];
    if (!po) { onResolved?.(null); return; }
    setSelectedPo(po.Name);
    const details: PincodeDetails = {
      pincode: po.Pincode,
      area: po.Name,
      city: po.District,
      state: po.State,
      country: po.Country,
      branchType: po.BranchType,
      deliveryStatus: po.DeliveryStatus,
    };
    if (persist) {
      saveSeekerDetails({
        pincode: details.pincode,
        area: details.area,
        city: details.city,
        state: details.state,
        country: details.country,
      });
    }
    onResolved?.(details);
  };

  useEffect(() => {
    if (value.length === 6 && /^\d{6}$/.test(value) && lastFetched.current !== value) {
      lastFetched.current = value;
      lookup(value);
    } else if (value.length < 6) {
      setPostOffices([]);
      setError(null);
    }
  }, [value, lookup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(v);
  };

  const primary = postOffices[0];
  const isValid = !!primary && !error;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1.5">
          <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-10 text-sm pr-9',
            error && 'border-destructive focus-visible:ring-destructive',
            isValid && 'border-green-500/60'
          )}
          aria-invalid={!!error}
          aria-describedby={id ? `${id}-status` : undefined}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!loading && isValid && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {!loading && error && <AlertCircle className="h-4 w-4 text-destructive" />}
        </div>
      </div>

      {error && (
        <p id={id ? `${id}-status` : undefined} className="text-xs text-destructive">
          {error}
        </p>
      )}

      {!error && primary && !showAreaList && (
        <p id={id ? `${id}-status` : undefined} className="text-xs text-muted-foreground">
          📍 {primary.Name}, {primary.District}, {primary.State}
        </p>
      )}

      {!error && showAreaList && postOffices.length > 1 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Select your area</Label>
          <select
            value={selectedPo}
            onChange={(e) => handleResolve(postOffices, e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {postOffices.map((po) => (
              <option key={po.Name} value={po.Name}>
                {po.Name} ({po.BranchType})
              </option>
            ))}
          </select>
          {postOffices[0] && (
            <p className="text-xs text-muted-foreground">
              {postOffices[0].District}, {postOffices[0].State}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PincodeInput;
