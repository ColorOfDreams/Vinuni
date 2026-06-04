"use client"

import { useState } from "react"
import { AlertCircle, Bot, Send, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { ToolCall } from "@/components/dashboard/tool-trace"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  requiresConfirmation?: boolean
}

interface ChatPlaygroundProps {
  onToolCall?: (toolCall: ToolCall) => void
}

interface AgentToolEvent {
  tool?: string
  args?: Record<string, unknown>
  result?: unknown
}

interface AgentResponse {
  ok: boolean
  status: string
  assistant_text: string
  tool_events?: AgentToolEvent[]
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Xin chào! Mình là Research Agent. Mình có thể tra cứu web/tin tức, đọc URL, tóm tắt Twitter/X, hỏi lại khi thiếu thông tin và hỗ trợ soạn bản tin Telegram trước khi gửi.",
  },
]

const examples = [
  "Tin tức AI hôm nay có gì nổi bật?",
  "Tóm tắt bài này giúp mình: https://openai.com/blog/gpt-5",
  "Tweet mới nhất của Sam Altman là gì?",
  "Tóm tắt 5 tweet mới nhất giúp mình",
  "Đăng bản tin này lên Telegram giúp mình",
]

function formatTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function stringifyResult(result: unknown) {
  if (typeof result === "string") {
    return result
  }

  try {
    return JSON.stringify(result, null, 2)
  } catch {
    return String(result)
  }
}

function eventHasError(event: AgentToolEvent) {
  const result = event.result
  return Boolean(
    result &&
      typeof result === "object" &&
      "error" in result,
  )
}

function eventNeedsConfirmation(event: AgentToolEvent) {
  const args = event.args ?? {}
  return event.tool === "clarify" && args.response_type === "yes_no"
}

export function ChatPlayground({ onToolCall }: ChatPlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return

    const currentInput = text.trim()
    const startedAt = performance.now()
    const history = messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map(({ role, content }) => ({ role, content }))

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: currentInput,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          history,
          provider: "openrouter",
        }),
      })
      const data = (await response.json()) as AgentResponse
      const toolEvents = data.tool_events ?? []
      const duration = `${Math.max(1, Math.round(performance.now() - startedAt))}ms`
      const timestamp = formatTime(new Date())

      toolEvents.forEach((event, index) => {
        onToolCall?.({
          id: `${Date.now()}-${index}-${event.tool ?? "unknown"}`,
          name: event.tool ?? "unknown",
          status: eventHasError(event) ? "error" : "success",
          duration,
          timestamp,
          args: event.args ?? {},
          result: stringifyResult(event.result),
        })
      })

      const assistantText =
        data.assistant_text?.trim() ||
        "Mình chưa nhận được nội dung trả lời từ agent. Bạn thử gửi lại yêu cầu nhé."

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: assistantText,
        requiresConfirmation: toolEvents.some(eventNeedsConfirmation),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant-error`,
        role: "assistant",
        content:
          error instanceof Error
            ? `Mình chưa thể hoàn tất yêu cầu vì lỗi kết nối với agent: ${error.message}`
            : "Mình chưa thể hoàn tất yêu cầu vì lỗi kết nối với agent.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSend = () => {
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Khu thử nghiệm</CardTitle>
          <Badge variant="outline" className="text-xs">
            Agent thật
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role !== "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                {message.requiresConfirmation && (
                  <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/20">
                    <div className="flex items-center gap-2 text-warning text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Hành động này cần xác nhận</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => sendMessage("Hủy yêu cầu gửi Telegram.")}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => sendMessage("Tôi xác nhận, hãy gửi nguyên văn nội dung trên.")}
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              placeholder="Nhập yêu cầu research..."
              className="min-h-[44px] max-h-32 resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
