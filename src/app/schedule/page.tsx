'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Bot, Dumbbell } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const weeklyWorkouts = [
  { day: 'Monday', workout: 'Push Day', progress: 80, details: { sets: '4', duration: '60 mins', focus: 'Strength'} },
  { day: 'Tuesday', workout: 'Pull Day', progress: 60, details: { sets: '5', duration: '55 mins', focus: 'Hypertrophy'} },
  { day: 'Wednesday', workout: 'Legs & Core', progress: 40, details: { sets: '5', duration: '70 mins', focus: 'Strength'} },
  { day: 'Thursday', workout: 'Active Recovery', progress: 100, details: { sets: 'N/A', duration: '30 mins', focus: 'Flexibility'} },
  { day: 'Friday', workout: 'Full Body HIIT', progress: 30, details: { sets: '3 Rounds', duration: '25 mins', focus: 'Cardio'} },
  { day: 'Saturday', workout: 'Stretch & Mobility', progress: 50, details: { sets: 'N/A', duration: '20 mins', focus: 'Flexibility'} },
  { day: 'Sunday', workout: 'Rest Day', progress: 0, details: { sets: 'N/A', duration: 'N/A', focus: 'Recovery'} },
];

const cardVariants = {
  hidden: { rotateY: 180, opacity: 0 },
  visible: { rotateY: 0, opacity: 1 },
};

export default function SchedulePage() {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="w-full max-w-5xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-xl font-semibold text-foreground">
          <Flame className="text-orange-500" /> 5-Day Streak
        </div>
        <Progress value={70} className="h-2" />
        <p className="text-muted-foreground italic text-sm">
          “Strong today, unstoppable tomorrow 💥”
        </p>
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeklyWorkouts.map((item, index) => (
          <motion.div
            key={item.day}
            className={cn(
              'relative',
              index === 6 && 'lg:col-start-2' // Center the last card on large screens
            )}
            style={{ perspective: 1000 }}
          >
            <motion.div
              className="relative w-full h-48 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleCardClick(index)}
            >
              <AnimatePresence initial={false}>
                {flippedIndex !== index && (
                  <motion.div
                    key="front"
                    className="absolute w-full h-full"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full w-full flex flex-col justify-between p-4 bg-card/80 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
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
                  </motion.div>
                )}
                {flippedIndex === index && (
                   <motion.div
                    key="back"
                    className="absolute w-full h-full"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full w-full flex flex-col justify-center items-center p-4 bg-card/80">
                        <Dumbbell className="h-6 w-6 mb-2 text-primary" />
                        <h4 className="text-lg font-bold mb-2">{item.workout}</h4>
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Sets: {item.details.sets}</p>
                            <p>Duration: {item.details.duration}</p>
                            <p>Focus: {item.details.focus}</p>
                        </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
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
    </div>
  );
}
