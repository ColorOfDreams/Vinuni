"use client"

import { Brain, CheckCircle2, Eye, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgentTraceStep } from "@/lib/types"

interface AgentTraceProps {
  trace: AgentTraceStep[]
}

const stepIcons = {
  thought: Lightbulb,
  action: Brain,
  observation: Eye,
  validation: CheckCircle2,
}

const stepLabels = {
  thought: "Suy nghĩ",
  action: "Hành động",
  observation: "Quan sát",
  validation: "Kiểm chứng",
}

const stepColors = {
  thought: "border-yellow-500/30 bg-yellow-500/10",
  action: "border-blue-500/30 bg-blue-500/10",
  observation: "border-purple-500/30 bg-purple-500/10",
  validation: "border-green-500/30 bg-green-500/10",
}

const stepTextColors = {
  thought: "text-yellow-600 dark:text-yellow-400",
  action: "text-blue-600 dark:text-blue-400",
  observation: "text-purple-600 dark:text-purple-400",
  validation: "text-green-600 dark:text-green-400",
}

const statusLabels = {
  success: "Tốt",
  warning: "Cần chú ý",
  error: "Lỗi",
}

export function AgentTrace({ trace }: AgentTraceProps) {
  return (
    <Card className="border-border sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Trace của Agent
        </CardTitle>
        <CardDescription>Chuỗi Suy nghĩ - Hành động - Quan sát</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-3">
          <div className="absolute bottom-2 left-4 top-2 w-px bg-border" />

          {trace.map((step, index) => {
            const Icon = stepIcons[step.type]

            return (
              <div key={index} className="relative flex gap-3 pl-1">
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${stepColors[step.type]}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${stepTextColors[step.type]}`} />
                </div>

                <div className="min-w-0 flex-1 pb-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`border-0 text-xs ${stepColors[step.type]} ${stepTextColors[step.type]}`}
                    >
                      {stepLabels[step.type]}
                    </Badge>
                    {step.status && (
                      <Badge
                        variant={
                          step.status === "success"
                            ? "default"
                            : step.status === "warning"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {statusLabels[step.status]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{step.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.timestamp.toLocaleTimeString("vi-VN")}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
