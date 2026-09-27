# SERIM WORK — SOURCE OF TRUTH v1.0
## Tài liệu nguồn dùng để AI tiếp tục thiết kế, viết code, kiểm thử và triển khai

**Ngày tổng hợp:** 26/09/2026  
**Chủ dự án:** Nguyễn Hoàng Ly  
**Dự án:** SERIM WORK  
**Nền tảng đích:** Zalo Mini App  
**Mục tiêu dùng chính:** quản lý công việc nội bộ SERIM trên điện thoại  
**Nguyên tắc:** tài liệu này là nguồn sự thật chính. Khi AI tiếp tục code, không được tự ý thay đổi các quyết định nghiệp vụ đã chốt nếu không nêu rõ lý do và xin xác nhận.

---

# 0. HƯỚNG DẪN CHO AI KHI ĐỌC FILE NÀY

AI tiếp tục dự án phải tuân thủ các nguyên tắc sau:

1. Không được hiểu SERIM WORK là phần mềm chỉ để “cấp trên giao việc cho cấp dưới”.
2. Lõi của hệ thống là **mỗi người tự quản lý được To-do của chính mình**, đồng thời có thể nhận việc từ người khác.
3. Không được nhảy thẳng vào làm full MVP.
4. Phải đi theo thứ tự: kiểm tra kiến trúc → xác nhận schema → prototype cực nhỏ → test thật trên iPhone + Android → chỉ khi prototype PASS mới xây MVP.
5. Không được phụ thuộc Zalo OA để lõi hệ thống hoạt động.
6. Không được xóa vật lý dữ liệu nghiệp vụ quan trọng.
7. Mọi thay đổi quan trọng phải có Activity Log.
8. Tổng chi phí vận hành mục tiêu: **dưới 3.000.000đ/năm**.
9. Ưu tiên: ít bảo trì, dễ dùng, tối ưu điện thoại, không yêu cầu nhân viên rành công nghệ.
10. Khi có nhiều lựa chọn kỹ thuật, AI phải so sánh ngắn gọn rồi chốt 1 phương án đề xuất; không bắt người dùng tự lựa chọn nếu không cần thiết.
11. Không yêu cầu người dùng gửi mật khẩu, API secret, access token hoặc private key.
12. Nếu cần secret, chỉ hướng dẫn người dùng tự nhập vào dashboard/secret store.
13. Mỗi lần chỉ hướng dẫn người dùng làm **một bước**; xử lý lỗi hiện tại xong mới sang bước tiếp theo.

---

# 1. BỐI CẢNH KINH DOANH

SERIM là hệ thống kinh doanh đồ uống có nhiều cơ sở và nhiều nhóm làm việc: Core Team, Leader cơ sở, nhân viên, Media/Marketing, Kế toán, Kho/Mua hàng và các nhóm dự án/chiến dịch.

Dự án SERIM WORK sinh ra vì các vấn đề hiện tại:
- Công việc giao trong Zalo/chat dễ bị trôi hoặc khó tìm lại.
- Sau khi giao việc khó biết người nhận đang ở bước nào.
- Chủ/Leader phải tự nhớ và nhắc từng người.
- Không nhìn được tổng thể hôm nay ai đang có việc gì.
- Khó kiểm soát việc quá hạn.
- Công việc định kỳ dễ bị quên.
- Một số việc cần ảnh/file minh chứng khi hoàn thành.
- Một số việc cần Leader/Quản lý duyệt trước khi hoàn thành.
- Cần biết lịch sử ai giao, ai sửa, ai hoàn thành và thời điểm thay đổi.
- Muốn nhìn được mức độ hoàn thành công việc theo người/nhóm.
- Muốn quản lý nhiều nhóm/cơ sở/dự án trong cùng một nơi.
- Muốn nhân sự bớt phụ thuộc vào Leader/chủ để biết tiếp theo phải làm gì.
- Muốn sau này mở rộng thành hệ thống vận hành: checklist, SOP, đào tạo, báo sự cố, kiểm kho...
- Muốn mỗi người tự tạo To-do cho chính mình để tự quản lý công việc.
- Muốn tag người liên đới để họ cùng biết, cùng theo dõi và trao đổi.

**Mục tiêu 3 tháng đầu:**  
> Giao việc – nhận việc – hoàn thành rõ ràng, không trôi.

**Phạm vi đầu tiên:**  
> Core Team.

**Số người dự kiến dùng trong 6 tháng đầu:**  
> Khoảng 6 người, nhưng kiến trúc phải mở rộng được khoảng 5–20 người và hơn nếu cần.

---

# 2. THIẾT BỊ VÀ THÓI QUEN SỬ DỤNG

Thiết bị có thể dùng:
- iPhone
- Android
- tablet
- một số người có máy tính

Nhưng nhân viên chủ yếu dùng **100% điện thoại**.

Mức độ công nghệ:
> Trung bình – quen Zalo và app cơ bản.

Màn hình mở app mặc định:
> **VIỆC CỦA TÔI**

