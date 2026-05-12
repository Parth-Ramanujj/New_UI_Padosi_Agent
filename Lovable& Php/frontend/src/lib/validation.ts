import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^[+]?[0-9\s\-()]{10,20}$/;
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/;

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
  comment: z.string()
    .trim()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must be less than 500 characters'),
  agentId: z.string().uuid('Invalid agent ID'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// Lead validation schema
export const leadSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .max(20, 'Phone number must be less than 20 characters')
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .nullable()
    .or(z.literal('')),
  product_interest: z.string()
    .trim()
    .max(100, 'Product interest must be less than 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  location: z.string()
    .trim()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  notes: z.string()
    .trim()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  status: z.enum(['new', 'contacted', 'followup', 'closed']).default('new'),
});

export type LeadInput = z.infer<typeof leadSchema>;

// Agent profile validation schema
export const agentProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .trim()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  whatsapp: z.string()
    .trim()
    .max(20, 'WhatsApp must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  experience: z.string()
    .trim()
    .max(50, 'Experience must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .trim()
    .max(2000, 'Bio must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  image: z.string()
    .trim()
    .max(500, 'Image URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string()
      .trim()
      .max(200, 'LinkedIn URL must be less than 200 characters')
      .optional()
      .or(z.literal('')),
    facebook: z.string()
      .trim()
      .max(200, 'Facebook URL must be less than 200 characters')
      .optional()
      .or(z.literal('')),
    twitter: z.string()
      .trim()
      .max(200, 'Twitter URL must be less than 200 characters')
      .optional()
      .or(z.literal('')),
  }).optional(),
  specializations: z.array(z.string().trim().max(50)).max(20, 'Maximum 20 specializations allowed').optional(),
  languages: z.array(z.string().trim().max(30)).max(10, 'Maximum 10 languages allowed').optional(),
  certifications: z.array(z.string().trim().max(100)).max(20, 'Maximum 20 certifications allowed').optional(),
});

export type AgentProfileInput = z.infer<typeof agentProfileSchema>;

// Helper function to validate and get errors
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map((err) => err.message);
  return { success: false, errors };
}

// Helper to get first error message
export function getFirstValidationError<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): string | null {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return null;
  }
  
  return result.error.errors[0]?.message || 'Validation failed';
}
