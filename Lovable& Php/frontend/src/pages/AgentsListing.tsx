import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, PhoneCall, CheckCircle, Award, TrendingUp, Heart, GitCompare, X, Briefcase, MapPin, Phone, Shield, Car, Plane, Filter, Clock, Navigation, Users, FileCheck, Building2, Stethoscope, Umbrella, Flame, Ship, Activity } from 'lucide-react';
import { coverPageOptions } from '@/components/CoverPageSelector';
import { cn } from '@/lib/utils';
import { FaWhatsapp } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import InfoTooltip from '@/components/InfoTooltip';
import LicensedBadge from '@/components/LicensedBadge';
import TrustedBadge from '@/components/TrustedBadge';
import MultiSelectDropdown from '@/components/agent-profile/MultiSelectDropdown';
import { calculateMatchingScore, parseClaimsAmountCr, parseClientBase } from '@/lib/matchingAlgorithm';
import type { ServiceType } from '@/lib/matchingAlgorithm';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAgentDistances } from '@/hooks/useAgentDistances';
import { formatTravelTime } from '@/lib/distance';
import { supabase } from '@/integrations/supabase/client';
import { trackAgentCardView, trackProfileClick } from '@/hooks/useAgentProfile';
import SeekerDetailsPopup, { getSavedSeekerDetails, saveSeekerDetails } from '@/components/SeekerDetailsPopup';
import ContactDetailsPopup from '@/components/ContactDetailsPopup';

import { useIsMobile } from '@/hooks/use-mobile';

// Determine subscription plan for mock agents (Professional for high-performers)
const getMockSubscriptionPlan = (agent: any): string => {
  if (agent.subscriptionPlan) return agent.subscriptionPlan;
  // Agents with 10+ years experience AND 4.8+ rating get professional
  if (agent.experience >= 10 && agent.rating >= 4.8) return 'professional';
  // Every 3rd agent also gets professional for variety
  if (parseInt(agent.id) % 3 === 0) return 'professional';
  return 'starter';
};

// Helper function to get client base display - now uses actual data if available
const getClientBaseDisplay = (id: string, approxClientBase?: string | null): string => {
  if (approxClientBase) {
    return approxClientBase;
  }
  const bases = ['100+', '250+', '500+', '1000+', '50+', '200+', '300+', '150+'];
  return bases[parseInt(id) % bases.length];
};

// Only these 4 tags are allowed on agent cards
const ALLOWED_CARD_TAGS = ['health', 'life', 'motor', 'sme'];
const filterAllowedTags = (specs: string[]) =>
  specs.filter(s => ALLOWED_CARD_TAGS.some(t => s.toLowerCase().includes(t)));

const getProductIcon = (spec: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'Health': <Stethoscope className="h-3 w-3" />,
    'Life': <Shield className="h-3 w-3" />,
    'Motor': <Car className="h-3 w-3" />,
    'Travel': <Plane className="h-3 w-3" />,
    'Term': <Shield className="h-3 w-3" />,
    'Fire': <Flame className="h-3 w-3" />,
    'Marine': <Ship className="h-3 w-3" />,
    'SME': <Building2 className="h-3 w-3" />,
    'Liability': <Umbrella className="h-3 w-3" />,
    'Personal Accident': <Activity className="h-3 w-3" />,
  };
  const key = Object.keys(iconMap).find(k => spec.toLowerCase().includes(k.toLowerCase()));
  return key ? iconMap[key] : <Shield className="h-3 w-3" />;
};

