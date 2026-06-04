import { spawn } from "node:child_process"
import path from "node:path"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const PYTHON_BRIDGE = String.raw`
import contextlib
import json
import sys
from pathlib import Path

from chat import run_model_tool_loop
from providers import make_provider
from tools import load_tool_declarations, to_openai_tools

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def scrub(value):
    if isinstance(value, str):
        return "".join(
            char if not 0xD800 <= ord(char) <= 0xDFFF else "\uFFFD"
            for char in value
        )
    if isinstance(value, list):
        return [scrub(item) for item in value]
    if isinstance(value, tuple):
        return [scrub(item) for item in value]
    if isinstance(value, dict):
        return {scrub(key): scrub(item) for key, item in value.items()}
    return value

def emit(value):
    print(json.dumps(scrub(value), ensure_ascii=False, default=str))

ROOT = Path.cwd()
ARTIFACTS_DIR = ROOT / "artifacts"

payload = json.loads(sys.stdin.read() or "{}")
system_prompt = (ARTIFACTS_DIR / "system_prompt.md").read_text(encoding="utf-8")
tool_declarations = load_tool_declarations(ARTIFACTS_DIR / "tools.yaml")
openai_tools = to_openai_tools(tool_declarations)
provider_name = payload.get("provider") or "openrouter"
provider = make_provider(provider_name)
model = payload.get("model") or getattr(provider, "default_model", None)

history = payload.get("history") or []
user_text = payload.get("message") or ""
messages = [
    {"role": "system", "content": system_prompt},
    *history[-10:],
    {"role": "user", "content": user_text},
]

try:
    with contextlib.redirect_stdout(sys.stderr):
        result = run_model_tool_loop(
            provider=provider,
            messages=messages,
            tools=openai_tools,
            model=model,
            max_tool_rounds=int(payload.get("max_tool_rounds") or 4),
        )
    emit({"ok": True, **result})
except Exception as exc:
    emit({
        "ok": False,
        "status": "provider_error",
        "assistant_text": f"{type(exc).__name__}: {str(exc)}",
        "rounds": [],
        "tool_events": [],
    })
`

function runPythonAgent(payload: unknown) {
  return new Promise<string>((resolve, reject) => {
    const starterRoot = path.resolve(process.cwd(), "..")
    const pythonExe = path.join(starterRoot, ".venv", "Scripts", "python.exe")
    const child = spawn(pythonExe, ["-c", PYTHON_BRIDGE], {
      cwd: starterRoot,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8:replace",
      },
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python agent exited with code ${code}`))
        return
      }
      resolve(stdout)
    })

    child.stdin.write(JSON.stringify(payload))
    child.stdin.end()
  })
}

export async function POST(request: Request) {
  const body = await request.json() as {
    message?: string
    history?: ChatMessage[]
    provider?: string
    model?: string
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 })
  }

  try {
    const output = await runPythonAgent(body)
    return NextResponse.json(JSON.parse(output))
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "server_error",
        assistant_text: error instanceof Error ? error.message : "Unknown server error",
        rounds: [],
        tool_events: [],
      },
      { status: 500 },
    )
  }
}
