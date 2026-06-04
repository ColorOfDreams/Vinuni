# Group Report: ExamForge AI - Chatbot vs ReAct Agent

- **Team Name**: ExamForge AI
- **Team Members**: Solo implementation
- **Deployment Date**: 2026-06-01

---

## 1. Executive Summary

ExamForge AI là demo giáo dục so sánh hai cách tạo và chấm đề trắc nghiệm Sinh học lớp 12:

- **LLM Mode**: tạo đề trực tiếp, giống chatbot thường.
- **Agent Mode**: chạy workflow có cấu trúc kiểu ReAct, dùng lý thuyết bài học, ma trận đề, ngân hàng câu hỏi, kiểm chứng cấu trúc và trace suy luận.

Use case chính:

- Môn: Sinh học
- Lớp: 12
- Chủ đề: DNA, gen, mã di truyền và nhân đôi DNA

Kết quả chính: Agent Mode chậm hơn LLM Mode nhưng đáng tin cậy hơn vì chọn câu theo ma trận nhận thức, có kiểm chứng cấu trúc và đưa lời khuyên theo từng lỗi sai.
Ngoài độ tin cậy kỹ thuật, Agent Mode được thiết kế với persona **giáo viên phổ thông**: phản hồi không phán xét, trấn an khi điểm thấp và hướng dẫn học sinh ôn lại từng bước.

---

## 2. System Architecture & Tooling

### 2.1 ReAct Loop Implementation

Luồng Agent:

```text
Thought: Xác định cần tạo đề Sinh học 12 theo chủ đề DNA/gen/mã di truyền/nhân đôi DNA.
Action: getLessonTheory()
Observation: Lấy được lý thuyết nền.
Action: buildExamBlueprint()
Observation: Có phân bố nhận biết/thông hiểu/vận dụng/vận dụng cao.
Action: selectQuestionsByBlueprint()
Observation: Chọn câu hỏi từ ngân hàng cục bộ.
Action: validateExam()
Observation: Đề hợp lệ.
Final Answer: Hiển thị đề, chấm bài, lời khuyên và tổng kết.
```

### 2.2 Tool Definitions

| Tool / Function | Input Format | Use Case |
| :--- | :--- | :--- |
| `getLessonTheory()` | subject, grade, topic | Lấy lý thuyết nền cho Agent Mode |
| `buildExamBlueprint()` | difficulty, questionCount | Tạo ma trận theo mức nhận thức |
| `selectQuestionsByBlueprint()` | blueprint, question bank | Chọn câu hỏi deterministic |
| `validateExam()` | exam | Kiểm tra số câu, phân bố level, trùng câu |
| `gradeExam()` | exam, answers | Chấm đáp án rule-based |
| `generateMistakeAdvice()` | question | Sinh lời khuyên một dòng cho câu sai |
| `generateFinalSummary()` | exam, results, percentage | Tổng kết ôn tập |

### 2.3 LLM Providers Used

- **Frontend demo**: deterministic local workflows, không gọi API để đảm bảo ổn định khi demo.
- **Backend Python optional**: OpenAI, Gemini, local GGUF vẫn được giữ theo skeleton provider switching.

---

## 3. Telemetry & Performance Dashboard

Log được ghi vào:

- `logs/YYYY-MM-DD.log`: telemetry Python demo.
- `logs/frontend-comparison.log`: log frontend cho tạo đề/chấm bài.

Các event frontend có dạng:

```json
{
  "timestamp": "2026-06-01T...",
  "source": "frontend",
  "event": "generate_exam",
  "mode": "agent",
  "latencyMs": 2500,
  "questionCount": 5,
  "traceSteps": 7
}
```

Metric dùng để so sánh:

- Latency tạo đề.
- Latency chấm bài.
- Số trace steps.
- Điểm số học sinh.
- Số câu hỏi và độ khó.

---

## 4. Root Cause Analysis - Failure Traces

### Case Study: LLM Mode thiếu kiểm chứng ma trận

- **Input**: Tạo đề Sinh học 12 về DNA, gen, mã di truyền và nhân đôi DNA.
- **Observation**: LLM Mode chỉ lấy câu hỏi trực tiếp từ ngân hàng theo thứ tự, không lập ma trận nhận thức.
- **Root Cause**: Workflow chatbot không có bước kiểm chứng cấu trúc hoặc phân bố cognitive level.
- **Fix**: Agent Mode thêm `buildExamBlueprint()` và `validateExam()`.

### Case Study: Hard exam vẫn cần câu nền tảng

- **Problem**: Đề khó nếu chỉ chọn câu vận dụng cao sẽ thiếu câu nhận biết, không đúng yêu cầu đề.
- **Fix**: Blueprint hard vẫn phân bổ 20% recognition, 20% understanding, 30% application, 30% advanced.
- **Result**: Đề khó vẫn có câu nền tảng trước khi nâng lên câu vận dụng cao.

---

## 5. Ablation Studies & Experiments

### Experiment 1: LLM Mode vs Agent Mode

| Case | LLM Mode | Agent Mode | Winner |
| :--- | :--- | :--- | :--- |
| Tạo đề nhanh | Nhanh hơn | Chậm hơn do nhiều bước | LLM |
| Đúng ma trận nhận thức | Không đảm bảo | Có blueprint | Agent |
| Kiểm chứng cấu trúc | Không có | Có `validateExam()` | Agent |
| Trace giải thích | Không có | Có Thought-Action-Observation | Agent |
| Lời khuyên câu sai | Cơ bản | Theo từng câu sai | Agent |

### Experiment 2: Blueprint theo độ khó

| Difficulty | Recognition | Understanding | Application | Advanced |
| :--- | ---: | ---: | ---: | ---: |
| Easy | 70% | 20% | 10% | 0% |
| Medium | 50% | 10% | 20% | 20% |
| Hard | 20% | 20% | 30% | 30% |

---

## 6. Production Readiness Review

- **Security**: Hiện chưa có database/auth; dữ liệu local nên ít rủi ro. Khi thêm API thật cần validate input.
- **Guardrails**: Agent dùng rule-based workflow nên deterministic, không bị loop vô hạn trong frontend.
- **Monitoring**: Có frontend comparison logs và Python telemetry logs.
- **Scaling**: Có thể nâng cấp thành RAG bằng cách thay `getLessonTheory()` bằng retrieval từ tài liệu SGK hoặc vector database.
- **Future Work**: Thêm API Gemini/OpenAI thật cho LLM Mode, thêm nhiều môn học, thêm export PDF sau khi core workflow ổn định.
