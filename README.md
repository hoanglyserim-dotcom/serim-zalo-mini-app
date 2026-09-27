# SERIM WORK

Ứng dụng quản lý công việc nội bộ SERIM trên Zalo Mini App.
Tài liệu nghiệp vụ gốc: [`docs/SOURCE_OF_TRUTH_v1.0.md`](docs/SOURCE_OF_TRUTH_v1.0.md).

```
Zalo Mini App  →  Cloudflare Worker (backend/)  →  D1 (database)  →  R2 (ảnh, làm sau)
```

## Cấu trúc thư mục

| Thư mục | Nội dung |
|---|---|
| `backend/` | API chạy trên Cloudflare Workers (TypeScript) |
| `backend/migrations/0001_prototype.sql` | 6 bảng prototype, chạy lại nhiều lần vẫn an toàn |
| `backend/seed-dev.sql` | Dữ liệu giả, **chỉ dùng để test trên máy**, không chạy trên DB thật |
| `docs/` | Source of Truth |
| `frontend/` | Zalo Mini App (sẽ làm sau khi API chạy ổn) |

## Lộ trình prototype

- [x] Viết code API: `/health`, `/me`, `/me/link`, `/groups`, `/tasks`, `/tasks/:id`, `/tasks/:id/status`, `/tasks/:id/activity`
- [x] Test trên máy: nhận diện user, tự tạo To-do, giao việc, đổi trạng thái, chặn xem trái quyền, xung đột khi sửa cùng lúc, activity log
- [ ] **Bước 1:** kiểm tra D1 đã có 6 bảng chưa
- [ ] Bước 2: điền Database ID vào `backend/wrangler.toml`
- [ ] Bước 3: nối Cloudflare với GitHub để tự deploy Worker
- [ ] Bước 4: nhập secret `ZALO_APP_SECRET` trong Cloudflare
- [ ] Bước 5: mở `/health` trên trình duyệt để kiểm tra
- [ ] Bước 6: tạo 2 user thật + 1 nhóm trong D1
- [ ] Bước 7: làm giao diện Mini App, test trên iPhone + Android
- [ ] Bước 8: tạo R2, thêm upload ảnh
- [ ] Bước 9: chấm prototype theo checklist mục 62

## Nhận diện người dùng

1. Mini App lấy access token của Zalo, gửi lên Worker.
2. Worker tự hỏi lại Zalo (`graph.zalo.me`) để biết đây là ai. Không tin id nào do app gửi lên.
3. Lần đầu mở app, nhân viên nhập **mã nhân viên** (Chủ tạo sẵn trong bảng `users`) để gắn Zalo với hồ sơ.

## Quy ước API (cho người viết frontend)

- Lỗi luôn có dạng `{ "error": { "code", "message" }, "request_id" }`. `message` là tiếng Việt, hiển thị thẳng cho người dùng được.
- Sửa task: `PATCH /tasks/:id` với `{ "changes": {...}, "base": {...giá trị đang thấy trên màn hình} }`.
  Sửa khác trường thì cả hai thay đổi đều được giữ; cùng trường đã bị người khác đổi thì trả `409 CONFLICT`.
- Đổi trạng thái: `PATCH /tasks/:id/status` với `{ "status", "base_status", "reason"? }`. Hủy bắt buộc có `reason`.
- Đổi người phụ trách bắt buộc có `reason`.
- `overdue` do server tính, không phải trạng thái.

## Chạy thử trên máy (dành cho dev)

```bash
cd backend
npm install
echo 'DEV_TOKEN="chuoi-bat-ky-dai-it-nhat-16-ky-tu"' > .dev.vars
npm run db:local && npm run db:seed-local
npm run dev
# Gọi thử với user giả:
curl -H "X-Dev-Token: <DEV_TOKEN>" -H "X-Dev-Zalo-Id: dev-zalo-A" localhost:8787/tasks
```