Yêu cầu UX:
- mobile-first
- ít bước
- nút lớn, dễ hiểu
- nhân viên mới gần như không cần hướng dẫn
- ưu tiên danh sách việc hơn dashboard phức tạp
- phải chạy tốt trên iPhone và Android

---

# 3. NGÂN SÁCH VÀ NGUỒN LỰC

**Ngân sách vận hành tối đa:**  
> Dưới 3.000.000đ/năm.

**Nguồn lực:**  
> Muốn tự làm cùng AI, tránh thuê đội code nếu không cần.

Ưu tiên:
- dùng free tier nếu đủ
- ít bảo trì
- tránh dịch vụ có phí cố định cao
- không phụ thuộc OA OpenAPI ở phiên bản đầu

---

# 4. KIẾN TRÚC KỸ THUẬT ĐÃ CHỌN

```text
Zalo Mini App
    ↓
Cloudflare Workers
    ↓
Cloudflare D1
    ↓
Cloudflare R2
```

Vai trò:
- **Zalo Mini App**: giao diện người dùng trên Zalo
- **Cloudflare Workers**: backend/API
- **Cloudflare D1**: database quan hệ
- **Cloudflare R2**: lưu ảnh/PDF/file minh chứng

Lý do chọn:
- chi phí thấp
- phù hợp quy mô 5–20 người
- ít vận hành server
- phù hợp dữ liệu quan hệ
- dễ mở rộng
- tránh chi phí cố định vượt ngân sách

---

# 5. TRẠNG THÁI TRIỂN KHAI HIỆN TẠI

## 5.1 Zalo

Đã có Zalo App cha:
> **SERIM**

Đã tạo Zalo Mini App:
> **SERIM WORK**

Trạng thái:
> **DEV**

Loại hình sở hữu:
> Doanh nghiệp/Hộ kinh doanh

Danh mục:
- Chính: **Khác**
- Phụ: **Khác**

Tên Mini App:
> SERIM WORK

Mô tả Mini App:
> Ứng dụng quản lý công việc nội bộ dành cho đội ngũ SERIM, hỗ trợ tạo và theo dõi công việc, phân công, phối hợp theo nhóm, checklist và kiểm soát tiến độ.

## 5.2 Cloudflare

Đã tạo D1 database:
> `serim-work-db`

Trạng thái cuối cùng ghi nhận:
- Database đã được tạo thành công.
- Đang ở D1 Console.
- Đã chuẩn bị/chạy SQL prototype.
- **Bước tiếp theo phải kiểm tra xem 6 bảng prototype đã tồn tại chưa trước khi làm tiếp.**

Không đưa email tài khoản, token hoặc secret vào source code.

---

# 6. NGUYÊN TẮC NGHIỆP VỤ LÕI

SERIM WORK **không chỉ là hệ thống giao việc**.

Một task có thể sinh ra theo 4 nguồn:

1. **Tự tạo**  
   Người dùng tự tạo việc cho chính mình.

2. **Được giao**  
   Một người tạo và giao cho người khác.

3. **Hệ thống tự sinh**  
   Từ quy tắc định kỳ.

4. **Sinh từ cấu trúc khác**  
   Từ việc con, chuỗi phụ thuộc hoặc dự án.

Đây là nguyên tắc database lõi.

---

# 7. VAI TRÒ TRONG MỘT TASK

Một task có thể có 5 vai trò:

## 7.1 Người tạo
Người tạo bản ghi task.

## 7.2 Người chịu trách nhiệm chính
Người chịu trách nhiệm để task được hoàn thành.

## 7.3 Người phối hợp
Người có trách nhiệm tham gia thực hiện.

## 7.4 Người theo dõi
- không chịu trách nhiệm hoàn thành
- được xem
- được bình luận
- được thêm ảnh/file
- được theo dõi tiến độ

## 7.5 Người duyệt
Người quyết định task đạt hay cần sửa.

Khi tag một người vào task:
> phải chọn rõ **Phối hợp** hoặc **Theo dõi**.

Không tự động đánh đồng hai vai trò.

---

# 8. CHỨC DANH VÀ QUYỀN HỆ THỐNG

Phải tách hai khái niệm:

## 8.1 Chức danh
Ví dụ:
- Media
- Kế toán
- Kho
- Barista
- Quản lý cửa hàng

## 8.2 Quyền
Ví dụ:
- Thành viên
- Leader
- Quản lý
- Chủ

Quyền phải gắn theo nhóm.

Ví dụ:
- Huy + Hà Đông = Leader
- Huy + Core Team = Thành viên
- Huy + Dự án Mùa Thu = Thành viên

Không gắn cứng:
> Huy = Leader toàn hệ thống.

---

# 9. NHÓM VÀ DỰ ÁN

Các loại nhóm:
- Cơ sở
- Bộ phận/chức năng
- Core Team
- Dự án có thời hạn
- Chiến dịch tạm thời
- Đào tạo
- Nhóm tạm

