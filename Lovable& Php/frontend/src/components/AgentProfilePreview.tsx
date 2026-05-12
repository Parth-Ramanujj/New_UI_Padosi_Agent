import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, Phone, MessageSquare, CheckCircle, Award, Star, Briefcase, 
  Users, Languages, Heart, Shield, Car, Building2, MapPin, Globe,
  Linkedin, Facebook, Calendar, FileCheck, Trophy, Target
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import TrustedBadge from '@/components/TrustedBadge';
import { coverPageOptions } from '@/components/CoverPageSelector';
import { cn } from '@/lib/utils';
import type { GalleryImage } from '@/components/AgentGalleryManager';
import LicensedBadge from '@/components/LicensedBadge';

interface PreviewData {
  basicDetails: {
    fullName: string;
    displayName: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    languages: string[];
    residenceAddress: string;
    avatarUrl: string;
  };
  professionalDetails: {
    panNumber: string;
    licenseNumber: string;
    officeAddress: string;
    serviceableCities: string[];
    yearsExperience: string;
    clientBase: string;
    companyName: string;
    hasPosLicense: boolean;
  };
  insuranceSegments: {
    health: boolean;
    life: boolean;
    motor: boolean;
    sme: boolean;
  };
  additionalDetails: {
    website: string;
    googleBusiness: string;
    linkedin: string;
    instagram: string;
    facebook: string;
    youtube: string;
    careerHighlights: string;
    galleryImages: GalleryImage[];
  };
  coverPage?: string;
  subscriptionPlan?: string;
}

interface AgentProfilePreviewProps {
  data: PreviewData;
  trigger?: React.ReactNode;
}

const AgentProfilePreview: React.FC<AgentProfilePreviewProps> = ({ data, trigger }) => {
  const { basicDetails, professionalDetails, insuranceSegments, additionalDetails, coverPage, subscriptionPlan } = data;
  
  const displayName = basicDetails.displayName || basicDetails.fullName || 'Agent Name';
  const yearsExp = parseInt(professionalDetails.yearsExperience) || 0;
  const clientBase = professionalDetails.clientBase || '0';
  
  const specializations: string[] = [];
  if (insuranceSegments.health) specializations.push('Health Insurance');
  if (insuranceSegments.life) specializations.push('Life Insurance');
  if (insuranceSegments.motor) specializations.push('Motor Insurance');
  if (insuranceSegments.sme) specializations.push('SME/Commercial');

  const hasSocialLinks = additionalDetails.linkedin || additionalDetails.facebook || additionalDetails.youtube;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Profile Preview</DialogTitle>
        </DialogHeader>
        
        {/* Preview Banner */}
        <div className="bg-primary/10 border-b px-4 py-2 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Profile Preview</span>
          </div>
          <Badge variant="outline" className="text-xs">How customers will see your profile</Badge>
        </div>

        {/* Cover Page */}
        <div className={cn(
          "h-28 sm:h-36 md:h-44 w-full relative overflow-hidden",
          coverPageOptions.find(c => c.id === coverPage)?.className || coverPageOptions[0].className
        )}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.3)_0%,transparent_40%)]" />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-card relative px-4 sm:px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start -mt-12 sm:-mt-16">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-4 border-card shadow-xl">
                  <AvatarImage src={basicDetails.avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-primary-foreground">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {professionalDetails.licenseNumber && (
                  <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-lg border-2 border-card">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>

              {/* Social Links */}
              {hasSocialLinks && (
                <div className="flex gap-2 mt-3">
                  {additionalDetails.linkedin && (
                    <div className="p-2 rounded-full bg-muted">
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    </div>
                  )}
                  {additionalDetails.facebook && (
                    <div className="p-2 rounded-full bg-muted">
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                    </div>
                  )}
                  {additionalDetails.youtube && (
                    <div className="p-2 rounded-full bg-muted">
                      <FaXTwitter className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col gap-2 mt-3 w-full">
                <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none text-xs" disabled>
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-xs" disabled>
                  <Phone className="mr-1.5 h-3.5 w-3.5" />Call Now
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="flex-grow text-center md:text-left pt-2 md:pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-1.5 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}</h1>
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                  {professionalDetails.licenseNumber && (
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] sm:text-xs font-medium px-2 py-0.5">
                      <CheckCircle className="h-3 w-3 mr-1" />Verified
                    </Badge>
                  )}
                  <LicensedBadge variant="default" themeColor="accent" />
                  {subscriptionPlan === 'professional' && (
                    <TrustedBadge variant="default" />
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-muted-foreground text-sm mb-3 max-w-xl">
                {additionalDetails.careerHighlights || `Insurance professional with ${yearsExp}+ years of experience serving ${clientBase}+ clients.`}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3 justify-center md:justify-start">
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                  <Briefcase className="h-3 w-3" />
                  {yearsExp}+ Years
                </span>
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                  <Users className="h-3 w-3" />
                  {clientBase}+ Clients
                </span>
                {basicDetails.languages.length > 0 && (
                  <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                    <Languages className="h-3 w-3" />
                    {basicDetails.languages.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>

              {/* Specializations */}
              {specializations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-3">
                  {specializations.map((spec, i) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      'Health Insurance': <Heart className="h-3 w-3" />,
                      'Life Insurance': <Shield className="h-3 w-3" />,
                      'Motor Insurance': <Car className="h-3 w-3" />,
                      'SME/Commercial': <Building2 className="h-3 w-3" />,
                    };
                    return (
                      <Badge key={i} variant="secondary" className="bg-secondary/10 text-secondary border-0 text-[10px] gap-1 px-2 py-0.5">
                        {iconMap[spec]}
                        {spec}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Location */}
              {professionalDetails.serviceableCities.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center md:justify-start">
                  <MapPin className="h-3 w-3" />
                  <span>{professionalDetails.serviceableCities.slice(0, 3).join(', ')}</span>
                </div>
              )}

              {/* Rating */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full mt-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-amber-500 text-amber-500' : 'text-amber-200'}`} />
                  ))}
                </div>
                <span className="font-semibold text-amber-700 text-xs">4.5</span>
                <span className="text-amber-600 text-[10px]">(New)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Preview */}
        {additionalDetails.galleryImages.length > 0 && (
          <div className="px-4 sm:px-6 pb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-primary" />
                  Gallery
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {additionalDetails.galleryImages.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Note */}
        <div className="bg-muted/50 border-t px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            This is a preview of how your profile will appear to customers. Complete all sections for best visibility.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentProfilePreview;
