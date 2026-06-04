## 🏛️ Bối cảnh: Tôi là ai?

Tôi là **Nam**, AI Engineer tại **Vin Smart Future**. Nhóm chúng tôi được giao nhiệm vụ phối hợp với Khối Vận Hành của **Xanh SM (GSM)** để tìm kiếm các cơ hội tối ưu hóa bằng trí tuệ nhân tạo. 

Thông qua khảo sát thực địa tại Trung tâm Điều vận Xanh SM Hà Nội, tôi nhận thấy các điều phối viên (Dispatchers) đang gặp một áp lực cực kỳ lớn vào giờ cao điểm, dẫn đến việc rò rỉ hiệu suất điều xe và tăng tỉ lệ khách hàng hủy chuyến. Bài toán tôi mang vào buổi Lab hôm nay đến từ chính quan sát thực tế này.



Dùng **4 Lenses** quét qua vận hành của các công ty thành viên Vingroup.

| #  | Subsidiary / Domain             | Lens             | Mô tả ngắn bài toán                                                                                                                                    |
| -- | ------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1  | **VinFast / V-Green**           | AI-upgrade       | Trợ lý AI đề xuất thời điểm và trạm sạc tối ưu dựa trên pin còn lại, tuyến đường, độ đông trạm, tốc độ sạc và tiện ích xung quanh.                     |
| 2  | **VinFast / Xanh SM**           | Time-consuming   | Tối ưu lịch sạc cho đội xe điện để giảm thời gian xe nằm chờ, tránh quá tải trạm sạc và tăng hiệu suất vận hành.                                       |
| 3  | **Xanh SM**                     | Stakeholder Pain | AI dự đoán ETA và tối ưu điểm đón dựa trên GPS, lịch sử sai lệch định vị, hủy chuyến và phản hồi của khách/tài xế.                                     |
| 4  | **Xanh SM**                     | AI-upgrade       | Trợ lý đa ngôn ngữ cho khách du lịch và tài xế, tự động dịch tin nhắn theo ngữ cảnh chuyến đi như điểm đón, điểm trả, hành lý, sân bay.                |                 |
| 5  | **Vinhomes**                    | Repetitive       | Trợ lý AI hỗ trợ cư dân xử lý hóa đơn, phí dịch vụ, đăng ký thẻ xe/thẻ cư dân và hướng dẫn các thủ tục thường gặp.                                     |                 |
| 6  | **Vinpearl / VinWonders**       | AI-upgrade       | Trợ lý AI cá nhân hóa lịch trình du lịch dựa trên sở thích, nhóm khách, thời gian lưu trú, review, vé đã mua và tiện ích trong khu nghỉ dưỡng.         |
| 7  | **Vinpearl / VinWonders**       | Stakeholder Pain | AI dự đoán luồng khách và gợi ý lịch trình trong công viên để giảm thời gian xếp hàng, tránh khu quá đông và không bỏ lỡ show/sự kiện.                 |
| 8 | **Vinmec**                      | Time-consuming   | Soạn thảo tóm tắt hồ sơ xuất viện bằng cách trích xuất thông tin từ bệnh án điện tử, xét nghiệm và ghi chú bác sĩ thành bản dễ hiểu cho bệnh nhân.     |
| 9 | **Bảo tồn văn hóa / lịch sử**   | Time-consuming   | AI trích xuất thực thể lịch sử từ tư liệu Việt Nam và ánh xạ sang chuẩn CIDOC CRM để liên kết nhân vật, sự kiện, địa điểm, thời gian và nguồn tư liệu. |


┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #1                                      │
│                                                             │
│ Bài toán (1 câu): Trợ lý cá nhân hóa hành trình sạc cho     │
│ người dùng VinFast trong các chuyến đi dài, gợi ý thời điểm │
│ và điểm dừng sạc ít gián đoạn nhất bằng cách kết hợp pin,   │
│ tuyến đường, trạng thái realtime trạm V-Green, tiện ích địa │
│ phương và phản hồi cá nhân của người dùng.                  │
│                                                             │
│ Công ty thành viên: [x] VinFast  [ ] Xanh SM  [ ] Vinhomes  │
│                     [ ] Vinmec   [x] Khác: V-Green          │
│                                                             │
│ Ai đang đau (Actor)? Người dùng VinFast đi xa/du lịch;      │
│ người dùng mới chuyển sang xe điện; tài xế xe điện có hành  │
│ trình dài; đội vận hành trạm sạc V-Green.                  │
│                                                             │
│ Workflow thủ công hiện tại:                                 │
│   1. Người dùng tự theo dõi pin và tuyến đường              │
│   ──> 2. Khi pin thấp mới tìm trạm sạc trên app/bản đồ      │
│   ──> 3. Tự đánh giá trạm nào gần, trống, sạc nhanh         │
│   ──> 4. Di chuyển tới trạm, có thể phải chờ/đổi trạm       │
│   ──> 5. Nếu phải chờ lâu, tự tìm điểm ăn uống/nghỉ ngơi    │
│                                                             │
│ Bước nào tốn thời gian/lỗi nhất? Bước 2-4: quyết định sạc   │
│ thường xảy ra muộn, thiếu thông tin realtime về trạm, dẫn   │
│ đến chờ sạc, đổi trạm hoặc dừng riêng ngoài kế hoạch.       │
│ ⏱ Ước tính: 10-30 phút mất thêm trong chuyến dài nếu chọn   │
│ trạm không tối ưu.                                          │
│                                                             │
│ AI có thể nhảy vào hỗ trợ ở bước nào?                       │
│ Bước 1-4: rule đảm bảo an toàn pin; ML dự đoán thời gian    │
│ chờ/tốc độ sạc; recommender xếp hạng điểm dừng theo tuyến   │
│ đường, độ lệch tuyến, trạng thái realtime, tiện ích địa     │
│ phương và phản hồi cá nhân; LLM chỉ dùng để giải thích.     │
│                                                             │
│ Metric có số:                                               │
│ - Giảm Station Switch Rate từ 12% xuống <5%                 │
│ - Giảm số lần pin xuống dưới 15% trong chuyến dài 30%       │
│ - Successful Recommendation Completion Rate >40%            │
│   tức gợi ý dẫn đến điều hướng + sạc thành công + rating ≥4 │
│ - Metric phụ: tăng Useful Charging Stop Rate từ 25% lên 50% │
│                                                             │
│ Quick Architecture: [ ] No AI  [x] Rule  [x] Predictive ML  │
│                     [x] Recommendation  [x] LLM  [ ] Agent  │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #2                                      │
│                                                             │
│ Bài toán (1 câu): Hệ thống AI dự đoán ETA chính xác hơn và  │
│ đề xuất điểm đón tối ưu cho Xanh SM dựa trên GPS, lịch sử   │
│ sai lệch định vị, hủy chuyến và phản hồi khách/tài xế.      │
│                                                             │
│ Công ty thành viên: [ ] VinFast  [x] Xanh SM  [ ] Vinhomes  │
│                     [ ] Vinmec   [ ] Khác: ________         │
│                                                             │
│ Ai đang đau (Actor)? Khách đặt xe, tài xế Xanh SM, đội vận  │
│ hành điều phối/chăm sóc khách hàng.                         │
│                                                             │
│ Workflow thủ công hiện tại (3-5 bước):                      │
│   1. Khách đặt xe và chọn điểm đón trên app                 │
│   ──> 2. Hệ thống gán tài xế và hiển thị ETA                │
│   ──> 3. Tài xế di chuyển tới vị trí app chỉ định           │
│   ──> 4. Khách/tài xế gọi nhắn để tìm đúng điểm đón         │
│   ──> 5. Chuyến bị trễ, hủy hoặc khách phải đi bộ thêm      │
│                                                             │
│ Bước nào tốn thời gian/lỗi nhất? Bước 3-4: ETA sai, điểm    │
│ đón lệch, tài xế/khách phải liên lạc thủ công.              │
│ ⏱ Ước tính: 3-10 phút/lượt tại khu vực phức tạp như sân bay,│
│ trung tâm thương mại, khu đô thị, cổng trường, bệnh viện.   │
│                                                             │
│ AI có thể nhảy vào hỗ trợ ở bước nào?                       │
│ Bước 1-4: hiệu chỉnh ETA, phát hiện điểm đón hay gây lỗi,   │
│ đề xuất pickup zone tốt hơn và tự sinh hướng dẫn ngắn cho   │
│ khách/tài xế.                                               │
│                                                             │
│ Đo thành công bằng gì (Metric có số)?                       │
│ - Giảm sai số ETA trung bình từ 8 phút xuống < 3 phút       │
│ - Giảm tỷ lệ hủy do chờ lâu/khó tìm điểm đón 15-25%         │
│ - Giảm số cuộc gọi/chat giữa khách và tài xế trước khi đón  │
│ - Tăng tỷ lệ đón đúng vị trí trong lần đầu lên > 85%        │
│                                                             │
│ Quick Architecture: [ ] No AI  [ ] Rule  [x] LLM  [x] Agent │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #3                                      │
│                                                             │
│ Bài toán (1 câu): Trợ lý AI hỗ trợ cư dân Vinhomes xử lý    │
│ hóa đơn, thủ tục, phản ánh dịch vụ và tự động phân loại     │
│ ticket đến đúng bộ phận phụ trách.                          │
│                                                             │
│ Công ty thành viên: [ ] VinFast  [ ] Xanh SM  [x] Vinhomes  │
│                     [ ] Vinmec   [ ] Khác: ________         │
│                                                             │
│ Ai đang đau (Actor)? Cư dân Vinhomes, ban quản lý tòa nhà,  │
│ bộ phận chăm sóc cư dân, kỹ thuật, bảo vệ, kế toán.         │
│                                                             │
│ Workflow thủ công hiện tại (3-5 bước):                      │
│   1. Cư dân có thắc mắc về hóa đơn/thủ tục/sự cố            │
│   ──> 2. Cư dân tìm thông tin trong app hoặc liên hệ BQL    │
│   ──> 3. Nhân viên đọc nội dung và hỏi lại thông tin thiếu  │
│   ──> 4. Nhân viên phân loại và chuyển bộ phận xử lý        │
│   ──> 5. Cư dân chờ phản hồi hoặc phải hỏi lại tiến độ      │
│                                                             │
│ Bước nào tốn thời gian/lỗi nhất? Bước 3-4: đọc thủ công,    │
│ phân loại sai, thiếu thông tin, chuyển nhầm bộ phận.        │
│ ⏱ Ước tính: 5-15 phút/ticket tùy độ phức tạp.               │
│                                                             │
│ AI có thể nhảy vào hỗ trợ ở bước nào?                       │
│ Bước 2-4: hướng dẫn cư dân từng bước, tự động hỏi thông tin │
│ còn thiếu, tóm tắt yêu cầu, phân loại ticket, đánh mức độ   │
│ khẩn cấp và gợi ý phản hồi cho ban quản lý.                 │
│                                                             │
│ Đo thành công bằng gì (Metric có số)?                       │
│ - Giảm thời gian phân loại ticket từ 10 phút xuống < 2 phút │
│ - Tự động xử lý/giải đáp > 50% câu hỏi lặp lại              │
│ - Tăng tỷ lệ chuyển đúng bộ phận lên > 90%                  │
│ - Giảm thời gian phản hồi đầu tiên xuống dưới 1 phút        │
│                                                             │
│ Quick Architecture: [ ] No AI  [ ] Rule  [x] LLM  [x] Agent │
└─────────────────────────────────────────────────────────────┘
