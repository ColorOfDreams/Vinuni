import argparse
import os
import sys
import time
from typing import Dict

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.agent.agent import ReActAgent
from src.chatbot import BaselineChatbot
from src.core.demo_provider import DemoEducationProvider
from src.core.llm_provider import LLMProvider
from src.tools import EDUCATION_TOOLS


DEFAULT_REQUEST = (
    "Create a 45-minute grade 9 math exam about quadratic equations. "
    "Include 4 multiple-choice questions, 2 short-answer questions, an answer key, "
    "and make the total score 10 points."
)


def build_provider(provider_name: str, mode: str) -> LLMProvider:
    if provider_name == "demo":
        return DemoEducationProvider(mode=mode)

    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        pass

    if provider_name == "openai":
        from src.core.openai_provider import OpenAIProvider

        return OpenAIProvider(
            model_name=os.getenv("DEFAULT_MODEL", "gpt-4o"),
            api_key=os.getenv("OPENAI_API_KEY"),
        )

    if provider_name == "google":
        from src.core.gemini_provider import GeminiProvider

        return GeminiProvider(
            model_name=os.getenv("DEFAULT_MODEL", "gemini-1.5-flash"),
            api_key=os.getenv("GEMINI_API_KEY"),
        )

    if provider_name == "local":
        from src.core.local_provider import LocalProvider

        return LocalProvider(
            model_path=os.getenv(
                "LOCAL_MODEL_PATH",
                "./models/Phi-3-mini-4k-instruct-q4.gguf",
            )
        )

    raise ValueError(f"Unknown provider: {provider_name}")


def quality_check(output: str) -> Dict[str, bool]:
    lowered = output.lower()
    return {
        "has_exam": "question" in lowered or "cau" in lowered or "exam" in lowered,
        "has_answer": "answer" in lowered or "dap an" in lowered,
        "mentions_score": "10" in lowered and "point" in lowered,
        "flags_validation": "score validation: passed" in lowered or "score-validated" in lowered,
    }


def run_case(provider_name: str, request: str) -> None:
    chatbot = BaselineChatbot(build_provider(provider_name, mode="chatbot"))
    agent = ReActAgent(
        llm=build_provider(provider_name, mode="agent"),
        tools=EDUCATION_TOOLS,
        max_steps=6,
    )

    print("\n=== Education Exam Generator Evaluation ===")
    print(f"Provider: {provider_name}")
    print(f"Request: {request}\n")

    chatbot_start = time.time()
    chatbot_output = chatbot.run(request)
    chatbot_latency = int((time.time() - chatbot_start) * 1000)

    agent_start = time.time()
    agent_output = agent.run(request)
    agent_latency = int((time.time() - agent_start) * 1000)

    chatbot_quality = quality_check(chatbot_output)
    agent_quality = quality_check(agent_output)

    print("--- Chatbot Baseline ---")
    print(chatbot_output)
    print("\n--- ReAct Agent ---")
    print(agent_output)

    print("\n--- Comparison ---")
    print("| Metric | Chatbot | ReAct Agent |")
    print("| :--- | :--- | :--- |")
    print(f"| Latency | {chatbot_latency} ms | {agent_latency} ms |")
    print(f"| Tool calls | 0 | {len(agent.history)} |")
    print(f"| Has answer key | {chatbot_quality['has_answer']} | {agent_quality['has_answer']} |")
    print(f"| Mentions 10-point score | {chatbot_quality['mentions_score']} | {agent_quality['mentions_score']} |")
    print(f"| Validation signal | {chatbot_quality['flags_validation']} | {agent_quality['flags_validation']} |")

    winner = "ReAct Agent" if agent_quality["flags_validation"] else "Chatbot"
    print(f"\nWinner for multi-step exam generation: {winner}")
    print("\nLogs were written to the logs/ directory.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare chatbot vs ReAct agent.")
    parser.add_argument(
        "--provider",
        choices=["demo", "openai", "google", "local"],
        default=os.getenv("DEFAULT_PROVIDER", "demo"),
        help="LLM provider to use. Demo works without API keys.",
    )
    parser.add_argument("--request", default=DEFAULT_REQUEST)
    args = parser.parse_args()
    run_case(args.provider, args.request)


if __name__ == "__main__":
    main()
