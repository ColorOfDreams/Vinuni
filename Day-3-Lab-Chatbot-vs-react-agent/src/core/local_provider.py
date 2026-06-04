import os
import time
from typing import Dict, Any, Optional, Generator
from llama_cpp import Llama
from src.core.llm_provider import LLMProvider


class LocalProvider(LLMProvider):
    """
    Optional LLM provider for local GGUF models using llama-cpp-python.
    Keep this for provider-switching completeness, but the main demo can run
    with demo/openai/google and does not require a local model.
    """

    def __init__(self, model_path: str, n_ctx: int = 4096, n_threads: Optional[int] = None):
        super().__init__(model_name=os.path.basename(model_path))

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. Please download it first."
            )

        self.llm = Llama(
            model_path=model_path,
            n_ctx=n_ctx,
            n_threads=n_threads,
            verbose=False,
        )

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        start_time = time.time()

        if system_prompt:
            full_prompt = (
                f"<|system|>\n{system_prompt}<|end|>\n"
                f"<|user|>\n{prompt}<|end|>\n<|assistant|>"
            )
        else:
            full_prompt = f"<|user|>\n{prompt}<|end|>\n<|assistant|>"

        response = self.llm(
            full_prompt,
            max_tokens=1024,
            stop=["<|end|>", "Observation:"],
            echo=False,
        )

        latency_ms = int((time.time() - start_time) * 1000)
        content = response["choices"][0]["text"].strip()
        usage = {
            "prompt_tokens": response["usage"]["prompt_tokens"],
            "completion_tokens": response["usage"]["completion_tokens"],
            "total_tokens": response["usage"]["total_tokens"],
        }

        return {
            "content": content,
            "usage": usage,
            "latency_ms": latency_ms,
            "provider": "local",
        }

    def stream(self, prompt: str, system_prompt: Optional[str] = None) -> Generator[str, None, None]:
        if system_prompt:
            full_prompt = (
                f"<|system|>\n{system_prompt}<|end|>\n"
                f"<|user|>\n{prompt}<|end|>\n<|assistant|>"
            )
        else:
            full_prompt = f"<|user|>\n{prompt}<|end|>\n<|assistant|>"

        stream = self.llm(
            full_prompt,
            max_tokens=1024,
            stop=["<|end|>", "Observation:"],
            stream=True,
        )

        for chunk in stream:
            token = chunk["choices"][0]["text"]
            if token:
                yield token
