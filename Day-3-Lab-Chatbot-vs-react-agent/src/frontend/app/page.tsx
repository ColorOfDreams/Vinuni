"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ExamGenerator } from "@/components/exam-generator"
import { ExamView } from "@/components/exam-view"
import { GradingResults } from "@/components/grading-results"
import { ModeComparison } from "@/components/mode-comparison"
import { AgentTrace } from "@/components/agent-trace"
import type { Exam, GradingResult, AgentTraceStep } from "@/lib/types"
import {
  gradeExam,
  NoQuestionDataError,
  runAgentGradingTrace,
  runAgentWorkflow,
  runLLMWorkflow,
} from "@/lib/exam-workflows"

export default function Home() {
  const [activeMode, setActiveMode] = useState<"llm" | "agent">("llm")
  const [currentView, setCurrentView] = useState<"generate" | "exam" | "results">("generate")
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null)
  const [agentTrace, setAgentTrace] = useState<AgentTraceStep[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGrading, setIsGrading] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const writeComparisonLog = async (payload: Record<string, unknown>) => {
    try {
      await fetch("/api/log-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.warn("Không ghi được log so sánh frontend", error)
    }
  }

  const handleGenerateExam = async (config: {
    subject: string
    topic: string
    difficulty: string
    questionCount: number
    prompt?: string
  }) => {
    setIsGenerating(true)
    setGenerationError(null)
    const startedAt = performance.now()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, activeMode === "agent" ? 2500 : 1500))

    try {
      const workflow = activeMode === "agent"
        ? runAgentWorkflow(config)
        : runLLMWorkflow(config)

      setAgentTrace(workflow.trace)
      setExam(workflow.exam)
      await writeComparisonLog({
        event: "generate_exam",
        mode: activeMode,
        latencyMs: Math.round(performance.now() - startedAt),
        subject: workflow.exam.subject,
        grade: workflow.exam.grade,
        topic: workflow.exam.topic,
        difficulty: workflow.exam.difficulty,
        questionCount: workflow.exam.questions.length,
        traceSteps: workflow.trace.length,
        prompt: config.prompt,
      })
      setAnswers({})
      setGradingResult(null)
      setCurrentView("exam")
    } catch (error) {
      const message =
        error instanceof NoQuestionDataError
          ? error.message
          : "Chưa tạo được đề từ prompt này. Em thử chọn lại môn/chủ đề có dữ liệu trong hệ thống nhé."
      setGenerationError(message)
      await writeComparisonLog({
        event: "generate_exam_failed",
        mode: activeMode,
        latencyMs: Math.round(performance.now() - startedAt),
        subject: config.subject,
        grade: 12,
        topic: config.topic,
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        prompt: config.prompt,
        error: message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmitExam = async () => {
    if (!exam) return
    
    setIsGrading(true)
    const startedAt = performance.now()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, activeMode === "agent" ? 2000 : 1200))
    
    const result = gradeExam(exam, answers)
    if (activeMode === "agent") {
      const gradingTrace = runAgentGradingTrace(exam, answers, result)
      setAgentTrace(prev => [...prev, ...gradingTrace])
    }
    await writeComparisonLog({
      event: "grade_exam",
      mode: activeMode,
      latencyMs: Math.round(performance.now() - startedAt),
      subject: exam.subject,
      grade: exam.grade,
      topic: exam.topic,
      difficulty: exam.difficulty,
      questionCount: exam.questions.length,
      traceSteps: activeMode === "agent" ? agentTrace.length : 0,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
    })
    setGradingResult(result)
    setCurrentView("results")
    setIsGrading(false)
  }

  const handleBackToGenerator = () => {
    setCurrentView("generate")
    setExam(null)
    setAnswers({})
    setGradingResult(null)
    setAgentTrace([])
    setGenerationError(null)
  }

  const handleRetakeExam = () => {
    setCurrentView("exam")
    setAnswers({})
    setGradingResult(null)
    setAgentTrace([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeMode={activeMode} onModeChange={setActiveMode} onHomeClick={handleBackToGenerator} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {currentView === "generate" && (
          <div className="space-y-8">
            <ExamGenerator
              onGenerate={handleGenerateExam}
              isGenerating={isGenerating}
              activeMode={activeMode}
              errorMessage={generationError}
            />
            <ModeComparison />
          </div>
        )}

        {currentView === "exam" && exam && (
          <ExamView
            exam={exam}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitExam}
            onBack={handleBackToGenerator}
            isGrading={isGrading}
            activeMode={activeMode}
          />
        )}

        {currentView === "results" && gradingResult && exam && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GradingResults
                result={gradingResult}
                exam={exam}
                answers={answers}
                onRetake={handleRetakeExam}
                onNewExam={handleBackToGenerator}
              />
            </div>
            {activeMode === "agent" && agentTrace.length > 0 && (
              <div className="lg:col-span-1">
                <AgentTrace trace={agentTrace} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
