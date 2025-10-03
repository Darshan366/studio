'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Loader2, Wand2, ThumbsUp, ThumbsDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  prompt: z.string().min(1, 'Please enter a prompt.'),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
    type: 'user' | 'ai';
    text: string;
}

export default function AiSuggestionForm() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (user && messages.length === 0) {
        setMessages([
            {
                type: 'ai',
                text: `Hi ${user.displayName}! How can I help you today? Feel free to ask for workout ideas, exercise alternatives, or any fitness advice.`,
            }
        ]);
    }
  }, [user, messages.length])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    const userMessage: Message = { type: 'user', text: values.prompt };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const output = await suggestExerciseAlternatives({
        prompt: values.prompt,
        userName: user?.displayName || 'user'
      });
      const aiMessage: Message = { type: 'ai', text: output.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get suggestions. Please try again.',
      });
       const aiErrorMessage: Message = { type: 'ai', text: 'Sorry, I had trouble with that request. Please try again.' };
       setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col" >
        <div className="flex-1 space-y-6 overflow-y-auto p-4" ref={containerRef}>
            {messages.map((message, index) => (
                <div key={index} className={cn("flex", message.type === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.type === 'user' ? (
                        <div className="max-w-md rounded-lg bg-muted px-4 py-2 text-muted-foreground">
                            {message.text}
                        </div>
                    ) : (
                       <div className="max-w-md space-y-4">
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Wand2 className="h-4 w-4" />
                                <span>AI Response</span>
                           </div>
                           <p className="text-foreground">{message.text}</p>
                       </div>
                    )}
                </div>
            ))}
             {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-md space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wand2 className="h-4 w-4" />
                            <span>Thinking...</span>
                        </div>
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
        </div>

        <div className="sticky bottom-0 bg-background/80 p-4 backdrop-blur-sm">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Textarea
                            placeholder="Ask for exercise alternatives, workout plans..."
                            className="min-h-12 resize-none rounded-xl border-border/80 bg-muted/50 p-3 pr-12 text-base transition-all duration-300 ease-in-out focus:border-blue-500 focus:bg-background focus:ring-2 focus:ring-blue-500/20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)();
                                }
                            }}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button 
                    type="submit" 
                    disabled={isLoading} 
                    size="icon" 
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary"
                >
                    <ArrowUp className="h-4 w-4" />
                </Button>
                </form>
            </Form>
        </div>
    </div>
  );
}
