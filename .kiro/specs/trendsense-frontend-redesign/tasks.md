# Implementation Plan: TrendSense Frontend Redesign

## Overview

Incremental redesign of the TrendSense React/TypeScript/Tailwind frontend. Tasks build from the design token foundation upward through components to pages, ensuring each step integrates cleanly before the next begins.

## Tasks

- [x] 1. Establish design token system and Tailwind integration
  - Create `frontend/src/styles/tokens.css` with all CSS custom properties: color roles, spacing (4px grid `--space-1` through `--space-16`), border-radius tokens, typography tokens, shadow tokens, and transition duration tokens
  - Replace `frontend/src/index.css` import with `tokens.css` import in `frontend/src/main.tsx`; remove duplicate variable declarations from `index.css`
  - Update `frontend/tailwind.config.js` to extend theme using token references (CSS var references) for colors, spacing, radii, shadows, and font families — no duplicate hardcoded values
  - Add `prefers-reduced-motion` media query in `tokens.css` that sets all duration tokens to `0ms`
  - Add Google Fonts `<link>` with `display=swap` to `frontend/index.html`, removing the `@import` from CSS
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.6, 3.1, 3.2, 15.5, 16.4, 17.2, 17.3_

- [x] 2. Add `cn()` utility and update primitive UI components
  - Add `clsx` + `tailwind-merge` based `cn()` utility to `frontend/src/lib/utils.ts`; remove the existing `generateId` export to a separate file if needed, keeping utils focused
  - Rewrite `frontend/src/components/ui/Badge.tsx` to export a single `Badge` component accepting `variant: "default" | "success" | "warning" | "danger" | "info"` prop using token-based colors; keep `StageBadge` and `DomainBadge` as thin wrappers mapping to `Badge`
  - Rewrite `frontend/src/components/ui/Skeleton.tsx` to export a `Skeleton` primitive accepting `width`, `height`, and `variant: "text" | "rect" | "circle"` props with shimmer animation via CSS gradient keyframes; update `TrendCardSkeleton` and `PageSkeleton` to use the primitive
  - Rewrite `frontend/src/components/ui/TVSBar.tsx` to accept `value` (0–100), `showLabel: boolean`, and `size: "sm" | "md"` props; use token-based colors; fall back to default on invalid prop values
  - Ensure all three components use named exports and `cn()` for class composition
  - _Requirements: 5.2, 5.3, 5.4, 5.6, 5.7, 14.2, 17.4, 17.5, 17.7_

  - [ ]* 2.1 Write unit tests for Badge, Skeleton, and TVSBar prop validation
    - Test that invalid `variant` falls back to default without throwing
    - Test that `TVSBar` clamps values outside 0–100
    - _Requirements: 5.6_

- [x] 3. Implement responsive Sidebar with accessibility and collapse behavior
  - Refactor `frontend/src/components/Sidebar.tsx` to accept an `isCollapsed` boolean prop; render `<nav aria-label="Main navigation">` wrapping all nav links
  - Add `aria-current="page"` to the active `NavLink`; add `aria-label` to all icon-only buttons
  - Implement collapsed state: 64px icon-only rail on Viewport_MD, bottom navigation bar on Viewport_SM — use CSS media queries / Tailwind responsive classes, not JS breakpoint detection
  - Update `frontend/src/App.tsx` to manage `isCollapsed` state and pass it to `Sidebar`; adjust `main` margin/padding to respond to collapsed state
  - Add visible focus ring using accent color token on all interactive elements in the sidebar
  - Keep the pipeline refresh button with spinner and disabled state during `isPending`; add `aria-label="Refresh Intel"` to the button
  - Add `layoutId` spring animation on the active indicator (already partially present — ensure `bounce: 0`)
  - _Requirements: 4.2, 4.3, 4.8, 5.5, 6.1, 6.2, 6.9, 6.10, 6.11, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 15.6_

