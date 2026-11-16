# REST API Specification

## 1. Overview

EzGame provides lightweight server-side route handlers under Next.js App Router (`src/app/api/`) for room lifecycle orchestration and presence health checks.

Base URL: `/api`

---

## 2. Endpoints

### 2.1 Create Room
Generates a new match room and returns an assigned 6-character room code.

- Path: `/api/rooms`
- Method: `POST`
- Content-Type: `application/json`

#### Request Payload
```json
{
  "gameType": "caro | bida | xiangqi | chess | animal-chess",
  "config": {
    "turnTimeLimitSeconds": 45,
    "boardSize": 15
  }
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "room": {
    "code": "7GH99X",
    "gameType": "chess",
    "createdAt": "2026-11-16T00:30:00.000Z"
  }
}
```

#### Error Response (`400 Bad Request` / `500 Internal Server Error`)
```json
{
  "success": false,
  "error": "Failed to create room. Please try again."
}
```

---

### 2.2 Verify Room
Verifies the existence and status of a room before client initialization.

- Path: `/api/rooms/[code]`
- Method: `GET`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "room": {
    "code": "7GH99X",
    "gameType": "chess",
    "status": "WAITING",
    "createdAt": "2026-11-16T00:30:00.000Z"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "error": "Room code not found or has expired."
}
```
