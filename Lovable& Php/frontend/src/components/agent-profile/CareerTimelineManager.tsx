import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Calendar, Briefcase, GraduationCap, Trophy, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEntry {
  id: string;
  year: string;
  month?: string;
  event: string;
  type: 'career' | 'achievement' | 'certification' | 'milestone';
}

interface CareerTimelineManagerProps {
  entries: TimelineEntry[];
  onChange: (entries: TimelineEntry[]) => void;
  maxEntries?: number;
}

const TIMELINE_TYPES = [
  { value: 'career', label: 'Career Event', icon: Briefcase, color: 'text-primary' },
  { value: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-amber-500' },
  { value: 'certification', label: 'Certification', icon: GraduationCap, color: 'text-emerald-500' },
  { value: 'milestone', label: 'Milestone', icon: Target, color: 'text-violet-500' },
];

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const QUICK_ADD_SUGGESTIONS: { event: string; type: TimelineEntry['type']; category: string }[] = [
  // Career Events
  { event: 'Started Insurance Career', type: 'career', category: 'Career' },
  { event: 'Joined as Corporate Agent', type: 'career', category: 'Career' },
  { event: 'Started Own Agency', type: 'career', category: 'Career' },
  { event: 'Promoted to Senior Agent', type: 'career', category: 'Career' },
  { event: 'Joined Broker Channel', type: 'career', category: 'Career' },
  // Achievements
  { event: '500+ Client Base', type: 'achievement', category: 'Achievement' },
  { event: '1000+ Client Base', type: 'achievement', category: 'Achievement' },
  { event: '100+ Claims Settled', type: 'achievement', category: 'Achievement' },
  { event: '500+ Claims Settled', type: 'achievement', category: 'Achievement' },
  { event: 'MDRT Qualifier', type: 'achievement', category: 'Achievement' },
  { event: 'MDRT 2024', type: 'achievement', category: 'Achievement' },
  { event: 'COT (Court of the Table)', type: 'achievement', category: 'Achievement' },
  { event: 'TOT (Top of the Table)', type: 'achievement', category: 'Achievement' },
  { event: 'Top Performer Award', type: 'achievement', category: 'Achievement' },
  { event: 'Star Club Member', type: 'achievement', category: 'Achievement' },
  { event: 'Chairman Club Member', type: 'achievement', category: 'Achievement' },
  // Certifications
  { event: 'Obtained Insurance License', type: 'certification', category: 'Certification' },
  { event: 'III Licentiate (LIII)', type: 'certification', category: 'Certification' },
  { event: 'III Associateship (AIII)', type: 'certification', category: 'Certification' },
  { event: 'III Fellowship (FIII)', type: 'certification', category: 'Certification' },
  { event: 'CFP Certification', type: 'certification', category: 'Certification' },
  { event: 'POS License Obtained', type: 'certification', category: 'Certification' },
  // Milestones
  { event: 'First 100 Clients', type: 'milestone', category: 'Milestone' },
  { event: 'First 100 Claims Settled', type: 'milestone', category: 'Milestone' },
  { event: '₹1 Crore Claims Settled', type: 'milestone', category: 'Milestone' },
  { event: '₹5 Crore Claims Settled', type: 'milestone', category: 'Milestone' },
  { event: '₹10 Crore Premium Collection', type: 'milestone', category: 'Milestone' },
  { event: '10 Years in Insurance', type: 'milestone', category: 'Milestone' },
  { event: '25 Years in Insurance', type: 'milestone', category: 'Milestone' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const CareerTimelineManager: React.FC<CareerTimelineManagerProps> = ({
  entries,
  onChange,
  maxEntries = 15
}) => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({
    year: new Date().getFullYear().toString(),
    month: currentMonth,
    event: '',
    type: 'career'
  });
  const [activeCategory, setActiveCategory] = useState<string>('Career');

  const isDuplicate = (event: string, type: string, year: string, month?: string) => {
    return entries.some(
      e => e.event.toLowerCase().trim() === event.toLowerCase().trim() 
        && e.type === type 
        && e.year === year 
        && (e.month || '') === (month || '')
    );
  };

  const handleAddEntry = () => {
    if (!newEntry.year || !newEntry.event || !newEntry.type) return;
    
    if (isDuplicate(newEntry.event, newEntry.type, newEntry.year, newEntry.month)) {
      return; // Silently prevent - button will be disabled
    }

    const entry: TimelineEntry = {
      id: generateId(),
      year: newEntry.year,
      month: newEntry.month,
      event: newEntry.event,
      type: newEntry.type as TimelineEntry['type']
    };
    
    const updatedEntries = [...entries, entry].sort((a, b) => {
      const yearDiff = parseInt(b.year) - parseInt(a.year);
      if (yearDiff !== 0) return yearDiff;
      return parseInt(b.month || '01') - parseInt(a.month || '01');
    });
    
    onChange(updatedEntries);
    setNewEntry({ year: '', month: '', event: '', type: 'career' });
  };

  const handleQuickAdd = (suggestion: typeof QUICK_ADD_SUGGESTIONS[0]) => {
    setNewEntry(prev => ({
      ...prev,
      event: suggestion.event,
      type: suggestion.type
    }));
  };

  const handleRemoveEntry = (id: string) => {
    onChange(entries.filter(e => e.id !== id));
  };

  const getTypeConfig = (type: string) => {
    return TIMELINE_TYPES.find(t => t.value === type) || TIMELINE_TYPES[0];
  };

  const getMonthName = (monthNum: string | undefined) => {
    if (!monthNum) return '';
    const month = MONTHS.find(m => m.value === monthNum);
    return month ? month.label.substring(0, 3) : '';
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - i);

  const categories = ['Career', 'Achievement', 'Certification', 'Milestone'];
  const filteredSuggestions = QUICK_ADD_SUGGESTIONS.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Quick Add Suggestions with category tabs */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Quick Add Suggestions</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map(cat => (
            <Button
              key={cat}
              type="button"
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 px-3"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'Career' && '💼'}
              {cat === 'Achievement' && '🏆'}
              {cat === 'Certification' && '📜'}
              {cat === 'Milestone' && '🎯'}
              {' '}{cat}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredSuggestions.map((suggestion, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleQuickAdd(suggestion)}
            >
              {suggestion.event}
            </Button>
          ))}
        </div>
      </div>

      {/* Add New Entry Form */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Month</Label>
              <Select value={newEntry.month} onValueChange={(value) => setNewEntry({ ...newEntry, month: value })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Year</Label>
              <Select value={newEntry.year} onValueChange={(value) => setNewEntry({ ...newEntry, year: value })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
              <Select value={newEntry.type} onValueChange={(value) => setNewEntry({ ...newEntry, type: value as TimelineEntry['type'] })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {TIMELINE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={cn("h-3.5 w-3.5", type.color)} />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-4">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Event / Achievement</Label>
              <Input
                value={newEntry.event}
                onChange={(e) => setNewEntry({ ...newEntry, event: e.target.value })}
                placeholder="e.g., Started Insurance Career"
                className="h-9"
                maxLength={100}
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <Button
                type="button"
                onClick={handleAddEntry}
                disabled={!newEntry.event || entries.length >= maxEntries || isDuplicate(newEntry.event || '', newEntry.type || '', newEntry.year || '', newEntry.month)}
                className="w-full h-9"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />Add
              </Button>
            </div>
          </div>
          {entries.length >= maxEntries && (
            <p className="text-xs text-amber-600 mt-2">Maximum {maxEntries} entries allowed</p>
          )}
          {newEntry.event && isDuplicate(newEntry.event, newEntry.type || '', newEntry.year || '', newEntry.month) && (
            <p className="text-xs text-destructive mt-2">⚠️ This entry already exists in your timeline</p>
          )}
        </CardContent>
      </Card>

      {/* Timeline Entries List */}
      {entries.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Your Career Timeline ({entries.length})</Label>
          <div className="relative space-y-0 border rounded-lg overflow-hidden">
            {entries.map((entry, index) => {
              const typeConfig = getTypeConfig(entry.type);
              const TypeIcon = typeConfig.icon;
              const monthName = getMonthName(entry.month);
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-background hover:bg-muted/30 transition-colors",
                    index !== entries.length - 1 && "border-b"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", "bg-muted/50")}>
                    <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      <Calendar className="h-3 w-3" />
                      {monthName ? `${monthName} ${entry.year}` : entry.year}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{entry.event}</p>
                    <p className="text-xs text-muted-foreground capitalize">{entry.type}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg border-dashed bg-muted/20">
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No timeline entries yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Use the Quick Add suggestions above to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerTimelineManager;
