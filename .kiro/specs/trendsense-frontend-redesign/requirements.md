# Requirements Document

## Introduction

TrendSense is a trend intelligence dashboard built with React + TypeScript + Vite + Tailwind CSS. The current frontend uses a GitHub-dark aesthetic — dense, monospace-heavy, badge-saturated, with lots of borders and tight spacing. This spec covers a complete visual redesign inspired by the Altform aesthetic: minimalist, editorial, generous whitespace, clean type hierarchy, near-black backgrounds with off-white text, and subtle borders. All existing functionality (filtering, search, bookmarks, pipeline trigger, AI chat, timeline charts) is preserved. The redesign establishes a formal design token system, consistent component API, accessibility compliance, and responsive layout across all viewports.

The redesign covers five pages (Dashboard, Timeline, Brief, Chat, Bookmarks) and their shared components (Header with live ticker, Sidebar navigation, TrendCard, TrendRow, TrendDrawer, and UI primitives).

---

## Glossary

- **Design_System**: The set of CSS custom properties (tokens), Tailwind theme extensions, and component conventions that govern all visual decisions.
- **Token**: A named CSS custom property representing a single design decision (color, spacing, radius, shadow, duration).
- **TrendCard**: The primary card component that displays a single trend with title, domain, TVS score, summary, and expandable analysis.
- **TrendRow**: The compact list-view variant of TrendCard used in list view mode.
- **TrendDrawer**: The fixed right-side detail panel that slides in when a trend is selected.
- **Sidebar**: The fixed left navigation panel containing route links and pipeline controls.
- **Header**: The fixed top bar containing the logo, pipeline trigger, and live ticker strip.
- **TrendingTicker**: The horizontally scrolling live ticker strip in the Header showing top trends.
- **TVSBar**: The visual bar component representing the Trend Velocity Score.
- **Dashboard**: The main page showing the filterable, searchable grid/list of TrendCards.
- **Timeline**: The page showing multi-topic velocity line charts over a 14-day window.
- **Brief**: The page rendering the AI-generated daily intelligence brief in markdown.
- **Chat**: The page providing a conversational RAG interface to the backend AI analyst.
- **Bookmarks**: The page showing user-saved trends from the Zustand persisted store.
- **Viewport_SM**: Screen width < 640px (mobile).
- **Viewport_MD**: Screen width 640px–1023px (tablet).
- **Viewport_LG**: Screen width ≥ 1024px (desktop).
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA.
- **Skeleton**: A loading placeholder component that mimics the shape of the content it replaces.
- **SSE**: Server-Sent Events — the streaming protocol used by the Chat page.
- **TVS**: Trend Velocity Score — a 0–100 numeric score representing trend momentum.
- **Editorial_Style**: A visual language characterized by generous whitespace, large type, minimal borders, and content-first hierarchy — as seen in the Altform reference design.

---

## Requirements

### Requirement 1: Design Token System

**User Story:** As a frontend developer, I want all visual values defined as named tokens, so that the UI is consistent and changes can be made in one place.

#### Acceptance Criteria