// Product color mapping
const getProductColor = (spec: string): string => {
  const colorMap: Record<string, string> = {
    'Health': 'bg-rose-100 text-rose-700 border-rose-200',
    'Life': 'bg-violet-100 text-violet-700 border-violet-200',
    'Motor': 'bg-blue-100 text-blue-700 border-blue-200',
    'Travel': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Term': 'bg-purple-100 text-purple-700 border-purple-200',
    'Fire': 'bg-orange-100 text-orange-700 border-orange-200',
    'Marine': 'bg-teal-100 text-teal-700 border-teal-200',
    'SME': 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const key = Object.keys(colorMap).find(k => spec.toLowerCase().includes(k.toLowerCase()));
  return key ? colorMap[key] : 'bg-primary/10 text-primary border-primary/20';
};

const mockAgents = [
  // Health Insurance Specialists
  { id: '1', name: 'Rahul Sharma', profileImage: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4.8, reviewCount: 124, experience: 8, specializations: ['Health', 'Life'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹2.5 Cr', matchingScore: 95, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Health insurance expert with proven track record.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'Care Health Insurance Ltd.', 'Star Health & Allied Insurance Co. Ltd.'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43210', whatsapp: '+91 98765 43210' } },
  { id: '2', name: 'Priya Patel', profileImage: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4.9, reviewCount: 156, experience: 10, specializations: ['Health', 'Travel'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹3.2 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Dedicated health insurance advisor.', insuranceCompanies: ['Niva Bupa Health Insurance Company Limited', 'ManipalCigna Health Insurance Company Limited', 'Aditya Birla Health Insurance Co. Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43211', whatsapp: '+91 98765 43211' } },
  { id: '3', name: 'Deepak Verma', profileImage: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 4.7, reviewCount: 98, experience: 7, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.1 Cr', matchingScore: 89, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Delhi, NCR', bio: 'Specialist in family health coverage.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited', 'Reliance Health Insurance Ltd.'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43220', whatsapp: '+91 98765 43220' } },
  { id: '4', name: 'Sunita Rao', profileImage: 'https://randomuser.me/api/portraits/women/52.jpg', rating: 4.6, reviewCount: 87, experience: 6, specializations: ['Health', 'Life'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹1.8 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Expert in senior citizen health plans.', insuranceCompanies: ['Star Health & Allied Insurance Co. Ltd.', 'Care Health Insurance Ltd.', 'National Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43221', whatsapp: '+91 98765 43221' } },
  { id: '5', name: 'Arun Gupta', profileImage: 'https://randomuser.me/api/portraits/men/55.jpg', rating: 4.8, reviewCount: 145, experience: 11, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 201, claimsAmount: '₹3.5 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kolkata, West Bengal', bio: 'Health insurance veteran with 11 years experience.', insuranceCompanies: ['The New India Assurance Company Limited', 'United India Insurance Company Limited', 'Galaxy Health and Allied Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43222', whatsapp: '+91 98765 43222' } },
  { id: '6', name: 'Meera Krishnan', profileImage: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 4.5, reviewCount: 76, experience: 5, specializations: ['Health', 'Travel'], verified: true, irdaLicensed: true, claimsSettled: 89, claimsAmount: '₹1.4 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Young professional specializing in health plans.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited', 'Narayana Health Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43223', whatsapp: '+91 98765 43223' } },
  { id: '7', name: 'Rajesh Nair', profileImage: 'https://randomuser.me/api/portraits/men/62.jpg', rating: 4.7, reviewCount: 112, experience: 9, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹2.8 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kochi, Kerala', bio: 'Comprehensive health insurance solutions.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'Niva Bupa Health Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43224', whatsapp: '+91 98765 43224' } },
  { id: '8', name: 'Anita Sharma', profileImage: 'https://randomuser.me/api/portraits/women/28.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Health', 'Life'], verified: true, irdaLicensed: true, claimsSettled: 123, claimsAmount: '₹2.0 Cr', matchingScore: 87, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Family health insurance specialist.', insuranceCompanies: ['Care Health Insurance Ltd.', 'Reliance General Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43225', whatsapp: '+91 98765 43225' } },
  { id: '9', name: 'Vikram Singh', profileImage: 'https://randomuser.me/api/portraits/men/38.jpg', rating: 4.9, reviewCount: 178, experience: 12, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹4.2 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Jaipur, Rajasthan', bio: 'Top-rated health insurance expert.', insuranceCompanies: ['Star Health & Allied Insurance Co. Ltd.', 'ManipalCigna Health Insurance Company Limited', 'Aditya Birla Health Insurance Co. Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43226', whatsapp: '+91 98765 43226' } },
  { id: '10', name: 'Kavita Joshi', profileImage: 'https://randomuser.me/api/portraits/women/41.jpg', rating: 4.7, reviewCount: 103, experience: 8, specializations: ['Health', 'Travel'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹2.6 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Expert in critical illness coverage.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Go Digit General Insurance Limited', 'Liberty General Insurance Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43227', whatsapp: '+91 98765 43227' } },
  { id: '11', name: 'Sanjay Mehta', profileImage: 'https://randomuser.me/api/portraits/men/47.jpg', rating: 4.5, reviewCount: 82, experience: 6, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹1.6 Cr', matchingScore: 83, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Lucknow, UP', bio: 'Affordable health plans expert.', insuranceCompanies: ['Bajaj General Insurance Limited', 'National Insurance Company Limited', 'The Oriental Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43228', whatsapp: '+91 98765 43228' } },
  { id: '12', name: 'Pooja Reddy', profileImage: 'https://randomuser.me/api/portraits/women/56.jpg', rating: 4.8, reviewCount: 134, experience: 9, specializations: ['Health', 'Life'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹3.0 Cr', matchingScore: 94, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Corporate health insurance specialist.', insuranceCompanies: ['Niva Bupa Health Insurance Company Limited', 'Magma General Insurance Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['rejection', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43229', whatsapp: '+91 98765 43229' } },

  // Life Insurance Specialists
  { id: '13', name: 'Amit Kumar', profileImage: 'https://randomuser.me/api/portraits/men/22.jpg', rating: 4.7, reviewCount: 98, experience: 12, specializations: ['Life', 'Term'], verified: true, irdaLicensed: true, claimsSettled: 203, claimsAmount: '₹4.1 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Delhi, NCR', bio: 'Life insurance expert with 12 years experience.', insuranceCompanies: ['Life Insurance Corporation of India', 'HDFC Life Insurance Company Limited', 'ICICI Prudential Life Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43212', whatsapp: '+91 98765 43212' } },
  { id: '14', name: 'Neha Saxena', profileImage: 'https://randomuser.me/api/portraits/women/35.jpg', rating: 4.9, reviewCount: 167, experience: 11, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 245, claimsAmount: '₹5.2 Cr', matchingScore: 97, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Top life insurance advisor in Mumbai.', insuranceCompanies: ['SBI Life Insurance Company Limited', 'Kotak Mahindra Life Insurance Company Limited', 'Axis Max Life Insurance Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43230', whatsapp: '+91 98765 43230' } },
  { id: '15', name: 'Ramesh Iyer', profileImage: 'https://randomuser.me/api/portraits/men/51.jpg', rating: 4.6, reviewCount: 89, experience: 8, specializations: ['Life', 'Term'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.8 Cr', matchingScore: 85, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Term life insurance specialist.', insuranceCompanies: ['TATA AIA Life Insurance Company Limited', 'Bajaj Life Insurance Limited', 'PNB MetLife India Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43231', whatsapp: '+91 98765 43231' } },
  { id: '16', name: 'Lakshmi Venkat', profileImage: 'https://randomuser.me/api/portraits/women/48.jpg', rating: 4.8, reviewCount: 145, experience: 10, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹3.9 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Chennai, Tamil Nadu', bio: 'ULIP and endowment plans expert.', insuranceCompanies: ['Life Insurance Corporation of India', 'Aditya Birla SunLife Insurance Company Limited', 'Reliance Nippon Life Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43232', whatsapp: '+91 98765 43232' } },
  { id: '17', name: 'Suresh Pillai', profileImage: 'https://randomuser.me/api/portraits/men/59.jpg', rating: 4.7, reviewCount: 112, experience: 14, specializations: ['Life', 'Term'], verified: true, irdaLicensed: true, claimsSettled: 267, claimsAmount: '₹5.8 Cr', matchingScore: 94, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Kochi, Kerala', bio: 'Senior life insurance consultant.', insuranceCompanies: ['HDFC Life Insurance Company Limited', 'ICICI Prudential Life Insurance Company Limited', 'Canara HSBC Life Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43233', whatsapp: '+91 98765 43233' } },
  { id: '18', name: 'Geeta Agarwal', profileImage: 'https://randomuser.me/api/portraits/women/62.jpg', rating: 4.5, reviewCount: 78, experience: 6, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 87, claimsAmount: '₹1.5 Cr', matchingScore: 82, serviceTypes: ['New Policy', 'Policy Review'], location: 'Kolkata, West Bengal', bio: 'Women-focused life insurance plans.', insuranceCompanies: ['Shriram Life Insurance Company Limited', 'Bharti AXA Life Insurance Company Limited', 'Aviva Life Insurance Company India Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43234', whatsapp: '+91 98765 43234' } },
  { id: '19', name: 'Manoj Tiwari', profileImage: 'https://randomuser.me/api/portraits/men/64.jpg', rating: 4.8, reviewCount: 156, experience: 13, specializations: ['Life', 'Term'], verified: true, irdaLicensed: true, claimsSettled: 223, claimsAmount: '₹4.7 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Lucknow, UP', bio: 'Expert in high-value life policies.', insuranceCompanies: ['SBI Life Insurance Company Limited', 'Kotak Mahindra Life Insurance Company Limited', 'Ageas Federal Life Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43235', whatsapp: '+91 98765 43235' } },
  { id: '20', name: 'Sarita Devi', profileImage: 'https://randomuser.me/api/portraits/women/71.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.1 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Patna, Bihar', bio: 'Affordable life insurance solutions.', insuranceCompanies: ['Life Insurance Corporation of India', 'Bandhan Life Insurance Limited', 'Pramerica Life Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43236', whatsapp: '+91 98765 43236' } },
  { id: '21', name: 'Prakash Jain', profileImage: 'https://randomuser.me/api/portraits/men/71.jpg', rating: 4.9, reviewCount: 189, experience: 15, specializations: ['Life', 'Term'], verified: true, irdaLicensed: true, claimsSettled: 312, claimsAmount: '₹6.5 Cr', matchingScore: 98, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Ahmedabad, Gujarat', bio: 'Top-rated LIC advisor in Gujarat.', insuranceCompanies: ['Life Insurance Corporation of India', 'TATA AIA Life Insurance Company Limited', 'Star Union Dai-Ichi Life Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43237', whatsapp: '+91 98765 43237' } },
  { id: '22', name: 'Rekha Menon', profileImage: 'https://randomuser.me/api/portraits/women/76.jpg', rating: 4.7, reviewCount: 123, experience: 9, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.4 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Child education plan specialist.', insuranceCompanies: ['HDFC Life Insurance Company Limited', 'IndiaFirst Life Insurance Company Limited', 'Edelweiss Life Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43238', whatsapp: '+91 98765 43238' } },
  { id: '23', name: 'Ashok Sharma', profileImage: 'https://randomuser.me/api/portraits/men/77.jpg', rating: 4.5, reviewCount: 86, experience: 7, specializations: ['Life', 'Term'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹1.9 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Policy Review'], location: 'Jaipur, Rajasthan', bio: 'Retirement planning expert.', insuranceCompanies: ['ICICI Prudential Life Insurance Company Limited', 'CreditAccess Life Insurance Limited', 'Acko Life Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43239', whatsapp: '+91 98765 43239' } },
  { id: '24', name: 'Padma Rani', profileImage: 'https://randomuser.me/api/portraits/women/82.jpg', rating: 4.8, reviewCount: 145, experience: 11, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹4.0 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Hyderabad, Telangana', bio: 'Pension and annuity plans expert.', insuranceCompanies: ['SBI Life Insurance Company Limited', 'Generali Central Life Insurance Company Limited', 'Go Digit Life Insurance Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43240', whatsapp: '+91 98765 43240' } },

  // Motor Insurance Specialists
  { id: '25', name: 'Sneha Reddy', profileImage: 'https://randomuser.me/api/portraits/women/67.jpg', rating: 4.6, reviewCount: 87, experience: 6, specializations: ['Motor', 'Travel'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹1.8 Cr', matchingScore: 85, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Hyderabad, Telangana', bio: 'Motor insurance claim expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Go Digit General Insurance Limited', 'Acko General Insurance Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43213', whatsapp: '+91 98765 43213' } },
  { id: '26', name: 'Vijay Menon', profileImage: 'https://randomuser.me/api/portraits/men/78.jpg', rating: 4.8, reviewCount: 112, experience: 9, specializations: ['Motor', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹2.9 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Commercial vehicle insurance expert.', insuranceCompanies: ['Bajaj General Insurance Limited', 'Tata AIG General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43214', whatsapp: '+91 98765 43214' } },
  { id: '27', name: 'Kiran Desai', profileImage: 'https://randomuser.me/api/portraits/men/83.jpg', rating: 4.7, reviewCount: 134, experience: 8, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹2.4 Cr', matchingScore: 89, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Two-wheeler and car insurance specialist.', insuranceCompanies: ['Royal Sundaram General Insurance Company Limited', 'Reliance General Insurance Company Limited', 'SBI General Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43241', whatsapp: '+91 98765 43241' } },
  { id: '28', name: 'Anjali Kapoor', profileImage: 'https://randomuser.me/api/portraits/women/84.jpg', rating: 4.9, reviewCount: 167, experience: 10, specializations: ['Motor', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹3.6 Cr', matchingScore: 95, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Delhi, NCR', bio: 'Premium car insurance advisor.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'The New India Assurance Company Limited', 'National Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43242', whatsapp: '+91 98765 43242' } },
  { id: '29', name: 'Ravi Shankar', profileImage: 'https://randomuser.me/api/portraits/men/85.jpg', rating: 4.5, reviewCount: 78, experience: 5, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 89, claimsAmount: '₹1.2 Cr', matchingScore: 81, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Bangalore, Karnataka', bio: 'Bike insurance specialist.', insuranceCompanies: ['Go Digit General Insurance Limited', 'Shriram General Insurance Company Limited', 'Liberty General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43243', whatsapp: '+91 98765 43243' } },
  { id: '30', name: 'Smita Patil', profileImage: 'https://randomuser.me/api/portraits/women/86.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Motor', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 123, claimsAmount: '₹1.9 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Fleet insurance expert.', insuranceCompanies: ['Bajaj General Insurance Limited', 'United India Insurance Company Limited', 'The Oriental Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43244', whatsapp: '+91 98765 43244' } },
  { id: '31', name: 'Dinesh Kumar', profileImage: 'https://randomuser.me/api/portraits/men/86.jpg', rating: 4.8, reviewCount: 145, experience: 11, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 201, claimsAmount: '₹3.2 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Ahmedabad, Gujarat', bio: 'Commercial transport insurance expert.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43245', whatsapp: '+91 98765 43245' } },
  { id: '32', name: 'Nandini Rao', profileImage: 'https://randomuser.me/api/portraits/women/87.jpg', rating: 4.7, reviewCount: 112, experience: 8, specializations: ['Motor', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹2.5 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Accident claim specialist.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited', 'Magma General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43246', whatsapp: '+91 98765 43246' } },
  { id: '33', name: 'Gopal Krishnan', profileImage: 'https://randomuser.me/api/portraits/men/87.jpg', rating: 4.9, reviewCount: 178, experience: 13, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 267, claimsAmount: '₹4.1 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kochi, Kerala', bio: 'Top motor insurance consultant.', insuranceCompanies: ['Acko General Insurance Limited', 'Reliance General Insurance Company Limited', 'SBI General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43247', whatsapp: '+91 98765 43247' } },
  { id: '34', name: 'Asha Nair', profileImage: 'https://randomuser.me/api/portraits/women/88.jpg', rating: 4.5, reviewCount: 86, experience: 6, specializations: ['Motor', 'Travel'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹1.5 Cr', matchingScore: 83, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Thiruvananthapuram, Kerala', bio: 'Comprehensive motor coverage expert.', insuranceCompanies: ['Royal Sundaram General Insurance Company Limited', 'Navi General Insurance Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['mis-selling', 'delay'], contactInfo: { phone: '+91 98765 43248', whatsapp: '+91 98765 43248' } },
  { id: '35', name: 'Harish Bhatia', profileImage: 'https://randomuser.me/api/portraits/men/88.jpg', rating: 4.6, reviewCount: 103, experience: 7, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.0 Cr', matchingScore: 87, serviceTypes: ['New Policy', 'Policy Review'], location: 'Chandigarh, Punjab', bio: 'Electric vehicle insurance specialist.', insuranceCompanies: ['Go Digit General Insurance Limited', 'ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43249', whatsapp: '+91 98765 43249' } },
  { id: '36', name: 'Rina Das', profileImage: 'https://randomuser.me/api/portraits/women/89.jpg', rating: 4.8, reviewCount: 156, experience: 10, specializations: ['Motor', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹3.0 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kolkata, West Bengal', bio: 'Expert in third-party motor claims.', insuranceCompanies: ['National Insurance Company Limited', 'The New India Assurance Company Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43250', whatsapp: '+91 98765 43250' } },

  // Travel Insurance Specialists
  { id: '37', name: 'Aisha Khan', profileImage: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 4.5, reviewCount: 65, experience: 4, specializations: ['Travel', 'Health'], verified: true, irdaLicensed: true, claimsSettled: 78, claimsAmount: '₹1.2 Cr', matchingScore: 82, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Pune, Maharashtra', bio: 'International travel insurance expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited', 'Tata AIG General Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43215', whatsapp: '+91 98765 43215' } },
  { id: '38', name: 'Rohit Malhotra', profileImage: 'https://randomuser.me/api/portraits/men/89.jpg', rating: 4.7, reviewCount: 98, experience: 6, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹1.8 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Delhi, NCR', bio: 'Business travel insurance specialist.', insuranceCompanies: ['Bajaj General Insurance Limited', 'Reliance General Insurance Company Limited', 'Care Health Insurance Ltd.'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43251', whatsapp: '+91 98765 43251' } },
  { id: '39', name: 'Prerna Singh', profileImage: 'https://randomuser.me/api/portraits/women/91.jpg', rating: 4.8, reviewCount: 123, experience: 8, specializations: ['Travel', 'Health'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹2.4 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Schengen visa insurance expert.', insuranceCompanies: ['SBI General Insurance Company Limited', 'Go Digit General Insurance Limited', 'Star Health & Allied Insurance Co. Ltd.'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43252', whatsapp: '+91 98765 43252' } },
  { id: '40', name: 'Aditya Verma', profileImage: 'https://randomuser.me/api/portraits/men/91.jpg', rating: 4.6, reviewCount: 87, experience: 5, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 89, claimsAmount: '₹1.4 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Student travel insurance advisor.', insuranceCompanies: ['Royal Sundaram General Insurance Company Limited', 'National Insurance Company Limited', 'Niva Bupa Health Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43253', whatsapp: '+91 98765 43253' } },
  { id: '41', name: 'Swati Kulkarni', profileImage: 'https://randomuser.me/api/portraits/women/92.jpg', rating: 4.9, reviewCount: 145, experience: 9, specializations: ['Travel', 'Health'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹2.8 Cr', matchingScore: 94, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Hyderabad, Telangana', bio: 'Family travel packages expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'ManipalCigna Health Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43254', whatsapp: '+91 98765 43254' } },
  { id: '42', name: 'Nikhil Joshi', profileImage: 'https://randomuser.me/api/portraits/men/92.jpg', rating: 4.5, reviewCount: 76, experience: 4, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 67, claimsAmount: '₹1.0 Cr', matchingScore: 80, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Adventure travel insurance specialist.', insuranceCompanies: ['Liberty General Insurance Limited', 'Shriram General Insurance Company Limited', 'Aditya Birla Health Insurance Co. Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43255', whatsapp: '+91 98765 43255' } },
  { id: '43', name: 'Deepa Sharma', profileImage: 'https://randomuser.me/api/portraits/women/93.jpg', rating: 4.7, reviewCount: 112, experience: 7, specializations: ['Travel', 'Health'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.1 Cr', matchingScore: 89, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Chennai, Tamil Nadu', bio: 'Senior citizen travel plans expert.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'The New India Assurance Company Limited', 'Reliance Health Insurance Ltd.'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43256', whatsapp: '+91 98765 43256' } },
  { id: '44', name: 'Vivek Gupta', profileImage: 'https://randomuser.me/api/portraits/men/93.jpg', rating: 4.8, reviewCount: 134, experience: 8, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹2.6 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Kolkata, West Bengal', bio: 'Corporate travel insurance advisor.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'United India Insurance Company Limited', 'Narayana Health Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43257', whatsapp: '+91 98765 43257' } },
  { id: '45', name: 'Kalpana Rao', profileImage: 'https://randomuser.me/api/portraits/women/94.jpg', rating: 4.6, reviewCount: 94, experience: 6, specializations: ['Travel', 'Health'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹1.7 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Policy Review'], location: 'Kochi, Kerala', bio: 'Multi-trip travel plans specialist.', insuranceCompanies: ['Bajaj General Insurance Limited', 'Galaxy Health and Allied Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43258', whatsapp: '+91 98765 43258' } },
  { id: '46', name: 'Saurabh Mehta', profileImage: 'https://randomuser.me/api/portraits/men/94.jpg', rating: 4.9, reviewCount: 167, experience: 10, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹3.2 Cr', matchingScore: 95, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Jaipur, Rajasthan', bio: 'Top travel insurance consultant.', insuranceCompanies: ['SBI General Insurance Company Limited', 'IFFCO TOKIO General Insurance Company Limited', 'Care Health Insurance Ltd.'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43259', whatsapp: '+91 98765 43259' } },
  { id: '47', name: 'Meghna Pillai', profileImage: 'https://randomuser.me/api/portraits/women/95.jpg', rating: 4.5, reviewCount: 82, experience: 5, specializations: ['Travel', 'Health'], verified: true, irdaLicensed: true, claimsSettled: 87, claimsAmount: '₹1.3 Cr', matchingScore: 83, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Thiruvananthapuram, Kerala', bio: 'Medical evacuation coverage expert.', insuranceCompanies: ['Acko General Insurance Limited', 'Navi General Insurance Limited', 'Star Health & Allied Insurance Co. Ltd.'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43260', whatsapp: '+91 98765 43260' } },
  { id: '48', name: 'Rajat Singhania', profileImage: 'https://randomuser.me/api/portraits/men/95.jpg', rating: 4.7, reviewCount: 103, experience: 7, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹2.2 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Lucknow, UP', bio: 'Baggage and trip cancellation expert.', insuranceCompanies: ['Go Digit General Insurance Limited', 'Reliance General Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43261', whatsapp: '+91 98765 43261' } },

  // Fire Insurance Specialists
  { id: '49', name: 'Mohan Das', profileImage: 'https://randomuser.me/api/portraits/men/96.jpg', rating: 4.8, reviewCount: 145, experience: 12, specializations: ['Fire', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹4.5 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Industrial fire insurance expert.', insuranceCompanies: ['The New India Assurance Company Limited', 'National Insurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43262', whatsapp: '+91 98765 43262' } },
  { id: '50', name: 'Shobha Rani', profileImage: 'https://randomuser.me/api/portraits/women/96.jpg', rating: 4.6, reviewCount: 98, experience: 8, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹3.2 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Delhi, NCR', bio: 'Commercial property fire coverage.', insuranceCompanies: ['United India Insurance Company Limited', 'Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43263', whatsapp: '+91 98765 43263' } },
  { id: '51', name: 'Pankaj Agarwal', profileImage: 'https://randomuser.me/api/portraits/men/97.jpg', rating: 4.9, reviewCount: 178, experience: 14, specializations: ['Fire', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 267, claimsAmount: '₹6.1 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Ahmedabad, Gujarat', bio: 'Factory fire insurance specialist.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43264', whatsapp: '+91 98765 43264' } },
  { id: '52', name: 'Uma Devi', profileImage: 'https://randomuser.me/api/portraits/women/97.jpg', rating: 4.5, reviewCount: 82, experience: 6, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹2.1 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Residential fire coverage expert.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Magma General Insurance Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43265', whatsapp: '+91 98765 43265' } },
  { id: '53', name: 'Girish Shetty', profileImage: 'https://randomuser.me/api/portraits/men/98.jpg', rating: 4.7, reviewCount: 123, experience: 10, specializations: ['Fire', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.8 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Bangalore, Karnataka', bio: 'Warehouse fire insurance advisor.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43266', whatsapp: '+91 98765 43266' } },
  { id: '54', name: 'Lalita Kumari', profileImage: 'https://randomuser.me/api/portraits/women/98.jpg', rating: 4.8, reviewCount: 145, experience: 11, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹4.2 Cr', matchingScore: 94, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Kolkata, West Bengal', bio: 'Large risk fire insurance expert.', insuranceCompanies: ['National Insurance Company Limited', 'The New India Assurance Company Limited', 'Go Digit General Insurance Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43267', whatsapp: '+91 98765 43267' } },
  { id: '55', name: 'Naveen Reddy', profileImage: 'https://randomuser.me/api/portraits/men/99.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Fire', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.6 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Policy Review'], location: 'Hyderabad, Telangana', bio: 'IT park fire coverage specialist.', insuranceCompanies: ['Liberty General Insurance Limited', 'Shriram General Insurance Company Limited', 'Acko General Insurance Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43268', whatsapp: '+91 98765 43268' } },
  { id: '56', name: 'Anupama Iyer', profileImage: 'https://randomuser.me/api/portraits/women/99.jpg', rating: 4.9, reviewCount: 167, experience: 13, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹5.5 Cr', matchingScore: 97, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Pune, Maharashtra', bio: 'Top fire insurance consultant.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'United India Insurance Company Limited', 'Kshema General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43269', whatsapp: '+91 98765 43269' } },
  { id: '57', name: 'Sudhir Saxena', profileImage: 'https://randomuser.me/api/portraits/men/11.jpg', rating: 4.5, reviewCount: 86, experience: 6, specializations: ['Fire', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 89, claimsAmount: '₹1.9 Cr', matchingScore: 82, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Jaipur, Rajasthan', bio: 'Hotel fire insurance expert.', insuranceCompanies: ['Bajaj General Insurance Limited', 'SBI General Insurance Company Limited', 'Navi General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43270', whatsapp: '+91 98765 43270' } },
  { id: '58', name: 'Bhavana Rao', profileImage: 'https://randomuser.me/api/portraits/women/11.jpg', rating: 4.7, reviewCount: 112, experience: 9, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.4 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Visakhapatnam, AP', bio: 'Industrial estates coverage advisor.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43271', whatsapp: '+91 98765 43271' } },
  { id: '59', name: 'Hemant Jain', profileImage: 'https://randomuser.me/api/portraits/men/12.jpg', rating: 4.8, reviewCount: 134, experience: 10, specializations: ['Fire', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹4.0 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Lucknow, UP', bio: 'Mall and retail fire coverage.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Reliance General Insurance Company Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43272', whatsapp: '+91 98765 43272' } },
  { id: '60', name: 'Veena Krishnan', profileImage: 'https://randomuser.me/api/portraits/women/12.jpg', rating: 4.6, reviewCount: 98, experience: 7, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 123, claimsAmount: '₹2.8 Cr', matchingScore: 87, serviceTypes: ['New Policy', 'Policy Review'], location: 'Kochi, Kerala', bio: 'Multi-location fire policy expert.', insuranceCompanies: ['National Insurance Company Limited', 'Agriculture Insurance Company of India Limited', 'ECGC Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43273', whatsapp: '+91 98765 43273' } },

  // Marine Insurance Specialists
  { id: '61', name: 'Kapil Dev', profileImage: 'https://randomuser.me/api/portraits/men/13.jpg', rating: 4.9, reviewCount: 178, experience: 15, specializations: ['Marine', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 289, claimsAmount: '₹7.2 Cr', matchingScore: 98, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Maritime cargo insurance expert.', insuranceCompanies: ['The New India Assurance Company Limited', 'National Insurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43274', whatsapp: '+91 98765 43274' } },
  { id: '62', name: 'Saroja Menon', profileImage: 'https://randomuser.me/api/portraits/women/13.jpg', rating: 4.7, reviewCount: 134, experience: 11, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹4.8 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Port cargo insurance specialist.', insuranceCompanies: ['United India Insurance Company Limited', 'Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43275', whatsapp: '+91 98765 43275' } },
  { id: '63', name: 'Rakesh Sharma', profileImage: 'https://randomuser.me/api/portraits/men/14.jpg', rating: 4.6, reviewCount: 98, experience: 8, specializations: ['Marine', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹3.2 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kolkata, West Bengal', bio: 'Inland waterway cargo expert.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43276', whatsapp: '+91 98765 43276' } },
  { id: '64', name: 'Vasudha Patil', profileImage: 'https://randomuser.me/api/portraits/women/14.jpg', rating: 4.8, reviewCount: 145, experience: 10, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹4.0 Cr', matchingScore: 94, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Ship hull insurance advisor.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43277', whatsapp: '+91 98765 43277' } },
  { id: '65', name: 'Vinod Kumar', profileImage: 'https://randomuser.me/api/portraits/men/15.jpg', rating: 4.5, reviewCount: 82, experience: 6, specializations: ['Marine', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 89, claimsAmount: '₹2.1 Cr', matchingScore: 83, serviceTypes: ['New Policy', 'Policy Review'], location: 'Kochi, Kerala', bio: 'Fishing vessel insurance expert.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Magma General Insurance Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43278', whatsapp: '+91 98765 43278' } },
  { id: '66', name: 'Shyamala Devi', profileImage: 'https://randomuser.me/api/portraits/women/15.jpg', rating: 4.9, reviewCount: 167, experience: 13, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹5.8 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Goa', bio: 'International marine cargo expert.', insuranceCompanies: ['The New India Assurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited', 'Go Digit General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43279', whatsapp: '+91 98765 43279' } },
  { id: '67', name: 'Jayant Iyer', profileImage: 'https://randomuser.me/api/portraits/men/16.jpg', rating: 4.7, reviewCount: 112, experience: 9, specializations: ['Marine', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.6 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Mangalore, Karnataka', bio: 'Container freight insurance.', insuranceCompanies: ['National Insurance Company Limited', 'Liberty General Insurance Limited', 'Shriram General Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43280', whatsapp: '+91 98765 43280' } },
  { id: '68', name: 'Ranjana Bose', profileImage: 'https://randomuser.me/api/portraits/women/16.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.6 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Oil tanker insurance specialist.', insuranceCompanies: ['United India Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited', 'Kshema General Insurance Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43281', whatsapp: '+91 98765 43281' } },
  { id: '69', name: 'Arvind Swamy', profileImage: 'https://randomuser.me/api/portraits/men/17.jpg', rating: 4.8, reviewCount: 134, experience: 11, specializations: ['Marine', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹4.4 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Chennai, Tamil Nadu', bio: 'Port liability coverage expert.', insuranceCompanies: ['Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited', 'Acko General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43282', whatsapp: '+91 98765 43282' } },
  { id: '70', name: 'Madhavi Reddy', profileImage: 'https://randomuser.me/api/portraits/women/17.jpg', rating: 4.5, reviewCount: 86, experience: 6, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹2.2 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Shipyard insurance advisor.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited', 'Navi General Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43283', whatsapp: '+91 98765 43283' } },
  { id: '71', name: 'Subramaniam K', profileImage: 'https://randomuser.me/api/portraits/men/18.jpg', rating: 4.9, reviewCount: 156, experience: 14, specializations: ['Marine', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 256, claimsAmount: '₹6.2 Cr', matchingScore: 97, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Tuticorin, TN', bio: 'Multi-modal transport insurance.', insuranceCompanies: ['The New India Assurance Company Limited', 'Reliance General Insurance Company Limited', 'ECGC Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43284', whatsapp: '+91 98765 43284' } },
  { id: '72', name: 'Gayatri Nair', profileImage: 'https://randomuser.me/api/portraits/women/18.jpg', rating: 4.7, reviewCount: 103, experience: 8, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹3.0 Cr', matchingScore: 89, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Kochi, Kerala', bio: 'Coastal shipping insurance.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43285', whatsapp: '+91 98765 43285' } },

  // Liability Insurance Specialists
  { id: '73', name: 'Abhishek Bansal', profileImage: 'https://randomuser.me/api/portraits/men/19.jpg', rating: 4.8, reviewCount: 145, experience: 12, specializations: ['Liability', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹5.2 Cr', matchingScore: 94, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Professional liability expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Tata AIG General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43286', whatsapp: '+91 98765 43286' } },
  { id: '74', name: 'Nirmala Gupta', profileImage: 'https://randomuser.me/api/portraits/women/19.jpg', rating: 4.6, reviewCount: 98, experience: 8, specializations: ['Liability'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹3.1 Cr', matchingScore: 87, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Delhi, NCR', bio: 'Directors & Officers liability.', insuranceCompanies: ['Bajaj General Insurance Limited', 'The New India Assurance Company Limited', 'National Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43287', whatsapp: '+91 98765 43287' } },
  { id: '75', name: 'Santosh Hegde', profileImage: 'https://randomuser.me/api/portraits/men/21.jpg', rating: 4.9, reviewCount: 167, experience: 14, specializations: ['Liability', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 245, claimsAmount: '₹6.0 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Bangalore, Karnataka', bio: 'Cyber liability insurance expert.', insuranceCompanies: ['United India Insurance Company Limited', 'SBI General Insurance Company Limited', 'Reliance General Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43288', whatsapp: '+91 98765 43288' } },
  { id: '76', name: 'Kamala Sundaram', profileImage: 'https://randomuser.me/api/portraits/women/21.jpg', rating: 4.5, reviewCount: 82, experience: 6, specializations: ['Liability'], verified: true, irdaLicensed: true, claimsSettled: 89, claimsAmount: '₹2.0 Cr', matchingScore: 83, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Product liability specialist.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43289', whatsapp: '+91 98765 43289' } },
  { id: '77', name: 'Prasad Rao', profileImage: 'https://randomuser.me/api/portraits/men/23.jpg', rating: 4.7, reviewCount: 112, experience: 9, specializations: ['Liability', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.6 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Policy Review'], location: 'Hyderabad, Telangana', bio: 'Public liability coverage advisor.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Liberty General Insurance Limited', 'Magma General Insurance Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43290', whatsapp: '+91 98765 43290' } },
  { id: '78', name: 'Archana Singh', profileImage: 'https://randomuser.me/api/portraits/women/23.jpg', rating: 4.8, reviewCount: 134, experience: 10, specializations: ['Liability'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹4.2 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kolkata, West Bengal', bio: 'Medical malpractice insurance.', insuranceCompanies: ['The New India Assurance Company Limited', 'Go Digit General Insurance Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43291', whatsapp: '+91 98765 43291' } },
  { id: '79', name: 'Kishore Kumar', profileImage: 'https://randomuser.me/api/portraits/men/24.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Liability', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.5 Cr', matchingScore: 85, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Employer liability expert.', insuranceCompanies: ['National Insurance Company Limited', 'Shriram General Insurance Company Limited', 'Kshema General Insurance Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43292', whatsapp: '+91 98765 43292' } },
  { id: '80', name: 'Sumitra Devi', profileImage: 'https://randomuser.me/api/portraits/women/24.jpg', rating: 4.9, reviewCount: 156, experience: 12, specializations: ['Liability'], verified: true, irdaLicensed: true, claimsSettled: 212, claimsAmount: '₹5.0 Cr', matchingScore: 95, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Pune, Maharashtra', bio: 'Top liability insurance consultant.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited', 'Acko General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43293', whatsapp: '+91 98765 43293' } },
  { id: '81', name: 'Mahendra Patel', profileImage: 'https://randomuser.me/api/portraits/men/25.jpg', rating: 4.5, reviewCount: 86, experience: 6, specializations: ['Liability', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹2.2 Cr', matchingScore: 82, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Surat, Gujarat', bio: 'Contractor liability insurance.', insuranceCompanies: ['United India Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited', 'Navi General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43294', whatsapp: '+91 98765 43294' } },
  { id: '82', name: 'Jyoti Sharma', profileImage: 'https://randomuser.me/api/portraits/women/25.jpg', rating: 4.7, reviewCount: 103, experience: 8, specializations: ['Liability'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹3.3 Cr', matchingScore: 89, serviceTypes: ['New Policy', 'Policy Review'], location: 'Jaipur, Rajasthan', bio: 'Environmental liability expert.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43295', whatsapp: '+91 98765 43295' } },
  { id: '83', name: 'Nagendra Yadav', profileImage: 'https://randomuser.me/api/portraits/men/26.jpg', rating: 4.8, reviewCount: 123, experience: 10, specializations: ['Liability', 'Marine'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.9 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Lucknow, UP', bio: 'Professional indemnity coverage.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'The Oriental Insurance Company Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43296', whatsapp: '+91 98765 43296' } },
  { id: '84', name: 'Pushpa Lal', profileImage: 'https://randomuser.me/api/portraits/women/26.jpg', rating: 4.6, reviewCount: 94, experience: 7, specializations: ['Liability'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.6 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Patna, Bihar', bio: 'General liability plans expert.', insuranceCompanies: ['National Insurance Company Limited', 'Agriculture Insurance Company of India Limited', 'ECGC Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43297', whatsapp: '+91 98765 43297' } },

  // SME Insurance Specialists
  { id: '85', name: 'Anand Krishnan', profileImage: 'https://randomuser.me/api/portraits/men/27.jpg', rating: 4.9, reviewCount: 178, experience: 13, specializations: ['SME', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹5.8 Cr', matchingScore: 97, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'SME package policy expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'The New India Assurance Company Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43298', whatsapp: '+91 98765 43298' } },
  { id: '86', name: 'Revathi Subramanian', profileImage: 'https://randomuser.me/api/portraits/women/27.jpg', rating: 4.7, reviewCount: 123, experience: 9, specializations: ['SME'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.6 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Retail shop insurance specialist.', insuranceCompanies: ['Bajaj General Insurance Limited', 'SBI General Insurance Company Limited', 'Tata AIG General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43299', whatsapp: '+91 98765 43299' } },
  { id: '87', name: 'Dhananjay Mishra', profileImage: 'https://randomuser.me/api/portraits/men/28.jpg', rating: 4.6, reviewCount: 98, experience: 7, specializations: ['SME', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.5 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Policy Review'], location: 'Delhi, NCR', bio: 'Manufacturing SME coverage.', insuranceCompanies: ['United India Insurance Company Limited', 'National Insurance Company Limited', 'Reliance General Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43300', whatsapp: '+91 98765 43300' } },
  { id: '88', name: 'Savita Agarwal', profileImage: 'https://randomuser.me/api/portraits/women/28.jpg', rating: 4.8, reviewCount: 145, experience: 11, specializations: ['SME'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹4.2 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Bangalore, Karnataka', bio: 'IT startup insurance expert.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Go Digit General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43301', whatsapp: '+91 98765 43301' } },
  { id: '89', name: 'Brijesh Shah', profileImage: 'https://randomuser.me/api/portraits/men/29.jpg', rating: 4.5, reviewCount: 82, experience: 5, specializations: ['SME', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 78, claimsAmount: '₹1.6 Cr', matchingScore: 81, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Textile SME insurance advisor.', insuranceCompanies: ['Royal Sundaram General Insurance Company Limited', 'Liberty General Insurance Limited', 'Magma General Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43302', whatsapp: '+91 98765 43302' } },
  { id: '90', name: 'Malini Rajan', profileImage: 'https://randomuser.me/api/portraits/women/29.jpg', rating: 4.9, reviewCount: 167, experience: 12, specializations: ['SME'], verified: true, irdaLicensed: true, claimsSettled: 212, claimsAmount: '₹5.0 Cr', matchingScore: 95, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Kochi, Kerala', bio: 'Tourism SME packages expert.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Shriram General Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43303', whatsapp: '+91 98765 43303' } },
  { id: '91', name: 'Chandrasekhar P', profileImage: 'https://randomuser.me/api/portraits/men/31.jpg', rating: 4.7, reviewCount: 112, experience: 8, specializations: ['SME', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹3.2 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Healthcare SME coverage advisor.', insuranceCompanies: ['The New India Assurance Company Limited', 'Zurich Kotak General Insurance Company Limited', 'Acko General Insurance Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43304', whatsapp: '+91 98765 43304' } },
  { id: '92', name: 'Indira Kumari', profileImage: 'https://randomuser.me/api/portraits/women/31.jpg', rating: 4.6, reviewCount: 94, experience: 6, specializations: ['SME'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹2.1 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Policy Review'], location: 'Kolkata, West Bengal', bio: 'Restaurant insurance specialist.', insuranceCompanies: ['National Insurance Company Limited', 'Bajaj General Insurance Limited', 'Navi General Insurance Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43305', whatsapp: '+91 98765 43305' } },
  { id: '93', name: 'Yashwant Rao', profileImage: 'https://randomuser.me/api/portraits/men/33.jpg', rating: 4.8, reviewCount: 134, experience: 10, specializations: ['SME', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹4.0 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Pune, Maharashtra', bio: 'Engineering SME insurance.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'SBI General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43306', whatsapp: '+91 98765 43306' } },
  { id: '94', name: 'Radha Krishna', profileImage: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 4.5, reviewCount: 86, experience: 5, specializations: ['SME'], verified: true, irdaLicensed: true, claimsSettled: 87, claimsAmount: '₹1.8 Cr', matchingScore: 82, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Pharmaceutical SME coverage.', insuranceCompanies: ['United India Insurance Company Limited', 'Tata AIG General Insurance Company Limited', 'Kshema General Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43307', whatsapp: '+91 98765 43307' } },
  { id: '95', name: 'Mukesh Verma', profileImage: 'https://randomuser.me/api/portraits/men/34.jpg', rating: 4.9, reviewCount: 156, experience: 14, specializations: ['SME', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 245, claimsAmount: '₹5.6 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Surat, Gujarat', bio: 'Diamond industry SME expert.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'The Oriental Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43308', whatsapp: '+91 98765 43308' } },
  { id: '96', name: 'Usha Rani', profileImage: 'https://randomuser.me/api/portraits/women/34.jpg', rating: 4.7, reviewCount: 103, experience: 8, specializations: ['SME'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹3.0 Cr', matchingScore: 89, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Jaipur, Rajasthan', bio: 'Handicraft SME insurance advisor.', insuranceCompanies: ['Royal Sundaram General Insurance Company Limited', 'Go Digit General Insurance Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43309', whatsapp: '+91 98765 43309' } },

  // Other General Insurance Specialists
  { id: '97', name: 'Lokesh Sharma', profileImage: 'https://randomuser.me/api/portraits/men/35.jpg', rating: 4.8, reviewCount: 145, experience: 11, specializations: ['Other General', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹4.4 Cr', matchingScore: 93, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Mumbai, Maharashtra', bio: 'Miscellaneous insurance expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'The New India Assurance Company Limited', 'National Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43310', whatsapp: '+91 98765 43310' } },
  { id: '98', name: 'Bharati Devi', profileImage: 'https://randomuser.me/api/portraits/women/35.jpg', rating: 4.6, reviewCount: 98, experience: 7, specializations: ['Other General'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.5 Cr', matchingScore: 86, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Delhi, NCR', bio: 'Burglary insurance specialist.', insuranceCompanies: ['United India Insurance Company Limited', 'Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43311', whatsapp: '+91 98765 43311' } },
  { id: '99', name: 'Omprakash Gupta', profileImage: 'https://randomuser.me/api/portraits/men/36.jpg', rating: 4.9, reviewCount: 167, experience: 13, specializations: ['Other General', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 223, claimsAmount: '₹5.2 Cr', matchingScore: 96, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Bangalore, Karnataka', bio: 'Money insurance coverage expert.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'SBI General Insurance Company Limited', 'Tata AIG General Insurance Company Limited'], complaintTypes: ['rejection', 'short-settled'], contactInfo: { phone: '+91 98765 43312', whatsapp: '+91 98765 43312' } },
  { id: '100', name: 'Vanaja Krishnamurthy', profileImage: 'https://randomuser.me/api/portraits/women/36.jpg', rating: 4.5, reviewCount: 82, experience: 5, specializations: ['Other General'], verified: true, irdaLicensed: true, claimsSettled: 78, claimsAmount: '₹1.6 Cr', matchingScore: 81, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Plate glass insurance advisor.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Go Digit General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43313', whatsapp: '+91 98765 43313' } },
  { id: '101', name: 'Trilok Singh', profileImage: 'https://randomuser.me/api/portraits/men/37.jpg', rating: 4.7, reviewCount: 112, experience: 9, specializations: ['Other General', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.5 Cr', matchingScore: 90, serviceTypes: ['New Policy', 'Policy Review'], location: 'Ahmedabad, Gujarat', bio: 'Electronic equipment insurance.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited', 'Liberty General Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43314', whatsapp: '+91 98765 43314' } },
  { id: '102', name: 'Sarojini Devi', profileImage: 'https://randomuser.me/api/portraits/women/37.jpg', rating: 4.8, reviewCount: 134, experience: 10, specializations: ['Other General'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.8 Cr', matchingScore: 92, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Hyderabad, Telangana', bio: 'Contractor all risks insurance.', insuranceCompanies: ['The New India Assurance Company Limited', 'Magma General Insurance Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43315', whatsapp: '+91 98765 43315' } },
  { id: '103', name: 'Narendra Joshi', profileImage: 'https://randomuser.me/api/portraits/men/38.jpg', rating: 4.6, reviewCount: 94, experience: 6, specializations: ['Other General', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹2.1 Cr', matchingScore: 84, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Kolkata, West Bengal', bio: 'Fidelity guarantee insurance.', insuranceCompanies: ['National Insurance Company Limited', 'Shriram General Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43316', whatsapp: '+91 98765 43316' } },
  { id: '104', name: 'Hemalatha Iyer', profileImage: 'https://randomuser.me/api/portraits/women/38.jpg', rating: 4.9, reviewCount: 156, experience: 12, specializations: ['Other General'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹4.6 Cr', matchingScore: 95, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Pune, Maharashtra', bio: 'Top miscellaneous consultant.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited', 'Acko General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43317', whatsapp: '+91 98765 43317' } },
  { id: '105', name: 'Gopalakrishnan R', profileImage: 'https://randomuser.me/api/portraits/men/39.jpg', rating: 4.5, reviewCount: 86, experience: 5, specializations: ['Other General', 'Fire'], verified: true, irdaLicensed: true, claimsSettled: 87, claimsAmount: '₹1.8 Cr', matchingScore: 82, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Kochi, Kerala', bio: 'Event insurance specialist.', insuranceCompanies: ['United India Insurance Company Limited', 'SBI General Insurance Company Limited', 'Navi General Insurance Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43318', whatsapp: '+91 98765 43318' } },
  { id: '106', name: 'Lakshmi Priya', profileImage: 'https://randomuser.me/api/portraits/women/39.jpg', rating: 4.7, reviewCount: 103, experience: 8, specializations: ['Other General'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹3.0 Cr', matchingScore: 88, serviceTypes: ['New Policy', 'Policy Review'], location: 'Visakhapatnam, AP', bio: 'Machinery breakdown coverage.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'HDFC ERGO General Insurance Company Limited', 'Kshema General Insurance Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43319', whatsapp: '+91 98765 43319' } },
  { id: '107', name: 'Devendra Singh', profileImage: 'https://randomuser.me/api/portraits/men/41.jpg', rating: 4.8, reviewCount: 123, experience: 10, specializations: ['Other General', 'Liability'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.8 Cr', matchingScore: 91, serviceTypes: ['New Policy', 'Claim Assistance', 'Policy Review'], location: 'Jaipur, Rajasthan', bio: 'Jeweler block insurance.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'The Oriental Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43320', whatsapp: '+91 98765 43320' } },
  { id: '108', name: 'Parvati Devi', profileImage: 'https://randomuser.me/api/portraits/women/41.jpg', rating: 4.6, reviewCount: 94, experience: 6, specializations: ['Other General'], verified: true, irdaLicensed: true, claimsSettled: 98, claimsAmount: '₹2.2 Cr', matchingScore: 85, serviceTypes: ['New Policy', 'Claim Assistance'], location: 'Lucknow, UP', bio: 'Boiler and pressure vessel.', insuranceCompanies: ['National Insurance Company Limited', 'Agriculture Insurance Company of India Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43321', whatsapp: '+91 98765 43321' } },

  // Additional Claim Assistance Specialists - Health Insurance
  { id: '109', name: 'Rakesh Agarwal', profileImage: 'https://randomuser.me/api/portraits/men/42.jpg', rating: 4.9, reviewCount: 198, experience: 15, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 312, claimsAmount: '₹6.8 Cr', matchingScore: 98, serviceTypes: ['Claim Assistance'], location: 'Mumbai, Maharashtra', bio: 'Senior health claim specialist.', insuranceCompanies: ['Star Health & Allied Insurance Co. Ltd.', 'Care Health Insurance Ltd.', 'Niva Bupa Health Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43322', whatsapp: '+91 98765 43322' } },
  { id: '110', name: 'Smita Kulkarni', profileImage: 'https://randomuser.me/api/portraits/women/42.jpg', rating: 4.8, reviewCount: 167, experience: 12, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 256, claimsAmount: '₹5.2 Cr', matchingScore: 95, serviceTypes: ['Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Health claim rejection expert.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'ManipalCigna Health Insurance Company Limited', 'Aditya Birla Health Insurance Co. Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43323', whatsapp: '+91 98765 43323' } },
  { id: '111', name: 'Anil Srivastava', profileImage: 'https://randomuser.me/api/portraits/men/43.jpg', rating: 4.7, reviewCount: 145, experience: 10, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹4.1 Cr', matchingScore: 92, serviceTypes: ['Claim Assistance'], location: 'Delhi, NCR', bio: 'Health claim delay resolution.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Reliance Health Insurance Ltd.', 'Galaxy Health and Allied Insurance Company Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43324', whatsapp: '+91 98765 43324' } },
  { id: '112', name: 'Urvashi Mehta', profileImage: 'https://randomuser.me/api/portraits/women/43.jpg', rating: 4.6, reviewCount: 123, experience: 8, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.2 Cr', matchingScore: 89, serviceTypes: ['Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Health mis-selling complaints.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited', 'Narayana Health Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43325', whatsapp: '+91 98765 43325' } },
  { id: '113', name: 'Dinesh Babu', profileImage: 'https://randomuser.me/api/portraits/men/44.jpg', rating: 4.9, reviewCount: 178, experience: 13, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 278, claimsAmount: '₹5.8 Cr', matchingScore: 96, serviceTypes: ['Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Health claim short settlement.', insuranceCompanies: ['National Insurance Company Limited', 'The New India Assurance Company Limited', 'United India Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43326', whatsapp: '+91 98765 43326' } },
  { id: '114', name: 'Pallavi Sharma', profileImage: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4.7, reviewCount: 134, experience: 9, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.5 Cr', matchingScore: 90, serviceTypes: ['Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Health cashless claim issues.', insuranceCompanies: ['Bajaj General Insurance Limited', 'Go Digit General Insurance Limited', 'Acko General Insurance Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43327', whatsapp: '+91 98765 43327' } },
  { id: '115', name: 'Ravi Shankar', profileImage: 'https://randomuser.me/api/portraits/men/46.jpg', rating: 4.8, reviewCount: 156, experience: 11, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 212, claimsAmount: '₹4.5 Cr', matchingScore: 93, serviceTypes: ['Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Critical illness claim expert.', insuranceCompanies: ['Cholamandalam MS General Insurance Company Limited', 'Liberty General Insurance Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43328', whatsapp: '+91 98765 43328' } },
  { id: '116', name: 'Asha Prabhu', profileImage: 'https://randomuser.me/api/portraits/women/46.jpg', rating: 4.5, reviewCount: 98, experience: 6, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.3 Cr', matchingScore: 85, serviceTypes: ['Claim Assistance'], location: 'Kochi, Kerala', bio: 'Senior citizen health claims.', insuranceCompanies: ['Magma General Insurance Limited', 'Reliance General Insurance Company Limited', 'The Oriental Insurance Company Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43329', whatsapp: '+91 98765 43329' } },
  { id: '117', name: 'Karthik Raja', profileImage: 'https://randomuser.me/api/portraits/men/48.jpg', rating: 4.9, reviewCount: 189, experience: 14, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 298, claimsAmount: '₹6.2 Cr', matchingScore: 97, serviceTypes: ['Claim Assistance'], location: 'Coimbatore, TN', bio: 'Health claim appeal specialist.', insuranceCompanies: ['Star Health & Allied Insurance Co. Ltd.', 'Care Health Insurance Ltd.', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43330', whatsapp: '+91 98765 43330' } },
  { id: '118', name: 'Nandini Rao', profileImage: 'https://randomuser.me/api/portraits/women/48.jpg', rating: 4.6, reviewCount: 112, experience: 7, specializations: ['Health'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.8 Cr', matchingScore: 87, serviceTypes: ['Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Family floater claim issues.', insuranceCompanies: ['Niva Bupa Health Insurance Company Limited', 'ManipalCigna Health Insurance Company Limited', 'Aditya Birla Health Insurance Co. Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43331', whatsapp: '+91 98765 43331' } },

  // Additional Claim Assistance Specialists - Life Insurance
  { id: '119', name: 'Mohan Lal', profileImage: 'https://randomuser.me/api/portraits/men/49.jpg', rating: 4.9, reviewCount: 212, experience: 16, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 345, claimsAmount: '₹8.5 Cr', matchingScore: 98, serviceTypes: ['Claim Assistance'], location: 'Delhi, NCR', bio: 'LIC death claim specialist.', insuranceCompanies: ['Life Insurance Corporation of India', 'SBI Life Insurance Company Limited', 'HDFC Life Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43332', whatsapp: '+91 98765 43332' } },
  { id: '120', name: 'Sudha Murthy', profileImage: 'https://randomuser.me/api/portraits/women/49.jpg', rating: 4.8, reviewCount: 178, experience: 13, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 267, claimsAmount: '₹6.2 Cr', matchingScore: 95, serviceTypes: ['Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Life claim rejection appeals.', insuranceCompanies: ['ICICI Prudential Life Insurance Company Limited', 'Kotak Mahindra Life Insurance Company Limited', 'Axis Max Life Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43333', whatsapp: '+91 98765 43333' } },
  { id: '121', name: 'Vinod Kumar', profileImage: 'https://randomuser.me/api/portraits/men/52.jpg', rating: 4.7, reviewCount: 156, experience: 11, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 212, claimsAmount: '₹5.0 Cr', matchingScore: 92, serviceTypes: ['Claim Assistance'], location: 'Mumbai, Maharashtra', bio: 'Term life claim expert.', insuranceCompanies: ['TATA AIA Life Insurance Company Limited', 'Bajaj Life Insurance Limited', 'PNB MetLife India Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43334', whatsapp: '+91 98765 43334' } },
  { id: '122', name: 'Kamini Devi', profileImage: 'https://randomuser.me/api/portraits/women/52.jpg', rating: 4.6, reviewCount: 134, experience: 9, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹3.8 Cr', matchingScore: 89, serviceTypes: ['Claim Assistance'], location: 'Kolkata, West Bengal', bio: 'ULIP maturity claim issues.', insuranceCompanies: ['Aditya Birla SunLife Insurance Company Limited', 'Reliance Nippon Life Insurance Company Limited', 'Canara HSBC Life Insurance Company Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43335', whatsapp: '+91 98765 43335' } },
  { id: '123', name: 'Suresh Babu', profileImage: 'https://randomuser.me/api/portraits/men/53.jpg', rating: 4.9, reviewCount: 189, experience: 14, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 289, claimsAmount: '₹7.2 Cr', matchingScore: 96, serviceTypes: ['Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Endowment claim specialist.', insuranceCompanies: ['Life Insurance Corporation of India', 'Shriram Life Insurance Company Limited', 'Ageas Federal Life Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43336', whatsapp: '+91 98765 43336' } },
  { id: '124', name: 'Lata Mangeshkar', profileImage: 'https://randomuser.me/api/portraits/women/53.jpg', rating: 4.7, reviewCount: 145, experience: 10, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹4.2 Cr', matchingScore: 91, serviceTypes: ['Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Pension plan claim issues.', insuranceCompanies: ['HDFC Life Insurance Company Limited', 'ICICI Prudential Life Insurance Company Limited', 'Bandhan Life Insurance Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43337', whatsapp: '+91 98765 43337' } },
  { id: '125', name: 'Ganesh Prasad', profileImage: 'https://randomuser.me/api/portraits/men/54.jpg', rating: 4.8, reviewCount: 167, experience: 12, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹5.5 Cr', matchingScore: 94, serviceTypes: ['Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Life claim delay resolution.', insuranceCompanies: ['SBI Life Insurance Company Limited', 'Kotak Mahindra Life Insurance Company Limited', 'Pramerica Life Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43338', whatsapp: '+91 98765 43338' } },
  { id: '126', name: 'Veena Kapoor', profileImage: 'https://randomuser.me/api/portraits/women/54.jpg', rating: 4.5, reviewCount: 112, experience: 7, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹3.0 Cr', matchingScore: 86, serviceTypes: ['Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Money back policy claims.', insuranceCompanies: ['TATA AIA Life Insurance Company Limited', 'Bharti AXA Life Insurance Company Limited', 'Star Union Dai-Ichi Life Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43339', whatsapp: '+91 98765 43339' } },
  { id: '127', name: 'Ramakrishna Rao', profileImage: 'https://randomuser.me/api/portraits/men/56.jpg', rating: 4.9, reviewCount: 198, experience: 15, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 312, claimsAmount: '₹7.8 Cr', matchingScore: 97, serviceTypes: ['Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Senior life claim advisor.', insuranceCompanies: ['Life Insurance Corporation of India', 'IndiaFirst Life Insurance Company Limited', 'Edelweiss Life Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43340', whatsapp: '+91 98765 43340' } },
  { id: '128', name: 'Shobha Rani', profileImage: 'https://randomuser.me/api/portraits/women/56.jpg', rating: 4.6, reviewCount: 123, experience: 8, specializations: ['Life'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.5 Cr', matchingScore: 88, serviceTypes: ['Claim Assistance'], location: 'Kochi, Kerala', bio: 'Child plan claim specialist.', insuranceCompanies: ['HDFC Life Insurance Company Limited', 'CreditAccess Life Insurance Limited', 'Acko Life Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43341', whatsapp: '+91 98765 43341' } },

  // Additional Claim Assistance Specialists - Motor Insurance
  { id: '129', name: 'Ajay Devgan', profileImage: 'https://randomuser.me/api/portraits/men/57.jpg', rating: 4.9, reviewCount: 201, experience: 14, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 356, claimsAmount: '₹7.2 Cr', matchingScore: 97, serviceTypes: ['Claim Assistance'], location: 'Mumbai, Maharashtra', bio: 'Car accident claim expert.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43342', whatsapp: '+91 98765 43342' } },
  { id: '130', name: 'Renu Desai', profileImage: 'https://randomuser.me/api/portraits/women/57.jpg', rating: 4.8, reviewCount: 178, experience: 11, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 267, claimsAmount: '₹5.5 Cr', matchingScore: 94, serviceTypes: ['Claim Assistance'], location: 'Delhi, NCR', bio: 'Motor third party claims.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'Go Digit General Insurance Limited', 'Acko General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43343', whatsapp: '+91 98765 43343' } },
  { id: '131', name: 'Praveen Kumar', profileImage: 'https://randomuser.me/api/portraits/men/58.jpg', rating: 4.7, reviewCount: 156, experience: 9, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹4.1 Cr', matchingScore: 91, serviceTypes: ['Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Two-wheeler claim specialist.', insuranceCompanies: ['SBI General Insurance Company Limited', 'The New India Assurance Company Limited', 'United India Insurance Company Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43344', whatsapp: '+91 98765 43344' } },
  { id: '132', name: 'Swati Sharma', profileImage: 'https://randomuser.me/api/portraits/women/58.jpg', rating: 4.6, reviewCount: 134, experience: 7, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.2 Cr', matchingScore: 88, serviceTypes: ['Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Motor own damage claims.', insuranceCompanies: ['National Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43345', whatsapp: '+91 98765 43345' } },
  { id: '133', name: 'Harish Chandra', profileImage: 'https://randomuser.me/api/portraits/men/61.jpg', rating: 4.9, reviewCount: 189, experience: 13, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 289, claimsAmount: '₹6.0 Cr', matchingScore: 96, serviceTypes: ['Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Commercial vehicle claims.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Reliance General Insurance Company Limited', 'Liberty General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43346', whatsapp: '+91 98765 43346' } },
  { id: '134', name: 'Kavitha Nair', profileImage: 'https://randomuser.me/api/portraits/women/61.jpg', rating: 4.7, reviewCount: 145, experience: 8, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹3.6 Cr', matchingScore: 90, serviceTypes: ['Claim Assistance'], location: 'Kochi, Kerala', bio: 'Motor theft claim expert.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Magma General Insurance Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43347', whatsapp: '+91 98765 43347' } },
  { id: '135', name: 'Satish Reddy', profileImage: 'https://randomuser.me/api/portraits/men/63.jpg', rating: 4.8, reviewCount: 167, experience: 10, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 223, claimsAmount: '₹4.6 Cr', matchingScore: 93, serviceTypes: ['Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Motor claim delay appeals.', insuranceCompanies: ['Shriram General Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited', 'Navi General Insurance Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43348', whatsapp: '+91 98765 43348' } },
  { id: '136', name: 'Meenakshi Iyer', profileImage: 'https://randomuser.me/api/portraits/women/63.jpg', rating: 4.5, reviewCount: 112, experience: 6, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.7 Cr', matchingScore: 85, serviceTypes: ['Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Motor total loss claims.', insuranceCompanies: ['Kshema General Insurance Limited', 'Zuna General Insurance Ltd.', 'Agriculture Insurance Company of India Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43349', whatsapp: '+91 98765 43349' } },
  { id: '137', name: 'Vijay Kumar', profileImage: 'https://randomuser.me/api/portraits/men/65.jpg', rating: 4.9, reviewCount: 198, experience: 12, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 278, claimsAmount: '₹5.8 Cr', matchingScore: 95, serviceTypes: ['Claim Assistance'], location: 'Jaipur, Rajasthan', bio: 'Fleet motor claim advisor.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43350', whatsapp: '+91 98765 43350' } },
  { id: '138', name: 'Radha Kumari', profileImage: 'https://randomuser.me/api/portraits/women/65.jpg', rating: 4.6, reviewCount: 123, experience: 7, specializations: ['Motor'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹3.0 Cr', matchingScore: 87, serviceTypes: ['Claim Assistance'], location: 'Lucknow, UP', bio: 'Motor cashless claim issues.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited', 'The New India Assurance Company Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43351', whatsapp: '+91 98765 43351' } },

  // Additional Claim Assistance Specialists - Travel Insurance
  { id: '139', name: 'Ashwin Kumar', profileImage: 'https://randomuser.me/api/portraits/men/66.jpg', rating: 4.8, reviewCount: 156, experience: 10, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹3.8 Cr', matchingScore: 93, serviceTypes: ['Claim Assistance'], location: 'Mumbai, Maharashtra', bio: 'International travel claims.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited', 'Tata AIG General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43352', whatsapp: '+91 98765 43352' } },
  { id: '140', name: 'Priyanka Chopra', profileImage: 'https://randomuser.me/api/portraits/women/66.jpg', rating: 4.7, reviewCount: 134, experience: 8, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹3.0 Cr', matchingScore: 90, serviceTypes: ['Claim Assistance'], location: 'Delhi, NCR', bio: 'Medical evacuation claims.', insuranceCompanies: ['Bajaj General Insurance Limited', 'Go Digit General Insurance Limited', 'Care Health Insurance Ltd.'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43353', whatsapp: '+91 98765 43353' } },
  { id: '141', name: 'Rohan Mehra', profileImage: 'https://randomuser.me/api/portraits/men/67.jpg', rating: 4.9, reviewCount: 178, experience: 12, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹4.5 Cr', matchingScore: 96, serviceTypes: ['Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Trip cancellation claims.', insuranceCompanies: ['SBI General Insurance Company Limited', 'Star Health & Allied Insurance Co. Ltd.', 'Reliance General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43354', whatsapp: '+91 98765 43354' } },
  { id: '142', name: 'Anushka Shetty', profileImage: 'https://randomuser.me/api/portraits/women/67.jpg', rating: 4.6, reviewCount: 112, experience: 6, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 123, claimsAmount: '₹2.4 Cr', matchingScore: 87, serviceTypes: ['Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Baggage loss claim expert.', insuranceCompanies: ['The New India Assurance Company Limited', 'United India Insurance Company Limited', 'National Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43355', whatsapp: '+91 98765 43355' } },
  { id: '143', name: 'Nikhil Kumar', profileImage: 'https://randomuser.me/api/portraits/men/68.jpg', rating: 4.8, reviewCount: 145, experience: 9, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹3.5 Cr', matchingScore: 92, serviceTypes: ['Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Travel delay compensation.', insuranceCompanies: ['Cholamandalam MS General Insurance Company Limited', 'Liberty General Insurance Limited', 'Acko General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43356', whatsapp: '+91 98765 43356' } },
  { id: '144', name: 'Shruti Hassan', profileImage: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4.7, reviewCount: 123, experience: 7, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹2.8 Cr', matchingScore: 89, serviceTypes: ['Claim Assistance'], location: 'Kochi, Kerala', bio: 'Visa refusal claims.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited', 'Niva Bupa Health Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43357', whatsapp: '+91 98765 43357' } },
  { id: '145', name: 'Kiran Rao', profileImage: 'https://randomuser.me/api/portraits/men/69.jpg', rating: 4.9, reviewCount: 167, experience: 11, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 212, claimsAmount: '₹4.2 Cr', matchingScore: 95, serviceTypes: ['Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Emergency medical claims.', insuranceCompanies: ['ManipalCigna Health Insurance Company Limited', 'Aditya Birla Health Insurance Co. Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43358', whatsapp: '+91 98765 43358' } },
  { id: '146', name: 'Tamanna Bhatia', profileImage: 'https://randomuser.me/api/portraits/women/69.jpg', rating: 4.5, reviewCount: 98, experience: 5, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹2.1 Cr', matchingScore: 84, serviceTypes: ['Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Student travel claims.', insuranceCompanies: ['Reliance Health Insurance Ltd.', 'Galaxy Health and Allied Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43359', whatsapp: '+91 98765 43359' } },
  { id: '147', name: 'Siddharth Malhotra', profileImage: 'https://randomuser.me/api/portraits/men/72.jpg', rating: 4.8, reviewCount: 156, experience: 10, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹3.6 Cr', matchingScore: 93, serviceTypes: ['Claim Assistance'], location: 'Jaipur, Rajasthan', bio: 'Adventure travel claims.', insuranceCompanies: ['ICICI LOMBARD General Insurance Company Limited', 'Bajaj General Insurance Limited', 'Narayana Health Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43360', whatsapp: '+91 98765 43360' } },
  { id: '148', name: 'Alia Bhatt', profileImage: 'https://randomuser.me/api/portraits/women/72.jpg', rating: 4.6, reviewCount: 112, experience: 6, specializations: ['Travel'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹2.6 Cr', matchingScore: 86, serviceTypes: ['Claim Assistance'], location: 'Lucknow, UP', bio: 'Group travel claim issues.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited', 'Magma General Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43361', whatsapp: '+91 98765 43361' } },

  // Additional Claim Assistance Specialists - Fire Insurance
  { id: '149', name: 'Ramesh Agarwal', profileImage: 'https://randomuser.me/api/portraits/men/73.jpg', rating: 4.9, reviewCount: 189, experience: 14, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 278, claimsAmount: '₹12.5 Cr', matchingScore: 97, serviceTypes: ['Claim Assistance'], location: 'Mumbai, Maharashtra', bio: 'Industrial fire claims.', insuranceCompanies: ['The New India Assurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited', 'National Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43362', whatsapp: '+91 98765 43362' } },
  { id: '150', name: 'Sunita Yadav', profileImage: 'https://randomuser.me/api/portraits/women/73.jpg', rating: 4.8, reviewCount: 167, experience: 11, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 223, claimsAmount: '₹9.8 Cr', matchingScore: 94, serviceTypes: ['Claim Assistance'], location: 'Delhi, NCR', bio: 'Commercial fire claims.', insuranceCompanies: ['United India Insurance Company Limited', 'Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43363', whatsapp: '+91 98765 43363' } },
  { id: '151', name: 'Gopal Krishna', profileImage: 'https://randomuser.me/api/portraits/men/74.jpg', rating: 4.7, reviewCount: 145, experience: 9, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 178, claimsAmount: '₹7.5 Cr', matchingScore: 91, serviceTypes: ['Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Factory fire claim expert.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'Tata AIG General Insurance Company Limited', 'SBI General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43364', whatsapp: '+91 98765 43364' } },
  { id: '152', name: 'Anjali Verma', profileImage: 'https://randomuser.me/api/portraits/women/74.jpg', rating: 4.6, reviewCount: 123, experience: 7, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 145, claimsAmount: '₹5.8 Cr', matchingScore: 88, serviceTypes: ['Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Residential fire claims.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited', 'Go Digit General Insurance Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43365', whatsapp: '+91 98765 43365' } },
  { id: '153', name: 'Raghav Sharma', profileImage: 'https://randomuser.me/api/portraits/men/75.jpg', rating: 4.9, reviewCount: 178, experience: 12, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 256, claimsAmount: '₹11.2 Cr', matchingScore: 96, serviceTypes: ['Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Warehouse fire claims.', insuranceCompanies: ['IFFCO TOKIO General Insurance Company Limited', 'Royal Sundaram General Insurance Company Limited', 'Liberty General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43366', whatsapp: '+91 98765 43366' } },
  { id: '154', name: 'Deepika Padukone', profileImage: 'https://randomuser.me/api/portraits/women/75.jpg', rating: 4.7, reviewCount: 134, experience: 8, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹6.8 Cr', matchingScore: 90, serviceTypes: ['Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Shop fire claim specialist.', insuranceCompanies: ['Magma General Insurance Limited', 'Shriram General Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43367', whatsapp: '+91 98765 43367' } },
  { id: '155', name: 'Arjun Kapoor', profileImage: 'https://randomuser.me/api/portraits/men/76.jpg', rating: 4.8, reviewCount: 156, experience: 10, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹8.5 Cr', matchingScore: 93, serviceTypes: ['Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Textile mill fire claims.', insuranceCompanies: ['The New India Assurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited', 'Zurich Kotak General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43368', whatsapp: '+91 98765 43368' } },
  { id: '156', name: 'Sonakshi Sinha', profileImage: 'https://randomuser.me/api/portraits/women/76.jpg', rating: 4.5, reviewCount: 98, experience: 5, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹4.2 Cr', matchingScore: 84, serviceTypes: ['Claim Assistance'], location: 'Kochi, Kerala', bio: 'Hotel fire claim expert.', insuranceCompanies: ['National Insurance Company Limited', 'United India Insurance Company Limited', 'Navi General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43369', whatsapp: '+91 98765 43369' } },
  { id: '157', name: 'Varun Dhawan', profileImage: 'https://randomuser.me/api/portraits/men/79.jpg', rating: 4.9, reviewCount: 189, experience: 13, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 267, claimsAmount: '₹10.8 Cr', matchingScore: 95, serviceTypes: ['Claim Assistance'], location: 'Jaipur, Rajasthan', bio: 'Allied perils claims.', insuranceCompanies: ['Bajaj General Insurance Limited', 'HDFC ERGO General Insurance Company Limited', 'Tata AIG General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43370', whatsapp: '+91 98765 43370' } },
  { id: '158', name: 'Kiara Advani', profileImage: 'https://randomuser.me/api/portraits/women/79.jpg', rating: 4.6, reviewCount: 112, experience: 6, specializations: ['Fire'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹5.2 Cr', matchingScore: 86, serviceTypes: ['Claim Assistance'], location: 'Lucknow, UP', bio: 'Godown fire claims.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'SBI General Insurance Company Limited', 'Acko General Insurance Limited'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43371', whatsapp: '+91 98765 43371' } },

  // Additional Claim Assistance Specialists - Marine Insurance
  { id: '159', name: 'Sunil Shetty', profileImage: 'https://randomuser.me/api/portraits/men/81.jpg', rating: 4.9, reviewCount: 178, experience: 15, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 289, claimsAmount: '₹15.2 Cr', matchingScore: 98, serviceTypes: ['Claim Assistance'], location: 'Mumbai, Maharashtra', bio: 'Cargo claim specialist.', insuranceCompanies: ['The New India Assurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited', 'United India Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43372', whatsapp: '+91 98765 43372' } },
  { id: '160', name: 'Madhuri Dixit', profileImage: 'https://randomuser.me/api/portraits/women/81.jpg', rating: 4.8, reviewCount: 156, experience: 12, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 234, claimsAmount: '₹11.5 Cr', matchingScore: 95, serviceTypes: ['Claim Assistance'], location: 'Chennai, Tamil Nadu', bio: 'Marine hull claims.', insuranceCompanies: ['National Insurance Company Limited', 'The Oriental Insurance Company Limited', 'ECGC Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43373', whatsapp: '+91 98765 43373' } },
  { id: '161', name: 'Akshay Kumar', profileImage: 'https://randomuser.me/api/portraits/men/82.jpg', rating: 4.7, reviewCount: 145, experience: 10, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 189, claimsAmount: '₹8.8 Cr', matchingScore: 92, serviceTypes: ['Claim Assistance'], location: 'Kochi, Kerala', bio: 'Import cargo claims.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'Tata AIG General Insurance Company Limited', 'Bajaj General Insurance Limited'], complaintTypes: ['delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43374', whatsapp: '+91 98765 43374' } },
  { id: '162', name: 'Kajol Devgan', profileImage: 'https://randomuser.me/api/portraits/women/82.jpg', rating: 4.6, reviewCount: 123, experience: 8, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 156, claimsAmount: '₹6.5 Cr', matchingScore: 89, serviceTypes: ['Claim Assistance'], location: 'Visakhapatnam, AP', bio: 'Export cargo claims.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'SBI General Insurance Company Limited', 'Cholamandalam MS General Insurance Company Limited'], complaintTypes: ['rejection', 'delay'], contactInfo: { phone: '+91 98765 43375', whatsapp: '+91 98765 43375' } },
  { id: '163', name: 'Ranveer Singh', profileImage: 'https://randomuser.me/api/portraits/men/83.jpg', rating: 4.9, reviewCount: 167, experience: 11, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 212, claimsAmount: '₹10.2 Cr', matchingScore: 96, serviceTypes: ['Claim Assistance'], location: 'Kolkata, West Bengal', bio: 'Inland transit claims.', insuranceCompanies: ['The New India Assurance Company Limited', 'National Insurance Company Limited', 'IFFCO TOKIO General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled'], contactInfo: { phone: '+91 98765 43376', whatsapp: '+91 98765 43376' } },
  { id: '164', name: 'Kareena Kapoor', profileImage: 'https://randomuser.me/api/portraits/women/83.jpg', rating: 4.7, reviewCount: 134, experience: 9, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 167, claimsAmount: '₹7.2 Cr', matchingScore: 90, serviceTypes: ['Claim Assistance'], location: 'Ahmedabad, Gujarat', bio: 'Marine loss claims.', insuranceCompanies: ['United India Insurance Company Limited', 'The Oriental Insurance Company Limited', 'Liberty General Insurance Limited'], complaintTypes: ['rejection', 'mis-selling'], contactInfo: { phone: '+91 98765 43377', whatsapp: '+91 98765 43377' } },
  { id: '165', name: 'Ranbir Kapoor', profileImage: 'https://randomuser.me/api/portraits/men/84.jpg', rating: 4.8, reviewCount: 156, experience: 10, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 198, claimsAmount: '₹9.0 Cr', matchingScore: 93, serviceTypes: ['Claim Assistance'], location: 'Delhi, NCR', bio: 'Warehouse to warehouse.', insuranceCompanies: ['Reliance General Insurance Company Limited', 'Bajaj General Insurance Limited', 'Royal Sundaram General Insurance Company Limited'], complaintTypes: ['delay', 'short-settled'], contactInfo: { phone: '+91 98765 43378', whatsapp: '+91 98765 43378' } },
  { id: '166', name: 'Katrina Kaif', profileImage: 'https://randomuser.me/api/portraits/women/84.jpg', rating: 4.5, reviewCount: 98, experience: 6, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 112, claimsAmount: '₹4.8 Cr', matchingScore: 85, serviceTypes: ['Claim Assistance'], location: 'Bangalore, Karnataka', bio: 'Open policy claims.', insuranceCompanies: ['Tata AIG General Insurance Company Limited', 'ICICI LOMBARD General Insurance Company Limited', 'Magma General Insurance Limited'], complaintTypes: ['rejection', 'delay', 'mis-selling'], contactInfo: { phone: '+91 98765 43379', whatsapp: '+91 98765 43379' } },
  { id: '167', name: 'John Abraham', profileImage: 'https://randomuser.me/api/portraits/men/85.jpg', rating: 4.9, reviewCount: 178, experience: 13, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 256, claimsAmount: '₹12.5 Cr', matchingScore: 97, serviceTypes: ['Claim Assistance'], location: 'Pune, Maharashtra', bio: 'Specific voyage claims.', insuranceCompanies: ['HDFC ERGO General Insurance Company Limited', 'SBI General Insurance Company Limited', 'Universal Sompo General Insurance Company Limited'], complaintTypes: ['rejection', 'delay', 'short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43380', whatsapp: '+91 98765 43380' } },
  { id: '168', name: 'Anushka Sharma', profileImage: 'https://randomuser.me/api/portraits/women/85.jpg', rating: 4.6, reviewCount: 112, experience: 7, specializations: ['Marine'], verified: true, irdaLicensed: true, claimsSettled: 134, claimsAmount: '₹5.5 Cr', matchingScore: 87, serviceTypes: ['Claim Assistance'], location: 'Hyderabad, Telangana', bio: 'Containerized cargo claims.', insuranceCompanies: ['The Oriental Insurance Company Limited', 'National Insurance Company Limited', 'Zuna General Insurance Ltd.'], complaintTypes: ['short-settled', 'mis-selling'], contactInfo: { phone: '+91 98765 43381', whatsapp: '+91 98765 43381' } }
];

// Sub-product options for New Policy
const subProductOptions: Record<string, { value: string; label: string }[]> = {
  health: [
    { value: 'mediclaim', label: 'Mediclaim' },
    { value: 'personal-accident', label: 'Personal Accident' },
    { value: 'critical-illness', label: 'Critical Illness' },
    { value: 'super-topup', label: 'Super Top-up' },
    { value: 'others', label: 'Others' },
  ],
  life: [
    { value: 'term', label: 'Term Plan' },
    { value: 'pension', label: 'Pension Plan' },
    { value: 'guaranteed', label: 'Guaranteed Plan' },
    { value: 'saving', label: 'Saving Plan' },
    { value: 'ulip', label: 'ULIP Plan' },
    { value: 'others', label: 'Others' },
  ],
  motor: [
    { value: 'private-car', label: 'Private Car' },
    { value: 'two-wheeler', label: 'Two Wheeler' },
    { value: 'commercial', label: 'Commercial Vehicle' },
    { value: 'three-wheeler', label: '3 Wheeler' },
    { value: 'others', label: 'Others' },
  ],
  sme: [
    { value: 'fire', label: 'Fire' },
    { value: 'marine', label: 'Marine/Transport' },
    { value: 'workmen', label: 'Workmen Compensation' },
    { value: 'gpa-gmc', label: 'GPA/GMC' },
    { value: 'group-term', label: 'Group Term Insurance' },
    { value: 'liability', label: 'Liability' },
    { value: 'cyber', label: 'Cyber' },
    { value: 'others', label: 'Others' },
  ],
};

const FILTER_STORAGE_KEY = 'agentListingFilters';

// Compare Table Component for side-by-side comparison
interface CompareTableProps {
  agents: typeof mockAgents;
  onContact: (agent: (typeof mockAgents)[0], type: 'whatsapp' | 'call') => void;
  onRemove: (agentId: string) => void;
}

const CompareTable: React.FC<CompareTableProps> = ({ agents, onContact, onRemove }) => {
  const isMobile = useIsMobile();

  const compareRows = [
    { label: 'Experience', getValue: (a: typeof mockAgents[0]) => `${a.experience} yrs` },
    { label: 'Rating', getValue: (a: typeof mockAgents[0]) => (
      <span className="flex items-center justify-center gap-1">
        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
        {a.rating}
      </span>
    )},
    { label: 'Reviews', getValue: (a: typeof mockAgents[0]) => a.reviewCount },
    { label: 'Claims Settled', getValue: (a: typeof mockAgents[0]) => a.claimsSettled },
    { label: 'Match Score', getValue: (a: typeof mockAgents[0]) => (
      <span className={cn(
        "font-bold",
        a.matchingScore > 90 ? 'text-green-600' :
        a.matchingScore >= 51 ? 'text-orange-600' : 'text-red-600'
      )}>
        {a.matchingScore}%
      </span>
    )},
    { label: 'Location', getValue: (a: typeof mockAgents[0]) => (
      <span className="text-xs">{a.location.split(',')[0]}</span>
    )},
  ];

  if (isMobile) {
    // Mobile: Table layout with features on left, agents as columns
    return (
      <div className="mt-2">
        {/* Agent Headers with Photos */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${agents.length}, 1fr)` }}>
          <div className="h-20" /> {/* Empty cell for alignment */}
          {agents.map(agent => (
            <div key={agent.id} className="flex flex-col items-center text-center p-1">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <img src={agent.profileImage} alt={agent.name} className="w-full h-full object-cover" />
                </Avatar>
                <button
                  onClick={() => onRemove(agent.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="text-xs font-medium mt-1 line-clamp-1">{agent.name.split(' ')[0]}</span>
              <div className="flex gap-0.5 mt-0.5">
                {agent.verified && (
                  <Badge className="bg-green-500 text-white text-[8px] px-1 py-0 h-4">
                    <CheckCircle className="h-2 w-2" />
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Rows */}
        <div className="border rounded-lg overflow-hidden mt-2">
          {compareRows.map((row, idx) => (
            <div 
              key={row.label}
              className={cn(
                "grid items-center text-xs",
                idx % 2 === 0 ? "bg-muted/30" : "bg-background"
              )}
              style={{ gridTemplateColumns: `80px repeat(${agents.length}, 1fr)` }}
            >
              <div className="p-2 font-medium text-muted-foreground border-r">{row.label}</div>
              {agents.map(agent => (
                <div key={agent.id} className="p-2 text-center font-medium">
                  {row.getValue(agent)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Action Buttons - aligned with agent columns */}
        <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: `80px repeat(${agents.length}, 1fr)` }}>
          <div /> {/* Empty cell for alignment with label column */}
          {agents.map(agent => (
            <div key={agent.id} className="flex flex-col gap-1.5">
              <Button
                size="sm"
                className="w-full bg-green-500 hover:bg-green-600 text-white h-8 text-xs"
                onClick={() => onContact(agent, 'whatsapp')}
              >
                <FaWhatsapp className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={() => onContact(agent, 'call')}
              >
                <PhoneCall className="h-3 w-3 mr-1" />
                Call
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Grid layout with cards
  return (
    <div className="grid grid-cols-3 gap-6 mt-6">
      {agents.map(agent => (
        <Card key={agent.id} className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary">
                  <img src={agent.profileImage} alt={agent.name} className="w-full h-full object-cover" />
                </Avatar>
                <button
                  onClick={() => onRemove(agent.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg mt-3">{agent.name}</h3>
              <div className="flex gap-1 mt-1">
                {agent.verified && (
                  <Badge className="bg-green-500 text-white text-xs px-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {agent.irdaLicensed && (
                  <LicensedBadge variant="default" themeColor="primary" />
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {compareRows.map(row => (
                <div key={row.label} className="flex items-center justify-between border-b py-2">
                  <span className="text-muted-foreground font-medium">{row.label}:</span>
                  <span className="font-bold">{row.getValue(agent)}</span>
                </div>
              ))}
              <div className="py-2">
                <span className="text-muted-foreground font-medium block mb-2">Specializations:</span>
                <div className="flex flex-wrap gap-1">
                  {filterAllowedTags(agent.specializations).map((spec, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-primary text-white border-primary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                size="sm"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={() => onContact(agent, 'whatsapp')}
              >
                <FaWhatsapp className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onContact(agent, 'call')}
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper to get saved filters from localStorage
const getSavedFilters = () => {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading saved filters:', e);
  }
  return null;
};

const AgentsListing = () => {
  const savedFilters = getSavedFilters();
  
  const [agents, setAgents] = useState([...mockAgents]);
  const [filteredAgents, setFilteredAgents] = useState([...mockAgents]);
  const [insuranceType, setInsuranceType] = useState(savedFilters?.insuranceType || 'all');
  const [selectedInsuranceTypes, setSelectedInsuranceTypes] = useState<string[]>(savedFilters?.selectedInsuranceTypes || []);
  const [serviceType, setServiceType] = useState(savedFilters?.serviceType || 'all');
  const [subProduct, setSubProduct] = useState(savedFilters?.subProduct || 'all');
  const [insuranceCompany, setInsuranceCompany] = useState(savedFilters?.insuranceCompany || 'all');
  const [complaintType, setComplaintType] = useState(savedFilters?.complaintType || 'all');
  const [compareList, setCompareList] = useState<string[]>([]);
  const urlParamsAppliedRef = React.useRef(false);
  const didFetchAgentsRef = useRef(false);
  const hasOpenedMobileFiltersRef = useRef(false);
  const lastAppliedSearchRef = useRef('');
  const prevFilterKeyRef = useRef('');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'experience'>('match');
  const [highlightFilters, setHighlightFilters] = useState(false);
  const locationHook = useLocation();

  // Highlight filters immediately when coming from hero/open-filter flows
  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const shouldHighlightFromHero = params.get('openFilter') === 'true' || params.get('advanced') === 'true';
    const startDelay = shouldHighlightFromHero ? 150 : 3000;
    const stopDelay = shouldHighlightFromHero ? 8000 : 9000;

    const t = setTimeout(() => setHighlightFilters(true), startDelay);
    const stop = setTimeout(() => setHighlightFilters(false), stopDelay);
    return () => {
      clearTimeout(t);
      clearTimeout(stop);
    };
  }, [locationHook.search]);

  // Stop highlight as soon as user opens/interacts with filters
  useEffect(() => {
    if (showMobileFilters) setHighlightFilters(false);
  }, [showMobileFilters]);
  
  // Seeker details popup state
  const [showSeekerPopup, setShowSeekerPopup] = useState(false);
  const [seekerDetails, setSeekerDetails] = useState<{ name?: string; email?: string; phone?: string; pincode: string } | null>(null);
  
  // Contact details popup state
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [pendingContact, setPendingContact] = useState<{ agent: any; method: 'call' | 'whatsapp' } | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  
  // User location for distance calculations
  const { location: userLocation, cityName, requestLocation, isLoading: isLocationLoading } = useUserLocation();
  const { user } = useAuth();
  
  // Show seeker popup for non-logged-in users who haven't submitted details.
  // Skip if location already provided via URL (from Hero / MobileFilterSheet / FindAgentWizard)
  // to avoid asking the same question twice.
  useEffect(() => {
    if (user) {
      setShowSeekerPopup(false);
      setSeekerDetails(null);
      return;
    }
    const params = new URLSearchParams(locationHook.search);
    const urlPincode = params.get('pincode') || '';
    const urlCity = params.get('city') || '';
    const saved = getSavedSeekerDetails();

    if (urlPincode || urlCity) {
      // Persist so we don't re-ask on subsequent visits this session
      const merged = { ...(saved || {}), pincode: urlPincode || saved?.pincode || '' };
      saveSeekerDetails(merged);
      setSeekerDetails(merged);
      setShowSeekerPopup(false);
      return;
    }

    if (saved) {
      setSeekerDetails(saved);
      setShowSeekerPopup(false);
    } else {
      setShowSeekerPopup(true);
    }
  }, [user, locationHook.search]);

  const handleSeekerSubmit = (data: { pincode: string; useGps: boolean }) => {
    setSeekerDetails({ pincode: data.pincode });
    setShowSeekerPopup(false);
    if (data.useGps) {
      requestLocation();
    }
    toast({
      title: 'Location set!',
      description: 'Finding the best agents near you...',
    });
  };
  
  // Prepare agents data for distance calculation
  const agentsForDistance = useMemo(() => 
    filteredAgents.slice(0, visibleCount).map(a => ({ id: a.id, location: a.location })),
    [filteredAgents, visibleCount]
  );
  
  // Calculate distances to visible agents
  const { distances } = useAgentDistances(userLocation, agentsForDistance);

  // Clear any legacy localStorage data from old onboarding (security cleanup)
  useEffect(() => {
    localStorage.removeItem('userOnboarded');
    localStorage.removeItem('userData');
  }, []);

  // Fetch real agents from database and merge with mock data
  useEffect(() => {
    if (didFetchAgentsRef.current) return;
    didFetchAgentsRef.current = true;

    const fetchRealAgents = async () => {
      try {
        // Fetch approved agent profiles with their profile info
        const { data: agentData, error } = await supabase
          .from('public_agent_info')
          .select('*')
          .eq('is_profile_approved', true);
        
        if (error) {
          console.error('Error fetching agents:', error);
          return;
        }

        if (agentData && agentData.length > 0) {
          // Fetch reviews for real agents to get ratings
          const agentIds = agentData.map((a: any) => a.id);
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('public_agent_reviews')
            .select('agent_id, rating')
            .in('agent_id', agentIds)
            .eq('is_approved', true);

          if (reviewsError) {
            console.error('Error fetching public agent reviews:', reviewsError);
          }
          
          // Calculate average ratings per agent
          const ratingMap: Record<string, { sum: number; count: number }> = {};
          (reviewsData || []).forEach((r: any) => {
            if (!ratingMap[r.agent_id]) ratingMap[r.agent_id] = { sum: 0, count: 0 };
            ratingMap[r.agent_id].sum += (r.rating || 0);
            ratingMap[r.agent_id].count += 1;
          });

          // Transform real agents to match mock agent structure
          const realAgents = agentData.map((agent: any) => {
            const reviews = ratingMap[agent.id];
            const avgRating = reviews ? Math.round((reviews.sum / reviews.count) * 10) / 10 : 4.5;
            const reviewCount = reviews?.count || 0;
            
            return {
              id: agent.id,
              name: agent.full_name || 'Agent',
              profileImage: agent.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg',
              rating: avgRating,
              reviewCount,
              experience: agent.years_experience || 0,
              specializations: agent.specializations || ['Health'],
              verified: true,
              irdaLicensed: !!agent.license_number,
              claimsSettled: agent.claims_settled || 0,
              claimsAmount: agent.claims_amount || '₹0',
              matchingScore: 85,
              serviceTypes: [
                'New Policy',
                ...(agent.wants_claims_leads ? ['Claim Assistance'] : []),
                ...(agent.wants_portfolio_leads ? ['Policy Review'] : []),
              ],
              location: agent.location || 'India',
              bio: agent.bio || 'Insurance professional',
              insuranceCompanies: [],
              complaintTypes: [],
              approxClientBase: agent.approx_client_base || null,
              subscriptionPlan: agent.subscription_plan || 'starter',
              wantsClaimsLeads: agent.wants_claims_leads || false,
              wantsPortfolioLeads: agent.wants_portfolio_leads || false,
              insuranceSegments: agent.insurance_segments || [],
              serviceableCities: agent.serviceable_cities || [],
              contactInfo: {
                phone: '',
                whatsapp: '',
              }
            };
          });

          // Merge real agents at the beginning (they take priority)
          setAgents([...realAgents, ...mockAgents]);
        }
      } catch (err) {
        console.error('Error fetching real agents:', err);
      }
    };

    fetchRealAgents();
  }, []);

  // Persist filter state to localStorage
  useEffect(() => {
    const filtersToSave = {
      insuranceType,
      selectedInsuranceTypes,
      serviceType,
      subProduct,
      insuranceCompany,
      complaintType
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filtersToSave));
  }, [insuranceType, selectedInsuranceTypes, serviceType, subProduct, insuranceCompany, complaintType]);

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const typeParam = params.get('type');
    const serviceParam = params.get('service');
    const subParam = params.get('sub');
    const openFilterParam = params.get('openFilter');
    const complaintParam = params.get('complaintType');
    const companyParam = params.get('company');
    const currentSearch = locationHook.search;

    if (lastAppliedSearchRef.current === currentSearch) return;
    lastAppliedSearchRef.current = currentSearch;
    
    // Mark that URL params are being applied (prevents sub-product reset)
    if (typeParam && subParam) {
      urlParamsAppliedRef.current = true;
    }
    
    if (typeParam) {
      // Normalize: strip " insurance" suffix so "health insurance" → "health"
      const normalizedType = typeParam.replace(/\s*insurance$/i, '').toLowerCase();
      setInsuranceType(normalizedType);
    }
    if (serviceParam) {
      const serviceMap: Record<string, string> = {
        'new-policy': 'New Policy',
        'transfer-renew': 'Transfer/Renew Policy',
        'claim': 'Claim Assistance',
        'policy-review': 'Policy Review'
      };
      setServiceType(serviceMap[serviceParam] || 'all');
    } else {
      setServiceType('all');
    }
    if (subParam) {
      setSubProduct(subParam);
    } else {
      setSubProduct('all');
    }
    if (companyParam) {
      setInsuranceCompany(companyParam);
    } else {
      setInsuranceCompany('all');
    }
    if (complaintParam) {
      setComplaintType(complaintParam);
    } else {
      setComplaintType('all');
    }

    const shouldAutoOpenMobileFilters =
      !hasOpenedMobileFiltersRef.current &&
      window.innerWidth < 768 &&
      openFilterParam === 'true';

    if (shouldAutoOpenMobileFilters) {
      hasOpenedMobileFiltersRef.current = true;
      const timer = setTimeout(() => {
        setShowMobileFilters(true);
      }, 250);

      return () => clearTimeout(timer);
    }

  }, [locationHook.search]);

  // Reset sub-product when insurance type changes (but not from URL params)
  useEffect(() => {
    if (urlParamsAppliedRef.current) {
      urlParamsAppliedRef.current = false;
      return;
    }
    setSubProduct('all');
  }, [insuranceType]);

  // Reset selectedInsuranceTypes when service type changes away from Policy Review
  useEffect(() => {
    if (serviceType !== 'Policy Review') {
      setSelectedInsuranceTypes([]);
    }
  }, [serviceType]);

  useEffect(() => {
    let result = [...agents];
    
    // For Policy Review, use multi-select; for others use single select
    if (serviceType === 'Policy Review' && selectedInsuranceTypes.length > 0) {
      result = result.filter(agent => 
        agent.specializations.some(spec => 
          selectedInsuranceTypes.some(type => spec.toLowerCase() === type.toLowerCase())
        )
      );
    } else if (insuranceType && insuranceType !== 'all' && serviceType !== 'Policy Review') {
      result = result.filter(agent => 
        agent.specializations.some(spec => spec.toLowerCase() === insuranceType.toLowerCase())
      );
    }
    
    if (serviceType && serviceType !== 'all') {
      result = result.filter(agent => 
        agent.serviceTypes.includes(serviceType)
      );
    }
    
    // Additional filters for Claim Assistance
    if (serviceType === 'Claim Assistance') {
      if (insuranceCompany && insuranceCompany !== 'all') {
        result = result.filter(agent => 
          agent.insuranceCompanies?.some(company => 
            company.toLowerCase().includes(insuranceCompany.toLowerCase()) ||
            insuranceCompany.toLowerCase().includes(company.split(' ').slice(0, 2).join(' ').toLowerCase())
          )
        );
      }
      
      if (complaintType && complaintType !== 'all') {
        result = result.filter(agent => 
          agent.complaintTypes?.includes(complaintType)
        );
      }
    }
    
    // Calculate dynamic matching scores with service-specific algorithm
    const currentServiceType: ServiceType = (serviceType === 'New Policy' || serviceType === 'Transfer/Renew Policy' || serviceType === 'Claim Assistance' || serviceType === 'Policy Review') ? serviceType : 'all';
    
    result = result.map(agent => {
      const plan = (agent as any).subscriptionPlan || getMockSubscriptionPlan(agent);
      const agentDistanceKm = distances[agent.id]?.distanceKm ?? null;
      const claimsAmountCr = parseClaimsAmountCr(agent.claimsAmount);
      const clientBase = parseClientBase(getClientBaseDisplay(agent.id, (agent as any).approxClientBase));
      
      // Use real data if available, fallback to serviceTypes for mock agents
      const wantsClaimsLeads = (agent as any).wantsClaimsLeads ?? agent.serviceTypes.includes('Claim Assistance');
      const wantsPortfolioLeads = (agent as any).wantsPortfolioLeads ?? agent.serviceTypes.includes('Policy Review');
      
      return {
        ...agent,
        matchingScore: calculateMatchingScore({
          agentLocation: agent.location,
          agentSpecializations: agent.specializations,
          agentLanguages: ['English', 'Hindi'],
          agentExperience: agent.experience,
          agentRating: agent.rating,
          agentReviewCount: agent.reviewCount,
          agentClaimsSettled: agent.claimsSettled,
          agentClaimsAmountCr: claimsAmountCr,
          agentClientBase: clientBase,
          agentInsuranceCompanies: agent.insuranceCompanies,
          isProfessionalPlan: plan === 'professional',
          wantsClaimsLeads,
          wantsPortfolioLeads,
          userCity: cityName || undefined,
          userInsuranceType: insuranceType !== 'all' ? insuranceType : undefined,
          userInsuranceTypes: selectedInsuranceTypes.length > 0 ? selectedInsuranceTypes : undefined,
          userInsuranceCompany: insuranceCompany !== 'all' ? insuranceCompany : undefined,
          distanceKm: agentDistanceKm,
          serviceType: currentServiceType,
        }),
        _isProfessional: plan === 'professional',
      };
    });
    
    // Sort: Professional plan agents always first, then by selected criteria
    if (sortBy === 'match') {
      result.sort((a, b) => {
        // Professional first for Claims and Policy Review
        if (currentServiceType === 'Claim Assistance' || currentServiceType === 'Policy Review') {
          const aPro = (a as any)._isProfessional ? 1 : 0;
          const bPro = (b as any)._isProfessional ? 1 : 0;
          if (aPro !== bPro) return bPro - aPro;
        }
        return b.matchingScore - a.matchingScore;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => b.experience - a.experience);
    }
    
    setFilteredAgents(result);
    // Only reset visible count when user-controlled filters change (not background data like distances/agents/cityName)
    const filterKey = `${insuranceType}|${selectedInsuranceTypes.join(',')}|${serviceType}|${subProduct}|${insuranceCompany}|${complaintType}|${sortBy}`;
    if (prevFilterKeyRef.current && prevFilterKeyRef.current !== filterKey) {
      setVisibleCount(5);
    }
    prevFilterKeyRef.current = filterKey;
  }, [agents, insuranceType, selectedInsuranceTypes, serviceType, subProduct, insuranceCompany, complaintType, sortBy, cityName, distances]);

  // Track card views for real agents when they appear in listing
  React.useEffect(() => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const trackedIds = new Set<string>();
    const visibleAgents = filteredAgents.slice(0, visibleCount);
    visibleAgents.forEach(agent => {
      if (UUID_REGEX.test(agent.id) && !trackedIds.has(agent.id)) {
        trackedIds.add(agent.id);
        trackAgentCardView(agent.id);
      }
    });
  }, [filteredAgents, visibleCount]);

  const captureLeadInBackground = (agentId: string, agentName: string, contactMethod: string) => {
    // Only capture for real DB agents (UUID format)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(agentId)) return;

    // Client-side 5-minute dedup guard per agent
    try {
      const dedupKey = `lead_dedup_${agentId}`;
      const lastCapture = sessionStorage.getItem(dedupKey);
      if (lastCapture && Date.now() - parseInt(lastCapture) < 5 * 60 * 1000) return;
      sessionStorage.setItem(dedupKey, String(Date.now()));
    } catch { /* ignore */ }

    const seeker = seekerDetails || getSavedSeekerDetails();
    if (!seeker?.phone) return;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    fetch(`https://${projectId}.supabase.co/functions/v1/capture-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({
        agent_id: agentId,
        name: seeker.name,
        email: seeker.email,
        phone: seeker.phone,
        location: seeker.pincode || '',
        product_interest: insuranceType !== 'all' ? insuranceType : '',
        contact_method: contactMethod,
        service_type: serviceType,
        insurance_type: insuranceType,
        insurance_company: insuranceCompany,
        complaint_type: complaintType,
        sub_product: subProduct,
      }),
    }).then(() => {
      toast({ title: `Your details shared with ${agentName}`, description: 'The agent will get back to you soon.' });
    }).catch(() => { /* silent fail */ });
  };

  const handleContactAgent = async (agent: any, method: string) => {
    // If user is already logged in, just execute
    if (user) {
      executeContact(agent, method);
      return;
    }
    
    // Check if we have saved contact details (name, email, phone)
    const saved = getSavedSeekerDetails();
    if (saved?.phone && saved?.name && saved?.email) {
      // Try auto-login with saved credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: saved.email,
        password: saved.phone,
      });
      if (!error) {
        toast({ title: `Welcome back, ${saved.name}! 👋` });
        executeContact(agent, method);
        return;
      }
    }
    
    // Show contact details popup
    setPendingContact({ agent, method: method as 'call' | 'whatsapp' });
    setShowContactPopup(true);
  };

  const executeContact = (agent: any, method: string) => {
    switch (method) {
      case 'call':
        window.location.href = `tel:${agent.contactInfo.phone}`;
        toast({
          title: `Calling ${agent.name}`,
          description: `Connecting you to ${agent.contactInfo.phone}`
        });
        captureLeadInBackground(agent.id, agent.name, 'call');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${agent.contactInfo.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
        toast({
          title: `WhatsApp ${agent.name}`,
          description: `Opening WhatsApp chat with ${agent.name}`
        });
        captureLeadInBackground(agent.id, agent.name, 'whatsapp');
        break;
      default:
        break;
    }
  };

  const handleContactDetailsSubmit = (data: { name: string; email: string; phone: string }) => {
    setSeekerDetails(prev => ({ ...prev, pincode: prev?.pincode || '', ...data }));
    setShowContactPopup(false);
    if (pendingContact) {
      executeContact(pendingContact.agent, pendingContact.method);
      setPendingContact(null);
    }
  };

  const handleClearFilters = () => {
    setInsuranceType('all');
    setServiceType('all');
    setSubProduct('all');
    setInsuranceCompany('all');
    setComplaintType('all');
    setSelectedInsuranceTypes([]);
    localStorage.removeItem(FILTER_STORAGE_KEY);
    navigate('/agents');
  };
  
  const toggleCompare = (agentId: string) => {
    setCompareList(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      }
      if (prev.length >= 3) {
        toast({ 
          title: "Maximum 3 agents", 
          description: "You can compare up to 3 agents at a time",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, agentId];
    });
    toast({ 
      title: compareList.includes(agentId) ? "Removed from compare" : "Added to compare",
      description: compareList.includes(agentId) 
        ? "Agent removed from comparison list" 
        : `${compareList.length + 1}/3 agents in compare list`
    });
  };
  
  const toggleFavourite = (agentId: string) => {
    setFavourites(prev => {
      if (prev.includes(agentId)) {
        toast({ title: "Removed from favourites" });
        return prev.filter(id => id !== agentId);
      }
      toast({ title: "Added to favourites", description: "Agent saved to your favourites" });
      return [...prev, agentId];
    });
  };

  const comparedAgents = agents.filter(agent => compareList.includes(agent.id));
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Seeker Details Popup - location only for non-logged-in users */}
      <SeekerDetailsPopup
        isOpen={showSeekerPopup}
        onSubmit={handleSeekerSubmit}
      />
      
      {/* Contact Details Popup - name/email/phone when clicking Call/WhatsApp */}
      <ContactDetailsPopup
        isOpen={showContactPopup}
        onClose={() => { setShowContactPopup(false); setPendingContact(null); }}
        onSubmit={handleContactDetailsSubmit}
        agentName={pendingContact?.agent?.name || ''}
        contactMethod={pendingContact?.method || 'call'}
      />
      
      {/* Compare Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold">Compare Agents</DialogTitle>
          </DialogHeader>
          {comparedAgents.length > 0 ? (
            <CompareTable 
              agents={comparedAgents} 
              onContact={handleContactAgent}
              onRemove={toggleCompare}
            />
          ) : (
            <p className="text-center text-gray-600 py-8">No agents selected for comparison</p>
          )}
        </DialogContent>
      </Dialog>
      
      <div id="agents-header" className={`pb-10 px-4 sm:px-6 lg:px-8 flex-grow transition-colors duration-500 ${
        serviceType === 'New Policy' ? 'bg-secondary-lighter/30' :
        serviceType === 'Claim Assistance' ? 'bg-claim-lighter/30' :
        serviceType === 'Policy Review' ? 'bg-review-lighter/30' :
        'bg-muted/30'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden md:block w-full md:w-1/4">
              <Card className={cn(
                "sticky sticky-below-navbar-gap transition-all duration-500",
                highlightFilters && "ring-2 ring-primary ring-offset-2 shadow-[0_0_0_6px_hsl(var(--primary)/0.15)] animate-pulse"
              )}>
                <CardContent className="p-6">
                  <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                    serviceType === 'New Policy' ? 'text-secondary' :
                    serviceType === 'Claim Assistance' ? 'text-claim' :
                    serviceType === 'Policy Review' ? 'text-review' :
                    'text-foreground'
                  }`}>Filters</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Type</label>
                      <Select value={serviceType} onValueChange={setServiceType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="New Policy">Buy New Policy</SelectItem>
                          <SelectItem value="Transfer/Renew Policy">Transfer / Renew Policy</SelectItem>
                          <SelectItem value="Policy Review">Portfolio Audit</SelectItem>
                          <SelectItem value="Claim Assistance">Claim Assistance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Insurance Type - Multi-select for Policy Review, single select for others */}
                    {serviceType === 'Policy Review' ? (
                      <MultiSelectDropdown
                        label="Insurance Types"
                        options={['Health', 'Life', 'Motor', 'SME']}
                        selected={selectedInsuranceTypes}
                        onChange={setSelectedInsuranceTypes}
                        placeholder="Select insurance types"
                        allowOther={false}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2">Insurance Type</label>
                        <Select value={insuranceType} onValueChange={setInsuranceType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="health">Health Insurance</SelectItem>
                            {serviceType !== 'Transfer/Renew Policy' && (
                              <SelectItem value="life">Life Insurance</SelectItem>
                            )}
                            <SelectItem value="motor">Motor Insurance</SelectItem>
                            <SelectItem value="sme">SME Insurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Sub-Product Filter for New Policy */}
                    {(serviceType === 'New Policy' || serviceType === 'Transfer/Renew Policy') && insuranceType !== 'all' && subProductOptions[insuranceType] && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Sub Product</label>
                        <Select value={subProduct} onValueChange={setSubProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sub Products</SelectItem>
                            {subProductOptions[insuranceType].map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Conditional filters for Claim Assistance */}
                    {serviceType === 'Claim Assistance' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Insurance Company</label>
                          <Select value={insuranceCompany} onValueChange={setInsuranceCompany}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <SelectItem value="all">All Companies</SelectItem>
                              {insuranceType === 'life' && (
                                <>
                                  <SelectItem value="LIC">Life Insurance Corporation of India</SelectItem>
                                  <SelectItem value="Axis Max Life">Axis Max Life Insurance Limited</SelectItem>
                                  <SelectItem value="HDFC Life">HDFC Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="ICICI Prudential Life">ICICI Prudential Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Kotak Mahindra Life">Kotak Mahindra Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Aditya Birla SunLife">Aditya Birla SunLife Insurance Company Limited</SelectItem>
                                  <SelectItem value="TATA AIA Life">TATA AIA Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="SBI Life">SBI Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Bajaj Life">Bajaj Life Insurance Limited</SelectItem>
                                  <SelectItem value="PNB MetLife">PNB MetLife India Insurance Company Limited</SelectItem>
                                  <SelectItem value="Reliance Nippon Life">Reliance Nippon Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Aviva Life">Aviva Life Insurance Company India Limited</SelectItem>
                                  <SelectItem value="Sahara India Life">Sahara India Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Shriram Life">Shriram Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Bharti AXA Life">Bharti AXA Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Generali Central Life">Generali Central Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Ageas Federal Life">Ageas Federal Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Canara HSBC Life">Canara HSBC Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Bandhan Life">Bandhan Life Insurance Limited</SelectItem>
                                  <SelectItem value="Pramerica Life">Pramerica Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Star Union Dai-Ichi Life">Star Union Dai-Ichi Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="IndiaFirst Life">IndiaFirst Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="Edelweiss Life">Edelweiss Life Insurance Company Limited</SelectItem>
                                  <SelectItem value="CreditAccess Life">CreditAccess Life Insurance Limited</SelectItem>
                                  <SelectItem value="Acko Life">Acko Life Insurance Limited</SelectItem>
                                  <SelectItem value="Go Digit Life">Go Digit Life Insurance Limited</SelectItem>
                                </>
                              )}
                              {(insuranceType === 'health' || insuranceType === 'travel') && (
                                <>
                                  <SelectItem value="Acko General">Acko General Insurance Limited</SelectItem>
                                  <SelectItem value="Bajaj General">Bajaj General Insurance Limited</SelectItem>
                                  <SelectItem value="Cholamandalam MS">Cholamandalam MS General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Generali Central">Generali Central Insurance Company Limited</SelectItem>
                                  <SelectItem value="Go Digit General">Go Digit General Insurance Limited</SelectItem>
                                  <SelectItem value="HDFC ERGO">HDFC ERGO General Insurance Company Limited</SelectItem>
                                  <SelectItem value="ICICI LOMBARD">ICICI LOMBARD General Insurance Company Limited</SelectItem>
                                  <SelectItem value="IFFCO TOKIO">IFFCO TOKIO General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Zurich Kotak">Zurich Kotak General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Liberty General">Liberty General Insurance Limited</SelectItem>
                                  <SelectItem value="Magma General">Magma General Insurance Limited</SelectItem>
                                  <SelectItem value="National Insurance">National Insurance Company Limited</SelectItem>
                                  <SelectItem value="Navi General">Navi General Insurance Limited</SelectItem>
                                  <SelectItem value="Raheja QBE">Raheja QBE General Insurance Co. Ltd.</SelectItem>
                                  <SelectItem value="Reliance General">Reliance General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Royal Sundaram">Royal Sundaram General Insurance Company Limited</SelectItem>
                                  <SelectItem value="SBI General">SBI General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Shriram General">Shriram General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Tata AIG">Tata AIG General Insurance Company Limited</SelectItem>
                                  <SelectItem value="New India Assurance">The New India Assurance Company Limited</SelectItem>
                                  <SelectItem value="Oriental Insurance">The Oriental Insurance Company Limited</SelectItem>
                                  <SelectItem value="United India">United India Insurance Company Limited</SelectItem>
                                  <SelectItem value="Universal Sompo">Universal Sompo General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Zuna General">Zuna General Insurance Ltd.</SelectItem>
                                  <SelectItem value="Aditya Birla Health">Aditya Birla Health Insurance Co. Limited</SelectItem>
                                  <SelectItem value="Care Health">Care Health Insurance Ltd.</SelectItem>
                                  <SelectItem value="Galaxy Health">Galaxy Health and Allied Insurance Company Limited</SelectItem>
                                  <SelectItem value="ManipalCigna Health">ManipalCigna Health Insurance Company Limited</SelectItem>
                                  <SelectItem value="Niva Bupa Health">Niva Bupa Health Insurance Company Limited</SelectItem>
                                  <SelectItem value="Reliance Health">Reliance Health Insurance Ltd.</SelectItem>
                                  <SelectItem value="Star Health">Star Health & Allied Insurance Co. Ltd.</SelectItem>
                                  <SelectItem value="Narayana Health">Narayana Health Insurance Company Limited</SelectItem>
                                </>
                              )}
                              {(insuranceType === 'motor' || insuranceType === 'fire' || insuranceType === 'marine' || insuranceType === 'liability' || insuranceType === 'sme' || insuranceType === 'other') && (
                                <>
                                  <SelectItem value="Acko General">Acko General Insurance Limited</SelectItem>
                                  <SelectItem value="Agriculture Insurance">Agriculture Insurance Company of India Limited</SelectItem>
                                  <SelectItem value="Bajaj General">Bajaj General Insurance Limited</SelectItem>
                                  <SelectItem value="Cholamandalam MS">Cholamandalam MS General Insurance Company Limited</SelectItem>
                                  <SelectItem value="ECGC">ECGC Limited</SelectItem>
                                  <SelectItem value="Generali Central">Generali Central Insurance Company Limited</SelectItem>
                                  <SelectItem value="Go Digit General">Go Digit General Insurance Limited</SelectItem>
                                  <SelectItem value="HDFC ERGO">HDFC ERGO General Insurance Company Limited</SelectItem>
                                  <SelectItem value="ICICI LOMBARD">ICICI LOMBARD General Insurance Company Limited</SelectItem>
                                  <SelectItem value="IFFCO TOKIO">IFFCO TOKIO General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Zurich Kotak">Zurich Kotak General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Kshema General">Kshema General Insurance Limited</SelectItem>
                                  <SelectItem value="Liberty General">Liberty General Insurance Limited</SelectItem>
                                  <SelectItem value="Magma General">Magma General Insurance Limited</SelectItem>
                                  <SelectItem value="National Insurance">National Insurance Company Limited</SelectItem>
                                  <SelectItem value="Navi General">Navi General Insurance Limited</SelectItem>
                                  <SelectItem value="Raheja QBE">Raheja QBE General Insurance Co. Ltd.</SelectItem>
                                  <SelectItem value="Reliance General">Reliance General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Royal Sundaram">Royal Sundaram General Insurance Company Limited</SelectItem>
                                  <SelectItem value="SBI General">SBI General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Shriram General">Shriram General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Tata AIG">Tata AIG General Insurance Company Limited</SelectItem>
                                  <SelectItem value="New India Assurance">The New India Assurance Company Limited</SelectItem>
                                  <SelectItem value="Oriental Insurance">The Oriental Insurance Company Limited</SelectItem>
                                  <SelectItem value="United India">United India Insurance Company Limited</SelectItem>
                                  <SelectItem value="Universal Sompo">Universal Sompo General Insurance Company Limited</SelectItem>
                                  <SelectItem value="Zuna General">Zuna General Insurance Ltd.</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Complaint Type</label>
                          <Select value={complaintType} onValueChange={setComplaintType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="rejection">Claim Rejection</SelectItem>
                              <SelectItem value="delay">Claim Delay</SelectItem>
                              <SelectItem value="short-settled">Claim Short settled</SelectItem>
                              <SelectItem value="mis-selling">Mis-selling</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className={`w-full hover:bg-primary hover:text-white transition-colors`}
                      onClick={handleClearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Mobile Filter Sheet */}
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetContent side="left" className="w-[92vw] max-w-[340px] sm:w-[400px] animate-slide-in-right overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className={`transition-colors duration-300 ${
                    serviceType === 'New Policy' ? 'text-secondary' :
                    serviceType === 'Claim Assistance' ? 'text-claim' :
                    serviceType === 'Policy Review' ? 'text-review' :
                    'text-foreground'
                  }`}>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Type</label>
                    <Select value={serviceType} onValueChange={(value) => {
                      setServiceType(value);
                      // No auto-close - let user continue selecting filters
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="New Policy">Buy New Policy</SelectItem>
                        <SelectItem value="Transfer/Renew Policy">Transfer / Renew Policy</SelectItem>
                        <SelectItem value="Policy Review">Portfolio Audit</SelectItem>
                        <SelectItem value="Claim Assistance">Claim Assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Insurance Type - Multi-select for Policy Review, single select for others - Mobile */}
                  {serviceType === 'Policy Review' ? (
                    <MultiSelectDropdown
                      label="Insurance Types"
                      options={['Life', 'Health', 'Motor', 'SME']}
                      selected={selectedInsuranceTypes}
                      onChange={(values) => {
                        setSelectedInsuranceTypes(values);
                        // Auto-close after selection for Policy Review (like New Policy)
                        if (values.length > 0) {
                          setTimeout(() => setShowMobileFilters(false), 400);
                        }
                      }}
                      placeholder="Select insurance types"
                      allowOther={false}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">Insurance Type</label>
                      <Select value={insuranceType} onValueChange={(value) => {
                        setInsuranceType(value);
                        // No auto-close - user needs to select more filters
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="health">Health Insurance</SelectItem>
                            {serviceType !== 'Transfer/Renew Policy' && (
                              <SelectItem value="life">Life Insurance</SelectItem>
                            )}
                            <SelectItem value="motor">Motor Insurance</SelectItem>
                            <SelectItem value="sme">SME Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Sub-Product Filter for New Policy - Mobile */}
                  {(serviceType === 'New Policy' || serviceType === 'Transfer/Renew Policy') && insuranceType !== 'all' && subProductOptions[insuranceType] && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Sub Product</label>
                      <Select value={subProduct} onValueChange={(value) => {
                        setSubProduct(value);
                        // Auto-close only for New Policy after sub-product selection (final filter)
                        setTimeout(() => setShowMobileFilters(false), 400);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sub Products</SelectItem>
                          {subProductOptions[insuranceType].map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Conditional filters for Claim Assistance - Mobile */}
                  {serviceType === 'Claim Assistance' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Insurance Company</label>
                        <Select value={insuranceCompany} onValueChange={(value) => {
                          setInsuranceCompany(value);
                          // No auto-close for Claim Assistance
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="all">All Companies</SelectItem>
                            {insuranceType === 'life' && (
                              <>
                                <SelectItem value="LIC">Life Insurance Corporation of India</SelectItem>
                                <SelectItem value="Axis Max Life">Axis Max Life Insurance Limited</SelectItem>
                                <SelectItem value="HDFC Life">HDFC Life Insurance Company Limited</SelectItem>
                                <SelectItem value="ICICI Prudential Life">ICICI Prudential Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Kotak Mahindra Life">Kotak Mahindra Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Aditya Birla SunLife">Aditya Birla SunLife Insurance Company Limited</SelectItem>
                                <SelectItem value="TATA AIA Life">TATA AIA Life Insurance Company Limited</SelectItem>
                                <SelectItem value="SBI Life">SBI Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Bajaj Life">Bajaj Life Insurance Limited</SelectItem>
                                <SelectItem value="PNB MetLife">PNB MetLife India Insurance Company Limited</SelectItem>
                                <SelectItem value="Reliance Nippon Life">Reliance Nippon Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Aviva Life">Aviva Life Insurance Company India Limited</SelectItem>
                                <SelectItem value="Shriram Life">Shriram Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Bharti AXA Life">Bharti AXA Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Generali Central Life">Generali Central Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Ageas Federal Life">Ageas Federal Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Canara HSBC Life">Canara HSBC Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Bandhan Life">Bandhan Life Insurance Limited</SelectItem>
                                <SelectItem value="Pramerica Life">Pramerica Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Star Union Dai-Ichi Life">Star Union Dai-Ichi Life Insurance Company Limited</SelectItem>
                                <SelectItem value="IndiaFirst Life">IndiaFirst Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Edelweiss Life">Edelweiss Life Insurance Company Limited</SelectItem>
                                <SelectItem value="Go Digit Life">Go Digit Life Insurance Limited</SelectItem>
                              </>
                            )}
                            {(insuranceType === 'health' || insuranceType === 'travel') && (
                              <>
                                <SelectItem value="Acko General">Acko General Insurance Limited</SelectItem>
                                <SelectItem value="Bajaj General">Bajaj General Insurance Limited</SelectItem>
                                <SelectItem value="Cholamandalam MS">Cholamandalam MS General Insurance Company Limited</SelectItem>
                                <SelectItem value="Go Digit General">Go Digit General Insurance Limited</SelectItem>
                                <SelectItem value="HDFC ERGO">HDFC ERGO General Insurance Company Limited</SelectItem>
                                <SelectItem value="ICICI LOMBARD">ICICI LOMBARD General Insurance Company Limited</SelectItem>
                                <SelectItem value="IFFCO TOKIO">IFFCO TOKIO General Insurance Company Limited</SelectItem>
                                <SelectItem value="Liberty General">Liberty General Insurance Limited</SelectItem>
                                <SelectItem value="National Insurance">National Insurance Company Limited</SelectItem>
                                <SelectItem value="Reliance General">Reliance General Insurance Company Limited</SelectItem>
                                <SelectItem value="SBI General">SBI General Insurance Company Limited</SelectItem>
                                <SelectItem value="Tata AIG">Tata AIG General Insurance Company Limited</SelectItem>
                                <SelectItem value="New India Assurance">The New India Assurance Company Limited</SelectItem>
                                <SelectItem value="United India">United India Insurance Company Limited</SelectItem>
                                <SelectItem value="Care Health">Care Health Insurance Ltd.</SelectItem>
                                <SelectItem value="Niva Bupa Health">Niva Bupa Health Insurance Company Limited</SelectItem>
                                <SelectItem value="Star Health">Star Health & Allied Insurance Co. Ltd.</SelectItem>
                              </>
                            )}
                            {(insuranceType === 'motor' || insuranceType === 'fire' || insuranceType === 'marine' || insuranceType === 'liability' || insuranceType === 'sme' || insuranceType === 'other') && (
                              <>
                                <SelectItem value="Acko General">Acko General Insurance Limited</SelectItem>
                                <SelectItem value="Bajaj General">Bajaj General Insurance Limited</SelectItem>
                                <SelectItem value="Cholamandalam MS">Cholamandalam MS General Insurance Company Limited</SelectItem>
                                <SelectItem value="Go Digit General">Go Digit General Insurance Limited</SelectItem>
                                <SelectItem value="HDFC ERGO">HDFC ERGO General Insurance Company Limited</SelectItem>
                                <SelectItem value="ICICI LOMBARD">ICICI LOMBARD General Insurance Company Limited</SelectItem>
                                <SelectItem value="IFFCO TOKIO">IFFCO TOKIO General Insurance Company Limited</SelectItem>
                                <SelectItem value="National Insurance">National Insurance Company Limited</SelectItem>
                                <SelectItem value="Reliance General">Reliance General Insurance Company Limited</SelectItem>
                                <SelectItem value="SBI General">SBI General Insurance Company Limited</SelectItem>
                                <SelectItem value="Tata AIG">Tata AIG General Insurance Company Limited</SelectItem>
                                <SelectItem value="New India Assurance">The New India Assurance Company Limited</SelectItem>
                                <SelectItem value="United India">United India Insurance Company Limited</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Complaint Type</label>
                        <Select value={complaintType} onValueChange={(value) => {
                          setComplaintType(value);
                          // Auto-close for Claim Assistance after all 4 filters are selected
                          if (insuranceType !== 'all' && insuranceCompany !== 'all' && value !== 'all') {
                            setTimeout(() => setShowMobileFilters(false), 400);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complaint" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="rejection">Claim Rejection</SelectItem>
                            <SelectItem value="delay">Claim Delay</SelectItem>
                            <SelectItem value="short-settled">Claim Short settled</SelectItem>
                            <SelectItem value="mis-selling">Mis-selling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Agents List */}
            <div className="w-full md:w-3/4">
              <div className="mb-4 md:mb-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className={`min-w-0 flex-1 text-lg leading-tight md:text-2xl font-bold ${
                    serviceType === 'New Policy' ? 'text-secondary' :
                    serviceType === 'Claim Assistance' ? 'text-claim' :
                    serviceType === 'Policy Review' ? 'text-review' :
                    'text-foreground'
                  }`}>
                    {filteredAgents.length} Insurance Agents Available
                  </h1>
                  {/* Mobile Filter Icon */}
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      "md:hidden shrink-0 hover:bg-primary hover:text-white transition-all relative",
                      serviceType === 'New Policy' ? 'border-secondary text-secondary' :
                      serviceType === 'Claim Assistance' ? 'border-claim text-claim' :
                      serviceType === 'Policy Review' ? 'border-review text-review' : '',
                      highlightFilters && "ring-2 ring-primary ring-offset-2 animate-pulse"
                    )}
                    onClick={() => { setHighlightFilters(false); setShowMobileFilters(true); }}
                  >
                    <Filter className="h-5 w-5" />
                    {highlightFilters && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {compareList.length > 0 && (
                    <Button 
                      onClick={() => setShowCompareModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto"
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      Compare ({compareList.length})
                    </Button>
                  )}
                  <div className="flex w-full sm:w-auto items-center justify-between gap-2 sm:ml-auto sm:justify-end">
                    <span className="text-xs text-muted-foreground shrink-0">Sort by:</span>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger className="w-[140px] sm:w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Match %</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {filteredAgents.length > 0 ? (
                <>
                  {/* Visitor Info Banner */}
                  {(user || seekerDetails || userLocation) && (
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/15 rounded-xl p-3 sm:p-4 mb-4 animate-fade-in">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Logged-in user info */}
                        {user && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">👋 Hi, {user.name?.split(' ')[0] || 'there'}!</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        )}
                        {/* Seeker info for non-logged-in */}
                        {!user && seekerDetails && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{seekerDetails.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">👋 Hi, {seekerDetails.name?.split(' ')[0]}!</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{seekerDetails.email} • +91 {seekerDetails.phone}</p>
                            </div>
                          </div>
                        )}
                        {/* Location pill */}
                        {userLocation && cityName && (
                          <div className="flex items-center gap-1.5 bg-card/80 px-2.5 py-1 rounded-full border border-border/50 ml-auto">
                            <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-[10px] sm:text-xs font-medium text-foreground">{cityName}</span>
                          </div>
                        )}
                        {!userLocation && seekerDetails?.pincode && (
                          <div className="flex items-center gap-1.5 bg-card/80 px-2.5 py-1 rounded-full border border-border/50 ml-auto">
                            <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-[10px] sm:text-xs font-medium text-foreground">PIN: {seekerDetails.pincode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location prompt banner */}
                  {!userLocation && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Navigation className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Enable location for accurate distances</p>
                            <p className="text-xs text-muted-foreground">See how far each agent is from you</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={requestLocation}
                          disabled={isLocationLoading}
                            className="w-full sm:w-auto flex-shrink-0"
                        >
                          {isLocationLoading ? 'Getting...' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div key={serviceType} className="space-y-6 animate-fade-in min-h-[80vh]">
                    {/* Check if filters are complete for Claim Assistance */}
                    {serviceType === 'Claim Assistance' && (insuranceType === 'all' || insuranceCompany === 'all') && (
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <Filter className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-orange-900 mb-2">
                              Complete Required Filters to View Agents
                            </h3>
                            <p className="text-orange-800 text-sm mb-3">
                              For Claim Assistance service, please select the following required filters to see matching agents:
                            </p>
                            <ul className="space-y-1 text-orange-700 text-sm">
                              {insuranceType === 'all' && (
                                <li className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                  Insurance Type
                                </li>
                              )}
                              {insuranceCompany === 'all' && (
                                <li className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                  Insurance Company
                                </li>
                              )}
                            </ul>
                            <p className="text-orange-600 text-xs mt-3 italic">
                              * Complaint Type is optional and can be used to further refine your search
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Check if Insurance Type is selected for New Policy */}
                    {serviceType === 'New Policy' && insuranceType === 'all' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <Filter className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              Select Insurance Type to View Agents
                            </h3>
                            <p className="text-blue-800 text-sm mb-3">
                              Please select an Insurance Type from the filters to see matching agents for New Policy.
                            </p>
                            <ul className="space-y-1 text-blue-700 text-sm">
                              <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Insurance Type (required)
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Check if Insurance Types are selected for Policy Review */}
                    {serviceType === 'Policy Review' && selectedInsuranceTypes.length === 0 && (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                              <Filter className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-purple-900 mb-2">
                              Select Insurance Types to View Agents
                            </h3>
                            <p className="text-purple-800 text-sm mb-3">
                              Please select at least one Insurance Type from the filters to see matching agents for Policy Review.
                            </p>
                            <ul className="space-y-1 text-purple-700 text-sm">
                              <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                Insurance Type (required)
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {filteredAgents.slice(0, visibleCount).map(agent => {
                      const shouldBlur = 
                        (serviceType === 'Claim Assistance' && (insuranceType === 'all' || insuranceCompany === 'all')) ||
                        (serviceType === 'New Policy' && insuranceType === 'all') ||
                        (serviceType === 'Policy Review' && selectedInsuranceTypes.length === 0);
                      
                      // Assign a cover page based on agent ID hash
                      const hashCode = agent.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                      const coverIndex = hashCode % coverPageOptions.length;
                      const agentCover = coverPageOptions[coverIndex] || coverPageOptions[0];
                      
                      // Theme colors based on service type
                      const themeColors = serviceType === 'New Policy' 
                        ? { border: 'hover:border-secondary/50', text: 'group-hover:text-secondary', bg: 'bg-secondary', bgLight: 'bg-secondary-lighter' }
                        : serviceType === 'Claim Assistance'
                        ? { border: 'hover:border-claim/50', text: 'group-hover:text-claim', bg: 'bg-claim', bgLight: 'bg-claim-lighter' }
                        : serviceType === 'Policy Review'
                        ? { border: 'hover:border-review/50', text: 'group-hover:text-review', bg: 'bg-review', bgLight: 'bg-review-lighter' }
                        : { border: 'hover:border-primary/30', text: 'group-hover:text-primary', bg: 'bg-primary', bgLight: 'bg-primary-lighter' };
                      
                      return (
                      <Card 
                        key={agent.id} 
                        className={`overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/40 ${themeColors.border} bg-card relative group rounded-xl ${
                          shouldBlur ? 'blur-md pointer-events-none select-none' : ''
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Mobile Compact Layout */}
                          <div className="sm:hidden">
                            {/* Cover Strip - Themed */}
                            <div className={cn("h-10 w-full relative", 
                              serviceType === 'New Policy' ? 'bg-gradient-to-r from-secondary/20 via-secondary/10 to-secondary/20' :
                              serviceType === 'Claim Assistance' ? 'bg-gradient-to-r from-claim/20 via-claim/10 to-claim/20' :
                              serviceType === 'Policy Review' ? 'bg-gradient-to-r from-review/20 via-review/10 to-review/20' :
                              agentCover.className
                            )}>
                              {/* Match Score on Cover */}
                              <InfoTooltip content="Based on your requirements & our algo tracking.">
                                <div className={`absolute top-1.5 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                  agent.matchingScore > 90 ? 'bg-green-100 text-green-700' :
                                  agent.matchingScore >= 51 ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  {agent.matchingScore}%
                                </div>
                              </InfoTooltip>
                            </div>
                            
                            {/* Info Section with overlapping avatar */}
                            <div className="relative px-3 pb-3 pt-1.5">
                              {/* Avatar overlapping cover */}
                              <div className="flex items-start gap-2.5">
                                <div className="relative -mt-6 flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-card shadow-md ring-1 ring-primary/10">
                                    <img 
                                      src={agent.profileImage} 
                                      alt={agent.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  {agent.verified && (
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-accent text-white rounded-full p-0.5 shadow-sm">
                                      <CheckCircle className="h-2.5 w-2.5" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Name & Location */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex items-start gap-1 flex-wrap">
                                    <h3 className={`text-sm font-bold text-foreground break-words leading-tight transition-colors ${themeColors.text}`}>
                                      {agent.name}
                                    </h3>
                                    {agent.irdaLicensed && (
                                      <Badge className={`${themeColors.bgLight} ${
                                        serviceType === 'New Policy' ? 'text-secondary' :
                                        serviceType === 'Claim Assistance' ? 'text-claim' :
                                        serviceType === 'Policy Review' ? 'text-review' :
                                        'text-primary'
                                      } border-0 text-[8px] px-1 py-0 font-medium`}>
                                        IRDA
                                      </Badge>
                                    )}
                                    {getMockSubscriptionPlan(agent) === 'professional' && (
                                      <TrustedBadge variant="compact" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5 text-muted-foreground">
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span className="text-[10px] break-words leading-tight">{agent.location}</span>
                                  </div>
                                  {/* Distance in minutes - real calculation */}
                                  {userLocation && (
                                    <div className="flex items-center gap-0.5 text-muted-foreground mt-0.5">
                                      {distances[agent.id] ? (
                                        <>
                                          <Navigation className="h-2.5 w-2.5 text-primary/70" />
                                          <span className="text-[10px]">{formatTravelTime(distances[agent.id].travelTimeMin)} away</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-2.5 w-2.5 text-muted-foreground/50 animate-pulse" />
                                          <span className="text-[10px] text-muted-foreground/50">Calculating...</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Product Categories - Enhanced Visibility */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {filterAllowedTags(agent.specializations).slice(0, 3).map((spec, idx) => (
                                  <InfoTooltip key={idx} content={`Specializes in ${spec} insurance products`}>
                                    <Badge 
                                      className={`text-[9px] px-2 py-0.5 font-semibold cursor-pointer flex items-center gap-1 border ${getProductColor(spec)}`}
                                    >
                                      {getProductIcon(spec)}
                                      {spec}
                                    </Badge>
                                  </InfoTooltip>
                                ))}
                                {filterAllowedTags(agent.specializations).length > 3 && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 text-muted-foreground">
                                    +{filterAllowedTags(agent.specializations).length - 3}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Stats Row - Compact with Tooltips */}
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <InfoTooltip content={`${agent.rating}/5 based on ${agent.reviewCount} reviews`}>
                                  <div 
                                    className="inline-flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded cursor-pointer"
                                    onClick={() => navigate(`/agent/${agent.id}#reviews`)}
                                  >
                                    <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-semibold">{agent.rating}</span>
                                  </div>
                                </InfoTooltip>
                                <InfoTooltip content={`${agent.experience} years of industry experience`}>
                                  <div className="inline-flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded cursor-pointer">
                                    <Briefcase className="h-2.5 w-2.5 text-muted-foreground" />
                                    <span className="text-[10px] font-medium">{agent.experience}y</span>
                                  </div>
                                </InfoTooltip>
                                <InfoTooltip content={`${agent.claimsSettled} claims successfully settled worth ${agent.claimsAmount}`}>
                                  <div className="inline-flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded cursor-pointer">
                                    <FileCheck className="h-2.5 w-2.5 text-green-600" />
                                    <span className="text-[10px] font-medium text-green-700">{agent.claimsSettled}</span>
                                  </div>
                                </InfoTooltip>
                                <InfoTooltip content={`Serving ${getClientBaseDisplay(agent.id, (agent as any).approxClientBase)} clients`}>
                                  <div className="inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer">
                                    <Users className="h-2.5 w-2.5 text-blue-600" />
                                    <span className="text-[10px] font-medium text-blue-700">{getClientBaseDisplay(agent.id, (agent as any).approxClientBase)}</span>
                                  </div>
                                </InfoTooltip>
                              </div>
                              
                              {/* Actions Row - Compact - Themed */}
                              <div className="mt-2 grid grid-cols-3 gap-1.5">
                                <button
                                  onClick={() => handleContactAgent(agent, 'call')}
                                  className={`${themeColors.bg} hover:bg-primary text-white rounded py-1.5 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors min-w-0`}
                                >
                                  <PhoneCall className="h-3 w-3" />
                                  Call
                                </button>
                                <button
                                  onClick={() => handleContactAgent(agent, 'whatsapp')}
                                  className="bg-accent hover:bg-primary text-white rounded py-1.5 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors min-w-0"
                                >
                                  <FaWhatsapp className="h-3 w-3" />
                                  Chat
                                </button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`${
                                    serviceType === 'New Policy' ? 'border-secondary/30 text-secondary hover:bg-secondary' :
                                    serviceType === 'Claim Assistance' ? 'border-claim/30 text-claim hover:bg-claim' :
                                    serviceType === 'Policy Review' ? 'border-review/30 text-review hover:bg-review' :
                                    'border-primary/30 text-primary hover:bg-primary'
                                  } hover:text-white text-[10px] font-medium h-auto py-1.5 px-2 transition-colors min-w-0`}
                                  onClick={() => { trackProfileClick(agent.id); navigate(`/agent/${agent.id}`); }}
                                >
                                  Profile
                                </Button>
                              </div>

                              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCompare(agent.id);
                                  }}
                                  className={`p-1.5 rounded transition-all ${
                                    compareList.includes(agent.id) 
                                      ? 'bg-blue-50 text-blue-500' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <GitCompare className={`h-3 w-3 ${compareList.includes(agent.id) ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavourite(agent.id);
                                  }}
                                  className={`p-1.5 rounded transition-all ${
                                    favourites.includes(agent.id) 
                                      ? 'bg-red-50 text-red-500' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <Heart className={`h-3 w-3 ${favourites.includes(agent.id) ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Desktop Layout */}
                          <div className="hidden sm:flex flex-row">
                            {/* Cover Strip with Photo Section */}
                            <div className="relative w-[140px] md:w-[160px] flex-shrink-0">
                              {/* Cover background - Themed */}
                              <div className={cn("absolute inset-0", 
                                serviceType === 'New Policy' ? 'bg-gradient-to-b from-secondary/30 via-secondary/15 to-secondary/30' :
                                serviceType === 'Claim Assistance' ? 'bg-gradient-to-b from-claim/30 via-claim/15 to-claim/30' :
                                serviceType === 'Policy Review' ? 'bg-gradient-to-b from-review/30 via-review/15 to-review/30' :
                                agentCover.className
                              )} />
                              
                              {/* Content overlay */}
                              <div className="relative p-4 flex flex-col items-center justify-center h-full min-h-[180px]">
                                {/* Match Score - Top */}
                                <InfoTooltip content="Based on your requirements & our algo tracking.">
                                  <div className="mb-3">
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold cursor-pointer ${
                                      agent.matchingScore > 90 ? 'bg-green-100 text-green-700' :
                                      agent.matchingScore >= 51 ? 'bg-amber-100 text-amber-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      <Star className="w-3 h-3 fill-current" />
                                      {agent.matchingScore}% Match
                                    </div>
                                  </div>
                                </InfoTooltip>
                                
                                {/* Agent Photo */}
                                <div className="relative">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-white shadow-lg ring-2 ring-white/50">
                                    <img 
                                      src={agent.profileImage} 
                                      alt={agent.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  {agent.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-accent text-white rounded-full p-1 shadow-md">
                                      <CheckCircle className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action Buttons - Below Photo */}
                                <div className="flex items-center gap-2 mt-3">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCompare(agent.id);
                                          }}
                                          className={`p-1.5 rounded-lg transition-all ${
                                            compareList.includes(agent.id) 
                                              ? 'bg-primary text-primary-foreground' 
                                              : 'bg-white hover:bg-muted text-muted-foreground'
                                          } shadow-sm`}
                                        >
                                          <GitCompare className="h-3.5 w-3.5" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p className="text-xs">{compareList.includes(agent.id) ? 'Remove' : 'Compare'}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavourite(agent.id);
                                          }}
                                          className={`p-1.5 rounded-lg transition-all ${
                                            favourites.includes(agent.id) 
                                              ? 'bg-red-50 text-red-500' 
                                              : 'bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500'
                                          } shadow-sm`}
                                        >
                                          <Heart className={`h-3.5 w-3.5 ${favourites.includes(agent.id) ? 'fill-current' : ''}`} />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p className="text-xs">{favourites.includes(agent.id) ? 'Saved' : 'Save'}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                            
                            {/* Middle Section - Agent Info */}
                            <div className="flex-1 p-4 md:p-5 text-left">
                              {/* Name & Badge Row */}
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                                <div className="text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={`text-base md:text-lg font-bold text-foreground transition-colors ${themeColors.text}`}>
                                      {agent.name}
                                    </h3>
                                    {agent.verified && (
                                      <InfoTooltip content="Verified agent with completed KYC and background check">
                                        <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0.5 font-medium cursor-pointer">
                                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                                          Verified
                                        </Badge>
                                      </InfoTooltip>
                                    )}
                                    {agent.irdaLicensed && (
                                      <LicensedBadge 
                                        variant="compact" 
                                        themeColor={
                                          serviceType === 'New Policy' ? 'secondary' :
                                          serviceType === 'Claim Assistance' ? 'claim' :
                                          serviceType === 'Policy Review' ? 'review' :
                                          'primary'
                                        } 
                                      />
                                    )}
                                    {getMockSubscriptionPlan(agent) === 'professional' && (
                                      <TrustedBadge variant="compact" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs">{agent.location}</span>
                                  </div>
                                  {/* Distance in minutes - real calculation */}
                                  {userLocation && (
                                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                                      {distances[agent.id] ? (
                                        <>
                                          <Navigation className="h-3 w-3 text-primary/70" />
                                          <span className="text-xs">{formatTravelTime(distances[agent.id].travelTimeMin)} away</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-3 w-3 text-muted-foreground/50 animate-pulse" />
                                          <span className="text-xs text-muted-foreground/50">Calculating...</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Stats Row */}
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                <InfoTooltip content={`${agent.rating}/5 rating based on ${agent.reviewCount} customer reviews`}>
                                  <div 
                                    className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md cursor-pointer hover:bg-amber-100 transition-colors"
                                    onClick={() => navigate(`/agent/${agent.id}#reviews`)}
                                  >
                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-semibold">{agent.rating}</span>
                                    <span className="text-[10px] text-muted-foreground">({agent.reviewCount})</span>
                                  </div>
                                </InfoTooltip>
                                
                                <InfoTooltip content={`${agent.experience} years of experience in insurance industry`}>
                                  <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md cursor-pointer">
                                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium">{agent.experience} yrs</span>
                                  </div>
                                </InfoTooltip>
                                
                                <InfoTooltip content="Typically responds within 30 minutes">
                                  <div className="inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md cursor-pointer">
                                    <Clock className="h-3 w-3 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">Fast</span>
                                  </div>
                                </InfoTooltip>
                              </div>
                              
                              {/* Claims & Client Stats */}
                              <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <InfoTooltip content={`Successfully processed ${agent.claimsSettled} insurance claims`}>
                                  <div className="flex items-center gap-1.5 cursor-pointer">
                                    <div className="p-1.5 bg-secondary/10 rounded-md">
                                      <FileCheck className="h-3.5 w-3.5 text-secondary" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-xs font-bold text-foreground">{agent.claimsSettled}</p>
                                      <p className="text-[9px] text-muted-foreground uppercase">Claims</p>
                                    </div>
                                  </div>
                                </InfoTooltip>
                                
                                <InfoTooltip content={`Total claims worth ${agent.claimsAmount} successfully settled`}>
                                  <div className="flex items-center gap-1.5 cursor-pointer">
                                    <div className="p-1.5 bg-accent/10 rounded-md">
                                      <TrendingUp className="h-3.5 w-3.5 text-accent" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-xs font-bold text-foreground">{agent.claimsAmount}</p>
                                      <p className="text-[9px] text-muted-foreground uppercase">Settled</p>
                                    </div>
                                  </div>
                                </InfoTooltip>
                                
                                <InfoTooltip content={`Currently serving ${getClientBaseDisplay(agent.id, (agent as any).approxClientBase)} active clients`}>
                                  <div className="flex items-center gap-1.5 cursor-pointer">
                                    <div className="p-1.5 bg-blue-50 rounded-md">
                                      <Users className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-xs font-bold text-foreground">{getClientBaseDisplay(agent.id, (agent as any).approxClientBase)}</p>
                                      <p className="text-[9px] text-muted-foreground uppercase">Clients</p>
                                    </div>
                                  </div>
                                </InfoTooltip>
                              </div>
                              
                              {/* Specializations - Enhanced Visibility */}
                              <div className="flex flex-wrap gap-2">
                                {filterAllowedTags(agent.specializations).slice(0, 4).map((spec, index) => (
                                  <InfoTooltip key={index} content={`Expert in ${spec} insurance products and services`}>
                                    <Badge 
                                      className={`text-[11px] px-2.5 py-1 font-semibold cursor-pointer flex items-center gap-1.5 border shadow-sm ${getProductColor(spec)}`}
                                    >
                                      {getProductIcon(spec)}
                                      {spec}
                                    </Badge>
                                  </InfoTooltip>
                                ))}
                                {filterAllowedTags(agent.specializations).length > 4 && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-1 text-muted-foreground">
                                    +{filterAllowedTags(agent.specializations).length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Right Section - Actions */}
                            <div className="w-[120px] md:w-[140px] flex-shrink-0 border-l border-border/30 bg-muted/10 p-3 md:p-4 flex flex-col items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleContactAgent(agent, 'call')}
                                      className={`w-full ${themeColors.bg} hover:bg-primary text-white rounded-lg py-2.5 px-4 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5`}
                                    >
                                      <PhoneCall className="h-4 w-4" />
                                      <span className="text-xs font-medium hidden md:inline">Call</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Call Now</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleContactAgent(agent, 'whatsapp')}
                                      className="w-full bg-accent hover:bg-primary text-white rounded-lg py-2.5 px-4 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                                    >
                                      <FaWhatsapp className="h-4 w-4" />
                                      <span className="text-xs font-medium hidden md:inline">Chat</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>WhatsApp</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={`w-full ${
                                  serviceType === 'New Policy' ? 'border-secondary/30 text-secondary hover:bg-secondary' :
                                  serviceType === 'Claim Assistance' ? 'border-claim/30 text-claim hover:bg-claim' :
                                  serviceType === 'Policy Review' ? 'border-review/30 text-review hover:bg-review' :
                                  'border-primary/30 text-primary hover:bg-primary'
                                } hover:text-white text-xs font-medium transition-colors`}
                                onClick={() => { trackProfileClick(agent.id); navigate(`/agent/${agent.id}`); }}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                </div>
                
                {/* Load More Button */}
                {visibleCount < filteredAgents.length && (
                  <div className="mt-8 flex justify-center">
                    <Button 
                      onClick={handleLoadMore}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-12 py-6 text-lg"
                    >
                      Find More Agents ({filteredAgents.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
              ) : (
                <Card className="p-12 text-center">
                  <h3 className="text-xl font-medium mb-2">No agents found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to find more results.
                  </p>
                  <Button onClick={handleClearFilters}>Clear All Filters</Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AgentsListing;