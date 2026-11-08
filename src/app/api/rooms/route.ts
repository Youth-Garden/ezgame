import { NextResponse } from "next/server";
import { generateRoomCode } from "@/shared/lib/utils";
import { GameType, RoomStatus } from "@/shared/types/room";

// In-memory registry to map room code to its created gameType and full game state
const activeRooms = new Map<
  string,
  {
    code: string;
    gameType: GameType;
    status: RoomStatus;
    gameState?: unknown;
    playerCount: number;
    createdAt: string;
    updatedAt: number;
  }
>();

// Sweep expired or empty rooms (Clean up immediately when empty for > 2 mins or older than 2 hours)
function cleanupStaleRooms() {
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const TWO_MINUTES = 2 * 60 * 1000;

  activeRooms.forEach((room, code) => {
    // 1. Release room immediately if no players remain for more than 2 minutes
    if (room.playerCount <= 0 && now - room.updatedAt > TWO_MINUTES) {
      activeRooms.delete(code);
      return;
    }
    // 2. Release room if it has been alive for over 2 hours
    if (now - room.updatedAt > TWO_HOURS) {
      activeRooms.delete(code);
    }
  });
}

function parseGameType(raw: string | undefined): GameType {
  if (!raw) return GameType.CARO;
  const lower = raw.toLowerCase();
  if (lower === "tictactoe") return GameType.TICTACTOE;
  if (lower === "bida") return GameType.BIDA;
  return GameType.CARO;
}

export async function POST(req: Request) {
  try {
    cleanupStaleRooms();
    const body = await req.json().catch(() => ({}));
    const gameType = parseGameType(body?.gameType);
    const code = generateRoomCode();

    const roomData = {
      code,
      gameType,
      status: RoomStatus.WAITING,
      playerCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: Date.now(),
    };

    activeRooms.set(code, roomData);

    return NextResponse.json({
      success: true,
      room: {
        id: `room_${code}`,
        ...roomData,
      },
    });
  } catch (err) {
    console.error("API /api/rooms POST error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body?.code?.trim()?.toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: "Missing room code" }, { status: 400 });
    }

    const existing = activeRooms.get(code);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    // Update room game state or player count
    if (body.gameState !== undefined) existing.gameState = body.gameState;
    if (body.playerCount !== undefined) existing.playerCount = Number(body.playerCount);
    if (body.status !== undefined) existing.status = body.status;
    existing.updatedAt = Date.now();

    // If explicit release requested (playerCount is 0), delete room immediately
    if (existing.playerCount <= 0 && body.releaseImmediate) {
      activeRooms.delete(code);
      return NextResponse.json({ success: true, released: true });
    }

    return NextResponse.json({ success: true, room: existing });
  } catch (err) {
    console.error("API /api/rooms PUT error:", err);
    return NextResponse.json({ success: false, error: "Failed to update room" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    cleanupStaleRooms();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing room code" },
        { status: 400 }
      );
    }

    // 1. First check if room was created in activeRooms registry
    const existing = activeRooms.get(code);
    if (existing) {
      existing.updatedAt = Date.now();
      return NextResponse.json({
        success: true,
        room: {
          id: `room_${code}`,
          ...existing,
        },
      });
    }

    // 2. Fallback for valid code formats: check query param gameType hint or prefix
    if (/^[A-Z0-9]{6}$/i.test(code) || /^[A-Z]{2}-[A-Z0-9]{4}$/i.test(code)) {
      const gameTypeParam = searchParams.get("gameType");
      const fallbackGameType = gameTypeParam
        ? parseGameType(gameTypeParam)
        : code.startsWith("BD")
        ? GameType.BIDA
        : GameType.CARO;

      const fallbackRoom = {
        code,
        gameType: fallbackGameType,
        status: RoomStatus.WAITING,
        playerCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: Date.now(),
      };
      activeRooms.set(code, fallbackRoom);

      return NextResponse.json({
        success: true,
        room: {
          id: `room_${code}`,
          ...fallbackRoom,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Room not found or expired" },
      { status: 404 }
    );
  } catch (err) {
    console.error("API /api/rooms GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to check room" },
      { status: 500 }
    );
  }
}
