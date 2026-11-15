---
name: fe-workflow
description: >-
  Standard frontend workflow and design guidelines for EzGame.
  Use when creating or refactoring UI components, pages, scoreboards, and dialogs.
---

# EzGame Frontend Workflow & Design Rules

When implementing or modifying any UI in this project, follow this exact workflow:

## 1. Zero Layout Shift & Dimension Lockdown
- **Reserved Container Heights**:
  - `GameScoreboard.Root`: Must maintain fixed vertical min-height (`min-h-[58px] sm:min-h-[66px]`).
  - Scoreboard Center: Fixed height (`h-[42px]`) with vertical centering.
  - Row 2 of `PlayerAvatar`: Fixed height (`h-5` / `20px`) for badges and captured pieces so capturing a piece never causes a layout jump.
  - `GameActionBar`: Fixed height `h-8` container for Surrender / game action buttons.
- **Surface Design (No-Border Rule)**:
  - If a container already has a background color (`bg-muted`, `bg-secondary`, `bg-card`), **DO NOT add borders** (`border-none`). Rely on tonal contrast and radius.

## 2. Reusable Game Units (Visual Pieces)
- Never display raw strings or generic text when representing game units (e.g. captured pieces, current markers).
- Always use the dedicated unit component:
  - Cờ Tướng: `<XiangqiPieceComponent piece={...} size="xs" | "sm" | "lg" interactive={false} />`
  - Cờ Caro: `<CaroPieceMark value={...} size="xs" | "sm" | "lg" />`
  - Bida: `<BidaBallItem id={...} size="xs" | "sm" | "lg" />`

## 3. Button & Dialog System Rules
- **Buttons**:
  - Never override styles on `<Button>` with manual utility classes (`border-*`, `bg-*`, `rounded-*`).
  - Use official `variant` (`default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`) and `size` (`default`, `sm`, `lg`, `icon`, `icon-sm`).
- **Modals & Dialogs**:
  - Always use the Portal Stack: `const [presentModal] = usePortal(MyDialog)` mounted via `@/shared/components/portal`.
  - Every Dialog must implement `PortalProps<T>`.

## 4. Internationalization (i18n)
- Every user-facing text MUST come from `useTranslations(...)`.
- When adding a key, add it to ALL 3 language dictionaries:
  1. `src/messages/vi.json`
  2. `src/messages/en.json`
  3. `src/messages/ja.json`
- Key lookup verified with `node scratch/check-i18n.js`.
