# EzGame Design System Specification

## 1. Triết lý Thiết kế (Design Principles)
EzGame hướng tới phong cách **Modern Gaming Canvas**: Tối giản, tập trung vào trải nghiệm chơi game tức thì, giao diện sắc nét, độ tương phản cao và hỗ trợ liền mạch cả hai chế độ **Dark Mode (mặc định)** và **Light Mode**.

Tuyệt đối **không hardcode mã màu trực tiếp** (như `text-neutral-400`, `bg-neutral-900`, `text-white`) trong component JSX. Mọi component phải sử dụng các **Semantic Design Tokens** đã được định nghĩa chuẩn bên dưới.

---

## 2. Hệ Thống Semantic Design Tokens

### A. Surfaces & Backgrounds
| Semantic Class | CSS Variable | Light Mode | Dark Mode | Mục đích sử dụng |
|---|---|---|---|---|
| `bg-background` | `--background` | `#edf1f7` | `#09090b` | Nền tổng thể trang web (Layout Canvas) |
| `bg-card` | `--card` | `#ffffff` | `#121216` | Bề mặt thẻ Game, Scoreboard, Bàn cờ, Dialogs |
| `bg-popover` | `--popover` | `#ffffff` | `#18181d` | Modal, Dialog, Dropdown menu nổi |
| `bg-muted` | `--muted` | `#e2e8f0` | `#1c1c22` | Pill indicators, Badges, Nút phụ, track tabs |
| `bg-secondary` | `--secondary` | `#e2e8f0` | `#1c1c22` | Hover state, tab container phụ |

### B. Typography & Foreground Colors
| Semantic Class | CSS Variable | Light Mode | Dark Mode | Mục đích sử dụng |
|---|---|---|---|---|
| `text-foreground` | `--foreground` | `#09090b` | `#ffffff` | Tiêu đề chính H1/H2, Tên người chơi (High Contrast) |
| `text-text-secondary` | `--text-secondary` | `#334155` | `#cbd5e1` | Subtitle, mô tả game, nhãn menu |
| `text-muted-foreground` | `--muted-foreground` | `#475569` | `#94a3b8` | Metadata phụ, footer, chú thích nhỏ |
| `text-primary` | `--primary` | `#2563eb` | `#3b82f6` | Tương tác chính, Player X, Highlights |
| `text-destructive` | `--destructive` | `#ef4444` | `#ff3434` | Nút Surrender, cảnh báo lỗi, Player O |

---

## 3. Quy Chuẩn Bắt Buộc về Dialog (Dialog Convention)

### A. Quy tắc Đặt tên (Naming Standard)
- BẮT BUỘC dùng hậu tố **`Dialog`** (ví dụ: `ConfirmDialog`, `ResultDialog`, `RoomSelectionDialog`, `BidaSpinDialog`, `MatchStartVsDialog`).
- **TUYỆT ĐỐI KHÔNG DÙNG** từ `Modal` để đặt tên file hoặc tên component.
- Định dạng tên file: `[feature]-dialog.tsx` (ví dụ: `room-selection-dialog.tsx`, `bida-spin-dialog.tsx`).

### B. Bắt buộc Tái sử dụng Component Dialog Chung
- Tuyệt đối KHÔNG tự code thẻ `<div>` custom riêng biệt hoặc chế overlay tự do cho mỗi dialog.
- Mọi dialog đều phải sử dụng component chia sẻ tại `@/shared/components/ui/dialog`:
  - `<Dialog open={isOpen} onOpenChange={...}>`
  - `<DialogContent showCloseButton={true|false}>`
  - `<DialogHeader>`
  - `<DialogTitle>`
  - `<DialogDescription>`

### C. Cơ chế Hiển thị qua Portal Stack
- Mọi dialog phải implement interface `PortalProps<TData>`:
  ```tsx
  export function MyCustomDialog({
    isOpen,
    onDismiss,
    data,
  }: PortalProps<MyCustomDialogData>) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          {/* Dialog body */}
        </DialogContent>
      </Dialog>
    );
  }
  ```
- Component cha kích hoạt thông qua hook `usePortal`:
  ```tsx
  const [presentDialog] = usePortal<MyCustomDialogData>(MyCustomDialog);
  // Trigger:
  presentDialog({ ...data });
  ```

---

## 4. Quy Chuẩn Zero-Border & Button Rules
1. **Zero-Border UI**:
   - Tất cả Card, Game Card, Scoreboard, Dialog, Action bar và Button đều không dùng đường viền (`border-none`).
2. **Quy tắc về Button**:
   - KHÔNG tự ý override hay re-style class thủ công lên `<Button>`. Luôn sử dụng prop `variant` (`default`, `secondary`, `outline`, `ghost`, `destructive`) và `size`.
