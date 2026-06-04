"use client"

import { AlertCircle, Bot, Brain, CheckCircle2, Clock, MessageSquare, Shield, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const comparisonData = [
  {
    metric: "Tốc độ phản hồi",
    icon: Clock,
    llm: { value: "~1.5s", score: 5, label: "Rất nhanh" },
    agent: { value: "~2.5s", score: 3, label: "Vừa phải" },
    description: "Thời gian tạo đề hoặc chấm bài",
  },
  {
    metric: "Độ tin cậy",
    icon: Zap,
    llm: { value: "Cơ bản", score: 3, label: "Phụ thuộc đầu ra LLM" },
    agent: { value: "Cao", score: 5, label: "Theo luật cố định" },
    description: "Độ ổn định của đề và đáp án",
  },
  {
    metric: "Kiểm chứng",
    icon: Shield,
    llm: { value: "Không trace", score: 2, label: "Giới hạn" },
    agent: { value: "Có trace", score: 5, label: "Đầy đủ" },
    description: "Ma trận đề, cấu trúc và đáp án",
  },
  {
    metric: "Phản hồi học tập",
    icon: MessageSquare,
    llm: { value: "Ngắn", score: 3, label: "Tiêu chuẩn" },
    agent: { value: "Cá nhân hóa", score: 5, label: "Theo lỗi sai" },
    description: "Giải thích và lời khuyên ôn tập",
  },
]

export function ModeComparison() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          So sánh chế độ LLM và Agent
        </CardTitle>
        <CardDescription>Chọn chế độ phù hợp với mục tiêu tạo đề</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Chế độ LLM</h3>
                <p className="text-xs text-muted-foreground">Tạo đề trực tiếp</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Tạo đề nhanh theo một lượt. Phù hợp khi cần bài luyện tập đơn giản.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">Nhanh</Badge>
              <Badge variant="outline" className="text-xs">Gọn</Badge>
              <Badge variant="outline" className="text-xs">Không trace</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Chế độ Agent</h3>
                <p className="text-xs text-muted-foreground">Suy luận và kiểm chứng</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Tạo đề theo ma trận nhận thức, kiểm tra cấu trúc và đưa lời khuyên theo lỗi sai.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30 text-xs">Có ma trận</Badge>
              <Badge variant="outline" className="border-primary/30 text-xs">Kiểm chứng</Badge>
              <Badge variant="outline" className="border-primary/30 text-xs">Có trace</Badge>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-3 gap-4 bg-secondary/50 p-3 text-sm font-medium">
            <div className="text-muted-foreground">Tiêu chí</div>
            <div className="flex items-center justify-center gap-1.5 text-center">
              <Brain className="h-4 w-4" />
              LLM
            </div>
            <div className="flex items-center justify-center gap-1.5 text-center">
              <Bot className="h-4 w-4" />
              Agent
            </div>
          </div>

          {comparisonData.map((item, index) => (
            <div
              key={item.metric}
              className={`grid grid-cols-3 gap-4 p-3 text-sm ${
                index % 2 === 0 ? "bg-card" : "bg-secondary/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{item.metric}</p>
                  <p className="hidden text-xs text-muted-foreground sm:block">{item.description}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {item.llm.score >= 4 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : item.llm.score >= 3 ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{item.llm.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.llm.label}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {item.agent.score >= 4 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : item.agent.score >= 3 ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{item.agent.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.agent.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Gợi ý:</strong> dùng{" "}
            <strong className="text-blue-500">chế độ LLM</strong> để luyện nhanh, dùng{" "}
            <strong className="text-primary">chế độ Agent</strong> khi cần đề có ma trận, kiểm chứng và phản hồi chi tiết.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
