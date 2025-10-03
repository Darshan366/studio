// src/app/page.tsx
'use client';
import {
  Activity,
  Calendar,
  Flame,
  TrendingUp,
  Dumbbell,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import WeeklyProgressChart from '@/components/weekly-progress-chart';
import { useUser } from '@/firebase';

const quickStats = [
  {
    value: '12',
    label: 'Workouts this month',
    icon: Activity,
  },
  {
    value: '2,450',
    label: 'Calories burned',
    icon: Flame,
  },
  {
    value: '8 days',
    label: 'Active streak',
    icon: Calendar,
  },
  {
    value: '+5kg',
    label: 'Bench Press PR',
    icon: TrendingUp,
  },
];

const todaysWorkout = {
  name: 'Full Body Strength',
  exercises: [
    { name: 'Barbell Squats', sets: '3x5', done: true },
    { name: 'Bench Press', sets: '3x5', done: true },
    { name: 'Deadlifts', sets: '1x5', done: false },
    { name: 'Overhead Press', sets: '3x8', done: false },
  ],
};

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.displayName || 'Alex'}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s a look at your progress and what&apos;s scheduled for today.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <CardDescription>{todaysWorkout.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {todaysWorkout.exercises.map((ex) => (
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
            <Button asChild className="w-full">
              <Link href="/workouts">Start Workout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
