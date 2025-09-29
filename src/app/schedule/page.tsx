import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

const upcomingWorkouts = [
    { date: 'Tomorrow', name: 'Upper Body Power', type: 'Strength' },
    { date: 'June 28, 2024', name: 'Long Run', type: 'Cardio' },
    { date: 'June 30, 2024', name: 'Active Recovery', type: 'Flexibility' },
]

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Workout Schedule</h1>
        <p className="text-muted-foreground">
          Plan your week and stay on track with your fitness goals.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={new Date()}
              className="w-full"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Workouts</CardTitle>
            <CardDescription>Your next scheduled sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingWorkouts.map(workout => (
                <div key={workout.name} className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">{workout.date}</p>
                    </div>
                    <Badge variant={workout.type === 'Strength' ? 'default' : 'secondary'}>{workout.type}</Badge>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
