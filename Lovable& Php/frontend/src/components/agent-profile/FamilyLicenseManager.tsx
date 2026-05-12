import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Users, HelpCircle } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

export interface FamilyLicense {
  id: string;
  name: string;
  relationship: string;
  licenseNumber: string;
}

interface FamilyLicenseManagerProps {
  licenses: FamilyLicense[];
  onChange: (licenses: FamilyLicense[]) => void;
}

const RELATIONSHIPS = [
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Other',
];

const FamilyLicenseManager: React.FC<FamilyLicenseManagerProps> = ({
  licenses,
  onChange,
}) => {
  const addLicense = () => {
    onChange([
      ...licenses,
      {
        id: crypto.randomUUID(),
        name: '',
        relationship: '',
        licenseNumber: '',
      },
    ]);
  };

  const removeLicense = (id: string) => {
    onChange(licenses.filter((l) => l.id !== id));
  };

  const updateLicense = (id: string, field: keyof FamilyLicense, value: string) => {
    onChange(
      licenses.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Family / Additional Licenses
          </Label>
          <InfoTooltip content="Add licenses of family members or associates who work with you. This helps customers know your team">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
          </InfoTooltip>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLicense}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {licenses.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No additional licenses added. Click "Add Member" to add family licenses.
        </p>
      )}

      {licenses.map((license, index) => (
        <Card key={license.id} className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${license.id}`} className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id={`name-${license.id}`}
                    placeholder="Name as per license"
                    value={license.name}
                    onChange={(e) => updateLicense(license.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`relationship-${license.id}`} className="text-xs">
                    Relationship
                  </Label>
                  <Select
                    value={license.relationship}
                    onValueChange={(val) => updateLicense(license.id, 'relationship', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`license-${license.id}`} className="text-xs">
                    PAN / License #
                  </Label>
                  <Input
                    id={`license-${license.id}`}
                    placeholder="License number"
                    value={license.licenseNumber}
                    onChange={(e) => updateLicense(license.id, 'licenseNumber', e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLicense(license.id)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FamilyLicenseManager;
