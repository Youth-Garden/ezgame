import { NextResponse } from "next/server";
import { RoomStatus, GameType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { generateRoomCode } from "@/shared/lib/utils";

// In-memory fallback map for offline / dev mode without DB connection
const memoryRooms = new Map<
  string,
  { code: string; gameType: GameType; status: RoomStatus; createdAt: Date }
>();

function parseGameType(raw: string | undefined): GameType {
  if (!raw) return GameType.CARO;
  const upper = raw.toUpperCase();
  if (upper === "TICTACTOE") return GameType.TICTACTOE;
  return GameType.CARO;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const gameType = parseGameType(body?.gameType);
    const prefix = gameType === GameType.CARO ? "CR" : "EZ";
    const code = generateRoomCode(prefix);

    try {
      // Attempt to persist in Prisma
      const room = await prisma.room.create({
        data: {
          code,
          gameType,
          status: RoomStatus.WAITING,
        },
      });

      return NextResponse.json({
        success: true,
        room: {
          id: room.id,
          code: room.code,
          gameType: room.gameType.toLowerCase(),
          status: room.status,
          createdAt: room.createdAt,
        },
      });
    } catch (dbError) {
      console.warn("Prisma DB write failed or not configured, using memory fallback:", dbError);

      const fallbackRoom = {
        id: `mem_${Date.now()}`,
        code,
        gameType,
        status: RoomStatus.WAITING,
        createdAt: new Date(),
      };
      memoryRooms.set(code, fallbackRoom);

      return NextResponse.json({
        success: true,
        room: {
          ...fallbackRoom,
          gameType: fallbackRoom.gameType.toLowerCase(),
        },
        note: "Created in local memory fallback",
      });
    }
  } catch (err) {
    console.error("API /api/rooms POST error:", err);
    return NextResponse.json(
      { success: false, error: "Không thể tạo phòng" },
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
        { success: false, error: "Thiếu mã phòng" },
        { status: 400 }
      );
    }

    try {
      const room = await prisma.room.findUnique({
        where: { code },
      });

      if (room) {
        return NextResponse.json({
          success: true,
          room: {
            ...room,
            gameType: room.gameType.toLowerCase(),
          },
        });
      }
    } catch {
      // Fallback check memory
      const memRoom = memoryRooms.get(code);
      if (memRoom) {
        return NextResponse.json({
          success: true,
          room: {
            ...memRoom,
            gameType: memRoom.gameType.toLowerCase(),
          },
        });
      }
    }

    // If code matches the format, permit entry even in stateless no-auth mode
    if (/^[A-Z]{2}-[A-Z0-9]{4}$/i.test(code)) {
      return NextResponse.json({
        success: true,
        room: {
          code,
          gameType: code.startsWith("CR") ? "caro" : "tictactoe",
          status: RoomStatus.WAITING,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Phòng không tồn tại hoặc đã hết hạn" },
      { status: 404 }
    );
  } catch (err) {
    console.error("API /api/rooms GET error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi kiểm tra phòng" },
      { status: 500 }
    );
  }
}
