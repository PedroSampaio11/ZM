---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web and mobile applications. Contains 50+ styles, 161 color palettes, 57 font pairings, 161 product types with reasoning rules, 99 UX guidelines, and 25 chart types across 10 technology stacks. Searchable database with priority-based recommendations.

## When to Apply

This Skill should be used when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**.

### Must Use

- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts, etc.)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for user experience, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)
- Improving perceived quality, clarity, or usability of interfaces

### Recommended

- UI looks "not professional enough" but the reason is unclear
- Receiving feedback on usability or experience
- Pre-launch UI quality optimization
- Aligning cross-platform design (Web / iOS / Android)
- Building design systems or reusable component libraries

### Skip

- Pure backend logic development
- Only involving API or database design
- Performance optimization unrelated to the interface
- Infrastructure or DevOps work
- Non-visual scripts or automation tasks

## Rule Categories by Priority

| Priority | Category | Impact | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | Min size 44×44px, 8px+ spacing, Loading feedback | Reliance on hover only, Instant state changes (0ms) |
| 3 | Performance | HIGH | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | Match product type, Consistency, SVG icons (no emoji) | Mixing flat & skeuomorphic randomly, Emoji as icons |
| 5 | Layout & Responsive | HIGH | Mobile-first breakpoints, Viewport meta, No horizontal scroll | Horizontal scroll, Fixed px container widths, Disable zoom |
| 6 | Typography & Color | MEDIUM | Base 16px, Line-height 1.5, Semantic color tokens | Text < 12px body, Gray-on-gray, Raw hex in components |
| 7 | Animation | MEDIUM | Duration 150–300ms, Motion conveys meaning, Spatial continuity | Decorative-only animation, Animating width/height, No reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, Error near field, Helper text, Progressive disclosure | Placeholder-only label, Errors only at top, Overwhelm upfront |
| 9 | Navigation Patterns | HIGH | Predictable back, Bottom nav ≤5, Deep linking | Overloaded nav, Broken back behavior, No deep links |
| 10 | Charts & Data | LOW | Legends, Tooltips, Accessible colors | Relying on color alone to convey meaning |

## Quick Reference

### 1. Accessibility (CRITICAL)

- **color-contrast** — Minimum 4.5:1 ratio for normal text (large text 3:1)
- **focus-states** — Visible focus rings on interactive elements (2–4px)
- **alt-text** — Descriptive alt text for meaningful images
- **aria-labels** — aria-label for icon-only buttons
- **keyboard-nav** — Tab order matches visual order; full keyboard support
- **form-labels** — Use label with for attribute
- **skip-links** — Skip to main content for keyboard users
- **heading-hierarchy** — Sequential h1→h6, no level skip
- **color-not-only** — Don't convey info by color alone (add icon/text)
- **dynamic-type** — Support system text scaling; avoid truncation as text grows
- **reduced-motion** — Respect prefers-reduced-motion; reduce/disable animations when requested
- **voiceover-sr** — Meaningful accessibilityLabel/accessibilityHint; logical reading order
- **escape-routes** — Provide cancel/back in modals and multi-step flows

### 2. Touch & Interaction (CRITICAL)

- **touch-target-size** — Min 44×44pt (Apple) / 48×48dp (Material); extend hit area if needed
- **touch-spacing** — Minimum 8px/8dp gap between touch targets
- **hover-vs-tap** — Use click/tap for primary interactions; don't rely on hover alone
- **loading-buttons** — Disable button during async operations; show spinner or progress
- **error-feedback** — Clear error messages near problem
- **cursor-pointer** — Add cursor-pointer to clickable elements (Web)
- **tap-delay** — Use touch-action: manipulation to reduce 300ms delay (Web)
- **press-feedback** — Visual feedback on press (ripple/highlight)
- **haptic-feedback** — Use haptic for confirmations and important actions; avoid overuse
- **safe-area-awareness** — Keep primary touch targets away from notch, Dynamic Island, gesture bar
- **swipe-clarity** — Swipe actions must show clear affordance or hint

### 3. Performance (HIGH)

