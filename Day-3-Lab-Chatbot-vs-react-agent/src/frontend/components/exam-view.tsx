"use client"

import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Exam } from "@/lib/types"

interface ExamViewProps {
  exam: Exam
  answers: Record<number, string>
  onAnswerChange: (questionId: number, answer: string) => void
  onSubmit: () => void
  onBack: () => void
  isGrading: boolean
  activeMode: "llm" | "agent"
}

const subjectLabels: Record<string, string> = {
  Biology: "Sinh học",
  Physics: "Vật lý",
  Chemistry: "Hóa học",
  Mathematics: "Toán học",
}

const difficultyLabels: Record<string, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
}

export function ExamView({
  exam,
  answers,
  onAnswerChange,
  onSubmit,
  onBack,
  isGrading,
  activeMode,
}: ExamViewProps) {
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / exam.questions.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Đề {subjectLabels[exam.subject] ?? exam.subject} lớp {exam.grade}
            </h2>
            <p className="text-sm text-muted-foreground">
              {exam.topic} - Độ khó {difficultyLabels[exam.difficulty] ?? exam.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            Đã trả lời {answeredCount}/{exam.questions.length}
          </Badge>
          <Badge variant={activeMode === "agent" ? "default" : "secondary"}>
            {activeMode === "agent" ? "Chế độ Agent" : "Chế độ LLM"}
          </Badge>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {exam.questions.map((question, index) => (
          <Card
            key={question.id}
            className={`border-border transition-all ${
              answers[question.id] ? "border-primary/30 bg-primary/5" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      answers[question.id]
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <CardTitle className="text-base font-medium leading-relaxed">
                    {question.text}
                  </CardTitle>
                </div>
                {answers[question.id] && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
              </div>
              <CardDescription className="ml-11 mt-1">Chủ đề: {question.topic}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => onAnswerChange(question.id, value)}
                className="ml-11 grid gap-2"
              >
                {(["A", "B", "C", "D"] as const).map((option) => (
                  <Label
                    key={option}
                    htmlFor={`q${question.id}-${option}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-secondary/50 ${
                      answers[question.id] === option
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value={option} id={`q${question.id}-${option}`} />
                    <span className="font-medium text-muted-foreground">{option}.</span>
                    <span className="text-foreground">{question.options[option]}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Sẵn sàng nộp bài?</p>
            <p className="text-sm text-muted-foreground">
              {answeredCount === exam.questions.length
                ? "Bạn đã trả lời toàn bộ câu hỏi."
                : `Còn ${exam.questions.length - answeredCount} câu chưa trả lời`}
            </p>
          </div>
          <Button
            onClick={onSubmit}
            disabled={isGrading || answeredCount === 0}
            size="lg"
            className="gap-2"
          >
            {isGrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang chấm...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Nộp bài
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
