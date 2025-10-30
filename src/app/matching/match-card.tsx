
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Heart, X, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import {
  collection,
  writeBatch,
  doc,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';

export default function MatchCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [hasFetchedSwipes, setHasFetchedSwipes] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // 1. Get IDs of users the current user has already swiped on
  useEffect(() => {
    if (!user || !firestore) return;
    
    const fetchSwipedUsers = async () => {
        // Reset state for user change
        setHasFetchedSwipes(false);
        setSwipedIds([]);
        setCurrentIndex(0);

        const swipesQuery = query(
          collection(firestore, 'swipes'),
          where('swiperId', '==', user.uid)
        );
        try {
            const swipesSnapshot = await getDocs(swipesQuery);
            const seenIds = swipesSnapshot.docs.map((doc) => doc.data().targetId);
            setSwipedIds(seenIds);
        } catch (e) {
            console.error("Failed to fetch swipes", e);
        } finally {
            setHasFetchedSwipes(true);
        }
    };

    fetchSwipedUsers();
  }, [user, firestore]);

  // 2. Query for users, excluding self and already swiped users.
  const usersToExclude = useMemo(() => {
      // Create a non-empty array for the 'not-in' query to work.
      // Firestore 'not-in' queries cannot be called with an empty array.
      if (!user) return ['placeholder']; 
      // Start with the current user's ID.
      const excluded = [user.uid];
      // Add IDs of users already swiped on.
      if (swipedIds.length > 0) {
          excluded.push(...swipedIds);
      }
      return excluded;
  }, [user, swipedIds]);

  const potentialMatchesQuery = useMemoFirebase(() => {
    // Wait until we have the list of users to exclude.
    if (!user || !firestore || !hasFetchedSwipes) return null;
    
    // The usersToExclude array will always have at least the current user's UID,
    // so it's safe to use in a 'not-in' query.
    return query(
        collection(firestore, 'users'),
        where('uid', 'not-in', usersToExclude),
        limit(10)
    );
  }, [user, firestore, hasFetchedSwipes, usersToExclude]);

  const { data: profiles, isLoading: isLoadingProfiles, error: profilesError } = useCollection<UserProfile>(potentialMatchesQuery);

  useEffect(() => {
      if(profilesError) {
          toast({
              variant: 'destructive',
              title: 'Error Loading Matches',
              description: 'There was a problem loading potential matches. You might not have permission to view other users.',
          });
      }
  }, [profilesError, toast]);

  const checkForMatch = async (targetUserId: string) => {
    if (!user || !firestore) return;
    const matchQuery = query(
      collection(firestore, 'swipes'),
      where('swiperId', '==', targetUserId),
      where('targetId', '==', user.uid),
      where('direction', '==', 'right'),
      limit(1)
    );

    const matchSnapshot = await getDocs(matchQuery);
    return !matchSnapshot.empty;
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !firestore || !profiles || profiles.length === 0) return;

    const targetUser = profiles[currentIndex];
    if (!targetUser) return;
    
    setIsSwiping(true);

    try {
        const batch = writeBatch(firestore);

        // Record the current user's swipe
        const swipeRef = doc(collection(firestore, 'swipes'));
        batch.set(swipeRef, {
            swiperId: user.uid,
            targetId: targetUser.uid,
            direction,
            timestamp: serverTimestamp(),
        });

        // If it's a right swipe, check for a match
        if (direction === 'right') {
            const isMatch = await checkForMatch(targetUser.uid);
            if (isMatch) {
                // It's a match! Create a match document.
                const matchRef = doc(collection(firestore, 'matches'));
                batch.set(matchRef, {
                    users: [user.uid, targetUser.uid],
                    createdAt: serverTimestamp(),
                });

                // Create a conversation document as well
                const conversationRef = doc(firestore, 'conversations', matchRef.id);
                batch.set(conversationRef, {
                    users: [user.uid, targetUser.uid],
                    lastMessage: 'You matched! Say hello!',
                    updatedAt: serverTimestamp(),
                });

                toast({
                    title: "It's a Match!",
                    description: `You and ${targetUser.name} have liked each other.`,
                });
            }
        }
        
        // This commit was missing a success toast for non-match swipes
        await batch.commit();

        if (direction === 'left' || (direction === 'right' && !(await checkForMatch(targetUser.uid)))) {
             toast({
                title: "Swipe recorded!",
                description: "Your choice has been saved.",
            });
        }

    } catch (error) {
        console.error("Error during swipe operation:", error);
         toast({
            variant: "destructive",
            title: "Swipe Error",
            description: "Could not record your swipe. Please try again.",
        });
    } finally {
        // Add the swiped user to the local list to prevent re-seeing them before a refresh
        setSwipedIds(prev => [...prev, targetUser.uid]);
        // Move to the next profile
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setIsSwiping(false);
    }
  };

  const isLoading = isLoadingProfiles || !hasFetchedSwipes;
  const currentProfiles = profiles || [];
  
  if (isLoading) {
    return (
        <Card className="flex h-[500px] items-center justify-center">
            <CardContent className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Finding potential matches...</p>
            </CardContent>
        </Card>
    )
  }

  if (currentProfiles.length === 0 || currentIndex >= currentProfiles.length) {
    return (
      <Card className="flex h-[500px] items-center justify-center">
        <CardContent className="text-center">
          <p className="text-muted-foreground">No more profiles to show right now.</p>
          <p className="text-xs text-muted-foreground mt-2">Check back later!</p>
        </CardContent>
      </Card>
    );
  }

  const currentProfile = currentProfiles[currentIndex];

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <div className="relative h-[400px] w-full">
          <Image
            src={currentProfile.photoURL || `https://picsum.photos/seed/${currentProfile.uid}/600/800`}
            alt={currentProfile.name}
            fill
            className="object-cover"
            data-ai-hint="person fitness"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 w-full p-4 text-white">
            <h2 className="text-2xl font-bold">{currentProfile.name}</h2>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Badge>{currentProfile.fitnessLevel}</Badge>
          </div>
          <p className="text-muted-foreground h-16">{currentProfile.bio || "No bio yet."}</p>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
          onClick={() => handleSwipe('left')}
          disabled={isSwiping}
        >
          {isSwiping ? <Loader2 className="h-8 w-8 animate-spin" /> : <X className="h-8 w-8" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500/10 disabled:opacity-50"
          onClick={() => handleSwipe('right')}
          disabled={isSwiping}
        >
          {isSwiping ? <Loader2 className="h-8 w-8 animate-spin" /> : <Heart className="h-8 w-8" />}
        </Button>
      </div>
    </div>
  );
}
