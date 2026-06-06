"""
Target LLM — the model being tested.

Wraps an OpenAI chat completion call with a user-provided system prompt.
This simulates the chatbot/app the user wants to evaluate.
"""

from openai import OpenAI
from src.config import OPENAI_API_KEY, OPENAI_MODEL


class TargetLLM:
    """Represents the LLM system being evaluated."""

    def __init__(self, system_prompt, model=None, api_key=None):
        self.system_prompt = system_prompt
        self.model = model or OPENAI_MODEL
        self.client = OpenAI(api_key=api_key or OPENAI_API_KEY)

    def query(self, user_message):
        """Send a message to the target LLM and return its response."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=1024,
                temperature=0.7,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            return f"[ERROR] {str(e)}"
