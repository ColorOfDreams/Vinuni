# Code Walkthrough: ExamForge AI

## 1. Backend Python Skeleton

### `src/chatbot.py`

`BaselineChatbot` là baseline chatbot thường. Nó gọi một `LLMProvider` trực tiếp, không dùng tool, không có ReAct loop.

Vai trò trong bài:

- Đại diện cho LLM Mode ở mức backend.
- Dùng để so sánh với ReAct Agent.
- Có telemetry qua `tracker.track_request()`.

### `src/agent/agent.py`

`ReActAgent` triển khai vòng lặp:

```text
Thought -> Action -> Observation -> Final Answer
```

Các điểm chính:

- Parse `Final Answer`.
- Parse `Action: tool_name({"key": "value"})`.
- Gọi tool thông qua `func`.
- Log `AGENT_STEP`, `TOOL_CALL`, `PARSER_ERROR`, `TOOL_NOT_FOUND`, `AGENT_TIMEOUT`.
- Giới hạn bằng `max_steps`.

### `src/tools/education_tools.py`

Bộ tool giáo dục mẫu:

- `curriculum_lookup()`: kiểm tra topic có phù hợp lớp/môn.
- `question_generator()`: sinh đề mẫu.
- `score_validator()`: kiểm tra tổng điểm.
- `exam_formatter()`: format đề.

### `src/run_evaluation.py`

Runner terminal để so sánh chatbot và agent:

```bash
python src/run_evaluation.py --provider demo
```

Output gồm:

- kết quả chatbot;
- kết quả agent;
- latency;
- số tool calls;
- validation signal.

---

## 2. Frontend ExamForge AI

Frontend nằm trong:

```text
src/frontend
```

Stack:

- Next.js
- TypeScript
- shadcn/ui
- Tailwind

### `src/frontend/app/page.tsx`

File điều phối state chính:

- `currentView`: generate, exam, results.
- `activeMode`: llm hoặc agent.
- `exam`: đề hiện tại.
- `answers`: đáp án học sinh chọn.
- `gradingResult`: kết quả chấm.
- `agentTrace`: trace chỉ hiển thị ở Agent Mode.

Các action chính:

- `handleGenerateExam()`
- `handleAnswerChange()`
- `handleSubmitExam()`
- `handleBackToGenerator()`
- `handleRetakeExam()`

Logo gọi `handleBackToGenerator()` để quay về trang tạo đề.
Khi tạo đề, page bắt `NoQuestionDataError` để hiển thị thông báo chưa có dữ liệu thay vì chuyển sang trang đề rỗng.

### `src/frontend/lib/biology-question-bank.ts`

Chứa dữ liệu cục bộ cho use case và adapter nối dữ liệu JSON:

- Sinh học lớp 12.
- Chủ đề DNA, gen, mã di truyền và nhân đôi DNA.
- Import các file JSON trong `src/frontend`.
- Lọc câu `Biology`, `grade = 12`, topic `DNA, Gene, Genetic Code, and DNA Replication`.
- Normalize `id`, `questionType`, `correctAnswer` để khớp interface `Question`.
- Bỏ trùng theo nội dung câu hỏi rồi merge với 24 câu curated ban đầu.
- Mỗi câu có level: recognition, understanding, application, advanced.

### `src/frontend/lib/exam-workflows.ts`

File quan trọng nhất của frontend workflow.

Các hàm yêu cầu trong đề bài:

- `getLessonTheory()`
- `buildExamBlueprint()`
- `selectQuestionsByBlueprint()`
- `validateExam()`
- `gradeExam()`
- `generateMistakeAdvice()`
- `generateFinalSummary()`
- `runAgentWorkflow()`
- `runLLMWorkflow()`

Khác biệt chính:

- `runLLMWorkflow()`: lấy câu hỏi cơ bản, không trace, không blueprint.
- `runAgentWorkflow()`: lấy theory, lập blueprint, chọn câu theo level, validate và trả trace.
- `resolveExamConfig()` và `parsePromptConfig()`: đọc prompt nhập tự do, nhận diện môn/chủ đề/độ khó/số câu bằng rule-based parser.
- `getQuestionBankForConfig()`: lọc ngân hàng câu hỏi theo môn, lớp 12 và topic; nếu không có dữ liệu thì workflow ném `NoQuestionDataError`.
- `TEACHER_CONTEXT`: đặt Agent vào vai trò giáo viên phổ thông, không phải giảng viên; các lời khuyên sai câu và tổng kết điểm số được viết theo giọng nhẹ nhàng, động viên học sinh trước rồi mới hướng dẫn kiến thức.
- `AGENT_RULES`: bộ luật vận hành cho Agent, gồm giọng điệu giáo viên, giới hạn dữ liệu cục bộ, chấm điểm deterministic, giữ blueprint và phản hồi không phán xét.

### `src/frontend/app/api/log-comparison/route.ts`

API route ghi log so sánh frontend vào:

```text
logs/frontend-comparison.log
```

Log gồm:

- mode: llm hoặc agent;
- event: generate_exam hoặc grade_exam;
- latencyMs;
- subject/grade/topic/difficulty;
- questionCount;
- traceSteps;
- score/percentage khi chấm bài.

---

## 3. UI Components

### `components/header.tsx`

- Hiển thị logo ExamForge AI.
- Chuyển LLM Mode / Agent Mode.
- Logo có thể click để quay lại trang chủ/tạo đề.

### `components/exam-generator.tsx`

- Chọn môn, chủ đề, độ khó, số câu.
- Mặc định là Sinh học lớp 12, chủ đề DNA/gen/mã di truyền/nhân đôi DNA.

### `components/exam-view.tsx`

- Hiển thị đề.
- Cho học sinh chọn đáp án A/B/C/D.
- Nộp bài để chấm.

### `components/grading-results.tsx`

- Hiển thị điểm.
- Hiển thị phần mạnh/yếu.
- Hiển thị gợi ý ôn tập.
- Hiển thị giải thích từng câu.
- Hiển thị lời khuyên một dòng cho câu sai.

### `components/agent-trace.tsx`

- Chỉ hiển thị trong Agent Mode.
- Hiển thị trace Suy nghĩ - Hành động - Quan sát - Kiểm chứng.

---

## 4. Verification

Frontend build:

```bash
cd src/frontend
npm run build
```

Kết quả đã kiểm tra:

- Build pass.
- TypeScript pass.
- Static generation pass.

Dev server:

```bash
cd src/frontend
npm run dev -- --port 3001
```

URL:

```text
http://localhost:3001
```
