# Hướng Dẫn Chơi Cờ Caro Online 2 Người Ở 2 Nơi Khác Nhau (EzGame)

Tài liệu này giải thích chi tiết kiến trúc dự án **EzGame**, tình trạng sẵn sàng của game Cờ Caro, và hướng dẫn từng bước để 2 người chơi ở 2 máy tính / điện thoại ở bất kỳ đâu trên thế giới có thể so tài cùng nhau trong 1 phòng đấu thời gian thực.

---

## 1. Tổng Quan Kiến Trúc Dự Án EzGame

EzGame được xây dựng với các công nghệ hiện đại và chuẩn kiến trúc cao cấp:
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.
- **Styling**: Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Quản lý Package & Runtime**: **Bun** (nhanh, gọn nhẹ, không dùng npm/yarn).
- **Kiến trúc mã nguồn**: **Feature-Sliced Design (FSD)**:
  - `src/features/caro/`: Toàn bộ UI bàn cờ, logic nước đi, kiểm tra thắng/thua O(1).
  - `src/features/lobby/`: Trang chủ chọn game, tạo phòng, nhập mã phòng.
  - `src/shared/`: Hệ thống Portal Dialog (modal kết quả, xin tái đấu), hook kết nối thời gian thực (`useRoomRealtime`), Web Audio âm thanh.
  - `src/app/api/rooms/`: API sinh mã phòng và xác thực phòng (hỗ trợ in-memory fallback nếu chưa cắm database).

---

## 2. Game Cờ Caro Đã Chơi Được Chưa?

**Game đã HOÀN THIỆN và ĐÃ CHƠI ĐƯỢC NGAY LẬP TỨC!**

### Các tính năng đã hoạt động 100%:
1. **Bàn cờ 15x15 chuẩn quốc tế**:
   - Tọa độ hàng 1-15 và cột A-O rõ ràng.
   - Hiệu ứng xem trước quân cờ khi rê chuột (Ghost preview).
   - Đánh dấu nước đi mới nhất bằng chấm màu tương ứng.
   - Đường 5 ô chiến thắng tự động phát sáng rực rỡ (glow animation).
2. **Luật chơi & Thuật toán O(1)**:
   - Đủ 5 quân liên tiếp (hàng ngang, dọc, chéo chính, chéo phụ) là chiến thắng ngay lập tức.
   - Tự động nhận diện bàn cờ hòa khi đánh hết 225 ô.
   - Khóa lượt thông minh: Chỉ người đến lượt mới được hạ quân.
3. **Chế độ Chơi 1 máy (Pass & Play)**:
   - Có nút gạt `"Chơi 1 máy: BẬT/TẮT"` ngay trên đầu bàn cờ.
   - Khi BẬT: 2 người ngồi chung 1 máy tính có thể luân phiên nhau click quân X và O mà không cần mạng Internet.
4. **Tương tác trận đấu**:
   - Nút **Đầu hàng**: Xử thua ngay và mở bảng kết quả.
   - Bảng kết quả (Result Dialog) hiện pháo hoa rực rỡ, kèm 2 nút: **Yêu cầu tái đấu** (đối thủ nhận được thông báo để chấp nhận) và **Về sảnh chính**.
   - Bật / tắt âm thanh lách cách khi đặt cờ và âm hưởng chiến thắng.

---

## 3. Tại Sao Mặc Định 2 Máy Khác Nhau Chưa Đồng Bộ Nước Đi?

Hệ thống kết nối thời gian thực (`src/shared/hooks/use-room-realtime.ts`) được thiết kế theo cơ chế **Dual-Mode**:

1. **Chế độ 1: Tab-to-Tab Dev Mode (Mặc định khi chưa điền Supabase Key)**
   - Sử dụng API trình duyệt `window.BroadcastChannel`.
   - Giúp lập trình viên có thể mở 2 tab trên cùng 1 trình duyệt để test game nhanh mà không cần tạo tài khoản Supabase.
   - **Hạn chế**: `BroadcastChannel` chỉ hoạt động trong cùng 1 trình duyệt / máy tính. Hai máy khác nhau (khác IP, khác mạng) không thể nhìn thấy nhau qua kênh này.