- [x] 4. Checkpoint — Sidebar and token foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Rewrite TrendCard with full component API and accessibility
  - Add `size: "sm" | "md" | "lg"` prop to `TrendCard` defaulting to `"md"`; apply token-based padding and font scale per size; clamp title to 2 lines in grid view, 1 line in list view
  - Add `id` to the expandable analysis panel; wire `aria-expanded` and `aria-controls` to the expand/collapse button
  - Fix sparkline fallback: replace `Math.random()` with a deterministic seeded generator based on `trend.id` so the curve is stable across renders
  - Set `isAnimationActive={false}` on the Recharts `Area` when a prop (e.g. `disableAnimation`) is passed; `Dashboard` will pass this when more than 20 cards are visible
  - Update TVS delta indicator to use success/danger color tokens (not hardcoded Tailwind colors)
  - Update stage badge mapping: Emerging → success token, Rising → warning token, Mainstream → info token
  - Ensure bookmark button has `aria-label` describing current state ("Add bookmark" / "Remove bookmark")
  - Ensure source citation links have `target="_blank" rel="noopener noreferrer"` (already present — verify and keep)
  - Expand/collapse spring transition: `type: "spring", bounce: 0, duration: 0.4`
  - _Requirements: 3.6, 3.7, 3.8, 5.1, 6.3, 6.4, 6.9, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 14.7, 15.2_

  - [ ]* 5.1 Write unit tests for TrendCard sparkline determinism
    - Render TrendCard twice with the same trend (no `velocity_history`) and assert sparkline data arrays are identical
    - _Requirements: 8.6, 14.7_

- [x] 6. Rewrite TrendingTicker with CSS animation and accessibility
  - Replace any JS-driven scroll with a pure CSS `@keyframes` ticker animation on the inner track element
  - Add `will-change: transform` only to the scrolling track element, not parent containers
  - Add `aria-hidden="true"` and `role="marquee"` to the outer container
  - _Requirements: 6.8, 15.4, 16.5_

