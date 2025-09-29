'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  suggestExerciseAlternatives,
  type SuggestExerciseAlternativesOutput,
} from '@/ai/flows/suggest-exercise-alternatives';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  exercise: z.string().min(2, 'Please enter an exercise.'),
  availableEquipment: z.string().min(2, 'Please list your equipment.'),
  workoutHistory: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiSuggestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestExerciseAlternativesOutput | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exercise: 'Bench Press',
      availableEquipment: 'Dumbbells, Resistance Bands',
      workoutHistory: '3 workouts this week focusing on chest and back.',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await suggestExerciseAlternatives({
        ...values,
        workoutHistory: values.workoutHistory || 'No history provided.',
      });
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description:
          'Failed to get suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="exercise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise to Replace</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Barbell Bench Press" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableEquipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Equipment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dumbbells, Kettlebell" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workoutHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recent Workout Focus (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Worked on legs yesterday, focusing on chest today."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Generating suggestions...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
            </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Alternatives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Exercises:</h3>
              <p className="text-muted-foreground">{result.alternativeExercises}</p>
            </div>
            <div>
              <h3 className="font-semibold">Reasoning:</h3>
              <p className="text-muted-foreground">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
