"use server";

export async function analyzeFood(imageBase64: string) {
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
- Calculate calories based on standard nutritional values
- Consider the cooking method if visible (fried, baked, boiled)
- If there are sauces or dressings, include them separately

MANDATORY FORMAT:
ingredient: weight_in_gr, total_calories; ingredient: weight_in_gr, total_calories

CORRECT EXAMPLE:
grilled chicken breast: 200gr, 330cal; cooked white rice: 150gr, 195cal; mixed salad: 80gr, 20cal; ranch dressing: 30gr, 145cal

Now analyze this image:`;

    // Send request to Ollama
    const response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llava:7b-v1.6",
        prompt: prompt,
        images: [base64Data],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Ollama returns the response in the "response" field
    if (data.response) {
      return {
        success: true,
        data: data.response,
      };
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
