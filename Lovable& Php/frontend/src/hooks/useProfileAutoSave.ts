import { useEffect, useCallback, useRef } from 'react';
import { toast } from "@/components/ui/sonner";

const LOCAL_STORAGE_KEY = 'padosiagent_profile_draft';

export interface ProfileFormData {
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
    familyLicenses: any[];
    // Performance stats
    claimsProcessed: string;
    claimsSettled: string;
    claimsAmount: string;
    successRate: string;
    responseTime: string;
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
    careerTimeline: { id: string; year: string; month?: string; event: string; type: string }[];
    galleryImages: { url: string; caption: string }[];
  };
  healthExpertise: Record<string, number>;
  lifeExpertise: Record<string, number>;
  motorExpertise: Record<string, number>;
  smeExpertise: Record<string, number>;
  productPortfolio: Record<string, any>;
  leadPreferences: {
    wantsNewBusinessLeads: boolean;
    newBusinessLeadCharging: string;
    newBusinessLeadAmount: number;
    wantsPortfolioLeads: boolean;
    portfolioLeadCharging: string;
    portfolioLeadAmount: number;
    wantsClaimsLeads: boolean;
    claimsLeadCharging: string;
    claimsLeadAmount: number;
  };
  declarationsAccepted: boolean;
  activeSection: string;
  lastSaved: string;
}

export const useProfileAutoSave = (
  formData: Partial<ProfileFormData>,
  userId?: string
) => {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<string>('');

  // Save to localStorage with debounce
  const saveToLocalStorage = useCallback((data: Partial<ProfileFormData>) => {
    if (!userId) return;
    
    const key = `${LOCAL_STORAGE_KEY}_${userId}`;
    const dataToSave = {
      ...data,
      lastSaved: new Date().toISOString(),
    };
    
    try {
      const dataString = JSON.stringify(dataToSave);
      // Only save if data has changed
      if (dataString !== lastSaveRef.current) {
        localStorage.setItem(key, dataString);
        lastSaveRef.current = dataString;
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [userId]);

  // Debounced auto-save
  useEffect(() => {
    if (!userId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage(formData);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, saveToLocalStorage, userId]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): ProfileFormData | null => {
    if (!userId) return null;
    
    const key = `${LOCAL_STORAGE_KEY}_${userId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as ProfileFormData;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }, [userId]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (!userId) return;
    
    const key = `${LOCAL_STORAGE_KEY}_${userId}`;
    try {
      localStorage.removeItem(key);
      lastSaveRef.current = '';
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [userId]);

  // Check if there's saved data
  const hasSavedData = useCallback((): boolean => {
    if (!userId) return false;
    
    const key = `${LOCAL_STORAGE_KEY}_${userId}`;
    return localStorage.getItem(key) !== null;
  }, [userId]);

  // Get last saved time
  const getLastSavedTime = useCallback((): Date | null => {
    const data = loadFromLocalStorage();
    if (data?.lastSaved) {
      return new Date(data.lastSaved);
    }
    return null;
  }, [loadFromLocalStorage]);

  // Force save now
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveToLocalStorage(formData);
    toast.success('Progress saved!', { duration: 2000 });
  }, [formData, saveToLocalStorage]);

  return {
    loadFromLocalStorage,
    clearSavedData,
    hasSavedData,
    getLastSavedTime,
    saveNow,
  };
};
