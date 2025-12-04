
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, RotateCcw, Trash2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import N8nChat from '@/components/n8n-chat';

type MealPlan = {
  [key: string]: string[];
};

function AddMealDialog({ day, onAddMeal }: { day: string; onAddMeal: (meal: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [meal, setMeal] = useState('');
  
  const handleAdd = () => {
    if (meal.trim()) {
      onAddMeal(meal);
      setMeal('');
      setIsOpen(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setMeal('');
    }
    setIsOpen(open);
  };

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
    <div className="w-full">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <Utensils className="w-6 h-6" /> Meal Planner
                    </CardTitle>
                     <p className="text-sm text-muted-foreground mt-1">
                        Plan your meals for the week. Use the AI chat for ideas!
                    </p>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-primary/10 border-primary/20 text-primary shadow-gym-glow shadow-primary/20 hover:bg-primary/20 hover:scale-105 transition-all">
                            <Bot className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl h-3/4 flex flex-col">
                        <DialogHeader>
                            <DialogTitle>AI Meal Assistant</DialogTitle>
                            <DialogDescription>
                            Ask me anything about nutrition or get meal ideas!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden rounded-lg">
                            <N8nChat />
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
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
                            <td className="p-3 font-medium align-top">{day}</td>
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
                                    size="icon"
                                    className="text-muted-foreground h-6 w-6"
                                    onClick={() => {
                                        const updated = { ...mealPlan };
                                        updated[day] = updated[day].filter(
                                        (_, i) => i !== idx
                                        );
                                        setMealPlan(updated);
                                    }}
                                    >
                                    <Trash2 className="h-4 w-4"/>
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
            </CardContent>
        </Card>
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
