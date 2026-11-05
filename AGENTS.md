# Project Rules & Architectural Guidelines for EzGame

## 1. Enum Definition Rules (Mandatory)
- **All states, roles, game types, or events that have a finite and specific set of values** (e.g., `status`, `role`, `gameType`, `eventType`, `winner`, etc.) **MUST BE DEFINED USING `enum`**:
  - **In Prisma Schema (`prisma/schema.prisma`)**: Must declare `enum RoomStatus`, `enum GameType`, etc. and use them as data types for the respective fields instead of `String`.
  - **In TypeScript (`types.ts`)**: Must use TypeScript `enum` syntax (e.g., `export enum RoomStatus`, `export enum PlayerRole`, `export enum GameType`, `export enum RealtimeEventType`, `export enum CaroPlayer`, `export enum GameWinner`).
  - **Absolutely DO NOT** use raw strings (`string`) or loose string unions (`"WAITING" | "PLAYING"`) for fields that have a defined set of values.
  - **Consistent Usage**: Always import and use the enum values directly (e.g., `RoomStatus.WAITING`, `PlayerRole.X`, `RealtimeEventType.GAME_MOVE`) in logic, API routes, and components; do not hardcode raw strings.

## 2. Portal & Modal/Dialog Convention (Adapted from Lumen)
- **Portal & Floating UI**: When creating Modals, Dialogs, Sheets, or Popovers that render over the main layout, you **MUST** use the Portal Stack system located at `@/shared/components/portal` (`usePortal` or `usePortalWithoutBackdrop`).
- **Do not embed overlays deep in the DOM tree**: Absolutely do not embed modals deep inside child components or manage `useState(isOpen)` locally within the page.
- **Dialog Component Standards**: Every Dialog/Modal must implement the `PortalProps<T>` interface (`isOpen`, `onDismiss`, `data`). The parent component only needs to call `const [presentModal] = usePortal(MyDialog)` and pass data via `presentModal(data)`.
- `<PortalRenderer />` is mounted exactly once at the Root Layout (`src/app/layout.tsx`).

## 3. Module Architecture & Directory Convention (`app/` vs `features/`)
- **Module Separation (Feature-Sliced Design)**: Features must be separated into independent modules (`features/`) based on business functionality (e.g., the `vocabulary` module only handles vocabulary list displays, while the `study` module only handles interactive learning flows). Absolutely do not group code with different business logic into a single module.
- **Directory Structure inside Modules (`features/[module]/`)**:
  - `components/`: ONLY contains UI Components (React).
  - `pages/`: Contains complete page interfaces with the `-page.tsx` suffix.
  - `hooks/`: Contains custom React hooks.
  - `types/`: Contains data type definitions (Interfaces, Types, Enums) specifically for the UI/State of that module (Types for API/DB should be placed in `services/`).
  - `utils/`: Contains utility functions and pure logic (no React code or hooks).
- **Minimal files in `app/`**: `page.tsx` files inside `src/app/` must be absolutely minimal. They MUST NOT contain UI layouts, complex JSX tags, or React hooks. They MUST ONLY import the Page component from `features/[module]/pages/` and export it directly (e.g., `export default CaroPlayPage;`).
- **Pages Naming**: Page files in `features/[module]/pages/` must have the `-page.tsx` suffix (e.g., `caro-play-page.tsx`, `lobby-page.tsx`). The component inside must have the `Page` suffix (e.g., `CaroPlayPage`, `LobbyPage`).
- **Navigation via RouteEnum**: All internal programmatic navigation MUST use `RouteEnum` and the `formatUrl` function from `@/shared/constants/routes`. DO NOT hardcode raw URL strings (like `router.push('/play/caro/...')`).
- **Route Parameters**: In Client Components, always use `useParams()` and `useSearchParams()` from `next/navigation` to extract URL parameters instead of passing props from server pages.

## 4. File & Component Naming Convention
- **Casing**:
  - File names must strictly use **`kebab-case.tsx`** or **`kebab-case.ts`** (e.g., `caro-board.tsx`, `use-room-realtime.ts`, `sound-effects.ts`).
  - Components, Interfaces, Types, and Enums must strictly use **`PascalCase`** (e.g., `CaroBoard`, `PlayerRole`, `RealtimeEvent`).
- **Descriptive Names**: Absolutely DO NOT use single-letter variable or parameter names (like `q`, `m`, `n`, `p`, `e`). Always use explicit names (like `event`, `player`, `index`, `result`, `error`).

## 5. Frontend Components & Hook Convention
- **Component Line Count Limit**: Components in `features/[module]/components/` and page files must not exceed **300 lines**. If they do, you must split them into sub-components or extract logic into custom hooks.
- **Component Sub-folder Organization**: Related components should be grouped into contextual sub-folders inside `features/[module]/components/` rather than kept flat.
- **Strictly No Re-styling / Overriding Button (MUST USE VARIANT)**: Absolutely DO NOT manually re-style or override classes (`bg-*`, `border-*`, `rounded-*`, `shadow-*`, padding, etc.) on the `<Button>` component. The `Button` component already has standard `variant`s (`default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`) and `size`s (`default`, `sm`, `lg`, `icon`, `icon-sm`). You MUST ONLY use the `variant` and `size` props; do not pass custom override classes that break the design system.
- **Respect User Code**: Absolutely DO NOT automatically modify, interfere with, or re-style components/files that the user is currently opening or manually adjusting.
- **No Buttons Inside Links**: Absolutely DO NOT nest a `<button>` tag inside a `<Link>` or vice versa to avoid hydration errors and focus ring issues.
- **TypeScript `any`**: Absolutely DO NOT use the `any` type. You must define specific types or use `unknown` when flexibility is needed.
- **Hook Naming**: Hook filenames must follow the `use-[feature].ts` format (e.g., `use-room-realtime.ts`). Do not add redundant suffixes like `Query` or `Mutation`.

## 6. Package Management Rules (Bun)
- Use **Bun** (`bun`, `bun.lock`, `bun install`, `bun add`, `bun run dev`, `bun run build`) as the primary package manager and runtime.
- Absolutely do not create or commit `package-lock.json` or `yarn.lock`.

## 7. Import Rules & Code Quality
- When editing or writing code, always automatically remove unused imports and organize/sort imports neatly.
- **Lint / Typecheck Policy**: DO NOT automatically run lint (`eslint`, `bun run lint`) or typecheck on every chat turn or minor edit. ONLY run `bun run lint` / `bunx tsc --noEmit` when explicitly requested by the user, or after major refactoring / editing a large number of files.

## 8. Strict Git Safety Rules
- **STRICT RULE FOR GIT COMMIT AND PUSH**: Absolutely NEVER execute `git commit` or `git push` automatically. Every `git commit` or `git push` action MUST be explicitly requested by the user in the CURRENT prompt.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Strict Prohibition on Opening Browser for Testing (Mandatory)
- ABSOLUTELY DO NOT OPEN THE BROWSER (do not use browser_subagent, puppeteer, or any browser automation) to verify UI or features. Pages/features require user login which the agent cannot perform.
- All correctness checks must be done via reading and understanding code, logic analysis, running `tsc --noEmit`, running `eslint`, or testing code directly in the terminal. Absolutely do not open the browser yourself.