1. THE Design_System SHALL define CSS custom properties for all color roles: `--color-bg` (near-black, #0a0a0a), `--color-surface` (#111111), `--color-surface-raised` (#181818), `--color-border` (subtle, #1f1f1f), `--color-border-strong` (#2a2a2a), `--color-accent` (#e8e8e8), `--color-accent-dim` (#6b6b6b), `--color-text-primary` (off-white, #f0f0f0), `--color-text-secondary` (#a0a0a0), `--color-text-muted` (#555555), `--color-success` (#4ade80), `--color-warning` (#fbbf24), `--color-danger` (#f87171).
2. THE Design_System SHALL define spacing tokens on a 4px base grid: `--space-1` (4px) through `--space-20` (80px).
3. THE Design_System SHALL define border-radius tokens: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (16px), `--radius-full` (9999px).
4. THE Design_System SHALL define typography tokens: `--font-sans` (a geometric sans-serif such as Inter or DM Sans), `--font-mono` (JetBrains Mono), and a type scale from `--text-xs` (11px) to `--text-5xl` (48px) with paired line-height tokens.
5. THE Design_System SHALL define shadow tokens: `--shadow-sm` (subtle, 0 1px 3px rgba(0,0,0,0.4)), `--shadow-md`, `--shadow-lg`.
6. THE Design_System SHALL define transition duration tokens: `--duration-fast` (120ms), `--duration-base` (220ms), `--duration-slow` (380ms).
7. THE Design_System SHALL expose all tokens as Tailwind theme extensions so they are usable as utility classes.
8. WHEN a token value is changed in the token file, THE Design_System SHALL propagate the change to all components that reference that token without requiring per-component edits.

---

### Requirement 2: Editorial Typography Scale

**User Story:** As a user, I want consistent, readable text with clear hierarchy across all pages, so that the interface feels intentional and editorial rather than dense and technical.

#### Acceptance Criteria

1. THE Design_System SHALL define exactly four heading levels (h1–h4) with fixed font-size, font-weight, line-height, and letter-spacing values drawn from the token scale, using a geometric sans-serif at light-to-regular weights for an editorial feel.
2. THE Design_System SHALL define body text styles: `body-lg` (16px/1.7), `body-md` (14px/1.6), `body-sm` (13px/1.5).
3. THE Design_System SHALL define a `label` style (11px, uppercase, 0.1em letter-spacing, font-mono, muted color) for metadata labels.
4. THE Design_System SHALL define a `numeric` style (tabular-nums, font-mono, primary text color) for all score and count displays.
5. WHEN rendered on Viewport_SM, THE Design_System SHALL reduce h1 font-size by one step on the type scale without JavaScript.
6. THE Design_System SHALL not use raw pixel values for font sizes in component files — all font sizes SHALL reference a token or Tailwind utility derived from a token.
7. THE Design_System SHALL use generous line-height (minimum 1.5) for all body text to support the editorial whitespace aesthetic.

---

### Requirement 3: Color System — Minimal Dark Aesthetic

**User Story:** As a user, I want a visually coherent near-black theme with clear hierarchy and generous whitespace, so that I can scan information quickly without visual noise.

#### Acceptance Criteria

1. THE Design_System SHALL use a near-black background color (`--color-bg`: #0a0a0a) as the page canvas — not a blue-tinted dark like GitHub's #0d1117.
2. THE Design_System SHALL define surface elevation levels using very subtle lightness steps: base surface (#111111), raised surface (#181818), overlay surface (#1e1e1e).
3. THE Design_System SHALL define borders as extremely subtle — `--color-border` (#1f1f1f) for default borders and `--color-border-strong` (#2a2a2a) for emphasized borders — avoiding the heavy border-heavy look of the current design.
4. THE Design_System SHALL ensure all text/background color pairs meet WCAG_AA contrast ratio (≥ 4.5:1 for normal text, ≥ 3:1 for large text).
5. THE Design_System SHALL use off-white (`--color-text-primary`: #f0f0f0) as the primary text color, not pure white, to reduce harshness against the near-black background.
6. WHEN a trend stage is "Emerging", THE TrendCard SHALL display the stage indicator using the success color token.
7. WHEN a trend stage is "Rising", THE TrendCard SHALL display the stage indicator using the warning color token.
8. WHEN a trend stage is "Mainstream", THE TrendCard SHALL display the stage indicator using a neutral/muted color token.
9. THE Design_System SHALL minimize the use of colored badges — domain and stage indicators SHALL use subtle text labels or minimal dot indicators rather than filled badge components.

---

### Requirement 4: Responsive Layout System

**User Story:** As a user on any device, I want the dashboard to be fully usable, so that I can access trend intelligence from a tablet or laptop without horizontal scrolling or broken layouts.

#### Acceptance Criteria

1. THE Dashboard SHALL render a single-column card grid on Viewport_SM, a two-column grid on Viewport_MD, and a three-column grid on Viewport_LG.
2. THE Sidebar SHALL collapse to a bottom navigation bar on Viewport_SM and Viewport_MD.
3. WHEN the Sidebar is collapsed on mobile, THE Sidebar SHALL display only icons with accessible aria-labels, no text labels.
4. THE main content area SHALL have a maximum width of 1440px and be horizontally centered on viewports wider than 1440px.
5. THE Dashboard filter bar SHALL wrap to multiple rows on Viewport_SM without overflowing the viewport.
6. THE Timeline chart container SHALL maintain a minimum height of 300px and a maximum height of 600px, scaling fluidly between viewports.
7. THE Chat input bar SHALL be positioned at the bottom of the viewport on all viewport sizes and SHALL NOT overlap the message list content.
8. THE Design_System SHALL not use fixed pixel widths for layout containers — all layout SHALL use relative units, flexbox, or CSS grid.
9. THE TrendDrawer SHALL render as a full-screen overlay on Viewport_SM and as a fixed right panel (420px wide) on Viewport_LG.

---

### Requirement 5: Whitespace and Spacing

**User Story:** As a user, I want generous whitespace throughout the interface, so that the layout feels intentional and editorial rather than cramped and information-dense.

#### Acceptance Criteria

1. THE Dashboard page SHALL have a minimum horizontal padding of 24px on Viewport_SM and 48px on Viewport_LG.
2. THE TrendCard SHALL have a minimum internal padding of 24px on all sides in grid view.
3. THE Sidebar SHALL have a minimum of 32px vertical spacing between navigation sections.
4. THE Brief page content SHALL have a maximum prose width of 680px and be centered within the content area.
5. THE Chat message list SHALL have a minimum of 16px vertical gap between messages.
6. THE Header SHALL have a minimum height of 56px with vertically centered content.
7. THE Dashboard filter bar SHALL have a minimum of 12px vertical padding above and below the filter controls.
8. THE Design_System SHALL define spacing using the token scale — no ad-hoc margin or padding values in component files.

---

### Requirement 6: Component API Consistency

**User Story:** As a developer, I want all components to follow a consistent prop and styling API, so that I can compose them predictably without reading implementation details.

#### Acceptance Criteria

1. THE TrendCard SHALL accept a `size` prop with values `"sm"` | `"md"` | `"lg"` controlling padding and font scale, defaulting to `"md"`.
2. THE Badge component SHALL accept a `variant` prop with values `"default"` | `"success"` | `"warning"` | `"danger"` | `"info"` and render the corresponding semantic color.
3. THE Skeleton component SHALL accept `width`, `height`, and `variant` (`"text"` | `"rect"` | `"circle"`) props and render appropriately shaped placeholders.
4. THE TVSBar component SHALL accept a `value` (0–100), `showLabel` boolean, and `size` (`"sm"` | `"md"`) prop.
5. THE Sidebar SHALL accept an `isCollapsed` boolean prop and render the appropriate collapsed or expanded state.
6. WHEN a component receives an invalid prop value outside its defined union type, THE component SHALL fall back to its default value without throwing a runtime error.
7. THE Design_System SHALL export a `cn()` utility function (clsx + tailwind-merge) used by all components for conditional class composition.

---

### Requirement 7: Accessibility

**User Story:** As a user relying on keyboard navigation or a screen reader, I want all interactive elements to be reachable and announced correctly, so that I can use TrendSense without a mouse.

#### Acceptance Criteria

1. THE Sidebar navigation SHALL render as a `<nav>` element with `aria-label="Main navigation"`.
2. WHEN a navigation link is active, THE Sidebar SHALL set `aria-current="page"` on that link.
3. THE TrendCard expand/collapse button SHALL have an `aria-expanded` attribute reflecting the current expanded state.
4. THE search input on the Dashboard SHALL have an associated `<label>` element (visually hidden is acceptable) with descriptive text.
5. THE Chat input SHALL have an associated `<label>` element and `aria-label` describing its purpose.
6. WHEN the Chat is streaming a response, THE streaming indicator SHALL have `aria-live="polite"` so screen readers announce completion.
7. THE TrendingTicker SHALL have `aria-hidden="true"` since it is decorative and auto-scrolling.
8. ALL icon-only buttons SHALL have an `aria-label` attribute describing the action.
9. THE focus ring on all interactive elements SHALL be visible and use the accent color token, with a minimum 2px outline offset.
10. THE keyboard tab order SHALL follow the visual reading order on all pages.

---

### Requirement 8: Dashboard Page

**User Story:** As a user, I want a fast, scannable dashboard that shows me the most important trends at a glance, so that I can quickly identify signals worth investigating.

#### Acceptance Criteria

1. THE Dashboard SHALL display a page header with a title and live signal count.
2. THE Dashboard SHALL display a filter bar with stage filter pills (All, Emerging, Rising, Mainstream), a domain selector, a view mode toggle (grid/list), and a search input.
3. WHEN the search query changes, THE Dashboard SHALL filter the displayed trends within 300ms without a network request.
4. WHEN no trends match the active filters, THE Dashboard SHALL display an empty state with a "Clear Filters" action button.
5. WHEN trends are loading, THE Dashboard SHALL display six TrendCardSkeleton placeholders in the grid layout.
6. THE Dashboard SHALL persist the active view mode (grid/list) in the Zustand store across page navigations.
7. WHEN the domain filter changes, THE Dashboard SHALL update the displayed trends immediately without a page reload.
8. THE Dashboard grid SHALL animate new cards in with a staggered fade-up transition with a maximum total stagger duration of 300ms.
9. WHEN the backend is unreachable, THE Dashboard SHALL display an inline error banner with a retry button.

---

### Requirement 9: TrendCard Component

**User Story:** As a user, I want each trend card to give me enough context to decide if a trend is worth exploring, so that I don't have to click into every card.

#### Acceptance Criteria

1. THE TrendCard SHALL display: domain label, stage indicator, trend title, 2-line truncated summary, TVS score, and TVS delta indicator.
2. THE TrendCard SHALL display a bookmark toggle button that reflects the current bookmarked state from the Zustand store.
3. WHEN the bookmark button is clicked, THE TrendCard SHALL optimistically update the bookmark icon without a loading state.
4. WHEN a TrendCard is clicked, THE TrendCard SHALL open the TrendDrawer with the full trend details.
5. THE TVS delta indicator SHALL display an upward indicator in success color when delta > 0, and a downward indicator in danger color when delta < 0.
6. THE TrendCard title SHALL be clamped to two lines in grid view and one line in list view.
7. THE TrendCard SHALL use generous internal padding and minimal borders to align with the editorial whitespace aesthetic.
8. WHEN a TrendCard is active (selected), THE TrendCard SHALL display a subtle left border accent in the accent color.

---

### Requirement 10: Header Component

**User Story:** As a user, I want a clean, minimal header that provides quick access to pipeline controls and shows live trend data, so that I always have context about the system state.

#### Acceptance Criteria

1. THE Header SHALL display the TrendSense wordmark and a pipeline trigger button.
2. THE Header SHALL display the TrendingTicker strip showing the top 8 trends by TVS score.
3. WHEN the pipeline trigger button is clicked, THE Header SHALL show a loading state and disable the button until the pipeline completes.
4. WHEN the pipeline completes successfully, THE Header SHALL show a success indicator for 3 seconds before returning to idle state.
5. THE Header SHALL have a fixed height of 56px and remain fixed at the top of the viewport during scroll.
6. THE Header SHALL use a subtle bottom border (`--color-border`) rather than a heavy border to maintain the minimal aesthetic.
7. THE TrendingTicker SHALL animate via a CSS `@keyframes` scroll animation, not JavaScript, to avoid layout thrashing.
8. WHEN no trends are available, THE Header SHALL display a minimal placeholder message in the ticker area.
9. THE Header SHALL display a mobile menu button on Viewport_SM and Viewport_MD to toggle the Sidebar.

---

### Requirement 11: Sidebar Component

**User Story:** As a user, I want clear, consistent navigation, so that I always know where I am and can move between pages quickly.

#### Acceptance Criteria

1. THE Sidebar SHALL display five navigation items: Dashboard, Timeline, Brief, Chat, Bookmarks — each with an icon and label.
2. WHEN a navigation item is active, THE Sidebar SHALL highlight it with a visible active indicator using the accent color.
3. THE Sidebar SHALL display a pipeline status section at the bottom showing a "Run Pipeline" button.
4. WHEN the pipeline is running, THE Sidebar SHALL disable the run button and show a spinner icon.
5. WHEN the pipeline completes, THE Sidebar SHALL show a success state for 3 seconds.
6. THE Sidebar SHALL have a fixed width of 224px on Viewport_LG.
7. THE Sidebar SHALL be keyboard navigable with visible focus indicators on all interactive elements.
8. THE Sidebar SHALL use minimal visual weight — no heavy borders between nav items, subtle active state backgrounds.

---

### Requirement 12: TrendDrawer Component

**User Story:** As a user, I want to read the full analysis of a trend without leaving the dashboard, so that I can explore details in context.

#### Acceptance Criteria

1. THE TrendDrawer SHALL display: trend title, domain, stage, TVS score, TVS delta, summary, investment thesis, product opportunity, risk assessment, and source citations.
2. THE TrendDrawer SHALL display a bookmark toggle button reflecting the current bookmarked state.
3. WHEN the close button is clicked, THE TrendDrawer SHALL close and the Dashboard SHALL return to its unselected state.
4. THE TrendDrawer SHALL animate in from the right with a slide + fade transition, duration ≤ 380ms.
5. THE TrendDrawer SHALL be scrollable when content exceeds the viewport height.
6. THE TrendDrawer SHALL use generous internal padding (minimum 32px) and clear typographic hierarchy for each section.
7. WHEN source citations are present, THE TrendDrawer SHALL render each as an accessible external link with `target="_blank"` and `rel="noopener noreferrer"`.
8. THE TrendDrawer SHALL display section labels using the `label` typography style (small, uppercase, muted) above each content section.

---

### Requirement 13: Timeline Page

**User Story:** As a user, I want to compare the velocity trajectories of multiple topics over time, so that I can identify convergence or divergence patterns.

#### Acceptance Criteria

1. THE Timeline SHALL display a searchable list of trends on the left and a velocity chart on the right.
2. WHEN a trend is selected from the list, THE Timeline SHALL display its 14-day velocity history on the chart.
3. THE Timeline chart SHALL display a tooltip on hover showing the date and TVS score.
4. THE Timeline chart x-axis SHALL display dates formatted as "MMM D" (e.g., "Jan 5").
5. THE Timeline chart y-axis SHALL be fixed to a 0–100 domain matching the TVS scale.
6. WHEN no trend is selected, THE Timeline SHALL auto-select the first trend in the list.
7. THE Timeline chart SHALL use the accent color for the line and subtle grid lines matching `--color-border`.
8. WHEN a trend has no velocity history, THE Timeline SHALL display an empty state message in the chart area.

---

### Requirement 14: Brief Page

**User Story:** As a user, I want to read the AI-generated daily intelligence brief in a clean, readable format, so that I can quickly absorb the day's top signals.

#### Acceptance Criteria

1. THE Brief SHALL fetch and display the daily brief content from the `/brief/today` API endpoint.
2. THE Brief SHALL render the brief content as formatted markdown using a prose typography style.
3. WHEN the brief is loading, THE Brief SHALL display a skeleton placeholder matching the approximate shape of the brief document.
4. WHEN no brief is available for today, THE Brief SHALL display an informative empty state with a message indicating the pipeline has not run yet.
5. THE Brief SHALL display a copy-to-clipboard button and an export-as-markdown button.
6. THE Brief SHALL display the brief generation date and time in a human-readable format.
7. THE Brief prose styles SHALL use the Design_System typography tokens for headings, body text, and horizontal rules.
8. THE Brief prose SHALL use generous line-height and paragraph spacing to support the editorial reading experience.

---

### Requirement 15: Chat Page

**User Story:** As a user, I want to ask natural language questions about trends and receive grounded, streamed answers, so that I can explore the data conversationally.

#### Acceptance Criteria

1. THE Chat SHALL display a welcome state with four suggestion prompts when no messages exist in the session.
2. WHEN a suggestion prompt is clicked, THE Chat SHALL immediately send that prompt as a user message.
3. WHEN a user submits a query, THE Chat SHALL add the user message and an empty assistant message to the list, then stream the response via SSE.
4. WHILE a response is streaming, THE Chat SHALL display a blinking cursor character at the end of the assistant message content.
5. WHILE a response is streaming, THE Chat SHALL disable the input field and submit button.
6. WHEN streaming completes, THE Chat SHALL re-enable the input field and focus it automatically.
7. THE Chat message list SHALL auto-scroll to the latest message after each new message is added.
8. WHEN the "Clear" button is clicked, THE Chat SHALL clear all messages and generate a new session ID.
9. THE Chat input SHALL submit on Enter key press and support Shift+Enter for newlines.
10. IF the SSE connection fails, THEN THE Chat SHALL display an inline error message in the assistant message bubble and re-enable the input.
11. THE Chat input area SHALL use a clean, minimal design — a single-line text input with a send button, no heavy card borders.

---

### Requirement 16: Bookmarks Page

**User Story:** As a user, I want to review and manage my saved trends in one place, so that I can track high-conviction signals over time.

#### Acceptance Criteria

1. THE Bookmarks page SHALL display all bookmarked trends as TrendCards in a responsive grid.
2. WHEN no bookmarks exist, THE Bookmarks page SHALL display an empty state with an icon and descriptive message.
3. THE Bookmarks page SHALL display a "Clear All" button when at least one bookmark exists.
4. WHEN the "Clear All" button is clicked, THE Bookmarks page SHALL clear all bookmarks immediately.
5. THE Bookmarks page SHALL display the total count of saved bookmarks in the page header.
6. THE Bookmarks page SHALL persist bookmarks across browser sessions using the Zustand persist middleware with localStorage.
7. THE Bookmarks page SHALL display an export button that downloads bookmarks as a JSON file.

---

### Requirement 17: Loading and Error States

**User Story:** As a user, I want clear feedback when data is loading or unavailable, so that I'm never left staring at a blank screen wondering what's happening.

#### Acceptance Criteria

1. THE Dashboard SHALL display TrendCardSkeleton components during the initial data fetch.
2. THE Skeleton component SHALL animate with a shimmer effect using a CSS gradient animation.
3. WHEN an API request fails, THE Dashboard SHALL display an inline error banner with a retry button.
4. THE Brief page SHALL display a skeleton document placeholder during loading.
5. THE Timeline page SHALL display a skeleton chart area during data fetching.
6. IF a TrendCard's velocity_history is empty or null, THEN THE TrendCard SHALL render without a sparkline rather than showing a broken chart.

---

### Requirement 18: Animation and Motion

**User Story:** As a user, I want smooth, purposeful animations that reinforce the UI's responsiveness, so that interactions feel polished without being distracting.

#### Acceptance Criteria

1. THE TrendDrawer entrance animation SHALL use a slide-from-right + fade transition, duration `--duration-slow`.
2. THE Dashboard grid SHALL stagger card entrance animations with a 30ms delay per card, capped at a maximum of 10 cards staggered (remaining cards appear instantly).
3. THE TrendingTicker SHALL animate via a CSS `@keyframes` scroll animation, not JavaScript, to avoid layout thrashing.
4. WHEN a user has `prefers-reduced-motion: reduce` set, THE Design_System SHALL disable all non-essential animations and transitions.
5. THE Chat message entrance animation SHALL use a fade + translate-y(4px → 0) transition, duration `--duration-base`.
6. ALL hover state transitions SHALL use `--duration-fast` (120ms) for a snappy, responsive feel.

---

### Requirement 19: Performance

**User Story:** As a user, I want the dashboard to load and respond quickly, so that I can work efficiently without waiting for the UI.

#### Acceptance Criteria

1. THE Dashboard filtered results SHALL be computed using `useMemo` to avoid recomputation on unrelated re-renders.
2. THE Design_System SHALL load Google Fonts using `display=swap` to prevent render-blocking.
3. THE TrendingTicker animation SHALL use `will-change: transform` only on the scrolling element, not on parent containers.
4. WHEN the trend list exceeds 50 items, THE Dashboard SHALL implement pagination to limit DOM nodes.
5. THE Chat message list SHALL not re-render all messages when a new message is appended — only the new message SHALL mount.

---

### Requirement 20: Code Quality and Maintainability

**User Story:** As a developer, I want the codebase to follow consistent patterns and have no TypeScript errors, so that I can extend it confidently.

#### Acceptance Criteria

1. THE frontend codebase SHALL have zero TypeScript compiler errors with `strict: true` enabled.
2. THE Design_System SHALL be defined in a single source-of-truth file (`src/styles/tokens.css`) imported once in `main.tsx`.
3. THE Tailwind config SHALL extend the theme using token references, not duplicate hardcoded values.
4. ALL components SHALL use named exports, not default exports, for consistency and tree-shaking.
5. THE `cn()` utility SHALL be the only mechanism for conditional class composition — no inline ternaries producing raw class strings.
6. THE `src/components/ui/` directory SHALL contain only primitive, stateless components — no API calls or Zustand store access.
7. THE `src/components/` directory SHALL contain composed, stateful components that may access the store or hooks.
