# Bitelog Action Plan

## Project Overview
Build a web app that uses camera to capture meal images, analyzes them with Ollama's llava:7b-v1.6 vision model, and displays nutritional data.

## Implementation Steps

### Phase 1: Basic Setup & Home Page ✅
- [x] 1.1 Clean default Next.js page content
- [x] 1.2 Create home page with "Scan New Bite" link/button
- [x] 1.3 Set up basic routing structure

### Phase 2: Camera & Image Capture
- [x] 2.1 Create `/scan` page (or similar route)
- [x] 2.2 Implement camera access using browser MediaDevices API
- [x] 2.3 Add capture button to take photo
- [ ] 2.4 Display captured image preview
- [ ] 2.5 Optimize for mobile devices (primary use case)

### Phase 3: Ollama Integration (Text Format)
- [ ] 3.1 Set up Ollama API client/connection
- [ ] 3.2 Create API route to handle image processing
- [ ] 3.3 Implement image-to-base64 conversion for API
- [ ] 3.4 Send image with nutrition prompt (English translation):
  ```
  Act as a certified nutritionist specialized in visual food analysis.
  
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
  
  Now analyze this image:
  ```
  
  **Note**: Original prompt in Spanish available in app-description.md
- [ ] 3.5 Handle loading states and errors

### Phase 4: Display Results
- [ ] 4.1 Create UI component to display text response
- [ ] 4.2 Show both image and analysis results
- [ ] 4.3 Add basic styling for readability

### Phase 5: JSON Format Refactor
- [ ] 5.1 Update prompt to request JSON format output
- [ ] 5.2 Define TypeScript interfaces for response:
  ```typescript
  {
    ingredient_name: {
      weight: number,      // grams
      calories: number,    // kcal
      protein: number,     // grams
      carbs: number,       // grams
      fats: number,        // grams
      fiber: number        // grams
    }
  }
  ```
- [ ] 5.3 Parse JSON response from Ollama
- [ ] 5.4 Update UI to display structured nutritional data
- [ ] 5.5 Add totals calculation for all nutrients

### Future Phases (Not in Current Scope)
- Database integration to save meal data
- Meal history viewing
- Analytics and reporting

## Technical Stack
- **Frontend**: Next.js 16 (App Router), React 19
- **AI Model**: Ollama llava:7b-v1.6 (local)
- **Camera**: Browser MediaDevices API
- **Language**: TypeScript (strict mode)

## Notes
- Focus on mobile-first design (primary use case is phone camera)
- Ensure Ollama is running locally before testing
- Keep UI simple and functional for Phase 1
- Handle edge cases: no camera, Ollama offline, poor image quality
