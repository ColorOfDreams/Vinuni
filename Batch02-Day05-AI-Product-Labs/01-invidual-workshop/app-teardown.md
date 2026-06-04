# Workshop Report – MoMo Moni

## 1. Product được chọn

**Sản phẩm:** MoMo – Moni

**AI Feature:** Trợ lý tài chính cá nhân, chatbot hỗ trợ phân tích chi tiêu và tư vấn tài chính.

---

# 2. Promise vs Reality

## Product hứa gì?

Moni được giới thiệu như một trợ lý tài chính AI giúp:

* Theo dõi chi tiêu
* Hỗ trợ quản lý tài chính cá nhân
* Trả lời các câu hỏi liên quan đến tài khoản MoMo
* Đưa ra các gợi ý tài chính phù hợp với người dùng

---

## User được hứa sẽ được giúp là ai?

* Người dùng MoMo
* Người muốn quản lý chi tiêu cá nhân
* Người muốn được tư vấn tài chính đơn giản
* Người cần một trợ lý tài chính luôn sẵn sàng hỗ trợ

---

## Kỳ vọng ban đầu

Tôi kỳ vọng Moni có thể:

* Trả lời các câu hỏi liên quan đến tài khoản và giao dịch
* Hiểu được câu hỏi có lỗi chính tả
* Duy trì ngữ cảnh hội thoại
* Ghi nhớ các thông tin tài chính đã trao đổi trước đó
* Hỗ trợ hội thoại nhiều bước giống một trợ lý AI

---

## Reality khi dùng thật

Moni hoạt động tốt với các câu hỏi đơn giản và rõ ràng.

Tuy nhiên xuất hiện nhiều điểm gãy khi:

* User nhập sai chính tả
* User hỏi tiếp theo ngữ cảnh trước đó
* User quay lại từ một cuộc trò chuyện cũ
* User mong muốn AI nhớ kế hoạch tài chính đã tạo trước đây

---

# 3. Evidence

## Observation 1

Prompt:

> "ban có thể xác nhận xem số tiền trong tài khoản của tôi là bak jdnhiei njoeic kjong"

Hành vi:

* Moni không hỏi lại
* Không cố gắng suy luận ý định
* Trả lời từ chối hỗ trợ

Observation:

Low-confidence path không tồn tại.

---

## Observation 2

Prompt:

> "20 tuổi làm sao để giàu"

Hành vi:

* Moni trả lời được
* Đưa ra lời khuyên tài chính cơ bản

Observation:

Happy path hoạt động khi câu hỏi rõ ràng.

---

## Observation 3

Prompt:

> "tháng này tôi tiêu bao nhiêu tiền rồi"

Hành vi:

* Moni truy xuất dữ liệu giao dịch
* Trả kết quả chính xác

Observation:

Data retrieval hoạt động tốt.

---

## Observation 4

Người dùng quay lại cuộc trò chuyện cũ.

Hành vi:

* Xem được lịch sử
* Không thể tiếp tục trò chuyện

Observation:

Conversation continuity bị đứt gãy.

---

## Observation 5

Trong một phiên chat khác, tôi đã khai báo:

* Thu nhập hàng tháng
* Chi tiêu hàng tháng
* Mục tiêu tiết kiệm

Moni đã lập kế hoạch tài chính.

Sau đó mở cuộc trò chuyện mới:

* Moni không nhớ các thông tin trên
* Người dùng phải nhập lại toàn bộ

Observation:

Không có cross-session memory.

---

# 4. Four Paths

## Happy Path

```text
User hỏi chi tiêu tháng này
↓
Moni hiểu intent
↓
Truy xuất dữ liệu
↓
Hiển thị kết quả
↓
User đạt mục tiêu
```

Kết quả:

* Trả lời nhanh
* Dữ liệu rõ ràng
* User hài lòng

---

## Low-Confidence Path

### Hiện trạng

Không tồn tại.

Khi Moni không chắc chắn:

```text
User nhập sai chính tả
↓
Moni trả lời từ chối
```

Không có:

