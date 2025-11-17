export interface NutrientData {
  weight: number; // grams
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  fiber: number; // grams
}

export interface FoodAnalysis {
  [ingredientName: string]: NutrientData;
}

export interface NutritionTotals {
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}
