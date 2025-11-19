"use server";

import type { FoodAnalysis } from "@/app/types/nutrition";

const MODEL = "llava:7b-v1.6"; // ok
// const MODEL = "gemma3:latest"; // maso y lehnto
// const MODEL = "benzie/llava-phi-3:latest"; // bastante mall
// const MODEL = "moondream"; // bad
// const MODEL = "aiden_lu/minicpm-v2.6:Q4_K_M";
// const MODEL = "llama3.2-vision:latest"; // ok, pareciera peor que llava

export type AnalyzeFoodResult =
  | {
      success: true;
      data: FoodAnalysis;
      rawResponse: string;
      parseError?: undefined;
    }
  | {
      success: true;
      data: null;
      rawResponse: string;
      parseError: string;
    }
  | {
      success: false;
      error: string;
    };

export async function analyzeFood(
  imageBase64: string,
): Promise<AnalyzeFoodResult> {
  try {
    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Ollama API endpoint
    const ollamaUrl = "http://localhost:11434/api/generate";

    // Nutrition analysis prompt
    const prompt = `Act as a certified nutritionist specialized in visual food analysis.

CONTEXT: You are going to analyze a food photograph to extract nutritional information.

SPECIFIC INSTRUCTIONS:
- Identify each individual visible ingredient
- Estimate the weight in grams (use visual references like plate size, cutlery, etc.)
- Calculate detailed nutritional values: calories, protein, carbs, fats, and fiber
- Consider the cooking method if visible (fried, baked, boiled)
- If there are sauces or dressings, include them separately

MANDATORY FORMAT - Return ONLY valid JSON, nothing else:
{
  "ingredient_name": {
    "weight": number_in_grams,
    "calories": number_in_kcal,
    "protein": number_in_grams,
    "carbs": number_in_grams,
    "fats": number_in_grams,
    "fiber": number_in_grams
  }
}

CORRECT EXAMPLE:
{
  "grilled chicken breast": {
    "weight": 200,
    "calories": 330,
    "protein": 62,
    "carbs": 0,
    "fats": 7,
    "fiber": 0
  },
  "cooked white rice": {
    "weight": 150,
    "calories": 195,
    "protein": 4,
    "carbs": 43,
    "fats": 0,
    "fiber": 1
  },
  "mixed salad": {
    "weight": 80,
    "calories": 20,
    "protein": 1,
    "carbs": 4,
    "fats": 0,
    "fiber": 2
  },
  "ranch dressing": {
    "weight": 30,
    "calories": 145,
    "protein": 0,
    "carbs": 2,
    "fats": 15,
    "fiber": 0
  }
}

IMPORTANT: Return ONLY the JSON object, with no additional text before or after.`;

    // Send request to Ollama
    const response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        images: [base64Data],
        format: "json",
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.response) {
      try {
        const parsedData = JSON.parse(data.response) as FoodAnalysis;
        return {
          success: true,
          data: parsedData,
          rawResponse: data.response, // Keep raw response for debugging
        };
      } catch (parseError) {
        // If JSON parsing fails, return raw text for fallback display
        console.error("JSON parsing failed:", parseError);
        return {
          success: true,
          data: null,
          rawResponse: data.response,
          parseError:
            parseError instanceof Error
              ? parseError.message
              : "Failed to parse JSON",
        };
      }
    } else {
      throw new Error("No response from Ollama");
    }
  } catch (error) {
    console.error("Error analyzing food:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}
