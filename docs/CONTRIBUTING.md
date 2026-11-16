# Contributing Guidelines

## 1. Code of Conduct & Contribution Flow

We welcome contributions to EzGame. To maintain codebase stability and architectural consistency, all contributions must adhere to these guidelines.

---

## 2. Git Branching Strategy

- `main`: Production-ready, authoritative branch. Direct commits to `main` are restricted.
- Feature branches: `feat/<game-or-feature-name>` (e.g. `feat/mancala-game`, `feat/sound-effects`).
- Fix branches: `fix/<bug-description>` (e.g. `fix/rematch-stale-callback`).
- Refactor branches: `refactor/<target-area>` (e.g. `refactor/room-selection-dialog`).

---

## 3. Commit Message Convention

Commits must follow Conventional Commits formatting:

- `feat(chess): implement 8x8 international chess engine and UI`
- `fix(realtime): resolve rematch request status synchronization`
- `docs(architecture): add system documentation and srs`
- `style(caro): adjust board padding to prevent layout shifts`
- `test(animal-chess): add river jump and trap capture unit tests`

Commit messages must not include decorative emojis or icons.

---

## 4. Pull Request Requirements

Before opening a PR:
1. Ensure all unused imports have been removed.
2. Verify zero TypeScript errors via `bunx tsc --noEmit`.
3. Add unit tests for any new deterministic game rules.
4. Verify that `<Button>` styles use variants (`default`, `secondary`, etc.) rather than manual class overrides.
