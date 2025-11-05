
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
  usualGymTime?: {
      start: string; // HH:MM
      end: string; // HH:MM
  };
  attendance?: {
    [date: string]: boolean;
  };
  streakCount?: number;
  lastCheckInDate?: string;
}
