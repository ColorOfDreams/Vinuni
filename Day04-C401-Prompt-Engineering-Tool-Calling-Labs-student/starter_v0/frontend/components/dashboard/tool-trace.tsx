"use client"

import { useState } from "react"
import { CheckCircle2, ChevronDown, ChevronRight, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ToolCall {
  id: string
  name: string
  status: "success" | "error" | "pending"
  duration: string
  timestamp: string
  args: Record<string, unknown>
  result?: string
}

interface ToolTraceProps {
  toolCalls: ToolCall[]
}

export function ToolTrace({ toolCalls }: ToolTraceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStatusIcon = (status: ToolCall["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      case "error":
        return <XCircle className="w-3.5 h-3.5 text-destructive" />
      case "pending":
        return <Clock className="w-3.5 h-3.5 text-warning" />
    }
  }

  const getStatusColor = (status: ToolCall["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
    }
  }

  const getStatusLabel = (status: ToolCall["status"]) => {
    switch (status) {
      case "success":
        return "thành công"
      case "error":
        return "lỗi"
      case "pending":
        return "đang chờ"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Dấu vết tool</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {toolCalls.length} lượt gọi
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {toolCalls.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              Chưa có tool call. Khi bạn gửi câu hỏi trong playground, trace ở đây sẽ cập nhật theo đúng tool agent vừa dùng.
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {toolCalls.map((call) => (
                <div
                  key={call.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                    onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                  >
                    {expandedId === call.id ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    {getStatusIcon(call.status)}
                    <span className="font-mono text-sm flex-1 truncate">{call.name}</span>
                    <span className="text-xs text-muted-foreground">{call.duration}</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(call.status)}`}>
                      {getStatusLabel(call.status)}
                    </Badge>
                  </button>
                  {expandedId === call.id && (
                    <div className="border-t border-border bg-secondary/30 p-3 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Tham số</p>
                        <pre className="text-xs bg-background p-2.5 rounded border border-border overflow-x-auto font-mono">
                          {JSON.stringify(call.args, null, 2)}
                        </pre>
                      </div>
                      {call.result && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Kết quả debug</p>
                          <p className={`text-xs p-2 rounded border ${
                            call.status === "error"
                              ? "bg-destructive/10 border-destructive/20 text-destructive"
                              : "bg-green-500/10 border-green-500/20 text-green-500"
                          }`}>
                            {call.result}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Thực thi lúc {call.timestamp}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
