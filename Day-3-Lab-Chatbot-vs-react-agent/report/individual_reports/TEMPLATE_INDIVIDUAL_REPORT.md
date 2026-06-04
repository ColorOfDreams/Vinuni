# Individual Report: ExamForge AI - Chatbot vs ReAct Agent

- **Student Name**: [Điền tên]
- **Student ID**: [Điền mã số]
- **Date**: 2026-06-01

---

## I. Technical Contribution

Các phần đã triển khai:

- Hoàn thiện ReAct agent backend trong `src/agent/agent.py`.
- Thêm chatbot baseline trong `src/chatbot.py`.
- Thêm education tools trong `src/tools/education_tools.py`.
- Thêm deterministic demo provider trong `src/core/demo_provider.py`.
- Thêm runner so sánh terminal trong `src/run_evaluation.py`.
- Kết nối frontend ExamForge AI trong `src/frontend`.
- Thêm 24 câu hỏi Sinh học 12 trong `src/frontend/lib/biology-question-bank.ts`.
- Thêm workflow chính trong `src/frontend/lib/exam-workflows.ts`.
- Thêm frontend API log trong `src/frontend/app/api/log-comparison/route.ts`.

Code highlights:

- `runLLMWorkflow()` mô phỏng chatbot/LLM thường: tạo đề và chấm bài không có blueprint/trace.
- `runAgentWorkflow()` mô phỏng Agent có cấu trúc: lấy lý thuyết, lập ma trận, chọn câu, validate đề và hiển thị trace.
- `gradeExam()` chấm bài theo đáp án đúng, sinh weak/strong areas, mistake advice và final summary.

---

## II. Debugging Case Study

### Problem Description

Trong giai đoạn đầu, hệ thống chỉ có mock data rời rạc. UI có nút tạo đề/chấm bài nhưng workflow chưa phản ánh đúng khác biệt giữa LLM Mode và Agent Mode.

### Log Source

Log frontend hiện được ghi vào:

```text
logs/frontend-comparison.log
```

Mỗi dòng log ghi event tạo đề hoặc chấm bài:

```json
{
  "source": "frontend",
  "event": "generate_exam",
  "mode": "agent",
  "latencyMs": 2500,
  "traceSteps": 7
}
```

### Diagnosis

LLM Mode và Agent Mode trước đó đều dùng cùng một kiểu mock generation, nên khó chứng minh Agent tốt hơn ở đâu. Ngoài ra chưa có log latency riêng cho frontend, nên phần evaluation thiếu dữ liệu so sánh.

### Solution

- Tách `runLLMWorkflow()` và `runAgentWorkflow()`.
- Agent Mode dùng blueprint theo cognitive level.
- LLM Mode không có theory, blueprint, validation trace hoặc ReAct trace.
- Thêm API route `/api/log-comparison` để ghi latency, mode, score, questionCount và traceSteps.

---

## III. Personal Insights: Chatbot vs ReAct

1. **Reasoning**: Chatbot trả lời trực tiếp nên nhanh, nhưng khó kiểm soát cấu trúc đề. Agent chia bài toán thành nhiều bước nên dễ kiểm chứng hơn.
2. **Reliability**: Agent đáng tin cậy hơn với bài toán có ràng buộc như ma trận đề, mức nhận thức và lời khuyên theo lỗi sai. Tuy nhiên Agent chậm hơn vì phải chạy nhiều bước.
3. **Observation**: Observation giúp Agent biết bước trước đã hoàn thành chưa, ví dụ đã có lý thuyết, đã có blueprint, đề có hợp lệ hay không.

---

## IV. Future Improvements

- **Scalability**: Thay lesson theory local bằng RAG trên tài liệu SGK hoặc giáo trình.
- **Safety**: Thêm kiểm tra độ phù hợp lớp học, tránh câu hỏi ngoài chương trình.
- **Performance**: Cache lesson theory và question selection theo subject/grade/topic.
- **Assessment Quality**: Thêm rubric cho tự luận, phân tích độ khó thực tế sau khi học sinh làm bài.
- **LLM Integration**: Kết nối Gemini/OpenAI thật cho LLM Mode nhưng vẫn giữ Agent Mode deterministic để so sánh công bằng.