2. **Chế độ 2: Supabase Realtime Live (Online Toàn Cầu)**
   - Sử dụng **Supabase Broadcast & Presence (WebSockets)**.
   - Khi người chơi A hạ cờ, tín hiệu được đẩy lên Supabase Cloud và phân phối xuống máy của người chơi B trong vòng vài mili-giây.
   - Chỉ cần có mạng Internet (WiFi, 4G), 2 người ở bất kỳ đâu cũng chơi chung 1 màn cờ được.

---

## 4. Hướng Dẫn Từng Bước Để 2 Người Ở 2 Nơi Chơi Chung

### Bước 1: Tạo Dự Án Supabase Miễn Phí (Mất 2 phút)
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (bằng GitHub/Google).
2. Nhấn **"New project"**, đặt tên (vd: `ezgame-online`), chọn vị trí máy chủ gần nhất (vd: `Singapore`).
3. Sau khi project tạo xong:
   - Vào menu bên trái: **Project Settings** -> **API**.
   - Copy mục **Project URL** (dạng `https://xyzabc.supabase.co`).
   - Copy mục **anon / public key** (chuỗi ký tự dài bắt đầu bằng `eyJ...`).

### Bước 2: Điền Key Vào File `.env.local`
Mở file `.env.local` trong thư mục gốc của dự án `d:\learn\ezgame\.env.local` và thay đổi:
```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
*(Nếu muốn lưu thông tin phòng vào Database, bạn có thể copy chuỗi kết nối Postgres vào `DATABASE_URL`, hoặc không cần vì hệ thống có bộ nhớ đệm tự động fallback).*

### Bước 3: Đưa Game Lên Mạng Để Cả 2 Cùng Truy Cập

Có 2 cách đơn giản nhất:

#### Cách 1: Deploy Lên Vercel (Khuyên Dùng - Tốt Nhất & Ổn Định Nhất)
1. Đưa dự án lên GitHub.
2. Truy cập [https://vercel.com](https://vercel.com), bấm **Add New Project** -> Chọn repository `ezgame`.
3. Trong mục **Environment Variables**, thêm 2 biến:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Vercel sẽ cung cấp một đường link công khai (ví dụ: `https://ezgame-demo.vercel.app`).

#### Cách 2: Chơi Thử Nhanh Qua Đường Hầm Cloudflare / Ngrok (Không Cần Deploy)
Nếu bạn đang chạy dev ở máy mình (`bun run dev`):
1. Mở một terminal mới và chạy:
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   # hoặc: npx @ngrok/ngrok http 3000
   ```
2. Terminal sẽ sinh ra một URL công khai dạng `https://xxxx.trycloudflare.com`.

---

## 5. Trải Nghiệm Trận Đấu

1. **Người tạo phòng (Quân X)**:
   - Truy cập vào website, bấm **"Tạo phòng ngay"**.
   - Bàn cờ hiện ra với mã phòng (ví dụ `#CR-8120`), thanh header hiện nút **"Mời bạn"**.
   - Nhấn **"Mời bạn"** để sao chép đường link lời mời (dạng: `https://.../play/caro/CR-8120?role=O`).
   - Gửi link này qua Zalo, Facebook Messenger hoặc Telegram cho người bạn ở xa.

2. **Người tham gia (Quân O)**:
   - Nhấp vào link được bạn gửi (trên điện thoại hoặc laptop).
   - Trang web tự động nhận diện và gán người này giữ vai **Quân O (Đi sau)**.

3. **Vào trận**:
   - Ở cả 2 màn hình, mục "Đối thủ" sẽ đổi từ trạng thái **"Đang chờ..."** sang **"Online"** màu xanh lá.
   - Quân X đánh ô nào, quân cờ lập tức hiện lên màn hình của Quân O và ngược lại!
   - Khi có người thắng, cả 2 màn hình đều bật bảng chiến thắng và có thể bấm "Yêu cầu tái đấu" để tiếp tục ván mới.

