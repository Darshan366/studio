"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Utensils, Sparkles } from "lucide-react";

type MealPlan = {
  [key: string]: string[];
};

export default function MealPlanner() {
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    Monday: ["Overnight Oats", "Chicken Salad", "Turkey Stuffed Peppers"],
    Tuesday: ["Egg Muffins", "Chicken Salad", "Lentil Soup"],
    Wednesday: ["Egg Muffins", "Chicken Salad", "Lentil Soup"],
    Thursday: ["Overnight Oats", "Smoothie", "Salmon and Asparagus"],
    Friday: ["Overnight Oats", "Quinoa and Black Bean Bowl", "Lentil Soup"],
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="w-7 h-7" /> Meal Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your meals according to your fitness goals and body type.
          </p>
        </div>
        <Button variant="outline" onClick={resetMealPlan}>
          Reset Meal Plan
        </Button>
      </div>

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Plan</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-sm font-semibold">Day of the Week</th>
                <th className="p-3 text-sm font-semibold">Meals</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mealPlan).map((day) => (
                <tr key={day} className="border-b border-border">
                  <td className="p-3 font-medium">{day}</td>
                  <td className="p-3 space-y-1">
                    {mealPlan[day].length ? (
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
                              updated[day] = updated[day].filter((_, i) => i !== idx);
                              setMealPlan(updated);
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No meals added yet</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 flex items-center gap-1 text-xs"
                      onClick={() => {
                        const newMeal = prompt(`Add a new meal for ${day}:`);
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
        </CardContent>
      </Card>

      {/* Floating AI Button */}
      <button
        className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all"
        onClick={() => alert('AI Assistant coming soon!')}
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  );
}
