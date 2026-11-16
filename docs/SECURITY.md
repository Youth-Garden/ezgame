# Security Policy & Guidelines

## 1. Security Architecture

EzGame prioritizes player safety, message authenticity, and denial-of-service resilience without requiring invasive personal identification.

---

## 2. Realtime Channel Security

1. Room Code Namespace: Each room connects to an isolated channel topic (`room-${roomCode}`).
2. Ephemeral Presence: Client IDs are tied to transient session storage and automatically garbage collected upon WebSocket disconnection.
3. Client-Side Input Sanitization: Nicknames and custom seeds are truncated and sanitized to prevent XSS payloads.

---

## 3. Defense Against Exploitation

- Deterministic Rule Checking: Even though game actions are broadcast across clients, both clients execute identical rule evaluators (`checkWin`, `chess.move`, `getValidMoves`). Malformed or illegal moves are rejected locally by peer clients.
- Rate Limiting: Action handlers prevent rapid packet spamming through debounced move submissions.
- Secrets Management: Sensitive database credentials (`DATABASE_URL`, service keys) must never be prefixed with `NEXT_PUBLIC_` and must never be exposed to client bundles.
