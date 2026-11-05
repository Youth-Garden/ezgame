# Quy tắc Sử dụng Button (Bắt buộc)

- **Tuyệt đối KHÔNG tự ý re-style hoặc override style của `<Button>`**:
  - Không thêm các class custom can thiệp vào `background` (`bg-*`), `border` (`border-*`), `border-radius` (`rounded-*`), `box-shadow` (`shadow-*`) hoặc ghi đè layout/padding mặc định của nút.
- **Bắt buộc sử dụng các `variant` và `size` có sẵn trong Design System**:
  - Khi cần đổi phong cách hoặc kích thước của nút, BẮT BUỘC chỉ truyền prop `variant` và `size` của component `<Button>`.
  - Các `variant` chuẩn: `default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`.
  - Các `size` chuẩn: `default`, `sm`, `lg`, `icon`, `icon-sm`.
- **Tôn trọng giao diện gốc của người dùng**: Tuyệt đối không tự ý sửa đổi style các nút trong file code mà người dùng đang làm việc hoặc đã tùy biến theo ý riêng.
