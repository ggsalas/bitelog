"use client";

import { useEffect, useState, useCallback } from "react";
import type * as mobilenetType from "@tensorflow-models/mobilenet";

export interface FoodClassification {
  className: string;
  probability: number;
}

export interface ClassificationResult {
  topPrediction: string;
  confidence: number;
  allPredictions: FoodClassification[];
}

export function useFoodClassifier() {
  const [model, setModel] = useState<mobilenetType.MobileNet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the MobileNet model when the component mounts
  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to reduce initial bundle size
        const [tf, mobilenet] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/mobilenet"),
        ]);

        // Set TensorFlow backend (WebGL preferred, falls back to CPU)
        await tf.ready();

        // Load MobileNet v2 with alpha=1.0 (full model, best accuracy)
        const loadedModel = await mobilenet.load({
          version: 2,
          alpha: 1.0,
        });

        if (mounted) {
          setModel(loadedModel);
          setIsLoading(false);
          console.log("MobileNet model loaded successfully");
        }
      } catch (err) {
        console.error("Error loading MobileNet model:", err);
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
   * Classifies an image using the loaded MobileNet model
   * @param imageElement - HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
   * @param topK - Number of top predictions to return (default: 3)
   * @returns Classification result with top prediction and all predictions
   */
  const classifyImage = useCallback(
    async (
      imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
      topK: number = 3
    ): Promise<ClassificationResult> => {
      if (!model) {
        throw new Error("Model not loaded yet");
      }

      try {
        // Classify the image
        const predictions = await model.classify(imageElement, topK);

        if (predictions.length === 0) {
          throw new Error("No predictions returned from model");
        }

        // Format the results
        const allPredictions: FoodClassification[] = predictions.map((pred) => ({
          className: pred.className,
          probability: pred.probability,
        }));

        return {
          topPrediction: predictions[0].className,
          confidence: predictions[0].probability,
          allPredictions,
        };
      } catch (err) {
        console.error("Error classifying image:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to classify image"
        );
      }
    },
    [model]
  );

  return {
    model,
    isLoading,
    error,
    classifyImage,
  };
}
