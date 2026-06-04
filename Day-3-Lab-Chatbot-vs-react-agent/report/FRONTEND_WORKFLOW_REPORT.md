# Báo cáo workflow frontend ExamForge AI

## Phạm vi

Đã kết nối workflow thật cho hai chế độ LLM và Agent vào giao diện Next.js +
TypeScript + shadcn/ui hiện có, không thiết kế lại bố cục.

Use case:

- Môn học: Sinh học
- Lớp: 12
- Chủ đề: DNA, gen, mã di truyền và nhân đôi DNA

## Workflow đã triển khai

### Chế độ LLM

- Tạo đề cơ bản từ ngân hàng câu hỏi Sinh học cục bộ.
- Cho phép học sinh chọn đáp án.
- Chấm điểm bằng đáp án đúng có sẵn.
- Hiển thị điểm, giải thích, phản hồi cơ bản và tổng kết ôn tập.
- Không hiển thị lý thuyết bài học, ma trận đề, trace kiểm chứng hoặc trace ReAct.

### Chế độ Agent

- Lấy lý thuyết bằng `getLessonTheory()`.
- Lập ma trận nhận thức bằng `buildExamBlueprint()`.
- Chọn câu hỏi cố định bằng `selectQuestionsByBlueprint()`.
- Kiểm chứng cấu trúc đề bằng `validateExam()`.
- Chấm bài bằng `gradeExam()`.
- Sinh lời khuyên một dòng cho từng câu sai bằng `generateMistakeAdvice()`.
- Sinh tổng kết ôn tập bằng `generateFinalSummary()`.
- Agent được đặt trong context là **giáo viên phổ thông**, không phải giảng viên: phản hồi ưu tiên động viên, nói nhẹ nhàng với học sinh và đưa hướng dẫn từng bước trước khi đi sâu vào kiến thức.
- `AGENT_RULES` quy định rõ các ràng buộc của Agent: không phán xét học sinh, không tự bịa dữ liệu ngoài ngân hàng câu hỏi, luôn giữ blueprint nhận thức và xem điểm số là tín hiệu học tập.
- Chỉ hiển thị trace Suy nghĩ - Hành động - Quan sát trong chế độ Agent.
- Ghi log latency và số trace steps khi tạo đề/chấm bài.

## Cập nhật UI

- Logo ExamForge AI ở header có thể bấm để quay về trang tạo đề.
- Không thay đổi bố cục chính, chỉ nối action quay về trang chủ.
- Toàn bộ text chính của UI đã chuyển sang tiếng Việt.
- Form tạo đề có thêm ô prompt. Prompt được parse rule-based để nhận môn, chủ đề, độ khó và số câu; nếu prompt/chọn form trỏ tới môn hoặc chủ đề chưa có trong JSON thì UI báo "Chưa có dữ liệu môn này" và không tạo đề rỗng.

## Logging So Sánh

Frontend ghi log vào:

```text
logs/frontend-comparison.log
```

Các log chính:

- `generate_exam`: mode, latencyMs, subject, grade, topic, difficulty, questionCount, traceSteps.
- `grade_exam`: mode, latencyMs, score, totalQuestions, percentage.

Log này dùng để điền phần so sánh latency và so sánh LLM Mode với Agent Mode trong báo cáo.

## Quy tắc ma trận đề Agent

Dễ:

- 70% nhận biết
- 20% thông hiểu
- 10% vận dụng
- 0% vận dụng cao

Trung bình:

- 50% nhận biết
- 10% thông hiểu
- 20% vận dụng
- 20% vận dụng cao

Khó:

- 20% nhận biết
- 20% thông hiểu
- 30% vận dụng
- 30% vận dụng cao

Kể cả đề khó vẫn giữ câu nền tảng theo ma trận, vì Agent luôn chọn một phần câu
nhận biết trước khi thêm câu vận dụng cao.

## Dữ liệu

Đã nối thêm các file JSON trong `src/frontend` vào ngân hàng câu hỏi:

- `cau_hoi_trac_nghiem_agent.json`
- `bo_de_on_thi_khoa_hoc_tu_nhien_2026.json`
- `bo_de_on_thi_khoa_hoc_tu_nhien_2026 (1).json`

Workflow lọc câu Sinh học lớp 12 đúng topic DNA/gen/mã di truyền/nhân đôi DNA, normalize về kiểu `Question`, bỏ trùng theo nội dung câu hỏi rồi merge với 24 câu curated ban đầu. Sau khi lọc, nguồn JSON cung cấp 53 câu Biology DNA không trùng.
Ngoài use case chính, hệ thống giữ `allQuestionBank` từ JSON để prompt có thể truy vấn các môn/chủ đề có dữ liệu như Toán, Lý, Hóa, Sinh; các môn/chủ đề chưa có data sẽ bị chặn bằng thông báo thân thiện.

Mỗi câu có:

- id
- subject
- grade
- topic
- level
- questionType
- question
- options A/B/C/D
- correctOption
- explanation
- wrongAdvice

## File chính

- `src/frontend/lib/biology-question-bank.ts`
- `src/frontend/lib/exam-workflows.ts`
- `src/frontend/lib/types.ts`
- `src/frontend/app/page.tsx`
- `src/frontend/components/exam-generator.tsx`
- `src/frontend/components/grading-results.tsx`
- `src/frontend/app/api/log-comparison/route.ts`
- `src/frontend/components/header.tsx`

## Kiểm chứng

Lệnh:

```bash
npm run build
```

Kết quả:

- Build pass.
- TypeScript không báo lỗi.
- Static page generation hoàn tất.

Ghi chú: đã bỏ `next/font/google` khỏi `app/layout.tsx` để project build ổn định
trong môi trường không truy cập được Google Fonts.
