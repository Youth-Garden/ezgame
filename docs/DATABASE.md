# Database Architecture Specification

## 1. Database Overview

EzGame uses PostgreSQL managed via Prisma ORM for room persistence, match records, and optional game replay storage.

---

## 2. Mandatory Enum Schemas

All room statuses, player roles, and game types must be defined as native PostgreSQL enums:

```prisma
enum RoomStatus {
  WAITING
  PLAYING
  FINISHED
}

enum GameType {
  CARO
  BIDA
  XIANGQI
  CHESS
  ANIMAL_CHESS
  MANCALA
  GO
}

enum PlayerRole {
  X
  O
  SPECTATOR
}

enum GameWinner {
  X
  O
  DRAW
}
```

---

## 3. Entity Models

```prisma
model Room {
  id          String      @id @default(uuid())
  code        String      @unique
  gameType    GameType
  status      RoomStatus  @default(WAITING)
  config      Json?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  matches     Match[]

  @@index([code])
  @@index([status])
}

model Match {
  id          String      @id @default(uuid())
  roomId      String
  room        Room        @relation(fields: [roomId], references: [id], onDelete: Cascade)
  winner      GameWinner?
  movesCount  Int         @default(0)
  stateData   Json?
  startedAt   DateTime    @default(now())
  endedAt     DateTime?

  @@index([roomId])
}
```

---

## 4. Migration & Seeding Procedures

1. Generate Prisma Client:
   `bunx prisma generate`
2. Apply Migrations locally:
   `bunx prisma migrate dev --name init_game_schema`
3. Production Migration Deployment:
   `bunx prisma migrate deploy`
