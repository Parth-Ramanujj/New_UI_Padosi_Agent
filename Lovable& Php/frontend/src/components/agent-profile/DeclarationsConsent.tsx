import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface DeclarationsConsentProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

const DeclarationsConsent: React.FC<DeclarationsConsentProps> = ({
  accepted,
  onAcceptChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">Declarations & Consent</h3>
      </div>

      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
        <li>All information is self-declared and accurate to the best of my knowledge</li>
        <li>PadosiAgent is a facilitation platform — leads and business are not guaranteed</li>
        <li>No commission is charged on policies sold or claims processed</li>
        <li>Disputes subject to jurisdiction of courts in Ahmedabad, Gujarat</li>
      </ul>

      <div className="flex items-start space-x-3 pt-2 border-t">
        <Checkbox
          id="accept-all"
          checked={accepted}
          onCheckedChange={(checked) => onAcceptChange(checked === true)}
          className="mt-1"
        />
        <Label
          htmlFor="accept-all"
          className="text-sm font-medium cursor-pointer leading-relaxed"
        >
          I agree to all declarations,{' '}
          <a href="/terms" className="text-primary underline" target="_blank">Terms</a>{' '}
          &{' '}
          <a href="/privacy" className="text-primary underline" target="_blank">Privacy Policy</a>
        </Label>
      </div>
    </div>
  );
};

export default DeclarationsConsent;
