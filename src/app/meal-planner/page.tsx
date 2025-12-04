'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, RotateCcw, Maximize2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
                <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Utensils className="w-7 h-7" /> Meal Planner
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                    Plan your meals for the week. Use the AI chat for ideas!
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

            <AnimatePresence>
                <motion.div
                key={isExpanded ? 'expanded' : 'collapsed'}
                initial={{ width: '100%' }}
                animate={{ width: isExpanded ? '100%' : '100%' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
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
                </motion.div>
            </AnimatePresence>
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

        <div className="lg:col-span-1">
             <Card className="h-[75vh] flex flex-col">
                <CardContent className="p-0 flex-1">
                    <N8nChat />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
