# Style Guide: Clean Dark Game UI

Hệ thống thiết kế tối giản, hiện đại (Clean Minimalist Dark Gaming UI) cho toàn bộ nền tảng EzGame.

---

## 1. Triết lý Thiết Kế (Design Philosophy)
- **Neutral Dark Tone**: Thay vì dùng tone xanh navy rực rỡ, toàn bộ hệ thống sử dụng tone đen/xám than trung tính (`neutral-950` / `#09090b` / `#121215`). Điều này giúp người dùng tập trung tuyệt đối vào artwork và bàn cờ/bàn bida, không bị mỏi mắt.
- **Content-First & Minimalism**:
  - Không nhồi nhét text phụ (loại bỏ thông tin "X playing" và chấm live rườm rà).
  - Thẻ game (GameCard) dạng dọc 3:4 thanh lịch, bo góc 16px (`rounded-2xl`), bên trong là artwork game nổi bật và tên game in hoa rõ ràng.
- **Zero-Border & Depth**: Chiều sâu tạo bởi ánh sáng chuyển màu mềm (soft vignette), nền mờ `backdrop-blur` và đổ bóng êm (`hover:shadow-2xl`), không dùng viền khung cứng.

---

## 2. Bảng Màu Chuẩn (Color Tokens)

### 2.1 Neutral Surfaces
| Token | Giá trị HSL / HEX | Mục đích sử dụng |
| :--- | :--- | :--- |
| `bg-page` | `#09090b` / `neutral-950` | Nền toàn trang, đen sâu, hiện đại |
| `bg-card` | `#121215` / `neutral-900` | Nền thẻ game, modal, bảng điều khiển |
| `bg-elevated` | `#18181b` / `neutral-850` | Nút phụ, popover menu, tab con |
| `text-primary` | `#f4f4f5` / `neutral-100` | Tiêu đề chính, tên game, điểm số |
| `text-secondary`| `#a1a1aa` / `neutral-400` | Mô tả phụ, nhãn tag |
| `accent-primary`| `#3b82f6` (Blue) | Nút bấm hành động chính, active ring |

---

## 3. Cấu Trúc Thẻ Game (GameCard Anatomy)
- **Tỉ lệ khung hình**: `aspect-[3/4]`.
- **Bo góc**: `rounded-2xl` (16px), bo góc mượt mà.
- **Lớp Artwork**: Nằm ở phần trên thẻ, tự động phóng to nhẹ khi hover (`group-hover:scale-105 transition-transform duration-500`).
- **Lớp Gradient Chân Thẻ**: Gradient đen mờ chuyển từ trong suốt sang đen chân thẻ giúp chữ hiển thị sắc nét.
- **Tiêu đề**: Chữ in hoa đậm (`font-bold uppercase tracking-tight text-white`), phía dưới là tag/badge nhỏ gọn.
- **Hoàn toàn lược bỏ**: Số người chơi ("playing") và chấm xanh nhấp nháy, giữ cho giao diện tĩnh lặng, sạch sẽ và chuyên nghiệp.

---

## 4. Modal & Dialog UI
- Background `bg-neutral-900`, bo góc lớn `rounded-2xl`, hiệu ứng mở `animate-modal-in`.
- Segmented Control tab: viên thuốc trượt mềm trên nền `bg-neutral-950`.
- Nút bấm sử dụng variant chuẩn của hệ thống (`default`, `secondary`, `outline`, `destructive`).
