
// src/app/dashboard/page.tsx
'use client';
import {
  Activity,
  Calendar,
  Flame,
  TrendingUp,
  Dumbbell,
  BarChart,
  Target,
  Repeat,
  Trophy,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import WeeklyProgressChart from '@/components/weekly-progress-chart';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useWorkouts } from '@/context/WorkoutContext';
import { useEffect, useState, useMemo } from 'react';
import { doc } from 'firebase/firestore';

type ProgressData = {
  benchPR?: string;
  squatPR?: string;
  deadliftPR?: string;
  weeklyVolume?: string;
  weeklyChange?: string;
  consistencyWeek?: string;
  consistencyMonth?: string;
};


export default function DashboardPage() {
  const { user } = useUser();
  const { workouts } = useWorkouts();
  const firestore = useFirestore();

  const progressDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/progress/metrics`);
  }, [user, firestore]);

  const { data: progressData } = useDoc<ProgressData>(progressDocRef);

  const todaysWorkout = useMemo(() => {
    const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' });
    return workouts.find(w => w.day === dayOfWeek) || {
        day: 'Rest Day',
        workout: 'No workout scheduled',
        progress: 0,
        exercises: [],
    };
  }, [workouts]);

  const quickStats = [
    {
      value: progressData?.consistencyMonth || 'N/A',
      label: 'Workouts this month',
      icon: Activity,
    },
    {
      value: '8 days',
      label: 'Active streak',
      icon: Calendar,
    },
  ];

  const allStats = [
    {
      value: `${progressData?.benchPR || 'N/A'} kg`,
      label: 'Bench Press PR',
      icon: Trophy,
    },
     {
      value: `${progressData?.squatPR || 'N/A'} kg`,
      label: 'Squat PR',
      icon: Trophy,
    },
     {
      value: `${progressData?.deadliftPR || 'N/A'} kg`,
      label: 'Deadlift PR',
      icon: Trophy,
    },
    {
      value: `${parseInt(progressData?.weeklyVolume || '0').toLocaleString()} kg`,
      label: 'Weekly Volume',
      icon: BarChart,
    },
    {
      value: progressData?.consistencyWeek || 'N/A',
      label: 'Weekly Consistency',
      icon: Repeat
    }
  ];


  // We don't have a 'done' state in the schedule data, so we'll simulate it for now.
  // In a real app, this would come from user interaction.
  const simulatedExercises = todaysWorkout.exercises.map((ex, index) => ({
      ...ex,
      done: index < 2, // Assume first two are done
  }))


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.displayName || 'Alex'}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s a look at your progress and what&apos;s scheduled for today.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
         <Card className="col-span-1 sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progress Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
               <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
                >
                <CarouselContent>
                    {allStats.map((stat, index) => (
                    <CarouselItem key={index} className="md:basis-1/2">
                        <div className="p-1">
                            <div className="flex items-start gap-3 rounded-lg p-4">
                                <stat.icon className="h-6 w-6 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
                </Carousel>
            </CardContent>
          </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Total volume lifted over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <WeeklyProgressChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Workout</CardTitle>
            <CardDescription>{todaysWorkout.workout}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {simulatedExercises.map((ex) => (
                <li key={ex.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        ex.done
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-sm text-muted-foreground">{ex.sets}</p>
                    </div>
                  </div>
                  {ex.done && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  )}
                </li>
              ))}
            </ul>
             {todaysWorkout.exercises.length > 0 ? (
                <Button asChild className="w-full">
                  <Link href="/schedule">View Full Schedule</Link>
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground pt-4">Enjoy your rest day!</p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