Một người:
> có thể thuộc nhiều nhóm.

Ai được tạo nhóm:
> Chủ + Quản lý + Leader.

Một task:
- có 1 nhóm chính
- có thể gắn dự án/chiến dịch
- có nhãn/loại việc

Không cho 1 task có nhiều nhóm chính song song.

---

# 10. TO-DO CÁ NHÂN

Người dùng có thể tự tạo việc cho mình mà **không cần người giao**.

Task cá nhân có thể:
- không thuộc nhóm
- thuộc nhóm
- thêm người xem
- thêm người phối hợp
- thêm người theo dõi

Phạm vi nhìn thấy:
> mỗi lần tạo việc, người dùng được chọn.

---

# 11. QUYỀN NHÌN THẤY

Các phạm vi hiển thị đã chốt:
- những người liên quan đến task
- cả nhóm
- một số người được chọn

Không mặc định toàn công ty.

**Chủ:**
> có quyền quản trị xem toàn bộ dữ liệu hệ thống.

**Quản lý/Leader:**
> xem theo phạm vi quyền và nhóm.

Dashboard có thể hiển thị số liệu tổng hợp mà không nhất thiết lộ nội dung riêng tư ngoài quyền.

---

# 12. TRẠNG THÁI TASK

Trạng thái chính:

```text
Chưa làm
Đang làm
Chờ người khác
Chờ duyệt
Cần sửa
Hoàn thành
Tạm dừng
Hủy
```

“Quá hạn” **không phải trạng thái**.

Công thức:

```text
now > due_at
AND status NOT IN ('done','cancelled')
=> overdue = true
```

Task có thể đồng thời:
- Đang làm
- Khẩn
- Quá hạn

---

# 13. MỨC ĐỘ ƯU TIÊN

4 mức:

```text
low
normal
high
urgent
```

Hiển thị tiếng Việt:
- Thấp
- Bình thường
- Cao
- Khẩn

---

# 14. DEADLINE

Deadline có thể:
- chỉ có ngày
- ngày + giờ

Không phải task nào cũng bắt buộc deadline.

Quy định:
- người làm không tự sửa deadline
- muốn đổi phải gửi yêu cầu gia hạn
- yêu cầu gia hạn bắt buộc có lý do
- cho phép gia hạn nhiều lần

Mỗi lần phải lưu:
- deadline cũ
- deadline mới
- lý do
- người yêu cầu
- người duyệt
- thời gian duyệt
- kết quả

---

# 15. DUYỆT / TRẢ LẠI

Nếu task không cần duyệt:

```text
người chính bấm hoàn thành
→ Hoàn thành
```

Nếu cần duyệt:

```text
người chính gửi hoàn thành
→ Chờ duyệt
```

Người duyệt:
- đạt → Hoàn thành
- không đạt → Cần sửa

Khi trả lại:
> bắt buộc nhập lý do.

Một người vừa phối hợp vừa duyệt:
> tùy loại việc.

---

# 16. CHECKLIST VÀ VIỆC CON

Checklist:
- là bước nhỏ
- không phải task độc lập
- không cần người chịu trách nhiệm riêng

Việc con:
- là task độc lập
- có người phụ trách
- có deadline
- có trạng thái
- có thể có checklist riêng

Task cha:
> không được hoàn thành nếu còn bất kỳ việc con nào chưa đóng.

Việc con được coi là đóng khi:
- Hoàn thành
- hoặc Hủy hợp lệ

Nếu hủy việc con:
- bắt buộc nhập lý do
- không còn chặn task cha

---

# 17. NGƯỜI PHỐI HỢP CÓ PHẦN VIỆC THẬT

Nếu người phối hợp có phần việc bắt buộc phải hoàn thành:
> phải tạo việc con hoặc phần việc độc lập.

Không dùng “phối hợp” như trách nhiệm mơ hồ.

---

# 18. TASK PHỤ THUỘC

Ví dụ:

```text
A. Chốt công thức
↓
B. Chụp ảnh
↓
C. Thiết kế menu
```

Khi A chưa xong:
- B bị khóa
- hiển thị rõ bị chặn bởi task nào

Khi A xong:
- B tự mở

Nếu A trễ:
- không tự dời deadline B/C
- cảnh báo quản lý
- quản lý chọn giữ hoặc dời deadline task phía sau

---

# 19. CÔNG VIỆC ĐỊNH KỲ

Rule định kỳ là “máy tạo task”.

Có thể hỗ trợ:
- hàng ngày
- ngày cố định trong tuần
- hàng tuần
- hàng tháng
- ngày cố định trong tháng
- mỗi N ngày
- theo ca

Phiên bản đầu:
> chưa tự đọc lịch ca.

Mỗi kỳ:
> sinh một task riêng.

Không reset task cũ.

Ví dụ:

```text
25/09 → task 1
26/09 → task 2
27/09 → task 3
```

Chống trùng:
> một recurrence rule + một occurrence chỉ được sinh đúng 1 task.

Cần unique key:

