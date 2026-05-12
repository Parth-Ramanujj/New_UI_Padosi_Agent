import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, LocateFixed, Building2, Hash, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    amenity?: string;
    building?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    city_district?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    county?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPincodeDetected?: (pincode: string) => void;
  onDetailedAddress?: (details: {
    flatNumber: string;
    society: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  id,
  value,
  onChange,
  onPincodeDetected,
  onDetailedAddress,
  className,
}) => {
  const [flatNumber, setFlatNumber] = useState('');
  const [society, setSociety] = useState('');
  const [pincode, setPincode] = useState('');

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [postalArea, setPostalArea] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize from existing value
  useEffect(() => {
    if (value && !initializedRef.current) {
      initializedRef.current = true;
      const parts = value.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        setFlatNumber(parts[0] || '');
        const remaining = parts.slice(1);
        const lastPart = remaining[remaining.length - 1];
        const pincodeMatch = lastPart?.match(/\d{6}/);
        if (pincodeMatch) {
          setPincode(pincodeMatch[0]);
          remaining[remaining.length - 1] = lastPart.replace(/\s*-?\s*\d{6}/, '').trim();
        }
        setSociety(remaining.filter(Boolean).join(', '));
      } else if (parts.length === 2) {
        setFlatNumber(parts[0] || '');
        setSociety(parts[1] || '');
      } else {
        setSociety(value);
      }
    }
  }, [value]);

  // Compose and notify parent
  const composeAddress = useCallback(() => {
    const parts: string[] = [];
    if (flatNumber.trim()) parts.push(flatNumber.trim());
    if (society.trim()) parts.push(society.trim());
    if (pincode.trim()) parts.push(pincode.trim());
    const full = parts.join(', ');
    onChange(full);
    if (onDetailedAddress) {
      onDetailedAddress({
        flatNumber: flatNumber.trim(),
        society: society.trim(),
        area: '',
        city: '',
        state: '',
        pincode: pincode.trim(),
        fullAddress: full,
      });
    }
  }, [flatNumber, society, pincode, onChange, onDetailedAddress]);

  useEffect(() => {
    if (initializedRef.current) composeAddress();
  }, [flatNumber, society, pincode]);

  // Nominatim autocomplete for society field
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) { setSuggestions([]); return; }
    setIsLoading(true);
    try {
      const q = query.includes('India') ? query : `${query}, India`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'PadosiAgent/1.0' } }
      );
      const data = await res.json();
      setSuggestions(data || []);
      setShowSuggestions(data?.length > 0);
    } catch { setSuggestions([]); }
    finally { setIsLoading(false); }
  }, []);

  // India Post pincode lookup
  const fetchPincode = useCallback(async (pin: string) => {
    if (pin.length !== 6) { setPostalArea(''); return; }
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0];
        setPostalArea(`${po.Name}, ${po.District}, ${po.State}`);
      } else { setPostalArea(''); }
    } catch { setPostalArea(''); }
    finally { setPincodeLoading(false); }
  }, []);

  const handleSocietyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSociety(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (onPincodeDetected && val.length === 6) onPincodeDetected(val);
    if (val.length === 6) fetchPincode(val);
    else setPostalArea('');
  };

  const handleSelect = (s: Suggestion) => {
    const a = s.address;
    const buildingName = a.amenity || a.building || '';
    const area = a.neighbourhood || a.suburb || a.road || '';
    const city = a.city || a.town || a.village || a.city_district || a.state_district || '';
    const state = a.state || '';
    const parts = [buildingName, area, city, state].filter(Boolean);
    setSociety(parts.join(', '));
    if (a.postcode) {
      const pin = a.postcode.replace(/\D/g, '').slice(0, 6);
      setPincode(pin);
      if (onPincodeDetected) onPincodeDetected(pin);
      fetchPincode(pin);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // GPS auto-detect
  const handleGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'PadosiAgent/1.0' } }
          );
          const { address: a = {} } = await res.json();
          const buildingName = a.amenity || a.building || '';
          const area = a.neighbourhood || a.suburb || a.road || '';
          const city = a.city || a.town || a.village || a.city_district || a.state_district || '';
          const state = a.state || '';
          const parts = [buildingName, area, city, state].filter(Boolean);
          setSociety(parts.join(', '));
          if (a.postcode) {
            const pin = a.postcode.replace(/\D/g, '').slice(0, 6);
            setPincode(pin);
            if (onPincodeDetected) onPincodeDetected(pin);
            fetchPincode(pin);
          }
        } catch {} finally { setGpsLoading(false); }
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div ref={containerRef} className={cn('space-y-3', className)}>
      {/* 1. Manual: Flat / Block / Shop */}
      <div className="space-y-1">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          Flat / Block / Shop No.
        </Label>
        <Input
          id={id ? `${id}-flat` : undefined}
          placeholder="e.g., Flat 101, Block B, Shop 5"
          value={flatNumber}
          onChange={(e) => setFlatNumber(e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* 2. Society / Address - auto-detect + editable */}
      <div className="space-y-1 relative">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          Society / Building, Area, City, State
        </Label>
        <div className="relative">
          <Input
            id={id ? `${id}-society` : undefined}
            placeholder="e.g., Harmony Residency, Prahlad Nagar, Ahmedabad, Gujarat"
            value={society}
            onChange={handleSocietyChange}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="h-10 text-sm pr-16"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <button
              type="button"
              onClick={handleGps}
              disabled={gpsLoading}
              className="p-1.5 rounded-md hover:bg-accent text-primary transition-colors"
              title="Auto-detect location via GPS"
            >
              <LocateFixed className={cn("h-4 w-4", gpsLoading && "animate-pulse")} />
            </button>
          </div>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[180px] overflow-y-auto">
            {suggestions.map((s, i) => {
              const a = s.address;
              const primary = a.amenity || a.building || a.road || a.neighbourhood || s.display_name.split(',')[0];
              const secondary = [a.city || a.town || a.village, a.state].filter(Boolean).join(', ');
              return (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent flex items-start gap-2 text-sm border-b last:border-b-0 border-border/50"
                  onClick={() => handleSelect(s)}
                >
                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate text-xs">{primary}</div>
                    {secondary && <div className="text-xs text-muted-foreground truncate">{secondary}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Pincode - auto-detect + editable */}
      <div className="space-y-1">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
          Pin Code
        </Label>
        <div className="relative">
          <Input
            id={id ? `${id}-pincode` : undefined}
            placeholder="e.g., 400058"
            value={pincode}
            onChange={handlePincodeChange}
            maxLength={6}
            className="h-10 text-sm pr-8"
          />
          {pincodeLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {postalArea && (
          <p className="text-xs text-primary/80 mt-0.5">📍 {postalArea}</p>
        )}
      </div>
    </div>
  );
};

export default AddressAutocomplete;