* Hỏi lại
* Gợi ý
* Xác nhận intent

---

## Failure Path

```text
User muốn hỏi tiếp cuộc trò chuyện cũ
↓
Mở lịch sử chat
↓
Không thể tiếp tục
↓
Phải tạo cuộc trò chuyện mới
↓
Mất toàn bộ ngữ cảnh
```

Impact:

Người dùng mất cảm giác đang sử dụng một trợ lý cá nhân.

---

## Correction Path

### Hiện trạng

Correction gần như không tồn tại.

```text
User hỏi sai
↓
Moni trả lời sai hoặc từ chối
↓
User tự sửa câu hỏi
↓
Moni xử lý lại
```

Không có dấu hiệu cho thấy hệ thống:

* Ghi nhận lỗi
* Học từ correction
* Hỗ trợ correction

---

# 5. Finding → Product Decision

## Finding 1

Khi user nhập câu hỏi có lỗi chính tả hoặc diễn đạt không rõ,

AI trả lời từ chối thay vì xác nhận lại ý định,

hậu quả là user không biết lỗi nằm ở cách hỏi hay ở giới hạn tính năng.

Layer:

* Intent
* UX Recovery

Decision:

Thêm low-confidence flow với:

* intent confirmation
* suggested prompts
* multiple choice recovery

---

## Finding 2

Khi user quay lại một cuộc trò chuyện cũ,

hệ thống chỉ cho xem lịch sử nhưng không cho tiếp tục hội thoại,

hậu quả là toàn bộ ngữ cảnh bị mất.

Layer:

* UX
* Conversation Design

Decision:

Cho phép tiếp tục cuộc trò chuyện từ lịch sử chat thay vì chỉ đọc lại.

---

## Finding 3 (Quan trọng nhất)

Khi user đã cung cấp thông tin tài chính như:

* thu nhập
* chi tiêu
* mục tiêu tiết kiệm

trong một phiên chat trước,

AI không sử dụng lại các thông tin này ở phiên mới,

hậu quả là user phải nhập lại từ đầu và không cảm thấy đang sử dụng một trợ lý tài chính cá nhân.

Layer:

* Memory
* Personalization
* Product Architecture

Decision:

Triển khai memory có kiểm soát cho các dữ liệu tài chính do người dùng chủ động cung cấp.

Ví dụ:

> Bạn từng chia sẻ mức thu nhập khoảng 8 triệu/tháng. Bạn có muốn sử dụng thông tin này để lập kế hoạch tiếp không?

---

# 6. As-Is Sketch

```text
User
↓
Nhập câu hỏi

↓
Moni

├─ Hiểu đúng
│  ↓
│  Trả lời
│
└─ Không hiểu
   ↓
   Từ chối

User
↓
Tự đoán
↓
Tự hỏi lại
```

Điểm gãy:

* Không có clarification
* Không có recovery
* Không có memory

---

# 7. To-Be Sketch

```text
User
↓
Nhập câu hỏi

↓
Moni

├─ Hiểu đúng
│  ↓
│  Trả lời
│
└─ Không chắc
   ↓
   Hỏi xác nhận

   ├─ Ý 1
   ├─ Ý 2
   └─ Ý 3

↓
User chọn

↓
Moni tiếp tục xử lý

↓

Memory Layer

Lưu:
- Thu nhập
- Mục tiêu
- Kế hoạch tài chính

↓

Phiên sau

↓

Đề xuất sử dụng lại dữ liệu
```

---

# 8. SPEC Change

Nếu áp dụng finding này vào SPEC sản phẩm:

1. Bổ sung Low-Confidence Recovery Flow.
2. Cho phép tiếp tục hội thoại từ lịch sử chat.
3. Thêm Cross-Session Memory cho dữ liệu tài chính được người dùng cho phép lưu.
4. Bổ sung Intent Confirmation khi độ tin cậy của AI thấp.

Đây là thay đổi có tác động trực tiếp đến trải nghiệm trợ lý tài chính cá nhân của Moni hơn bất kỳ thay đổi giao diện nào.
