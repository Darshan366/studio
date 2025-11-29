
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
        
        // --- START: Fetch existing matches to exclude them ---
        const matchesQuery = query(collection(db, 'matches'), where('users', 'array-contains', currentUserId));
        const matchesSnap = await getDocs(matchesQuery);
        const matchedUserIds = new Set<string>(matchesSnap.docs.map(doc => {
            const users = doc.data().users as string[];
            return users.find(uid => uid !== currentUserId)!;
        }));
        // --- END: Fetch existing matches ---

        if (!currentUser) {
            // Can't do matching without the current user's location info
            return NextResponse.json({ profiles: allUsers.filter(u => u.uid !== currentUserId && !matchedUserIds.has(u.uid)) });
        }

        const seenUserIds = new Set<string>([currentUserId, ...matchedUserIds]);
        // Also fetch and add swiped-left users to `seenUserIds` for better filtering
        const swipesQuery = query(collection(db, 'swipes'), where('swiperId', '==', currentUserId));
        const swipesSnap = await getDocs(swipesQuery);
        swipesSnap.docs.forEach(doc => {
            seenUserIds.add(doc.data().targetId);
        });

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

        const sortedProfiles = [...sameGym, ...nearby, ...sameCity];

        // Ensure no duplicates and user is not already seen
        const finalProfiles = sortedProfiles.filter(p => !seenUserIds.has(p.uid));
        
        return NextResponse.json({ profiles: finalProfiles });

    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
