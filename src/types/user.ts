
export interface UserProfile {
  uid: string;
  id: string;
  name: string;
  email: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  photoURL?: string;
  bio?: string;
  gymAddress?: string;
  gymCoordinates?: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  usualGymTime?: {
      start: string; // HH:MM
      end: string; // HH:MM
  };
  attendance?: {
    [date: string]: boolean;
  };
  streakCount?: number;
  lastCheckInDate?: string;
  weight?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dietaryPreference?: 'Anything' | 'Vegetarian' | 'Vegan';
  fitnessGoal?: 'Fat Loss' | 'Muscle Gain' | 'Maintenance';
}
