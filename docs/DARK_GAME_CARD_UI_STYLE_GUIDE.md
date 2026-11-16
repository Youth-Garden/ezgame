# Style Guide: Clean Dark Game UI

A minimal, modern Clean Minimalist Dark Gaming UI system for the entire EzGame platform.

---

## 1. Design Philosophy

- **Neutral Dark Tone**: Instead of vibrant navy blue tones, the entire system uses neutral black/charcoal tones (`neutral-950` / `#09090b` / `#121215`). This allows users to focus entirely on artwork and the game board, reducing eye strain.
- **Content-First and Minimalism**:
  - No redundant secondary text (remove "X playing" indicators and distracting live dots).
  - GameCard in elegant vertical 3:4 format, 16px border radius (`rounded-2xl`), featuring prominent game artwork and clear uppercase game titles.
- **Zero-Border and Depth**: Depth is created by soft gradient lighting (soft vignette), blurred backgrounds `backdrop-blur`, and smooth drop shadows (`hover:shadow-2xl`) — no hard border frames.

---

## 2. Color Tokens

### 2.1 Neutral Surfaces

| Token | HSL / HEX Value | Purpose |
| :--- | :--- | :--- |
| `bg-page` | `#09090b` / `neutral-950` | Full-page background, deep modern black |
| `bg-card` | `#121215` / `neutral-900` | Game card, modal, and control panel backgrounds |
| `bg-elevated` | `#18181b` / `neutral-850` | Secondary buttons, popover menus, sub-tabs |
| `text-primary` | `#f4f4f5` / `neutral-100` | Main headings, game names, scores |
| `text-secondary` | `#a1a1aa` / `neutral-400` | Subtitles, descriptions, tag labels |
| `accent-primary` | `#3b82f6` (Blue) | Primary action buttons, active rings |

---

## 3. GameCard Anatomy

- **Aspect ratio**: `aspect-[3/4]`.
- **Border radius**: `rounded-2xl` (16px), smooth corners.
- **Artwork layer**: Positioned at the top of the card, scales gently on hover (`group-hover:scale-105 transition-transform duration-500`).
- **Bottom gradient layer**: Dark gradient transitioning from transparent to black at the card bottom, ensuring sharp text legibility.
- **Title**: Bold uppercase text (`font-bold uppercase tracking-tight text-white`), with compact tags/badges below.
- **Removed entirely**: Player count ("playing") and blinking green dots — keeps the interface calm, clean, and professional.

---

## 4. Modal and Dialog UI

- Background `bg-neutral-900`, large border radius `rounded-2xl`, open animation `animate-modal-in`.
- Segmented control tabs: soft sliding pill on `bg-neutral-950` background.
- Buttons use system standard variants (`default`, `secondary`, `outline`, `destructive`).
