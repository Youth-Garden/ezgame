# EzGame - Nền Tảng Web Game Đối Kháng Thời Gian Thực (No-Auth)

Nền tảng web game đối kháng trực tiếp thời gian thực xây dựng bằng **Next.js 16 (App Router) + React 19 + TypeScript + Bun + Supabase Realtime + Tailwind CSS v4**.

Hệ thống được thiết kế theo kiến trúc **Feature-Sliced Design (FSD)** và triết lý **Zero Configuration / No-Auth**: Người chơi không cần đăng ký tài khoản, không cần mật khẩu, mở web là chơi được ngay lập tức.

---

## ⚡ Bạn Có Cần Set Up Thêm Gì Không?

### 👉 Trường hợp 1: Chơi thử ngay trên máy tính của bạn (KHÔNG CẦN SET UP GÌ)
* **Chế độ 1 máy (Pass & Play)**: 2 người ngồi cạnh nhau chia sẻ cùng 1 màn hình và chuột. Chỉ cần gạt công tắc `"Chơi 1 máy: BẬT"`.
* **Chế độ 2 tab cùng máy**: Mở 2 tab trên trình duyệt (tab 1 tạo phòng, tab 2 mở link mời). Trò chơi tự động đồng bộ qua API `BroadcastChannel` của trình duyệt mà **không cần tài khoản Supabase hay Database**.
* **Cách chạy**:
  ```bash
  cd d:\learn\ezgame
  bun install
  bun run dev
  ```
  Truy cập: [http://localhost:3000](http://localhost:3000) là chơi được ngay!

---

### 👉 Trường hợp 2: Muốn 2 người ở 2 nơi khác nhau (2 máy/2 mạng khác nhau) chơi chung
* **Bạn chỉ cần làm đúng 1 việc duy nhất**: Tạo 1 project Supabase miễn phí và điền 2 dòng key vào file `.env.local`:
  1. Vào [supabase.com](https://supabase.com) tạo project (mất 1-2 phút).
  2. Vào **Project Settings -> API**, copy:
     - **Project URL**
     - **anon / public key**
  3. Mở file `.env.local` và thay thế:
     ```env
     NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
     ```
  *(Không bắt buộc phải cấu hình PostgreSQL/Prisma vì hệ thống đã có sẵn in-memory cache tự sinh và quản lý phòng).*

* **Sau đó, đưa web ra ngoài Internet để bạn bè truy cập**:
  * **Cách nhanh nhất để test (không cần deploy)**:
    ```bash
    npx cloudflared tunnel --url http://localhost:3000
    ```
    Hệ thống sẽ cấp 1 đường link public (ví dụ `https://xxx.trycloudflare.com`). Bạn gửi link này cho bạn bè.
  * **Cách chuyên nghiệp lâu dài**: Đẩy code lên GitHub và import vào **Vercel** (miễn phí), điền 2 biến môi trường trên là xong.

📖 **Xem tài liệu chi tiết có hình ảnh minh họa tại**: [docs/ONLINE_MULTIPLAYER_GUIDE.md](docs/ONLINE_MULTIPLAYER_GUIDE.md)

---

## 🎮 Game Cờ Caro (Gomoku 15x15) Đã Chơi Được Chưa?

**Game Cờ Caro đã hoàn thiện 100% và đã chơi được trọn vẹn:**

* **Bàn cờ chuẩn 15x15**: Đánh số hàng (1 - 15) và cột chữ (A - O).
* **Ghost Hover Preview**: Xem trước nước cờ sắp hạ (quân X màu xanh cyan, quân O màu hồng rose).
* **Thuật toán O(1)**: Hàm `checkWin` kiểm tra 4 hướng tức thời (ngang, dọc, 2 đường chéo) khi vừa hạ quân, không gây giật lag.
* **Đường thắng phát sáng**: 5 quân cờ tạo thành chuỗi thắng tự động phát sáng và nhấp nháy hiệu ứng pulse.
* **Đầu hàng & Tái đấu**:
  * Nút "Đầu hàng" có xác nhận an toàn.
  * Hộp thoại kết quả (Portal Dialog) tích hợp pháo hoa `canvas-confetti`.
  * Tính năng xin tái đấu 2 chiều: Khi 1 bên bấm "Yêu cầu tái đấu", bên kia sẽ nhận được thông báo để chấp nhận hoặc từ chối.
* **Web Audio Sound Effects**: Tự phát âm thanh lách cách khi đặt cờ và âm hưởng chiến thắng mà không cần tải file MP3 bên ngoài.

---

## 🚀 Các Lệnh Thao Tác Với Bun

```bash
# Cài đặt dependencies
bun install

# Khởi động môi trường phát triển (Dev server)
bun run dev

# Kiểm tra lỗi cú pháp và kiểu dữ liệu TypeScript (0 lỗi)
bunx tsc --noEmit

# Kiểm tra chuẩn code Linting (0 warning, 0 error)
bun run lint

# Biên dịch ứng dụng cho Production
bun run build
```

---

## 🧩 Cấu Trúc Dự Án (Feature-Sliced Design)

```text
ezgame/
├── docs/
│   └── ONLINE_MULTIPLAYER_GUIDE.md # Hướng dẫn chi tiết kết nối 2 người chơi qua Internet
├── prisma/
│   └── schema.prisma               # Schema Room tối giản (WAITING, PLAYING, FINISHED)
├── src/
│   ├── app/                        # App Router (Next.js 16)
│   │   ├── api/rooms/route.ts      # API tạo/kiểm tra mã phòng (hỗ trợ in-memory fallback)
│   │   ├── play/[game]/[code]/     # Dynamic Route nạp game theo mã phòng
│   │   ├── layout.tsx              # Root Layout chứa PortalRenderer
│   │   └── page.tsx                # Trang chủ (Lobby)
│   ├── features/                   # Các Module nghiệp vụ độc lập
│   │   ├── caro/                   # Game Cờ Caro
│   │   │   ├── components/         # CaroBoard, CaroCell
│   │   │   ├── pages/              # CaroPlayPage
│   │   │   ├── utils/              # checkWin O(1), createEmptyBoard
│   │   │   └── types.ts            # CaroPlayer, GameWinner, CaroGameState
│   │   └── lobby/                  # Giao diện sảnh chính, tạo & nhập phòng
│   └── shared/                     # Hạ tầng dùng chung
│       ├── components/             # RoomHeader, ResultDialog, CopyLinkButton
│       │   └── portal/             # Portal Stack System (usePortal, PortalRenderer)
│       ├── hooks/                  # useRoomRealtime (Supabase Broadcast + Local BroadcastChannel)
│       ├── lib/                    # Supabase client, Web Audio sound effects, utils
│       └── types/                  # Room, PlayerRole, RealtimeEventType
├── .env.example                    # File mẫu biến môi trường
├── bun.lock                        # Lockfile chuẩn của Bun
└── package.json
```

---

## 🛡️ Bảng Tóm Tắt Kịch Bản Cấu Hình

| Nhu Cầu Chơi | Cần Cài Supabase? | Cần Cài PostgreSQL? | Cần Deploy / Tunnel? |
| :--- | :---: | :---: | :---: |
| **Chơi 2 người chung 1 máy tính** | ❌ Không | ❌ Không | ❌ Không (chỉ cần `bun run dev`) |
| **Chơi 2 tab trên cùng 1 máy tính** | ❌ Không | ❌ Không | ❌ Không (dùng `BroadcastChannel` local) |
| **Chơi 2 người ở 2 nơi (Internet)** | ✅ **Cần điền Key** | ❌ Không bắt buộc | ✅ **Cần** (qua Tunnel hoặc Vercel) |
