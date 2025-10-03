'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Heart, X, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';


// Mock profiles for now. In a real app, this would come from Firestore.
const profiles = [
  {
    id: 'user_jessica',
    name: 'Jessica, 28',
    level: 'Intermediate',
    location: '2 miles away',
    bio: 'Love lifting heavy and looking for a consistent morning workout partner. Let\'s crush some goals!',
    imageUrl: 'https://picsum.photos/seed/jessica/600/800',
    imageHint: 'woman fitness',
  },
  {
    id: 'user_mike',
    name: 'Mike, 32',
    level: 'Beginner',
    location: '5 miles away',
    bio: 'New to the gym, trying to figure things out. Looking for someone to show me the ropes or learn with.',
    imageUrl: 'https://picsum.photos/seed/mike/600/800',
    imageHint: 'man gym',
  },
  {
    id: 'user_sarah',
    name: 'Sarah, 25',
    level: 'Advanced',
    location: '1 mile away',
    bio: 'Competitive powerlifter. Need a spotter who can handle heavy weight and push me to my limits.',
    imageUrl: 'https://picsum.photos/seed/sarah/600/800',
    imageHint: 'woman powerlifter',
  },
];

export default function MatchCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const swipesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'swipes');
  }, [firestore]);


  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !swipesCollection) return;

    const targetUser = profiles[currentIndex];
    setIsLoading(true);

    try {
        if (direction === 'right') {
            await addDoc(swipesCollection, {
                swiperId: user.uid,
                targetId: targetUser.id,
                direction: 'right',
                timestamp: serverTimestamp(),
            });
        }
        // Move to the next profile regardless of swipe direction
        setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);

    } catch (error) {
        console.error("Error swiping:", error);
        toast({
            variant: "destructive",
            title: "Swipe Failed",
            description: "Could not record your swipe. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
      return (
        <Card className="flex h-[500px] items-center justify-center">
            <CardContent className="text-center">
                <p className="text-muted-foreground">No more profiles to show.</p>
            </CardContent>
        </Card>
      )
  }


  return (
    <div className="relative">
        <Card className="overflow-hidden">
            <div className="relative h-[400px] w-full">
            <Image
                src={currentProfile.imageUrl}
                alt={currentProfile.name}
                fill
                className="object-cover"
                data-ai-hint={currentProfile.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 w-full p-4 text-white">
                <h2 className="text-2xl font-bold">{currentProfile.name}</h2>
                <p className="text-sm">{currentProfile.location}</p>
            </div>
            </div>
            <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
                <Badge>{currentProfile.level}</Badge>
            </div>
            <p className="text-muted-foreground">{currentProfile.bio}</p>
            </CardContent>
        </Card>
        <div className="mt-4 flex justify-center space-x-4">
            <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
            onClick={() => handleSwipe('left')}
            disabled={isLoading}
            >
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <X className="h-8 w-8" />}
            </Button>
            <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500/10 disabled:opacity-50"
            onClick={() => handleSwipe('right')}
            disabled={isLoading}
            >
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Heart className="h-8 w-8" />}
            </Button>
        </div>
    </div>
  );
}
