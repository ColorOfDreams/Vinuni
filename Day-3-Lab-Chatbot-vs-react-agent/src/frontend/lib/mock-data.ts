import {
  gradeExam,
  runAgentGradingTrace,
  runAgentWorkflow,
  runLLMWorkflow,
} from "./exam-workflows"
import type { AgentTraceStep, Exam, ExamConfig } from "./types"

export function generateExam(config: ExamConfig): Exam {
  return runLLMWorkflow(config).exam
}

export { gradeExam }

export function generateAgentTrace(
  action: "generate" | "grade",
  context: ExamConfig | { exam: Exam; answers: Record<number, string> },
): AgentTraceStep[] {
  if (action === "generate") {
    return runAgentWorkflow(context as ExamConfig).trace
  }

  const gradingContext = context as { exam: Exam; answers: Record<number, string> }
  const result = gradeExam(gradingContext.exam, gradingContext.answers)
  return runAgentGradingTrace(gradingContext.exam, gradingContext.answers, result)
}
