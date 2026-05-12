import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, MessageCircle, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ShareProfileButtonProps {
  agentName: string;
  agentId: string;
  variant?: 'default' | 'compact';
  className?: string;
}

const ShareProfileButton: React.FC<ShareProfileButtonProps> = ({ 
  agentName, 
  agentId,
  variant = 'default',
  className = ''
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const profileUrl = `${window.location.origin}/agent/${agentId}`;
  const shareText = `Check out ${agentName}'s profile on Padosi Agent - Your trusted insurance advisor!`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it with friends and family." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };
  
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleSMSShare = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`;
    window.location.href = smsUrl;
  };
  
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant="ghost" 
            className={`h-10 w-10 p-0 rounded-lg bg-muted/80 hover:bg-muted ${className}`}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-44 bg-card border shadow-lg">
          <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
            <FaWhatsapp className="h-4 w-4 mr-2 text-green-600" />
            <span>WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSMSShare} className="cursor-pointer">
            <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
            <span>SMS</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="default" 
          variant="outline" 
          className={`border-primary/20 hover:bg-primary/5 hover:border-primary/40 ${className}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border shadow-lg">
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <FaWhatsapp className="h-4 w-4 mr-2 text-green-600" />
          <span>Share via WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSMSShare} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
          <span>Share via SMS</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareProfileButton;
