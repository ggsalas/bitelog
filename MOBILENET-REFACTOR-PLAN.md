# MobileNetV3 TensorFlow.js Integration Plan

## Current State Analysis

### Existing Implementation
- **File:** `app/actions/analyzeFood.ts`
- **Current Function:** `analyzeFood(imageBase64: string)` - Server Action
- **Current Flow:** 
  - Receives base64 image from client
  - TODO placeholder returns mock "food name"
  - Returns `AnalyzeFoodResult` type union
- **Usage:** Called from `/scan` page after camera capture

### Current Dependencies
```json
{
  "dependencies": {
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

---

## Proposed Changes

### Goal
Replace the TODO placeholder with MobileNetV3 model using TensorFlow.js to classify food images and return food names.

---

## Architecture Decision: Client-Side vs Server-Side

### Option A: Server-Side Implementation (Current - Server Action)
**Pros:**
- Consistent with current architecture
- Can use Node.js TensorFlow backend (@tensorflow/tfjs-node)
- Faster inference on server
- Model loaded once, reused for all requests
- Keeps client bundle small

**Cons:**
- Requires @tensorflow/tfjs-node (native bindings)
- Server CPU/memory usage
- Network latency (send image to server)

**Required Packages:**
```json
{
  "@tensorflow/tfjs-node": "^4.20.0",
  "@tensorflow-models/mobilenet": "^2.1.1"
}
```

---

### Option B: Client-Side Implementation (Browser/React Component)
**Pros:**
- Runs in browser (WebGL acceleration possible)
- No server processing needed
- Instant feedback (no network latency)
- Works offline after model load

**Cons:**
- Larger initial bundle size
- Model download on first load (~16MB for MobileNetV2)
- Must refactor from Server Action to client component
- Browser compatibility concerns

**Required Packages:**
```json
{
  "@tensorflow/tfjs": "^4.20.0",
  "@tensorflow-models/mobilenet": "^2.1.1"
}
```

---

## Recommended Approach: **Option B (Client-Side)**

### Reasoning:
1. **Better UX:** Instant classification without server roundtrip
2. **Scalability:** No server load, runs on user's device
3. **Next.js Compatibility:** Works well with "use client" components
4. **Model Availability:** TensorFlow.js has pre-trained MobileNet models ready to use
5. **Camera Integration:** Image already captured client-side, no need to send to server

---

## Detailed Implementation Plan

### Phase 1: Install Dependencies

**Packages to Install:**
```bash
npm install @tensorflow/tfjs @tensorflow-models/mobilenet
```

**Package Details:**
- `@tensorflow/tfjs` (~4.20.0): Core TensorFlow.js library for browser
- `@tensorflow-models/mobilenet` (~2.1.1): Pre-trained MobileNet model (v1/v2, not v3)

**Note:** Official TensorFlow.js doesn't have MobileNetV3 pre-trained model. We'll use MobileNetV2 which is:
- Well-supported
- Optimized for mobile
- Good accuracy for food classification
- ~16MB model size

**Alternative if MobileNetV3 is required:**
- Use custom TFLite model conversion
- Use @tensorflow/tfjs-converter to convert TFLite to TFJS format
- More complex setup

---

### Phase 2: Refactor Server Action to Client-Side Hook

**Current:**
```typescript
// app/actions/analyzeFood.ts
"use server";
export async function analyzeFood(imageBase64: string): Promise<AnalyzeFoodResult>
```

**New Structure:**
```typescript
// app/hooks/useFoodClassifier.ts (NEW FILE)
"use client";

import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { useEffect, useState } from "react";

export function useFoodClassifier() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load model on mount
  useEffect(() => { ... }, []);
  
  // Classify image
  async function classifyImage(imageElement: HTMLImageElement | HTMLCanvasElement) {
    const predictions = await model.classify(imageElement);
    return predictions[0].className; // e.g., "pizza", "hamburger"
  }
  
  return { classifyImage, isLoading, model };
}
```

---

### Phase 3: Update Scan Page Component

**File:** `app/scan/page.tsx`

**Changes Needed:**

1. **Import the hook:**
```typescript
import { useFoodClassifier } from "@/app/hooks/useFoodClassifier";
```

2. **Use the hook:**
```typescript
const { classifyImage, isLoading: modelLoading } = useFoodClassifier();
```

3. **Modify `capturePhoto()` function:**
```typescript
async function capturePhoto() {
  // ... existing canvas drawing code ...
  
  // Instead of calling Server Action:
  // const result = await analyzeFood(imageDataUrl);
  
  // Call client-side classification:
  const canvas = canvasRef.current;
  const foodName = await classifyImage(canvas);
  
  // Navigate with result
  router.push(`/addData?result=${encodeURIComponent(foodName)}`);
}
```

4. **Add model loading state:**
```typescript
{modelLoading && <p>Loading AI model...</p>}
```

---

### Phase 4: Simplify Result Display

**File:** `app/addData/page.tsx`

**Changes:**
- Simplify to display single food name (not complex nutrition data)
- Remove JSON parsing logic (no longer needed)
- Display: "Detected Food: {foodName}"

**Later Enhancement:**
- Use food name to lookup nutrition database
- Show nutrition facts from API (e.g., USDA FoodData Central)

---

### Phase 5: Type Definitions

**Update:** `app/types/nutrition.ts` (or create new types file)

```typescript
export interface FoodClassification {
  className: string;      // e.g., "pizza"
  probability: number;    // 0-1 confidence score
}

