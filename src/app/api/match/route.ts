
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getAuth } from 'firebase/auth';
import type { UserProfile } from '@/types/user';

// Initialize Firebase App
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
    const authHeader = req.headers.get('Authorization');
    const currentUserId = authHeader?.split('Bearer ')[1]; 

    if (!currentUserId) {
        console.warn("No user ID found, returning empty profiles.");
        return NextResponse.json({ profiles: [] });
    }
    
    try {
        const usersRef = collection(db, 'users');
        const allUsersSnap = await getDocs(usersRef);
        const allUsers = allUsersSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserProfile[];
        
        const currentUser = allUsers.find(u => u.uid === currentUserId);
        
        // --- START: Fetch existing matches and swipes to exclude them ---
        const matchesQuery = query(collection(db, 'matches'), where('users', 'array-contains', currentUserId));
        const matchesSnap = await getDocs(matchesQuery);
        const seenUserIds = new Set<string>([currentUserId]);
        
        matchesSnap.docs.forEach(doc => {
            const users = doc.data().users as string[];
            const otherUserId = users.find(uid => uid !== currentUserId);
            if (otherUserId) seenUserIds.add(otherUserId);
        });

        const swipesQuery = query(collection(db, 'swipes'), where('swiperId', '==', currentUserId));
        const swipesSnap = await getDocs(swipesQuery);
        swipesSnap.docs.forEach(doc => {
            seenUserIds.add(doc.data().targetId);
        });
        // --- END: Fetch seen users ---

        const unseenUsers = allUsers.filter(u => !seenUserIds.has(u.uid));

        // If current user's location data is not available, we can't perform prioritized matching.
        // We'll return a list of all users they haven't seen yet.
        if (!currentUser || (!currentUser.gymAddress && !currentUser.gymCoordinates && !currentUser.city)) {
            return NextResponse.json({ profiles: unseenUsers });
        }

        const sameGym: UserProfile[] = [];
        const nearby: UserProfile[] = [];
        const sameCity: UserProfile[] = [];
        const others: UserProfile[] = [];

        unseenUsers.forEach(user => {
            let categorized = false;

            // Priority 1: Same Gym
            if (currentUser.gymAddress && user.gymAddress && currentUser.gymAddress.toLowerCase() === user.gymAddress.toLowerCase()) {
                sameGym.push(user);
                categorized = true;
            }

            // Priority 2: Nearby (within 5km) - This can include the same gym, we will filter later
            if (currentUser.gymCoordinates && user.gymCoordinates) {
                const distance = getDistance(
                    currentUser.gymCoordinates.latitude,
                    currentUser.gymCoordinates.longitude,
                    user.gymCoordinates.latitude,
                    user.gymCoordinates.longitude
                );
                if (distance <= 5) {
                    nearby.push(user);
                    categorized = true;
                }
            }

            // Priority 3: Same City
            if (currentUser.city && user.city && currentUser.city.toLowerCase() === user.city.toLowerCase()) {
                sameCity.push(user);
                categorized = true;
            }
            
            // Fallback for remaining users
            if (!categorized) {
                others.push(user);
            }
        });

        // Use a Set to remove duplicates while maintaining priority order
        const uniqueProfiles = new Set<UserProfile>();

        [...sameGym, ...nearby, ...sameCity, ...others].forEach(profile => {
          uniqueProfiles.add(profile);
        });
        
        const finalProfiles = Array.from(uniqueProfiles);
        
        return NextResponse.json({ profiles: finalProfiles });

    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
