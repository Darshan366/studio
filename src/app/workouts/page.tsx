import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, PlusCircle } from "lucide-react"

const workouts = [
  {
    date: "June 24, 2024",
    name: "Full Body Strength",
    duration: "60 min",
    volume: "5,400 kg",
  },
  {
    date: "June 22, 2024",
    name: "Cardio & Core",
    duration: "45 min",
    volume: "N/A",
  },
  {
    date: "June 20, 2024",
    name: "Upper Body Power",
    duration: "75 min",
    volume: "6,200 kg",
  },
  {
    date: "June 19, 2024",
    name: "Lower Body Hypertrophy",
    duration: "65 min",
    volume: "7,100 kg",
  },
  {
    date: "June 17, 2024",
    name: "Full Body Strength",
    duration: "60 min",
    volume: "5,250 kg",
  },
]

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Workout Log</h1>
                <p className="text-muted-foreground">
                Review your past workouts and track your consistency.
                </p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Log New Workout
            </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>A list of your workouts from the past month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workout</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.date}>
                  <TableCell className="font-medium">{workout.name}</TableCell>
                  <TableCell className="text-muted-foreground">{workout.date}</TableCell>
                  <TableCell className="text-right">{workout.volume}</TableCell>
                  <TableCell className="text-right">{workout.duration}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
