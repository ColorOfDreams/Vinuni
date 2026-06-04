# Evidence Pack — AI Travel Planning Assistant

Nộp kèm thin SPEC cuối Day 05.

---

## 1. Nhóm và track

**Tên nhóm:** ColorOfDreams  
**Track:** AI Travel / Planning Assistant  
**Product/app đã chọn:** ChatGPT/Gemini + workflow app travel trên điện thoại; tham khảo thêm Layla AI Trip Planner và Tripadvisor Trips/TripBuilder.  
**Build slice đang nghĩ:** AI Travel Planning Assistant cho chuyến đi ngắn ngày 3 ngày 2 đêm, xuất phát từ khu vực đồng bằng sông Hồng như Hưng Yên/Hà Nội, đi một cung biển miền Bắc hoặc Bắc Trung Bộ bằng ô tô tự lái hoặc xe máy.

Build slice cụ thể:

```text
User nhập ý định đi chơi → AI hỏi làm rõ nhu cầu → đề xuất tối đa 2–3 cung phù hợp → user chọn 1 cung → AI tạo lịch trình 3 ngày 2 đêm có timeline, chi phí ước tính, mức độ mệt, điểm cần kiểm chứng và nút chỉnh nhanh.
```

---

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Khi dùng ChatGPT/Gemini để yêu cầu thiết kế chuyến đi 3 ngày 2 đêm, nếu đưa context khá đầy đủ như điểm xuất phát, phương tiện, thời gian, hướng biển miền Bắc/miền Trung, AI lập tức trả về lượng thông tin rất lớn. Có nhiều option nhưng dễ gây loạn, user phải tự lọc lại. | Screenshot ChatGPT/Gemini | Low-confidence | AI không chỉ cần trả lời nhiều, mà cần giúp user ra quyết định từng bước. Output nên được chia theo flow: hỏi rõ nhu cầu → đề xuất 2–3 hướng → chốt 1 cung → mới tạo lịch trình chi tiết. |
| ChatGPT/Gemini có thể tạo lịch trình nhanh, nhưng thông tin như chi phí, thời gian di chuyển, chất lượng địa điểm, giờ mở cửa, thời tiết hoặc điều kiện thực tế chưa được kiểm chứng chắc chắn. | Screenshot phần lịch trình/chi phí | Low-confidence / Failure | User khó tin vào lịch trình nếu AI không ghi rõ phần nào chắc chắn, phần nào cần kiểm tra lại. Cần có cơ chế đánh dấu độ tin cậy hoặc “cần xác minh”. |
| Khi AI đưa nhiều option cùng lúc, lịch trình dễ bị thay đổi giữa chừng. AI chưa hỏi kỹ những constraint quan trọng như người đi là ai, thích nghỉ dưỡng hay khám phá, có muốn chạy xe dài không, ngân sách/người, mức chịu mệt, có cần biển vắng hay biển đông vui. | Screenshot đoạn AI đưa nhiều option | Correction | Travel planning cần bước clarify trước khi generate. Nếu thiếu câu hỏi làm rõ, AI dễ tạo plan không khớp nhu cầu thật. |
| AI thường đưa thông tin chung chung về điểm đến, chưa làm nổi bật “core experience” của từng khu vực, ví dụ nơi đó đáng đi vì biển vắng, hải sản, đường ven biển, check-in, nghỉ dưỡng hay khám phá. | Screenshot câu trả lời chung chung | Failure | User không chỉ cần danh sách địa điểm, mà cần hiểu bản chất của từng cung để chọn đúng mood chuyến đi. |
| Khi kiểm tra một số app du lịch trên điện thoại, nhóm chưa thấy app nào hỗ trợ tạo lịch trình cụ thể theo context cá nhân như ChatGPT/Gemini. Các app chủ yếu hỗ trợ tìm kiếm địa điểm, khách sạn, vé, review hoặc booking. | Screenshot app travel | Failure / Opportunity | Có khoảng trống sản phẩm: app travel có dữ liệu thật nhưng thiếu AI planning layer; chatbot AI có khả năng lập plan nhưng thiếu dữ liệu kiểm chứng và workflow ra quyết định. |
| Khi dùng thử/tham khảo Tripadvisor TripBuilder, nhóm thấy mô hình trip workspace giúp gom địa điểm và ý tưởng chuyến đi tốt hơn dạng chatbot thuần. Tuy nhiên, user vẫn cần một flow rõ để biến các địa điểm đó thành lịch trình có thể đi thật. | Screenshot Tripadvisor TripBuilder | Happy / Opportunity | Travel planning không chỉ là generate câu trả lời, mà cần một không gian tổ chức plan: lưu địa điểm, xếp timeline, chỉnh sửa và kiểm chứng trước khi đi. |
| Khi tham khảo Layla AI Trip Planner, nhóm thấy sản phẩm đã đi theo hướng AI travel agent: hỏi ngày đi, điểm đến, budget, travel style và tạo day-by-day plan. | Screenshot Layla | Happy / Competitor evidence | Thị trường đã có AI trip planner chuyên biệt. Nhóm không nên nói “chưa ai làm”, mà nên tập trung vào lát cắt hẹp hơn: chuyến đi trốn 3 ngày 2 đêm từ Hưng Yên/Hà Nội, ít quá tải, có kiểm chứng, dễ chỉnh. |

