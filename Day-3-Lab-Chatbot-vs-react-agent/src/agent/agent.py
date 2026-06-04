import re
import json
from typing import List, Dict, Any, Optional, Tuple
from src.core.llm_provider import LLMProvider
from src.telemetry.logger import logger
from src.telemetry.metrics import tracker

class ReActAgent:
    """
    A small ReAct-style Agent that follows a Thought-Action-Observation loop.
    """
    
    def __init__(self, llm: LLMProvider, tools: List[Dict[str, Any]], max_steps: int = 5):
        self.llm = llm
        self.tools = tools
        self.max_steps = max_steps
        self.history = []

    def get_system_prompt(self) -> str:
        """
        Builds a compact prompt that teaches the model the available tools and
        the exact response format expected by the parser.
        """
        tool_descriptions = "\n".join(
            [f"- {t['name']}: {t['description']}" for t in self.tools]
        )
        return f"""
You are an education assessment assistant. You create exam drafts for Vietnamese
secondary and high school teachers.

Available tools:
{tool_descriptions}

Use this exact format:
Thought: short reasoning about the next step.
Action: tool_name({{"key": "value"}})

When you have enough information, stop using tools and answer with:
Final Answer: your final response.

Rules:
- Use tools before finalizing an exam.
- Do not invent curriculum facts when a tool can check them.
- Keep tool arguments as valid JSON inside the parentheses.
""".strip()

    def run(self, user_input: str) -> str:
        """
        TODO: Implement the ReAct loop logic.
        1. Generate Thought + Action.
        2. Parse Action and execute Tool.
        3. Append Observation to prompt and repeat until Final Answer.
        """
        logger.log_event("AGENT_START", {"input": user_input, "model": self.llm.model_name})
        
        scratchpad = f"User request: {user_input}"
        self.history = []

        for step in range(1, self.max_steps + 1):
            result = self.llm.generate(scratchpad, system_prompt=self.get_system_prompt())
            content = result.get("content", "").strip()
            self._track_llm_result(result)
            logger.log_event("AGENT_STEP", {"step": step, "llm_output": content})

            final_answer = self._parse_final_answer(content)
            if final_answer:
                logger.log_event("AGENT_END", {"steps": step, "status": "completed"})
                return final_answer

            action = self._parse_action(content)
            if not action:
                logger.log_event(
                    "PARSER_ERROR",
                    {"step": step, "output": content, "reason": "missing_action"},
                )
                scratchpad += (
                    f"\n\nAssistant output:\n{content}"
                    "\nObservation: Parser error. Use Action: tool_name({\"key\": \"value\"}) "
                    "or Final Answer: ..."
                )
                continue

            tool_name, args = action
            observation = self._execute_tool(tool_name, args)
            self.history.append(
                {
                    "step": step,
                    "llm_output": content,
                    "tool": tool_name,
                    "args": args,
                    "observation": observation,
                }
            )
            logger.log_event(
                "TOOL_CALL",
                {"step": step, "tool": tool_name, "args": args, "observation": observation},
            )
            scratchpad += f"\n\nAssistant output:\n{content}\nObservation: {observation}"

        logger.log_event("AGENT_TIMEOUT", {"max_steps": self.max_steps})
        logger.log_event("AGENT_END", {"steps": self.max_steps, "status": "timeout"})
        return "I could not finish the exam within the step limit."

    def _execute_tool(self, tool_name: str, args: Dict[str, Any]) -> str:
        """
        Helper method to execute tools by name.
        """
        for tool in self.tools:
            if tool['name'] == tool_name:
                func = tool.get("func")
                if not callable(func):
                    return f"Tool {tool_name} is registered without a callable function."
                try:
                    return str(func(**args))
                except TypeError as exc:
                    logger.log_event(
                        "TOOL_ARGUMENT_ERROR",
                        {"tool": tool_name, "args": args, "error": str(exc)},
                    )
                    return f"Tool argument error for {tool_name}: {exc}"
                except Exception as exc:
                    logger.log_event(
                        "TOOL_RUNTIME_ERROR",
                        {"tool": tool_name, "args": args, "error": str(exc)},
                    )
                    return f"Tool runtime error for {tool_name}: {exc}"
        logger.log_event("TOOL_NOT_FOUND", {"tool": tool_name, "args": args})
        return f"Tool {tool_name} not found."

    def _parse_final_answer(self, text: str) -> Optional[str]:
        match = re.search(r"Final Answer\s*:\s*(.*)", text, re.IGNORECASE | re.DOTALL)
        if not match:
            return None
        return match.group(1).strip()

    def _parse_action(self, text: str) -> Optional[Tuple[str, Dict[str, Any]]]:
        match = re.search(r"Action\s*:\s*([a-zA-Z_][\w]*)\s*\((.*)\)", text, re.DOTALL)
        if not match:
            return None

        tool_name = match.group(1)
        raw_args = match.group(2).strip()
        if not raw_args:
            return tool_name, {}

        try:
            parsed_args = json.loads(raw_args)
        except json.JSONDecodeError:
            parsed_args = {"query": raw_args.strip("\"'")}

        if not isinstance(parsed_args, dict):
            parsed_args = {"query": parsed_args}
        return tool_name, parsed_args

    def _track_llm_result(self, result: Dict[str, Any]) -> None:
        usage = result.get("usage", {})
        latency_ms = result.get("latency_ms", 0)
        provider = result.get("provider", "unknown")
        tracker.track_request(provider, self.llm.model_name, usage, latency_ms)
