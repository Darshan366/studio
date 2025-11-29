export type Meal = {
    name: string;
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    type: 'anything' | 'vegetarian' | 'vegan';
};

export const allMeals: Meal[] = [
    // Breakfast
    { name: 'High-Protein Oats', category: 'Breakfast', type: 'vegan' },
    { name: 'Boiled Eggs', category: 'Breakfast', type: 'vegetarian' },
    { name: 'Smoothie Bowl', category: 'Breakfast', type: 'vegan' },
    { name: 'Poha', category: 'Breakfast', type: 'vegan' },
    { name: 'Upma', category: 'Breakfast', type: 'vegan' },
    { name: 'Protein Pancakes', category: 'Breakfast', type: 'vegetarian' },
    { name: 'Scrambled Tofu', category: 'Breakfast', type: 'vegan' },
    { name: 'Greek Yogurt with Berries', category: 'Breakfast', type: 'vegetarian' },
    { name: 'Avocado Toast with Egg', category: 'Breakfast', type: 'vegetarian' },

    // Lunch
    { name: 'Chicken Rice Bowl', category: 'Lunch', type: 'anything' },
    { name: 'Paneer Rice Bowl', category: 'Lunch', type: 'vegetarian' },
    { name: 'Dal + Roti + Sabzi', category: 'Lunch', type: 'vegan' },
    { name: 'Quinoa Salad', category: 'Lunch', type: 'vegan' },
    { name: 'High-Protein Thali', category: 'Lunch', type: 'anything' },
    { name: 'Grilled Fish with Veggies', category: 'Lunch', type: 'anything' },
    { name: 'Chickpea Curry with Rice', category: 'Lunch', type: 'vegan' },
    { name: 'Lentil Soup and Salad', category: 'Lunch', type: 'vegan' },

    // Dinner
    { name: 'Grilled Chicken Breast', category: 'Dinner', type: 'anything' },
    { name: 'Paneer Tikka', category: 'Dinner', type: 'vegetarian' },
    { name: 'Stir Fry Veggies with Tofu', category: 'Dinner', type: 'vegan' },
    { name: 'Soup and Salad Combo', category: 'Dinner', type: 'vegan' },
    { name: 'Baked Salmon with Asparagus', category: 'Dinner', type: 'anything' },
    { name: 'Turkey Stuffed Peppers', category: 'Dinner', type: 'anything' },
    { name: 'Black Bean Burgers', category: 'Dinner', type: 'vegan' },
    
    // Snacks
    { name: 'Protein Bar', category: 'Snack', type: 'vegetarian' },
    { name: 'Roasted Chana', category: 'Snack', type: 'vegan' },
    { name: 'Fruit Bowl', category: 'Snack', type: 'vegan' },
    { name: 'Peanut Butter Toast', category: 'Snack', type: 'vegan' },
    { name: 'Greek Yogurt', category: 'Snack', type: 'vegetarian' },
    { name: 'Handful of Almonds', category: 'Snack', type: 'vegan' },
];

export function getMealsForDay(day: string, dietaryPreference: 'Anything' | 'Vegetarian' | 'Vegan' = 'Anything'): Meal[] {
    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
    
    const filtered = allMeals.filter(meal => {
        if (dietaryPreference === 'Vegetarian') {
            return meal.type === 'vegetarian' || meal.type === 'vegan';
        }
        if (dietaryPreference === 'Vegan') {
            return meal.type === 'vegan';
        }
        return true;
    });

    const breakfast = filtered.filter(m => m.category === 'Breakfast');
    const lunch = filtered.filter(m => m.category === 'Lunch');
    const dinner = filtered.filter(m => m.category === 'Dinner');

    // Simple deterministic selection based on day of the week
    return [
        breakfast[dayIndex % breakfast.length],
        lunch[dayIndex % lunch.length],
        dinner[dayIndex % dinner.length],
    ].filter(Boolean); // filter out undefined if arrays are empty
}
