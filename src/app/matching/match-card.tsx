
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Heart, X, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, useCollection, errorEmitter, FirestorePermissionError } from '@/firebase';
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Query for all users. We will filter the current user out on the client.
  const potentialMatchesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    return query(
        collection(firestore, 'users'),
    );
  }, [firestore]);

  const { data: profiles, isLoading: isLoadingProfiles, error: profilesError } = useCollection<UserProfile>(potentialMatchesQuery);

  const filteredProfiles = useMemo(() => {
      if (!profiles || !user) return [];
      return profiles.filter(p => p.uid !== user.uid);
  }, [profiles, user]);

  useEffect(() => {
      if(profilesError) {
          toast({
              variant: 'destructive',
              title: 'Error Loading Matches',
              description: profilesError.message || 'There was a problem loading potential matches.',
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
    if (!user || !firestore || filteredProfiles.length === 0) return;

    const targetUser = filteredProfiles[currentIndex];
    if (!targetUser) return;
    
    setIsSwiping(true);

    const batch = writeBatch(firestore);

    // Record the current user's swipe
    const swipeRef = doc(collection(firestore, 'swipes'));
    const swipeData = {
        swiperId: user.uid,
        targetId: targetUser.uid,
        direction,
        timestamp: serverTimestamp(),
    };
    batch.set(swipeRef, swipeData);

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
    
    batch.commit().catch(error => {
      const permissionError = new FirestorePermissionError({
        path: 'batch-write', // Batched writes don't have a single path
        operation: 'write',
        requestResourceData: { swipe: swipeData }
      });
      errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        // Move to the next profile
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setIsSwiping(false);
    });
  };

  if (isLoadingProfiles) {
    return (
        <Card className="flex h-[500px] items-center justify-center">
            <CardContent className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Finding potential matches...</p>
            </CardContent>
        </Card>
    )
  }

  if (filteredProfiles.length === 0 || currentIndex >= filteredProfiles.length) {
    return (
      <Card className="flex h-[500px] items-center justify-center">
        <CardContent className="text-center">
          <p className="text-muted-foreground">No more profiles to show right now.</p>
          <p className="text-xs text-muted-foreground mt-2">Check back later!</p>
        </CardContent>
      </Card>
    );
  }

  const currentProfile = filteredProfiles[currentIndex];

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
