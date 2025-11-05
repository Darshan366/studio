
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';
import { updateDoc, DocumentReference, DocumentData } from 'firebase/firestore';

const CHECKIN_DISTANCE_METERS = 200;

// Haversine formula to calculate distance between two lat/lon points
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

function isWithinTimeWindow(start: string, end: string): boolean {
    const now = new Date();
    const startTime = new Date();
    const endTime = new Date();

    const [startHours, startMinutes] = start.split(':').map(Number);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = end.split(':').map(Number);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    // Handle overnight window
    if (endTime < startTime) {
        // e.g., 10 PM to 2 AM
        return now >= startTime || now <= endTime;
    }
    
    return now >= startTime && now <= endTime;
}


export function useAutoCheckin(
  userProfile: UserProfile | null,
  userDocRef: DocumentReference<DocumentData, DocumentData> | null
) {
  const { toast } = useToast();

  useEffect(() => {
    if (!userProfile || !userDocRef) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Check if already checked in today
    if (userProfile.lastCheckInDate === todayStr) {
      return;
    }
    
    // 2. Check if gym location and time are set
    if (!userProfile.gymCoordinates?.latitude || !userProfile.gymCoordinates?.longitude) {
      console.log('Gym location not set.');
      return;
    }
    if (!userProfile.usualGymTime?.start || !userProfile.usualGymTime?.end) {
      console.log('Usual gym time not set.');
      return;
    }

    // 3. Check if it's within the user's usual gym time window
    if (!isWithinTimeWindow(userProfile.usualGymTime.start, userProfile.usualGymTime.end)) {
        console.log('Outside of usual gym time window.');
        return;
    }
    
    const checkLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const distance = getDistance(
            latitude,
            longitude,
            userProfile.gymCoordinates!.latitude,
            userProfile.gymCoordinates!.longitude
          );

          if (distance <= CHECKIN_DISTANCE_METERS) {
            // User is at the gym, perform check-in
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            const attendance = userProfile.attendance || {};

            const newStreakCount = attendance[yesterdayStr]
              ? (userProfile.streakCount || 0) + 1
              : 1;

            await updateDoc(userDocRef, {
              [`attendance.${todayStr}`]: true,
              lastCheckInDate: todayStr,
              streakCount: newStreakCount,
            });

            toast({
              title: `🔥 Great work! Streak +1!`,
              description: `You're on a ${newStreakCount}-day streak!`
            });
          } else {
            console.log(`User is ${distance.toFixed(0)}m away from the gym. No check-in.`);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
             toast({
                variant: 'destructive',
                title: '⚠️ Location permission denied.',
                description: 'Cannot check in automatically without location access.'
             });
          }
        }
      );
    };

    checkLocation();
    
  }, [userProfile, userDocRef, toast]);
}
