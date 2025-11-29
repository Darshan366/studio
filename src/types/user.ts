import { z } from 'zod';

export const UserProfileSchema = z.object({
  uid: z.string(),
  id: z.string().optional(), // id is not always present
  name: z.string(),
  email: z.string().email(),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  photoURL: z.string().url().optional(),
  bio: z.string().optional(),
  gymAddress: z.string().optional(),
  gymCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  city: z.string().optional(),
  usualGymTime: z.object({
    start: z.string(), // HH:MM
    end: z.string(), // HH:MM
  }).optional(),
  attendance: z.record(z.boolean()).optional(),
  streakCount: z.number().optional(),
  lastCheckInDate: z.string().optional(),
  weight: z.number().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  dietaryPreference: z.enum(['Anything', 'Vegetarian', 'Vegan']).optional(),
});


export type UserProfile = z.infer<typeof UserProfileSchema>;