```text
(rule_id, occurrence_key)
```

Nếu kỳ trước chưa xong:
> mỗi rule được cấu hình chính sách riêng: vẫn sinh / không sinh / sinh nhưng cảnh báo.

Nếu sửa rule:
- task đã sinh không đổi
- chỉ kỳ tương lai đổi

Nếu kỳ đó không cần:
> đánh dấu “Bỏ qua kỳ này”, giữ lịch sử.

---

# 20. NGHỈ PHÉP

Khi người phụ trách nghỉ:
Leader chọn:
- giữ nguyên người phụ trách
- chuyển người
- tạm dừng

Không tự dời deadline.

---

# 21. ĐỔI NGƯỜI PHỤ TRÁCH

Cho phép đổi trực tiếp.

Bắt buộc:
- lưu người cũ
- lưu người mới
- bắt buộc nhập lý do
- ghi ai đổi
- ghi thời gian

Áp dụng cả trường hợp giao nhầm.

---

# 22. NGƯỜI RỜI NHÓM

Nếu còn task mở:
Leader phải xử lý từng task:
- giữ người cũ
- chuyển người
- hủy

Không tự động suy đoán.

---

# 23. HẠ QUYỀN

Nếu người đang là Leader bị hạ quyền:
Quản lý phải chọn:
- giữ quyền tạm thời với task cũ
- hoặc chuyển sang Leader mới

---

# 24. NGƯỜI TẠO NGHỈ VIỆC

Không đổi lịch sử người tạo.

Ví dụ:
- Thư tạo task
- sau đó Thư nghỉ

Task vẫn ghi:
> người tạo = Thư

Tài khoản bị khóa.
Quyền quản lý task chuyển cho người phù hợp.

---

# 25. TASK RIÊNG TƯ CỦA NGƯỜI NGHỈ VIỆC

Chủ chọn:
- giữ riêng tư
- chuyển quyền
- lưu trữ

---

# 26. ĐÓNG NHÓM / DỰ ÁN

Nếu còn task mở:
> không cho đóng ngay.

Phải xử lý từng task:
- hoàn thành
- chuyển nhóm khác
- hủy

Sau đó:
- đóng nhóm
- đưa vào kho lưu trữ
- giữ lịch sử

---

# 27. TASK RIÊNG TƯ ĐƯA VÀO DỰ ÁN

Không tự công khai.

Hệ thống phải hỏi lại:
- giữ riêng tư
- người liên quan
- cả nhóm/dự án

---

# 28. XÓA DỮ LIỆU

Không xóa vật lý dữ liệu nghiệp vụ.

Nút “Xóa” thực tế:
> soft delete / archive.

Áp dụng:
- task
- group
- project
- user

Nhân viên nghỉ:
> khóa tài khoản.

---

# 29. BÌNH LUẬN

Task có bình luận riêng.

Hỗ trợ:
- text
- @tag

Người theo dõi:
- xem
- bình luận
- thêm ảnh/file

---

# 30. FILE

MVP ưu tiên:
- ảnh
- PDF
- link

File văn phòng khác:
> để sau.

Lưu trữ:
> tùy loại việc có retention khác nhau.

---

# 31. THÔNG BÁO

Các event cần sinh:
- được giao việc
- được tag
- sắp đến hạn
- quá hạn
- được @ trong bình luận
- task mình giao hoàn thành
- task chờ mình duyệt
- yêu cầu gia hạn
- kết quả gia hạn
- task phụ thuộc đã mở khóa

Notification event:
> tách khỏi kênh gửi.

Kênh:
- in-app
- Zalo OA sau này
- kênh khác

Không phụ thuộc OA.

Người dùng:
> có mặc định chung nhưng có thể tự tắt/bật loại thông báo.

---

# 32. NHẮC HẠN

Có:
- mốc mặc định
- mốc tùy task

Quá hạn:
> có thể nhắc lại.

Người dùng:
> có thể tắt nhắc lặp.

---

# 33. DASHBOARD

Màn hình đầu:
> VIỆC CỦA TÔI

Hiển thị gộp tất cả task mọi nhóm.
Có nhãn nhóm.
Có bộ lọc.

Ưu tiên hiển thị:
1. Quá hạn
2. Khẩn
3. Sắp đến hạn
4. Hôm nay
5. Còn lại

Người dùng:
> được đổi cách sắp xếp.

Dashboard quản lý:
- tổng task hôm nay
- tỷ lệ hoàn thành
- task quá hạn
- theo người
- theo nhóm
- chờ duyệt
- task hay bị trễ/làm lại
- xu hướng tuần/tháng

Không tự chấm điểm người.
Không xếp hạng.

---

# 34. BÁO CÁO

Phải phân biệt:
- việc được giao
- việc nhóm
- việc định kỳ
- To-do tự tạo
- To-do tự tạo đánh dấu là công việc

Không lấy số lượng task đơn thuần làm hiệu suất.

---

# 35. OFFLINE

MVP:
> chỉ offline-read.

