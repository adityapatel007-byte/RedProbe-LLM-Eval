"""
LLM Evaluation Engine

Runs a test dataset against a target LLM and scores responses using
GPT-4o as a judge. Measures: correctness, relevance, hallucination, coherence.
"""

import json
from openai import OpenAI
from src.config import OPENAI_API_KEY, JUDGE_MODEL


# Built-in test datasets for common use cases
DEFAULT_EVAL_SETS = {
    "general_qa": [
        {"prompt": "What is Python?", "expected": "Python is a high-level, interpreted programming language known for its readability and versatility."},
        {"prompt": "Explain what an API is in simple terms.", "expected": "An API (Application Programming Interface) is a way for two software programs to communicate with each other."},
        {"prompt": "What is the difference between a list and a tuple in Python?", "expected": "Lists are mutable (can be changed), tuples are immutable (cannot be changed after creation)."},
        {"prompt": "What does HTTP stand for?", "expected": "HyperText Transfer Protocol."},
        {"prompt": "Explain recursion in one sentence.", "expected": "Recursion is when a function calls itself to solve a smaller version of the same problem."},
    ],
    "coding_tasks": [
        {"prompt": "Write a Python function to reverse a string.", "expected": "A function that takes a string and returns it reversed, e.g., def reverse(s): return s[::-1]"},
        {"prompt": "How do you read a CSV file in Python?", "expected": "Use pandas: import pandas as pd; df = pd.read_csv('file.csv') or the csv module."},
        {"prompt": "What is a decorator in Python?", "expected": "A decorator is a function that wraps another function to extend its behavior without modifying it."},
        {"prompt": "Explain the difference between == and is in Python.", "expected": "== compares values, is compares object identity (whether they are the same object in memory)."},
        {"prompt": "What is a virtual environment and why use one?", "expected": "A virtual environment isolates Python dependencies per project, preventing conflicts between packages."},
    ],
    "factual_accuracy": [
        {"prompt": "Who created Python?", "expected": "Guido van Rossum created Python, first released in 1991."},
        {"prompt": "What is the time complexity of binary search?", "expected": "O(log n)"},
        {"prompt": "What does SQL stand for?", "expected": "Structured Query Language"},
        {"prompt": "What is the default port for HTTP?", "expected": "Port 80"},
        {"prompt": "Name three popular Python web frameworks.", "expected": "Django, Flask, and FastAPI are three popular Python web frameworks."},
    ],
}

JUDGE_PROMPT = """You are an expert LLM evaluator. Score the following response on these criteria.

**Question asked:** {prompt}
**Expected answer:** {expected}
**Actual response:** {response}

Score each criterion from 1 to 5 and provide a brief reason:

1. **Correctness** (1-5): Is the response factually accurate compared to the expected answer?
2. **Relevance** (1-5): Does the response directly address the question asked?
3. **Hallucination** (1-5): 5 = no hallucination, 1 = completely fabricated information
4. **Coherence** (1-5): Is the response well-structured and easy to understand?

Respond ONLY in this exact JSON format, no extra text:
{{"correctness": {{"score": N, "reason": "..."}}, "relevance": {{"score": N, "reason": "..."}}, "hallucination": {{"score": N, "reason": "..."}}, "coherence": {{"score": N, "reason": "..."}}}}"""


class Evaluator:
    """Runs evaluation tests and scores using LLM-as-Judge."""

    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.judge_model = JUDGE_MODEL

    def judge_response(self, prompt, expected, response):
        """Use GPT-4o to score a single response."""
        judge_input = JUDGE_PROMPT.format(
            prompt=prompt, expected=expected, response=response
        )

        try:
            result = self.client.chat.completions.create(
                model=self.judge_model,
                messages=[{"role": "user", "content": judge_input}],
                max_tokens=500,
                temperature=0,
            )

            raw = result.choices[0].message.content.strip()
            # Clean markdown code blocks if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            scores = json.loads(raw)
            return scores

        except (json.JSONDecodeError, Exception) as e:
            return {
                "correctness": {"score": 0, "reason": f"Judge error: {str(e)}"},
                "relevance": {"score": 0, "reason": f"Judge error: {str(e)}"},
                "hallucination": {"score": 0, "reason": f"Judge error: {str(e)}"},
                "coherence": {"score": 0, "reason": f"Judge error: {str(e)}"},
            }

    def run_eval(self, target, dataset_name="general_qa", custom_dataset=None):
        """
        Run a full evaluation against a target LLM.

        Args:
            target: TargetLLM instance
            dataset_name: key from DEFAULT_EVAL_SETS
            custom_dataset: list of {"prompt": ..., "expected": ...} dicts

        Returns:
            dict with results, scores, and summary
        """
        dataset = custom_dataset or DEFAULT_EVAL_SETS.get(dataset_name, [])

        if not dataset:
            return {"error": f"Unknown dataset: {dataset_name}"}

        results = []
        totals = {"correctness": 0, "relevance": 0, "hallucination": 0, "coherence": 0}
        count = 0

        for test_case in dataset:
            prompt = test_case["prompt"]
            expected = test_case["expected"]

            # Get response from target LLM
            response = target.query(prompt)

            # Judge it
            scores = self.judge_response(prompt, expected, response)

            result = {
                "prompt": prompt,
                "expected": expected,
                "response": response,
                "scores": scores,
            }
            results.append(result)

            # Accumulate totals
            for metric in totals:
                if metric in scores and isinstance(scores[metric], dict):
                    totals[metric] += scores[metric].get("score", 0)
            count += 1

        # Calculate averages
        summary = {}
        for metric in totals:
            avg = round(totals[metric] / count, 2) if count > 0 else 0
            summary[metric] = {
                "average": avg,
                "percentage": round((avg / 5) * 100, 1),
            }

        overall = round(
            sum(s["average"] for s in summary.values()) / len(summary), 2
        )

        return {
            "dataset": dataset_name,
            "total_tests": count,
            "results": results,
            "summary": summary,
            "overall_score": overall,
            "overall_percentage": round((overall / 5) * 100, 1),
        }
