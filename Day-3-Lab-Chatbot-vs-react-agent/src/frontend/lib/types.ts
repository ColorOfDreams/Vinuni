export type CognitiveLevel = "recognition" | "understanding" | "application" | "advanced"
export type QuestionType = "multiple-choice"
export type ExamMode = "llm" | "agent"

export interface Question {
  id: number
  subject: string
  grade: number
  level: CognitiveLevel
  questionType: QuestionType
  question: string
  text: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctOption: "A" | "B" | "C" | "D"
  correctAnswer: "A" | "B" | "C" | "D"
  explanation: string
  wrongAdvice: string
  topic: string
}

export interface Exam {
  id: string
  subject: string
  grade: number
  topic: string
  difficulty: string
  questions: Question[]
  createdAt: Date
  mode?: ExamMode
  lessonTheory?: string
  blueprint?: ExamBlueprint
  validation?: ExamValidation
}

export interface QuestionResult {
  questionId: number
  isCorrect: boolean
  userAnswer: string | null
  correctAnswer: string
  explanation: string
  advice?: string
  level?: CognitiveLevel
  topic?: string
}

export interface GradingResult {
  score: number
  totalQuestions: number
  percentage: number
  questionResults: QuestionResult[]
  studyAdvice: string[]
  weakAreas: string[]
  strongAreas: string[]
  mistakeAdvice: string[]
  finalSummary: string
}

export interface AgentTraceStep {
  type: "thought" | "action" | "observation" | "validation"
  content: string
  timestamp: Date
  status?: "success" | "warning" | "error"
}

export interface ExamBlueprint {
  difficulty: string
  totalQuestions: number
  distribution: Record<CognitiveLevel, number>
}

export interface ExamValidation {
  isValid: boolean
  messages: string[]
}

export interface ExamConfig {
  subject: string
  topic: string
  difficulty: string
  questionCount: number
  prompt?: string
}

export interface WorkflowResult {
  exam: Exam
  trace: AgentTraceStep[]
}
