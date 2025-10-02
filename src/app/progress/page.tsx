'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Award, Dumbbell, PlusCircle } from 'lucide-react';
import WeeklyProgressChart from '@/components/weekly-progress-chart';

const recentWorkouts = [
  {
    date: 'June 24, 2024',
    name: 'Full Body Strength',
    exercises: 5,
    volume: '5,400 kg',
  },
  {
    date: 'June 22, 2024',
    name: 'Cardio & Core',
    exercises: 3,
    volume: 'N/A',
  },
  {
    date: 'June 20, 2024',
    name: 'Upper Body Power',
    exercises: 6,
    volume: '6,200 kg',
  },
];

const personalRecords = [
  { exercise: 'Squat', weight: '140 kg' },
  { exercise: 'Bench Press', weight: '100 kg' },
  { exercise: 'Deadlift', weight: '180 kg' },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
        <p className="text-muted-foreground">
          Visualize your journey and review your workout history.
        </p>
      </div>

       <Card>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>
                  Review your completed workouts.
                </CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Log Workout
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Workout</TableHead>
                    <TableHead className="text-center">Exercises</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentWorkouts.map((workout) => (
                    <TableRow key={workout.date}>
                      <TableCell className="font-medium">{workout.date}</TableCell>
                      <TableCell>{workout.name}</TableCell>
                      <TableCell className="text-center">
                        {workout.exercises}
                      </TableCell>
                      <TableCell className="text-right">
                        {workout.volume}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Personal Records
              </CardTitle>
              <CardDescription>Your current best lifts (1RM).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalRecords.map((pr) => (
                <div
                  key={pr.exercise}
                  className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                >
                  <p className="font-semibold">{pr.exercise}</p>
                  <p className="font-mono text-sm text-foreground">
                    {pr.weight}
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Update PRs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
