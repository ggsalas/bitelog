"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  function addDebugInfo(message: string) {
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  }

  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      try {
        addDebugInfo("Requesting camera access...");
        
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        // Request camera access with mobile-optimized constraints
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use rear camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        addDebugInfo("Camera access granted");
        addDebugInfo(`Stream tracks: ${mediaStream.getTracks().length}`);

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        setIsLoading(false);

        // Wait for next tick to ensure video element is rendered
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Attach stream to video element
        if (videoRef.current) {
          addDebugInfo("Attaching stream to video element");
          videoRef.current.srcObject = mediaStream;
          
          // Wait for video metadata to load
          videoRef.current.onloadedmetadata = () => {
            addDebugInfo("Video metadata loaded");
            addDebugInfo(`Video dimensions: ${videoRef.current?.videoWidth} x ${videoRef.current?.videoHeight}`);
          };
          
          // Ensure video plays (some browsers need explicit play)
          try {
            await videoRef.current.play();
            addDebugInfo("Camera stream active and playing");
          } catch (playError) {
            addDebugInfo(`Error playing video: ${playError}`);
          }
        } else {
          addDebugInfo("ERROR: Video ref is null");
        }
      } catch (err) {
        if (!mounted) return;

        const errorMessage = err instanceof Error ? err.message : String(err);
        addDebugInfo(`Camera error: ${errorMessage}`);
        
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError("Camera access denied. Please allow camera permissions.");
          } else if (err.name === "NotFoundError") {
            setError("No camera found on this device.");
          } else {
            setError(err.message || "Failed to access camera.");
          }
        } else {
          setError("Failed to access camera.");
        }
        
        setIsLoading(false);
      }
    }

    initCamera();

    // Cleanup function
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) {
      addDebugInfo("ERROR: Video or canvas element not ready");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      addDebugInfo("ERROR: Could not get canvas context");
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);

    // Log the captured image
    addDebugInfo("Photo captured!");
    addDebugInfo(`Image size: ${imageDataUrl.length} characters`);
    addDebugInfo(`Image dimensions: ${canvas.width} x ${canvas.height}`);
    addDebugInfo(`Image data (first 100 chars): ${imageDataUrl.substring(0, 100)}...`);
    
    console.log("Captured Image (base64):", imageDataUrl);
    console.log("Image size:", imageDataUrl.length, "characters");
    console.log("Image dimensions:", canvas.width, "x", canvas.height);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Scan New Bite</h1>
        
        {isLoading && (
          <div className={styles.status}>
            <p>Initializing camera...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {/* Debug info display */}
        <div className={styles.debugInfo}>
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </div>

        {!error && !isLoading && (
          <>
            <div className={styles.cameraContainer}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.video}
              />
              <button 
                onClick={capturePhoto}
                className={styles.captureButton}
                aria-label="Capture photo"
              >
                <div className={styles.captureButtonInner} />
              </button>
            </div>
          </>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </main>
    </div>
  );
}
