import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface VisibilitySettings {
  show_experience: boolean;
  show_claims_stats: boolean;
  show_client_base: boolean;
  show_certificates: boolean;
  show_achievements: boolean;
  show_comments: boolean;
  show_ratings: boolean;
  show_social_links: boolean;
  show_languages: boolean;
  show_gallery: boolean;
  show_contact_info: boolean;
}

const TOGGLE_OPTIONS: { key: keyof VisibilitySettings; label: string; description: string }[] = [
  { key: 'show_experience', label: 'Experience & Years', description: 'Show your years of experience on profile' },
  { key: 'show_claims_stats', label: 'Claims & Settled Stats', description: 'Claims processed, settled, amount, success rate' },
  { key: 'show_client_base', label: 'Client Base', description: 'Show approximate client count' },
  { key: 'show_ratings', label: 'Ratings & Stars', description: 'Show star rating on your profile' },
  { key: 'show_comments', label: 'Comments & Reviews', description: 'Show customer reviews section' },
  { key: 'show_certificates', label: 'Certifications', description: 'Show certifications section' },
  { key: 'show_achievements', label: 'Achievements', description: 'Show achievement badges' },
  { key: 'show_social_links', label: 'Social Media Buttons', description: 'LinkedIn, Facebook, Twitter links' },
  { key: 'show_languages', label: 'Languages', description: 'Show languages you speak' },
  { key: 'show_gallery', label: 'Media / Gallery', description: 'Show photo gallery section' },
  { key: 'show_contact_info', label: 'Contact Info (Phone/WhatsApp)', description: 'Show phone and WhatsApp number' },
];

const AgentVisibilityToggles: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VisibilitySettings>({
    show_experience: true,
    show_claims_stats: true,
    show_client_base: true,
    show_certificates: true,
    show_achievements: true,
    show_comments: true,
    show_ratings: true,
    show_social_links: true,
    show_languages: true,
    show_gallery: true,
    show_contact_info: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('agent_profiles')
        .select('show_experience, show_claims_stats, show_client_base, show_certificates, show_achievements, show_comments, show_ratings, show_social_links, show_languages, show_gallery, show_contact_info')
        .eq('id', user.id)
        .single();
      if (data) {
        setSettings(data as unknown as VisibilitySettings);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [user]);

  const handleToggle = async (key: keyof VisibilitySettings) => {
    if (!user) return;
    const newValue = !settings[key];
    setSaving(key);
    setSettings(prev => ({ ...prev, [key]: newValue }));

    const { error } = await supabase
      .from('agent_profiles')
      .update({ [key]: newValue } as any)
      .eq('id', user.id);

    if (error) {
      setSettings(prev => ({ ...prev, [key]: !newValue }));
      toast.error('Failed to update setting');
    } else {
      toast.success(`${newValue ? 'Showing' : 'Hiding'} section on your profile`);
    }
    setSaving(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Profile Section Visibility
        </CardTitle>
        <CardDescription>
          Control what end users can see on your public profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TOGGLE_OPTIONS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                {settings[key] ? (
                  <Eye className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div>
                  <Label htmlFor={key} className="text-sm font-medium cursor-pointer">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saving === key && <Loader2 className="h-3 w-3 animate-spin" />}
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={() => handleToggle(key)}
                  disabled={saving !== null}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentVisibilityToggles;
