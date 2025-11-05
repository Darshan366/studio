
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Bot, Dumbbell, Settings, RotateCcw, PlusCircle, Trash2, X, Maximize2, MapPin } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import { useAutoCheckin } from './use-auto-checkin';

const initialWorkouts = [
  { day: 'Monday', workout: 'Push Day', progress: 80, exercises: [{ name: 'Bench Press', sets: '4x5' }, { name: 'Overhead Press', sets: '3x8' }] },
  { day: 'Tuesday', workout: 'Pull Day', progress: 60, exercises: [{ name: 'Pull Ups', sets: '4xMax' }, { name: 'Barbell Rows', sets: '3x8' }] },
  { day: 'Wednesday', workout: 'Legs & Core', progress: 40, exercises: [{ name: 'Squats', sets: '4x5' }, { name: 'Leg Press', sets: '3x10' }] },
  { day: 'Thursday', workout: 'Active Recovery', progress: 100, exercises: [{ name: 'Light Cardio', sets: '30min' }] },
  { day: 'Friday', workout: 'Full Body HIIT', progress: 30, exercises: [{ name: 'Burpees', sets: '3x15' }, { name: 'Kettlebell Swings', sets: '3x20' }] },
  { day: 'Saturday', workout: 'Stretch & Mobility', progress: 50, exercises: [{ name: 'Full Body Stretch', sets: '20min' }] },
  { day: 'Sunday', workout: 'Rest Day', progress: 0, exercises: [] },
];

const quotes = [
    "Strong today, unstoppable tomorrow 💪",
    "No excuses. Just progress.",
    "Legends train daily 🔥",
    "Sweat is just fat crying.",
    "The only bad workout is the one that didn't happen."
];

const cardVariants = {
  hidden: { rotateY: 180, opacity: 0 },
  visible: { rotateY: 0, opacity: 1 },
};

export default function SchedulePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(() => {
      if (!user) return null;
      return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  useAutoCheckin(userProfile, userDocRef);

  const [weeklyWorkouts, setWeeklyWorkouts] = useState(initialWorkouts);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  useEffect(() => {
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const handleCardClick = (index: number) => {
    if (isEditing !== null) return;
    setExpandedCard(expandedCard === index ? null : index);
  };
  
  const handleEditClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const workoutToEdit = weeklyWorkouts[index];
    setEditingData({ ...workoutToEdit, exercises: [...workoutToEdit.exercises.map(ex => ({...ex}))] });
    setIsEditing(index);
  }

  const handleSaveEdit = () => {
    if (isEditing === null) return;
    const updatedWorkouts = [...weeklyWorkouts];
    updatedWorkouts[isEditing] = editingData;
    setWeeklyWorkouts(updatedWorkouts);
    setIsEditing(null);
    setEditingData(null);
    toast({
      title: "Workout Saved!",
      description: "Your changes have been successfully saved.",
    });
  };
  
  const handleResetSchedule = () => {
    setWeeklyWorkouts(initialWorkouts);
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

  const handleUpdateGymLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        if(userDocRef) {
            await updateDoc(userDocRef, { gymLocation: { latitude, longitude } });
            toast({ title: "✅ Gym location updated successfully." });
        }
      }, () => {
        toast({ variant: 'destructive', title: "⚠️ Location permission denied." });
      });
    } else {
        toast({ variant: 'destructive', title: "Geolocation is not supported by this browser." });
    }
  }


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
                    <p>Tracked using your gym location.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <p className="text-muted-foreground italic text-sm">
          "{motivationalQuote}"
        </p>
        <Button variant="outline" size="sm" onClick={handleUpdateGymLocation}>
            <MapPin className="mr-2 h-4 w-4" /> Update Gym Location
        </Button>
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeklyWorkouts.map((item, index) => (
          <motion.div
            key={item.day}
            layoutId={`card-container-${index}`}
            className={cn(
              'relative group',
              index === 6 && 'lg:col-start-2'
            )}
            onClick={() => handleCardClick(index)}
          >
            <Card className="h-48 w-full cursor-pointer flex flex-col justify-between p-4 bg-card/80 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
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
            </Card>
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
        {expandedCard !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setExpandedCard(null)}>
            <motion.div
              layoutId={`card-container-${expandedCard}`}
              className="w-[90%] max-w-2xl h-auto bg-card/90 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative h-full w-full flex flex-col justify-start p-8 bg-transparent border-0">
                  <button
                    onClick={() => setExpandedCard(null)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  <h2 className="text-5xl font-bold mb-2">{weeklyWorkouts[expandedCard].day}</h2>
                  <p className="text-7xl font-extrabold text-foreground/5 uppercase tracking-tighter -mt-2">Workout Plan</p>
                  
                  <div className="mt-8 text-lg text-muted-foreground">
                      <h4 className="text-2xl font-semibold text-foreground mb-4">{weeklyWorkouts[expandedCard].workout}</h4>
                      {weeklyWorkouts[expandedCard].exercises.length > 0 ? (
                          <ul className="space-y-3">
                              {weeklyWorkouts[expandedCard].exercises.map((ex, i) => (
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
