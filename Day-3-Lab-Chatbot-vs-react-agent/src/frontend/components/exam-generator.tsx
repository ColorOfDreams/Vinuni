"use client"

import { useState } from "react"
import { BarChart3, BookOpen, GraduationCap, Hash, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

interface ExamGeneratorProps {
  onGenerate: (config: {
    subject: string
    topic: string
    difficulty: string
    questionCount: number
    prompt?: string
  }) => void
  isGenerating: boolean
  activeMode: "llm" | "agent"
  errorMessage?: string | null
}

const subjects = [
  { value: "Physics", label: "Vật lý", icon: "VL" },
  { value: "Chemistry", label: "Hóa học", icon: "HH" },
  { value: "Mathematics", label: "Toán học", icon: "TH" },
  { value: "Biology", label: "Sinh học", icon: "SH" },
]

const topicsBySubject: Record<string, string[]> = {
  Physics: ["Cơ học", "Sóng và quang học", "Điện và từ", "Nhiệt học", "Vật lý hiện đại"],
  Chemistry: ["Hóa hữu cơ", "Hóa vô cơ", "Hóa lý", "Hóa sinh", "Điện hóa"],
  Mathematics: ["Giải tích", "Đại số", "Lượng giác", "Thống kê và xác suất", "Hình học tọa độ"],
  Biology: ["DNA, gen, mã di truyền và nhân đôi DNA", "Di truyền học", "Sinh học tế bào", "Sinh thái học", "Tiến hóa"],
}

const difficulties = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
]

export function ExamGenerator({ onGenerate, isGenerating, activeMode, errorMessage }: ExamGeneratorProps) {
  const [subject, setSubject] = useState("Biology")
  const [topic, setTopic] = useState("DNA, gen, mã di truyền và nhân đôi DNA")
  const [difficulty, setDifficulty] = useState("medium")
  const [questionCount, setQuestionCount] = useState(5)
  const [prompt, setPrompt] = useState("")

  const handleGenerate = () => {
    onGenerate({ subject, topic, difficulty, questionCount, prompt })
  }

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Tạo đề kiểm tra mới</CardTitle>
            <CardDescription>
              Chọn thông tin đề, sau đó để AI tạo bài trắc nghiệm phù hợp cho học sinh.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Prompt tạo đề
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ví dụ: Tạo 5 câu Sinh học lớp 12 chủ đề DNA, gen, mã di truyền và nhân đôi DNA mức trung bình"
            className="min-h-24 resize-none"
          />
          {errorMessage && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Môn học
            </Label>
            <Select
              value={subject}
              onValueChange={(val) => {
                setSubject(val)
                setTopic(topicsBySubject[val][0])
              }}
            >
              <SelectTrigger id="subject" className="h-11">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{s.icon}</span>
                      <span>{s.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              Chủ đề
            </Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="topic" className="h-11">
                <SelectValue placeholder="Chọn chủ đề" />
              </SelectTrigger>
              <SelectContent>
                {topicsBySubject[subject].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Độ khó
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty" className="h-11">
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Số câu hỏi: {questionCount}
            </Label>
            <div className="pt-2">
              <Slider
                value={[questionCount]}
                onValueChange={(val) => setQuestionCount(val[0])}
                min={3}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>3</span>
                <span>10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {activeMode === "agent"
              ? "Agent sẽ lập ma trận đề, chọn câu và kiểm chứng cấu trúc."
              : "LLM tạo đề nhanh theo một lượt, không có trace kiểm chứng."}
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo đề...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Tạo đề
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
