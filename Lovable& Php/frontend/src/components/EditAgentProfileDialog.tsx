import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Pencil, Plus, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CoverPageSelector from '@/components/CoverPageSelector';
import { agentProfileSchema } from '@/lib/validation';

// Field length limits
const FIELD_LIMITS = {
  name: 100,
  phone: 20,
  whatsapp: 20,
  experience: 50,
  bio: 2000,
  image: 500,
  socialLink: 200,
  specialization: 50,
  language: 30,
  certification: 100,
};

interface AgentData {
  id: string | number;
  name: string;
  phone: string;
  whatsapp: string;
  image: string;
  experience: string;
  bio: string;
  coverPage?: string;
  specializations: string[];
  languages: string[];
  certifications: string[];
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  stats: {
    clientsServed: string;
    claimsProcessed: string;
    claimsSettled: number;
    claimsAmount: string;
    successRate: string;
    responseTime: string;
  };
}

interface EditAgentProfileDialogProps {
  agent: AgentData;
  onSave: (updatedAgent: AgentData) => void;
}

const EditAgentProfileDialog: React.FC<EditAgentProfileDialogProps> = ({ agent, onSave }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AgentData>(agent);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string, maxLength?: number) => {
    // Enforce max length
    const limit = maxLength || FIELD_LIMITS[field as keyof typeof FIELD_LIMITS] || 255;
    if (value.length <= limit) {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  };

  const handleStatsChange = (field: string, value: string) => {
    // Stats values should be reasonable length
    if (value.length <= 50) {
      setFormData(prev => ({
        ...prev,
        stats: { ...prev.stats, [field]: value }
      }));
    }
  };

  const handleSocialChange = (field: string, value: string) => {
    if (value.length <= FIELD_LIMITS.socialLink) {
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }));
    }
  };

  const addItem = (type: 'specializations' | 'languages' | 'certifications', value: string, setValue: (v: string) => void) => {
    const trimmedValue = value.trim();
    const limits = {
      specializations: { itemLimit: FIELD_LIMITS.specialization, arrayLimit: 20 },
      languages: { itemLimit: FIELD_LIMITS.language, arrayLimit: 10 },
      certifications: { itemLimit: FIELD_LIMITS.certification, arrayLimit: 20 },
    };
    
    const { itemLimit, arrayLimit } = limits[type];
    
    if (trimmedValue && 
        trimmedValue.length <= itemLimit && 
        !formData[type].includes(trimmedValue) &&
        formData[type].length < arrayLimit) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], trimmedValue]
      }));
      setValue('');
    } else if (formData[type].length >= arrayLimit) {
      toast({
        title: 'Limit Reached',
        description: `Maximum ${arrayLimit} ${type} allowed.`,
        variant: 'destructive'
      });
    }
  };

  const removeItem = (type: 'specializations' | 'languages' | 'certifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    // Validate critical fields
    const result = agentProfileSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      experience: formData.experience,
      bio: formData.bio,
      image: formData.image,
      socialLinks: formData.socialLinks,
      specializations: formData.specializations,
      languages: formData.languages,
      certifications: formData.certifications,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      toast({
        title: 'Validation Error',
        description: result.error.errors[0]?.message || 'Please check your input',
        variant: 'destructive'
      });
      return;
    }

    onSave(formData);
    setOpen(false);
    setValidationErrors({});
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cover Page Selection */}
          <CoverPageSelector 
            selectedCover={formData.coverPage || 'gradient-teal'} 
            onSelect={(coverId) => handleInputChange('coverPage', coverId)} 
          />

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={FIELD_LIMITS.name}
                  className={validationErrors['name'] ? 'border-destructive' : ''}
                />
                {validationErrors['name'] && (
                  <span className="text-xs text-destructive">{validationErrors['name']}</span>
                )}
                <span className="text-xs text-muted-foreground">{formData.name.length}/{FIELD_LIMITS.name}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="e.g., 8 years"
                  maxLength={FIELD_LIMITS.experience}
                />
                <span className="text-xs text-muted-foreground">{formData.experience.length}/{FIELD_LIMITS.experience}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  maxLength={FIELD_LIMITS.phone}
                />
                <span className="text-xs text-muted-foreground">{formData.phone.length}/{FIELD_LIMITS.phone}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  maxLength={FIELD_LIMITS.whatsapp}
                />
                <span className="text-xs text-muted-foreground">{formData.whatsapp.length}/{FIELD_LIMITS.whatsapp}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                maxLength={FIELD_LIMITS.image}
              />
              <span className="text-xs text-muted-foreground">{formData.image.length}/{FIELD_LIMITS.image}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                maxLength={FIELD_LIMITS.bio}
              />
              <span className="text-xs text-muted-foreground">{formData.bio.length}/{FIELD_LIMITS.bio}</span>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {spec}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeItem('specializations', i)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add specialization"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('specializations', newSpecialization, setNewSpecialization))}
              />
              <Button type="button" size="sm" onClick={() => addItem('specializations', newSpecialization, setNewSpecialization)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang, i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {lang}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeItem('languages', i)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('languages', newLanguage, setNewLanguage))}
              />
              <Button type="button" size="sm" onClick={() => addItem('languages', newLanguage, setNewLanguage)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {cert}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeItem('certifications', i)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add certification"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certifications', newCertification, setNewCertification))}
              />
              <Button type="button" size="sm" onClick={() => addItem('certifications', newCertification, setNewCertification)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Performance Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clients Served</Label>
                <Input
                  value={formData.stats.clientsServed}
                  onChange={(e) => handleStatsChange('clientsServed', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Claims Processed</Label>
                <Input
                  value={formData.stats.claimsProcessed}
                  onChange={(e) => handleStatsChange('claimsProcessed', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Claims Settled</Label>
                <Input
                  type="number"
                  value={formData.stats.claimsSettled}
                  onChange={(e) => handleStatsChange('claimsSettled', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Settlement Amount</Label>
                <Input
                  value={formData.stats.claimsAmount}
                  onChange={(e) => handleStatsChange('claimsAmount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Success Rate</Label>
                <Input
                  value={formData.stats.successRate}
                  onChange={(e) => handleStatsChange('successRate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Response Time</Label>
                <Input
                  value={formData.stats.responseTime}
                  onChange={(e) => handleStatsChange('responseTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Social Links</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={formData.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={formData.socialLinks.facebook || ''}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter</Label>
                <Input
                  value={formData.socialLinks.twitter || ''}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentProfileDialog;
