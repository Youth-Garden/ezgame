import { NextResponse } from "next/server";
import { generateRoomCode } from "@/shared/lib/utils";
import { GameType, RoomStatus } from "@/shared/types/room";

function parseGameType(raw: string | undefined): GameType {
  if (!raw) return GameType.CARO;
  const lower = raw.toLowerCase();
  if (lower === "tictactoe") return GameType.TICTACTOE;
  return GameType.CARO;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const gameType = parseGameType(body?.gameType);
    const prefix = gameType === GameType.CARO ? "CR" : "EZ";
    const code = generateRoomCode(prefix);

    return NextResponse.json({
      success: true,
      room: {
        id: `room_${code}`,
        code,
        gameType,
        status: RoomStatus.WAITING,
        createdAt: new Date().toISOString(),
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing room code" },
        { status: 400 }
      );
    }

    if (/^[A-Z]{2}-[A-Z0-9]{4}$/i.test(code)) {
      const isCaro = code.startsWith("CR");
      return NextResponse.json({
        success: true,
        room: {
          id: `room_${code}`,
          code,
          gameType: isCaro ? GameType.CARO : GameType.TICTACTOE,
          status: RoomStatus.WAITING,
          createdAt: new Date().toISOString(),
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
