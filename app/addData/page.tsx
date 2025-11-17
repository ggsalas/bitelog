"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { FoodAnalysis, NutritionTotals } from "@/app/types/nutrition";
import styles from "./page.module.css";

function calculateTotals(data: FoodAnalysis): NutritionTotals {
  const totals: NutritionTotals = {
    weight: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  };

  Object.values(data).forEach((nutrient) => {
    totals.weight += nutrient.weight;
    totals.calories += nutrient.calories;
    totals.protein += nutrient.protein;
    totals.carbs += nutrient.carbs;
    totals.fats += nutrient.fats;
    totals.fiber += nutrient.fiber;
  });

  return totals;
}

function AddDataContent() {
  const searchParams = useSearchParams();
  const resultParam = searchParams.get("result");

  if (!resultParam) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>No Data</h1>
          <p>No analysis result found.</p>
          <Link href="/scan" className={styles.backButton}>
            Back to Scan
          </Link>
        </main>
      </div>
    );
  }

  // Parse the result
  let parsedResult: { data: FoodAnalysis | null; rawResponse: string; parseError?: string };
  try {
    parsedResult = JSON.parse(resultParam);
  } catch {
    // Fallback if result is not JSON (shouldn't happen with new format)
    parsedResult = { data: null, rawResponse: resultParam };
  }

  const { data, rawResponse, parseError } = parsedResult;

  // If we have successfully parsed JSON data, show structured view
  if (data) {
    const totals = calculateTotals(data);

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Food Analysis Result</h1>

          <div className={styles.resultContainer}>
            <h2>Ingredients</h2>
            {Object.entries(data).map(([ingredient, nutrients]) => (
              <div key={ingredient} className={styles.ingredientCard}>
                <h3>{ingredient}</h3>
                <div className={styles.nutrientGrid}>
                  <div className={styles.nutrient}>
                    <span className={styles.nutrientLabel}>Weight:</span>
                    <span className={styles.nutrientValue}>{nutrients.weight}g</span>
                  </div>
                  <div className={styles.nutrient}>
                    <span className={styles.nutrientLabel}>Calories:</span>
                    <span className={styles.nutrientValue}>{nutrients.calories} kcal</span>
                  </div>
                  <div className={styles.nutrient}>
                    <span className={styles.nutrientLabel}>Protein:</span>
                    <span className={styles.nutrientValue}>{nutrients.protein}g</span>
                  </div>
                  <div className={styles.nutrient}>
                    <span className={styles.nutrientLabel}>Carbs:</span>
                    <span className={styles.nutrientValue}>{nutrients.carbs}g</span>
                  </div>
                  <div className={styles.nutrient}>
                    <span className={styles.nutrientLabel}>Fats:</span>
                    <span className={styles.nutrientValue}>{nutrients.fats}g</span>
                  </div>
                  <div className={styles.nutrient}>
                    <span className={styles.nutrientLabel}>Fiber:</span>
                    <span className={styles.nutrientValue}>{nutrients.fiber}g</span>
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.totalsCard}>
              <h2>Totals</h2>
              <div className={styles.nutrientGrid}>
                <div className={styles.nutrient}>
                  <span className={styles.nutrientLabel}>Weight:</span>
                  <span className={styles.nutrientValue}>{totals.weight}g</span>
                </div>
                <div className={styles.nutrient}>
                  <span className={styles.nutrientLabel}>Calories:</span>
                  <span className={styles.nutrientValue}>{totals.calories} kcal</span>
                </div>
                <div className={styles.nutrient}>
                  <span className={styles.nutrientLabel}>Protein:</span>
                  <span className={styles.nutrientValue}>{totals.protein}g</span>
                </div>
                <div className={styles.nutrient}>
                  <span className={styles.nutrientLabel}>Carbs:</span>
                  <span className={styles.nutrientValue}>{totals.carbs}g</span>
                </div>
                <div className={styles.nutrient}>
                  <span className={styles.nutrientLabel}>Fats:</span>
                  <span className={styles.nutrientValue}>{totals.fats}g</span>
                </div>
                <div className={styles.nutrient}>
                  <span className={styles.nutrientLabel}>Fiber:</span>
                  <span className={styles.nutrientValue}>{totals.fiber}g</span>
                </div>
              </div>
            </div>
          </div>

          <Link href="/scan" className={styles.backButton}>
            Scan Another Bite
          </Link>
        </main>
      </div>
    );
  }

  // Fallback: show raw text if JSON parsing failed
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Food Analysis Result</h1>

        {parseError && (
          <div className={styles.warning}>
            <p>Could not parse JSON response. Showing raw output:</p>
            <p className={styles.errorDetail}>{parseError}</p>
          </div>
        )}

        <div className={styles.resultContainer}>
          <p className={styles.resultText}>{rawResponse}</p>
        </div>

        <Link href="/scan" className={styles.backButton}>
          Scan Another Bite
        </Link>
      </main>
    </div>
  );
}

export default function AddData() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddDataContent />
    </Suspense>
  );
}
