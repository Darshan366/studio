'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, Bot, RotateCcw, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MealPlan = {
  [key: string]: string[];
};

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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 flex items-center gap-1 text-xs"
                        onClick={() => {
                          const newMeal = prompt(
                            `Add a new meal for ${day}:`
                          );
                          if (newMeal) {
                            const updated = { ...mealPlan };
                            updated[day].push(newMeal);
                            setMealPlan(updated);
                          }
                        }}
                      >
                        <PlusCircle className="w-3 h-3" /> Add Meal
                      </Button>
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


      {/* Floating AI Button */}
      <button
        className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all hover:scale-105"
        onClick={() => alert('AI Assistant coming soon!')}
      >
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
}