---

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| “Tìm chỗ đi thì dễ, nhưng không biết nên đi theo thứ tự nào cho hợp lý.” | Phỏng vấn nhanh / giả định cần kiểm chứng | Sinh viên/người trẻ muốn đi chơi cuối tuần | Có nhiều địa điểm rời rạc nhưng khó biến thành lịch trình có thể hành động. |
| “AI gợi ý nghe hay nhưng không biết giá có đúng không, đường đi có hợp lý không.” | Phỏng vấn nhanh / giả định cần kiểm chứng | Người dùng ít kinh nghiệm tự lên lịch trình | Thiếu trust. User cần chi phí, thời gian di chuyển và phần cần kiểm chứng. |
| “Mỗi lần đổi ngân sách hoặc đổi lịch trình thì gần như phải hỏi lại từ đầu.” | Self-use observation với ChatGPT/Gemini | User đang planning bằng chatbot | Correction khó. User cần sửa từng phần của plan, không muốn bị regenerate toàn bộ. |
| Tripadvisor Trips giới thiệu việc build trip bằng saved places hoặc dùng AI để lấy custom recommendations, cộng tác với bạn bè và tổ chức trip ideas. | Nguồn public: Tripadvisor Trips | Người dùng đang tổ chức chuyến đi | Pattern: user cần workspace để organize chuyến đi, không chỉ danh sách địa điểm. |
| Layla mô tả sản phẩm là AI trip planner/travel agent có thể tạo itinerary cá nhân hóa theo travel dates, destination, budget và style. | Nguồn public: Layla.ai | Người dùng muốn lập kế hoạch du lịch nhanh | Pattern: AI travel planner nên hỏi context đầu vào và tạo day-by-day plan. |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng phỏng vấn nhanh 3–5 sinh viên trước checkpoint M1 Day 06.
Nhóm sẽ yêu cầu họ thử lên kế hoạch một chuyến đi trốn 3 ngày 2 đêm từ Hưng Yên/Hà Nội ra biển bằng ô tô hoặc xe máy, sau đó quan sát điểm họ bị kẹt: chọn cung, tính chi phí, sắp xếp tuyến đường, kiểm chứng thông tin hoặc chỉnh lịch trình.
```

---

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| ChatGPT / Gemini | User nhập prompt tự do, AI tạo lịch trình rất nhanh và có thể đưa nhiều option. Tuy nhiên output dễ dài, thiếu kiểm chứng, chưa hỏi kỹ constraint và dễ làm user rối. | LLM mạnh ở generate nhưng cần guardrail: hỏi làm rõ trước, giới hạn số option, đánh dấu độ tin cậy, cho phép sửa từng phần. | Có. Nhóm có thể thiết kế flow hỏi 3–5 câu trước khi generate plan. |
| Layla AI Trip Planner | Sản phẩm định vị là AI trip planner/travel agent. User chia sẻ ngày đi, điểm đến, ngân sách, travel style; AI tạo day-by-day plan và hướng tới flight/hotel/activity/booking. | Travel AI nên có flow planning riêng, không chỉ chatbot trống. Output nên theo ngày, có hoạt động, ăn uống, nơi ở và khả năng chỉnh theo style/budget. | Có một phần. Trong 1 ngày, nhóm làm được flow: input context → tạo itinerary theo ngày. Chưa nên làm booking thật. |
| Tripadvisor Trips / TripBuilder | Cho user build trip từ saved places hoặc dùng AI để lấy custom recommendations, cộng tác với bạn bè và tổ chức trip ideas. | Travel planning cần “trip workspace”: lưu địa điểm, sắp xếp hoạt động, xem lại plan, chỉnh sửa trước khi đi. | Có. Nhóm có thể làm bản đơn giản: timeline 3 ngày 2 đêm + danh sách địa điểm + nút chỉnh plan. |
| Traveloka / Klook / Booking / Agoda | Có dữ liệu thật về phòng, vé, review, giá và booking, nhưng thường thiên về search/booking hơn là lập lịch trình cá nhân hóa từ đầu đến cuối. | Dữ liệu thật rất quan trọng để kiểm chứng plan, nhưng booking app chưa chắc giải quyết bài toán ra quyết định. | Có. Nhóm có thể mock checklist kiểm chứng: giá phòng, thời tiết, giờ mở cửa, thời gian di chuyển, link booking. |
| Google Maps | Mạnh ở địa điểm, review, khoảng cách, đường đi, giờ mở cửa. Nhưng user vẫn phải tự ghép các điểm thành lịch trình theo ngày, ngân sách và mood chuyến đi. | Map/review là nguồn kiểm chứng quan trọng. AI planner nên liên kết với map logic: tuyến đường, thời gian chạy, thứ tự địa điểm. | Có. Nhóm có thể mock route/timeline và thêm trường “cần kiểm tra trên Maps”. |

---

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:

Khi tự dùng ChatGPT/Gemini để lập lịch trình du lịch, AI có thể tạo plan rất nhanh nhưng thường trả lời quá nhiều, thiếu kiểm chứng, chưa hỏi kỹ nhu cầu và dễ làm user rối. Trong khi đó, các app du lịch trên điện thoại có nhiều dữ liệu thật như địa điểm, khách sạn, vé, review, nhưng chưa hỗ trợ tạo lịch trình cá nhân hóa cụ thể. Competitor như Layla và Tripadvisor Trips cho thấy thị trường đã có hướng AI/trip planning, nhưng vẫn còn cơ hội làm một slice hẹp hơn, rõ workflow hơn và bám vào bối cảnh người dùng Việt Nam.

Insight:

User không chỉ gặp vấn đề “không biết đi đâu”.
Thật ra họ cần được hỗ trợ ra quyết định: chọn cung nào phù hợp với mood chuyến đi, biết vì sao nên chọn cung đó, lịch trình có khả thi không, phần nào cần kiểm chứng, và nếu đổi nhu cầu giữa chừng thì sửa lịch trình thế nào mà không phải làm lại từ đầu.

Opportunity:

AI có thể giúp bằng cách đóng vai trò planning layer: hỏi làm rõ trước khi tạo lịch trình, giới hạn số option, giải thích lý do chọn cung, đánh dấu thông tin chưa chắc chắn, và cho phép chỉnh từng phần của lịch trình như ngân sách, mức độ mệt, thời tiết, phương tiện hoặc loại trải nghiệm.
```

