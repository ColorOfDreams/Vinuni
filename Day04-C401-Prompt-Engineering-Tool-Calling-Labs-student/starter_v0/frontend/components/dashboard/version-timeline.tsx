"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, GitBranch } from "lucide-react"

interface Version {
  id: string
  version: string
  name: string
  date: string
  accuracy: number
  changes: string[]
  isCurrent: boolean
}

const versions: Version[] = [
  {
    id: "1",
    version: "v0",
    name: "Bản gốc",
    date: "02/06",
    accuracy: 70,
    changes: ["Đạt 14/20 case", "Định tuyến còn đoán handle và URL", "send bị dùng như câu trả lời thường"],
    isCurrent: false,
  },
  {
    id: "2",
    version: "v1.0",
    name: "Tối ưu",
    date: "02/06",
    accuracy: 100,
    changes: ["Đạt 20/20 case", "clarify khi thiếu handle hoặc URL", "send cần xác nhận", "tham số news được chuẩn hóa"],
    isCurrent: true,
  },
]

export function VersionTimeline() {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-medium">Lịch sử phiên bản</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-[11px] w-0.5 bg-border" />
          
          <div className="space-y-6">
            {versions.map((version, index) => (
              <div key={version.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                  version.isCurrent 
                    ? "bg-primary" 
                    : "bg-background border-2 border-border"
                }`}>
                  {version.isCurrent ? (
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-6 ${index === versions.length - 1 ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={version.isCurrent ? "default" : "secondary"} className="text-xs">
                      {version.version}
                    </Badge>
                    <span className="font-medium text-sm">{version.name}</span>
                    <span className="text-xs text-muted-foreground">{version.date}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${version.accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{version.accuracy}%</span>
                    </div>
                    {index > 0 && (
                      <span className="text-xs text-green-500">
                        +{version.accuracy - versions[index - 1].accuracy}%
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1">
                    {version.changes.map((change, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
