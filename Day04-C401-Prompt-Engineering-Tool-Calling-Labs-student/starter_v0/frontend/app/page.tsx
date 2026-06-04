"use client"

import { useState } from "react"
import { Activity, Bug, GitBranch, Search } from "lucide-react"
import { ChatPlayground } from "@/components/dashboard/chat-playground"
import { FailureAnalysis } from "@/components/dashboard/failure-analysis"
import { Header } from "@/components/dashboard/header"
import { ToolTrace, type ToolCall } from "@/components/dashboard/tool-trace"
import { VersionTimeline } from "@/components/dashboard/version-timeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const availableTools = [
  "lookup",
  "fetch",
  "timeline",
  "social_search",
  "clarify",
  "format",
  "send",
  "policy",
  "papers",
  "paper_text",
  "source_check",
]

export default function DashboardPage() {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])

  const handleToolCall = (toolCall: ToolCall) => {
    setToolCalls((current) => [toolCall, ...current].slice(0, 8))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-6.5rem)] min-h-[620px]">
          <div className="lg:col-span-8 xl:col-span-9 min-h-0">
            <ChatPlayground onToolCall={handleToolCall} />
          </div>

          <aside className="lg:col-span-4 xl:col-span-3 min-h-0">
            <Card className="h-full">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-medium">Tool Research</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    Cuộc trò chuyện chính
                  </Badge>
                  <div className="rounded-lg border border-border bg-secondary/40 p-3">
                    <p className="text-sm font-medium">Research agent đang sẵn sàng</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md border border-border bg-background/60 p-2">
                        <p className="text-muted-foreground">Tool có sẵn</p>
                        <p className="mt-1 font-mono text-base text-foreground">{availableTools.length}</p>
                      </div>
                      <div className="rounded-md border border-border bg-background/60 p-2">
                        <p className="text-muted-foreground">Đã gọi phiên này</p>
                        <p className="mt-1 font-mono text-base text-foreground">{toolCalls.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Bộ tool lab</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTools.map((tool) => (
                      <Badge key={tool} variant="outline" className="font-mono text-[11px]">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="justify-start gap-2">
                        <Activity className="w-4 h-4" />
                        Dấu vết tool
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {toolCalls.length}
                        </Badge>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-3xl p-0">
                      <SheetHeader>
                        <SheetTitle>Dấu vết tool</SheetTitle>
                        <SheetDescription>
                          Tool nội bộ, JSON arguments và trạng thái cho các lượt chat vừa chạy.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="min-h-0 flex-1 p-4 pt-0">
                        <ToolTrace toolCalls={toolCalls} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="justify-start gap-2">
                        <Bug className="w-4 h-4" />
                        Phân tích lỗi
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-3xl p-0">
                      <SheetHeader>
                        <SheetTitle>Phân tích lỗi</SheetTitle>
                        <SheetDescription>
                          Các lỗi v0 đã gặp và cách prompt/tool schema được sửa.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="min-h-0 flex-1 p-4 pt-0">
                        <FailureAnalysis />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="justify-start gap-2">
                        <GitBranch className="w-4 h-4" />
                        Lịch sử phiên bản
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-3xl p-0">
                      <SheetHeader>
                        <SheetTitle>Lịch sử phiên bản</SheetTitle>
                        <SheetDescription>
                          Theo dõi các thay đổi prompt/tool và kết quả tối ưu qua từng version.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-0">
                        <VersionTimeline />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                  Chat là bề mặt chính. Trace và log nằm ở lớp phụ.
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