export interface ClassificationResult {
  topPrediction: string;
  allPredictions: FoodClassification[];
}
```

---

## File Structure Changes

### New Files to Create:
```
app/
  hooks/
    useFoodClassifier.ts          # NEW: TensorFlow.js hook
  types/
    classification.ts             # NEW: Classification types (optional)
```

### Files to Modify:
```
app/
  scan/
    page.tsx                      # MODIFY: Use hook instead of Server Action
  addData/
    page.tsx                      # MODIFY: Simplify to show food name only
  actions/
    analyzeFood.ts                # DELETE or repurpose for future nutrition API
  
package.json                      # MODIFY: Add TensorFlow.js dependencies
```

### Files to Keep (No Changes):
```
app/
  components/
    Spinner.tsx                   # Keep as-is
  types/
    nutrition.ts                  # Keep for future nutrition lookup
```

---

## Implementation Steps (Ordered)

1. ✅ **Install TensorFlow.js packages**
   ```bash
   npm install @tensorflow/tfjs @tensorflow-models/mobilenet
   npm install --save-dev @types/tensorflow__tfjs
   ```

2. ✅ **Create `app/hooks/useFoodClassifier.ts`**
   - Import TensorFlow.js and MobileNet
   - Create React hook to load model
   - Export classify function

3. ✅ **Update `app/scan/page.tsx`**
   - Import useFoodClassifier hook
   - Replace Server Action call with hook
   - Use canvas element directly for classification
   - Update loading states

4. ✅ **Simplify `app/addData/page.tsx`**
   - Remove JSON parsing
   - Display simple food name result
   - Show confidence score (optional)

5. ✅ **Remove/Archive old code**
   - Delete or comment out `app/actions/analyzeFood.ts`
   - Clean up unused imports

6. ✅ **Test & Optimize**
   - Test model loading
   - Test classification accuracy
   - Optimize bundle size (lazy load model)
   - Add error handling

---

## Technical Considerations

### Model Loading Strategy

**Option 1: Load on Component Mount (Recommended)**
```typescript
useEffect(() => {
  mobilenet.load().then(setModel);
}, []);
```
- Pros: Simple, loads when page mounts
- Cons: Delays first classification

**Option 2: Lazy Load on First Use**
```typescript
async function classifyImage(canvas) {
  if (!model) {
    const loadedModel = await mobilenet.load();
    setModel(loadedModel);
  }
  // ... classify
}
```
- Pros: Faster initial page load
- Cons: First classification is slower

---

### Image Preprocessing

MobileNet expects:
- Image as `HTMLImageElement`, `HTMLCanvasElement`, or `tf.Tensor3D`
- Automatically handles resizing/normalization

**Current flow works:**
```typescript
// We already have canvas from capture
const canvas = canvasRef.current;
const predictions = await model.classify(canvas); // ✅ Works directly
```

---

### MobileNet Output Format

```typescript
const predictions = await model.classify(canvas, 3); // Top 3 predictions

