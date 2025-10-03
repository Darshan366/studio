
export interface UserProfile {
  uid: string;
  id: string;
  name: string;
  email: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  photoURL?: string;
  bio?: string;
}
