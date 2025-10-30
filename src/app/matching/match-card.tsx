
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Heart, X, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError, useCollection } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
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

  const swipesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'swipes');
  }, [firestore]);
  
  // 1. Get IDs of users the current user has already swiped on
  useEffect(() => {
    if (!user || !firestore || hasFetchedSwipes) return;
    
    const fetchSwipedUsers = async () => {
        const swipesQuery = query(
          collection(firestore, 'swipes'),
          where('swiperId', '==', user.uid)
        );
        const swipesSnapshot = await getDocs(swipesQuery);
        const seenIds = swipesSnapshot.docs.map((doc) => doc.data().targetId);
        setSwipedIds(seenIds);
        setHasFetchedSwipes(true);
    };

    fetchSwipedUsers();
  }, [user, firestore, hasFetchedSwipes]);

  // 2. Query for users, excluding self and already swiped users.
  const usersToExclude = useMemo(() => {
      if(!user) return ['']; // Return a non-empty array for 'not-in' query
      return [user.uid, ...swipedIds];
  }, [user, swipedIds]);

  const potentialMatchesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !hasFetchedSwipes || usersToExclude.length === 0) return null;
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


  const handleSwipe = (direction: 'left' | 'right') => {
    if (!user || !swipesCollection || !profiles || profiles.length === 0) return;

    const targetUser = profiles[currentIndex];
    if (!targetUser) return;
    
    setIsSwiping(true);

    const swipeData = {
        swiperId: user.uid,
        targetId: targetUser.uid,
        direction: direction,
        timestamp: serverTimestamp(),
      };

    addDoc(swipesCollection, swipeData).catch(error => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: swipesCollection.path,
                operation: 'create',
                requestResourceData: swipeData,
            })
        )
    }).finally(() => {
        if (direction === 'right') {
            toast({
                title: "Swipe recorded!",
                description: "We'll let you know if it's a match.",
            });
        }
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setIsSwiping(false);
    });
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
