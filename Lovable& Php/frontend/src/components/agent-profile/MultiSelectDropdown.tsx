import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowOther?: boolean;
  className?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  allowOther = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const addOther = () => {
    if (otherValue.trim() && !selected.includes(otherValue.trim())) {
      onChange([...selected, otherValue.trim()]);
      setOtherValue('');
    }
  };

  const customOptions = selected.filter((s) => !options.includes(s));

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((option) => (
            <Badge
              key={option}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {option}
              <button
                type="button"
                onClick={() => removeOption(option)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal"
          >
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2 min-w-[250px]" align="start">
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => toggleOption(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <Label className="text-sm font-normal cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}

            {/* Custom options */}
            {customOptions.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => toggleOption(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <Label className="text-sm font-normal cursor-pointer flex-1 italic">
                  {option} (custom)
                </Label>
              </div>
            ))}

            {/* Add other */}
            {allowOther && (
              <div className="pt-2 border-t mt-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add other..."
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOther();
                      }
                    }}
                    className="text-sm h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addOther}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectDropdown;
