# Lab 3: Chatbot vs ReAct Agent

This project compares a direct LLM chatbot with a ReAct-style agent for an
education use case: generating exam drafts for secondary and high school
students.

## Getting Started

### 1. Setup Environment

Copy `.env.example` to `.env` and fill in your API keys if you want to use
OpenAI or Gemini.

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Offline Demo

The demo provider works without API keys and is the fastest way to show the
Chatbot vs Agent comparison.

```bash
python src/run_evaluation.py --provider demo
```

### 4. Run with an API Provider

Set the provider in `.env`:

```env
DEFAULT_PROVIDER=openai
DEFAULT_MODEL=gpt-4o
```

Then run:

```bash
python src/run_evaluation.py
```

Supported providers:

- `demo`: deterministic offline demo.
- `openai`: uses `OPENAI_API_KEY`.
- `google`: uses `GEMINI_API_KEY`.
- `local`: optional GGUF model through `llama-cpp-python`.

## Optional Local Model

You do not need a local model for the main demo. Keep `DEFAULT_PROVIDER=openai`
or use `--provider demo` if you do not have API keys.

If you want to test provider switching with a local model later:

1. Download a GGUF model such as Phi-3 mini instruct.
2. Place it under `models/`.
3. Set:

```env
DEFAULT_PROVIDER=local
LOCAL_MODEL_PATH=./models/Phi-3-mini-4k-instruct-q4.gguf
```

Then run:

```bash
python src/run_evaluation.py --provider local
```

## Lab Objectives

1. Build a clean chatbot baseline.
2. Implement a ReAct loop with `Thought -> Action -> Observation`.
3. Compare chatbot output with agent output using the same education exam task.
4. Use JSON logs in `logs/` to analyze failures, tool calls, latency, and tokens.
5. Document successful and failed traces in the final reports.

## Current Demo

The education agent uses tools in `src/tools/education_tools.py`:

- `curriculum_lookup`: checks if a topic matches a grade/subject.
- `question_generator`: drafts exam questions.
- `score_validator`: checks the total score.
- `exam_formatter`: formats the final exam as Markdown.

The main runner is:

```bash
python src/run_evaluation.py --provider demo
```

It prints a side-by-side comparison and writes telemetry logs to `logs/`.

## Frontend Web Demo: ExamForge AI

Frontend nằm trong:

```bash
src/frontend
```

Chạy web:

```bash
cd src/frontend
npm install
npm run dev -- --port 3001
```

Mở:

```text
http://localhost:3001
```

Web demo có hai chế độ:

- **LLM Mode**: tạo đề và chấm bài trực tiếp, không có ma trận đề hoặc trace.
- **Agent Mode**: lấy lý thuyết, lập ma trận nhận thức, chọn câu theo blueprint, validate đề, chấm bài và hiển thị trace.

Use case hiện tại:

- Môn: Sinh học
- Lớp: 12
- Chủ đề: DNA, gen, mã di truyền và nhân đôi DNA

Frontend logs:

```text
logs/frontend-comparison.log
```

File này ghi latency, mode, số câu, số trace steps, điểm số và phần trăm đúng để phục vụ phần evaluation/report.

## Reports

- Group report: `report/group_report/TEMPLATE_GROUP_REPORT.md`
- Individual report: `report/individual_reports/TEMPLATE_INDIVIDUAL_REPORT.md`
- Frontend workflow report: `report/FRONTEND_WORKFLOW_REPORT.md`
- Code walkthrough: `report/CODE_WALKTHROUGH.md`