- [x] 7. Redesign Dashboard page with full requirements compliance
  - Add `<label>` (visually hidden) associated with the search input; add `aria-label` to the search input
  - Update filter bar to wrap on Viewport_SM without overflow; use `flex-wrap` and token-based gap
  - Update URL query params when domain filter changes (use `useSearchParams` from react-router-dom)
  - Persist view mode in Zustand store across navigations (already in store — verify it's not reset on mount)
  - Stagger card entrance: `delay: Math.min(idx, 9) * 0.03` so only first 10 cards stagger (max 300ms total)
  - Wrap filtered results computation in `useMemo` (already present — verify dependencies are correct)
  - When `filtered.length > 50`, implement pagination: show first 50 cards with a "Load more" button, or use a simple page slice from store
  - Pass `disableAnimation` prop to `TrendCard` when `filtered.length > 20`
  - Display six `TrendCardSkeleton` placeholders during loading in the correct grid layout
  - Show empty state with "Clear Filters" button when no results match
  - Display page header with signal count, average TVS, and pipeline status indicator
  - Display `TrendingTicker` below header when trends are available
  - _Requirements: 4.1, 4.5, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 14.1, 14.3, 14.4, 15.3, 16.2, 16.3, 16.6_

  - [ ]* 7.1 Write unit tests for Dashboard filter logic
    - Test that search filtering is computed via `useMemo` and returns correct subsets
    - Test empty state renders when no trends match
    - _Requirements: 7.4, 7.5_

- [x] 8. Checkpoint — Core components and Dashboard
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Redesign Brief page with API integration and skeleton
  - Replace mock brief generation with `useBrief()` hook fetching from `/brief/today`
  - Show skeleton document placeholder during loading (use `Skeleton` primitive for heading and body blocks)
  - Show empty state with date and "pipeline has not run yet" message when `data` is null/undefined
  - Display brief generation date/time in human-readable format using `generated_at` field from `DailyBrief` type
  - Update prose styles to use Design_System typography tokens (map `prose-h1`, `prose-h2`, etc. to token values via Tailwind config)
  - Display `top_trends` from the brief response as linked `TrendCard` summaries (size `"sm"`) below the main document
  - Ensure print button calls `window.print()` and a `@media print` stylesheet in `tokens.css` hides `nav` and `.no-print` elements
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 14.5_

- [x] 10. Redesign Chat page with full accessibility and streaming compliance
  - Add `<label>` element and `aria-label` to the chat input describing its purpose
  - Add `aria-live="polite"` to the streaming indicator element (the blinking cursor or a status region)
  - Implement `onKeyDown` handler: Enter submits, Shift+Enter inserts newline (switch input to `<textarea>` if needed)
  - Display blinking cursor (`▋`) at end of assistant message content while streaming
  - Disable input and submit button while streaming; re-enable and focus input on stream completion (already partially present — verify focus behavior)
  - Auto-scroll to latest message after each append (already present — verify it works for streaming updates)
  - Display session ID (first 8 chars) in the header indicator (already present — verify)
  - "Clear" button generates new session ID and clears messages (already present — verify)
  - Show inline error message in assistant bubble when SSE connection fails; re-enable input
  - Welcome state with four suggestion prompts; clicking a prompt sends it immediately
  - Chat message entrance animation: `initial={{ opacity: 0, scale: 0.98 }}, animate={{ opacity: 1, scale: 1 }}`, duration `--duration-base`
  - Fix `left-80` hardcoded offset on the fixed input bar — use CSS variable or responsive class tied to sidebar width
  - _Requirements: 6.6, 6.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 15.7_

- [x] 11. Redesign Timeline page with accessibility and chart compliance
  - Add empty state prompt when fewer than one topic is active (already present — verify copy)
  - Disable preset chip when topic is already in active list (already present — verify)
  - Enforce max 4 topics (already present — verify)
  - Fix chart: set y-axis `domain={[0, 100]}` (currently `[0, 105]`) to match TVS scale
  - Verify x-axis date format is "MMM D" (e.g. "Jan 5") — currently uses `format(new Date(v), 'MMM d')`, confirm this is correct
  - Ensure chart line colors meet 3:1 contrast against chart background — verify the four `COLORS` values
  - Add skeleton chart area (a `Skeleton variant="rect"` with min 300px height) during data fetching for each active topic
  - Constrain chart container: `min-h-[300px] max-h-[600px]`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 14.6_

- [x] 12. Redesign Bookmarks page with confirmation dialog and exit animation
  - Add confirmation before "Clear All" — use a simple inline confirmation state (show "Are you sure?" with Confirm/Cancel buttons) rather than `window.confirm`
  - Display total bookmark count in the page header
  - Verify card exit animation uses `scale` transition (already present as `exit={{ opacity: 0, scale: 0.8 }}`)
  - Verify bookmarks persist via Zustand `persist` middleware with localStorage (already configured — confirm `partialize` includes `bookmarks`)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 13. Checkpoint — Pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Typography scale and global style cleanup
  - Define heading styles (h1–h4), body text styles (`body-lg`, `body-md`, `body-sm`), `label` style, and `numeric` style in `tokens.css` as `@layer base` or `@layer components` rules using token values
  - Remove all raw pixel font-size values from component files; replace with Tailwind utilities derived from token scale
  - Add responsive h1 font-size reduction on Viewport_SM using a media query in `tokens.css` (no JS)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 15. Accessibility audit and focus ring pass
  - Add visible focus ring to all interactive elements using accent color token: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` (add as a global `@layer base` rule or component utility)
  - Verify keyboard tab order follows visual reading order on Dashboard, Chat, Timeline, Brief, and Bookmarks pages
  - Verify all icon-only buttons have `aria-label` attributes
  - _Requirements: 6.10, 6.11, 9.8_

- [ ] 16. TypeScript strict mode and code quality pass
  - Enable `"strict": true` in `frontend/tsconfig.json` if not already set; resolve all resulting type errors across the codebase
  - Replace all inline ternaries producing raw class strings with `cn()` calls
  - Replace all magic numbers (z-index values, hardcoded pixel widths, breakpoint values) with named constants or token references
  - Ensure all components in `src/components/ui/` are stateless with no store access or API calls
  - Ensure all components use named exports
  - _Requirements: 17.1, 17.4, 17.5, 17.6, 17.7, 17.8_

  - [ ]* 16.1 Write property test for token completeness
    - Parse `tokens.css` and assert all required token names from Requirements 1.1–1.6 are present
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 17. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The design token system (Task 1) must be completed before any component work
- TypeScript strict mode errors should be fixed incrementally as each component is touched
