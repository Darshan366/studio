
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Heart, X, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
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

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);

  const swipesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'swipes');
  }, [firestore]);

  useEffect(() => {
    const fetchPotentialMatches = async () => {
      if (!user || !firestore) return;

      setIsLoading(true);
      try {
        // 1. Get IDs of users the current user has already swiped on
        const swipesQuery = query(
          collection(firestore, 'swipes'),
          where('swiperId', '==', user.uid)
        );
        const swipesSnapshot = await getDocs(swipesQuery);
        const swipedIds = swipesSnapshot.docs.map((doc) => doc.data().targetId);

        // 2. Query for users, excluding self and already swiped users
        const usersToExclude = [user.uid, ...swipedIds];

        const usersQuery = query(
            collection(firestore, 'users'),
            limit(20)
        );

        const usersSnapshot = await getDocs(usersQuery);
        const potentialMatches = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
            .filter(profile => !usersToExclude.includes(profile.uid));


        setProfiles(potentialMatches);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching potential matches:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load potential matches.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPotentialMatches();
  }, [user, firestore, toast]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !swipesCollection || profiles.length === 0) return;

    const targetUser = profiles[currentIndex];
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

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <Card className="flex h-[500px] items-center justify-center">
        <CardContent className="text-center">
          <p className="text-muted-foreground">No more profiles to show right now.</p>
          <p className="text-xs text-muted-foreground mt-2">Check back later!</p>
        </CardContent>
      </Card>
    );
  }

  const currentProfile = profiles[currentIndex];

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
