# Bida (Pocket Billiards 8-Ball) Module

## 1. Tổng quan
Module `bida` mô phỏng bàn bida lỗ 8 bóng chuẩn quốc tế 2D/3D bằng engine vật lý Matter.js + Three.js, hỗ trợ đồng bộ trạng thái bóng thời gian thực.

## 2. Cấu trúc Module (`src/features/bida/`)
```
src/features/bida/
├── components/          # Giao diện UI: BidaTable, BidaCueStick, BidaScoreboard, SpinControl
├── config/              # Cấu hình vật lý, kích thước bàn, ma sát, độ đàn hồi băng
├── hooks/               # useBidaPhysics (Matter.js), useBida3D (Three.js WebGL)
├── pages/               # bida-play-page.tsx
├── types/               # Type definitions (BidaBall, BidaBallType, BidaTurnState)
└── utils/               # Logic luật bida: bida-rules.ts, bida-rules.test.ts, bida-physics.ts
```

## 3. Quy tắc & Luật chơi (WPA 8-Ball Rules)
- **Tập hợp bóng**:
  - Bi cái (Trắng - ID 0)
  - Bi trơn (Solids 1-7)
  - Bi 8 (Đen - ID 8)
  - Bi sọc (Stripes 9-15)
- **Khai cuộc (Break Shot)**:
  - Nếu bi 8 rơi vào lỗ khi phá mà không chết bi cái: Bi 8 được đặt lại điểm cuối bàn (respot) mà không bị xử thua.
  - Nếu bi cái chết (scratch) khi phá bóng: Đối thủ nhận quyền bi trong tay (ball-in-hand) sau lằn giao bóng.
- **Phân nhóm (Open Table $\rightarrow$ Assigned Groups)**:
  - Bàn mở cho đến khi người chơi đánh trúng và ăn hợp lệ một bóng thuộc nhóm Trơn hoặc Sọc.
- **Luật phạm quy (Foul)**:
  - Bi cái rơi vào lỗ (Cue ball scratch).
  - Không đánh trúng bi mục tiêu của nhóm mình đầu tiên (Wrong ball first).
  - Đánh bi vào lỗ nhưng không chạm băng hoặc không bi nào vào lỗ hợp lệ.
- **Điều kiện thắng / thua với Bi 8**:
  - Ăn bi 8 khi đã dọn sạch toàn bộ bi của nhóm mình $\rightarrow$ **Chiến Thắng**.
  - Ăn bi 8 khi chưa dọn hết bi của nhóm mình $\rightarrow$ **Thất Bại (Xử Thua)**.
  - Chết bi cái trong cùng lượt cơ ăn bi 8 $\rightarrow$ **Thất Bại (Xử Thua)**.

## 4. Kiểm thử Unit Test
Chạy kiểm thử unit test cho module Bida:
```bash
bun test src/features/bida/utils/bida-rules.test.ts
```
