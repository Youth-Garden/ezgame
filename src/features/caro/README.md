# Caro (Gomoku 15x15) Module

## 1. Tổng quan
Module `caro` triển khai luật cờ Caro (Gomoku 5 quân liên tiếp) trên bàn cờ chuẩn 15x15 ô, hỗ trợ đồng bộ thời gian thực 2 người chơi qua Supabase Realtime Broadcast.

## 2. Cấu trúc Module (`src/features/caro/`)
```
src/features/caro/
├── components/          # Giao diện UI: CaroBoard, CaroCell, CaroScoreboard
├── config/              # Cấu hình game (thời gian lượt, kích thước bàn)
├── hooks/               # useCaroGame hook quản lý state ván đấu
├── pages/               # caro-play-page.tsx
├── types/               # Type definitions (CaroPlayer, BoardState, WinningLine)
└── utils/               # Logic thuật toán cờ: check-win.ts, check-win.test.ts
```

## 3. Quy tắc & Luật chơi
- **Bàn cờ**: 15 hàng x 15 cột (`BOARD_SIZE = 15`).
- **Lượt đi**: Người chơi X (Chủ phòng) đi trước, người chơi O đi sau.
- **Điều kiện thắng**:
  - Tạo thành đường 5 quân cờ liên tiếp cùng màu theo hàng ngang, dọc, chéo chính hoặc chéo phụ.
- **Điều kiện hòa**:
  - Bàn cờ được lấp đầy (225 nước đi) mà không có bên nào tạo thành đường 5 quân.
- **Độ phức tạp kiểm tra thắng (`checkWin`)**: $O(1)$ chỉ quét tối đa 4 hướng xung quanh ô vừa đánh (tối đa 36 ô).

## 4. Kiểm thử Unit Test
Chạy kiểm thử unit test cho module Caro:
```bash
bun test src/features/caro/utils/check-win.test.ts
```
