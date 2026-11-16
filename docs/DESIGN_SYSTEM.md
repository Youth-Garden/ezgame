# EzGame Design System Specification

## 1. Design Principles

EzGame targets a **Modern Gaming Canvas** aesthetic: minimal, focused on instant gameplay experience, sharp interface, high contrast, and seamless support for both **Dark Mode (default)** and **Light Mode**.

- **Flat and Minimalist**: High legibility, restrained borders, soft backdrop blur, and clean geometry.
- **Zero-Layout-Shift**: Toolbars and status bars allocate fixed heights (e.g. `h-8` for action bars) so dynamically appearing controls never push layout elements.
- **Strict Button Variant Usage**: Direct class overriding on `<Button>` is strictly prohibited. All styles must be selected via `variant` and `size` props.
- **No hardcoded color values** in component JSX. Every component must use the Semantic Design Tokens defined below.

---

## 2. Semantic Design Token System

The application uses CSS Custom Properties mapped to Tailwind tokens. Always reference tokens, never hardcode hex or HSL values directly in components.

### A. Surfaces and Backgrounds

| Semantic Class | CSS Variable | Light Mode | Dark Mode | Purpose |
|---|---|---|---|---|
| `bg-background` | `--background` | `hsl(0 0% 100%)` | `hsl(240 10% 3.9%)` | Overall page background (Layout Canvas) |
| `bg-card` | `--card` | `hsl(0 0% 100%)` | `hsl(240 10% 6%)` | Game card, Scoreboard, Board, Dialog surfaces |
| `bg-popover` | `--popover` | `#ffffff` | `#18181d` | Floating Modal, Dialog, Dropdown menu |
| `bg-muted` | `--muted` | `hsl(240 4.8% 95.9%)` | `hsl(240 3.7% 15.9%)` | Pill indicators, Badges, secondary buttons, tab tracks |
| `bg-secondary` | `--secondary` | `hsl(240 4.8% 95.9%)` | `hsl(240 3.7% 15.9%)` | Hover state, secondary tab containers |

### B. Typography and Foreground Colors

| Semantic Class | CSS Variable | Light Mode | Dark Mode | Purpose |
|---|---|---|---|---|
| `text-foreground` | `--foreground` | `hsl(240 10% 3.9%)` | `hsl(0 0% 98%)` | Main headings H1/H2, Player names (High Contrast) |
| `text-muted-foreground` | `--muted-foreground` | `#475569` | `#94a3b8` | Secondary metadata, footer, small annotations |
| `text-primary` | `--primary` | `hsl(221.2 83.2% 53.3%)` | `hsl(217.2 91.2% 59.8%)` | Primary interaction, Player X, Highlights |
| `text-destructive` | `--destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Surrender button, error alerts, Player O |

---

## 3. Button Component Standards

All instances of `<Button>` must use standard variants. Never override classes manually.

### Supported Variants

| Variant | Purpose |
|---|---|
| `default` | High-emphasis primary action (e.g. "Create Room", "Start Game") |
| `secondary` | Neutral action button (e.g. view toggle, audio switch) |
| `outline` | Bordered action with transparent background (e.g. "Back to Lobby") |
| `ghost` | Transparent action button for navigation headers |
| `subtle` | Low-contrast background for pending states |
| `destructive` | Irreversible or loss-inducing actions (e.g. "Surrender", "Leave Match") |

### Supported Sizes

| Size | Dimensions | Usage |
|---|---|---|
| `default` | Height 40px (`h-10 px-4 py-2`) | Standard actions |
| `sm` | Height 36px (`h-9 px-3`) | Compact controls |
| `lg` | Height 44px (`h-11 px-8`) | Hero actions |
| `icon` | 40x40px (`h-10 w-10`) | Icon-only buttons |
| `icon-sm` | 32x32px (`h-8 w-8`) | Small icon buttons in action bars |

---

## 4. Dialog Convention

### A. Naming Standard

- Always use the **`Dialog`** suffix (e.g., `ConfirmDialog`, `ResultDialog`, `RoomSelectionDialog`, `BidaSpinDialog`, `MatchStartVsDialog`).
- Never use the word `Modal` in file or component names.
- File naming format: `[feature]-dialog.tsx` (e.g., `room-selection-dialog.tsx`, `bida-spin-dialog.tsx`).

### B. Mandatory Shared Dialog Component Reuse

- Never write a custom `<div>` element or free-floating overlay per dialog.
- All dialogs must use the shared component at `@/shared/components/ui/dialog`:
  - `<Dialog open={isOpen} onOpenChange={...}>`
  - `<DialogContent showCloseButton={true|false}>`
  - `<DialogHeader>`
  - `<DialogTitle>`
  - `<DialogDescription>`

### C. Portal Stack Display Mechanism

All Modals, Dialogs, and Action Sheets must be invoked via the Portal Stack (`@/shared/components/portal`):
- Do not maintain local `useState(isOpen)` inside pages or deeply nested components.
- Components must implement `PortalProps<TData>` (`isOpen`, `onDismiss`, `data`).
- Modal mounting takes place in the singleton `<PortalRenderer />` declared at the root layout (`src/app/layout.tsx`).
- Body scroll locking is automatically managed by the portal system.

```tsx
export function MyCustomDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<MyCustomDialogData>) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Dialog body */}
      </DialogContent>
    </Dialog>
  );
}
```

Parent components trigger via the `usePortal` hook:

```tsx
const [presentDialog] = usePortal<MyCustomDialogData>(MyCustomDialog);
// Trigger:
presentDialog({ ...data });
```

---

## 5. Zero-Border UI Rules

- All Cards, Game Cards, Scoreboards, Dialogs, Action bars, and Buttons must not use visible border lines (`border-none`).
- Depth is created by soft gradient lighting (soft vignette), blurred backgrounds `backdrop-blur`, and smooth drop shadows (`hover:shadow-2xl`).
