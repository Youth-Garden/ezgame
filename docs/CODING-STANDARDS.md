# Coding Standards & Quality Guidelines

## 1. Core Principles

- English Only: All variable names, function names, types, comments, and commit messages must be written in English.
- No Decorative Emojis: Strictly avoid emojis in code comments, log messages, and documentation.
- Strict Type Safety: Absolutely no `any`. Use strict interfaces, explicit enums, or `unknown` where polymorphic data handling is needed.

---

## 2. Mandatory Enum Policy

All fields or variables that represent a finite set of discrete states MUST be declared as TypeScript enums:

```typescript
// Correct
export enum PlayerRole {
  X = "X",
  O = "O",
  SPECTATOR = "SPECTATOR",
}

// Prohibited
export type PlayerRole = "X" | "O" | "SPECTATOR";
```

---

## 3. Component and File Conventions

1. Casing:
   - Filenames: Strictly `kebab-case.tsx` or `kebab-case.ts`.
   - Components & Types: Strictly `PascalCase`.
   - Hooks: Strictly `use-[feature].ts`.
2. Line Count Limit:
   - UI Components and Page files must not exceed 300 lines of code.
   - Files exceeding 300 lines must be decomposed into sub-components or extracted custom hooks.
3. Descriptive Naming:
   - Avoid single-letter variables (`q`, `p`, `m`, `e`).
   - Use explicit identifiers (`event`, `player`, `position`, `index`, `result`).
4. Button Usage:
   - Never override button visual tokens manually with custom classes.
   - Always supply standard `variant` (`default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`) and `size` (`default`, `sm`, `lg`, `icon`, `icon-sm`).