- **image-optimization** — Use WebP/AVIF, responsive images (srcset/sizes), lazy load non-critical assets
- **image-dimension** — Declare width/height or use aspect-ratio to prevent layout shift (CLS)
- **font-loading** — Use font-display: swap/optional to avoid invisible text (FOIT)
- **critical-css** — Prioritize above-the-fold CSS
- **lazy-loading** — Lazy load non-hero components via dynamic import / route-level splitting
- **bundle-splitting** — Split code by route/feature to reduce initial load and TTI
- **virtualize-lists** — Virtualize lists with 50+ items
- **progressive-loading** — Use skeleton screens / shimmer instead of long blocking spinners for >1s
- **input-latency** — Keep input latency under ~100ms for taps/scrolls
- **debounce-throttle** — Use debounce/throttle for high-frequency events (scroll, resize, input)

### 4. Style Selection (HIGH)

- **style-match** — Match style to product type
- **consistency** — Use same style across all pages
- **no-emoji-icons** — Use SVG icons (Heroicons, Lucide), not emojis
- **color-palette-from-product** — Choose palette from product/industry
- **effects-match-style** — Shadows, blur, radius aligned with chosen style
- **platform-adaptive** — Respect platform idioms (iOS HIG vs Material)
- **state-clarity** — Make hover/pressed/disabled states visually distinct
- **elevation-consistent** — Use a consistent elevation/shadow scale
- **dark-mode-pairing** — Design light/dark variants together
- **icon-style-consistent** — Use one icon set/visual language across the product
- **primary-action** — Each screen has only one primary CTA; secondary actions visually subordinate

### 5. Layout & Responsive (HIGH)

- **viewport-meta** — width=device-width initial-scale=1 (never disable zoom)
- **mobile-first** — Design mobile-first, then scale up
- **breakpoint-consistency** — Use systematic breakpoints (375 / 768 / 1024 / 1440)
- **readable-font-size** — Minimum 16px body text on mobile
- **line-length-control** — Mobile 35–60 chars per line; desktop 60–75 chars
- **horizontal-scroll** — No horizontal scroll on mobile
- **spacing-scale** — Use 4pt/8dp incremental spacing system
- **container-width** — Consistent max-width on desktop (max-w-6xl / 7xl)
- **z-index-management** — Define layered z-index scale (0 / 10 / 20 / 40 / 100 / 1000)
- **fixed-element-offset** — Fixed navbar/bottom bar must reserve safe padding
- **viewport-units** — Prefer min-h-dvh over 100vh on mobile
- **visual-hierarchy** — Establish hierarchy via size, spacing, contrast

### 6. Typography & Color (MEDIUM)

- **line-height** — Use 1.5-1.75 for body text
- **line-length** — Limit to 65-75 characters per line
- **font-pairing** — Match heading/body font personalities
- **font-scale** — Consistent type scale (12 14 16 18 24 32)
- **contrast-readability** — Darker text on light backgrounds
- **weight-hierarchy** — Bold headings (600–700), Regular body (400), Medium labels (500)
- **color-semantic** — Define semantic color tokens (primary, secondary, error, surface)
- **color-dark-mode** — Dark mode uses desaturated/lighter tonal variants, not inverted colors
- **color-accessible-pairs** — Foreground/background pairs must meet 4.5:1 (AA) or 7:1 (AAA)
- **truncation-strategy** — Prefer wrapping over truncation
- **whitespace-balance** — Use whitespace intentionally to group related items

### 7. Animation (MEDIUM)

- **duration-timing** — Use 150–300ms for micro-interactions; complex transitions ≤400ms
- **transform-performance** — Use transform/opacity only; avoid animating width/height/top/left
- **loading-states** — Show skeleton or progress indicator when loading exceeds 300ms
- **excessive-motion** — Animate 1-2 key elements per view max
- **easing** — Use ease-out for entering, ease-in for exiting
- **motion-meaning** — Every animation must express a cause-effect relationship
- **continuity** — Page/screen transitions should maintain spatial continuity
- **spring-physics** — Prefer spring/physics-based curves for natural feel
- **exit-faster-than-enter** — Exit animations shorter than enter (~60–70% of enter duration)
- **stagger-sequence** — Stagger list/grid item entrance by 30–50ms per item
- **interruptible** — Animations must be interruptible by user tap/gesture
- **no-blocking-animation** — Never block user input during an animation

### 8. Forms & Feedback (MEDIUM)

