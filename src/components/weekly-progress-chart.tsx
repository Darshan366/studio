'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { day: 'Mon', volume: 1860 },
  { day: 'Tue', volume: 3050 },
  { day: 'Wed', volume: 2370 },
  { day: 'Thu', volume: 730 },
  { day: 'Fri', volume: 2090 },
  { day: 'Sat', volume: 2140 },
  { day: 'Sun', volume: 1500 },
];

const chartConfig = {
  volume: {
    label: 'Volume',
    color: 'hsl(var(--primary))',
  },
};

export default function WeeklyProgressChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -20, right: 20 }}>
          <XAxis
            dataKey="day"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar
            dataKey="volume"
            fill="var(--color-volume)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
