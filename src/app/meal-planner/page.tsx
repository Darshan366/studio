'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, RotateCcw, Maximize2, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import { allMeals, Meal, getMealsForDay } from '@/lib/meal-data';

type MealPlan = {
  [key: string]: string[];
};

type MealSuggestionsResponse = {
  suggestions?: string[];
  error?: string;
}

function AddMealDialog({ day, onAddMeal }: { day: string; onAddMeal: (meal: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [meal, setMeal] = useState('');
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
      if (!user) return null;
      return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const quickSuggestions = useMemo(() => {
    if (!userProfile) return [];
    return getMealsForDay(day, userProfile.dietaryPreference).slice(0, 4);
  }, [day, userProfile]);
  

  const getAiSuggestions = () => {
    if (!user) return;
    setIsAILoading(true);
    setAISuggestions([]);

    fetch('/api/meal-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Suggest some meals for ${day}.`,
        userId: user.uid,
      }),
    })
    .then(res => res.json())
    .then((data: MealSuggestionsResponse) => {
      if (data.suggestions) {
        setAISuggestions(data.suggestions);
      } else if (data.error) {
        throw new Error(data.error);
      }
    })
    .catch(err => {
      toast({
        variant: 'destructive',
        title: 'Failed to get AI suggestions',
        description: err.message
      });
    })
    .finally(() => setIsAILoading(false));
  };

  const handleAdd = () => {
    if (meal.trim()) {
      onAddMeal(meal);
      setMeal('');
      setAISuggestions([]);
      setIsOpen(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      onAddMeal(suggestion);
      setMeal('');
      setAISuggestions([]);
      setIsOpen(false);
  }
  
  // Reset state when dialog is closed
  const onOpenChange = (open: boolean) => {
      if (!open) {
          setMeal('');
          setAISuggestions([]);
      }
      setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="mt-1 flex items-center gap-1 text-xs">
          <PlusCircle className="w-3 h-3" /> Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new meal for {day}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label htmlFor="meal-name" className="sr-only">Meal Name</Label>
            <Input id="meal-name" value={meal} onChange={(e) => setMeal(e.target.value)} placeholder="e.g., Grilled Chicken Salad" />
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Quick Suggestions</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((s, i) => (
                <Button key={i} variant="outline" className="h-auto justify-start text-left" onClick={() => handleSuggestionClick(s.name)}>
                  {s.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
              <Button onClick={getAiSuggestions} disabled={isAILoading} variant="secondary" className="w-full">
                  {isAILoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                  Get AI Suggestions
              </Button>
              {aiSuggestions.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {aiSuggestions.map((s, i) => (
                    <Button key={i} variant="outline" className="h-auto justify-start text-left" onClick={() => handleSuggestionClick(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={!meal.trim()}>Add Meal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function MealPlanner() {
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    Monday: ['Overnight Oats', 'Chicken Salad', 'Turkey Stuffed Peppers'],
    Tuesday: ['Egg Muffins', 'Chicken Salad', 'Lentil Soup'],
    Wednesday: ['Egg Muffins', 'Chicken Salad', 'Lentil Soup'],
    Thursday: ['Overnight Oats', 'Smoothie', 'Salmon and Asparagus'],
    Friday: ['Overnight Oats', 'Quinoa and Black Bean Bowl', 'Lentil Soup'],
    Saturday: [],
    Sunday: [],
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const resetMealPlan = () => {
     setMealPlan({
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    });
  }

  const addMeal = (day: string, meal: string) => {
    const updated = { ...mealPlan };
    updated[day].push(meal);
    setMealPlan(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="w-7 h-7" /> Meal Planner
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              Plan your meals according to your fitness goals and body type.
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition-colors ml-6"
              aria-label="Toggle Table Size"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <AnimatePresence>
        <motion.div
          key={isExpanded ? 'expanded' : 'collapsed'}
          initial={{ width: '80%' }}
          animate={{ width: isExpanded ? '100%' : '80%' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="mx-auto"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-sm font-semibold text-muted-foreground">
                    Day of the Week
                  </th>
                  <th className="p-3 text-sm font-semibold text-muted-foreground">Meals</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(mealPlan).map((day) => (
                  <tr
                    key={day}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/50"
                  >
                    <td className="p-3 font-medium">{day}</td>
                    <td className="p-3 space-y-1">
                      {mealPlan[day].length > 0 ? (
                        mealPlan[day].map((meal, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 bg-muted rounded-lg text-sm flex justify-between items-center"
                          >
                            <span>{meal}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                const updated = { ...mealPlan };
                                updated[day] = updated[day].filter(
                                  (_, i) => i !== idx
                                );
                                setMealPlan(updated);
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No meals added yet
                        </p>
                      )}
                      <AddMealDialog day={day} onAddMeal={(meal) => addMeal(day, meal)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>

       {/* Reset Button */}
       <div className="flex justify-center">
            <Button
                onClick={resetMealPlan}
                variant="outline"
                className="mt-6 flex items-center gap-2 rounded-full border-border text-muted-foreground hover:bg-muted/50"
            >
                <RotateCcw size={16} />
                Reset Meal Plan
            </Button>
        </div>
    </div>
  );
}
