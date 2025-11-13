
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { initialWorkouts } from '@/lib/workout-data';

interface Exercise {
  name: string;
  sets: string;
}

interface Workout {
  day: string;
  workout: string;
  progress: number;
  exercises: Exercise[];
}

interface WorkoutContextType {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);

  return (
    <WorkoutContext.Provider value={{ workouts, setWorkouts }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};
