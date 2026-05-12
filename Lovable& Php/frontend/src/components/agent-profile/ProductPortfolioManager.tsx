import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, HelpCircle, Plus, X } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

export interface SegmentPortfolio {
  primaryCompany: string;
  primaryPercentage: string;
  secondaryCompany: string;
  secondaryPercentage: string;
  otherCompanies: string;
  additionalCompanies?: { name: string; percentage: string }[];
}

interface ProductPortfolioManagerProps {
  segments: string[];
  values: Record<string, SegmentPortfolio>;
  onChange: (segment: string, field: keyof SegmentPortfolio, value: string) => void;
  onAddCompany?: (segment: string) => void;
  onRemoveCompany?: (segment: string, index: number) => void;
  onAdditionalCompanyChange?: (segment: string, index: number, field: 'name' | 'percentage', value: string) => void;
}

const SEGMENT_LABELS: Record<string, string> = {
  health: 'Health Insurance',
  life: 'Life Insurance',
  motor: 'Motor Insurance',
  sme: 'SME / Commercial',
};

const HEALTH_COMPANIES = [
  'Star Health', 'Care Health', 'HDFC ERGO Health', 'ICICI Lombard', 'Bajaj Allianz',
  'New India Assurance', 'Max Bupa', 'Niva Bupa', 'Aditya Birla Health', 'Tata AIG',
  'Reliance General', 'Manipal Cigna', 'Cholamandalam', 'National Insurance',
  'United India', 'Oriental Insurance', 'Other',
];

const LIFE_COMPANIES = [
  'LIC', 'HDFC Life', 'ICICI Prudential', 'SBI Life', 'Max Life', 'Bajaj Allianz Life',
  'Tata AIA', 'Kotak Life', 'Aditya Birla Sun Life', 'Reliance Nippon', 'PNB MetLife',
  'Canara HSBC', 'Exide Life', 'Aegon Life', 'Bharti AXA', 'Edelweiss Tokio',
  'Future Generali', 'India First', 'Pramerica', 'Sahara Life', 'Shriram Life',
  'Star Union Dai-ichi', 'Other',
];

const MOTOR_COMPANIES = [
  'Bajaj Allianz', 'ICICI Lombard', 'HDFC ERGO', 'Tata AIG', 'New India Assurance',
  'United India', 'National Insurance', 'Oriental Insurance', 'Reliance General',
  'Cholamandalam', 'Royal Sundaram', 'Iffco Tokio', 'SBI General', 'Future Generali',
  'Bharti AXA', 'Kotak General', 'Liberty General', 'Magma HDI', 'Raheja QBE',
  'Shriram General', 'Universal Sompo', 'Acko', 'Go Digit', 'Other',
];

const SME_COMPANIES = [
  'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'Tata AIG', 'New India Assurance',
  'United India', 'National Insurance', 'Oriental Insurance', 'Reliance General',
  'Cholamandalam', 'Royal Sundaram', 'Iffco Tokio', 'SBI General', 'Future Generali',
  'Bharti AXA', 'Kotak General', 'Liberty General', 'Universal Sompo', 'Other',
];

const getCompaniesForSegment = (segment: string): string[] => {
  switch (segment) {
    case 'health': return HEALTH_COMPANIES;
    case 'life': return LIFE_COMPANIES;
    case 'motor': return MOTOR_COMPANIES;
    case 'sme': return SME_COMPANIES;
    default: return [];
  }
};

interface CompanySelectProps {
  segment: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

const CompanySelect: React.FC<CompanySelectProps> = ({ segment, value, onChange, placeholder, label }) => {
  const companies = getCompaniesForSegment(segment);
  const isOther = value === 'Other' || (value && !companies.includes(value) && value !== '');
  const [customValue, setCustomValue] = React.useState(isOther && value !== 'Other' ? value : '');

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'Other') {
      onChange('Other');
    } else {
      onChange(newValue);
      setCustomValue('');
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomValue = e.target.value;
    setCustomValue(newCustomValue);
    if (newCustomValue.trim()) onChange(newCustomValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Select value={isOther ? 'Other' : value} onValueChange={handleSelectChange}>
        <SelectTrigger className="bg-background"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent className="bg-background z-50 max-h-[300px]">
          {companies.map((company) => (
            <SelectItem key={company} value={company}>{company}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isOther && (
        <Input placeholder="Enter company name..." value={customValue} onChange={handleCustomChange} className="mt-2" />
      )}
    </div>
  );
};

const ProductPortfolioManager: React.FC<ProductPortfolioManagerProps> = ({
  segments,
  values,
  onChange,
  onAddCompany,
  onRemoveCompany,
  onAdditionalCompanyChange,
}) => {
  if (segments.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Product Portfolio (Segment-wise)</h3>
        <InfoTooltip content="Define your primary and secondary insurance company partnerships for each segment.">
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
        </InfoTooltip>
      </div>
      <p className="text-sm text-muted-foreground">
        For each segment, specify your primary and secondary company partnerships
      </p>

      {segments.map((segment) => {
        const additionalCompanies = values[segment]?.additionalCompanies || [];
        return (
          <Card key={segment} className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{SEGMENT_LABELS[segment] || segment}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CompanySelect
                  segment={segment}
                  value={values[segment]?.primaryCompany || ''}
                  onChange={(value) => onChange(segment, 'primaryCompany', value)}
                  placeholder="Select primary company"
                  label="Primary Company Name *"
                />
                <div className="space-y-2">
                  <Label className="text-xs">Approx % of Business</Label>
                  <Input type="number" min="0" max="100" placeholder="e.g., 60"
                    value={values[segment]?.primaryPercentage || ''}
                    onChange={(e) => onChange(segment, 'primaryPercentage', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CompanySelect
                  segment={segment}
                  value={values[segment]?.secondaryCompany || ''}
                  onChange={(value) => onChange(segment, 'secondaryCompany', value)}
                  placeholder="Select secondary company"
                  label="Secondary Company Name"
                />
                <div className="space-y-2">
                  <Label className="text-xs">Approx % of Business</Label>
                  <Input type="number" min="0" max="100" placeholder="e.g., 25"
                    value={values[segment]?.secondaryPercentage || ''}
                    onChange={(e) => onChange(segment, 'secondaryPercentage', e.target.value)} />
                </div>
              </div>

              {/* Additional Companies */}
              {additionalCompanies.map((comp: { name: string; percentage: string }, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-xs">Company {idx + 3}</Label>
                    <Input placeholder="Company name"
                      value={comp.name}
                      onChange={(e) => onAdditionalCompanyChange?.(segment, idx, 'name', e.target.value)} />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="space-y-2 flex-1">
                      <Label className="text-xs">Approx % of Business</Label>
                      <Input type="number" min="0" max="100" placeholder="e.g., 10"
                        value={comp.percentage}
                        onChange={(e) => onAdditionalCompanyChange?.(segment, idx, 'percentage', e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive"
                      onClick={() => onRemoveCompany?.(segment, idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" className="gap-1.5"
                onClick={() => onAddCompany?.(segment)}>
                <Plus className="h-3.5 w-3.5" />
                Add More Companies
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductPortfolioManager;