Khi mất mạng:
- xem dữ liệu gần nhất đã tải

Chưa làm:
- đổi trạng thái offline
- comment offline
- upload ảnh offline
- merge conflict phức tạp

---

# 36. CONCURRENCY

Nếu 2 người sửa khác trường:
> giữ cả hai thay đổi.

Nếu sửa cùng một trường:
> cảnh báo conflict và yêu cầu reload.

Cần:
- version number
- optimistic concurrency

---

# 37. ACTIVITY LOG

Bắt buộc.

Phải ghi:
- tạo task
- đổi người
- đổi deadline
- đổi status
- đổi priority
- sửa nội dung
- thêm/xóa file
- duyệt
- trả lại
- mở lại
- archive
- đổi quyền xem
- đổi nhóm
- đổi role
- lý do thay đổi

Activity Log nên gần như immutable.

---

# 38. KẾT QUẢ KHẢO SÁT BAN ĐẦU

## Mục tiêu
- Giao việc rõ
- Không trôi
- Có tiến độ
- Có deadline
- Có quá hạn
- Có định kỳ
- Có minh chứng
- Có duyệt
- Có lịch sử
- Có báo cáo
- Có nhiều nhóm
- giảm phụ thuộc Leader
- mở rộng thành hệ thống vận hành

## Vai trò
- Chủ
- Quản lý chuỗi
- Leader
- Nhân viên
- Media/Marketing
- Kế toán
- Kho/Mua hàng

Một người:
> có thể nhiều vai trò.

## Nhóm
- cơ sở
- bộ phận
- core team
- dự án
- chiến dịch
- đào tạo

## Tạo nhóm
> Chủ + Quản lý + Leader.

## Nghỉ việc
> giữ lịch sử, khóa tài khoản.

## Chuyển nhóm
> giữ bối cảnh lịch sử cũ.

---

# 39. KẾT QUẢ 22 STRESS TEST

## 1. To-do cá nhân thêm người chỉ theo dõi
Người đó là follower, không biến thành collaborator.

## 2. Người phụ trách nghỉ phép
Leader chọn giữ / chuyển / tạm dừng.

## 3. Recurring task kỳ cũ chưa xong
Mỗi recurrence rule tự cấu hình chính sách.

## 4. Đổi người phụ trách khi đang làm
Đổi ngay + giữ lịch sử + bắt buộc lý do.

## 5. Gia hạn nhiều lần
Cho phép nhiều lần, giữ full history.

## 6. Task hoàn thành rồi phát hiện lỗi
Người có quyền chọn mở lại task cũ hoặc tạo task mới.

## 7. Người tạo nghỉ việc
Giữ creator gốc, chuyển quyền quản lý.

## 8. Task riêng tư đưa vào dự án
Hỏi lại visibility.

## 9. Task dependency bị chậm
Cảnh báo quản lý, cho chọn giữ/dời deadline task sau.

## 10. Giao nhầm người
Đổi trực tiếp + giữ lịch sử + bắt buộc lý do.

## 11. Người phối hợp chưa xong
Nếu có phần việc bắt buộc thì phải tách thành subtask.

## 12. Một người vừa phối hợp vừa duyệt
Tùy loại việc.

## 13. Task cha còn subtask chưa xong
Không được hoàn thành.

## 14. Subtask bị hủy
Bắt buộc lý do; không chặn task cha.

## 15. Follower không muốn nhận tất cả notification
Có mặc định chung, user được bật/tắt.

## 16. Người rời nhóm còn task
Leader xử lý từng task.

## 17. Task riêng tư của người nghỉ
Chủ chọn giữ/chuyển/lưu trữ.

## 18. Đóng project còn task
Phải xử lý từng task trước khi đóng.

## 19. Leader bị hạ quyền
Quản lý chọn giữ quyền tạm/chuyển leader mới.

## 20. Hai người cùng sửa
Khác field thì merge; cùng field thì conflict.

## 21. Recurring sinh trùng
Chặn tuyệt đối bằng unique key.

## 22. Một người nhiều nhóm
“Việc của tôi” gộp tất cả, có filter theo group.

---

# 40. DATABASE LOGIC v1.0

Các bảng mục tiêu đầy đủ:

```text
users
job_titles
groups
group_members
projects
tasks
task_participants
task_visibility_users
task_types
task_checklist_items
task_dependencies
recurrence_rules
recurrence_instances
task_comments
comment_mentions
attachments
deadline_change_requests
task_approvals
notifications
notification_preferences
activity_logs
user_leave_periods
```

---

# 41. SCHEMA LOGIC CHI TIẾT

## users

```text
id
zalo_user_id
employee_code
display_name
job_title_id
status
created_at
updated_at
```

status:
```text
active
leave
locked
left
```

## job_titles

```text
id
name
created_at
```

## groups

```text
id
name
type
status
created_by
created_at
archived_at
```

## group_members

```text
id
group_id
user_id
role
is_active
joined_at
left_at
```

role:
```text
member
leader
manager
owner
```