---

## 6. Evidence đổi SPEC như thế nào?

- [ ] Đổi user chính.
- [x] Đổi pain statement.
- [x] Đổi build slice.
- [x] Đổi Auto/Aug decision.
- [x] Đổi 4 paths.
- [x] Đổi failure mode.
- [x] Đổi owner/test plan.

Ghi rõ 1–2 thay đổi quan trọng:

```text
Trước evidence, nhóm định làm một chatbot AI gợi ý lịch trình du lịch khá rộng, nơi user nhập nhu cầu và AI trả về plan hoàn chỉnh.

Sau evidence, nhóm đổi thành AI Travel Planning Assistant theo từng bước:
1. Hỏi làm rõ nhu cầu trước.
2. Đề xuất tối đa 2–3 cung phù hợp.
3. Cho user chọn một cung.
4. Tạo lịch trình 3 ngày 2 đêm có timeline, chi phí, độ mệt và điểm cần kiểm chứng.
5. Cho phép chỉnh nhanh từng phần: rẻ hơn, ít mệt hơn, biển vắng hơn, thêm ăn uống, đổi phương tiện hoặc đổi thời tiết xấu.

Lý do:

Self-use cho thấy nếu AI trả lời ngay với quá nhiều option thì user dễ bị quá tải và khó ra quyết định. Ngược lại, các app travel hiện tại có dữ liệu thật nhưng chưa giúp user ghép thành lịch trình cá nhân hóa. Competitor như Layla và Tripadvisor TripBuilder cho thấy AI travel planning đã tồn tại, nên nhóm cần tập trung vào khoảng trống cụ thể hơn: một trip planning workflow hẹp, có kiểm chứng, dễ chỉnh và phù hợp với chuyến đi ngắn ngày từ Hưng Yên/Hà Nội.
```

---

## Thin SPEC sau evidence

### Product name

```text
TripEscape AI — Trợ lý lập lịch trình đi trốn ngắn ngày
```

