"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, ArrowRight } from "lucide-react"

interface FailureCase {
  id: string
  query: string
  expected: {
    tool: string
    args: string
  }
  actual: {
    tool: string
    args: string
  }
  diagnosis: string
  fix: string
  severity: "high" | "medium" | "low"
}

const failureCases: FailureCase[] = [
  {
    id: "R10_missing_handle",
    query: "Tóm tắt 5 tweet mới nhất giúp mình",
    expected: {
      tool: "clarify",
      args: '{ "response_type": "text" }',
    },
    actual: {
      tool: "timeline",
      args: '{ "screenname": "sama" }',
    },
    diagnosis: "Agent đoán account Sam Altman dù người dùng chưa nói muốn tweet của ai.",
    fix: "Thiếu handle/account thì gọi clarify, không tự đoán screenname.",
    severity: "high",
  },
  {
    id: "R11_missing_url",
    query: "Tóm tắt bài viết này hộ mình",
    expected: {
      tool: "clarify",
      args: '{ "response_type": "text" }',
    },
    actual: {
      tool: "fetch",
      args: '{ "url": "https://example.com/article" }',
    },
    diagnosis: "Agent bịa URL placeholder khi người dùng chưa cung cấp link cụ thể.",
    fix: "fetch chỉ dùng với URL thật trong hội thoại; thiếu URL thì clarify.",
    severity: "high",
  },
  {
    id: "R12_confirm_before_send",
    query: "Đăng bản tin này lên Telegram giúp mình",
    expected: {
      tool: "clarify",
      args: '{ "response_type": "yes_no" }',
    },
    actual: {
      tool: "send",
      args: '{ "text": "Bản tin này đã được đăng lên Telegram." }',
    },
    diagnosis: "Agent vượt ranh giới write/action và gửi khi chưa có xác nhận nội dung cuối.",
    fix: "send chỉ chạy sau khi user xác nhận exact final text.",
    severity: "high",
  },
  {
    id: "R13_parallel_web_and_tweets",
    query: "Tìm trên web tin AI hôm nay và tìm thêm tweet về AI.",
    expected: {
      tool: "lookup",
      args: '{ "query": "AI", "topic": "news", "timeframe": "day" }',
    },
    actual: {
      tool: "lookup",
      args: '{ "query": "AI news" }',
    },
    diagnosis: "Agent nhét intent news vào query thay vì dùng structured args.",
    fix: "Chuẩn hóa news: query là chủ đề lõi, topic=news, today=timeframe day.",
    severity: "medium",
  },
  {
    id: "R08/R14_out_of_scope",
    query: "Giải tích phân hoặc viết hàm Fibonacci recursion",
    expected: {
      tool: "no_tool",
      args: "{}",
    },
    actual: {
      tool: "send",
      args: '{ "text": "..." }',
    },
    diagnosis: "Agent dùng send như kênh trả lời cho math/coding ngoài phạm vi lab.",
    fix: "Câu ngoài scope không gọi tool; send không dùng để trả lời thường.",
    severity: "high",
  },
]

export function FailureAnalysis() {
  const getSeverityColor = (severity: FailureCase["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-warning/10 text-warning border-warning/20"
      case "low":
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getSeverityLabel = (severity: FailureCase["severity"]) => {
    switch (severity) {
      case "high":
        return "nặng"
      case "medium":
        return "vừa"
      case "low":
        return "nhẹ"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <CardTitle className="text-lg font-medium">Phân tích lỗi</CardTitle>
          </div>
          <Badge variant="destructive" className="text-xs">
            {failureCases.filter(f => f.severity === "high").length} lỗi nặng
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {failureCases.map((failure) => (
              <div
                key={failure.id}
                className="border border-border rounded-lg p-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">&quot;{failure.query}&quot;</p>
                  <Badge variant="outline" className={`text-xs shrink-0 ${getSeverityColor(failure.severity)}`}>
                    {getSeverityLabel(failure.severity)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                    <p className="text-xs text-green-500 mb-1">Tool kỳ vọng</p>
                    <p className="text-xs font-mono">{failure.expected.tool}</p>
                    <p className="text-xs font-mono text-muted-foreground truncate">{failure.expected.args}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                    <p className="text-xs text-destructive mb-1">Tool v0 thực tế</p>
                    <p className="text-xs font-mono">{failure.actual.tool}</p>
                    <p className="text-xs font-mono text-muted-foreground truncate">{failure.actual.args}</p>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded p-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Chẩn đoán:</span> {failure.diagnosis}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Cách sửa:</span> {failure.fix}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
