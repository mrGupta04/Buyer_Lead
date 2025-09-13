// lib/validations.ts
import { z } from 'zod';

export const BuyerFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['Studio', 'One', 'Two', 'Three', 'Four']).optional(), // Changed to match Prisma
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.number().min(0, 'Budget must be positive').optional().nullable(),
  budgetMax: z.number().min(0, 'Budget must be positive').optional().nullable(),
  timeline: z.enum(['ZeroToThree', 'ThreeToSix', 'MoreThanSix', 'Exploring']), // Changed to match Prisma
  source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']), // Changed to match Prisma
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).default('New'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.array(z.string()).optional(),
})
.refine((data) => {
  if (['Apartment', 'Villa'].includes(data.propertyType)) {
    return data.bhk !== undefined;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
})
.refine((data) => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax'],
});

export type BuyerFormData = z.infer<typeof BuyerFormSchema>;

export const CSVImportSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']).optional().default('Chandigarh'),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']).optional().default('Apartment'),
  bhk: z.enum(['Studio', 'One', 'Two', 'Three', 'Four']).optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  purpose: z.enum(['Buy', 'Rent']).optional().default('Buy'),
  budgetMin: z.coerce.number().min(0).optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  budgetMax: z.coerce.number().min(0).optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  timeline: z.enum(['ZeroToThree', 'ThreeToSix', 'MoreThanSix', 'Exploring']).optional().default('Exploring'),
  source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']).optional().default('Other'),
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).optional().default('New'),
  notes: z.string().max(1000).optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  
  // FIXED: Tags now properly handles null values
  tags: z.union([
    z.string(),
    z.null()
  ])
  .optional()
  .nullable()
  .transform(str => {
    if (!str || str === '' || str === null) return [];
    return str.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
  })
  .default([]),
});