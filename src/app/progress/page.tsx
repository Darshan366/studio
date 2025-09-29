import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const volumeData = [
  { month: 'Jan', volume: 18600 },
  { month: 'Feb', volume: 30500 },
  { month: 'Mar', volume: 23700 },
  { month: 'Apr', volume: 27300 },
  { month: 'May', volume: 20900 },
  { month: 'Jun', volume: 21400 },
];

const prData = [
  { exercise: 'Squat', value: 140 },
  { exercise: 'Bench', value: 100 },
  { exercise: 'Deadlift', value: 180 },
  { exercise: 'OHP', value: 60 },
  { exercise: 'Row', value: 90 },
];

const weightData = [
  { date: '2024-01-01', weight: 80 },
  { date: '2024-02-01', weight: 81 },
  { date: '2024-03-01', weight: 80.5 },
  { date: '2024-04-01', weight: 82 },
  { date: '2024-05-01', weight: 82.5 },
  { date: '2024-06-01', weight: 83 },
]

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground">
          Visualize your hard work and achievements over time.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Workout Volume</CardTitle>
            <CardDescription>Monthly volume (in kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={volumeData} margin={{ left: -20, right: 20 }}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  dataKey="volume"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Personal Records (1RM)</CardTitle>
            <CardDescription>Your best lifts (in kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={prData} layout="vertical" margin={{ left: -10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="exercise" type="category" tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Body Weight</CardTitle>
            <CardDescription>Track your body weight changes (in kg)</CardDescription>
          </CardHeader>
          <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={weightData} margin={{ left: -20, right: 20 }}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short' })}/>
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  dataKey="weight"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