// Returns:
[
  { className: "pizza", probability: 0.92 },
  { className: "flatbread", probability: 0.05 },
  { className: "meal", probability: 0.02 }
]
```

**For our use case:**
- Take `predictions[0].className` as the food name
- Optionally show probability as confidence %

---

### Bundle Size Impact

**Expected additions:**
- `@tensorflow/tfjs`: ~500KB (gzipped)
- `@tensorflow-models/mobilenet`: ~50KB (gzipped)
- Model weights: ~16MB (downloaded separately, cached by browser)

**Optimization strategies:**
1. Use Next.js dynamic imports:
   ```typescript
   const mobilenet = await import("@tensorflow-models/mobilenet");
   ```
2. Add to next.config.ts for tree-shaking
3. Cache model in browser IndexedDB

---

## Accuracy Considerations

### MobileNet Limitations for Food

**Trained on ImageNet dataset:**
- 1000 general categories (not food-specific)
- Has ~100 food categories: pizza, hamburger, espresso, ice cream, etc.
- May classify complex dishes generically ("plate of food", "meal")

**Accuracy expectations:**
- ✅ Good: Simple foods (pizza, banana, coffee)
- ⚠️ Limited: Complex meals, ethnic foods, ingredients
- ❌ Poor: Specific nutrition estimation

**Future improvements:**
- Train custom model on food dataset (Food-101, etc.)
- Use specialized food recognition API
- Combine with nutrition database lookup

---

## Error Handling

```typescript
try {
  const predictions = await model.classify(canvas);
  
  if (predictions.length === 0) {
    throw new Error("No food detected");
  }
  
  if (predictions[0].probability < 0.3) {
    // Low confidence warning
    return {
      foodName: predictions[0].className,
      warning: "Low confidence - classification may be inaccurate"
    };
  }
  
  return { foodName: predictions[0].className };
  
} catch (error) {
  // Handle TensorFlow errors, memory issues, etc.
}
```

---

## Testing Plan

1. **Unit Tests:**
   - Mock TensorFlow.js module
   - Test hook loading states
   - Test classification flow

2. **Integration Tests:**
   - Test full capture → classify → display flow
   - Test with known food images

3. **Manual Tests:**
   - Pizza, burger, coffee (should work well)
   - Complex meals (may be generic)
   - Non-food items (should classify as objects)

---

## Migration Strategy

### Step 1: Parallel Implementation
- Keep existing Server Action
- Add new client-side hook
- Add feature flag to switch between them

### Step 2: A/B Testing
- Test both approaches with real users
- Compare accuracy, performance, UX

### Step 3: Full Migration
- Remove Server Action
- Use only client-side classification

---

## Performance Benchmarks (Expected)

| Metric | Value |
|--------|-------|
| Model download | ~16MB (one-time) |
| Model load time | 2-3 seconds (first visit) |
| Classification time | 100-300ms (WebGL) |
| Memory usage | ~100MB (model in memory) |
| Bundle size increase | ~550KB |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large model download | Cache in browser, show loading state |
| Low accuracy on complex foods | Show confidence score, allow manual correction |
| Browser compatibility | Test on target devices, fallback message |
| Memory issues on mobile | Dispose tensors after classification |
| WebGL not available | TensorFlow.js falls back to CPU |

---

## Future Enhancements

1. **Nutrition Database Integration:**
   - Use food name to query USDA API
   - Display actual nutrition facts
   - Store in database

2. **Custom Model:**
   - Fine-tune on food-specific dataset
   - Better accuracy for meals
   - Nutrition estimation from image

3. **Multi-food Detection:**
   - Use object detection model (COCO-SSD)
   - Detect multiple foods in one image
   - Sum up nutrition for complete meal

4. **Offline Support:**
   - Cache model in Service Worker
   - Full PWA functionality

---

## Alternative: Keep Server-Side with Node.js TensorFlow

If server-side is preferred:

```typescript
// app/actions/analyzeFood.ts
"use server";

import * as tf from "@tensorflow/tfjs-node";
import * as mobilenet from "@tensorflow-models/mobilenet";

let model: mobilenet.MobileNet | null = null;

async function loadModel() {
  if (!model) {
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return model;
}

export async function analyzeFood(imageBase64: string) {
  const modelInstance = await loadModel();
  
  // Convert base64 to tensor
  const buffer = Buffer.from(imageBase64, "base64");
  const tensor = tf.node.decodeImage(buffer);
  
  // Classify
  const predictions = await modelInstance.classify(tensor);
  
  // Cleanup
  tensor.dispose();
  
  return {
    success: true,
    data: predictions[0].className,
  };
}
```

**Requires:**
```bash
npm install @tensorflow/tfjs-node @tensorflow-models/mobilenet
```

**Pros:** No client bundle increase, faster inference
**Cons:** Native build dependencies, server resource usage

---

## Recommendation Summary

**Recommended Approach:** Client-Side (Option B)

**Reasoning:**
1. Better user experience (instant feedback)
2. Scalable (no server load)
3. Works with existing Next.js architecture
4. Easier deployment (no native dependencies)

**Next Steps:**
1. Review and approve this plan
2. Install dependencies
3. Implement in phases (1-6)
4. Test thoroughly
5. Deploy

**Estimated Time:** 3-4 hours for full implementation

---

## Questions to Resolve Before Implementation

1. ✅ Client-side or server-side? → **Client-side recommended**
2. ✅ MobileNetV2 acceptable or need V3? → **V2 is fine, V3 not in @tensorflow-models**
3. ⚠️ Show top prediction only or multiple? → **Decision needed**
4. ⚠️ Keep nutrition data structure for future? → **Decision needed**
5. ⚠️ Remove Ollama integration completely? → **Decision needed**

---
