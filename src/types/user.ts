
export interface UserProfile {
  uid: string;
  id: string;
  name: string;
  email: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  photoURL?: string;
  bio?: string;
  gymLocation?: {
    latitude: number;
    longitude: number;
  };
  attendance?: {
    [date: string]: boolean;
  };
  streakCount?: number;
  lastCheckInDate?: string;
}
