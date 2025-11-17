
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getAuth } from 'firebase/auth';
import type { UserProfile } from '@/types/user';

// Initialize Firebase Admin App
// Note: In a real server environment, you'd use Admin SDK.
// For Next.js API routes, client SDK with a server-like mindset is okay for simplicity
// if rules are properly configured.
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Haversine formula to calculate distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export async function GET(req: Request) {
    // In a real app, you'd get the current user ID from a verified session/token
    // For this example, we'll assume a way to get the user ID, maybe from headers or a POST body
    // This is NOT secure for production without proper auth checks.
    const authHeader = req.headers.get('Authorization');
    const currentUserId = authHeader?.split('Bearer ')[1]; // Placeholder for auth

    if (!currentUserId) {
        // This is a simplified auth check. Use NextAuth.js or similar for production.
        // Can't get user from client-side `useUser` hook here.
        // We will proceed without a user for now, which means we can't filter the current user out.
        // This is a limitation of this simplified example.
        console.warn("No user ID found, returning all users.");
    }
    
    try {
        const usersRef = collection(db, 'users');
        const allUsersSnap = await getDocs(usersRef);
        const allUsers = allUsersSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserProfile[];
        
        const currentUser = allUsers.find(u => u.uid === currentUserId);
        
        if (!currentUser) {
            // Can't do matching without the current user's location info
            return NextResponse.json({ profiles: allUsers.filter(u => u.uid !== currentUserId) });
        }

        const seenUserIds = new Set<string>([currentUserId]);
        // In a real app, also fetch and add swiped-left users to `seenUserIds`

        const sameGym: UserProfile[] = [];
        const nearby: UserProfile[] = [];
        const sameCity: UserProfile[] = [];

        allUsers.forEach(user => {
            if (seenUserIds.has(user.uid)) return;

            let added = false;

            // Priority 1: Same Gym
            if (currentUser.gymAddress && user.gymAddress && currentUser.gymAddress === user.gymAddress) {
                sameGym.push(user);
                added = true;
            }

            // Priority 2: Nearby (within 5km)
            if (!added && currentUser.gymCoordinates && user.gymCoordinates) {
                const distance = getDistance(
                    currentUser.gymCoordinates.latitude,
                    currentUser.gymCoordinates.longitude,
                    user.gymCoordinates.latitude,
                    user.gymCoordinates.longitude
                );
                if (distance <= 5) {
                    nearby.push(user);
                    added = true;
                }
            }

            // Priority 3: Same City
            if (!added && currentUser.city && user.city && currentUser.city === user.city) {
                sameCity.push(user);
            }
        });

        // Add sorting for relevancy within groups if needed
        // e.g., sameGym.sort((a, b) => sortByRelevance(a, b));

        const sortedProfiles = [...sameGym, ...nearby, ...sameCity];

        // Ensure no duplicates
        const finalProfiles = Array.from(new Set(sortedProfiles.map(p => p.uid)))
            .map(uid => sortedProfiles.find(p => p.uid === uid)!);

        return NextResponse.json({ profiles: finalProfiles });

    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

    