- **input-labels** — Visible label per input (not placeholder-only)
- **error-placement** — Show error below the related field
- **submit-feedback** — Loading then success/error state on submit
- **required-indicators** — Mark required fields (e.g. asterisk)
- **empty-states** — Helpful message and action when no content
- **toast-dismiss** — Auto-dismiss toasts in 3-5s
- **confirmation-dialogs** — Confirm before destructive actions
- **input-helper-text** — Provide persistent helper text below complex inputs
- **disabled-states** — Disabled elements use reduced opacity (0.38–0.5) + cursor change
- **progressive-disclosure** — Reveal complex options progressively
- **inline-validation** — Validate on blur (not keystroke)
- **input-type-keyboard** — Use semantic input types to trigger correct mobile keyboard
- **password-toggle** — Provide show/hide toggle for password fields
- **undo-support** — Allow undo for destructive or bulk actions
- **error-recovery** — Error messages must include a clear recovery path
- **multi-step-progress** — Multi-step flows show step indicator; allow back navigation
- **form-autosave** — Long forms should auto-save drafts
- **error-clarity** — Error messages must state cause + how to fix

### 9. Navigation Patterns (HIGH)

- **bottom-nav-limit** — Bottom navigation max 5 items; use labels with icons
- **drawer-usage** — Use drawer/sidebar for secondary navigation, not primary actions
- **back-behavior** — Back navigation must be predictable and consistent
- **deep-linking** — All key screens must be reachable via deep link / URL
- **tab-bar-ios** — iOS: use bottom Tab Bar for top-level navigation
- **top-app-bar-android** — Android: use Top App Bar with navigation icon
- **nav-label-icon** — Navigation items must have both icon and text label
- **nav-state-active** — Current location must be visually highlighted in navigation
- **modal-escape** — Modals and sheets must offer a clear close/dismiss affordance
- **search-accessible** — Search must be easily reachable (top bar or tab)
- **breadcrumb-web** — Web: use breadcrumbs for 3+ level deep hierarchies
- **state-preservation** — Navigating back must restore previous scroll position and filter state

### 10. Charts & Data (LOW)

- Always include legends and tooltips
- Use accessible color combinations (not color alone)
- Chart.js for interactive charts
- Provide data tables as fallback for screen readers
- Label axes clearly
- Support responsive resizing

## Technology Stack Reference

### React / Next.js
- shadcn/ui + Radix UI for accessible components
- Tailwind CSS for utility-first styling
- Framer Motion for animations
- React Hook Form + Zod for forms
- TanStack Table for data tables

### Vue / Nuxt
- Headless UI for accessible components
- Tailwind CSS
- Auto Animate for micro-animations
- VeeValidate for forms

### Styling Approach
- Mobile-first, utility-first
- CSS custom properties for theming
- CSS Grid + Flexbox for layouts
- CSS container queries for component-level responsiveness

## Design Styles Quick Reference

| Style | Best For | Key Characteristics |
|-------|----------|---------------------|
| Minimalism | SaaS, productivity | White space, limited palette, clean type |
| Glassmorphism | Modern dashboards | Frosted glass, backdrop blur, subtle borders |
| Neumorphism | Settings, controls | Soft shadows, extruded effect, monochromatic |
| Brutalism | Creative, bold brands | High contrast, raw typography, asymmetric |
| Claymorphism | Consumer apps | 3D puffy shapes, vivid colors, soft shadows |
| Bento Grid | Portfolios, dashboards | Card grid, varied sizes, modular layout |
| Dark Mode | Dev tools, media | Low light, reduced eye strain, OLED-friendly |
| Flat Design | Material apps | No skeuomorphism, bold colors, simple icons |

## Color Palette Selection

Choose by product category:
- **E-commerce**: Trust blues, conversion oranges, clean whites
- **Finance/Fintech**: Navy, forest green, gold accents
- **Health**: Calming greens, clean whites, soft blues
- **Creative/Agency**: Bold, high-contrast, expressive
- **SaaS/B2B**: Professional blues, grays, accent colors
- **Food/Lifestyle**: Warm tones, photography-forward
- **Tech/AI**: Deep purples, electric blues, dark backgrounds

## Font Pairing Rules

1. Combine serif + sans-serif for contrast
2. Match moods: both geometric, or both humanist
3. Establish clear hierarchy: display → heading → body → caption
4. Limit to 2 font families max
5. Test at all sizes before committing

## Quality Checklist

Before shipping any UI, verify:
- [ ] Contrast passes 4.5:1 (use browser DevTools)
- [ ] All interactive elements have focus states
- [ ] Touch targets are 44px minimum
- [ ] Works on 375px (iPhone SE) viewport
- [ ] No horizontal scroll on mobile
- [ ] Forms have visible labels (not just placeholders)
- [ ] Errors show near the relevant field
- [ ] Loading states exist for async operations
- [ ] Empty states have helpful messaging
- [ ] Dark mode tested if supported
