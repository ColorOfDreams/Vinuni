import time
import json
from typing import Any, Dict, Generator, Optional

from src.core.llm_provider import LLMProvider


class DemoEducationProvider(LLMProvider):
    """
    Deterministic provider for classroom demos when API keys are unavailable.
    It intentionally makes the chatbot baseline imperfect, then drives the
    ReAct agent through curriculum, generation, validation, and formatting.
    """

    def __init__(self, mode: str):
        super().__init__(model_name=f"demo-education-{mode}")
        self.mode = mode

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        start_time = time.time()
        if self.mode == "chatbot":
            content = self._chatbot_response(prompt)
        else:
            content = self._agent_response(prompt)

        latency_ms = int((time.time() - start_time) * 1000)
        total_tokens = max(1, len(prompt.split()) + len(content.split()))
        return {
            "content": content,
            "usage": {
                "prompt_tokens": max(1, len(prompt.split())),
                "completion_tokens": max(1, len(content.split())),
                "total_tokens": total_tokens,
            },
            "latency_ms": latency_ms,
            "provider": "demo",
        }

    def stream(self, prompt: str, system_prompt: Optional[str] = None) -> Generator[str, None, None]:
        yield self.generate(prompt, system_prompt)["content"]

    def _chatbot_response(self, prompt: str) -> str:
        return """# Draft Math Exam - Grade 9

1. Solve a quadratic equation. [2 points]
2. Choose the correct graph of a quadratic function. [2 points]
3. Find the discriminant. [2 points]
4. Write a short proof about a cubic equation. [3 points]
5. Explain Newton's method. [3 points]

Answer key: 1A, 2B, 3C.

Quality note: This direct draft is fast, but it has weak validation: total score is
12/10, some answers are missing, and two topics may be too advanced for grade 9.
"""

    def _agent_response(self, prompt: str) -> str:
        if "Curriculum check:" not in prompt:
            return (
                "Thought: I should verify the requested topic against the grade before "
                "writing the exam.\n"
                'Action: curriculum_lookup({"subject": "math", "grade": "9", '
                '"topic": "quadratic equations"})'
            )

        if "MCQ" not in prompt:
            return (
                "Thought: The topic is suitable, so I can generate a balanced draft.\n"
                'Action: question_generator({"subject": "math", "grade": "9", '
                '"topic": "quadratic equations", "multiple_choice": 4, '
                '"short_answer": 2, "difficulty": "medium"})'
            )

        if "Score validation:" not in prompt:
            exam_text = self._extract_last_observation(prompt)
            args = json.dumps({"exam_text": exam_text, "target_score": 10})
            return (
                "Thought: Before finalizing, I need to check that the score adds up "
                "to 10.\n"
                f"Action: score_validator({args})"
            )

        if "# Grade 9" not in prompt:
            exam_text = self._extract_question_block(prompt)
            validation = self._extract_last_observation(prompt)
            args = json.dumps(
                {
                    "title": "Grade 9 Math Exam - Quadratic Equations",
                    "exam_text": exam_text,
                    "validation": validation,
                }
            )
            return (
                "Thought: The score check passed, so I should format the teacher-ready "
                "exam.\n"
                f"Action: exam_formatter({args})"
            )

        final_exam = self._extract_last_observation(prompt)
        return (
            "Final Answer: The agent produced a curriculum-aligned and score-validated "
            f"exam:\n\n{final_exam}"
        )

    def _extract_last_observation(self, prompt: str) -> str:
        marker = "Observation:"
        if marker not in prompt:
            return ""
        return prompt.rsplit(marker, 1)[-1].strip()

    def _extract_question_block(self, prompt: str) -> str:
        observations = [part.strip() for part in prompt.split("Observation:") if "MCQ" in part]
        if not observations:
            return ""
        return observations[-1].split("\n\nAssistant output:", 1)[0].strip()
