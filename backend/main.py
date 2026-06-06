"""
RedProbe API — FastAPI backend for LLM Evaluation & Red Teaming
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from src.target import TargetLLM
from src.evaluator import Evaluator, DEFAULT_EVAL_SETS
from src.redteam import RedTeamer

app = FastAPI(title="RedProbe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    system_prompt: str
    model: str = "gpt-4o-mini"
    run_eval: bool = True
    eval_dataset: str = "general_qa"
    run_redteam: bool = True
    redteam_categories: Optional[list[str]] = None


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/config")
def get_config():
    return {
        "models": ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1-nano"],
        "eval_datasets": list(DEFAULT_EVAL_SETS.keys()),
        "attack_categories": RedTeamer.get_available_categories(),
    }


@app.post("/api/run")
def run_tests(req: RunRequest):
    target = TargetLLM(system_prompt=req.system_prompt, model=req.model)
    results = {}

    if req.run_eval:
        evaluator = Evaluator()
        results["eval"] = evaluator.run_eval(target, dataset_name=req.eval_dataset)

    if req.run_redteam:
        redteamer = RedTeamer()
        categories = req.redteam_categories or list(
            RedTeamer.get_available_categories().keys()
        )
        results["redteam"] = redteamer.run_all(target, categories=categories)

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
