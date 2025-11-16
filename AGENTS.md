# Agent Guidelines for bitelog

## Commands
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Tests**: No test framework configured yet

## Code Style
- **TypeScript**: Strict mode enabled. All code must be fully typed.
- **Imports**: Use `@/` path alias for root imports (e.g., `import Foo from "@/app/components/Foo"`)
- **React**: Using React 19 with Next.js 16 App Router. React Compiler enabled in next.config.ts
- **Components**: Use function declarations for components (e.g., `export default function ComponentName()`)
- **Types**: Import types with `import type` syntax (e.g., `import type { Metadata } from "next"`)
- **Naming**: Use PascalCase for components, camelCase for functions/variables, UPPER_CASE for constants
- **Formatting**: Follow Next.js conventions - semicolons, double quotes for strings
- **ESLint**: Uses eslint-config-next with core-web-vitals and TypeScript configs
- **Target**: ES2017 with modern DOM/ESNext libs

## File Structure
- **App Router**: Use `app/` directory structure with Next.js 16 conventions
- **Styles**: CSS modules (`*.module.css`) for component-specific styles, `globals.css` for global styles
- **Images**: Use Next.js `Image` component from `next/image` for all images

## Best Practices
- Always use `"use client"` directive when client-side interactivity is needed
- Prefer server components by default
- Use proper metadata exports for SEO
