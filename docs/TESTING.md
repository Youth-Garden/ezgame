# Testing Strategy & Execution Guidelines

## 1. Overview

Testing in EzGame prioritizes deterministic game engines, win-condition calculation, and rule enforcement before UI rendering occurs.

---

## 2. Test Structure

Tests reside alongside logic files or under `__tests__/` within feature slices:

```text
src/features/caro/utils/check-win.test.ts
src/features/bida/utils/bida-rules.test.ts
src/features/xiangqi/utils/xiangqi-rules.test.ts
src/features/animal-chess/utils/animal-chess-rules.test.ts
```

---

## 3. Test Writing Standard

Every game module must contain unit tests covering:
1. Initial board placement.
2. Valid moves across different pieces/animals.
3. Boundary violations (moving off the board, into own Den, or entering illegal terrain).
4. Win/loss determination.

Example unit test (`animal-chess-rules.test.ts`):

```typescript
import { expect, test, describe } from "bun:test";
import { canCapture, isRiver, ANIMAL_RANKS } from "./animal-chess-rules";
import { AnimalColor, AnimalType } from "../types";

describe("Animal Chess Rules", () => {
  test("Rat should capture Elephant on land", () => {
    const rat = { id: "b_rat", type: AnimalType.RAT, color: AnimalColor.BLUE };
    const elephant = { id: "r_elephant", type: AnimalType.ELEPHANT, color: AnimalColor.RED };
    expect(canCapture(rat, 2, 0, elephant, 6, 0)).toBe(true);
  });

  test("Elephant cannot capture Rat", () => {
    const elephant = { id: "b_elephant", type: AnimalType.ELEPHANT, color: AnimalColor.BLUE };
    const rat = { id: "r_rat", type: AnimalType.RAT, color: AnimalColor.RED };
    expect(canCapture(elephant, 2, 6, rat, 6, 6)).toBe(false);
  });
});
```

---

## 4. Test Execution Commands

- Run all unit tests:
  `bun test`
- Run specific game test:
  `bun test src/features/animal-chess`
- Watch mode:
  `bun test --watch`
