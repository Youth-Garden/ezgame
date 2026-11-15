# Xiangqi (Chinese Chess - Cờ Tướng) Module

## 1. Tổng quan
Module `xiangqi` triển khai luật Cờ Tướng chính thức của Liên đoàn Cờ tướng Quốc tế (WXF), hỗ trợ đồng bộ nước đi thời gian thực 2 người chơi.

## 2. Cấu trúc Module (`src/features/xiangqi/`)
```
src/features/xiangqi/
├── components/          # Giao diện UI: XiangqiBoard, XiangqiPieceView, XiangqiScoreboard
├── config/              # Cấu hình luật (thời gian lượt, giới hạn bước)
├── hooks/               # useXiangqiGame quản lý state bàn cờ, nước đi, ăn quân, chiếu tướng
├── pages/               # xiangqi-play-page.tsx
├── types/               # Type definitions (XiangqiPiece, XiangqiColor, XiangqiPosition)
└── utils/               # Logic luật cờ: xiangqi-rules.ts, xiangqi-rules.test.ts, xiangqi-display.ts
```

## 3. Quy tắc & Luật chơi
- **Bàn cờ**: 9 cột x 10 hàng (`BOARD_COLS = 9`, `BOARD_ROWS = 10`), chia đôi bởi Sông Sở Hà - Hán Giới (`Chu River - Han Border`).
- **Cung Tướng (Palace)**: Hàng 0-2 (Đen) và hàng 7-9 (Đỏ), cột 3-5. Tướng và Sĩ chỉ được di chuyển trong cung.
- **Quy tắc di chuyển từng quân**:
  - **Tướng (General)**: Đi ngang dọc 1 ô trong cung. Cấm lộ mặt tướng (Flying General).
  - **Sĩ (Advisor)**: Đi chéo 1 ô trong cung.
  - **Tượng (Elephant)**: Đi chéo 2 ô (mắt tượng), không qua sông, bị cản nếu có quân ở tâm (chặn mắt tượng).
  - **Mã (Horse)**: Đi chữ L (1 ô thẳng + 1 ô chéo), bị cản nếu có quân ở chân mã.
  - **Xe (Chariot)**: Đi ngang dọc không giới hạn ô trống.
  - **Pháo (Cannon)**: Đi ngang dọc như Xe khi không ăn; khi ăn quân bắt buộc phải có đúng 1 quân cản (ngòi pháo).
  - **Tốt / Binh (Soldier)**: Chưa qua sông chỉ đi tiến 1 ô; qua sông đi tiến hoặc ngang 1 ô (không được đi lùi).
- **Quy tắc kết thúc ván đấu**:
  - **Chiếu bí (Checkmate)**: Tướng bị chiếu và không còn nước đi thoát $\rightarrow$ Thua.
  - **Vây bí / Hết nước đi (Stalemate)**: Không bị chiếu nhưng không còn nước đi hợp lệ $\rightarrow$ **Thua** (theo luật Cờ tướng, khác Cờ Vua).
  - **Lộ mặt tướng (Flying General)**: Hai tướng đối mặt nhau trên cùng một cột mà không có quân cản ở giữa $\rightarrow$ Nước đi làm lộ mặt tướng là **bất hợp pháp (Illegal Move)**.

## 4. Kiểm thử Unit Test
Chạy kiểm thử unit test cho module Xiangqi:
```bash
bun test src/features/xiangqi/utils/xiangqi-rules.test.ts
```
