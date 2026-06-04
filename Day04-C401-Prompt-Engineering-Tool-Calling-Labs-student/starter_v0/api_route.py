from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from chat import run_model_tool_loop, trim_history
from env_loader import load_lab_env
from providers import make_provider
from tools import load_tool_declarations, to_openai_tools


ROOT = Path(__file__).parent
ARTIFACTS_DIR = ROOT / "artifacts"
DEFAULT_PROVIDER = os.getenv("AGENT_PROVIDER", "openrouter")
DEFAULT_MAX_TOOL_ROUNDS = int(os.getenv("AGENT_MAX_TOOL_ROUNDS", "4"))
DEFAULT_HISTORY_WINDOW = int(os.getenv("AGENT_HISTORY_WINDOW", "5"))

load_lab_env(ROOT)

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass


def scrub_surrogates(value: Any) -> Any:
    """Remove invalid UTF-16 surrogate characters before JSON serialization."""
    if isinstance(value, str):
        return "".join(
            char if not 0xD800 <= ord(char) <= 0xDFFF else "\uFFFD"
            for char in value
        )
    if isinstance(value, list):
        return [scrub_surrogates(item) for item in value]
    if isinstance(value, tuple):
        return [scrub_surrogates(item) for item in value]
    if isinstance(value, dict):
        return {
            str(scrub_surrogates(key)): scrub_surrogates(item)
            for key, item in value.items()
        }
    return value


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)
    provider: str = DEFAULT_PROVIDER
    model: str | None = None
    max_tool_rounds: int = Field(DEFAULT_MAX_TOOL_ROUNDS, ge=1, le=8)
    history_window: int = Field(DEFAULT_HISTORY_WINDOW, ge=0, le=20)


class ChatResponse(BaseModel):
    ok: bool
    status: str
    assistant_text: str
    rounds: list[dict[str, Any]]
    tool_events: list[dict[str, Any]]
    provider: str
    model: str | None = None


@lru_cache(maxsize=1)
def load_agent_artifacts() -> tuple[str, list[dict[str, Any]], list[dict[str, Any]]]:
    system_prompt = (ARTIFACTS_DIR / "system_prompt.md").read_text(encoding="utf-8")
    declarations = load_tool_declarations(ARTIFACTS_DIR / "tools.yaml")
    return system_prompt, declarations, to_openai_tools(declarations)


@lru_cache(maxsize=8)
def cached_provider(provider_name: str) -> Any:
    return make_provider(provider_name)


def allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [item.strip() for item in raw.split(",") if item.strip()]


app = FastAPI(
    title="Tool-Calling Research Agent API",
    description="Backend API for the lab research agent, using artifacts/system_prompt.md and artifacts/tools.yaml.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, Any]:
    _, declarations, _ = load_agent_artifacts()
    return {
        "ok": True,
        "service": "tool-calling-research-agent",
        "endpoints": ["/health", "/tools", "/api/chat"],
        "default_provider": DEFAULT_PROVIDER,
        "tool_count": len(declarations),
    }


@app.get("/health")
def health() -> dict[str, Any]:
    system_prompt, declarations, _ = load_agent_artifacts()
    return {
        "ok": True,
        "system_prompt_loaded": bool(system_prompt.strip()),
        "tools_loaded": len(declarations),
        "provider_default": DEFAULT_PROVIDER,
    }


@app.get("/tools")
def tools() -> dict[str, Any]:
    _, declarations, _ = load_agent_artifacts()
    return {
        "ok": True,
        "tools": [
            {
                "name": item.get("name"),
                "description": item.get("description", ""),
                "parameters": item.get("parameters", {}),
            }
            for item in declarations
        ],
    }


def run_agent(request: ChatRequest) -> ChatResponse:
    system_prompt, _, openai_tools = load_agent_artifacts()
    provider = cached_provider(request.provider)
    selected_model = request.model or getattr(provider, "default_model", None)

    history = [
        {"role": item.role, "content": item.content}
        for item in request.history
        if item.content.strip()
    ]
    messages = [
        {"role": "system", "content": system_prompt},
        *trim_history(history, request.history_window),
        {"role": "user", "content": request.message.strip()},
    ]

    result = run_model_tool_loop(
        provider=provider,
        messages=messages,
        tools=openai_tools,
        model=selected_model,
        max_tool_rounds=request.max_tool_rounds,
    )
    payload = scrub_surrogates(
        {
            "ok": True,
            **result,
            "provider": request.provider,
            "model": selected_model,
        }
    )
    return ChatResponse(**payload)


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        return run_agent(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        error_payload = scrub_surrogates(
            {
                "ok": False,
                "status": "server_error",
                "assistant_text": f"{type(exc).__name__}: {str(exc)}",
                "rounds": [],
                "tool_events": [],
                "provider": request.provider,
                "model": request.model,
            }
        )
        return ChatResponse(**error_payload)


@app.post("/chat", response_model=ChatResponse)
def chat_alias(request: ChatRequest) -> ChatResponse:
    return chat_endpoint(request)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("api_route:app", host="0.0.0.0", port=port)
