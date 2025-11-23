"use client";

import { useEffect, useState, useCallback } from "react";
import type * as tf from "@tensorflow/tfjs";

export interface FoodClassification {
  className: string;
  probability: number;
}

export interface ClassificationResult {
  topPrediction: string;
  confidence: number;
  allPredictions: FoodClassification[];
}

// Food-101 class labels mapping
let foodClassesMap: Record<number, string> | null = null;

export function useFoodClassifier() {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the EfficientNet B1 Food-101 model when the component mounts
  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to reduce initial bundle size
        const tfInstance = await import("@tensorflow/tfjs");
        // Import WebGL backend
        await import("@tensorflow/tfjs-backend-webgl");

        // Set TensorFlow backend (WebGL preferred, falls back to CPU)
        await tfInstance.ready();

        // Load food classes mapping
        const classesResponse = await fetch("/food_classes.json");
        const foodClassesOg: Record<string, number> = await classesResponse.json();
        
        // Swap keys and values (index -> class name)
        foodClassesMap = {};
        for (const key in foodClassesOg) {
          foodClassesMap[foodClassesOg[key]] = key;
        }

        // Load the custom EfficientNet B1 Food-101 model
        const loadStart = Date.now();
        const loadedModel = await tfInstance.loadGraphModel("/model.json");
        const loadTime = Date.now() - loadStart;

        if (mounted) {
          setModel(loadedModel);
          setIsLoading(false);
          console.log(`EfficientNet B1 Food-101 model loaded successfully in ${loadTime}ms`);
        }
      } catch (err) {
        console.error("Error loading EfficientNet model:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load model"
          );
          setIsLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Classifies an image using the loaded EfficientNet B1 Food-101 model
   * @param imageElement - HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
   * @param topK - Number of top predictions to return (default: 3)
   * @returns Classification result with top prediction and all predictions
   */
  const classifyImage = useCallback(
    async (
      imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
      topK: number = 3,
    ): Promise<ClassificationResult> => {
      if (!model || !foodClassesMap) {
        throw new Error("Model not loaded yet");
      }

      const tfInstance = await import("@tensorflow/tfjs");

      try {
        const inferenceStart = Date.now();

        // Preprocess image: resize to 224x224 and normalize
        const imageTensor = tfInstance.browser.fromPixels(imageElement);
        const resizedImage = tfInstance.image.resizeBilinear(
          imageTensor,
          [224, 224],
          true
        );
        
        // Normalize to [0, 1] and add batch dimension
        const normalizedImage = resizedImage.div(255.0).expandDims(0);

        // Run inference
        const predictions = model.predict(normalizedImage) as tf.Tensor;
        
        // Get top K predictions
        const topPreds = tfInstance.topk(predictions, topK, true);
        const topPredsVals = await topPreds.values.data();
        const topPredsIndices = await topPreds.indices.data();

        const inferenceTime = Date.now() - inferenceStart;
        console.log(`Inference completed in ${inferenceTime}ms`);

        // Format the results
        const allPredictions: FoodClassification[] = [];
        for (let i = 0; i < topK; i++) {
          const classIndex = topPredsIndices[i];
          const className = foodClassesMap[classIndex] || `Unknown (${classIndex})`;
          const probability = topPredsVals[i];
          
          allPredictions.push({
            className: className.replace(/_/g, " "),
            probability: probability,
          });
        }

        // Clean up tensors
        imageTensor.dispose();
        resizedImage.dispose();
        normalizedImage.dispose();
        predictions.dispose();
        topPreds.values.dispose();
        topPreds.indices.dispose();

        return {
          topPrediction: allPredictions[0].className,
          confidence: allPredictions[0].probability,
          allPredictions,
        };
      } catch (err) {
        console.error("Error classifying image:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to classify image",
        );
      }
    },
    [model],
  );

  return {
    model,
    isLoading,
    error,
    classifyImage,
  };
}
