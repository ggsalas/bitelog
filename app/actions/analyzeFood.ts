"use server";

export type AnalyzeFoodResult =
  | {
      success: true;
      data: string;
      parseError?: undefined;
    }
  | {
      success: true;
      data: null;
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

    // TODO: Analyze base64Data with MobileNetV3 and return the food name

    return {
      success: true,
      data: "food name",
    };
  } catch (error) {
    console.error("Error analyzing food image:", error);

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