### User chính

```text
Sinh viên/người trẻ ở khu vực Hưng Yên/Hà Nội muốn đi du lịch ngắn ngày 2–3 ngày bằng ô tô tự lái hoặc xe máy, nhưng ít kinh nghiệm tự chọn cung, tính chi phí và sắp xếp lịch trình.
```

### Pain statement

```text
Người dùng không thiếu thông tin về địa điểm du lịch, nhưng bị quá tải khi phải chọn cung, tính chi phí, sắp xếp tuyến đường, kiểm chứng thông tin và chỉnh lịch trình theo thay đổi thực tế.
```

### Build slice

```text
AI tạo lịch trình chuyến đi trốn 3 ngày 2 đêm từ Hưng Yên/Hà Nội ra biển miền Bắc hoặc Bắc Trung Bộ, dựa trên phương tiện, ngân sách, mood chuyến đi và mức chịu mệt.
```

### Auto / Aug decision

```text
Chọn Augment.

AI không tự quyết định hoặc tự đặt chuyến đi thay user. AI hỗ trợ user ra quyết định bằng cách hỏi rõ nhu cầu, đề xuất ít option, giải thích lý do, đánh dấu điểm chưa chắc chắn và cho phép chỉnh nhanh từng phần của plan.
```

### 4 paths

```text
Happy path:
User nhập nhu cầu tương đối rõ: xuất phát Hưng Yên/Hà Nội, đi 3 ngày 2 đêm, ô tô tự lái, muốn biển vắng, ngân sách 2 triệu/người. AI hỏi thêm vài câu, đề xuất 2–3 cung, user chọn một cung, AI tạo timeline chi tiết.

Low-confidence path:
AI thiếu dữ liệu chắc chắn về giá phòng, thời tiết, giờ mở cửa, thời gian di chuyển hoặc tình trạng đường. AI không nói chắc, mà đánh dấu “cần kiểm chứng” và gợi ý user check trên Maps/booking app.

Failure path:
User nhập yêu cầu bất khả thi, ví dụ “3 ngày 2 đêm đi Đà Nẵng bằng xe máy từ Hưng Yên, ngân sách 500k/người, không muốn mệt”. AI cảnh báo không khả thi và đề xuất cung gần hơn như Hải Tiến, Cát Bà, Cô Tô hoặc Hải Hòa.

Correction path:
Sau khi có lịch trình, user nói “rẻ hơn”, “ít chạy xe hơn”, “biển vắng hơn”, “thêm ăn hải sản”, “đổi sang trời mưa”. AI chỉ sửa phần liên quan trong lịch trình, không regenerate toàn bộ từ đầu.
```

### Failure mode chính cần test

```text
AI trả lời quá dài, quá nhiều option, thiếu kiểm chứng, chưa hỏi kỹ nhu cầu và làm user rối hơn thay vì giúp user chốt quyết định.
```

### Test plan M1 Day 06

```text
Test với 3–5 sinh viên/người trẻ.

Task:
Yêu cầu họ dùng prototype để lập một chuyến đi trốn 3 ngày 2 đêm từ Hưng Yên/Hà Nội ra biển bằng ô tô hoặc xe máy.

Quan sát:
1. Họ có hiểu các câu hỏi clarify không?
2. Họ có chọn được một cung trong 2–3 option không?
3. Timeline có đủ rõ để họ tưởng tượng được chuyến đi không?
4. Họ có tin chi phí/thời gian di chuyển không?
5. Khi đổi yêu cầu, prototype có giúp sửa plan dễ hơn chatbot thường không?

Metric:
- Thời gian để chốt một cung.
- Số lần user bị rối hoặc hỏi lại.
- Mức độ tin vào lịch trình: 1–5.
- User có muốn dùng plan này để đi thật không: Yes/No.
```

---

## Ghi chú nguồn public đã tham khảo

- Layla.ai: mô tả sản phẩm là AI trip planner/travel agent, tạo itinerary cá nhân hóa theo ngày đi, điểm đến, ngân sách và travel style.
- Tripadvisor Trips: mô tả việc build trip bằng saved places hoặc dùng AI để lấy custom recommendations, collaborate with friends và organize trip ideas.
- Self-use: nhóm tự dùng ChatGPT/Gemini và một số app travel trên điện thoại để thử lập lịch trình đi chơi.

--- 
## Hình Ảnh

![ChatGPT travel plan](assets/image1.png)

![Gemini travel plan](assets/image.png)

![Layla AI Trip Planner](assets/image2.png)

![Tripadvisor TripBuilder](assets/image4.png)