Unique:
```text
(group_id, user_id)
```

## projects

```text
id
name
status
owner_id
start_at
end_at
created_at
archived_at
```

## tasks

```text
id
title
description
source_type
creator_id
responsible_user_id
primary_group_id
project_id
parent_task_id
task_type_id
status
priority
start_at
due_at
due_has_time
visibility_mode
requires_approval
completed_at
cancelled_at
cancelled_reason
archived_at
version
created_at
updated_at
```

source_type:
```text
self
assigned
recurring
subtask
system
```

status:
```text
todo
doing
waiting
pending_approval
needs_revision
done
paused
cancelled
```

priority:
```text
low
normal
high
urgent
```

visibility_mode:
```text
participants
group
custom
private
```

## task_participants

```text
id
task_id
user_id
role
created_at
```

role:
```text
collaborator
follower
approver
```

Primary responsible user để trực tiếp trong `tasks.responsible_user_id`.

## task_visibility_users

```text
task_id
user_id
```

## task_types

Cấu hình:
- deadline có bắt buộc không
- cần approval không
- collaborator có được là approver không
- default reminder
- default visibility
- các quy tắc theo loại việc

## task_checklist_items

```text
id
task_id
content
is_done
done_by
done_at
sort_order
```

## task_dependencies

```text
id
blocking_task_id
blocked_task_id
created_at
```

Không cho circular dependency.

## recurrence_rules

```text
id
name
schedule_type
schedule_config
generation_policy
overlap_policy
skip_policy
template_data
is_active
created_by
created_at
updated_at
```

## recurrence_instances

```text
id
rule_id
occurrence_key
task_id
created_at
```

Unique:
```text
(rule_id, occurrence_key)
```

## task_comments

```text
id
task_id
user_id
content
created_at
edited_at
```

## comment_mentions

```text
comment_id
user_id
```

## attachments

```text
id
task_id
comment_id
uploaded_by
file_name
file_type
storage_key
file_url
created_at
archived_at
```

## deadline_change_requests

```text
id
task_id
old_due_at
requested_due_at
reason
requested_by
reviewed_by
status
reviewed_at
created_at
```

status:
```text
pending
approved
rejected
```

## task_approvals

```text
id
task_id
submitted_by
approver_id
status
reason
created_at
reviewed_at
```

## notifications

```text
id
user_id
event_type
task_id
payload
read_at
created_at
```

## notification_preferences

```text
user_id
event_type
enabled
reminder_offset
updated_at
```

## activity_logs

```text
id
actor_user_id
entity_type
entity_id
action
before_data
after_data
reason
created_at
```

## user_leave_periods

```text
id
user_id
start_at
end_at
status
created_at
```

---

# 42. PROTOTYPE — PHẠM VI BẮT BUỘC

Prototype chỉ dùng:
- 2 user
- 1 group

Phải chứng minh:
1. nhận diện đúng user A
2. nhận diện đúng user B
3. user A tự tạo To-do
4. user A giao task cho user B
5. user B nhìn thấy trên điện thoại
6. user B đổi status
7. user A thấy update
8. user B chụp/tải ảnh
9. user A xem ảnh
10. user không có quyền không thấy task
11. đóng/mở Mini App không mất dữ liệu
12. test iPhone
13. test Android
14. test 4G
15. test Wi‑Fi
16. test basic conflict

Prototype PASS khi:
- không nhầm user
- không lộ task
- sync đúng
- ảnh lên được
- thao tác mobile đơn giản
- reload ổn
- không có bug nghiêm trọng

---

# 43. DATABASE PROTOTYPE TỐI THIỂU

6 bảng:

```text
users
groups
group_members
tasks
attachments
activity_logs
```

