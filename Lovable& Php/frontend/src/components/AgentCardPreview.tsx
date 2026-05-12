import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, MapPin, Clock, Briefcase, FileCheck, TrendingUp, Users, PhoneCall, Stethoscope, Shield, Car, Building2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface AgentCardPreviewProps {
  agent: {
    name: string;
    image: string;
    experience: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    irdaLicensed: boolean;
    specializations: string[];
    location?: string;
    matchingScore?: number;
    claimsAmount?: string;
    stats: {
      clientsServed: string;
      claimsSettled: number;
      responseTime: string;
    };
    bio: string;
  };
  isPreview?: boolean;
}

const ALLOWED_CARD_TAGS = ['health', 'life', 'motor', 'sme'];
const filterAllowedTags = (specs: string[]) =>
  specs.filter(s => ALLOWED_CARD_TAGS.some(t => s.toLowerCase().includes(t)));

const getProductIcon = (spec: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'health': <Stethoscope className="h-3 w-3" />,
    'life': <Shield className="h-3 w-3" />,
    'motor': <Car className="h-3 w-3" />,
    'sme': <Building2 className="h-3 w-3" />,
  };
  const key = Object.keys(iconMap).find(k => spec.toLowerCase().includes(k));
  return key ? iconMap[key] : <Shield className="h-3 w-3" />;
};

const getProductColor = (spec: string): string => {
  const colorMap: Record<string, string> = {
    'health': 'bg-rose-100 text-rose-700 border-rose-200',
    'life': 'bg-violet-100 text-violet-700 border-violet-200',
    'motor': 'bg-blue-100 text-blue-700 border-blue-200',
    'sme': 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const key = Object.keys(colorMap).find(k => spec.toLowerCase().includes(k));
  return key ? colorMap[key] : 'bg-primary/10 text-primary border-primary/20';
};

const AgentCardPreview: React.FC<AgentCardPreviewProps> = ({ agent, isPreview = true }) => {
  const matchScore = agent.matchingScore || 97;

  return (
    <Card className="overflow-hidden border border-border/50 shadow-lg w-full">
      <CardContent className="p-0">
        <div className="flex flex-row">
          {/* Left Section - Photo & Match Score */}
          <div className="relative w-[130px] flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/20" />
            <div className="relative p-3 flex flex-col items-center justify-center h-full min-h-[180px]">
              {/* Match Score */}
              <div className="mb-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                  matchScore > 90 ? 'bg-green-100 text-green-700' :
                  matchScore >= 51 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {matchScore}% Match
                </div>
              </div>

              {/* Agent Photo */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg ring-2 ring-white/50">
                  {agent.image ? (
                    <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                {agent.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-accent text-white rounded-full p-0.5 shadow-md">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Compare & Favourite icons (visual only in preview) */}
              <div className="flex items-center gap-2 mt-2">
                <div className="p-1 rounded-lg bg-white shadow-sm text-muted-foreground">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                </div>
                <div className="p-1 rounded-lg bg-white shadow-sm text-muted-foreground">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section - Agent Info */}
          <div className="flex-1 p-3 text-left">
            {/* Name & Badges */}
            <div className="mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">{agent.name}</h3>
                {agent.verified && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[9px] px-1 py-0 font-medium">
                    <CheckCircle className="h-2 w-2 mr-0.5" />
                    Verified
                  </Badge>
                )}
              </div>
              {agent.location && (
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="text-[10px] leading-tight">{agent.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                <Clock className="h-2.5 w-2.5 text-muted-foreground/50 animate-pulse" />
                <span className="text-[10px] text-muted-foreground/50">Calculating...</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold">{agent.rating}</span>
                <span className="text-[9px] text-muted-foreground">({agent.reviewCount})</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
                <Briefcase className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[10px] font-medium">{agent.experience}</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-md">
                <Clock className="h-2.5 w-2.5 text-green-600" />
                <span className="text-[10px] font-medium text-green-700">Fast</span>
              </div>
            </div>

            {/* Claims & Client Stats */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="p-1 bg-secondary/10 rounded-md">
                  <FileCheck className="h-3 w-3 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-foreground">{agent.stats.claimsSettled}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">Claims</p>
                </div>
              </div>
              {agent.claimsAmount && (
                <div className="flex items-center gap-1">
                  <div className="p-1 bg-accent/10 rounded-md">
                    <TrendingUp className="h-3 w-3 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-foreground">{agent.claimsAmount}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">Settled</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="p-1 bg-blue-50 rounded-md">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-foreground">{agent.stats.clientsServed}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">Clients</p>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5">
              {filterAllowedTags(agent.specializations).slice(0, 4).map((spec, index) => (
                <Badge
                  key={index}
                  className={`text-[10px] px-2 py-0.5 font-semibold flex items-center gap-1 border shadow-sm ${getProductColor(spec)}`}
                >
                  {getProductIcon(spec)}
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="w-[100px] flex-shrink-0 border-l border-border/30 bg-muted/10 p-2 flex flex-col items-center justify-center gap-1.5">
            <button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-1">
              <PhoneCall className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium">Call</span>
            </button>
            <button className="w-full bg-accent hover:bg-accent/90 text-white rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-1">
              <FaWhatsapp className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium">Chat</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary hover:text-white text-[10px] font-medium h-8"
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCardPreview;
