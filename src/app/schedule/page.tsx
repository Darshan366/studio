
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Bot, Dumbbell, Settings, RotateCcw, PlusCircle, Trash2, X, MapPin, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import { useAutoCheckin } from './use-auto-checkin';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { initialWorkouts } from '@/lib/workout-data';
import { useWorkouts } from '@/context/WorkoutContext';

const quotes = [
    "Strong today, unstoppable tomorrow 💪",
    "No excuses. Just progress.",
    "Legends train daily 🔥",
    "Sweat is just fat crying.",
    "The only bad workout is the one that didn't happen."
];

function GymDetailsDialog({ userProfile, userDocRef }: { userProfile: UserProfile | null, userDocRef: any }) {
    const [address, setAddress] = useState(userProfile?.gymAddress || '');
    const [startTime, setStartTime] = useState(userProfile?.usualGymTime?.start || '07:00');
    const [endTime, setEndTime] = useState(userProfile?.usualGymTime?.end || '09:00');
    const { toast } = useToast();

    const handleSave = async () => {
        if (!userDocRef) return;
        if (!address) {
            toast({ variant: 'destructive', title: 'Address is required.' });
            return;
        }

        // In a real app, you would use a Geocoding API here.
        // For this example, we'll use placeholder coordinates.
        // This is where you would call the Google Maps Geocoding API.
        const geocodeAddress = async (addr: string) => {
            // Placeholder: Replace with actual API call
            console.log(`Geocoding address (placeholder): ${addr}`);
            if (addr.toLowerCase().includes('fail')) {
                return null;
            }
            // Replace with real coordinates from API
            return { latitude: 34.0522, longitude: -118.2437 }; 
        };

        const coordinates = await geocodeAddress(address);

        if (!coordinates) {
            toast({ variant: 'destructive', title: '❌ Unable to find that address.' });
            return;
        }

        try {
            await updateDoc(userDocRef, {
                gymAddress: address,
                gymCoordinates: coordinates,
                usualGymTime: { start: startTime, end: endTime },
            });
            toast({ title: "✅ Gym location and schedule saved!" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to save details.' });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit Gym Details
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>🏋️ Gym Details</DialogTitle>
                    <DialogDescription>
                        Set your gym address and usual workout time for automatic streak tracking.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="address">Gym Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Fitness St, Los Angeles, CA" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>📍 Save Gym Details</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function SchedulePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { workouts, setWorkouts } = useWorkouts();
  
  const userDocRef = useMemoFirebase(() => {
      if (!user) return null;
      return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  useAutoCheckin(userProfile, userDocRef);

  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [detailedViewCard, setDetailedViewCard] = useState<number | null>(null);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  let clickTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const handleCardClick = (index: number) => {
     if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      handleCardDoubleClick(index);
    } else {
      clickTimeout = setTimeout(() => {
        if (isEditing === null && detailedViewCard === null) {
            setExpandedCard(expandedCard === index ? null : index);
        }
        clickTimeout = null;
      }, 250);
    }
  };

  const handleCardDoubleClick = (index: number) => {
    setExpandedCard(null);
    setDetailedViewCard(index);
  }
  
  const handleEditClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const workoutToEdit = workouts[index];
    setEditingData({ ...workoutToEdit, exercises: [...workoutToEdit.exercises.map(ex => ({...ex}))] });
    setIsEditing(index);
  }

  const handleSaveEdit = () => {
    if (isEditing === null) return;
    const updatedWorkouts = [...workouts];
    updatedWorkouts[isEditing] = editingData;
    setWorkouts(updatedWorkouts);
    setIsEditing(null);
    setEditingData(null);
    toast({
      title: "Workout Saved!",
      description: "Your changes have been successfully saved.",
    });
  };
  
  const handleResetSchedule = () => {
    setWorkouts(initialWorkouts);
    toast({
        title: "Schedule Reset",
        description: "Your workout schedule has been reset. ✅",
    });
  }

  const handleExerciseChange = (exIndex: number, field: 'name' | 'sets', value: string) => {
    const newExercises = [...editingData.exercises];
    newExercises[exIndex][field] = value;
    setEditingData({ ...editingData, exercises: newExercises });
  };

  const handleAddExercise = () => {
    const newExercises = [...editingData.exercises, { name: '', sets: '' }];
    setEditingData({ ...editingData, exercises: newExercises });
  };
  
  const handleRemoveExercise = (exIndex: number) => {
    const newExercises = editingData.exercises.filter((_: any, i: number) => i !== exIndex);
    setEditingData({ ...editingData, exercises: newExercises });
  };

  const streakCount = userProfile?.streakCount || 0;
  const progressValue = Math.min((streakCount / 7) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="w-full max-w-5xl mx-auto text-center space-y-4">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-xl font-semibold text-foreground"
        >
          <Flame className="text-orange-500" /> {streakCount}-Day Streak
        </motion.div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Progress value={progressValue} className="h-2" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Tracked using your gym schedule and location.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <p className="text-muted-foreground italic text-sm">
          "{motivationalQuote}"
        </p>
        <GymDetailsDialog userProfile={userProfile} userDocRef={userDocRef} />
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((item, index) => (
          <motion.div
            key={item.day}
            layoutId={`card-container-${item.day}`}
            className={cn(
              'relative group',
              index === 6 && 'lg:col-start-2'
            )}
            onClick={() => handleCardClick(index)}
          >
            <AnimatePresence>
            <Card className="h-48 w-full cursor-pointer flex flex-col justify-between p-4 bg-card/80 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
               {expandedCard !== index ? (
                 <>
                    <div>
                        <CardContent className="p-0 flex justify-between items-start">
                            <h3 className="text-lg font-bold">{item.day}</h3>
                            <p className="text-sm text-muted-foreground">{item.workout}</p>
                        </CardContent>
                    </div>
                    <div className="space-y-1">
                        <Progress value={item.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">{item.progress}% Complete</p>
                    </div>
                 </>
               ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-left"
                >
                    <h4 className="font-semibold text-foreground mb-2">{item.workout}</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {item.exercises.map((ex, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Dumbbell className="h-4 w-4 text-primary"/>
                                <span>{ex.name}: <span className="font-mono">{ex.sets}</span></span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
               )}
            </Card>
            </AnimatePresence>
             <button
                onClick={(e) => handleEditClick(e, index)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/30 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 hover:text-white"
             >
                <Settings className="h-4 w-4" />
             </button>
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {detailedViewCard !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setDetailedViewCard(null)}>
            <motion.div
              layoutId={`card-container-${workouts[detailedViewCard].day}`}
              className="w-[90%] max-w-2xl h-auto bg-card/90 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative h-full w-full flex flex-col justify-start p-8 bg-transparent border-0">
                  <button
                    onClick={() => setDetailedViewCard(null)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  <h2 className="text-5xl font-bold mb-2">{workouts[detailedViewCard].day}</h2>
                  <p className="text-7xl font-extrabold text-foreground/5 uppercase tracking-tighter -mt-2">Workout Plan</p>
                  
                  <div className="mt-8 text-lg text-muted-foreground">
                      <h4 className="text-2xl font-semibold text-foreground mb-4">{workouts[detailedViewCard].workout}</h4>
                      {workouts[detailedViewCard].exercises.length > 0 ? (
                          <ul className="space-y-3">
                              {workouts[detailedViewCard].exercises.map((ex, i) => (
                                  <li key={i} className="flex items-center gap-4">
                                    <Dumbbell className="h-5 w-5 text-primary"/>
                                    <span>{ex.name}: <span className="font-mono text-foreground/80">{ex.sets}</span></span>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <p>No exercises planned for today.</p>
                      )}
                  </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


       {/* Reset Button */}
      <div className="flex justify-center mt-4">
        <Button onClick={handleResetSchedule} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Schedule
        </Button>
      </div>


      {/* Floating AI Button */}
      <motion.div whileHover={{ scale: 1.1 }} className="fixed bottom-8 right-8 z-50">
         <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-primary-foreground hover:from-blue-600 hover:to-purple-700"
        >
          <Bot className="mr-2 h-5 w-5" />
          AI Suggest Workout
        </Button>
      </motion.div>
      
       {/* Edit Modal */}
       <Dialog open={isEditing !== null} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle>Edit {editingData?.day}'s Workout</DialogTitle>
          </DialogHeader>
          {editingData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workout-name" className="text-right">
                  Workout
                </Label>
                <Input
                  id="workout-name"
                  value={editingData.workout}
                  onChange={(e) => setEditingData({ ...editingData, workout: e.target.value })}
                  className="col-span-3"
                />
              </div>
               <div className="space-y-2">
                <Label>Exercises</Label>
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {editingData.exercises.map((ex: any, exIndex: number) => (
                        <div key={exIndex} className="flex items-center gap-2">
                            <Input 
                                placeholder="Exercise Name" 
                                value={ex.name} 
                                onChange={(e) => handleExerciseChange(exIndex, 'name', e.target.value)}
                            />
                            <Input 
                                placeholder="Sets/Reps" 
                                value={ex.sets}
                                onChange={(e) => handleExerciseChange(exIndex, 'sets', e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(exIndex)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                 </div>
                <Button variant="outline" size="sm" onClick={handleAddExercise} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
               </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditing(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