SQL prototype dự kiến:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zalo_user_id TEXT UNIQUE,
  employee_code TEXT UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','leave','locked','left')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'team',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','archived')),
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  archived_at TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member','leader','manager','owner')),
  is_active INTEGER NOT NULL DEFAULT 1,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at TEXT,
  UNIQUE (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'self'
    CHECK (source_type IN ('self','assigned','system')),
  creator_id INTEGER NOT NULL,
  responsible_user_id INTEGER NOT NULL,
  group_id INTEGER,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','doing','waiting','done','cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','urgent')),
  visibility_mode TEXT NOT NULL DEFAULT 'participants'
    CHECK (visibility_mode IN ('participants','group','private')),
  due_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id),
  FOREIGN KEY (responsible_user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  uploaded_by INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_key TEXT,
  file_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  before_data TEXT,
  after_data TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_responsible
ON tasks(responsible_user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_creator
ON tasks(creator_id);

CREATE INDEX IF NOT EXISTS idx_tasks_group
ON tasks(group_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_activity_entity
ON activity_logs(entity_type, entity_id);
```

**Lưu ý quan trọng:**
> AI phải kiểm tra schema thực tế đã tồn tại trước khi chạy lại migration.

---

# 44. MVP CORE TEAM

Sau khi prototype PASS, MVP gồm:
- nhận diện user
- group
- group roles
- To-do cá nhân
- giao việc
- collaborator
- follower
- deadline
- priority
- status
- checklist
- comment
- @mention
- ảnh
- PDF
- link
- approval
- revision
- deadline extension
- recurring tasks
- subtasks
- dependencies
- dashboard
- search
- filter
- activity log
- in-app notification
- offline read

---

# 45. CHƯA LÀM TRONG MVP

- upload file khi offline
- sửa status offline
- comment offline
- conflict merge phức tạp
- tự động đọc lịch ca
- OA notification bắt buộc
- SOP
- đào tạo
- báo sự cố
- kiểm kho
- báo cáo sâu
- đa dạng file văn phòng
- tự động hóa sâu

---

# 46. API BACKEND DỰ KIẾN CHO PROTOTYPE

Tối thiểu:

```text
GET  /health
GET  /me
GET  /groups
GET  /tasks
GET  /tasks/:id
POST /tasks
PATCH /tasks/:id
PATCH /tasks/:id/status
POST /tasks/:id/attachments
GET  /tasks/:id/activity
```

Không cần làm full API ngay.

---

# 47. AUTHENTICATION / IDENTITY

Ưu tiên:
> dùng Zalo user identity với ít quyền nhất.

Không muốn:
- email/password riêng nếu không cần
- xin số điện thoại nếu không cần

Có thể dùng:
- Zalo user ID
- kết hợp employee code trong lần đầu nếu cần

Mục tiêu:
> người dùng mở Mini App và được nhận diện đúng.

---

# 48. BẢO MẬT

Không expose:
- D1 direct access
- R2 secret
- Cloudflare API token
- Zalo App Secret

Mini App chỉ gọi:
> Worker API.

Worker:
> kiểm tra identity và permission trước khi query.

Không tin dữ liệu role từ client.

---

# 49. PERMISSION SERVER-SIDE

Tất cả permission phải kiểm tra ở backend.

Không chỉ ẩn nút ở frontend.

Ví dụ:
- user A không được GET task B nếu không có quyền
- Leader chỉ được quản lý group họ có role
- Owner có quyền toàn hệ thống

---

# 50. R2 FILE STORAGE

Dự kiến:
- ảnh/PDF lưu R2
- D1 chỉ lưu metadata

Không lưu blob lớn trực tiếp trong D1.

Storage key gợi ý:

```text
tasks/{task_id}/{uuid}-{filename}
```

---

# 51. MIGRATION STRATEGY

Không sửa database thủ công lung tung.

Sau prototype:
- tạo migration files
- version schema
- migration idempotent nếu có thể
- backup trước migration lớn

---

# 52. DATA RETENTION

Task/history:
> giữ lâu dài trừ khi có quy định khác.

Ảnh/file:
> tùy loại việc.

Cần có khả năng cấu hình retention sau này.

---

# 53. ERROR HANDLING

Frontend:
- thông báo dễ hiểu
- không show raw SQL error cho nhân viên

Backend log:
- request id
- user id
- action
- error code
- timestamp

---

# 54. PERFORMANCE

Quy mô ban đầu:
> 6 user.

Mục tiêu mở rộng:
> 20+ user dễ dàng.

Không over-engineer.

Index ưu tiên:
- responsible_user_id
- group_id
- status
- due_at
- created_at nếu cần

---

# 55. MOBILE UX

Home:
> VIỆC CỦA TÔI

Card task hiển thị:
- title
- group
- deadline
- priority
- status
- overdue badge
- responsible nếu cần
- approval badge nếu có

Nút chính có thể gồm:
- Bắt đầu
- Hoàn thành
- Gửi duyệt
- Bình luận

---

# 56. KHÔNG OVER-ENGINEER

Prototype:
> 6 bảng là đủ.

Không được xây ngay:
- 20 bảng
- full notification engine
- full recurrence engine
- full report system

Chỉ mở rộng khi prototype PASS.

---

# 57. NEXT STEP CHUẨN

Bước ngay sau file này:

1. kiểm tra D1 có 6 bảng prototype chưa
2. nếu chưa → tạo đúng schema
3. tạo Cloudflare Worker
4. bind Worker với D1
5. tạo `/health`
6. tạo `/tasks`
7. test API
8. kết nối Mini App
9. test 2 user thật
10. sau đó mới tạo R2
11. test upload ảnh
12. đánh giá prototype

---

# 58. CÁC QUYẾT ĐỊNH KHÔNG ĐƯỢC AI TỰ Ý THAY

Không được tự đổi các quyết định sau:
- quyền Leader gắn theo nhóm
- Chủ có quyền admin toàn hệ thống
- follower khác collaborator
- task cha không done khi subtask chưa đóng
- cancelled subtask phải có reason
- deadline change phải có request
- deadline history phải giữ
- recurring instance phải chống trùng
- task cũ không bị đổi khi sửa recurrence rule
- user nghỉ không xóa
- group đóng không xóa
- task delete là soft delete
- activity log phải giữ
- overdue không phải status
- task dependency không tự dời deadline
- home là “Việc của tôi”
- MVP chỉ offline-read
- không tự chấm điểm nhân viên
- notification event tách khỏi channel
- không phụ thuộc OA

Nếu cần thay:
> phải nêu rõ lý do và xin xác nhận.

---

# 59. PROMPT MẪU DÙNG FILE NÀY ĐỂ GỌI AI CODE

```text
Bạn đang tiếp tục dự án SERIM WORK.

Hãy đọc toàn bộ file SOURCE OF TRUTH đính kèm và coi đó là nguồn sự thật chính.

Không tự thay đổi các quyết định nghiệp vụ đã chốt.

Mục tiêu hiện tại:
[ghi bước cần làm]

Trước khi code:
1. Tóm tắt ngắn gọn trạng thái hiện tại.
2. Nêu chính xác bước sẽ làm.
3. Kiểm tra bước đó có phù hợp Prototype hay đang nhảy sang MVP.
4. Nếu phù hợp, viết code/file cần thiết.
5. Không yêu cầu tôi tự chọn giữa nhiều kiến trúc nếu không cần.
6. Không yêu cầu tôi gửi secret.
7. Mỗi lần chỉ hướng dẫn tôi làm một bước.
8. Nếu có lỗi, xử lý lỗi hiện tại trước khi sang bước tiếp theo.
```

---

# 60. PROMPT MẪU ĐỂ AI VIẾT CODE WORKER

```text
Dựa trên SOURCE OF TRUTH SERIM WORK v1.0, hãy viết Cloudflare Worker cho Prototype.

Yêu cầu:
- TypeScript
- bind D1
- route /health
- route /tasks
- permission server-side
- không hardcode secret
- code đơn giản
- có error handling
- có activity log
- dùng optimistic concurrency với version
- không xây chức năng ngoài Prototype

Hãy xuất:
1. cấu trúc file
2. code từng file
3. wrangler config
4. migration SQL nếu cần
5. cách test local
6. cách deploy
7. cách test API sau deploy
```

---

# 61. PROMPT MẪU ĐỂ AI VIẾT MINI APP

```text
Dựa trên SOURCE OF TRUTH SERIM WORK v1.0, hãy tạo Prototype Zalo Mini App.

Mục tiêu:
- nhận diện user
- hiển thị Việc của tôi
- tạo To-do
- giao task
- đổi trạng thái
- xem task
- upload ảnh sau khi backend hỗ trợ

Ưu tiên:
- mobile-first
- cực đơn giản
- không over-engineer
- không thêm tính năng ngoài Prototype
- mọi permission enforcement nằm backend
```

---

# 62. TIÊU CHÍ HOÀN THÀNH PROTOTYPE

```text
[ ] Nhận diện đúng user 1
[ ] Nhận diện đúng user 2
[ ] User 1 tự tạo To-do
[ ] User 1 giao task
[ ] User 2 nhìn thấy
[ ] User 2 đổi status
[ ] User 1 thấy sync
[ ] Upload ảnh thành công
[ ] User 1 xem ảnh
[ ] Không lộ task
[ ] Reload không mất dữ liệu
[ ] Test iPhone
[ ] Test Android
[ ] Test 4G
[ ] Test Wi‑Fi
[ ] Basic conflict hoạt động
```

---

# 63. TIÊU CHÍ RA QUYẾT ĐỊNH SAU PROTOTYPE

Nếu PASS:
> xây MVP Core Team.

Nếu FAIL:
> sửa prototype cho đến khi PASS.

Không được:
> bỏ qua lỗi và tiếp tục build full app.

---

# 64. MỤC TIÊU DÀI HẠN

SERIM WORK có thể mở rộng sau này thành:

```text
To-do
Checklist
SOP
Đào tạo
Báo sự cố
Kiểm kho
Đề xuất mua hàng
Quản lý ca
Đánh giá thực thi
Quản lý dự án
Tài liệu nội bộ
```

Nhưng các module này:
> không được nhồi vào Prototype.

---

# 65. KẾT LUẬN

SERIM WORK là hệ thống quản lý công việc nội bộ mobile-first, đặt trọng tâm vào:

1. cá nhân tự quản lý To-do
2. giao việc
3. phối hợp
4. theo dõi
5. deadline
6. lịch sử
7. permission đúng
8. dễ dùng trên điện thoại
9. chi phí thấp
10. mở rộng được

Kiến trúc hiện tại:

```text
Zalo Mini App
→ Cloudflare Worker
→ Cloudflare D1
→ Cloudflare R2
```

Bước kỹ thuật tiếp theo:

```text
KIỂM TRA D1 PROTOTYPE
→ TẠO WORKER
→ BIND D1
→ API /health
→ API /tasks
→ KẾT NỐI MINI APP
→ TEST 2 USER
→ R2
→ TEST ẢNH
→ PROTOTYPE PASS
```

**HẾT SOURCE OF TRUTH v1.0**
