import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  User, 
  Briefcase, 
  Shield, 
  Building2, 
  Globe, 
  Target, 
  FileCheck,
  Clock,
  CheckCircle,
  Star,
  AlertCircle,
  Video,
  List,
  Volume2,
  VolumeX,
  Maximize,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import profileWalkthroughVideo from '@/assets/profile-setup-walkthrough.mp4';

const sections = [
  {
    id: 1,
    title: 'Basic Details',
    icon: User,
    duration: '1 min',
    required: true,
    description: 'Your identity and contact information',
    reason: 'Customers need your verified contact details to reach you. Your display name builds trust and recognition.',
    videoTimestamp: '0:00'
  },
  {
    id: 2,
    title: 'Professional Details',
    icon: Briefcase,
    duration: '2 min',
    required: true,
    description: 'Credentials, experience, and service areas',
    reason: 'insurance license verification ensures you are a legitimate agent. Experience and client base help customers choose the right agent.',
    videoTimestamp: '1:00'
  },
  {
    id: 3,
    title: 'Insurance Segments',
    icon: Shield,
    duration: '1 min',
    required: true,
    description: 'Select your insurance specializations',
    reason: 'Helps customers find agents who specialize in their specific insurance needs (Health, Life, Motor, SME).',
    videoTimestamp: '3:00'
  },
  {
    id: 4,
    title: 'Product Portfolio',
    icon: Building2,
    duration: '2 min',
    required: true,
    description: 'Your company partnerships',
    reason: 'Showcases your insurance company tie-ups and expertise in specific products, building credibility.',
    videoTimestamp: '4:00'
  },
  {
    id: 5,
    title: 'Additional Details',
    icon: Globe,
    duration: '2 min',
    required: false,
    description: 'Digital presence and achievements',
    reason: 'Social links and achievement photos build trust. A complete profile gets 3x more leads than incomplete ones.',
    videoTimestamp: '6:00'
  },
  {
    id: 6,
    title: 'Lead Preferences',
    icon: Target,
    duration: '1 min',
    required: false,
    description: 'Configure how you receive leads',
    reason: 'Customize what types of leads you want to receive based on your expertise and capacity.',
    videoTimestamp: '8:00'
  },
  {
    id: 7,
    title: 'Declarations',
    icon: FileCheck,
    duration: '1 min',
    required: true,
    description: 'Terms and consent',
    reason: 'Required to verify your commitment to ethical practices and compliance with insurance regulator guidelines.',
    videoTimestamp: '9:00'
  }
];

const ProfileSetupGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'steps'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const seekToTimestamp = (timestamp: string) => {
    if (videoRef.current) {
      const [minutes, seconds] = timestamp.split(':').map(Number);
      videoRef.current.currentTime = minutes * 60 + seconds;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/5">
          <Play className="h-4 w-4 text-primary" />
          <span className="hidden xs:inline">Watch Guide</span>
          <span className="xs:hidden">Guide</span>
          <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5">2 min</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-4 w-4 text-primary" />
            </div>
            Complete Your Profile in 7 Steps
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Learn why each section matters for getting more leads
          </p>
        </DialogHeader>

        {/* Tabs for Video / Steps */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'video' | 'steps')} className="flex-1">
          <div className="px-4 sm:px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="video" className="gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden xs:inline">Video Walkthrough</span>
                <span className="xs:hidden">Video</span>
              </TabsTrigger>
              <TabsTrigger value="steps" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden xs:inline">Step by Step</span>
                <span className="xs:hidden">Steps</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Video Tab */}
          <TabsContent value="video" className="mt-0 p-4 sm:p-6">
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                <video
                  ref={videoRef}
                  src={profileWalkthroughVideo}
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />
                
                {/* Video Controls Overlay */}
                <div className={cn(
                  "absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity",
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-primary" />
                    ) : (
                      <Play className="h-8 w-8 text-primary ml-1" />
                    )}
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between transition-opacity",
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                  <button
                    type="button"
                    onClick={handleMuteToggle}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Maximize className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Video Chapters */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Jump to Section:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sections.slice(0, 4).map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors"
                      onClick={() => seekToTimestamp(section.videoTimestamp)}
                    >
                      <section.icon className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{section.title}</p>
                        <p className="text-[10px] text-muted-foreground">{section.videoTimestamp}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Why Video Matters */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Why Watch the Video?
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    See exactly where to fill each field
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    Learn tips to make your profile stand out
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    Understand why each field matters for leads
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Steps Tab */}
          <TabsContent value="steps" className="mt-0 overflow-y-auto max-h-[calc(90vh-180px)] p-4 sm:p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-lg bg-muted/50 border">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">~10 min</p>
                <p className="text-[10px] text-muted-foreground">Total Time</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50 border">
                <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-foreground">5</p>
                <p className="text-[10px] text-muted-foreground">Mandatory</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50 border">
                <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold text-foreground">3x</p>
                <p className="text-[10px] text-muted-foreground">More Leads</p>
              </div>
            </div>

            {/* Section List */}
            <div className="space-y-3">
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className={cn(
                    "rounded-lg border transition-all cursor-pointer",
                    activeSection === section.id 
                      ? "bg-primary/5 border-primary/30 shadow-sm" 
                      : "bg-background hover:bg-muted/30"
                  )}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                >
                  <div className="flex items-center gap-3 p-3 sm:p-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      section.required ? "bg-primary/10" : "bg-muted"
                    )}>
                      <section.icon className={cn(
                        "h-5 w-5",
                        section.required ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{section.title}</span>
                        {section.required && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary px-1.5 py-0">
                            Required
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted">
                          {section.duration}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {section.description}
                      </p>
                    </div>
                    
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                      {section.id}
                    </div>
                  </div>
                  
                  {/* Expanded Reason */}
                  {activeSection === section.id && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1">
                            Why is this important?
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            {section.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pro Tips */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Pro Tips for Better Visibility
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  Upload a professional photo - profiles with photos get 5x more clicks
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  Add your insurance license number for the "Verified" badge
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  Include achievement photos to build trust with customers
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  Complete all sections - 100% complete profiles rank higher in search
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupGuide;
