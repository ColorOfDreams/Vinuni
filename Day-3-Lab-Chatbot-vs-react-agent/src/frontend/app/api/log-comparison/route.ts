import { mkdir, appendFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

interface ComparisonLogPayload {
  event: "generate_exam" | "grade_exam"
  mode: "llm" | "agent"
  latencyMs: number
  subject?: string
  grade?: number
  topic?: string
  difficulty?: string
  questionCount?: number
  traceSteps?: number
  score?: number
  totalQuestions?: number
  percentage?: number
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ComparisonLogPayload
  const logDir = path.join(process.cwd(), "..", "..", "logs")
  const logFile = path.join(logDir, "frontend-comparison.log")

  await mkdir(logDir, { recursive: true })
  await appendFile(
    logFile,
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      source: "frontend",
      ...payload,
    })}\n`,
    "utf8",
  )

  return NextResponse.json({ ok: true })
}
