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
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Dumbbell, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// We now have a single prompt field. The AI will parse the details.
const formSchema = z.object({
  prompt: z.string().min(10, 'Please enter a more detailed request.'),
});

type FormValues = z.infer<typeof formSchema>;

const suggestionPrompts = [
    {
        icon: Dumbbell,
        text: "Alternatives for Squats with only resistance bands",
    },
    {
        icon: Zap,
        text: "Create a chest workout using just dumbbells",
    },
    {
        icon: Sparkles,
        text: "Suggest a 15-minute core routine for a beginner",
    },
]

export default function AiSuggestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestExerciseAlternativesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    try {
      const output = await suggestExerciseAlternatives({
        prompt: values.prompt,
      });
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    form.setValue('prompt', prompt);
    // Optionally, you could also submit the form directly
    // onSubmit({ prompt });
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Enter the exercise to replace (e.g., Bench Press), the equipment you have (e.g., Dumbbells), and your recent workout focus..."
                    className="min-h-[150px] rounded-xl border-border/80 bg-background/80 p-4 text-base transition-all duration-300 ease-in-out focus:border-blue-500 focus:bg-background focus:ring-2 focus:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
            <div className="space-y-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground">Or, try one of these...</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {suggestionPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(prompt.text)}
                            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/30 p-4 text-center transition-colors hover:bg-muted/80"
                        >
                            <prompt.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                            <p className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">{prompt.text}</p>
                        </button>
                    ))}
                </div>
            </div>

          <div className="flex justify-center pt-4">
             <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get Suggestions
            </Button>
          </div>
        </form>
      </Form>

      {isLoading && (
         <Card className="animate-pulse">
            <CardHeader>
                <CardTitle className="h-6 w-3/4 rounded bg-muted"></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                 <div className="h-4 bg-muted rounded w-1/4 pt-4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-xl">Suggested Alternatives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base">
            <div>
              <h3 className="font-semibold text-muted-foreground">Exercises</h3>
              <p className="text-foreground">{result.alternativeExercises}</p>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-muted-foreground">Reasoning</h3>
              <p className="text-foreground">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add this to your globals.css or a relevant stylesheet if it doesn't exist
// @keyframes fade-in-up {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in-up {
//   animation: fade-in-up 0.5s ease-out forwards;
// }
