import React from 'react';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

interface FormFieldWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  helperText?: string;
}

const FormFieldWithTooltip: React.FC<FormFieldWithTooltipProps> = ({
  label,
  tooltip,
  required = false,
  htmlFor,
  children,
  helperText,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <InfoTooltip content={tooltip}>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
        </InfoTooltip>
      </div>
      {children}
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

export default FormFieldWithTooltip;
