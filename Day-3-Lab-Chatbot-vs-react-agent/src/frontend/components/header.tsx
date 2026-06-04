"use client"

import { Bot, Brain, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  activeMode: "llm" | "agent"
  onModeChange: (mode: "llm" | "agent") => void
  onHomeClick: () => void
}

export function Header({ activeMode, onModeChange, onHomeClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <button
          type="button"
          onClick={onHomeClick}
          className="flex items-center gap-3 rounded-lg text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Quay về trang chủ"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">ExamForge AI</h1>
            <p className="text-xs text-muted-foreground">Trình tạo đề Sinh học lớp 12</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-secondary p-1">
            <Button
              variant={activeMode === "llm" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("llm")}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Chế độ LLM</span>
              <span className="sm:hidden">LLM</span>
            </Button>
            <Button
              variant={activeMode === "agent" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("agent")}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Chế độ Agent</span>
              <span className="sm:hidden">Agent</span>
            </Button>
          </div>
          <Badge variant="outline" className="hidden md:flex">
            {activeMode === "llm" ? "Nhanh & trực tiếp" : "Suy luận & kiểm chứng"}
          </Badge>
        </div>
      </div>
    </header>
  )
}
