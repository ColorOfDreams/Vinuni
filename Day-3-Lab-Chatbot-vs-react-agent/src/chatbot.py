from typing import Any, Dict

from src.core.llm_provider import LLMProvider
from src.telemetry.logger import logger
from src.telemetry.metrics import tracker


class BaselineChatbot:
    """
    Direct LLM baseline: no tools, no validation loop, just one completion.
    """

    def __init__(self, llm: LLMProvider):
        self.llm = llm

    def run(self, user_input: str) -> str:
        logger.log_event(
            "CHATBOT_START",
            {"input": user_input, "model": self.llm.model_name},
        )
        result: Dict[str, Any] = self.llm.generate(
            user_input,
            system_prompt=(
                "You are an education assistant. Create the requested exam directly. "
                "Do not use tools."
            ),
        )
        tracker.track_request(
            result.get("provider", "unknown"),
            self.llm.model_name,
            result.get("usage", {}),
            result.get("latency_ms", 0),
        )
        content = result.get("content", "").strip()
        logger.log_event("CHATBOT_END", {"output": content})
        return content
